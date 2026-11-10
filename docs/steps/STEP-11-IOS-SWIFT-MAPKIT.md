# STEP-11 — Implementación iOS con Swift y MapKit

**Proyecto:** `io-products-benefits`  
**Aplicación:** iO Productos & Beneficios  
**Librería nativa única:** `packages/io-native-components` (`io-native-components`)  
**Etapa:** 11 de 12 — **se ejecuta antes del Paso 10 por decisión del propietario**  
**Estado del documento:** **BORRADOR TÉCNICO PARA REVISIÓN Y APROBACIÓN — NO EJECUTADO**  
**Plataforma a implementar:** iOS / Swift / UIKit / MapKit  
**Plataforma a preservar:** Android / Kotlin / Google Maps SDK  
**Stack inmutable:** React Native **0.88.0**, TypeScript estricto, Hermes, New Architecture, TurboModule + Fabric + Codegen, React Navigation, Zustand  
**Fuente normativa:** `Reto técnico - Chapter Master Frontend.pdf`  
**Fuente rectora:** `RETO_BCP_TECHNICAL_BASELINE.md`

> **Estado de entrada confirmado por el propietario (06/11/2026):** Pasos **01–07 y 09 COMPLETADOS Y APROBADOS**; Paso **08 OMITIDO** expresamente (no es pendiente ni bloqueo). El Paso 07 cerró con 65/65 DoD, 106 Jest/11 suites, 13 JUnit y cobertura RN auditada. El Paso 09 cerró con **12/12 DoD, 113 Jest/13 suites, 13 JUnit, 96,32 % statements, 93,93 % branches, 96,25 % functions, 96,79 % lines y 44/44 fuentes RN/TS instrumentables**; Firebase Email/Password y smoke Android fueron confirmados por el propietario en §13.14. **Son resultados históricos: no cuentan como ejecución o cobertura nueva del Paso 11.** No reabrir DoD de etapas cerradas ni ejecutar el Paso 08.

---

## 0. Evaluación previa de viabilidad (decisiones sometidas a revisión)

### 0.1. Dictamen

**Viable, condicionado a verificar el checkout real y el toolchain Xcode/CocoaPods.** El PDF exige solo una plataforma y valora la segunda como extra (págs. 1, 3–5); permite expresamente **MapKit oficial** en iOS (pág. 2). El añadido de Swift debe aprovechar la **misma** librería y las **mismas** specs Codegen públicas. En esta revisión se tuvieron disponibles el PDF y los Markdown de referencia, **no el árbol Git completo del repositorio ni los archivos Swift/Podfile/Specs actuales de la máquina**. Por ello se distinguen decisiones documentadas de verificaciones pendientes del implementador; no se afirma compilación ni runtime iOS nuevos.

| Tema evaluado | Base documentada / evidencia externa | Viabilidad y medida del Paso 11 |
| --- | --- | --- |
| **1. Estructura iOS** | `STEP-01` preparó `ios/` con `IoProductsBenefits` y `com.ioproductsbenefits`; cierre de `STEP-05` y `STEP-06` registra apertura iOS con fallback, anterior a Firebase | **Viable, no inspeccionada hoy**. Comprobar `ios/`, `Podfile`, workspace, `AppDelegate`/`SceneDelegate`, targets y script real; no reinicializar |
| **2. RN 0.88 + New Architecture** | React Native 0.88 documenta TurboModules, Fabric, Codegen y CocoaPods; su release añade soporte `SceneDelegate` y cambia el descubrimiento de Codegen en iOS | **Compatible**. Conservar 0.88.0, Codegen y CocoaPods; validar la integración exacta en el checkout |
| **3. Swift + Codegen** | RN documenta adapter **Objective-C++ → Swift** para módulos y código nativo Fabric ObjC++ para el componente | **Compatible con glue mínimo**. Lógica de seguridad y mapa Swift, wrappers ObjC++ de registro/eventos. No prometer «100 % Swift» si Codegen requiere ObjC++ |
| **4. Card Secure View** | `STEP-04` fija sesión 45 s, token 60 s, cuatro eventos, errores/motivos y guardas | **Viable**. Presentar `UIViewController` UIKit de pantalla completa, datos sintéticos internos Swift, policy de sesión/ocultamiento sin JS |
| **5. Protocolo de tokens** | `STEP-04` define `v1.base64url(payload).base64url(HMAC)`, clave efímera y reglas, pero no exhibe los **bytes de serialización efectivamente implementados** | **Riesgo de compatibilidad controlable**. Swift emite y valida su propio token con el **mismo formato/semántica** y secreto efímero local por proceso; comparar los bytes del formato real Kotlin antes de codificar |
| **6. Protecciones iOS** | Apple permite observar capture state y oculta snapshots por lifecycle; `userDidTakeScreenshotNotification` llega **después** de la captura | **Paridad funcional con limitación deliberada**: no existe garantía de bloqueo general de screenshots tipo `FLAG_SECURE`. Ocultar datos al perder actividad y durante captura detectada; documentar límite |
| **7. CustomMap** | `STEP-05` ya fija `markers`, `selectedMarkerId`, `onMarkerPress` y la spec `CustomMapNativeComponent.ts` | **Viable** usando directamente `MKMapView`, `MKAnnotation`/`MKMarkerAnnotationView` y `MKMapViewDelegate`; props y evento Fabric existentes |
| **8. Carrusel** | `STEP-06` aprobó selección única `selectedBenefitId`, wrapper y coordinación RN | **Reutilizable**. Solo añadir renderer/eventos nativos iOS; no tocar lógica de negocio, mapper, selección o carrusel salvo quitar fallback al estar disponible el mapa |
| **9. Firebase** | `STEP-09` utiliza Firebase JS SDK oficial `12.19.0`, `inMemoryPersistence`, `AuthGateway` y navegación con compuerta | **Independiente del módulo Swift**, sin segundo Auth SDK ni `GoogleService-Info.plist`; verificar arranque/login/logout iOS **después** del Paso 09, no atribuirle el smoke iOS anterior |
| **10. XCTest** | Lógica Swift pura (HMAC/TTL, estado, reconciliación) es separable de UIKit/MapKit | **Viable** con un target XCTest o `test_spec` mínimo; pruebas UI sensibles mediante smoke manual y tests focalizados de integración |
| **11. Simulator/device** | RN 0.88 y Xcode pueden compilar el target iOS; simulador tiene limitaciones de captura y entorno | **Validación escalonada**: Codegen → Pods → build → XCTest → smoke simulador → dispositivo físico si disponible; distinguir `NO EJECUTADO` de `PASS` |

**Condición de avance previa a la implementación:** si el implementador detecta conflicto verificable entre el formato Kotlin existente, un nombre/forma generada Codegen y el contrato aprobado, debe **documentar primero el conflicto y elegir un adapter compatible**; si no es posible sin cambiar API pública o comportamiento Android, **no hacer el cambio unilateralmente**. Presentar propuesta mínima al propietario y dejar el punto bloqueado para decisión.

### 0.2. Hechos importantes de las fuentes

- El PDF requiere que PAN, CVV y titular completos **solo vivan en nativo** y que `CustomMap` y `Card Secure View` se expongan desde **una única librería** (págs. 2–5).
- `STEP-02` diferencia los **puertos de aplicación** de las **specs físicas Codegen**. `SecureViewGateway.openSecureView({cardId, secureToken}): Promise<void>` no se reemplaza por la firma del TurboModule.
- `STEP-04`, §6, establece token mock HMAC-SHA256 con **TTL = 60 s**, clave efímera privada generada por proceso, y regla `TOKEN_INVALID` anterior a `TOKEN_EXPIRED` cuando falla integridad. §8 fija **45 s** de sesión, ocultamiento, revalidación al volver y cierre idempotente. El modelo de errores deja una superficie neutra con «Ocultar» y conserva timeout; no cierra solo por validación fallida.
- `STEP-05`, §6, mantiene `IoNativeComponentsSpec`, `type: all`, `jsSrcsDir: src/specs`, `NativeIoSecureView.ts`, `CustomMapNativeComponent.ts`, `IoSecureView` y `CustomMap`; se verificó Codegen iOS en ese paso, **sin registrar el mapa iOS**.
- `STEP-06`, §5, dispone **un solo `selectedBenefitId`**; `selectedMarkerId` se deriva, el carrusel es RN y el mapa no debe emitir selección artificial al recibir props.
- `STEP-09`, §13.14, acredita **smoke real Android de Firebase**. No equivale a prueba de Firebase iOS.

### 0.3. Decisiones técnicas recomendadas

1. **CocoaPods (no SwiftPM experimental)** para integrar el único package local. Un solo `.podspec` que incluya las fuentes Swift + ObjC++ de **ambos** componentes.
2. **TurboModule:** adapter ObjC++ conforme a los protocolos/clases **efectivamente generados** por RN 0.88; implementación Swift de emisión, validación, sesión y controlador UIKit. Emisores Codegen intactos.
3. **Fabric:** componente ObjC++ derivado de `RCTViewComponentView` que traduzca props/eventos generados a una vista Swift con `MKMapView`; ningún manager legacy paralelo.
4. **Firma:** CryptoKit `HMAC<SHA256>`/`SymmetricKey` + bytes canónicos del token actual Android, clave aleatoria por proceso, no compartida entre plataformas en runtime. Vectores comunes **solo de prueba** con clave/nonce/tiempo fijos, sin credenciales reales.
5. **Tiempo:** `Date`/epoch ms para TTL firmado; reloj monotónico **continuo durante suspensión** (`ContinuousClock` si compatible con deployment target o API monotónica equivalente) para deadline absoluto de 45 s. Timer nativo sirve para disparar, **el deadline manda**.
6. **Privacidad iOS:** limpiar/ocultar la jerarquía sensible sin esperar JS al perder escena activa; superficie neutra para snapshots del app switcher; bloqueo del render mientras capture state está activo. **No prometer inhibir screenshots**.
7. **Alcance:** sin backend bancario, geolocalización, permisos de ubicación, telemetría, antirreplay persistente, claves reales, otra autenticación ni nuevas dependencias de mapas/criptografía.

