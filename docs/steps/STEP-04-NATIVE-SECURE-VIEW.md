# STEP-04 — Librería nativa y Card Secure View (Android/Kotlin)

> **Actualización de alcance — 06/11/2026:** el Paso 08 fue **OMITIDO por decisión del propietario**, por resultar redundante para el reto BCP. Su documento de ejecución fue eliminado. Las referencias históricas a esa etapa corresponden al plan original y no constituyen trabajo pendiente ni un requisito de cierre. Este paso conserva su aprobación y sus controles implementados.

**Proyecto:** `io-products-benefits`  
**Aplicación:** iO Productos & Beneficios  
**Librería nativa:** `io-native-components`  
**Etapa:** 04 de 12  
**Estado:** **COMPLETADO — 60/60 criterios comprobados**  
**Prerequisitos:** Pasos 01, 02 y 03 completados y aprobados, según el propietario  
**Framework:** React Native **0.88.0**, TypeScript estricto, New Architecture  
**Plataforma de implementación:** Android + Kotlin  
**Plataforma adicional:** iOS + Swift **reservada al Paso 11**  
**Documento rector:** `RETO_BCP_TECHNICAL_BASELINE.md`  
**Norma de evaluación:** `Reto técnico - Chapter Master Frontend.pdf`  
**Contratos aprobados:** `docs/steps/STEP-02-ARCHITECTURE.md`  
**Base funcional aprobada:** `docs/steps/STEP-03-DASHBOARD-CARDS.md`

**Ajustes de revisión:** token mock con TTL de **60 s** independiente de sesión de **45 s**; comando obligatorio `npm run test:all` para Jest + JUnit; política única para errores/cierre; implementación Kotlin con responsabilidades claras pero sin imponer clases o callbacks de dibujo innecesarios. El propietario restauró los cuatro controles de auditoría el 5 nov 2026; se conservan los 60 DoD y las fronteras de seguridad originales.

---

## 1. Instrucciones de implementación

> **Actúa como Chapter Frontend / Senior React Native Engineer con experiencia en React Native 0.88, Kotlin, Android, Turbo Native Modules, Codegen, Clean Architecture, SOLID, seguridad móvil y testing.**
>
> **Ejecuta ÚNICAMENTE el PASO 04 — LIBRERÍA NATIVA Y CARD SECURE VIEW.** Los Pasos 01, 02 y 03 ya fueron completados y aprobados por el propietario. No repitas sus Definition of Done, no reinicialices el proyecto y no adelantes los Pasos 05 a 12.
>
> Trabaja exclusivamente sobre el repositorio existente `io-products-benefits`. Implementa **una librería nativa propia y reutilizable** en `packages/io-native-components/` y su integración Android/Kotlin con RN 0.88 New Architecture. La librería será el único paquete nativo propio para **Card Secure View** ahora y **CustomMap** después.
>
> **Objetivo funcional:** desde cada tarjeta de **Mis productos**, React Native solicita un `secureToken` efímero a un emisor mock respaldado por Kotlin, y abre una Activity nativa a pantalla completa que valida el token **antes de renderizar** PAN completo, CVV y titular. Protege capturas, background y timeout de **45 segundos**, permite **Ocultar**, emite los cuatro eventos aprobados sin datos sensibles y cierra correctamente.
>
> Construye una integración **demostrativa**, NO una implementación financiera productiva ni una prueba de resistencia a dispositivos comprometidos. Los mocks PAN/CVV/titular **nunca** deben viajar a JavaScript. Ningún secreto, token o dato completo debe aparecer en logs, eventos, store, snapshots o tests JS.
>
> Al terminar, ejecuta pruebas y validaciones reales, documenta resultados y presenta el reporte de la sección 20. **Detente sin iniciar el Paso 05.** No hagas `git commit`, `push` ni publiques el paquete sin instrucción explícita.

### 1.1. Lectura y precedencia obligatorias

Antes de modificar cualquier archivo, el implementador debe:

1. Leer completo `RETO_BCP_TECHNICAL_BASELINE.md`.
2. Leer `docs/steps/STEP-01-BOOTSTRAP.md`, `STEP-02-ARCHITECTURE.md` y `STEP-03-DASHBOARD-CARDS.md`; si las rutas reales difieren, **localizarlos sin duplicarlos**.
3. Leer el PDF del reto si existe en el repositorio. Si no existe, trabajar con el baseline transcrito y **reportar expresamente la ausencia**, sin fingir que lo consultó.
4. Inspeccionar los **contratos realmente presentes** `SecureTokenProvider.ts`, `SecureViewGateway.ts`, composición, `CardsScreen`, `CardItem`, tema, pruebas, scripts y configuración nativa.
5. Obtener `git status --short`, `git branch --show-current`, versiones exactas y scripts; preservar cambios preexistentes del propietario.
6. Confirmar las APIs y el **subconjunto Codegen realmente admitido por la versión instalada RN 0.88.0**. Las interfaces de aplicación del Paso 02 **no son** specs Codegen.

**Jerarquía:** **PDF oficial > baseline técnico > contratos efectivamente aprobados del Paso 02 > implementación funcional del Paso 03 > este documento > preferencias del agente**. Si hubiera una diferencia material, registrar la discrepancia, adoptar la interpretación segura y compatible, y **no sustituir contratos aprobados por comodidad**.

### 1.2. Restricciones de ejecución

- Mantener `IoProductsBenefits`, `io-products-benefits`, `io-native-components` y `com.ioproductsbenefits`.
- Mantener React Native **0.88.0**, New Architecture, Hermes, npm y **un solo `package-lock.json`**; no actualizar todo el toolchain ni instalar Expo.
- Implementar Kotlin y las APIs nativas de Android; **sin bridges de terceros, componentes de tarjetas seguras preconstruidos ni Legacy Bridge**.
- No modificar sin causa técnica contratos públicos de dominio/aplicación aprobados. Adaptar diferencias en infraestructura.
- No agregar dependencias criptográficas, de DI, state machines o almacenamiento si bastan JDK/Android y Jest/JUnit existentes.
- Evitar `--force`, `--legacy-peer-deps`, `@next`, `+` en dependencias, reemplazos de Gradle de plantilla y cambios globales a Metro por rutina.
- No añadir código Swift, podspec funcional iOS, MapKit, Google Maps SDK, `CustomMap`, beneficios, carrusel, Firebase, login ni publicación del paquete.
- No modificar los mocks públicos de tarjetas para insertar PAN, CVV o titular: los datos sensibles sintéticos pertenecen **solo al código Kotlin**.
- Ejecutar y documentar pruebas **con resultados reales**; no marcar PASS por simple presencia de código.

---

## 2. Alcance exacto y decisiones cerradas

| Tema | Decisión del Paso 04 |
| --- | --- |
| Un único paquete nativo propio | `packages/io-native-components/` |
| Package npm | `io-native-components`, dependencia local del proyecto RN |
| Namespace Android de librería | `com.ioproductsbenefits.nativecomponents` |
| Módulo expuesto a RN | `IoSecureView` (Turbo Native Module, propio) |
| Especificación Codegen | `NativeIoSecureView.ts` |
| Configuración Codegen | `name: IoNativeComponentsSpec`, `type: modules` durante Paso 04 |
| UI sensible | `CardSecureActivity` Android **100 % nativa**, pantalla completa |
| Contrato de app | Reutilizar `SecureTokenProvider` y `SecureViewGateway` de Paso 02 |
| Generación/firma/validación | Kotlin, protocolo **mock**, HMAC-SHA256 y TTL |
| TTL del token mock | **60 segundos** desde emisión (fijo en runtime, reloj inyectable en tests) |
| Timeout de sesión | **45 segundos**, medidos en Kotlin con reloj monotónico |
| Datos completos | Mock interno Kotlin, sin reflejo en JS, JSON público ni bridge |
| Protección de ventana | `WindowManager.LayoutParams.FLAG_SECURE` |
| Background | Contenido sensible **oculto inmediatamente**; no redibujar sin nueva validación y sesión vigente |
| Eventos | `onSecureViewOpened`, `onValidationError`, `onCardDataShown`, `onSecureViewClosed` |
| Errores | `TOKEN_INVALID`, `TOKEN_EXPIRED` |
| Motivos de cierre | `USER_DISMISS`, `TIMEOUT` |
| Consumidor RN | Botón real «Ver datos sensibles» de **Mis productos** |
| Pruebas | Jest/RNTL + JUnit; **`npm run test:all` obligatorio**; build y prueba manual Android |
| Beneficios / mapa | **No** se implementan ahora; se reserva el paquete para el Paso 05 |
| iOS | Sin implementación Swift; degradación controlada si la API no está disponible |

**Aclaración importante:** el PDF exige un timeout de **sesión** entre 30 y 60 segundos, no fija el TTL del token. Se adoptan **60 s de vigencia del token** desde su emisión y **45 s de sesión nativa** desde la apertura efectiva de la Activity. En el flujo normal (emisión y apertura inmediatas), el token conserva vigencia durante los 45 s de sesión; esto evita una expiración accidental por volver de background. Son relojes y responsabilidades diferentes: **cada intento de volver a mostrar datos después de ocultarlos requiere revalidar** tanto el token como el deadline monotónico. Un token emitido mucho antes de abrir, un cambio manual del reloj o un escenario de prueba pueden hacer que expire antes de acabar la sesión; en ese caso la vista permanece cubierta.

### 2.1. Lo que sí se entrega

1. Paquete propio enlazado y reconocido por Codegen/autolinking en Android.
2. TurboModule Kotlin real y eventos Codegen tipados.
3. Puerto de token emitido/renovado con implementación detrás de abstracción.
4. Gateway que traduce la API generada a los puertos aprobados.
5. `CardSecureActivity` visual, nativa y protegida, conectada desde el botón existente.
6. Tests de lógica, bridge, validación, sesión, errores y eventos.
7. Evidencias reproducibles de la frontera de datos y protecciones del sistema.

### 2.2. Lo que no se entrega

No implementar `CustomMap`, Fabric component, Google Maps, marcadores, `benefits.json`, filtrado por marcas, carrusel, sincronización, Swift, Firebase, backend, credenciales reales, PCI DSS productivo, token remoto, almacenamiento persistente, publicación npm ni hardening global del Paso 08.

---

## 3. Arquitectura: continuar la capability Cards / Account Management

### 3.1. Flujo de dependencias

```text
Mis productos / CardItem (UI RN)
   -> use/callback de sesión segura (presentation/application)
      -> SecureTokenProvider (puerto, Paso 02)
      -> SecureViewGateway (puerto, Paso 02)
           ^ implementaciones en cards/infrastructure/native
           |
           v
     io-native-components (API pública TS)
           |
     NativeIoSecureView (Codegen / TurboModule)
           |
     IoSecureViewModule (Kotlin)
           |------ TokenIssuer / TokenValidator (mock)
           |------ NativeCardRepository (datos completos SOLO Kotlin)
           |------ SecureSessionController (lifecycle / 45 s / eventos)
           `------ CardSecureActivity (UI Kotlin / FLAG_SECURE)

           Kotlin -> eventos de ESTADO (sin PAN/CVV/titular/token) -> RN
