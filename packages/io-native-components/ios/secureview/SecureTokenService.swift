import CryptoKit
import Foundation
import Security

enum SecureTokenValidation: Equatable {
  case valid
  case invalid
  case expired
}

struct IssuedSecureToken {
  let value: String
  let expiresAtEpochMs: Int64
}

final class SecureTokenService {
  static let ttlMilliseconds: Int64 = 60_000
  private static let maximumTokenLength = 512
  private static let nonceLength = 16
  private static let macLength = 32

  private let key: SymmetricKey
  private let nowEpochMs: () -> Int64
  private let nonceSource: () throws -> Data

  init(
    testKey: Data? = nil,
    nowEpochMs: @escaping () -> Int64 = { Int64(Date().timeIntervalSince1970 * 1_000) },
    nonceSource: (() throws -> Data)? = nil
  ) throws {
    let keyData: Data
    if let testKey {
      keyData = testKey
    } else {
      var bytes = Data(count: 32)
      let status = bytes.withUnsafeMutableBytes { buffer in
        SecRandomCopyBytes(kSecRandomDefault, buffer.count, buffer.baseAddress!)
      }
      guard status == errSecSuccess else {
        throw SecureTokenError.unavailable
      }
      keyData = bytes
    }
    guard keyData.count == 32 else { throw SecureTokenError.unavailable }
    key = SymmetricKey(data: keyData)
    self.nowEpochMs = nowEpochMs
    self.nonceSource = nonceSource ?? {
      var bytes = Data(count: Self.nonceLength)
      let status = bytes.withUnsafeMutableBytes { buffer in
        SecRandomCopyBytes(kSecRandomDefault, buffer.count, buffer.baseAddress!)
      }
      guard status == errSecSuccess else { throw SecureTokenError.unavailable }
      return bytes
    }
  }

  func issue(cardId: String) throws -> IssuedSecureToken {
    guard NativeMockCardRepository.contains(cardId) else {
      throw SecureTokenError.cardUnavailable
    }
    let issued = nowEpochMs()
    let (expiry, overflow) = issued.addingReportingOverflow(Self.ttlMilliseconds)
    guard !overflow else { throw SecureTokenError.unavailable }
    let nonce = try nonceSource()
    guard (1...80).contains(cardId.utf8.count), nonce.count == Self.nonceLength else {
      throw SecureTokenError.unavailable
    }
    let payload = Self.payload(cardId: cardId, issued: issued, expiry: expiry, nonce: nonce)
    let mac = Data(HMAC<SHA256>.authenticationCode(for: payload, using: key))
    return IssuedSecureToken(value: "v1.\(Self.base64URL(payload)).\(Self.base64URL(mac))", expiresAtEpochMs: expiry)
  }

  func validate(cardId: String, token: String) -> SecureTokenValidation {
    guard token.utf8.count <= Self.maximumTokenLength,
          token.hasPrefix("v1.") else { return .invalid }
    let parts = token.split(separator: ".", omittingEmptySubsequences: false)
    guard parts.count == 3, parts.allSatisfy({ !$0.isEmpty }) else { return .invalid }
    guard let payload = Self.decodeBase64URL(String(parts[1])),
          let mac = Self.decodeBase64URL(String(parts[2])),
          Self.base64URL(payload) == parts[1],
          Self.base64URL(mac) == parts[2],
          mac.count == Self.macLength,
          HMAC<SHA256>.isValidAuthenticationCode(mac, authenticating: payload, using: key),
          let parsed = Self.parse(payload),
          parsed.cardId == cardId,
          NativeMockCardRepository.contains(parsed.cardId),
          parsed.expiry - parsed.issued == Self.ttlMilliseconds else { return .invalid }

    let now = nowEpochMs()
    guard now >= parsed.issued else { return .invalid }
    return now >= parsed.expiry ? .expired : .valid
  }

  private static func payload(cardId: String, issued: Int64, expiry: Int64, nonce: Data) -> Data {
    let id = Data(cardId.utf8)
    var bytes = Data()
    bytes.appendBigEndian(UInt32(id.count))
    bytes.append(id)
    bytes.appendBigEndian(UInt64(bitPattern: issued))
    bytes.appendBigEndian(UInt64(bitPattern: expiry))
    bytes.append(nonce)
    return bytes
  }

  private static func parse(_ payload: Data) -> (cardId: String, issued: Int64, expiry: Int64)? {
    guard payload.count >= 4 + 1 + 8 + 8 + nonceLength else { return nil }
    var offset = 0
    guard let rawLength: UInt32 = payload.readBigEndian(at: &offset) else { return nil }
    let idLength = Int(rawLength)
    guard (1...80).contains(idLength), payload.count == 4 + idLength + 8 + 8 + nonceLength,
          let id = String(data: payload.subdata(in: offset..<(offset + idLength)), encoding: .utf8) else { return nil }
    offset += idLength
    guard let rawIssued: UInt64 = payload.readBigEndian(at: &offset),
          let rawExpiry: UInt64 = payload.readBigEndian(at: &offset) else { return nil }
    return (id, Int64(bitPattern: rawIssued), Int64(bitPattern: rawExpiry))
  }

  private static func base64URL(_ data: Data) -> String {
    data.base64EncodedString().replacingOccurrences(of: "+", with: "-")
      .replacingOccurrences(of: "/", with: "_").replacingOccurrences(of: "=", with: "")
  }

  private static func decodeBase64URL(_ value: String) -> Data? {
    guard value.range(of: "^[A-Za-z0-9_-]+$", options: .regularExpression) != nil else { return nil }
    var base64 = value.replacingOccurrences(of: "-", with: "+").replacingOccurrences(of: "_", with: "/")
    let remainder = base64.count % 4
    guard remainder != 1 else { return nil }
    if remainder > 0 { base64 += String(repeating: "=", count: 4 - remainder) }
    return Data(base64Encoded: base64)
  }
}

enum SecureTokenError: Error {
  case cardUnavailable
  case unavailable
}

private extension Data {
  mutating func appendBigEndian<T: FixedWidthInteger>(_ value: T) {
    var encoded = value.bigEndian
    Swift.withUnsafeBytes(of: &encoded) { append(contentsOf: $0) }
  }

  func readBigEndian<T: FixedWidthInteger>(at offset: inout Int) -> T? {
    guard offset + MemoryLayout<T>.size <= count else { return nil }
    var value: T = 0
    Swift.withUnsafeMutableBytes(of: &value) { destination in
      copyBytes(to: destination, from: offset..<(offset + MemoryLayout<T>.size))
    }
    offset += MemoryLayout<T>.size
    return T(bigEndian: value)
  }
}