---

## 1. PROMPT EJECUTABLE PARA LA IMPLEMENTACIÓN — USAR SOLO TRAS APROBACIÓN

> **Actúa como Chapter Frontend / Senior React Native & iOS Engineer**, especializado en Swift/UIKit/MapKit, Objective-C++, React Native **0.88.0 New Architecture**, TurboModules/Fabric/Codegen, CocoaPods, seguridad de UI móvil, Jest/RNTL, XCTest y Clean Architecture.
>
> **EJECUTA EXCLUSIVAMENTE EL PASO 11 — IMPLEMENTACIÓN iOS CON SWIFT Y MAPKIT**, en el **repositorio existente** `io-products-benefits`. **No** ejecutes los Pasos 08, 10 o 12.
>
> Los Pasos **01–07 y 09 están cerrados y aprobados**; el **08 fue omitido expresamente** y no bloquea. Mantén la numeración. **No reconstruyas, reaudites ni vuelvas a calificar los DoD históricos.** La línea base del Paso 09 (113 Jest/13 suites, 13 JUnit y cobertura indicada en cabecera) es **histórica**, no evidencia del Paso 11.
>
> **Objetivo:** extender **la misma** librería `packages/io-native-components` para que `IoSecureView` (TurboModule) abra una **Card Secure View UIKit/Swift** y `CustomMap` (Fabric) use **MapKit oficial**, conservando **los contratos públicos**, 60 s de TTL mock, 45 s de sesión, eventos, datos sensibles solo Swift, la selección única de Benefits y la navegación Firebase vigente.
>
> **Secuencia obligatoria:** (1) inspección **focalizada** del checkout y toolchain según §2; (2) contraste del protocolo Kotlin/Codegen y diseño según §§3–5; (3) implementación incremental iOS según §§6–9; (4) pruebas y compilación **reales** según §§10–12; (5) DoD/evidencia y reporte §14; (6) **detente**. Si aparece incompatibilidad material que requiera romper contrato público o Android, **no la introduzcas**: registra causa, alternativa y solicitud de decisión.
>
> **Restricciones absolutas:** no `react-native init`, Expo, versión nueva de RN, segunda librería, Legacy Bridge, `NativeModules` legacy, `DeviceEventEmitter` como sustituto de eventos Codegen, `react-native-maps`, Mapbox, otra librería de mapas, SDK Firebase nativo, otra navegación/store, fuga de datos completos hacia JS, paquete publicado, `git commit`, `git push`, provisioning externo ni claves de producción. No ejecutar auditoría de hardening del Paso 08 ni benchmarks artificiales.
>
> **Seguridad:** iOS carece de `FLAG_SECURE` universal. Implementa únicamente mecanismos públicos de Apple, verifica con dispositivo si existe y **declara expresamente que no se garantiza impedir una screenshot tomada mientras la vista está visible**. Nunca intentes afirmar seguridad equivalente sin pruebas ni usar jerarquías privadas/`secureTextEntry` como hack para capturas.
>
> **Resultado:** una app iOS compilable y demostrable con login real (config existente), Cards Secure View y mapa/carrusel; tests Swift/JS proporcionales; Android sin regresión; reporte exacto y honesto. **No actualices README/video definitivos** (Paso 10). Solo notas técnicas y estado/evidencias del Paso 11 en este MD o un reporte acotado.

### 1.1. Fuentes y precedencia que el implementador debe consultar

1. `Reto técnico - Chapter Master Frontend.pdf` (si falta físicamente, declararlo); págs. 1–5 y 6–8.
2. `RETO_BCP_TECHNICAL_BASELINE.md` (identidad, seguridad, native, pasos).
3. `docs/steps/STEP-01-BOOTSTRAP.md` (iOS preexistente, toolchain).
4. `docs/steps/STEP-02-ARCHITECTURE.md` (puertos y API de `CustomMap`).
5. `docs/steps/STEP-04-NATIVE-SECURE-VIEW.md`, especialmente §§4, 6, 8–10 (TurboModule, HMAC, policy y eventos).
6. `docs/steps/STEP-05-BENEFITS-CUSTOM-MAP.md`, especialmente §6 y cierre definitivo §21.9 (Codegen `type: all` y mapa).
7. `docs/steps/STEP-06-MAP-CAROUSEL-SYNC.md`, especialmente §§5, 8–10 y cierre §24.14.
8. `docs/steps/STEP-07-TESTING-COVERAGE.md`, **cierre §25.8 únicamente para estado, no reauditoría**.
9. `docs/steps/STEP-09-EXTRAS.md`, **cierre §13.14**, Firebase JS SDK y política de sesión.
10. Código efectivo **acotado** al wiring requerido (`ios/`, Podfile, package, specs, adapters TS, emisor/token Kotlin, store Benefits y Firebase composition) y fuentes oficiales al final de este documento.

**Prioridad:** PDF oficial > baseline maestro > contratos realmente aprobados y comportamiento validado > este Paso 11 > preferencias del implementador. Una discrepancia de nombres/archivos se resuelve contra el **checkout**, sin reescribir historia documental.

---

## 2. Prerrequisitos y reconocimiento del checkout iOS (sin reauditoría)

### 2.1. Entorno

- macOS con Xcode/Command Line Tools, SDK y simulador iOS instalado; CocoaPods o Bundler conforme al Gemfile real; Node/npm ya fijados.
- `ios/` existe del bootstrap; **no** crearlo otra vez. Identificador iOS `com.ioproductsbenefits` e identificador de target interno `IoProductsBenefits` se conservan.
- Configuración cliente Firebase que el propietario ya mantiene **local e ignorada**; nunca imprimir/commitear `firebaseConfig.ts` real, contraseña demo, tokens ni claves.
- El simulador permite build y flujo visual; una captura de screenshot o grabación y su efecto real se **deben contrastar en dispositivo físico si está disponible**. Sin dispositivo, declarar esta evidencia `NO EJECUTADO`, no exigir comprar uno.

### 2.2. Inventario focalizado antes de editar

Desde la raíz real del checkout:

```bash
pwd
git branch --show-current
git status --short
node --version
npm --version
npm ls react-native firebase
xcodebuild -version
xcode-select -p
xcrun simctl list devices available
pod --version
find ios -maxdepth 3 \( -name 'Podfile' -o -name 'Gemfile' -o -name '*.xcodeproj' -o -name '*.xcworkspace' -o -name '*Tests*' \) -print
npx react-native config
```

Revisar solo los archivos necesarios, **sin leer ni imprimir secretos**:

```text
ios/Podfile; ios/Podfile.lock (si existe); ios/*.xcodeproj/project.pbxproj
ios/<target>/AppDelegate* y/o SceneDelegate*; ios/<target>/Info.plist
packages/io-native-components/package.json
packages/io-native-components/src/specs/{NativeIoSecureView,CustomMapNativeComponent}.ts
packages/io-native-components/src/{index.ts,CustomMap.tsx}
packages/io-native-components/ios/ (si existiera)
packages/io-native-components/*.podspec (si existiera)
src/capabilities/cards/infrastructure/native/* (adapters)
src/capabilities/benefits/presentation/{screens,store,components}/* (solo integración)
src/capabilities/auth/infrastructure/firebase/* (solo estructura, sin imprimir config)
Kotlin del token + tests necesarios **únicamente para cotejar bytes/reglas**
```

Confirmar sin asumir:

- Nombre real del workspace/scheme, deployment target iOS, `AppDelegate`/`SceneDelegate` y compatibilidad con el SDK Xcode instalado. RN **0.88** documenta `SceneDelegate` y, con SDK iOS **27**, el ciclo `UIScene` requerido. **No migrar automáticamente** por estética: solo si la versión de SDK/config real lo requiere; mantener `UIApplicationSupportsMultipleScenes=false` en la app RN 0.88.
- `codegenConfig.name=IoNativeComponentsSpec`, `type=all`, `jsSrcsDir=src/specs`, specs presentes, nombres registrados y estado `podspec`/autolinking. En RN 0.88 el descubrimiento de iOS **no recorre indiscriminadamente `node_modules` ni sigue symlinks**: inspeccionar outputs físicos de Codegen, no concluir por `npm ls` solamente.
- Si `ios/` ya compila, extenderlo, no sustituir sus archivos de plantilla. Si no compila antes del cambio, registrar el error de forma honesta y acotar su causa. **No ejecutar builds Android completos como parte del diagnóstico inicial.**

---

## 3. Contratos aprobados que deben permanecer inmutables

### 3.1. Card Secure View — frontera de aplicación

**Puerto de Cards (existente; NO redefinir):**

```ts
interface SecureToken {
  readonly value: string;
  readonly expiresAtEpochMs: number;
}
interface SecureTokenProvider {
  getOrRenewToken(cardId: string): Promise<SecureToken>;
}
interface SecureViewGateway {
  openSecureView(request: {
    readonly cardId: string;
    readonly secureToken: string;
  }): Promise<void>;
  subscribe(listener: (event: SecureViewEvent) => void): () => void;
}
```

**TurboModule físico Codegen (mantener la spec existente, no copiar de este documento):**