```

**DIP:** `cards/application` sigue dependiendo de los puertos, **no** del paquete Kotlin, `TurboModuleRegistry`, Activity, Android SDK o JSON. `app` compone dependencias. El módulo nativo es infraestructura, no dominio RN. `benefits` no importa `cards` y permanece sin cambios.

### 3.2. Estructura orientativa, ajustable al repo real

Crear **solo** los archivos que respondan a responsabilidades efectivas:

```text
io-products-benefits/
├── packages/
│   └── io-native-components/
│       ├── package.json
│       ├── react-native.config.js             # solo si la autodetección lo requiere
│       ├── src/
│       │   ├── specs/
│       │   │   └── NativeIoSecureView.ts      # Codegen real, NO puerto de aplicación
│       │   └── index.ts                      # API pública pequeña del paquete
│       └── android/
│           ├── build.gradle
│           └── src/
│               ├── main/
│               │   ├── AndroidManifest.xml
│               │   └── java/com/ioproductsbenefits/nativecomponents/
│               │       ├── IoNativeComponentsPackage.kt
│               │       ├── IoSecureViewModule.kt
│               │       ├── secureview/
│               │       │   ├── CardSecureActivity.kt
│               │       │   ├── SecureSessionController.kt
│               │       │   ├── SecureSessionCoordinator.kt
│               │       │   └── SecureViewEventSink.kt
│               │       ├── token/
│               │       │   ├── MockTokenIssuer.kt
│               │       │   ├── MockTokenValidator.kt
│               │       │   └── TokenClock.kt  # solo si hace falta inyección testeable
│               │       └── cards/
│               │           └── NativeMockCardRepository.kt
│               └── test/java/com/ioproductsbenefits/nativecomponents/
│                   ├── token/...
│                   ├── secureview/...
│                   └── ...
├── src/
│   ├── app/
│   │   └── composition/                      # extender composición existente
│   └── capabilities/cards/
│       ├── application/ports/
│       │   ├── SecureTokenProvider.ts        # APROBADO; conservar firma
│       │   └── SecureViewGateway.ts          # APROBADO; conservar firma
│       ├── infrastructure/native/
│       │   ├── NativeSecureTokenProvider.ts  # adapter
│       │   └── NativeSecureViewGateway.ts    # adapter y subscriptions
│       └── presentation/
│           ├── screens/CardsScreen.tsx       # integrar flujo existente
│           ├── components/CardItem.tsx       # habilitar acción existente
│           └── hooks/...                     # coordinación mínima, si se justifica
├── android/                                  # modificaciones mínimas de integración
├── ios/                                      # NO agregar Swift ni librería iOS
├── README.md                                 # extensión concreta del Paso 04
└── package-lock.json
```

**Los nombres de clases Kotlin internos son sugeridos**, no una orden de crear carpetas o interfaces innecesarias. **Priorizar responsabilidades verificables, no una clase por cada etiqueta de la tabla**: por ejemplo, emisor y validador pueden compartir una implementación pequeña si la prueba de TTL/HMAC sigue siendo independiente de Android; controlador y event sink pueden compartir infraestructura privada si mantienen cierre idempotente y son testeables. Si varias responsabilidades se concentran limpiamente en menos archivos, hacerlo. **No introducir un framework, observables, un sistema de callbacks de dibujo propio o capas redundantes solo por seguir el árbol sugerido.** Una sola **librería** puede incluir más de una clase, y en Paso 05 añadirá el componente Fabric al mismo paquete.

### 3.3. Responsabilidades y límites

| Elemento | Responsabilidad | Prohibición |
| --- | --- | --- |
| `SecureTokenProvider` | contrato `getOrRenewToken(cardId)` | no conoce Kotlin ni almacena tokens en Zustand |
| `NativeSecureTokenProvider` | traducir emisión de Kotlin al contrato aprobado | no firma, no inventa claves, no persiste |
| `SecureViewGateway` | `openSecureView` / `subscribe` | no devuelve card data |
| `NativeSecureViewGateway` | adaptar promesa + 4 emisores y limpiar listeners | no contiene UI ni secretos |
| `IoSecureViewModule` | frontera Codegen, métodos y eventos | no implementa render de tarjeta RN |
| `MockTokenIssuer` | generar token breve para cardId | sin clave en bundle JS |
| `MockTokenValidator` | HMAC, TTL, cardId y formato | no confía en el token por recibirlo de RN |
| `NativeMockCardRepository` | conservar datos sintéticos completos **solo Kotlin** | no retorna PAN/CVV/titular a JS |
| `SecureSessionController` | estado, timeout, cierre idempotente | no usa timers JavaScript |
| `CardSecureActivity` | ventana protegida y render sensible | no acepta datos completos por Intent |

**Regla de pruebas:** separar lógica pura Kotlin (token, validación, transiciones y política de emisión) de `Activity` y contexto Android para ejecutar JUnit sin introducir Robolectric por rutina. La UI y `FLAG_SECURE` se comprueban además en Android real/emulador.

---

## 4. Integración de la librería con RN 0.88 New Architecture

### 4.1. Un paquete npm local, no un módulo suelto de la app

1. Crear `packages/io-native-components/package.json` con nombre npm válido `io-native-components`, versión fija inicial (`0.1.0` local), entrada TS/JS que resuelva Metro, metadatos Android y `codegenConfig`.
2. Añadirlo **como dependencia local** del `package.json` raíz, por ejemplo `"io-native-components": "file:./packages/io-native-components"`, actualizando **el único `package-lock.json`** mediante npm.
3. No crear un monorepo/workspaces complejo ni un lockfile anidado solo para esta librería.
4. Conservar `react-native` como **peer dependency** cuando proceda y usar la instancia de RN de la app; no instalar una segunda copia de React Native dentro de la librería.
5. Verificar que la configuración de **autolinking RN CLI** identifica el paquete y su proyecto Android mediante `npx react-native config`.
6. Si la autodetección no lo descubre, corregir metadatos/ruta de paquete antes de introducir configuración manual. **No registrar dos veces** el mismo paquete en `MainApplication` y autolinking.
7. En Android, compilar como módulo `com.android.library` con Kotlin y la configuración de RN Gradle Plugin **compatible con la plantilla que ya usa el repo**. Declarar `namespace` y referencias de React Native conforme a RN 0.88. Sin `implementation 'com.facebook.react:react-native:+'` ni versiones divergentes.
8. El `AndroidManifest.xml` de la **librería** debe declarar `CardSecureActivity` como `android:exported="false"`, sin Intent filter que permita abrirla desde otras apps. Mantenerla dentro del namespace de la librería.
9. No compilar/commitear artefactos generados si el flujo estándar del repo usa generación al construir; documentar ubicación efectiva de artefactos y mantenerlos en `.gitignore`.

**Compatibilidad RN 0.88:** esta versión cambió detalles del dispatch de eventos y, en iOS, de descubrimiento de Codegen. Usar **los emisores del TurboModule generado**, no APIs privadas del antiguo sistema de eventos, y comprobar el resultado con RN 0.88.0 realmente instalada. El enunciado exige bridge **propio**; el glue-code **generado oficialmente por RN Codegen** sí es válido.

### 4.2. Ejemplo orientativo de configuración Codegen

El `package.json` de **la librería**, NO una segunda configuración duplicada en la app, contendrá una configuración equivalente a:

```json
{
  "name": "io-native-components",
  "version": "0.1.0",
  "codegenConfig": {
    "name": "IoNativeComponentsSpec",
    "type": "modules",
    "jsSrcsDir": "src/specs",
    "android": {
      "javaPackageName": "com.ioproductsbenefits.nativecomponents"
    }
  }
}
```

Esto es **un fragmento**, no un `package.json` completo listo para reemplazar el real. Mantener las propiedades necesarias `main`/`react-native`/`types` y las dependencias correctas según la resolución instalada. `type: modules` es **intencional en Paso 04**. En el Paso 05, cuando exista `*NativeComponent.ts`, la configuración evolucionará dentro **del mismo paquete** a `type: all`; **no crear una segunda librería**.

### 4.3. Especificación TurboModule compatible con Codegen

**Ruta:** `packages/io-native-components/src/specs/NativeIoSecureView.ts`.

Ejemplo del **contrato físico Codegen** (comprobar la generación con RN **0.88.0**, que es la fuente de verdad sobre la sintaxis soportada):

```ts
import type {TurboModule, CodegenTypes} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export type IssuedTokenPayload = {
  readonly value: string;
  readonly expiresAtEpochMs: number;
};

export type CardIdPayload = {
  readonly cardId: string;
};

export type ValidationErrorPayload = {
  readonly code: string;
  readonly message: string;
};

export type SecureViewClosedPayload = {
  readonly cardId: string;
  readonly reason: string;
};

export interface Spec extends TurboModule {
  issueSecureToken(cardId: string): Promise<IssuedTokenPayload>;
  openSecureView(cardId: string, secureToken: string): Promise<boolean>;

  readonly onSecureViewOpened: CodegenTypes.EventEmitter<CardIdPayload>;
  readonly onValidationError: CodegenTypes.EventEmitter<ValidationErrorPayload>;
  readonly onCardDataShown: CodegenTypes.EventEmitter<CardIdPayload>;
  readonly onSecureViewClosed: CodegenTypes.EventEmitter<SecureViewClosedPayload>;
}

// get(), NO getEnforcing(): en Paso 04 aún no existe implementación iOS.
export default TurboModuleRegistry.get<Spec>('IoSecureView');
```

**Condiciones innegociables de Codegen:**

- El archivo empieza con `Native` y el `TurboModuleRegistry.get` coincide **exactamente** con el nombre devuelto por la clase Kotlin.
- La interfaz implementada por Kotlin es la **clase base generada** por Codegen, con nombre real confirmado tras ejecutar la tarea, no una clase `ReactContextBaseJavaModule` inventada.
- `CodegenTypes.EventEmitter<T>` es el mecanismo oficial para los cuatro eventos tipados. Los payloads son objetos **sin datos completos**.
- La spec utiliza tipos soportados (`string`, `number`, objeto de propiedades `readonly`, `Promise` y emisores) y **no** intenta pasar a Codegen la unión discriminada `SecureViewEvent` ni `Promise<void>` del puerto del Paso 02.
- Los `code` y `reason` son `string` **solo a nivel Codegen** para evitar uniones literales no garantizadas. El adapter valida y transforma a los tipos cerrados del Paso 02.
- `openSecureView` resuelve `true` cuando **la solicitud de apertura fue aceptada**, **no** cuando se muestran datos. `onCardDataShown` es la confirmación de render nativo.
- Si `Promise<IssuedTokenPayload>` no genera exactamente en la versión instalada, seleccionar la **mínima alternativa soportada por Codegen** para obtener ambos campos, mantener el puerto público intacto y **documentar la desviación**. No silenciar errores con `any`, no migrar de arquitectura ni reemplazar los 4 eventos por `DeviceEventEmitter`.
- Utilizar el package root `index.ts` como frontera de importación de la app, sin importar `src/specs` desde las pantallas.

**Verificación obligatoria de esta sección:** ejecutar `cd android && ./gradlew generateCodegenArtifactsFromSchema`, comprobar **archivo de spec/clase base generado, esquema y métodos** efectivamente emitidos para `IoSecureView`, y compilar la implementación Kotlin contra ellos. La ruta precisa depende de autolinking/copia local; no suponer que el `build/` de `android/app` es el único lugar de Codegen.

### 4.4. Registro Kotlin New Architecture

- Implementar `IoSecureViewModule` heredando la base `NativeIoSecureViewSpec` **según nombre real del output Codegen**.
- Implementar un `IoNativeComponentsPackage : BaseReactPackage` con `getModule`, `getReactModuleInfoProvider` y `isTurboModule = true`, de acuerdo con la API **real** de RN 0.88.
- Registrar la clase vía autolinking de la dependencia npm. Solo si la herramienta no soporta la configuración local, documentar registro manual mínimo **sin duplicidad**.
- Usar `ReactApplicationContext.currentActivity` únicamente cuando se necesite lanzar la Activity, con comprobación de nulidad, threading Android correcto y manejo de `startActivity` fallido.
- Nunca incluir tokens ni datos sensibles en las cadenas de excepción, errores nativos, `Intent` público, logs, analytics o mensajes de error JS.
- Integrar un `SecureSessionCoordinator` privado que transfiera **solo dentro del proceso Kotlin** el contexto efímero necesario a la Activity; preferir evitar transportar el `secureToken` en extras de `Intent`, `savedInstanceState` o deeplinks. Un identificador opaco de sesión de vida corta es admisible para seleccionar la sesión interna.
- Si Android recrea el proceso y la sesión Kotlin en memoria desaparece, la Activity **falla cerrada** y no reconstruye los datos desde un `Bundle`.
- Si la implementación dispone de lifecycle propio del módulo, limpiar referencias/listeners al invalidarse el módulo para evitar leaks. No mantener una referencia fuerte estática a `Activity` o `ReactApplicationContext`.

### 4.5. Comportamiento iOS durante Paso 04

El paquete solo implementa Android ahora. La integración debe **preservar el build y Dashboard iOS existente**, sin afirmar que ya existe Card Secure View en Swift. Al correr la regresión iOS (si hay entorno Xcode/CocoaPods), verificar:

- la importación JS no debe provocar un crash por `getEnforcing()`;
- el adapter responde con un error **genérico, controlado** de funcionalidad no disponible o el botón permanece deshabilitado en iOS;
- no declarar la librería como implementada en Swift ni introducir un módulo iOS falso;
- no borrar ni invalidar el proyecto iOS que compila desde el Paso 03;
- ejecutar el comando iOS real y comprobar que abre ambas tabs con el botón seguro deshabilitado/mensaje informativo; si no hay toolchain o simulador, registrar **NO EJECUTADO/BLOQUEADO por entorno** con causa, nunca PASS;
- no añadir Swift o podspec ficticio para aparentar paridad: resolver solo ajustes de empaquetado/autolinking imprescindibles para no romper iOS;
- la paridad de `IoSecureView` y la implementación Swift corresponden al Paso 11.

---

## 5. Contratos del Paso 02: reutilización literal

**Leer primero los archivos reales.** Estas firmas son la referencia aprobada:

**`src/capabilities/cards/application/ports/SecureTokenProvider.ts`**

```ts
export interface SecureToken {
  readonly value: string;
  readonly expiresAtEpochMs: number;
}

