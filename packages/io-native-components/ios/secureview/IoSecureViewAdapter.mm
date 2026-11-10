#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <ReactCommon/RCTTurboModule.h>
#import <IoNativeComponentsSpec/IoNativeComponentsSpec.h>
#import "SecureViewEventSink.h"
#import "IoNativeComponents-Swift.h"

@interface IoSecureViewAdapter : NativeIoSecureViewSpecBase <NativeIoSecureViewSpec, SecureViewEventSink>
@end

@implementation IoSecureViewAdapter {
  IoSecureViewRuntime *_runtime;
}

- (instancetype)init
{
  if (self = [super init]) {
    _runtime = [IoSecureViewRuntime new];
  }
  return self;
}

+ (NSString *)moduleName
{
  return @"IoSecureView";
}

- (void)issueSecureToken:(NSString *)cardId
                 resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject
{
  NSDictionary *issued = [_runtime issueSecureToken:cardId];
  if (issued != nil) {
    resolve(issued);
  } else {
    reject(@"UNAVAILABLE", @"No se pudo emitir la autorización", nil);
  }
}

- (void)openSecureView:(NSString *)cardId
           secureToken:(NSString *)secureToken
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject
{
  [_runtime openSecureView:cardId token:secureToken eventSink:self completion:^(BOOL accepted, NSString * _Nullable code) {
    if (accepted) {
      resolve(@YES);
    } else {
      NSString *reason = code ?: @"UNAVAILABLE";
      reject(reason, [reason isEqualToString:@"BUSY"] ? @"Ya hay una vista segura abierta" : @"Vista segura no disponible", nil);
    }
  }];
}

- (void)secureViewOpened:(NSString *)cardId
{
  [self emitOnSecureViewOpened:@{ @"cardId": cardId }];
}

- (void)secureViewValidationFailed:(NSString *)code message:(NSString *)message
{
  [self emitOnValidationError:@{ @"code": code, @"message": message }];
}

- (void)secureViewDataShown:(NSString *)cardId
{
  [self emitOnCardDataShown:@{ @"cardId": cardId }];
}

- (void)secureViewClosed:(NSString *)cardId reason:(NSString *)reason
{
  [self emitOnSecureViewClosed:@{ @"cardId": cardId, @"reason": reason }];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeIoSecureViewSpecJSI>(params);
}

@end