```ts
issueSecureToken(cardId: string): Promise<{value: string; expiresAtEpochMs: number}>;
openSecureView(cardId: string, secureToken: string): Promise<boolean>;
onSecureViewOpened: CodegenTypes.EventEmitter<{cardId: string}>;
onValidationError: CodegenTypes.EventEmitter<{code: string; message: string}>;
onCardDataShown: CodegenTypes.EventEmitter<{cardId: string}>;
onSecureViewClosed: CodegenTypes.EventEmitter<{cardId: string; reason: string}>;
```

`openSecureView` devuelve `true` **cuando se acepta abrir**, NO cuando el PAN ha sido mostrado. Los adapters existentes traducen el método y los emisores a los puertos TS. Las únicas claves públicas de error son `TOKEN_INVALID`, `TOKEN_EXPIRED`; las de cierre `USER_DISMISS`, `TIMEOUT`. `onValidationError` **no** causa por sí solo un evento `onSecureViewClosed` ni crea un motivo de cierre nuevo.

### 3.2. CustomMap — frontera de presentación

**Contrato público del Paso 02 (NO redefinir):**

```ts
interface MapMarker {
  readonly id: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly title?: string;
}
interface CustomMapProps {
  readonly markers: readonly MapMarker[];
  readonly selectedMarkerId?: string | null;
  readonly onMarkerPress: (markerId: string) => void;
}
```

**Spec Fabric existente:** `CustomMapNativeComponent.ts` con `markers`, `selectedMarkerId?: string` y `DirectEventHandler<{markerId: string}>`. El wrapper transforma `null` público a valor representable en Codegen y `nativeEvent.markerId` a `string`. `Benefit.id` sigue numérico en dominio; `MapMarker.id = String(benefit.id)`. No crear `onMarkerTap` ni método imperativo de selección paralelo.

### 3.3. Contratos de paquetes y registro

```text
packages/io-native-components/
  package.json: name=io-native-components
    codegenConfig.name=IoNativeComponentsSpec
    codegenConfig.type=all
    codegenConfig.jsSrcsDir=src/specs
  src/specs/NativeIoSecureView.ts
  src/specs/CustomMapNativeComponent.ts
  src/index.ts
  android/...                       # intacto
  ios/...                           # añadir aquí Swift + adapter ObjC++
  io-native-components.podspec      # añadir si no existe; nombre final según integración real
```

La configuración de `codegenConfig.ios.modules.IoSecureView.className` y `codegenConfig.ios.components.CustomMap.className`, **si corresponde a la estrategia de registro efectiva**, debe identificar las clases ObjC++ implementadas. **No sobrescribir** `codegenConfig` ni crear otro. Comprobar en `schema.json`, provider generado, símbolos y runtime cómo RN 0.88 registra realmente ambos elementos.

---

## 4. Diseño nativo iOS de la única librería

### 4.1. Mapa de responsabilidades

```text
RN Dashboard autenticado (Firebase JS SDK ya implementado)
  |
  +-- Cards / application ports  --> adapters TS aprobados
  |       --> io-native-components / NativeIoSecureView (Codegen TurboModule)
  |           --> IoSecureViewAdapter.mm (ObjC++ fino)
  |               --> SecureTokenService.swift (CryptoKit; mock v1/60s)
  |               --> SecureSessionController.swift (45s/lifecycle/eventos)
  |               --> CardSecureViewController.swift (UIKit/nativo)
  |               --> NativeMockCardRepository.swift (detalles 100% Swift)
  |
  +-- Benefits / selectedBenefitId único / carrusel RN existente
          --> CustomMap wrapper TS (sin alterar API)
              --> CustomMapNativeComponent (Fabric/Codegen)
                  --> CustomMapComponentView.mm (RCTViewComponentView)
                      --> CustomMapView.swift (MKMapView/annotations/delegate)
                      --> onMarkerPress({markerId}) -> wrapper -> Benefits existente
```

Los nombres son **orientativos**; ajustar al registro real. `ObjC++` transforma tipos y entrega callbacks Codegen, **sin duplicar lógica de seguridad o de mapa**. Swift concentra los casos nativos. Utilizar `@objc`/`NSObject` donde la interoperabilidad lo requiera y tipos Foundation compatibles en la frontera; no introducir un «bridge paralelo» RN legacy. Mantener objetos UIKit/MapKit en main actor/main queue; no filtrar eventos tras destrucción/desmontaje.

### 4.2. Estructura de archivos proporcional

```text
packages/io-native-components/
  ios/
    IoSecureViewAdapter.mm                 # nombre orientativo; TurboModule generado
    secureview/
      SecureTokenService.swift             # emisión y validación; seams de reloj/nonce
      SecureSessionController.swift        # deadline, states y lifecycle
      CardSecureViewController.swift       # fullscreen UIKit y privacidad
      NativeMockCardRepository.swift       # sintéticos completos solo nativos
    map/
      CustomMapComponentView.mm            # Fabric, props/event emitter generados
      CustomMapView.swift                  # MKMapView + delegate + estado mínimo de pins
      MapMarkerReconciler.swift            # solo si simplifica pruebas reales
  io-native-components.podspec             # único pod de la librería si es necesario
  ...                                      # todo Android y specs existentes INTACTOS
```

No imponer una clase por línea del esquema. Si `SecureTokenService` y su validador forman una unidad pequeña, mantenerlos juntos. No añadir DI framework, arquitectura por capas artificial ni una segunda copia de `cards.json` o `benefits.json` en Swift.

### 4.3. CocoaPods y registro New Architecture

1. Priorizar **CocoaPods existente**. RN 0.88 todavía lo soporta; SwiftPM está documentado como **experimental**, no es objetivo del paso.
2. Crear/ajustar **un** podspec dentro del package actual con archivos `.swift`, `.h`, `.mm` y dependencias/helpers **compatibles con la versión RN instalada**. Usar patrones oficiales de React Native que el proyecto soporte; no inventar dependencias/pods de Codegen o rutas `Header Search Paths` a ciegas. Solo importar `MapKit` (SDK Apple), `UIKit`, `Foundation`, `CryptoKit`/`Security` necesarios.
3. Asegurar `SWIFT_VERSION`, módulo Swift generado y visibilidad ObjC de interfaces en el **target del pod**, comprobando el nombre efectivo de `<Module>-Swift.h`; no asumir que el header pertenece al target app.
4. Codegen produce la especificación TurboModule y el componente Fabric; **no editar artefactos generados** ni versionarlos. El adapter TurboModule debe implementar métodos Promise y usar los **emisores tipados** generados; el componente Fabric debe usar `RCTViewComponentView`/interfaz generada y su event emitter, no `requireNativeComponent` Legacy.
5. Conservar **una sola configuración** de autolinking. Evitar registros dobles en Podfile/Provider, un segundo `ReactPackage`, un `RCT_EXPORT_VIEW_PROPERTY` legacy o un `DeviceEventEmitter` sustituto.
6. Confirmar que el mismo `CustomMap` y `IoSecureView` siguen registrándose con sus nombres públicos exactos. Si el nombre ObjC necesita diferir, la **clase interna** puede adaptarse a Codegen sin cambiar el nombre de JS.

---

## 5. Protocolo mock `secureToken`: compatibilidad Kotlin ↔ Swift

### 5.1. Política de paridad (no compartir proceso ni secreto)

El Paso 04 confiere a **Kotlin** la emisión y validación sobre Android. En iOS el **mismo método RN** invoca una implementación **Swift**, de modo que:

- Android: emisor Kotlin + validador Kotlin + clave aleatoria de **su proceso Android**.
- iOS: emisor Swift + validador Swift + clave aleatoria de **su proceso iOS**.
- El token concreto **no debe verificarse entre dispositivos/plataformas**, porque las claves efímeras difieren intencionalmente. «Compatibilidad» aquí significa **mismo contrato de método, estructura de bytes, versión, TTL, algoritmo HMAC, validaciones, códigos y semántica**.
- **Si el requisito futuro exigiera validar un token emitido en un dispositivo en otro**, implicaría gestión de claves/servicio distinto y quedaría **fuera de este mock**. No copiar una clave fija de Kotlin a Swift ni moverla al JS bundle.

### 5.2. Inspección crítica antes de escribir Swift

**Cotejar código Kotlin realmente aprobado** y anotar explícitamente en el reporte:

- codificación exacta de `v1.<base64url(payload UTF-8)>.<base64url(mac)>`: padding Base64URL/no padding, normalización UTF-8, orden de campos, delimitadores, JSON canonical o longitud prefijada y tratamiento de `cardId`/nonce;
- `issuedAtEpochMs`, `expiresAtEpochMs=issuedAt+60_000`, límites estrictos de estructura y tamaño; prueba del límite `now == expiresAt`;
- orden de evaluación de integridad vs caducidad, comparación HMAC en tiempo constante, política de `cardId` desconocido y error estático;
- política de renovación (nuevo nonce, nueva firma), cambios de reloj y reinicio de proceso;
- cómo la app entrega `cardId` al servicio y qué mocks sensibles existen (sin imprimir valores completos).

**No fijar una serialización inventada por este MD.** Si el token Kotlin usa una representación que puede reproducirse exactamente en Swift, implementarla sin alterar Kotlin. Usar vectores de prueba con clave/nonce/epoch **solo en XCTest o una fixture de contrato no sensible** para comparar bytes entre lenguajes. Si los bytes Kotlin reales no son deterministas o existe conflicto con la spec pública, elevar la incompatibilidad con evidencia; **no mutar el contrato de aplicación por comodidad**.

### 5.3. Implementación Swift mínima