export interface SecureTokenProvider {
  getOrRenewToken(cardId: string): Promise<SecureToken>;
}
```

**`src/capabilities/cards/application/ports/SecureViewGateway.ts`**

```ts
export type SecureViewErrorCode = 'TOKEN_EXPIRED' | 'TOKEN_INVALID';
export type SecureViewCloseReason = 'USER_DISMISS' | 'TIMEOUT';

export interface OpenSecureViewRequest {
  readonly cardId: string;
  readonly secureToken: string;
}

export type SecureViewEvent =
  | {readonly name: 'onSecureViewOpened'; readonly payload: {readonly cardId: string}}
  | {readonly name: 'onValidationError'; readonly payload: {
      readonly code: SecureViewErrorCode;
      readonly message: string;
    }}
  | {readonly name: 'onCardDataShown'; readonly payload: {readonly cardId: string}}
  | {readonly name: 'onSecureViewClosed'; readonly payload: {
      readonly cardId: string;
      readonly reason: SecureViewCloseReason;
    }};

export type UnsubscribeSecureView = () => void;

export interface SecureViewGateway {
  openSecureView(request: OpenSecureViewRequest): Promise<void>;
  subscribe(listener: (event: SecureViewEvent) => void): UnsubscribeSecureView;
}
```

**No duplicar estos tipos** en `shared`, en la librería ni en la pantalla. Los tipos del TurboModule son **DTOs de frontera** y las implementaciones concretas los convierten a los puertos de la capability.

### 5.1. `NativeSecureTokenProvider`

- Implementar `getOrRenewToken(cardId)` llamando al método nativo `issueSecureToken`.
- **Cada solicitud de la acción emite un token nuevo**; esto implementa renovación explícita por sustitución, **sin cachear tokens en Zustand, storage ni un estado JS prolongado**.
- Validar que `cardId` no sea vacío y que el resultado físico tenga `value: string` no vacío y `expiresAtEpochMs` numérico finito.
- El token queda **solo en una variable local efímera** durante la secuencia solicitar → abrir; no guardarlo en `useState`, `useRef` de larga duración, store, eventos, navegación, Redux, AsyncStorage, logs, crash reporting ni snapshots.
- No implementar `HMAC`, claves, construcción de token ni verificación de firmas en JavaScript.
- Al pedir una nueva emisión, la anterior **no se reutiliza**. El backend mock Kotlin puede seguir validando tokens emitidos aún no vencidos; el cliente RN usa siempre el último emitido.
- Probar con Jest que hay generación nueva en dos llamadas consecutivas y que se propaga el vencimiento nativo sin inferirlo desde el reloj JS.

### 5.2. `NativeSecureViewGateway`

- Implementar `openSecureView({cardId, secureToken}): Promise<void>` traduciendo a `IoSecureView.openSecureView(cardId, secureToken): Promise<boolean>` y a una promesa `void` exitosa cuando el módulo acepte iniciar la Activity.
- **Solo** `cardId` y token pueden entrar al método de apertura. El `secureToken` no aparece en eventos ni errores, aunque forme parte de los argumentos del bridge.
- Implementar `subscribe(listener)` registrando los **cuatro emisores tipados** del TurboModule; convertir cada emisión al discriminante `SecureViewEvent` existente y retornar una función que haga `.remove()` de todas las suscripciones.
- No utilizar un event bus global ni `DeviceEventEmitter`/`NativeEventEmitter` Legacy para sustituir eventos Codegen.
- Validar en el adapter el `code`, `reason`, forma y tipos; **no** convertir silenciosamente un código desconocido a `TOKEN_INVALID`. Un evento malformado se descarta y puede generar únicamente un diagnóstico **sin payload** en build de desarrollo.
- Los errores de infraestructura (`native module unavailable`, Activity no disponible, fallo al abrir) son **rechazos del método** y estado UI sanitizado; **no** inventar un `TOKEN_INVALID` ni alterar la unión aprobada para representarlos.
- Antes de la apertura, registrar las suscripciones necesarias. Limpiar listeners al desactivar el controlador/pantalla; la apertura rápida no debe perder `onSecureViewOpened` ni `onValidationError` por registrar tarde.
- No crear listeners por cada render o tap sin retirar los anteriores.

### 5.3. Composición y presentación

- En `src/app/composition/`, inyectar **una instancia** del proveedor y gateway en los consumidores de Cards, sin que UI o dominio importen el TurboModule directamente.
- Adaptar el control deshabilitado del Paso 03 para habilitar **«Ver datos sensibles» únicamente en Android y cuando el flujo nativo esté disponible**.
- En iOS mantener indicación honesta de «Disponible en Android; iOS pendiente» hasta el Paso 11.
- Conservar los estados, datos, navegación, tema, accesibilidad, virtualización, store Zustand y comportamiento de tabs del Paso 03.
- No introducir tokens ni estado de sesión sensible en Zustand. Es admisible un estado de UI efímero **no sensible** (por ejemplo `opening/error`) en el controlador de presentación.
- Prevenir taps dobles y aperturas simultáneas mediante guardia en la capa RN **y** Kotlin; volver a habilitar la acción al recibir `Closed` o ante fallo de emisión/apertura **previo** a una Activity abierta. `ValidationError` por sí solo mantiene el flujo bloqueado mientras la pantalla de error nativa continúa abierta. No perder el control por una Promise que resuelve antes del evento de cierre.

---

## 6. Protocolo demostrativo `secureToken`

### 6.1. Modelo de amenaza y límites

El reto autoriza un **token mock/local** y un ejemplo de firma HMAC simulada + TTL. Propuesta:

- Kotlin **emite y valida** los tokens; JS solicita y reenvía, sin conocer material de firma.
- Firmar con `HmacSHA256` de la biblioteca criptográfica estándar Java/Android (`javax.crypto.Mac`), sobre un payload demo bien definido.
- Generar una **clave efímera en memoria por proceso** mediante `SecureRandom`; no guardar secretos reales ni claves de negocio en código, Git, JS o `AsyncStorage`.
- Un nuevo proceso cambia la clave y **revoca** los tokens previos de la demo: conducta correcta y segura para este mock.
- No usar JWT, OAuth, servidor remoto, Keystore persistente, librería de cifrado externa ni infraestructura adicional para un caso de uso enteramente local.
- La firma comprueba integridad **dentro del proceso de demo**, NO identidad bancaria ni autorización contra un servidor. Un dispositivo comprometido o código manipulado podría eludirla.

### 6.2. Forma canónica del token

Formato público opaco para RN:

```text
v1.<base64url(payload UTF-8)>.<base64url(HMAC_SHA256(payload bytes))>
```

Campos conceptuales del `payload` **solo del protocolo Kotlin**:

| Campo | Significado |
| --- | --- |
| `version` | versión del formato mock (`v1`) |
| `cardId` | tarjeta autorizada para esta invocación |
| `issuedAtEpochMs` | instante de emisión según reloj nativo |
| `expiresAtEpochMs` | instante de expiración nativo (`issuedAt + 60_000`) |
| `nonce` | valor aleatorio de alta entropía para distinguir emisiones |

**Importante:** serializar el payload con un formato **canónico inequívoco**, con longitudes/delimitadores seguros y tests de ida/vuelta, sin concatenar cadenas ambiguas. `cardId` debe salir del conjunto conocido de tarjetas mock y estar validado; no permitir inyección en el payload. Si se usa JSON interno para canonicalizar, definir el orden/representación exactos o firmar directamente los bytes serializados y verificar los mismos bytes originales.

No importar un JWT parser. Limitar tamaño del token y longitud de campos, para rechazar malformados sin consumo excesivo de memoria.

### 6.3. Algoritmo de emisión

1. Validar `cardId` **contra el repositorio interno Kotlin**; un `cardId` desconocido no debe obtener una sesión sensible. Responder con rechazo sanitizado, sin revelar datos ni contenido del repositorio.
2. Obtener `nowEpochMs` de un `Clock` inyectable en tests.
3. Crear `nonce` con `SecureRandom`; crear payload con `issuedAt`, `expiresAt = issuedAt + 60_000` y `cardId`.
4. Firmar mediante `HmacSHA256` con clave efímera privada en Kotlin.
5. Entregar a JS **solo** `{value, expiresAtEpochMs}` por el método privado de emisión del TurboModule.
6. No guardar el token en logs, preferencia, base de datos, `Intent`, `savedInstanceState` ni herramientas de analytics.

### 6.4. Algoritmo de validación antes de render

Orden explícito y determinista:

1. Comprobar límites de tamaño y estructura `v1.payload.mac`; si no pasan → `TOKEN_INVALID`.
2. Decodificar Base64URL de forma estricta y parsear campos permitidos; cualquier fallo → `TOKEN_INVALID`.
3. Recalcular HMAC sobre los **bytes canónicos recibidos** y comparar firmas en tiempo constante (`MessageDigest.isEqual` o equivalente), sin comparación de strings con `==`; firma mala → `TOKEN_INVALID`.
4. Validar versión, campos/longitudes, período de emisión y TTL exacto de demo; inconsistencia → `TOKEN_INVALID`.
5. Verificar que el `cardId` del token es **exactamente igual** al `cardId` solicitado y existe en el mock Kotlin; mismatch/desconocido → `TOKEN_INVALID`.
6. Verificar que el reloj actual no es anterior a `issuedAtEpochMs` de forma anómala, y que `nowEpochMs < expiresAtEpochMs`; si se cruzó el vencimiento de un **token íntegro** → `TOKEN_EXPIRED`.
7. Solo tras validación positiva, habilitar obtención y render de datos completos en el árbol UI Android protegido.

**Precedencia de errores:** una firma alterada se considera `TOKEN_INVALID` aunque `expiresAt` ya haya pasado. `TOKEN_EXPIRED` se devuelve para un token **auténtico en la demo** cuyo TTL terminó. No incluir token, payload, MAC, claves o bytes recibidos en mensajes, logs o excepciones visibles.

**Relojes:** el TTL firmado usa `epochMs` para coincidir con `SecureToken.expiresAtEpochMs` del Paso 02. En la misma app no debe existir una discrepancia normal de relojes; un cambio manual del reloj del dispositivo puede afectar la demo y **se documenta como limitación**, sin presentarlo como seguridad productiva. El timeout de pantalla usará **otro reloj** (`SystemClock.elapsedRealtime()`), independiente de cambios de hora.

### 6.5. Casos de generación, renovación y expiración

| Caso | Resultado esperado |
| --- | --- |
| Primera petición `card_001` | token firmado mock con TTL 60 s |
| Segunda petición para igual tarjeta | token **nuevo** con nonce distinto, sin depender de cache JS |
| Token correcto antes de los 60 s | `VALID` y apertura posible |
| Token correcto a `t = expiresAtEpochMs` | `TOKEN_EXPIRED` (frontera exacta) |
| Firma modificada, payload válido | `TOKEN_INVALID` |
| `cardId` cambiado | `TOKEN_INVALID` |
| Formato malformado / longitud excesiva | `TOKEN_INVALID` |
| Tarjeta inexistente | sin render; falla de emisión o `TOKEN_INVALID` si se invoca apertura |
| Reinicio de proceso con token anterior | no validable; `TOKEN_INVALID` o fallo cerrado, sin render |

**No afirmar** protección antirreplay completa. En este mock, un token no vencido y correctamente firmado puede reutilizarse durante su TTL si no se introduce un registro de nonces consumidos (no requerido). Por simplicidad, **no** agregar un sistema antirreplay persistente; el control de una sola vista simultánea y el TTL finito acotan el escenario demostrativo, pero **no impiden la reutilización** de un token vigente ni constituyen una garantía de producción.

---

## 7. Mock de datos sensibles exclusivamente nativo

### 7.1. Repositorio Kotlin interno

- `NativeMockCardRepository` ofrece lookup por `cardId`, con un conjunto **pequeño** de tarjetas **enteramente sintéticas**.
- Puede usar un `data class NativeCardDetails(pan, cvv, expiry, holder)` **privado al código Kotlin**; nunca exportarlo ni traducirlo a `WritableMap`, `ReadableMap` o JSON de JS.
- Los valores de prueba deben ser ficticios/no asociados a clientes reales. Su contenido **no** se incluye en README, logs, capturas almacenadas, documentación de eventos o snapshots.
- Reconciliar cada `cardId`, `expiry` y **últimos cuatro dígitos** con el mock **ya enmascarado** de Paso 03. Consultar el JSON existente para realizar el mapeo, sin copiar a Kotlin propiedades sensibles reales del PDF.
- El lookup y el render del valor completo suceden **solo tras `VALID`**, dentro de la Activity y del paquete nativo. No precargar el detalle en un objeto JS ni en un ViewModel RN.
- No añadir métodos de lectura, debugging, serialización ni `getCardDetails` expuestos al bridge.

### 7.2. Invariante verificable de la frontera

```text
React Native                           Kotlin / vista nativa
--------------------------------------------------------------------
cardId, alias, maskedPan, brand      -> cardId para consulta
expiry, accountId (seguros)          -> mock PAN/CVV/titular completo
secureToken temporal (opaco)         -> validación HMAC/TTL
                                      -> render Android protegido

<- opened / validationError / shown / closed (SOLO IDs/códigos/motivos)
```

Los detalles completos pueden residir transitoriamente en objetos/vistas Kotlin mientras la ventana esté abierta: por ser `String`/`TextView`, **no prometer borrado criptográfico perfecto de memoria**. Sí limpiar los campos sensibles al ocultar/cerrar, eliminar referencias de sesión, no persistir y no transmitir al runtime JavaScript.

---

## 8. Card Secure View Android/Kotlin: interfaz y seguridad

### 8.1. UI completamente nativa

Crear una **`Activity` dedicada, no exportada**, que se muestre **a pantalla completa** sobre el Dashboard. Evitar una pantalla JSX con datos completos, un Modal RN, una WebView o un overlay en React Native; el propósito es demostrar UI Kotlin real.

La vista debe tener:

- Identidad visual compatible con el tema aprobado, sin introducir nuevas librerías de UI.
- Título descriptivo, por ejemplo **«Datos de tu tarjeta»**, y subtítulo breve sobre visualización temporal.
- Contenedor de tarjeta/accesible, mostrando **PAN completo, CVV, fecha y titular completos** únicamente en estado validado.
- Botón de cierre inequívoco **«Ocultar»**, con tamaño táctil adecuado (~48 dp), foco, semántica y contraste.
- Estado neutro de validación breve (sin datos sensibles), evitando flash previo a la protección de ventana.
- Estado de error **sin valores sensibles**, diferenciando `TOKEN_EXPIRED` de `TOKEN_INVALID` con mensajes estáticos amigables.
- Sin añadir clipboard/copy/share, campos editables, autofill, screenshots voluntarios ni exportaciones.

Se admite crear la UI programáticamente con `View`, `TextView`, `Button` y `LinearLayout` o un XML sencillo. Evitar Compose si su incorporación obliga a plugins/dependencias nuevas no justificados para una sola Activity.

### 8.2. `FLAG_SECURE`: primer requisito de ventana

- Aplicar `window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)` **antes de establecer o poblar cualquier contenido sensible**, idealmente en el inicio de `onCreate` de la `CardSecureActivity`.
- La bandera pertenece a **la ventana nativa protegida**, no a todas las pantallas RN. Al cerrarse la Activity, el Dashboard sigue operando normalmente.
- Mantenerla activada durante el estado de error, revelado, ocultación y hasta destrucción; no habilitar screenshots durante transiciones.
- Evitar ventanas emergentes no protegidas (`Dialog`/`Toast` con datos) y cualquier efecto que saque detalles a otra ventana.
- Comprobar screenshot y grabación de pantalla **en emulador/dispositivo Android**; no considerar un test JS como evidencia de `FLAG_SECURE` real.
- Documentar que `FLAG_SECURE` es una mitigación de capturas estándar, **no** una garantía frente a dispositivos rooteados, fotografías externas, instrumentación maliciosa o determinados mecanismos privilegiados de captura.

### 8.3. Protección de background: ocultar antes de reanudar

**Política elegida:** proteger de manera *fail-closed* sin ampliar las razones de cierre aprobadas. La vista de error es un estado **no terminal** mientras la Activity esté abierta; sus únicos cierres normales son `USER_DISMISS` y `TIMEOUT`.

1. En `onPause` (y como refuerzo `onStop`), ocultar **sincrónicamente** todos los `TextView`/contenedores sensibles, despejar su texto y mostrar una superficie neutral de privacidad. No depender de un callback JS asincrónico para cubrir la pantalla.
2. Mantener `FLAG_SECURE` activo incluso mientras la Activity está cubierta o en Recents.
3. El timeout de **45 segundos continúa corriendo durante background**; no se reinicia ni se pausa.
4. En `onResume`, si la sesión ya pasó los 45 s, cerrar como `TIMEOUT`; si no, **revalidar el token en Kotlin antes de cualquier nuevo render sensible**.
5. Si el token sigue válido, restaurar datos **solo tras nueva validación**. Si expiró o dejó de ser válido, emitir `onValidationError` **una sola vez por nuevo fallo**, permanecer en estado neutro de error y **no** reexponer los datos.
6. Desde el error, ofrecer **«Ocultar»** para terminar con `USER_DISMISS`. La vista de error sigue protegida y cubierta hasta ese cierre o el deadline de 45 s; **no se autocierra tras la validación fallida**. La pantalla nunca vuelve a mostrar PAN sin validación nueva.
7. Evitar que `onResume` inicial revele el contenido antes de la primera validación: ejecutar siempre el mismo gate seguro.

**Trade-off consciente:** con un token recién emitido de 60 s y sesión de 45 s, el retorno normal desde background **no debería** caducar el token antes del timeout de la vista. Si una apertura retrasada, el reloj manipulado o un test controlado provocan expiración, la vista permanece cubierta en `ERROR_HIDDEN`; para obtener un token nuevo se cierra y se vuelve a tocar «Ver datos sensibles». No introducir renovación autónoma dentro de la Activity. La expiración del token se comprueba de forma determinista en JUnit y, para demo manual, mediante un harness debug/test; **no crear una espera real de 60 s dentro de una sesión cuyo deadline es 45 s**.

**Cuidado con lifecycle:** `onPause` también puede ocurrir por rotación, overlays o multitarea. La política conservadora oculta primero y revalida antes de mostrar; si la Activity se recrea y no hay sesión viva en memoria, debe quedar **cerrada u oculta**, nunca restaurar detalles desde estado Android persistido.

### 8.4. Timeout de sesión de 45 segundos

- El controlador nativo fija `sessionDeadlineElapsedMs = SystemClock.elapsedRealtime() + 45_000` al establecer una **sesión de vista iniciada**. Precisar en el código el único punto de inicio (apertura efectiva de Activity; incluye error/validación para no dejarla indefinidamente abierta).
- Programar cierre en el **main thread** con `Handler`/`Runnable` o mecanismo nativo de igual simplicidad.
- En cualquier callback de `onResume`, `onPause`, redibujado o intento de mostrar, recalcular contra `SystemClock.elapsedRealtime()` para cubrir callbacks demorados por suspensión.
- Al alcanzar el deadline: quitar inmediatamente los textos de la vista, impedir renders posteriores, emitir `onSecureViewClosed(cardId, 'TIMEOUT')` una sola vez, y finalizar Activity.
- **45 s es un deadline absoluto de sesión**, sin extensión por taps, background, rotación o re-render; no es un `setTimeout` JS ni el TTL del token.
- Cancelar el runnable al cerrar; no dejar callbacks apuntando a una Activity destruida.
- Una vez cerrada, no reabrir ni restaurar la vista por `onResume` tardío.

### 8.5. Botón «Ocultar» y Android Back

- Botón **Ocultar**: inmediatamente limpiar y esconder detalles; emitir `onSecureViewClosed(cardId, 'USER_DISMISS')` una sola vez y hacer `finish()`.
- Android Back/gesto de retroceso en la Activity: **misma semántica que Ocultar**, respetando el comportamiento de navegación Android y las APIs compatibles con la plantilla.
- Si hay error de validación, el botón Cerrar/Ocultar termina igualmente con `USER_DISMISS`; **no** etiquetar el fallo de validación como un motivo de cierre inexistente.
- `onDestroy` por rotación o destrucción no puede emitir un segundo evento si `Ocultar`, Back o timeout ya cerraron.
- Si Android destruye el proceso, no es posible garantizar entrega posterior de un evento JS: **se documenta esta limitación** y se garantiza que no se restauran datos.

### 8.6. Disponibilidad de Activity y concurrencia

- Rechazar de forma controlada solicitudes de apertura cuando no exista `currentActivity` válida, con mensaje sanitizado y sin inventar un `TOKEN_INVALID`.
- Una sola Secure View activa a la vez. Dos taps casi simultáneos o dos llamadas directas al TurboModule **no** deben crear dos ventanas ni mezclar `cardId`/eventos.
- Se puede rechazar la segunda solicitud con error genérico o tratarla idempotentemente si es la misma sesión. Documentar la elección y probarla.
- Las operaciones de UI se ejecutan en el main thread de Android; la HMAC/parseo simple no debe bloquear perceptiblemente el thread de render. Mantener sincronización mínima de estado de sesión y no añadir coroutines solo por el reto.

---

## 9. Modelo de estado de sesión (nativo como autoridad)

No añadir una dependencia externa de state machines. Implementar transiciones explícitas, testeables, preferentemente en una clase Kotlin pequeña.

```text
                        (openSecureView aceptado)
 IDLE ----------------------------------------------------> OPENING
                                                               |
                             CardSecureActivity protegida      v
                                                         TOKEN_VALIDATING
                                                           /          \
                                            token válido /            \ inválido/expirado
                                                         v              v
                                                       VISIBLE       ERROR_HIDDEN
                                                         |              |
                                      onPause -> HIDDEN       botón/Back -> CLOSED
                                                         |
                                   onResume -> revalidar
                                      |             |
                                    válido      inválido
                                      |             |
                                      v             v
                                    VISIBLE     ERROR_HIDDEN

 Cualquier estado de Activity abierta --45 s--> CLOSED(TIMEOUT)
 VISIBLE/HIDDEN/ERROR_HIDDEN --Ocultar/Back--> CLOSED(USER_DISMISS)