- CryptoKit `HMAC<SHA256>` con `SymmetricKey` generada aleatoriamente por proceso; si se utiliza otro mecanismo estándar Apple, justificar igualdad de HMAC-SHA256 y firma. Evitar dependencia externa.
- `secureToken` viaja **como valor opaco temporal** desde emisión nativa hacia el argumento RN aprobado y de vuelta a Swift. **Nunca** regresa en un evento ni es persistido/registrado.
- Servicio Swift valida token antes de obtener detalles. Firma/token/cardId/nonce/longitud malformados → `TOKEN_INVALID`; token íntegro y vencido → `TOKEN_EXPIRED`; `now == expiresAt` ya está vencido.
- HMAC validada con método de comparación criptográfica apropiado (p. ej., API de verificación CryptoKit) sin comparación naïve de strings.
- Modelo de datos mock privado Swift, pequeño, exclusivamente **sintético**, relacionado con los `cardId` existentes y consistente con **last4** y `expiry` públicos. No devolver PAN/CVV/holder en Promise, evento, props, JSON RN, logs o snapshots. No documentar números completos en reportes.
- Al reiniciarse el proceso, la clave cambia: tokens anteriores quedan inválidos; no persistir Keychain/NSUserDefaults.
- Reconocer límite mock: integridad local ≠ autenticación bancaria productiva; **no** hay antirreplay persistente ni borrado criptográfico perfecto de `String` Swift.

---

## 6. Card Secure View iOS — comportamiento nativo y seguridad

### 6.1. Presentación y control de sesión

- Presentar **`UIViewController` UIKit a pantalla completa** desde la `UIWindowScene`/controller **activo**; respetar single-scene de RN 0.88 y fallback si la app todavía usa `AppDelegate`. No obtener «la primera UIWindow» sin verificar escena/foreground. Cerrar/controlar un error de presentación si no existe escena activa; no falsear `TOKEN_INVALID` por falta de ventana.
- Solo aceptar una sesión a la vez; doble tap/simultaneidad se rechaza o se trata idempotentemente, sin mezclar eventos de tarjetas. Promesa de apertura resuelta al **aceptar la presentación**, no al dibujar datos.
- La vista nace **neutra/oculta**. Tras confirmar `presented`, emitir `onSecureViewOpened({cardId})` una vez; validar HMAC/TTL/cardId; si válido, cargar los detalles desde Swift y renderizar PAN, CVV, fecha y titular **solo en UILabel/vistas UIKit nativas**.
- Al primer render nativo efectivamente preparado/presentado, emitir `onCardDataShown({cardId})` **una vez por sesión**, mediante `viewDidAppear` + frontera de layout/presentación o equivalente nativo razonable; **no** equiparar la mera consulta del mock o un `DispatchQueue.main.async` a una prueba de píxeles mostrados. Nunca emitirlo tras cierre/ocultamiento/error.
- Token inválido/expirado: `onValidationError({code,message})` con mensaje **estático**, pantalla de error no sensible con botón **«Ocultar»**. El error **no** cierra automáticamente ni produce `onCardDataShown`/`onSecureViewClosed` por sí mismo.
- **«Ocultar»** o dismiss controlado → limpiar/ocultar datos inmediatamente, `onSecureViewClosed({cardId, reason:'USER_DISMISS'})` **a lo sumo una vez** y dismiss de controller. El cierre por timeout usa exclusivamente `TIMEOUT`.
- Tratar swipe-to-dismiss de sheet como deshabilitado mediante fullscreen o normalizar cualquier dismiss de usuario a `USER_DISMISS`; no dejar un modal abierto o zombie sin evento.

### 6.2. Deadline de 45 segundos, lifecycle y revalidación

**Estado orientativo:** `IDLE → OPENING → VALIDATING → VISIBLE | ERROR_HIDDEN`; `VISIBLE → HIDDEN` al perder actividad; `HIDDEN → VALIDATING` en retorno; `ANY_OPEN → CLOSED(USER_DISMISS | TIMEOUT)`. Sin dependencia de state machine.

- El deadline **absoluto** de 45 s comienza al iniciar la sesión nativa presentada (incluye validación/error). Usar un reloj monotónico **continuo** que incluya suspensión/background conforme a SDK/deployment, separado de `Date`/epoch ms del token.
- Un `Task`/`DispatchSourceTimer`/timer UIKit pequeño puede activar el cierre en foreground; **ningún timer garantiza ejecutar mientras iOS suspende el proceso**, por lo que toda reanudación/acción verifica `now >= deadline` antes de volver a revelar. El deadline **no se extiende** ni pausa.
- En `sceneWillResignActive` / `UIApplication.willResignActiveNotification` (según lifecycle real) **vaciar o esconder los UILabel sensibles y mostrar una superficie opaca neutra sin esperar a RN**; en `didEnterBackground` mantener cubierto. Esto protege principalmente la **miniatura del app switcher**, no una captura hecha mientras está en foreground.
- En `didBecomeActive`, si pasó deadline → cierre `TIMEOUT`; si sigue vigente → **revalidar token** y estado de captura **antes** de reexponer. Token expirado/alterado → `onValidationError` a lo sumo una vez por fallo nuevo, mantener `ERROR_HIDDEN` y botón Ocultar, sin nuevo `onCardDataShown`.
- Si el proceso se termina o el controller se destruye, **no** reconstruir detalles desde restoration state ni cache; fail closed. No prometer entrega de `onSecureViewClosed` a JS tras kill del proceso.
- Limpiar tokens, observers, referencias y tareas al cerrar/destruir. No conservar `UIViewController` en singleton fuerte. Guardar en memoria solamente lo necesario durante la sesión; ningún PAN/token en archivos, backups o analytics.

### 6.3. Capturas/recording: política exacta y sin promesas imposibles

**Regla principal:** **iOS no expone un `FLAG_SECURE` público equivalente que garantice impedir screenshots de todo un `UIViewController`.**

1. **Pérdida de foco / background / app switcher:** ocultar y limpiar la vista sensible **sincrónicamente en main** antes de que iOS tome el snapshot de transición, con una superficie de privacidad opaca; verificar manualmente que no queda contenido en el app switcher cuando el callback llega a tiempo. No garantizar comportamiento contra todo orden de captura ni dispositivos comprometidos.
2. **Recording/duplicación de pantalla:** consultar `UITraitCollection.sceneCaptureState` cuando esté disponible según deployment y sus cambios/trait changes; en versiones compatibles que lo requieran, usar `UIScreen.isCaptured`/notificación respetando su deprecación. En captura activa **mantener detalles ocultos** y no restaurarlos hasta revalidar al terminar. Las notificaciones pueden tener latencia, por lo que no afirmar prevención absoluta.
3. **Screenshot:** `UIApplication.userDidTakeScreenshotNotification` **llega después de que la captura existe**. Puede usarse para reaccionar/ocultar después, **pero jamás como bloqueo preventivo**; no almacenar screenshots de información completa como evidencia del Paso 11.
4. **No usar** APIs privadas, overlays de `UITextField.isSecureTextEntry` para envolver arbitrariamente pantallas, exploits de layer o técnicas que prometan impedir toda captura. Evitar indicar que cualquier sistema MDM/DRM protege esta vista si no se ha implementado.
5. Evitar logs de PAN/CVV/titular/token, accessibility labels de lectura inesperada después de ocultar, snapshots de XCTest que revelen detalles completos, debugger text dumps y UI de error que filtre cadenas recibidas.

**Diferencia explícita respecto de Android:** Android conserva `FLAG_SECURE` ya aprobado. iOS ofrece **mitigaciones defensivas de exposición y lifecycle**, sin equivalencia funcional absoluta en bloqueo de screenshots. La paridad que se entrega es de **flujo, contrato y límites honestamente documentados**, no paridad de una garantía OS inexistente.

### 6.4. Semántica de eventos e idempotencia

| Escenario | Eventos esperados (orden conceptual) |
| --- | --- |
| Apertura válida | `Opened(cardId)` → `CardDataShown(cardId)`; al Ocultar `Closed(cardId, USER_DISMISS)` |
| Token inválido | `Opened(cardId)` → `ValidationError(TOKEN_INVALID)` → pantalla neutra; `Closed(USER_DISMISS)` si usuario oculta, o `Closed(TIMEOUT)` al cumplirse deadline |
| Token auténtico expirado | `Opened(cardId)` → `ValidationError(TOKEN_EXPIRED)` → pantalla neutra → cierre cuando corresponda |
| Background/foreground durante sesión | ocultar **antes** de snapshot, revalidar al volver; sin segundo `Opened` ni segundo `CardDataShown` |
| Deadline alcanzado | limpieza sensible → **un** `Closed(cardId, TIMEOUT)`; sin eventos posteriores |
| Presentación rechazada (sin escena, conflicto) | Promise rechazada con mensaje sanitizado; **sin** inventar código de validación ni sesión abierta |

Ningún evento lleva token, MAC, nonce, PAN, CVV, holder, stack trace o mensaje dinámico sensible. Los callbacks que lleguen tras `CLOSED` se ignoran. Los mensajes de validación se toman de literales estáticos del Paso 04.

---

## 7. CustomMap Swift + MapKit — Fabric

### 7.1. Implementación nativa mínima