```

Se permiten los nombres internos que mejor encajen; **no** se obliga a replicar literalmente estas etiquetas en el store JS. **`ERROR_HIDDEN` no se cierra automáticamente**: deja una superficie de error neutra y botón Ocultar; conserva el deadline restante. La implementación nativa decide el estado, RN refleja únicamente estados de UI no sensibles.

### 9.1. Invariantes nativos

1. `VISIBLE` solo existe si **la última decisión de revelado** validó token y cardId.
2. `HIDDEN` o `ERROR_HIDDEN` no conserva textos sensibles **visibles** en la jerarquía Android.
3. `CLOSED` es terminal para una sesión; timer y listeners se limpian.
4. Solo una sesión activa puede recibir `onCardDataShown`; no mezclar emisiones de dos aperturas.
5. `onSecureViewClosed` ocurre **a lo sumo una vez** por sesión, y exactamente una vez para un cierre manual/Back o por timeout mientras el proceso y bridge sigan vivos; un error de validación por sí solo **no** causa cierre ni emite `Closed`.
6. Nunca emitir `onCardDataShown` para validación fallida, actividad terminada o datos que no llegaron a presentarse.
7. El timeout manda sobre una reanudación tardía o pulsación simultánea: si el deadline expiró, no hay nuevo render.
8. Evitar eventos después de `CLOSED`, aunque se dispare un callback retrasado de layout, dibujo o lifecycle.

### 9.2. Precisión de `onCardDataShown`

El evento **no** equivale a «terminó la consulta del mock». Emitirlo solo cuando los datos **se hayan colocado en la vista nativa visible y exista evidencia razonable de presentación de su primer frame**, empleando el mecanismo mínimo apropiado al árbol de vistas Android (`ViewTreeObserver`/callback de dibujo one-shot o equivalente de lifecycle/layout, sin introducir infraestructura propia compleja). No considerar `post {}` por sí solo una prueba de que se dibujó el contenido. Comprobar que la Activity está en primer plano, la última validación sigue vigente para esa revelación y la sesión no está cerrada cuando se emite; retirar el observador al cerrar/ocultar. JUnit prueba la política de emisión mediante un seam; la prueba Android real comprueba visualmente el render.

**Semántica del contador:** emitir **una vez por sesión en el primer revelado efectivo**; restauraciones tras background no generan eventos repetidos de `onCardDataShown`, aunque vuelvan a validar. Si se cerró por timeout/usuario, una nueva apertura crea una nueva sesión y puede emitir nuevamente.

---

## 10. Eventos JS ↔ Kotlin: esquema, orden y errores

### 10.1. Eventos públicos, payloads exactos

| Evento Codegen | Momento | Payload permitido |
| --- | --- | --- |
| `onSecureViewOpened` | Activity protegida abierta y preparada para iniciar validación | `{cardId: string}` |
| `onValidationError` | Validación negativa inicial o tras reanudación | `{code: 'TOKEN_INVALID' \| 'TOKEN_EXPIRED', message: string}` |
| `onCardDataShown` | Primer render nativo sensible verificado de una sesión válida | `{cardId: string}` |
| `onSecureViewClosed` | Fin de sesión por Ocultar/Back o 45 s | `{cardId: string, reason: 'USER_DISMISS' \| 'TIMEOUT'}` |

**Nota:** la notación con `\|` en la tabla indica alternativas de tipo, no un valor real de string. Los payloads **no** incluyen nombres completos, PAN, CVV, expiración de token, token, HMAC, nonce, `NativeCardDetails`, stack trace, `Intent` ni blobs de errores.

Los mensajes de error deben ser **literales estáticos** y sanitizados, por ejemplo:

- `TOKEN_INVALID` → `No se pudo validar el acceso. Vuelve a intentarlo.`
- `TOKEN_EXPIRED` → `La autorización venció. Vuelve a solicitarla.`

### 10.2. Secuencias observables exigidas

| Escenario | Secuencia de eventos (una sesión) |
| --- | --- |
| Éxito + cierre manual | `Opened → CardDataShown → Closed(USER_DISMISS)` |
| Éxito + timeout | `Opened → CardDataShown → Closed(TIMEOUT)` |
| Token inválido + cierre manual | `Opened → ValidationError(TOKEN_INVALID) → Closed(USER_DISMISS)` |
| Token expirado + cierre manual | `Opened → ValidationError(TOKEN_EXPIRED) → Closed(USER_DISMISS)` |
| Vista visible → background corto → token válido | `Opened → CardDataShown`, se oculta y restaura; sin segundo `CardDataShown` |
| Vista visible → background → token vencido | `Opened → CardDataShown → ValidationError(TOKEN_EXPIRED)`, no restaura; cierre manual o timeout |
| Fallo de infraestructura antes de abrir Activity | rechazo controlado del método; **sin** `Opened`, `Shown` ni evento de validación inventado |

**Política única de error y cierre (obligatoria):** si la Activity **sí se abrió** y la validación inicial o de reentrada falla, se mantiene cubierta en `ERROR_HIDDEN`, se emite `onValidationError` una vez por intento fallido y **no se llama `finish()` automáticamente**. El usuario puede cerrar con Ocultar/Back → `onSecureViewClosed(USER_DISMISS)`; si espera hasta el deadline → `onSecureViewClosed(TIMEOUT)`. Por tanto, en una Activity abierta el evento `ValidationError` **no es terminal**, mientras que `Closed` **sí es terminal**. Si el módulo falla **antes de abrir** la Activity, `openSecureView` rechaza con error de infraestructura sanitizado y no emite eventos de sesión. No inventar un motivo `TOKEN_INVALID` de cierre ni un `Closed` ficticio para fallos de infraestructura.

**Orden y cardinalidad:** el evento de apertura precede a la validación; `onCardDataShown` ocurre como máximo una vez y solo tras `VALID`; `Closed` es terminal una sola vez. Si `onValidationError` ocurre en la reanudación **después** de un `CardDataShown` anterior, no contradice el éxito original: señala la **nueva validación de reentrada**, y la vista pasa a estado oculto. RN debe mantener el flujo en error **hasta recibir `Closed`**, salvo pérdida de Activity/proceso, que exige reconciliación segura de disponibilidad/foco sin inventar eventos.

### 10.3. Condiciones de carrera

- No emitir `Closed` antes de `Opened` para una Activity que sí abrió.
- Un timeout entre validación y primer dibujo impide `CardDataShown`.
- Un tap de Ocultar justo antes de la expiración produce **solo un** `Closed`: la primera transición terminal decide el motivo con deadline comprobado de forma determinista.
- Abrir con token inválido jamás expone un frame sensible, aun si el repositorio Kotlin reconoce el `cardId`.
- Al desmontar pantalla o reiniciar RN, el bridge debe limpiar subscripciones; la Activity sigue garantizando ocultación nativa/timeout independientemente de JS.

---

## 11. Integración funcional en «Mis productos»

### 11.1. Acción observable

Al pulsar «Ver datos sensibles» sobre cualquier tarjeta válida:

```text
CardItem onPress(cardId)
  -> bloquear doble tap / estado opening (sin token)
  -> registrar listeners del SecureViewGateway
  -> SecureTokenProvider.getOrRenewToken(cardId)
  -> SecureViewGateway.openSecureView({cardId, secureToken: token.value})
  -> Kotlin recibe y coordina Activity privada
  -> ventana con FLAG_SECURE
  -> evento Opened
  -> validación HMAC/TTL/cardId Kotlin
     -> válido: render SOLO Kotlin, emitir CardDataShown
     -> inválido/expirado: UI neutra, emitir ValidationError
  -> Ocultar / Back / 45 s -> Closed
  -> limpiar listeners, flags de UI y token local temporal