- Componer `MKMapView` directamente desde Swift (sin `react-native-maps` ni wrapper de terceros), dentro del componente Fabric ObjC++ registrado como `CustomMap`.
- Representar cada ID válido con una anotación propia `MKAnnotation`/`NSObject` que conserve `id: String`, coordenadas y `title` opcional **no sensible**. Dibujar la anotación mediante `MKMarkerAnnotationView` o `MKAnnotationView`, con estilo activo distinguible por **forma/escala/contorno además de color**; evitar descargas remotas obligatorias o icon packs.
- Recibir `markers` y `selectedMarkerId` por `updateProps` del componente **generado**. Hacer reconciliación por `id` al cambiar set/orden/posición/título: actualizar existentes, eliminar obsoletos, añadir nuevos; no destruir/crear `MKMapView` en cada render.
- Validar en Swift latitud finita en `[-90,90]` y longitud finita en `[-180,180]`; `(0,0)` es **válido**. Rechazar IDs vacíos/duplicados determinísticamente y de manera coherente con la frontera RN del Paso 05. No crash por `[]` ni selección desconocida.
- La selección es **controlada** por `selectedMarkerId`: destacar el pin con ese ID si existe; para `null`/vacío/inexistente eliminar resaltado. No publicar estado propio distinto del seleccionado en RN.
- Un **tap genuino del usuario** en pin existente dispara `MKMapViewDelegate.mapView(_:didSelect:)` → callback del adapter ObjC++ → **un** evento Fabric `onMarkerPress({markerId})` → wrapper RN existente que entrega `string` a Benefits. Evitar emitir tap si la selección se causó por `selectAnnotation` **programático** o se eliminó el ID mientras el callback estaba en cola. Guardar solo guardia transitoria, no otra fuente de verdad.
- Si se necesita alejar/acercar al dataset inicial, ajustar región de manera razonable **una vez** o ante cambio real de dataset; **no** recentrar con cada `selectedMarkerId`/swipe. No añadir contrato de cámara ni un segundo evento de selección.
- Liberar delegate/callbacks del `MKMapView` en `deinit`/desmontaje, no enviar eventos a React tras desmontar/reconstruir; operaciones MapKit en main.

### 7.2. Reutilización obligatoria de Benefits (Paso 06)

```text
Tap físico MapKit → Fabric onMarkerPress({markerId})
  → CustomMap.tsx (wrapper existente) → onMarkerPress(markerId)
  → BenefitsScreen / useBenefitsStore: selectedBenefitId único
  → BenefitsCarousel.scrollToIndex(índice derivado) [no repetir selección por scroll programático]

Gesto del carrusel RN → onSettledBenefit(id) → selectedBenefitId único
  → prop selectedMarkerId={id} → Fabric Swift actualiza pin activo
  → sin onMarkerPress artificial → sin loop
```

La capability `Benefits`, repositorios, `loadEligibleBenefits`, filtering `applicableBrands`, `benefitToMapMarker`, carrusel, `CarouselCoordinator`, acciones Zustand y manejo de 0/1/N **ya existen**. **No recrearlos en Swift.** Swift recibe solo marcadores seguros, no datos de tarjeta. Preservar alternativa textual accesible de Benefits; no exigir VoiceOver manual como precondición de DoD si no está disponible (sí etiquetas/roles estándar y control alternativo).

### 7.3. Activación iOS del componente público

- El wrapper TS o la pantalla actualmente implementan **fallback iOS** mientras no existe implementación. Cambiar únicamente el **gate de disponibilidad** necesario para montar Fabric iOS cuando esté **realmente registrado**; dejar fallback honesto si falla el enlace o entorno, pero **no declarar Paso 11 completo** con el fallback en lugar del mapa.
- Mantener los estados aprobados `loading/empty/error`, selección en tabs y sincronización. Si el renderer MapKit no entrega teselas por red, separar **mapa/markers nativos registrados** de la disponibilidad de tiles de Apple; no afirmar que renderizó mapas reales sin runtime.
- MapKit para pins/tiles estándares no requiere API key de Google ni permiso de ubicación si **no** se solicita la posición actual. No añadir plist keys de ubicación, geocoding, routing ni background location.

---

## 8. Firebase Authentication y navegación iOS

- Conservar `firebase@12.19.0` documentado en Paso 09 (validar versión efectiva) y **SDK JavaScript existente**. No añadir `@react-native-firebase/*`, `GoogleService-Info.plist`, Google Sign-In, persistencia AsyncStorage ni Keychain solo por este paso.
- El servicio actual `AuthGateway` observa sesión `initializing/signedOut/signedIn`; solo `{uid}` llega a la presentación. **No** usar el Firebase ID token como `secureToken` de Card Secure View.
- Tras login real iOS: Dashboard y dos tabs; botón Ver datos sensibles usa el TurboModule Swift; Beneficios usa Fabric/MapKit + carrusel existente; logout vuelve a Login sin bypass.
- Mantener **un** `NavigationContainer`, sin duplicar session store ni cambiar comportamientos de navegación Android. Sesión Firebase `inMemoryPersistence` significa que tras proceso terminado se exige login nuevamente; no es defecto del Paso 11.
- La configuración Firebase real de demostración sigue **fuera de Git**. Si el simulador no tiene red o no existe configuración cliente local, registrar `BLOQUEADO POR CONFIGURACIÓN` para el smoke Firebase iOS; **no simular éxito**, no saltarse login ni culpar sin evidencia al TurboModule.
- Cuando el modal seguro pierde actividad o la escena pasa a background, Swift es autoridad del ocultamiento y timeout; **no depender de `useAuthSession` ni de timers RN**.

---

## 9. Orden incremental de trabajo para el implementador

**Fase A — inspección corta:** sección 2, localizar Podspec/target/Codegen y serializador Kotlin. Registrar la matriz de nombres efectivos y cualquier incompatibilidad **antes** de modificar APIs.

**Fase B — enlace de la librería:** configurar un único podspec para `io-native-components`, adaptar configuración iOS Codegen si procede, generar artefactos, compilar un TurboModule iOS registrado **sin lógica falsa** y un Fabric view iOS enlazado a una vista Swift real mínima. Resolver errores de header/Swift/ObjC++ sin tocar Android.

**Fase C — token y Card Secure View Swift:** emitir/validar token mock con byte format Kotlin, repositorio ficticio solo Swift, fullscreen UIKit, privacy/lifecycle/deadline/events y guards. Asegurar `onCardDataShown` sólo al primer reveal y pantalla de error oculta.

**Fase D — MapKit:** `MKMapView` y reconciliación de anotaciones, selección controlada, callback de tap real Fabric, integración con el wrapper y fallback iOS retirado condicionalmente. No editar el carrusel salvo wiring estrictamente necesario.

**Fase E — pruebas y smoke:** XCTest para token/session/map state, Jest/RNTL focalizados para gate iOS si cambió, comandos quality, build y smoke iOS real, regresión Android mínima proporcional. Recoger evidencia evitando screenshots sensibles.

**Fase F — reporte y detención:** actualizar **solo** este documento con sección de ejecución/resultado si está en el checkout (o reporte dedicado del mismo paso si el propietario lo prefiere), sin adelantar README/video del Paso 10; DoD con PASS/FAIL/NO EJECUTADO; stop.

---

## 10. Pruebas de valor: XCTest, Jest/RNTL y regresión

### 10.1. XCTest Swift focalizado

Añadir un target XCTest o un `test_spec` de CocoaPods **solo si es necesario** y mantenerlo invocable desde Xcode/CLI. No añadir framework de mocking o E2E, snapshots sensibles ni suites «de cantidad». Se esperan pruebas de comportamiento; conteos definitivos dependen del test target efectivo.

| Bloque | Escenarios mínimos verificables | Qué no afirma |
| --- | --- | --- |
| **Token** | emisión y renovación con nonce distinto; token válido con reloj inyectado; firma manipulada → `TOKEN_INVALID`; formato/tamaño/cardId inválido; token íntegro exactamente en `expiresAt` → `TOKEN_EXPIRED`; reinicio/sustitución de clave → fail closed; posible vector de paridad Kotlin↔Swift con clave fija **solo test** | No prueba autenticación productiva ni intercambio real entre dispositivos |
| **Sesión segura** | inicio 45 s con reloj monotónico inyectable; background cubre; reanudación revalida; timeout durante suspensión; manual dismiss y timeout **una vez**; validación negativa deja error neutro; `CardDataShown` solo primer reveal; callback tardío no emite tras close | No sustituye prueba física del lifecycle/snapshot OS |
| **Mock nativo** | cardId reconocido/desconocido, material completo accesible **solo tras** validación; payloads de evento/Promise contienen solo IDs/códigos/booleano/expiración de token | No mide borrado perfecto de strings en RAM |
| **Mapa** | `[]`, validación borde/coordenadas no finitas, duplicados, add/update/remove/reorder, selección vigente/inexistente, tap a ID eliminado, separación de selección programática y toque de usuario | No prueba las teselas ni el gesto físico de MapKit |

### 10.2. Jest y React Native Testing Library

- **Reutilizar** las 113 pruebas/13 suites históricas de Paso 09; ejecutar regresión porque se modifica el gate iOS y la librería nativa, **sin recalcular su DoD histórico**.
- Añadir **solo** escenarios de valor si la integración los vuelve necesarios: iOS monta `CustomMap` cuando la vista Fabric existe; wrapper conserva `onMarkerPress(string)` y `selectedMarkerId`; fallback ausente/no disponible es honesto; gateway iOS llama el mismo contrato `issueSecureToken`/`openSecureView` sin payload sensible; navegación autenticada no se altera.
- Jest mockea frontera nativa; **no** afirmar que Jest prueba MapKit dibujando o protecciones de captura.
- Preservar cobertura del reporte heredado y reportar **métricas actuales si se vuelven a obtener**, con denominador RN/TS real, **sin imponer una cifra arbitraria mayor** ni contabilizar XCTest como cobertura Jest.

### 10.3. Matriz manual mínima iOS

| ID | Prueba de ejecución | Evidencia válida |
| --- | --- | --- |
| I01 | Build + arranque iOS con Firebase: login válido y logout; error de credenciales conserva Login | ejecución observada/proporcionada por propietario, sin credenciales en evidencia |
| I02 | Mis productos: token + apertura de vista UIKit válida; botón Ocultar; eventos esperados | secuencia en terminal debug **sanitizada** o descripción verificada; **sin PAN/CVV en screenshots** |
| I03 | Token inválido/expirado: no se muestran datos, códigos correctos y error visible hasta Ocultar/timeout | XCTest/harness de diagnóstico limitado no sensible o test manual controlado; no esperar 60 s para «fabricar» caducidad si hay reloj inyectable |
| I04 | Background/app switcher: detalles cubiertos; reanudación revalida; timeout real cierra a 45 s aprox. | verificación con reloj y escenario físico, no promesa de bloqueo OS absoluto |
| I05 | Beneficios: MapKit real con pins; tap pin → carrusel; swipe carrusel → pin; retorno entre tabs conserva selección | iOS simulator/device realmente observado; capturas **solo de mapa/carrusel** son aptas |
| I06 | Mapa con empty/inválidos/ID desconocido y variación de datos | test XCTest o harness debug retirado al finalizar + smoke proporcional |
| I07 | Regresión Android: login, Card Secure View y un ciclo mapa↔carrusel | smoke existente y `npm run test:all`; no reauditar funcionalidades previas |
| I08 | Dispositivo físico iOS (si disponible): recording/cambio de escena y screenshot, declarando si screenshot aún puede contener datos | **NO EJECUTADO si no existe dispositivo**; jamás declarar «bloqueo absoluto de screenshot» |

> Un simulador puede ser suficiente para cerrar funcionalidad **si el dispositivo físico no está disponible** y la limitación se documenta; los tests OS específicos de screenshot/recording se consideran evidencia complementaria. La **imposibilidad real de compilar o montar el mapa iOS** sí impide declarar la paridad del Paso 11 completada.

---

## 11. Comandos reproducibles (usar nombres reales verificados)

**No ejecutar estos comandos en esta fase de revisión.** Son instrucciones para la ejecución **después de aprobar** el documento. Los nombres de workspace/scheme/destination se descubren primero.

### 11.1. RN/TypeScript en raíz

```bash
# Inspección: no borrar el working tree del propietario.
git status --short
npx react-native config

# Calidad y Jest, sin obligar a generar un coverage nuevo por el solo hecho de desarrollar iOS.
npm run lint
npm run typecheck
npm run format:check
npm test -- --watch=false --runInBand

# Regresión contractual existente: Jest + JUnit Android.
npm run test:all

git diff --check
git diff --stat
```

`npm ci` **solo si faltan node_modules** y el lockfile efectivo permite una instalación limpia, sin `--force`, `--legacy-peer-deps` ni cambios de versión. No usar `npm install` indiscriminadamente al añadir el podspec.

### 11.2. Codegen iOS, Pods y workspace

```bash
# Desde la raíz: Codegen oficial y verificación de artefactos iOS (no editar generados).
node node_modules/react-native/scripts/generate-codegen-artifacts.js \
  --path . --targetPlatform ios --outputPath ios/

# Comprobar schema/artefactos generados de AMBOS tipos bajo ios/build/generated/ios/:
find ios/build/generated/ios -type f | grep -E 'IoNativeComponentsSpec|ComponentDescriptors|EventEmitters|Props|Modules' | head -80

cd ios
# Si existe Gemfile conforme a la instalación real:
bundle check || bundle install
bundle exec pod install
# Si NO existe Gemfile ni bundle según la plantilla, usar `pod install`, registrando el motivo.
cd ..

# Identificar workspace/scheme efectivos antes de compilar:
find ios -maxdepth 2 -name '*.xcworkspace' -print
xcodebuild -list -workspace ios/IoProductsBenefits.xcworkspace
xcrun simctl list devices available
```

El último `xcodebuild` utiliza el nombre **probable del bootstrap**; **sustituirlo por la ruta real** si difiere. `bundle check || bundle install` presupone que existe Gemfile; si no, no usarlo. **No** ejecutar `pod repo update`, `pod deintegrate` o `rm -rf Pods` por rutina.

### 11.3. Build, XCTest y ejecución

```bash
# EJEMPLOS: reemplazar el destino por un identificador de simulador REAL de `simctl`.
# Preferir destino por UUID para no asumir nombres/modelos instalados.
xcodebuild -workspace ios/IoProductsBenefits.xcworkspace \
  -scheme IoProductsBenefits -configuration Debug \
  -destination 'platform=iOS Simulator,id=<SIMULATOR_UUID_REAL>' \
  build

# Solo cuando exista un test target/scheme que incluya XCTest:
xcodebuild -workspace ios/IoProductsBenefits.xcworkspace \
  -scheme IoProductsBenefits -configuration Debug \
  -destination 'platform=iOS Simulator,id=<SIMULATOR_UUID_REAL>' \
  test

# App en el simulador seleccionado, con Metro/packager según scripts reales:
npm run ios -- --udid '<SIMULATOR_UUID_REAL>'
```

`<SIMULATOR_UUID_REAL>` es **placeholder de comando**, no un valor para copiar literalmente; si el script RN instalado no admite `--udid`, usar el parámetro que soporte `npm run ios -- --help`. Si el esquema de tests no existe, crear/configurar target XCTest mínimo y descubrir su **scheme real** antes del comando `test` (no marcar PASS por ejecutar solo `build`). Para dispositivo físico se requieren firma/provisioning ya gestionados por el propietario; **no cambiar credenciales de Xcode ni crear certificados automáticamente**.

### 11.4. Regresión Android proporcional

```bash
# Se mantienen los tests ya instalados, sin reauditar 01–07/09.
npm run test:native:android
npm run test:all

# Si se tocó codegen/package/registro común, comprobar además build de Android:
cd android
./gradlew :app:assembleDebug
cd ..
```

Registrar comandos realmente ejecutados; si Gradle, CoreSimulatorService, red, signing o sandbox bloquean una verificación, clasificar **BLOQUEADO / NO EJECUTADO con causa textual**, no PASS. No usar cuentas/repo del propietario para solucionar la firma sin autorización.

---

## 12. Riesgos y trade-offs residuales

| Riesgo | Severidad | Mitigación / condición de transparencia |
| --- | --- | --- |
| **Codegen iOS no descubre specs del package local** (RN 0.88 cambió crawling de symlinks) | Alta para build | confirmar `react-native config`, podspec, provider/schema físico y autolinking; ajustar metadatos de **la misma** librería; no añadir legacy bridge |
| **Interoperabilidad Swift ↔ ObjC++** (imports generados, Swift header, C++ ABI, nombres) | Alta para build | adapter mínimo; inspeccionar artefactos `IoNativeComponentsSpec`, pod target y archivos generados, sin editar output ni forzar flags globales |
| **Token Kotlin no tiene representación byte a byte documentada** | Media-alta | inspeccionar implementación y fixtures Kotlin, vector de compatibilidad de bytes con clave solo test; Swift reproduce sin cambiar API/Android |
| **Protección screenshot inferior a `FLAG_SECURE`** | Residual inevitable del OS | ocultar en background/recording detectado; reconocer screenshot anterior a callback y límites de privacidad; no hacks privados |
| **Lifecycle UIKit/UIScene y 45 s durante suspensión** | Alta funcional | `sceneWillResignActive`/notificaciones, deadline monotónico continuo, revalidar, ocultar antes de snapshot, teardown y cierre idempotente |
| **MapKit y Fabric selection loops** | Media | prop controlada, suppression de selección programática, ID membership, reuse de coordinador RN del Paso 06 |
| **Versiones Xcode / CocoaPods / iOS SDK** | Media-alta | comprobar versión real y plantilla, CocoaPods RN 0.88, SceneDelegate solo cuando se requiera, evitar upgrades RN/React |
| **Simulador sin cuenta Firebase/red/tiles, o sin dispositivo físico** | Media para evidencia | separar enlace/build, login real y tiles; reportar ambientes disponibles, no inventar smoke; físico opcional y limitaciones declaradas |
| **Datos sensibles en instrumentos de prueba o logs** | Alta seguridad | mocks Swift sintéticos; no PAN en JS/Jest/logs/reportes/screenshots; inspección focalizada de los archivos nuevos y diff |
| **Regresión Android por package/Codegen** | Alta | conservar specs, nombres y registro; Jest/JUnit + build/regresión focalizada; sin reabrir DoD antiguos |

**No se promete:** bloqueo total de screenshots iOS; compatibilidad cruzada de *tokens individuales* emitidos en distintos procesos; storage o autorización bancaria productivos; garantía antirreplay, borrado criptográfico perfecto de strings, seguridad ante jailbreak, pruebas de estrés/FPS o cobertura XCTest transformada en porcentaje Jest.

---

## 13. Definition of Done (Paso 11 — objetivos proporcionales)

> **Lista de criterios definida antes de la ejecución.** Los estados y evidencias finales de cada DoD están en §16. Esta lista no reevalúa los pasos anteriores.

### A. Integración y contratos — 6 DoD

- [ ] **D11-01** Se conserva el repo/identificadores, RN **0.88.0** y una sola librería `io-native-components`; no nuevos bridges, wrappers o actualizaciones del stack.
- [ ] **D11-02** Se detectó e integró el target iOS real con CocoaPods y fuentes Swift/ObjC++ mínimas, sin romper `AppDelegate`/`SceneDelegate`.
- [ ] **D11-03** Codegen iOS genera y registra realmente **`IoSecureView` y `CustomMap`** desde las dos specs originales `IoNativeComponentsSpec` (`type: all`), sin artefactos editados ni registro doble.
- [ ] **D11-04** `SecureTokenProvider`, `SecureViewGateway`, `CustomMapProps`, `MapMarker`, eventos y nombre de los componentes permanecen públicamente compatibles; cualquier adapter es interno.
- [ ] **D11-05** Se documenta el formato de bytes Kotlin realmente verificado y se demuestra comportamiento equivalente del emisor/validador Swift, sin compartir secreto de producción ni modificar Android.
- [ ] **D11-06** Se demostró al menos un build/link iOS satisfactorio con los dos componentes; no basta typecheck/Codegen sin build.