```

- `CardsScreen` **no** debe abrir Activity mediante `Intent`, `NativeModules`, `TurboModuleRegistry` ni rutas de React Navigation. Usa solamente los puertos de Cards o una coordinación de aplicación/presentación que los consuma.
- La pantalla RN **permanece con PAN enmascarado** durante y después del flujo.
- El botón debe estar habilitado Android, a11y correcto, y deshabilitado durante la solicitud/apertura activa. Ante fallo, recuperar estado de acción sin necesitar reiniciar la app.
- No convertir los errores de validación en alertas que repitan tokens/detalles. Es admisible que la vista nativa muestre el mensaje y que RN registre solo el estado de error no sensible para cuando regresa a Mis productos.
- La navegación entre tabs no debe forzar nuevos fetches de tarjetas ni perder el store seguro; los datos completos nunca se integran al estado RN.
- No cambiar `cards.json` del Paso 03 salvo corregir coherencia de `cardId`/vencimiento en el **mock Kotlin**, sin introducir información completa en JS.

### 11.2. El contrato de aplicación es más estricto que Codegen

`OpenSecureViewRequest` del Paso 02 contiene **exactamente** `{cardId, secureToken}`. Codegen puede representarlos como **dos parámetros primitivos** para interoperabilidad, pero el gateway público mantiene el **objeto tipado original** y devuelve `Promise<void>`. Esa adaptación es una decisión de infraestructura documentada, **no** cambio de dominio.

### 11.3. Error de disponibilidad de módulo

- iOS (aún no implementado): mostrar estado y mensaje de funcionalidad pendiente, sin crash.
- Android sin módulo por un error de configuración: tratar como **falla del build/integración**, no ocultarla como un flujo normal aprobado. El adapter puede degradar controladamente para que no se cierre la app, pero el DoD permanece **BLOQUEADO** hasta arreglar el módulo real.
- No abrir fallback en React Native que muestre detalles completos para aparentar funcionalidad cuando el bridge falla.

---

## 12. Seguridad, logging, almacenamiento y límites reales

### 12.1. Prohibiciones verificables

**Nunca** incluir en capa JS, scripts de prueba, snapshots, logs ni eventos:

- PAN completo, CVV o titular completo (ni equivalentes reetiquetados).
- `NativeCardDetails` o un DTO que los contenga.
- Valor de `secureToken`, firma HMAC, nonce o clave en logs, estado global, analytics o snapshots.
- Dumps de `request`, `Promise` rechazada con argumentos, `Intent`, JSON bruto, stack traces que incluyan payloads, `console.log`/`Log.d` del detalle.
- Uso de `AsyncStorage` o persistencia para token o datos completos.
- Claves reales de BCP, credenciales, secretos de producción o conexión a backend no solicitado.

**Excepción necesaria y acotada:** el requisito oficial **sí exige que JavaScript entregue `secureToken` al bridge**. Por tanto, el token **atraviesa JS temporalmente en una variable local**, pero **no** debe quedar en un store, almacenamiento, mensajes, snapshots ni logs. No prometer que JS desconoce el token: lo conoce efímeramente para cumplir `openSecureView(cardId, secureToken)`.

### 12.2. Mock no equivale a sistema de seguridad productivo

Explicar en README y sustentación:

- La emisión y verificación están en **el mismo dispositivo/proceso**; no prueban autenticación bancaria real ni autorización server-side.
- HMAC-SHA256 se usa como **integridad de un token mock local**, no como mecanismo antifraude ni credencial de un banco.
- La clave se genera en memoria y cambia tras reiniciar el proceso; no existe una raíz de confianza remota.
- Los mocks completos están dentro del binario nativo y por tanto pueden extraerse mediante análisis del APK o instrumentación; nunca deben contener datos reales.
- `FLAG_SECURE` y ocultación en lifecycle reducen capturas/preview por las APIs estándar, pero no previenen una cámara externa ni extracción en dispositivo comprometido.
- Evitar afirmar cumplimiento de PCI DSS, protección contra hooking/root, secret zeroization total o equivalencia con pagos productivos.
- **Secure storage:** al no persistir token ni detalles, no existe secreto que necesite almacenarse persistentemente. No añadir Keystore/EncryptedSharedPreferences solo para marcar una casilla; documentar por qué la no persistencia es la decisión de demo.

### 12.3. Comprobación de leaks y datos residuales

- Limpiar `TextView.text` y visibilidad en ocultación/cierre, eliminar referencias al detalle y al objeto de sesión, quitar callbacks/timers.
- Evitar guardar información completa en `savedInstanceState`, `onSaveInstanceState`, preferencias, `Bundle` o excepciones.
- Verificar que después de cerrar y volver al Dashboard, la pantalla RN continúa mostrando solo masked PAN y fecha.
- No crear screenshots de UI desprotegida ni capturas que incluyan datos completos para evidencia/versionado.

---

## 13. Testing Jest / RNTL (React Native)

Extender, **no reemplazar**, las pruebas del Paso 03. El suite debe seguir ejecutándose mediante `npm test -- --watch=false` o script efectivo.

### 13.1. Emisión y renovación de token

1. `getOrRenewToken(cardId)` invoca `issueSecureToken` con el `cardId` correcto.
2. Propaga `value` y `expiresAtEpochMs` sin reconstruir firma/TTL JS.
3. Dos invocaciones producen **dos emisiones**; la implementación no reutiliza token viejo desde Zustand/cache persistente.
4. Respuesta Codegen malformada o caducidad ausente → error controlado sin volcar payload.
5. Módulo no disponible → error seguro, sin PAN/CVV/titular ni exposición de token.
6. El store Zustand sigue sin propiedades para token ni datos completos.

### 13.2. Gateway, eventos y callbacks

7. `openSecureView({cardId, secureToken})` llama a `openSecureView(cardId, secureToken)` y traduce la promesa física a `Promise<void>`.
8. Rechazo de apertura/corrupción de módulo → estado UI de error seguro y recuperación de botón.
9. `subscribe` construye los cuatro `SecureViewEvent` **exactos** con payloads permitidos.
10. `TOKEN_EXPIRED` y `TOKEN_INVALID` preservan sus códigos; mensajes estáticos y no sensibles.
11. `USER_DISMISS` y `TIMEOUT` preservan razones de cierre.
12. Eventos con reason/code desconocidos se descartan según política explícita sin transformaciones engañosas.
13. `unsubscribe` llama a `.remove()` de los cuatro listeners; no hay duplicación al remount o reapertura. Verificar además que `ValidationError` **no** desbloquea un flujo cuya Activity sigue abierta: solo `Closed` o fallo de apertura pre-Activity permiten iniciar otra sesión.
14. Un segundo `subscribe`/`unsubscribe` no deja listeners de la primera sesión activos.

### 13.3. Integración de Mis productos

15. El botón Android «Ver datos sensibles» aparece habilitado y ejecuta **primero emisión de token, luego apertura**.
16. El `cardId` de la tarjeta seleccionada se usa en ambas invocaciones; no se extrae desde `maskedPan`.
17. Dos taps rápidos no generan aperturas simultáneas; se recupera estado tras fallo de emisión/apertura o tras `Closed`. Un `ValidationError` con Activity todavía abierta **no libera la guardia** de sesión.
18. Se mantiene render de alias, masked PAN, brand, MM/AA y las otras cuentas/tarjetas del Paso 03.
19. En iOS sin implementación nativa, control y copy correctos; no se intenta `getEnforcing` ni se muestra una vista insegura.
20. Los tests no capturan, serializan ni imprimen **el token completo**: usar dobles con valor opaco breve y assertions booleanas/llamadas sin snapshots o errores que lo vuelquen. **No** utilizar PAN/CVV/titular completos siquiera ficticios en fixtures JS.
21. Mantener pruebas de loading/empty/error, navegación, store y tabs del Paso 03 verdes.

**Guía de mocks:** mockear el **módulo físico** (`IoSecureView`) en infraestructura o inyectar una API nativa tipada; no mockear los puertos públicos de forma que los adapters reales queden sin probar. Para la pantalla usar puertos falsos inyectados y comprobar la secuencia.

---

## 14. Testing JUnit / Android

Usar la infraestructura JUnit prevista por la plantilla/Gradle del paquete; introducir `junit` de test solo si el proyecto nativo aún no lo tiene. Prefiera clases **sin Android Context** para la mayoría de escenarios.

### 14.1. Token: tests deterministas con `Clock` y `NonceSource` falsos

1. Token generado tiene estructura/campos válidos y expiración = emisión + 60 000 ms.
2. Token se valida correctamente antes de la frontera TTL.
3. A `now == expiresAtEpochMs`, resultado **`TOKEN_EXPIRED`**.
4. Un milisegundo antes de expirar, **VALID**.
5. Alterar un byte de MAC → `TOKEN_INVALID`.
6. Alterar `cardId` en payload firmado → `TOKEN_INVALID`.
7. Verificar token de `card_001` solicitando `card_002` → `TOKEN_INVALID`.
8. Strings vacíos, segmentos extra, Base64URL inválido, versión desconocida, tamaño excesivo → `TOKEN_INVALID`.
9. `issuedAt` en futuro o TTL manipulado → `TOKEN_INVALID`.
10. Solicitudes sucesivas dan nonces/valores distintos; nuevo token válido, sin cache obligatoria.
11. Clave diferente tras reinicio simulado invalida un token previo, sin exponer secretos.
12. Tarjeta no conocida no entrega datos ni permite sesión válida.

**No introducir sleeps de 60 s**: avanzar relojes falsos. El test **no imprime token ni MAC** cuando falla; usar asserts sobre resultados/códigos, evitando interpolar valores sensibles en mensajes de assertion.

### 14.2. Sesión, tiempo y eventos

13. La transición `OPENING → VALIDATING → VISIBLE` solo ocurre tras autorización.
14. Token inválido/expirado produce evento de validación sin `CardDataShown`; conserva `ERROR_HIDDEN` sin emitir `Closed` hasta Ocultar/Back o timeout.
15. Apertura correcta produce un `onSecureViewOpened` y un `onCardDataShown` únicamente después de confirmar el primer render nativo por mecanismo testeable y sencillo.
16. Ocultar y Back finalizan una vez con `USER_DISMISS`.
17. Deadline 45 000 ms termina con `TIMEOUT`; a 44 999 ms aún no.
18. Timeout sigue aplicando aunque la sesión haya pasado a `HIDDEN`.
19. Timeout y Ocultar simultáneos producen **un solo** `Closed`, ningún evento posterior.
20. Cierre antes del callback de render evita `CardDataShown` tardío.
21. Background oculta el contenido; retorno revalida; token expirado impide reexposición.
22. Una sesión cerrada limpia timer y no se reabre al recibir eventos de lifecycle tardíos.
23. Intento de segunda sesión simultánea no cruza cardIds ni genera segunda Activity activa.
24. El **event mapper/sink** nativo construye payloads permitidos, sin PAN/CVV/titular/token.
25. Un `onValidationError` posterior a `CardDataShown` puede ser válido tras reanudación, pero el contenido queda oculto.

### 14.3. Qué cubre JUnit vs ejecución Android real

- **JUnit JVM** cubre HMAC mock, TTL, validación, transiciones, deadline y políticas de emisión mediante reloj/scheduler/event sink falsos.
- El **compilado del TurboModule** prueba que la firma Kotlin coincide con la clase real Codegen; tests Jest verifican la adaptación JS.
- La **Activity, `FLAG_SECURE`, lifecycle en OS, dibujo real, Android Back y el bloqueo de screenshots** requieren además **emulador/dispositivo** y evidencia manual. No afirmar que un unit test puro verifica la captura del sistema operativo.
- Instrumentation test Android (`connectedAndroidTest`) es opcional si existe un entorno y añade valor con costo razonable; no bloquear injustificadamente por no crear Robolectric, Espresso o una suite E2E no solicitada.

---

## 15. Validaciones reproducibles: CLI y dispositivo

### 15.1. Inspección de dependencias y autolinking

Desde la raíz:

```bash
node --version
npm --version
npm ls react-native io-native-components
npx react-native config
node -p "require('./package.json').dependencies['react-native']"
git status --short
git diff --check
```

En `react-native config`, confirmar que aparece `io-native-components`, con ruta Android correcta, y que **no** hay doble registro. Si la salida JSON contiene rutas locales u otros datos del usuario, **no publicarla completa** en README; anotar solo el resultado pertinente.

### 15.2. Codegen y compilación Kotlin

```bash
cd android
./gradlew generateCodegenArtifactsFromSchema
./gradlew :app:assembleDebug
# Identificar primero el nombre Gradle REAL de la librería con ./gradlew projects.
./gradlew projects
# Ejecutar el test task de la librería con su nombre efectivo; por ejemplo:
./gradlew :io-native-components:testDebugUnitTest
cd ..
```

El último nombre de proyecto es **orientativo**: autolinking puede cambiar el path real. **No declarar PASS si ese task no existe**; descubrir el nombre real mediante `./gradlew projects` y registrar el comando correcto. Comprobar físicamente **schema/clase base y métodos generados** de la versión instalada (sin editar código generado). Si un `Promise<object>` falla por Codegen, adaptar la **spec física** conservando el puerto de aplicación y documentar el motivo.

### 15.3. Calidad JS y pruebas

```bash
npm run lint
npm run typecheck
npm run format:check
npm test -- --watch=false
npm test -- --coverage --watch=false
npm run test:all                     # obligatorio: Jest + JUnit en un solo comando
```

El reporte de cobertura React Native se genera **si ya es compatible** con el runner. Mantener las pruebas verdes y registrar porcentaje real; **no imponer todavía 70 % global** como gate del Paso 04: esa meta se cierra en el Paso 07. No permitir que JUnit reemplace las pruebas obligatorias Jest.

**Obligatorio en este paso:** agregar en el `package.json` raíz un script **`test:native:android`** que ejecute el task JUnit **real** del módulo Android de la librería y un script **`test:all`** que encadene Jest + JUnit **en una sola invocación**. Ejemplo conceptual, ajustando el path real descubierto con `./gradlew projects`:

```json
{
  "scripts": {
    "test:native:android": "cd android && ./gradlew :io-native-components:testDebugUnitTest",
    "test:all": "npm test -- --watch=false --runInBand && npm run test:native:android"
  }
}
```

El ejemplo **no es para sobrescribir** otros scripts; la ruta Gradle es orientativa. **El orden es secuencial y falla todo el comando si falla Jest o JUnit** (`&&`), sin instalar orquestadores, ni falsificar un PASS. `npm test` debe seguir funcionando por separado. En Windows, adaptar los scripts al sistema real sin romper el repositorio; en el entorno macOS/Unix del reto, estos comandos son suficientes si el task existe.

### 15.4. Runtime Android real

```bash
adb devices
npm run android
```

`npm run android` solo **PASS** si compila, instala y abre el Dashboard real. Probar tarjeta y eventos en **emulador/dispositivo** con Android API level documentado. No basta con Metro/TypeScript compilar.

**Matriz manual mínima:**

| Escenario | Procedimiento | Evidencia de PASS |
| --- | --- | --- |
| Apertura | Mis productos → Ver datos sensibles | Activity nativa full screen, evento `Opened` |
| Validez | token emitido al tocar | PAN/CVV/titular **solo** en Activity; `CardDataShown` |
| Ocultar | presionar botón | volver a Dashboard; `Closed(USER_DISMISS)` |
| Android Back | volver a abrir y presionar Back | igual a Ocultar; sin sesión residual |
| Timeout | mantener abierta 45 s | se oculta/cierra; `Closed(TIMEOUT)` único |
| Screenshot | intentar captura dentro de Activity | captura bloqueada/negra por `FLAG_SECURE` según dispositivo |
| Grabación | grabar pantalla durante Activity | contenido sensible protegido según API Android usada |
| Background | Home/Recents mientras visible | contenido se cubre inmediatamente; sin card data en preview |
| Retorno temprano | regresar antes de 45 s con token vigente | nueva validación antes de redibujar |
| Retorno tras background dentro de sesión | Home/Recents y volver antes del deadline de 45 s con token aún válido | revalida y revela solo tras validación; no duplica `CardDataShown` |
| Caducidad de sesión en background | Home, esperar >45 s y regresar | cierre `TIMEOUT`, nunca restaurar dato |
| Token inválido | harness de test/dev o invocación controlada | `TOKEN_INVALID` y cero `CardDataShown`; Activity queda cubierta hasta Ocultar/Back o timeout |
| Token expirado | harness debug/test que emite y reenvía un token con más de 60 s o reloj falso en JUnit | `TOKEN_EXPIRED` y cero `CardDataShown`; no esperar 60 s dentro de una Activity de 45 s |
| Segundo tap | taps rápidos / llamadas controladas | una Activity y una sesión; sin cruces de IDs |
| Regresión de tabs | volver a RN y cambiar tabs | estado de productos intacto, Beneficios sigue placeholder |

**Escenarios inválido/expirado sin producción contaminada:** se pueden reproducir con tests deterministas y, para sustentación manual, con un **harness controlado exclusivamente de debug/test** que invoque el API del paquete con tokens alterados o retrasados. Nunca habilitar un backdoor productivo para saltar validación, inyectar PAN/CVV desde RN, registrar tokens ni ofrecer acceso a secretos. Si se crea un harness temporal, aislarlo de release y explicar cómo usarlo; evitar un panel genérico de debug sobreingenierizado.

### 15.5. Verificación de capturas y logs

Para la prueba de captura, utilizar una carpeta **temporal ignorada por Git**, solo para inspección local; **no adjuntar screenshots de datos completos** al README ni al repositorio. Ejemplo orientativo:

```bash
# Mientras la Activity segura está visible:
adb shell screencap -p /sdcard/io_secure_check.png
adb pull /sdcard/io_secure_check.png /tmp/io_secure_check.png
adb shell rm /sdcard/io_secure_check.png
# Inspeccionar visualmente el archivo temporal y eliminarlo tras verificar.
```

No ejecutar una inspección de logs que **imprima PAN/token** en terminal o copie dumps al reporte. Un procedimiento seguro es borrar el buffer (solo si se tiene permiso), ejecutar escenario y comprobar **por búsqueda booleana sin imprimir coincidencias** contra patrones de test conocidos, además de revisión estática de `Log.*`/`console.*`. No usar una búsqueda textual ciega sobre documentación como prueba suficiente de ausencia de filtraciones.

### 15.6. Regresión iOS (sin desarrollo Swift)

Si el entorno macOS tiene Xcode, CocoaPods y simulador/dispositivo disponibles:

```bash
npm run ios
```

Validar que el Dashboard anterior siga abriendo, que ambas tabs naveguen y que la acción de Secure View en iOS indique indisponibilidad sin invocar el TurboModule ni romper la importación del paquete local. Si se requiere `pod install`, seguir el mecanismo real del repositorio y registrar el comando; **no** crear Swift ni un podspec engañoso. Un error de código provocado por el paquete debe corregirse; la falta efectiva de herramientas/dispositivos se informa como **NO EJECUTADO**, sin inventar evidencia.

### 15.7. Diferenciar PASS, FAIL y NO EJECUTADO

- **PASS:** comando o escenario se ejecutó realmente y mostró evidencia verificable.
- **FAIL:** ejecución realizada con error o comportamiento fuera de especificación; incluir causa raíz, sin datos sensibles.
- **NO EJECUTADO:** no hubo dispositivo/toolchain, o la prueba era opcional; indicar por qué.
- **BLOQUEADO:** falta un requisito imprescindible (p. ej., Android no compila o `FLAG_SECURE` no funciona). No cerrar el Paso 04 por checks JS verdes si Android nativo está roto.

---

## 16. Plan de implementación para el implementador — tareas en orden

### Tarea A — Inspección y diagnóstico del repo

1. Identificar archivos reales y scripts, versión exacta RN 0.88.0, proyecto Gradle, firma real de puertos y implementación UI del Paso 03.
2. Guardar `git status --short` previo y evitar revertir modificaciones ajenas.
3. Revisar guía oficial **de la versión instalada** para módulos, eventos y Codegen.
4. Registrar qué módulos Android existen y qué configuración puede reutilizarse; no reinstalar React Native.

### Tarea B — Crear una única librería local y configurar autolinking

1. Crear paquete mínimo `packages/io-native-components` con `package.json`, `src/index.ts`, spec y Android Gradle/manifest.
2. Añadir `file:./packages/io-native-components` como dependencia npm local, actualizar lockfile único.
3. Verificar `npx react-native config`; resolver discovery sin duplicar registro.
4. Ejecutar Codegen; verificar clases reales y tipos. Solo continuar si compila la spec RN 0.88.

### Tarea C — Implementar token mock Kotlin

1. Emisor HMAC-SHA256 con clave efímera, nonce, cardId y `60_000` ms.
2. Validador estrictamente tipado con formato/firma/TTL/cardId y códigos oficiales.
3. Reloj y fuente de nonce inyectables para JUnit; no usar esperas reales de 60 s.
4. Repositorio Kotlin privado y sintético coherente con cards públicos.
5. JUnit de casos positivos, negativos y límites del TTL; sin logs de tokens.

### Tarea D — Implementar TurboModule y controller nativo

1. `BaseReactPackage` y módulo Kotlin contra clase Codegen generada.
2. Métodos de emisión/apertura, coordinación de sesión y disponibilidad Activity.
3. Event sink con **cuatro** métodos tipados Codegen.
4. Control de doble apertura, timer monotónico, cierre idempotente y limpieza.
5. JUnit de transiciones, deadline, cardinalidad y eventos sin payload sensible.

### Tarea E — Construir Activity segura

1. Declaración `exported=false`, UI full screen, `FLAG_SECURE` **antes** de render sensible.
2. Apertura y validación obligatoria en Kotlin; obtener detalles solo después de `VALID`.
3. `onCardDataShown` tras primer frame nativo confirmado mediante mecanismo mínimo y testeable, sin callback/framework de dibujo propio innecesario.
4. Ocultar/Back, pantalla neutral de error **sin cierre automático tras `ValidationError`**, background con limpieza y revalidación en resume.
5. Timeout 45 s continuo y manejo de rotación/recreación fail-closed.
6. Probar que no hay fugas por `Intent`, `savedInstanceState`, logs o eventos.

### Tarea F — Adaptar puertos de Cards e integrar UI

1. Crear `NativeSecureTokenProvider` y `NativeSecureViewGateway` en infraestructura de Cards.
2. Configurar instancias en `app/composition`, sin dependencias invertidas.
3. Habilitar botón en Android; secuencia solicitar/renovar token → abrir Activity nativa.
4. Suscribir antes de abrir, retirar listeners correctamente, manejar errores sin datos completos y bloquear doble tap.
5. Mantener iOS sin crash y UI marcada pendiente; ejecutar build/regresión iOS si el entorno está disponible; mantener Beneficios placeholder.
6. Añadir pruebas Jest/RNTL del provider, gateway, secuencias y UI.

### Tarea G — Validar, corregir, documentar y detenerse

1. Ejecutar lint/typecheck/format/Jest/JUnit, **`npm run test:all`**, Codegen y build Android con logs sanitizados.
2. Probar con emulador/dispositivo el flujo real, `FLAG_SECURE`, background, timeout y cierres; no depender de que el token expire espontáneamente antes de 45 s.
3. Ejecutar pruebas de invalid/expired con reloj falso y harness controlado cuando proceda.
4. Revisar diff completo, `git diff --check`, imports y ausencia de datos sensibles fuera Kotlin.
5. Actualizar README **solo con lo implementado**: paquete, APIs, eventos, estados, comandos, limitaciones y verificación de seguridad.
6. Entregar reporte del apartado 20, incluyendo resultado de regresión iOS y `npm run test:all`, y **NO continuar al Paso 05**.

---

## 17. Definition of Done — Paso 04

> Los 60 criterios están marcados `[x]` con evidencia real. El propietario restauró cuatro criterios el 5 nov 2026 y se comprobaron uno por uno.

**Registro final (5 nov 2026):** `npm ls` muestra `io-native-components@0.1.0` enlazado y RN `0.88.0`; `react-native config` detecta Android y no iOS. Gradle Codegen generó `NativeIoSecureViewSpec` en `packages/io-native-components/android/build/generated/source/codegen/java/com/ioproductsbenefits/nativecomponents/`. El propietario reportó `:app:assembleDebug` con `BUILD SUCCESSFUL` y `npm run test:all` con `BUILD SUCCESSFUL`; los XML locales de la última corrida registran 3 tests de token y 5 de coordinación de sesión sin fallos. Tras ampliar las transiciones nativas, el propietario repitió `npm run test:all` y obtuvo `BUILD SUCCESSFUL` con 26 Jest y 8 JUnit durante la instrumentación; el error intermedio de visibilidad Kotlin quedó corregido. La traza y el botón de diagnóstico se retiraron después; en el código final `npm run lint`, `npm run typecheck`, `npm run format:check`, Jest (25 tests) y `git diff --check` pasaron. El propietario mostró la Activity nativa Android tras pulsar «Ver datos sensibles» y confirmó el cierre automático a los 45 segundos con la versión anterior al ajuste. Para la captura Android, `adb pull` descargó un PNG del Dashboard de 164 647 bytes; con la Activity sensible visible, `adb shell screencap -p /sdcard/secure2.png` produjo un archivo de 0 bytes y el propietario confirmó el momento de la captura. Se registra **captura bloqueada en este emulador**, sin inferir protección de la captura de macOS ni de otros dispositivos. Tras `npm run test:all` verde, el propietario ejecutó la app Android recompilada y confirmó que apertura, Ocultar, Back y cierre automático a los 45 s funcionan. El propietario confirmó que Home/Recientes no mostró datos y que el retorno respetó la revalidación o cierre por deadline en Android. El propietario ejecutó iOS: Mis productos y Beneficios abren sin crash; Mis productos mantiene datos enmascarados y muestra «iOS pendiente». Un intento de `screenrecord` durante la Activity produjo un MP4 negro de 0 segundos y 10 958 bytes; la misma herramienta grabó 5 segundos del Dashboard, según confirmó el propietario. Se registra grabación bloqueada en este emulador, sin generalizar a otros dispositivos. Las secuencias internas de eventos se observaron con una traza solo de desarrollo y sin datos sensibles: cierre manual, timeout y error de token inválido.

### 17.1. Integración nativa y compatibilidad

- [x] Existe **una sola** librería `packages/io-native-components` con namespace consistente y dependencia npm local registrada.
- [x] `npm ls` y `npx react-native config` identifican el paquete sin registro duplicado.
- [x] React Native se conserva en **0.88.0**, New Architecture/Hermes habilitados y lockfile npm único coherente.
- [x] `codegenConfig` correcto (`type: modules`, `jsSrcsDir`, `javaPackageName`) en la librería.
- [x] Codegen se ejecutó exitosamente y se verificaron schema, clase base y métodos/eventos generados de `IoSecureView`.
- [x] Kotlin implementa el **Turbo Native Module generado**, registrado mediante `BaseReactPackage`/autolinking real.
- [x] No se emplean `NativeModules` Legacy, bridges de terceros ni Fabric/Google Maps anticipados.
- [x] La app Android recompila, instala y abre sin crashes por integración de la librería.
- [x] Proyecto iOS no fue roto por importación de módulo inexistente; se ejecutó regresión iOS si el entorno permitió (o se reportó NO EJECUTADO con motivo); no se agregó Swift ni un módulo falso.

### 17.2. Contratos y arquitectura

- [x] Se reutilizan sin duplicar `SecureTokenProvider` y `SecureViewGateway` del Paso 02.
- [x] `NativeSecureTokenProvider` emite/renueva sin firmar desde JS ni cachear tokens globalmente.
- [x] `NativeSecureViewGateway` adapta las dos operaciones Codegen a `getOrRenewToken` y `openSecureView({cardId, secureToken}): Promise<void>`.
- [x] Los cuatro eventos tipados se convierten al `SecureViewEvent` discriminado original con los payloads exactos.
- [x] Cada suscripción se elimina por completo con su función `unsubscribe`.
- [x] `CardsScreen`/`CardItem` consumen puertos y composición, **no** TurboModule o Android SDK directamente.
- [x] Benefits, domain y shared siguen respetando fronteras aprobadas; sin cambios de arquitectura injustificados.

### 17.3. Token y datos sensibles

- [x] El emisor mock Kotlin genera tokens nuevos con nonce, HMAC-SHA256 y TTL **60 s**; no hay secreto productivo hardcodeado.
- [x] Validador Kotlin implementa formato, firma, cardId y expiración antes de render sensible.
- [x] `TOKEN_INVALID` para formato/firma/cardId no válidos; `TOKEN_EXPIRED` para token íntegro vencido.
- [x] La librería usa **solo mocks Kotlin internos** con PAN completo, CVV y titular sintéticos.
- [x] El mock Kotlin coincide en ID, fecha y últimos cuatro dígitos con el mock RN enmascarado existente.
- [x] No hay PAN completo/CVV/titular completo en JS, JSON, props, eventos, Zustand, fixture/snapshot JS o README.
- [x] El token opaco atraviesa JS **solo efímeramente** al invocar el gateway; no se persiste, loguea ni almacena en estado UI/global.
- [x] No se introdujeron keys reales, AsyncStorage de secretos, backends ni mecanismos falsamente llamados productivos.

### 17.4. Secure View, ciclo de vida y protección

- [x] `CardSecureActivity` es una vista Kotlin **full screen**, `android:exported="false"`, con diseño consistente y botón «Ocultar».
- [x] Se aplica `FLAG_SECURE` **antes** de representar datos; captura y grabación probadas en Android real/emulador.
- [x] Token inválido o expirado **nunca** produce un frame sensible ni `onCardDataShown`.
- [x] Al ir a background se quitan y ocultan inmediatamente textos sensibles y se conserva `FLAG_SECURE`.
- [x] Al regresar se comprueba deadline y **se revalida** token antes de cualquier nuevo render; expiración posterior impide restauración. Con TTL 60 s/sesión 45 s, la expiración de token se fuerza solo en harness/test si es necesario.
- [x] Timeout **45 s** se mide con reloj monotónico, continúa en background y cierra con `TIMEOUT`.
- [x] Ocultar/Android Back cierran con `USER_DISMISS`; recursos/timers se limpian.
- [x] Cierre/eventos son idempotentes; `ValidationError` no cierra automáticamente; sin `Closed` doble ni `Shown` posterior a cierre.
- [x] Una sola sesión activa; taps repetidos no producen dos ventanas ni cruce de tarjetas.
- [x] No se restauran detalles desde estado Android tras recreación/proceso muerto.
- [x] La Activity no pasa PAN/CVV/titular por intents, bridge, logs ni error messages.

### 17.5. UI funcional y eventos

- [x] «Ver datos sensibles» se habilita en tarjetas Android y envía el `cardId` exacto seleccionado.
- [x] El usuario observa `Opened → CardDataShown → Closed(USER_DISMISS)` en flujo exitoso manual.
- [x] Flujo exitoso sin intervención culmina en `Closed(TIMEOUT)` alrededor de 45 s.
- [x] Flujo inválido da `ValidationError(TOKEN_INVALID)` sin `Shown`; mantiene Activity cubierta hasta Ocultar/Back o timeout, con `Closed` único.
- [x] Flujo expirado da `ValidationError(TOKEN_EXPIRED)` sin `Shown`; se verifica con reloj falso/harness reproducible, sin esperar 60 s dentro de una sesión de 45 s.
- [x] Cada evento lleva únicamente los campos permitidos; los desconocidos se tratan sin normalizaciones engañosas.
- [x] La pantalla RN retorna a datos enmascarados, mantiene tabs/estado y maneja errores de módulo de forma segura.
- [x] iOS sin módulo nativo muestra indisponibilidad controlada y no una Secure View JS insegura.

### 17.6. Pruebas, comandos y documentación

- [x] Pruebas Jest para emisión/renovación/errores de token y bridge con TurboModule mockeado.
- [x] Pruebas Jest para los cuatro eventos, suscripciones, limpieza, errores y flujo del botón.
- [x] JUnit para HMAC válido, expiración exacta **a 60 s**, firma alterada, token malformado y cardId incorrecto.
- [x] JUnit para timeout, cierre manual, carreras, lifecycle simulado y emisión sin datos sensibles.
- [x] Tests preexistentes del Paso 03 siguen verdes y no se agregaron snapshots sensibles.
- [x] `npm run lint` — **PASS real**.
- [x] `npm run typecheck` — **PASS real**.
- [x] `npm run format:check` — **PASS real**.
- [x] `npm test -- --watch=false` **y `npm run test:all` (Jest + JUnit)** — **PASS real**; ambos scripts documentados y sin saltarse fallos.
- [x] Gradle Codegen — **PASS real**.
- [x] Test task JUnit de librería — **PASS real**.
- [x] `:app:assembleDebug` — **PASS real**.
- [x] `npm run android` — compilación, instalación y flujo manual **PASS real**.
- [x] `git diff --check` y revisión de diff sin filtraciones ni cambios fuera de alcance.
- [x] README actualizado con API pública, eventos, ciclo de sesión, seguridad demostrativa, instalación/test, evidencia y limitaciones.
- [x] Reporte final incluye comandos exactos, dispositivos, versiones, PASS/FAIL/NO EJECUTADO y bloqueos.
- [x] No se adelantaron `CustomMap`, beneficios, carrusel, Swift, Firebase ni publicación.

**Restauración del DoD (5 nov 2026):** el propietario pidió reponer los cuatro controles retirados y validarlos uno por uno. El primer control pasó: una captura del emulador Android mostró la traza de desarrollo `onSecureViewOpened → onCardDataShown → onSecureViewClosed(USER_DISMISS)` tras pulsar Ocultar, sin datos sensibles en la traza. Una segunda captura mostró `onSecureViewOpened → onCardDataShown → onSecureViewClosed(TIMEOUT)` tras esperar el cierre automático. El harness solo de desarrollo mostró la Activity cubierta con error seguro y la traza `onSecureViewOpened → onValidationError(TOKEN_INVALID) → onSecureViewClosed(USER_DISMISS)` sin `Shown`. La suite JUnit ampliada pasó con 5 tests de coordinación y 3 de token, sin fallos; el propietario reportó `npm run test:all` y `npm run android` exitosos tras la refactorización Kotlin. La traza y el botón de prueba se retiraron de la pantalla tras guardar la evidencia; no hay UI de diagnóstico en la versión final. Estado final: **60/60**.

**Condición de cierre:** Android tiene que abrir una **Activity nativa realmente protegida** tras validar un token mock, permitir los cuatro eventos, cerrar de forma confiable, proteger background/screenshot y conservar límites de datos. Requiere Codegen, Gradle, Jest, JUnit y validación real de Android. **Si falla una verificación de seguridad o compilación Android, el Paso 04 está BLOQUEADO, aunque el resto de los checks pase.**

---

## 18. Matriz de trazabilidad hacia enunciado, baseline y pasos

| Requisito | Fuente | Evidencia del Paso 04 |
| --- | --- | --- |
| Librería nativa propia única | PDF págs. 1, 3; baseline secc. 2 | Paquete `io-native-components` Kotlin |
| Tap de tarjeta solicita/renueva token | PDF pág. 2 | `SecureTokenProvider`, botón real |
| `openSecureView(cardId, secureToken)` | PDF págs. 2, 5; Paso 02 secc. 5.7 | Gateway y TurboModule |
| Full screen y validación previa | PDF pág. 4 | `CardSecureActivity` + gate nativo |
| PAN/CVV/titular solo nativo | PDF págs. 2, 4; Paso 02 secc. 5.2 | Mock Kotlin + ausencia en JS |
| HMAC mock y TTL | PDF pág. 4; baseline secc. 9 | JUnit token + flujo en vivo |
| `FLAG_SECURE` | PDF pág. 4 | Captura real bloqueada |
| Background y timeout 30–60 s | PDF pág. 4 | Ocultación en lifecycle y 45 s monotónicos |
| Botón «Ocultar» | PDF pág. 4 | Activity y `USER_DISMISS` |
| Cuatro eventos de sesión | PDF págs. 4–5; Paso 02 secc. 5.7 | Codegen + adapter + Jest/JUnit |
| Códigos `TOKEN_EXPIRED`, `TOKEN_INVALID`, `USER_DISMISS`, `TIMEOUT` | PDF págs. 4–6 | Tests y matriz manual |
| Pruebas obligatorias | PDF pág. 6 | Jest + JUnit ejecutables |
| Clean Architecture + SOLID + BIAN | PDF págs. 1, 7; Paso 02 | puertos, adapters, capability Cards |
| App/tab Mis productos | PDF pág. 2; Paso 03 | botón habilitado y navegación conservada |
| Mapa, carrusel y sincronización | PDF págs. 2–4 | **PENDIENTE**, Pasos 05–06 |
| iOS como extra | PDF pág. 1; baseline secc. 2 | **PENDIENTE**, Paso 11 |
| Hardening/cobertura >=70 % | PDF págs. 6–7 | pruebas de Paso 04; consolidación Pasos 07–08 |
| README final, video y sustentación | PDF págs. 7–8 | README parcial ahora; Pasos 10 y 12 |

---

## 19. Decisiones y trade-offs defendibles en la sustentación

1. **¿Por qué TurboModule y no Fabric en esta etapa?** La Secure View se **abre imperativamente** y comunica estado por eventos; Fabric corresponde al **componente embebido de mapa** del Paso 05. Ambos viven en una librería.
2. **¿Por qué Activity nativa y no JSX?** La protección de ventana, el lifecycle y el render de datos completos permanecen en Android; la capa JS no puede recibir ni presentar PAN/CVV/titular completos.
3. **¿Por qué Codegen?** Genera interfaces nativas a partir de contratos TS compatibles con New Architecture; se compila contra RN 0.88, evitando un bridge Legacy escrito a mano. La lógica de negocio y UI Kotlin sí son propias.
4. **¿Por qué HMAC local no es autenticación real?** Ambas partes emiten y verifican en el mismo proceso, sin servidor/identidad externa; es un protocolo **de demostración** de integridad y caducidad.
5. **¿Por qué generar la clave al iniciar proceso?** Evita guardar secretos o claves de demostración en Git o el bundle; tokens anteriores se invalidan al reiniciar. No es una credencial productiva.
6. **¿Por qué token 60 s y sesión 45 s?** Son relojes/límites distintos: un token mock autoriza **revelar**, y la sesión limita **cuánto tiempo** puede permanecer abierta. Emitido inmediatamente antes de abrir, el token sigue válido durante la sesión normal, evitando caducidad artificial en background. Tras background se revalida. La expiración se demuestra con tests/retraso controlado, sin añadir 60 s de espera a un flujo de 45 s.
7. **¿Por qué el token pasa por JS si no debe contener datos sensibles?** Lo exige el flujo del PDF. Se pasa solo como token **opaco y efímero**, nunca se almacena ni registra; los detalles completos **nunca** pasan por JS.
8. **¿Por qué `FLAG_SECURE` y limpieza en lifecycle?** `FLAG_SECURE` protege capturas del OS; la limpieza en background añade defensa frente a vistas previas, transiciones y reanudaciones, sin depender de JS.
9. **¿Por qué evento `onCardDataShown` después del dibujo?** Distingue «acepté abrir» de «validé» y de «efectivamente se presentó contenido»; evita reportar éxito falso.
10. **¿Por qué no se añade `BACKGROUND` a `SecureViewCloseReason`?** El contrato aprobado distingue cierre manual y timeout. En background se **oculta**, revalida al volver y no se cierra automáticamente con un motivo engañoso. Del mismo modo, `ValidationError` es un estado cubierto, no un motivo de cierre: `Closed` solo sigue a Ocultar/Back o al timeout.
11. **¿Por qué los errores del módulo no se vuelven `TOKEN_INVALID`?** Fallo de puente/Activity no es validación de negocio; se informa sanitizado como rechazo de invocación y se conserva el contrato de códigos oficiales.
12. **¿Por qué no guardar secretos en Keystore?** El escenario usa mocks efímeros que no requieren persistencia; añadir almacenamiento persistente aumentaría complejidad sin mejorar este flujo demostrativo.
13. **¿Por qué no usar Compose/coroutines/framework de DI?** Una Activity clásica y clases pequeñas son suficientes para demostrar seguridad, modularidad y testabilidad en el plazo del reto.
14. **¿Qué límites quedan explícitos?** Root/hooking, extracción de mocks del APK, fotografía externa, reloj manipulado, crash/proceso muerto sin evento JS garantizado y ausencia de backend: no es seguridad bancaria productiva.
15. **¿Cómo se extiende a iOS?** Los puertos y eventos de aplicación permanecen multiplataforma; en Paso 11 se incorpora Swift y sus protecciones propias sin filtrar datos completos a JS.

**Evitar argumentar que un patrón es bueno «por ser SOLID».** Cada decisión debe poder conectarse con una frontera, un escenario del enunciado y una prueba real.

---

## 20. Formato obligatorio de respuesta del implementador al terminar

Responder **en español** con datos verificables:

1. **Resumen funcional:** TurboModule, librería, token, Activity, protección y botón; qué quedó **fuera**.
2. **Árbol real y arquitectura:** archivos creados/modificados; dependencia `cards → puertos → adapters → paquete` y la frontera de datos completos.
3. **Codegen/autolinking:** `codegenConfig` final, spec exacta, clase Kotlin generada, paquete registrado y resultados de verificación en RN 0.88.
4. **Token mock:** TTL, firma, canonización, errors, clave efímera, qué NO asegura y limitaciones.
5. **Ciclo seguro:** apertura, validación, primer dibujo, background/reentrada, 45 s, Ocultar/Back, concurrencia y limpieza.
6. **Eventos:** tabla con orden/payloads/códigos y evidencia de tests.
7. **Seguridad:** de qué forma comprobó `FLAG_SECURE`, background, logs y que PAN/CVV/titular no aparecen en JS.
8. **Testing:** archivos/casos Jest y JUnit; ejecución y resultado real de **`npm run test:all`** (además de comandos individuales); cobertura solo si se obtuvo.
9. **Comandos ejecutados:** tabla `comando | PASS/FAIL/NO EJECUTADO | evidencia/salida relevante sanitizada`.
10. **Ejecución Android:** dispositivo/emulador, API level, UI observada, screenshot/timeout/ocultación probados.
11. **Cambios y dependencias:** inventario real de paquetes, Gradle, lockfile y cualquier desviación justificada.
12. **Definition of Done:** checklist de la sección 17 actualizado **solo con evidencia**, sin marcar lo no ejecutado.
13. **Trade-offs / bloqueos:** causas raíz, impacto y siguiente acción concreta; nada de «todo bien» sin build o pruebas reales.
14. **Siguiente etapa:** `STEP-05-BENEFITS-CUSTOM-MAP.md`, **sin crearlo ni ejecutarlo**.

**Prohibido al reportar:** pegar tokens, datos completos sintéticos, dumps de un objeto de tarjeta, stack trace con payload, screenshots desprotegidos o señalar tests «PASS» que no fueron corridos. Concluir la respuesta y detenerse.

---

## 21. Referencias y criterios técnicos consultables

### 21.1. Fuentes locales (prevalecen en requisitos)

1. `Reto técnico - Chapter Master Frontend.pdf`, págs. 1–8: Partes 1–2, vista segura, seguridad, APIs/events, pruebas y restricciones.
2. `RETO_BCP_TECHNICAL_BASELINE.md`, secciones 3–10, 17–22, 27–32.
3. `docs/steps/STEP-01-BOOTSTRAP.md`: versión y toolchain RN aprobados.
4. `docs/steps/STEP-02-ARCHITECTURE.md`: puertos **exactos** `SecureTokenProvider` y `SecureViewGateway`; TurboModule vs Fabric.
5. `docs/steps/STEP-03-DASHBOARD-CARDS.md`: Cards UI, mocks enmascarados, composición, navegación y tests que deben preservarse.

### 21.2. Referencias oficiales de RN (compatibilidad técnica)

- React Native 0.88, anuncio del 19/10/2026: <https://reactnative.dev/blog/2026/10/19/react-native-0.88>
- **Using Codegen** (configuración, naming y tarea Gradle): <https://reactnative.dev/docs/the-new-architecture/using-codegen>
- **Turbo Native Modules: Introduction**: <https://reactnative.dev/docs/turbo-native-modules-introduction>
- **Turbo Native Modules: Android/Kotlin y BaseReactPackage**: <https://reactnative.dev/docs/turbo-native-modules-android>
- **Emitting Events in Native Modules / CodegenTypes.EventEmitter**: <https://reactnative.dev/docs/the-new-architecture/native-modules-custom-events>
- **Codegen Typings / tipos soportados**: <https://reactnative.dev/docs/appendix>
- **Create a Library for Your Module / paquete local**: <https://reactnative.dev/docs/the-new-architecture/create-module-library>
- **Android FLAG_SECURE / WindowManager.LayoutParams**: <https://developer.android.com/reference/android/view/WindowManager.LayoutParams#FLAG_SECURE>
- **Android SystemClock.elapsedRealtime**: <https://developer.android.com/reference/android/os/SystemClock#elapsedRealtime()>

**Regla de actualización:** estas referencias explican un mecanismo técnico, **no** autorizan actualizar React Native ni copiar configuraciones de otras versiones. El output real de Codegen y el build de la versión **0.88.0 fijada** deciden la sintaxis final. Si cambia una firma por compatibilidad demostrada, ajustar únicamente la spec/adapter, registrar el cambio y conservar los puertos públicos.

---

## 22. Principio de cierre

> **El Paso 04 demuestra una frontera real JS ↔ Kotlin, no una pantalla RN simulada de seguridad.** El token se emite y valida como mock local en Kotlin; los detalles completos se obtienen y dibujan solo en Android nativo; JS recibe exclusivamente eventos de estado. El comportamiento de pantalla, background, capturas y timeout se puede probar, explicar y defender.
>
> **No convertir una demo bien documentada en una afirmación de seguridad bancaria productiva.** Mantener cumplimiento exacto del enunciado, pruebas reproducibles, arquitectura sencilla y ausencia comprobable de filtraciones.

**El propietario autorizó la ejecución del Paso 04. Registrar aquí los resultados reales y detenerse antes del Paso 05.**