### B. Secure View iOS — 6 DoD

- [ ] **D11-07** Token Swift mock 60 s emitido/validado nativamente con HMAC y codificación aprobada; errores y vencimiento correctos, sin datos completos en JS.
- [ ] **D11-08** Vista Swift/UIKit fullscreen y mock interno sensible solo Swift; abierto válido, «Ocultar» y error oculto funcionan.
- [ ] **D11-09** Cuatro eventos, payloads permitidos, orden e idempotencia corresponden al Paso 04; sin `CardDataShown` por error ni `Closed` artificial al validar mal.
- [ ] **D11-10** Deadline absoluto 45 s (también durante background) y lifecycle con ocultamiento inmediato, revalidación y fail closed operan en tests/smoke.
- [ ] **D11-11** Se implementan mitigaciones oficiales de captura/recording disponibles y se **declara explícitamente** la falta de garantía de screenshot iOS, sin hacks privados.
- [ ] **D11-12** No hay PAN/CVV/titular completos/token en eventos/props/JS/Zustand/logs/snapshots/config versionada; inspección focalizada con evidencia sin valores.

### C. MapKit y sincronización — 5 DoD

- [ ] **D11-13** `CustomMap` iOS monta realmente `MKMapView` vía Fabric; marcadores visibles MapKit, sin SDK de terceros ni key Google iOS.
- [ ] **D11-14** Prop `markers` reconcilia altas/cambios/bajas, tolera `[]`, coordenadas inválidas/duplicados y no crashea por selección inexistente.
- [ ] **D11-15** `selectedMarkerId` resalta pin; el `onMarkerPress(markerId)` corresponde solo a tap real válido y no se reemite por cambio programático de prop.
- [ ] **D11-16** Pin → carrusel y carrusel → pin funcionan usando el **mismo** `selectedBenefitId` RN, sin duplicar selección/estado ni bucles.
- [ ] **D11-17** La tab Benefits conserva elegibilidad, estados y alternativa textual; fallback iOS ya no suplanta el mapa cuando Fabric está disponible.

### D. Calidad, autenticación, regresión y reporte — 7 DoD

- [ ] **D11-18** XCTest Swift focalizado pasa en target real para token, sesión y reconciliación/map state; se adjuntan comando, suites y resultados efectivos (sin cifra artificial).
- [ ] **D11-19** `lint`, `typecheck`, `format:check`, Jest y `npm run test:all` ejecutados con resultados y conteos actuales; JUnit Android permanece funcional.
- [ ] **D11-20** iOS compila/arranca en simulador o dispositivo; rutas login Firebase real → Dashboard → logout sin bypass y navegación entre tabs observadas.
- [ ] **D11-21** Smoke iOS de Card Secure View (válida/ocultar/timeout/background; invalidez por test controlado) y de mapa/carrusel documentado con evidencia no sensible.
- [ ] **D11-22** Regresión Android focalizada en login, Card Secure View y mapa/carrusel; build Android si cambió integración compartida; sin reauditar DoD históricos.
- [ ] **D11-23** No hay cambios no autorizados de contratos, recursos sensibles, paquetes, Firebase/auth, Android ni documentación final. `git diff --check` limpio; sin commit/push/publicación.
- [ ] **D11-24** El implementador reporta cada prueba como PASS/FAIL/NO EJECUTADO, dispositivo/SDK real, limitaciones y riesgos residuales, y **se detiene** sin iniciar Paso 10/12.

**Total:** **24 DoD propios del Paso 11**. No se añaden criterios numéricos de cobertura Swift ni un conteo obligatorio de tests. Si XCTest/map/auth/build son `FAIL`, el Paso 11 se mantiene abierto. **Prueba física de screenshot/recording (I08)**, si no hay dispositivo, se declara `NO EJECUTADO` como límite de evidencia, **sin convertirlo en garantía ni bloquear por sí sola la evaluación funcional en simulador**.

---

## 14. Formato obligatorio del reporte del implementador al terminar el Paso 11

Entregar **estas nueve secciones** en este orden, con hechos **ejecutados**, no pronósticos:

1. **Resumen de resultado:** `COMPLETO / PARCIAL / BLOQUEADO`, build real iOS sí/no, ambos componentes nativos sí/no, diferencias frente a Android.
2. **Inventario de cambios:** rutas efectivas Swift/ObjC++/podspec, cambios de configuración iOS, specs/adapters tocados o preservados, `git status` antes/después y diff; declarar ausencia de commit/push.
3. **Integración New Architecture:** `IoNativeComponentsSpec`/providers/clases generadas encontradas, registro TurboModule + Fabric, scheme/workspace y deployment target reales. Indicar si se usó `SceneDelegate` existente o hubo corrección mínima.
4. **Card Secure View / token:** algoritmo/formato Kotlin comparado, emission/validation Swift, 60 s/45 s, errores/4 eventos, lifecycle, screenshot/recording y limitación iOS. **Sin exponer datos/secretos**.
5. **MapKit / Benefits:** `MKMapView`, altas/bajas, selección, tap Fabric, wrapper, sincronización bidireccional y manejo empty/invalid.
6. **Firebase iOS:** versión SDK efectiva, configuración cliente disponible (sí/no; **sin valores**), login/logout real observado o bloqueo preciso; confirmación de que el ID token Firebase no es `secureToken`.
7. **Pruebas y comandos:** tabla `comando | PASS/FAIL/NO EJECUTADO | test count/resultado | dispositivo/destino | evidencia/caso bloqueo`; separar XCTest, Jest, JUnit, Codegen, Pods, builds y smoke manual. **No reutilizar 113 Jest como si fueran un resultado nuevo sin ejecutarlas.**
8. **Checklist D11-01…D11-24:** estado uno por uno y referencia a comando/test/evidencia; no reabrir otros DoD.
9. **Trade-offs, riesgos residuales y siguiente paso:** limitación screenshot, replay local del mock, simulador vs físico, posibles pendientes; indicar **Paso 10 — README/documentación/video/entrega** como siguiente **sin ejecutarlo**. Paso 12 permanece posterior.

**Criterio de honestidad:** el reporte puede ser parcial/bloqueado si hubo un impedimento real. Jamás sumar `PASS` por el solo hecho de escribir Swift, editar un Podfile, mockear un TurboModule en Jest o tener evidencia Android antigua.

---

## 15. Referencias oficiales verificadas para la ejecución (06/11/2026)

**Requisitos del proyecto (documentos cargados):**

- `Reto técnico - Chapter Master Frontend.pdf`, pp. 1–5: segunda plataforma extra, una librería, MapKit, datos solo nativos, mapa↔carrusel, vista segura, 30–60 s.
- `STEP-01-BOOTSTRAP.md`, §3 y §11: RN 0.88, iOS generado, entorno.
- `STEP-02-ARCHITECTURE.md`, §§5–8: contratos y límites.
- `STEP-04-NATIVE-SECURE-VIEW.md`, §§4, 6, 8–10: Codegen, HMAC v1/60 s, UI/45 s y eventos.
- `STEP-05-BENEFITS-CUSTOM-MAP.md`, §6 y cierre §21.9: `type: all`, Fabric, contratos de mapa, iOS fallback.
- `STEP-06-MAP-CAROUSEL-SYNC.md`, §§5, 8–10 y cierre §24.14: fuente única de selección.
- `STEP-07-TESTING-COVERAGE.md`, cierre §25.8; `STEP-09-EXTRAS.md`, cierre §13.14: línea base histórica y Firebase real.

**Documentación pública para precisión de compatibilidad y seguridad:**

1. React Native — [RN 0.88 release (19 octubre 2026)](https://reactnative.dev/blog/2026/10/19/react-native-0.88): event dispatch, SceneDelegate/SDK iOS 27, CocoaPods/SwiftPM y cambio de descubrimiento Codegen.
2. React Native — [Using Codegen (0.88)](https://reactnative.dev/docs/the-new-architecture/using-codegen): `codegenConfig.ios.modules/components`, `type: all`, generación iOS y artefactos `IoNativeComponentsSpec`.
3. React Native — [Using Swift in Native Modules (guía 0.87, patrón vigente a contrastar con 0.88)](https://reactnative.dev/docs/0.87/the-new-architecture/turbo-modules-with-swift): adapter Swift/Objective-C++; **ajustar contra los headers generados de RN 0.88**, no copiar ejemplos con nombres de otra app.
4. Apple — [`UIApplication.userDidTakeScreenshotNotification`](https://developer.apple.com/documentation/uikit/uiapplication/userdidtakescreenshotnotification): evento **posterior** al screenshot.
5. Apple — [`UIScreen.isCaptured` (deprecated)](https://developer.apple.com/documentation/uikit/uiscreen/iscaptured): screen recording/mirroring y recomendación de `sceneCaptureState`.
6. Apple — [`UITraitCollection.sceneCaptureState`](https://developer.apple.com/documentation/uikit/uitraitcollection/scenecapturestate): estado de captura de escena, sujeto a availability.
7. Apple — [`MKMapViewDelegate.mapView(_:didSelect:)`](https://developer.apple.com/documentation/mapkit/mkmapviewdelegate/mapview%28_%3Adidselect%3A%29-41by3): selección de pin.
8. Apple — [Transitioning to the UIKit scene-based life cycle](https://developer.apple.com/documentation/uikit/transitioning-to-the-uikit-scene-based-life-cycle): transición y requisitos con SDK reciente.

---

**Estado de este archivo al crearse:** propuesta previa a la ejecución. El resultado efectivo se registra a continuación.

---

## 16. Reporte de ejecución — 2026-11-06

### 1. Resumen de resultado

**COMPLETO en el alcance del Paso 11; 24/24 DoD evaluados como PASS en §16.8.** El propietario observó build y arranque en iPhone 17 Pro Simulator (iOS 26.2), login/Dashboard/logout, MapKit con carrusel sincronizado y Card Secure View válido, ocultamiento, cierre por 45 s, segundo plano/reingreso y error por token inválido. Tras el ajuste final de idempotencia, Xcode XCTest ejecutó 5/5 con 0 fallos. También confirmó el flujo Android completo de login, tarjeta segura, mapa/carrusel y logout. La prueba en iPhone físico fue omitida expresamente por el propietario.

### 2. Inventario de cambios

- Nueva integración única `packages/io-native-components/io-native-components.podspec`; configuración `codegenConfig.ios` en `package.json`; la spec Fabric existente se habilitó en iOS.
- Swift/ObjC++ en `packages/io-native-components/ios/{map,secureview}/`: MapKit, reconciliación, controles de zoom, adapter Fabric, token HMAC, sesión, controlador UIKit y adapter TurboModule.
- `ios/Podfile`, `Podfile.lock`, target XCTest en `IoProductsBenefits.xcodeproj` y `ios/IoProductsBenefitsTests/NativeComponentsTests.swift`.
- Wiring iOS en `src/app/composition/secureDependencies.ts`, `BenefitsScreen`, `CardsScreen`, `CustomMap.tsx` y pruebas focalizadas. Android nativo no fue editado.
- Estado inicial heredado: `README.md` y `STEP-09-EXTRAS.md` ya estaban modificados, y este STEP-11 era nuevo. Permanecen cambios sin commit/push/publicación.

### 3. Integración New Architecture

RN 0.88.0; workspace `ios/IoProductsBenefits.xcworkspace`, scheme `IoProductsBenefits`, deployment iOS 15.1. Codegen generó `IoNativeComponentsSpec`, `RCTModuleProviders.mm` con `IoSecureView → IoSecureViewAdapter` y `RCTThirdPartyComponentsProvider.mm` con `CustomMap → CustomMapComponentView`. CocoaPods incorporó fuentes Swift/ObjC++ y el target XCTest. `AppDelegate` y `SceneDelegate` no cambiaron. El primer arranque falló por providers sin clase; tras añadir los adapters, el propietario confirmó arranque y uso de ambos componentes.

### 4. Card Secure View / token

Swift usa el protocolo mock Kotlin `v1.base64url(payload).base64url(HMAC-SHA256)` con clave efímera por proceso, nonce y payload big endian (longitud de ID de 32 bits, ID UTF-8, emisión y vencimiento de 64 bits, nonce de 16 bytes). TTL 60 s; expiración en el límite exacto comprobada por XCTest. UIKit muestra los datos sintéticos solo en la vista nativa; JS recibe ID, códigos/mensajes y motivos permitidos. La sesión usa reloj continuo y 45 s; el propietario confirmó su cierre por tiempo. Se ocultan y limpian etiquetas al salir de la app, al detectar captura de pantalla o grabación y al cerrar. iOS no ofrece garantía pública de impedir la primera captura de pantalla; la notificación llega después de capturarla. No se usaron APIs privadas.

### 5. MapKit / Benefits

`CustomMapComponentView` Fabric contiene `CustomMapCanvasView` Swift con `MKMapView`; reconcilia altas, cambios y bajas, filtra IDs/coordenadas inválidos y duplicados. La selección controlada enfoca un área local, y los botones +/− ajustan zoom. `onMarkerPress` valida el ID antes de enviarlo a RN. Benefits mantiene una sola selección en Zustand y el carrusel React Native existente. El propietario observó MapKit, controles y funcionamiento de Beneficios en simulador. La prueba XCTest cubre reconciliación básica; no sustituye gestos reales ni disponibilidad de tiles de Apple.

### 6. Firebase iOS

Firebase JS SDK 12.19.0 y configuración local ignorada por Git; no se añadieron credenciales ni SDK nativo Firebase. El propietario confirmó login, Dashboard y logout en iOS. El ID token Firebase y `secureToken` de tarjeta son mecanismos independientes.

### 7. Pruebas y comandos reales

| Comando/acción | Estado | Resultado y límite |
|---|---|---|
| `pod install --no-repo-update` (Terminal del propietario) | PASS | Pods y target XCTest presentes en workspace |
| Codegen vía CocoaPods | PASS | Providers iOS generados para los dos componentes |
| Xcode `⌘B`/`▶` (propietario, iPhone 17 Pro iOS 26.2) | PASS | Build/arranque y componentes observados; no se capturó log CLI final |
| Xcode `⌘U` (propietario) | PASS | `NativeComponentsTests`: 5 pruebas, 0 fallidas tras el ajuste de idempotencia, 2026-11-06 15:49:57 |
| `npm run lint` | PASS | salida 0 |
| `npm run typecheck` | PASS | salida 0 |
| `npm run format:check` | PASS | todos los archivos coinciden |
| `npm test -- --watch=false --runInBand` | PASS | 13 suites, 113/113 pruebas |
| `ANDROID_HOME=/Users/juliocampos/Library/Android/sdk npm run test:all` (Terminal del propietario) | PASS | Jest 113/113 observado antes; Gradle `BUILD SUCCESSFUL in 2s`, 29 tasks up-to-date. Primera ejecución desde sandbox falló por permiso de `~/.gradle` |
| `npm run test:native:android` fuera de sandbox | PASS | JUnit 13/13, 0 fallidas; task `UP-TO-DATE` |
| `ANDROID_HOME=/Users/juliocampos/Library/Android/sdk ./gradlew app:assembleDebug` | PASS | `BUILD SUCCESSFUL`; primera tentativa sin `ANDROID_HOME` falló |
| `git diff --check -- ios packages/io-native-components src __tests__` | PASS | sin errores en archivos del Paso 11 |
| `git diff --check` global | FAIL heredado | whitespace ya presente en `STEP-09-EXTRAS.md`, no editado por Paso 11 |
| Smoke iOS manual | PASS | propietario confirmó login/logout, mapa/carrusel, Card Secure View/timeout, segundo plano/reingreso y token inválido en simulador |
| Smoke Android interactivo | PASS | propietario confirmó login, Card Secure View, mapa/carrusel y logout en emulador Android |
| Captura/recording en iPhone físico | OMITIDO | decisión expresa del propietario; escenario complementario opcional I08 |

### 8. Checklist D11-01…D11-24

| DoD | Estado | Evidencia / pendiente |
|---|---|---|
| D11-01 | PASS | RN 0.88.0, una librería, sin actualización de stack |
| D11-02 | PASS | podspec, Pods y target iOS; delegates existentes intactos |
| D11-03 | PASS | dos providers Codegen generados y runtime observado |
| D11-04 | PASS | specs/puertos públicos conservados; wiring iOS interno |
| D11-05 | PASS | comparación de ByteBuffer Kotlin y Data Swift: longitud/UTF-8/tiempos big endian/nonce; HMAC y TTL 60 s; XCTest de emisión/validación. No se ejecutó vector cruzado, que era opcional en §10 |
| D11-06 | PASS | Xcode build y arranque confirmados por propietario |
| D11-07 | PASS | XCTest validez, límite de 60 s, manipulación y clave distinta |
| D11-08 | PASS | vista UIKit y Ocultar confirmados por propietario |
| D11-09 | PASS | adapter emite cuatro eventos permitidos; policy/runtime impiden duplicar shown, close y error; XCTest 5/5 y smoke de error/timeout |
| D11-10 | PASS | XCTest deadline; propietario confirmó timeout y segundo plano/reingreso |
| D11-11 | PASS | mitigaciones públicas y limitación de screenshot documentadas; prueba física opcional omitida por el propietario |
| D11-12 | PASS | datos completos solo en repositorio Kotlin/Swift; eventos sin payload sensible |
| D11-13 | PASS | MKMapView/Fabric observado en simulador |
| D11-14 | PASS | reconciliación/invalidación/empty en Swift y XCTest |
| D11-15 | PASS | selección controlada y supresión de callback en selección programática; ID validado antes de evento; sincronización manual confirmada |
| D11-16 | PASS | propietario confirmó beneficios y sincronización funcional |
| D11-17 | PASS | fallback iOS retirado; alternativas y estados conservados |
| D11-18 | PASS | XCTest 5/5 en iPhone 17 Pro Simulator después del ajuste final |
| D11-19 | PASS | lint, typecheck, format, Jest 113/113, JUnit 13/13 y `test:all` final exitoso en Terminal del propietario |
| D11-20 | PASS | propietario confirmó login, Dashboard, tabs y logout iOS |
| D11-21 | PASS | propietario confirmó Card Secure View válido/ocultar/timeout, invalidez, segundo plano y mapa/carrusel |
| D11-22 | PASS | JUnit 13/13, build Debug y smoke interactivo Android confirmados |
| D11-23 | PASS | diff de archivos Paso 11 limpio, sin commit/push ni cambios Android; `git diff --check` global conserva aviso heredado de whitespace en Paso 09, fuera del alcance autorizado |
| D11-24 | PASS | reporte honesto y detención tras Paso 11 |

### 9. Trade-offs, riesgos residuales y siguiente paso

La primera screenshot iOS puede contener la vista antes de que llegue la notificación; grabación/captura no ofrecen protección equivalente a `FLAG_SECURE` Android. El protocolo de token es mock local, con clave por proceso, sin garantía de backend ni persistencia. MapKit depende de tiles de Apple. La prueba física iOS fue omitida por decisión del propietario, conforme al carácter complementario de I08. XCTest comprueba lógica pura; el smoke manual en simulador aporta evidencia de UI y lifecycle. El siguiente paso documental sería el Paso 10, **no ejecutado aquí**; Paso 12 permanece posterior.
