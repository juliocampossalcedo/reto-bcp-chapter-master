# STEP-09 — Extras del reto técnico BCP: Firebase Authentication

**Proyecto:** `io-products-benefits`  
**Aplicación:** iO Productos & Beneficios  
**Librería nativa única:** `io-native-components`  
**Etapa:** 09 de 12  
**Versión del documento:** 1.2 — cierre documentado con smoke Android confirmado
**Estado:** **COMPLETADO — 12/12 DoD PASS** (§13)  
**Decisión del propietario:** **IMPLEMENTAR Firebase Authentication con login simple**. No asumir que los demás extras deben implementarse.  
**Prerequisitos:** Pasos **01–07 COMPLETADOS Y APROBADOS**; Paso **08 OMITIDO POR DECISIÓN DEL PROPIETARIO**, no pendiente ni bloqueante.  
**Plataforma funcional principal:** Android + Kotlin. iOS/Swift y MapKit corresponden al Paso 11.  
**Stack inmutable:** React Native **0.88.0**, TypeScript estricto, Hermes, New Architecture, Clean Architecture + SOLID + Vertical Slicing/BIAN, Zustand, TurboModule + Fabric + Codegen.  
**Fuentes:** `Reto técnico - Chapter Master Frontend.pdf` (pp. 5, 7–8), `RETO_BCP_TECHNICAL_BASELINE.md`, `STEP-02-ARCHITECTURE.md`, `STEP-04-NATIVE-SECURE-VIEW.md`, `STEP-05-BENEFITS-CUSTOM-MAP.md`, `STEP-06-MAP-CAROUSEL-SYNC.md` y cierre **§25.8** de `STEP-07-TESTING-COVERAGE.md`.

> **Alcance autorizado para ejecución por el propietario:** implementar **solo** un login funcional por email y contraseña con Firebase Authentication que, tras un inicio de sesión válido, muestre el Dashboard actual. La implementación local y sus resultados se registran en §13. La creación de proyecto/usuarios/configuración en Firebase Console es una operación externa separada y requiere acción/autorización expresa del propietario.

---

## 1. Decisión ejecutiva y fundamento

El enunciado coloca Firebase Authentication, state management y performance en la **Parte 3 opcional**. En la sección **2.3 Extras valorados**, menciona publicación del paquete, namespaces claros y segunda plataforma. En cambio, las **Partes 1 y 2**, las pruebas unitarias, el README y el video son obligatorios. Firebase mejora la demostración de un flujo transversal de navegación, pero **no reemplaza** la seguridad de `Card Secure View` ni exige modificar los módulos nativos.

**Selección:** Firebase Auth **IMPLEMENTAR**, usando únicamente Email/Password y **un usuario de demostración predefinido**, con credenciales suministradas al evaluador por canal de entrega privado. **No** implementar registro, recuperación de contraseña, MFA, login social, Firestore, Analytics, Cloud Functions, perfiles o backend adicional.

### 1.1. Matriz de decisión

| Extra | Condición del PDF | Estado vigente | Beneficio para BCP | Esfuerzo / complejidad | Dependencias / riesgos | Decisión | Justificación |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Firebase Authentication (Email/Password) | Parte 3, **opcional** | No implementado | **Medio-alto**: recorrido login → Dashboard, control de estados, separación de infraestructura | **Medio** | Cuenta/proyecto Firebase externo, internet, config cliente, casos de sesión/error y navegación | **IMPLEMENTAR** | Elección expresa del propietario; agrega una capacidad real, demostrable y defendible |
| State management | Parte 3, **opcional** | **Zustand implementado** | Alto | **Ninguno** | No duplicar stores ni estado del navegador | **YA CUBIERTO** | La app ya lo utiliza para estado seguro compartido/selección |
| Performance de lista, carrusel y renders | Parte 3, **opcional** y factor general del 10 % | **Optimización implementada y documentada** en pasos previos | Alto | **Ninguno para conservar** | No confundir uso de `FlatList`/memo con benchmark FPS o prueba de leaks | **YA CUBIERTO** | No rehacer código sin problema medido o reproducible |
| Profiling/hardening adicional | No obligatorio como fase independiente | No solicitado | Bajo sin incidencia real | Medio-alto | Tiempo, regresiones, sobreingeniería | **OMITIR** | Paso 08 fue expresamente omitido; no reconstruirlo en Paso 09 |
| Publicar librería en npm / GitHub Packages | Sección 2.3, **extra valorado** | Paquete local ya integrado, no publicado | Bajo-medio | Medio | Registry, permisos, compatibilidad de empaquetado, credenciales de publicación | **DIFERIR** | Se debe entregar **código de la librería en GitHub**, pero publicar paquete no es obligatorio; reservarlo para evaluación aparte |
| Naming y namespaces claros | Sección 2.3, **extra valorado** | `io-native-components` y namespace propio definidos | Medio | Ninguno | Evitar renombrados regresivos | **YA CUBIERTO** | No cambiar nombres estables |
| Paridad Android + iOS | Sección 2.3, **extra valorado** | Android listo; iOS sin librería Swift propia | Alto potencial | Alto | Swift/MapKit/seguridad nativa/pruebas | **DIFERIR AL PASO 11** | Segundo sistema operativo requiere su propia etapa, no mezclar con Auth |

**Regla de corte:** si Firebase no puede configurarse o validarse con una cuenta demo real, declarar **BLOQUEO EXTERNO** explícito; no sustituir silenciosamente Firebase por un login falso ni marcar el Paso 09 completo.

---

## 2. Plan de implementación — USAR SOLO TRAS APROBACIÓN

> Actúa como **Chapter Frontend / Senior React Native Engineer**, experto en React Native 0.88, TypeScript estricto, Firebase Authentication, Clean Architecture, Vertical Slicing por capability, navegación tipada y pruebas Jest/RNTL.
>
> **EJECUTA EXCLUSIVAMENTE EL PASO 09 — LOGIN CON FIREBASE AUTHENTICATION** en el repositorio **existente** `io-products-benefits`. La decisión del propietario es implementar Firebase Email/Password. **No** evalúes de nuevo si hacerlo: implementa **este alcance concreto**, una vez aprobado este documento.
>
> Los Pasos 01–07 están **COMPLETADOS Y APROBADOS**; el Paso 07 cerró con **65/65 DoD**, **106 Jest/11 suites**, **13 JUnit**, cobertura global RN auditada y **37/37 archivos runtime elegibles instrumentados**. El Paso **08 se OMITIÓ por decisión del propietario**, no está pendiente y **NO DEBES ejecutar sus 70 DoD**. No repitas auditorías históricas, no reconstruyas las Partes 1–2 y no introduzcas hardening encubierto.
>
> **Objetivo:** mostrar inicialmente un formulario de login (email + contraseña), autenticar contra **Firebase Authentication real** mediante Email/Password con una cuenta de demostración predefinida, navegar al **Dashboard actual** únicamente cuando exista sesión autenticada, y permitir **Cerrar sesión** regresando al login. Mantener intactos Mis productos, Beneficios, mapa, carrusel y Card Secure View. La sesión Firebase no sustituye la validación mock `secureToken`/HMAC ni autoriza a transportar PAN/CVV/titular a JS.
>
> **Primero, inspecciona mínimamente** `App.tsx`, `src/app/` (composición y navegación), scripts/versions instaladas, `package.json`, `package-lock.json`, diseño/tema y los límites del Paso 02. Lee el PDF oficial y los cierres de Paso 07 si están disponibles en el checkout; de lo contrario informa exactamente qué fuente no tienes, sin inventar lectura ni reabrir DoD. Antes de modificar archivos: `pwd`, `git branch --show-current`, `git status --short`.
>
> **Implementa solo** §5–§7 de este documento, con una dependencia Firebase JS SDK compatible y fijada, sin Expo, sin Auth nativo duplicado, sin añadir otra librería propia ni cambiar TurboModule/Fabric/Codegen. Mantén el `NavigationContainer` y el navigator existente sin duplicarlos; controla acceso al Dashboard mediante una compuerta de sesión en la composición de la app. Evita pantallas que aparezcan fugazmente sin autenticación mientras se resuelve el estado inicial.
>
> **Servicios externos:** no crees proyectos, usuarios, credenciales, API keys ni configuraciones remotas en Firebase Console; no uses navegadores/cuentas del propietario ni hagas cambios externos por tu cuenta. Espera configuración **aportada/autorizada explícitamente** por el propietario. Puedes preparar archivos de configuración cliente con placeholders y documentación para permitir integración posterior; si falta la configuración real, reporta **BLOQUEADO POR CONFIGURACIÓN EXTERNA** el login end-to-end, sin afirmar que funciona. **No** agregues password demo, tokens ID/refresh, claves privadas o `serviceAccountKey.json` al repositorio.
>
> Aporta **tests pequeños y específicos** para Auth y compuerta de navegación, reutilizando Jest/RNTL. Ejecuta checks reales, `npm run test:all` y un **smoke Android focalizado** de login → Dashboard → logout cuando se disponga de configuración real. No alteres criterios previos ni fabriques métricas. Al terminar entrega **únicamente el reporte de §10**, y **DETENTE** sin iniciar Paso 10/11, commits, pushes o publicaciones.

---

## 3. Prerrequisitos y prohibiciones

### 3.1. Prerrequisitos de código

- `io-products-benefits` con RN **0.88.0**, **un** `package-lock.json`, TypeScript estricto y scripts npm ya aprobados.
- `src/app/` con Dashboard/React Navigation y `src/capabilities/{cards,benefits}` existentes.
- Librería única `packages/io-native-components` con `IoSecureView`/TurboModule y `CustomMap`/Fabric + Codegen **sin modificaciones** en esta etapa.
- Línea base de prueba Paso 07 **aprobada**. Cualquier incremento de tests será solo para la funcionalidad nueva.

### 3.2. Prerrequisitos externos gestionados por el propietario

1. Proyecto **Firebase dedicado exclusivamente a la demo** (no corporativo/productivo), creado o autorizado por el propietario.
2. Registrar **una aplicación web** en ese proyecto para obtener la **configuración cliente del Firebase JavaScript SDK**. Esta elección deliberadamente **NO** requiere `google-services.json` ni Google Services Gradle plugin.
3. Activar en Firebase Console **Authentication → Sign-in method → Email/Password**.
4. Crear **un usuario demo predefinido** (email de prueba y contraseña distinta de cualquier contraseña real); no darle acceso a recursos de negocio ni datos personales. No incluir contraseña en código, fixtures ni screenshots.
5. Facilitar la **configuración pública cliente** real de Firebase al checkout, verificando el proyecto correcto. **Decisión vigente del propietario:** el archivo cliente real se mantiene en `.gitignore`; solo se versiona `firebaseConfig.ts.example` vacío. Como contexto técnico, los parámetros web de Firebase identifican el proyecto, **no son equivalentes a una clave privada ni un token de administrador**; evaluar restricciones/uso previsto. Nunca versionar credenciales de la cuenta demo.
6. Entregar las credenciales demo por canal de entrega privado al evaluador (Paso 10), indicando que son **exclusivamente de prueba** y pueden revocarse tras la evaluación.

### 3.3. Prohibiciones

- No actualizar RN, React, AGP, Gradle o Kotlin por conveniencia; no ejecutar Paso 08.
- No instalar `@react-native-firebase/app`/`auth` **además del Firebase JS SDK**, ni abrir otro frente de integración nativa sin necesidad verificada y autorización nueva.
- No crear registro de usuarios, recuperación de contraseña, Google Sign-In, MFA, Firestore, Realtime Database, perfiles, SDKs de Analytics o Crashlytics.
- No añadir AsyncStorage solo para persistir una sesión. Política elegida: **sesión en memoria** (ver §5.2).
- No almacenar credenciales, tokens Firebase, `secureToken`, PAN, CVV o titular completos en Zustand, AsyncStorage, logs, analytics, fixtures ni snapshots.
- No cambiar firmas públicas de `SecureTokenProvider`, `SecureViewGateway`, `CustomMapProps` o specs Codegen. No implementar Swift/MapKit (Paso 11).
- No publicar `io-native-components`, hacer `git commit/push`, ni crear/provisionar servicios externos sin autorización específica.

---

## 4. Dependencia elegida y alternativa descartada

### 4.1. Elección: **Firebase JavaScript SDK (`firebase`)**

Para un **login Email/Password** en una app RN CLI ya funcional, usar el **SDK JavaScript oficial de Firebase**, con `initializeApp`, `initializeAuth`, `inMemoryPersistence`, `signInWithEmailAndPassword`, `onAuthStateChanged` y `signOut` (sujeto a verificar exports/compatibilidad de la versión concreta instalada). **No** implementar un sistema propio de verificación de contraseñas.

**Por qué:** una sola dependencia JS, sin registro Android extra, sin modificar Gradle ni `io-native-components`, sin romper Codegen; menor superficie de regresión para el reto.

**Trade-off:** para funcionalidades móviles avanzadas, el SDK React Native Firebase puede ser más apropiado. **No se necesita aquí**. Si se reproduce un bloqueo de compatibilidad genuino con RN 0.88, informar el error exacto y solicitar una nueva decisión en lugar de cambiar de arquitectura silenciosamente.

**Antes de instalar:** verificar versión compatible del paquete `firebase`, los exports React Native y las dependencias efectivas mediante documentación oficial y `npm view`, sin hacer upgrades colaterales. Al instalar, fijar versión exacta en `package.json` y `package-lock.json`; no usar `--force`, `--legacy-peer-deps` ni versiones flotantes.

### 4.2. Política de sesión

- **`inMemoryPersistence`** deliberada: conserva sesión mientras vive la instancia JS, pero no promete restaurarla después de cerrar/reiniciar completamente el proceso. **No** instalar `@react-native-async-storage/async-storage` por rutina.
- Un listener **único y limpiable** de `onAuthStateChanged` controla la sesión; tres estados mínimos: `initializing`, `signedOut`, `signedIn` (y representación de error de inicialización si falla configuración).
- El Dashboard no debe aparecer durante `initializing` ni cuando no hay sesión; login solo al confirmar ausencia de usuario.
- Si se reinicia la app, volver a pedir login es una **decisión consciente para el demo**, no un defecto de persistencia.
- `signOut` limpia la sesión Firebase y devuelve al login; no cancelar ni modificar por ello la lógica intrínseca de `Card Secure View`.

**Fuentes técnicas:** https://firebase.google.com/docs/reference/js/auth , https://firebase.google.com/docs/auth/web/password-auth , https://firebase.blog/posts/2023/03/which-react-native-firebase-sdk-to-use .

---

## 5. Arquitectura mínima, sin segunda fuente de verdad

### 5.1. Vertical slice nueva: `auth`

Agregar una capability **`src/capabilities/auth/`** con solo responsabilidades usadas. Los nombres concretos pueden adecuarse a convenciones del repo:

```text
src/
  app/
    AppRoot.tsx                         # EXISTENTE: compuerta de sesión; no navigator duplicado
    composition/
      authDependencies.ts               # NUEVO solo si facilita inyección
    navigation/
      DashboardNavigator.tsx            # EXISTENTE: conservar tabs y estado
  capabilities/
    auth/
      application/
        ports/AuthGateway.ts            # NUEVO: interfaz pequeña
      infrastructure/
        firebase/
          firebaseClient.ts             # NUEVO: inicialización singleton/controlada
          FirebaseAuthGateway.ts        # NUEVO: adapter del SDK al puerto
          firebaseConfig.ts             # CONFIG CLIENTE: placeholder o configuración aprobada
      presentation/
        screens/LoginScreen.tsx          # NUEVO: email/password, accesible y responsive
        hooks/useAuthSession.ts          # NUEVO solo si coordina listener y cleanup
        __tests__/authFlow.test.tsx      # NUEVO o pruebas según convención real
```

**No crear archivos vacíos ni exigir cada archivo** si una organización más pequeña respeta el puerto y los límites. No añadir `AuthRepository` y `AuthUseCase` redundantes, store de sesión Zustand nuevo, router paralelo o DI container. El estado efímero Firebase **no necesita Zustand**; Zustand existente sigue gestionando las capabilities del Dashboard.

### 5.2. Contrato mínimo de aplicación (orientativo)

```ts
// Ejemplo conceptual, no reemplazar interfaces aprobadas.
export type AuthIdentity = Readonly<{ uid: string }>;

export interface AuthGateway {
  observeSession(
    listener: (identity: AuthIdentity | null) => void,
    onError: (error: unknown) => void,
  ): () => void;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
}
```

- La **presentación** consume el puerto y modela `loading / error / authenticated`; **no importa** `firebase/auth` directamente.
- `FirebaseAuthGateway` encapsula el SDK y traduce `User` a `{uid}`. **No exponer** `UserCredential` completo ni ID token/refresh token a la UI o store.
- `app/composition` entrega una instancia al control de acceso. Sin firebase config real, la app debe seguir **compilando** y mostrar error claro de «Firebase no configurado» **sin permitir acceso al Dashboard**.
- Inicializar Firebase **una sola vez** y proteger la integración ante Fast Refresh/doble inicialización. No duplicar listeners tras remount. Cualquier error Firebase enviado a UI debe ser **sanitizado**.
- El flujo de secure card conserva su arquitectura propia: `secureToken` nativo mock 60 s y sesión nativa 45 s; **el Firebase ID token NO es el `secureToken`**.

### 5.3. Compuerta de navegación (sin nueva librería)

```text
Inicio de aplicación
  └─ Inicializar Firebase/Auth (config disponible)
       └─ onAuthStateChanged
            ├─ initializing → indicador de carga neutro
            ├─ signedOut → LoginScreen
            ├─ signedIn  → Dashboard actual con Mis productos/Beneficios
            └─ error/config ausente → error controlado y acción de reintento si aplica

LoginScreen
  └─ email + password → FirebaseAuthGateway.signIn
       ├─ éxito → observador de sesión → Dashboard
       └─ error → feedback accesible, seguir en Login

Dashboard → Cerrar sesión → FirebaseAuthGateway.signOut → LoginScreen
```

Conservar **el `NavigationContainer` existente** donde corresponda: preferir condicionar su **subárbol Dashboard** desde la raíz a introducir un Stack Navigator para una única pantalla. Cerrar sesión debe desmontar el Dashboard sin que el usuario pueda volver a él con Android Back. No reinicializar datos de Cards/Benefits a mano ni alterar sus stores por autenticar: al volver a ingresar, la app debe preservar su comportamiento ya probado.

---

## 6. UX del login: mínimo profesional

- Pantalla consistente con el tema existente de iO (colores, tipografía, espaciados y safe areas), usando `TextInput`, `Pressable`/`Button`, `ActivityIndicator` de React Native; sin UI kit adicional.
- Campos **Correo electrónico** (keyboard/email, sin autocapitalización) y **Contraseña** (`secureTextEntry`, sin render/log de caracteres); labels/hints accesibles y tamaños táctiles razonables.
- Acción **Ingresar** bloqueada mientras se procesa una solicitud; no aceptar envío duplicado. Validación superficial de no vacío/formato email antes de llamar al SDK; no implementar un validador complejo.
- Errores claros sin filtrar detalles internos: credenciales inválidas, conectividad/servicio no disponible, configuración faltante. Evitar enumeración específica de cuentas o mostrar códigos internos a usuarios.
- Tras error, permitir corregir e intentar de nuevo. No vaciar necesariamente email; no conservar password en logs ni almacenar la clave fuera del estado efímero de campo. Limpiar password tras éxito; evitar enviar contraseña a Zustand.
- Acceso **únicamente** después de confirmación de sesión real del proveedor. No agregar botón «Entrar sin login» ni bypass por modo demo.
- Control visible y accesible **Cerrar sesión** en superficie compartida del Dashboard, sin alterar sus dos tabs, el header común ni la acción «Ver datos sensibles».
- **No** implementar onboarding, registro, recuperación de contraseña, biometría, notificaciones ni persistencia de sesión en disco.

---

## 7. Secuencia mínima de implementación

1. **Preflight focalizado:** `git status`, scripts, composición de navegación, tema, conventions y estado real de RN 0.88. Verificar que no existe Auth previo ni SDK Firebase ya instalado.
2. **Compatibilidad y dependencia:** resolver una versión concreta del SDK Firebase JS compatible, instalar **solo `firebase`** con versión exacta/lockfile. Registrar elección; no instalar SDK nativo ni polyfills salvo un defecto concreto documentado y aprobado.
3. **Config cliente:** definir forma mínima de configuración (`apiKey`, `authDomain`, `projectId`, `appId`, etc. exactamente según datos del proyecto web Firebase). Incluir placeholders/guía sin romper imports. Validar explícitamente configuración; sin datos reales, iniciar en estado «no configurado» sin bypass. Cualquier valor real procede del propietario.
4. **Gateway + composición:** inicialización singleton, `signInWithEmailAndPassword`, listener de sesión con cleanup, `signOut`, traducción de errores sin filtrar tokens/datos privados.
5. **Login + compuerta:** nueva `LoginScreen` y root condicional, preservando navegación, tema, tabs y stores ya funcionales; añadir acción de logout mínima en superficie compartida.
6. **Pruebas nuevas focalizadas:** utilizar `AuthGateway` falso para probar login, compuerta y logout. No simular éxito del servicio remoto como evidencia de integración real.
7. **Verificaciones:** calidad JS, Jest/cobertura existente, `npm run test:all` y smoke Android con **Firebase real** si el proyecto/cuenta autorizados están disponibles. Documentar bloqueo externo/entorno cuando aplique.
8. **README acotado:** agregar sección corta de Firebase (requisitos, configuración, usuario demo por canal privado, comportamiento in-memory, rutas y comandos). No completar todavía el README final, diagrama/video, tareas del Paso 10.
9. **Reporte y STOP:** entregar §10, sin iniciar otra etapa.

---

## 8. Validaciones y comandos reproducibles

Ejecutar **desde la raíz real del checkout**. Los siguientes comandos son la secuencia operativa, **no resultados ya ejecutados**:

```bash
pwd
git branch --show-current
git status --short
node --version
npm --version
npm ls react-native firebase

# Consultar antes de instalar (si la dependencia no existe)
npm view firebase version
# Tras verificar compatibilidad y aprobar ejecución:
npm install --save-exact firebase

# Calidad y tests existentes + nuevas pruebas de auth
npm run lint
npm run typecheck
npm run format:check
npm test -- --watch=false --runInBand --coverage
npm run test:all

git diff --check
git status --short

# Smoke Android SOLO con entorno y Firebase demo configurados:
npm run android
```

**Reglas:**

- No volver a ejecutar checks **históricos por DoD**, solo la **regresión necesaria** tras agregar Firebase y navegación. `test:all` reutiliza la suite aprobada más JUnit; no generar 70 DoD de Paso 08.
- El coverage de Paso 07 es **baseline histórica**, no resultado nuevo. Si se agregan archivos runtime Auth, el **denominador de Jest debe incluirlos** sin excluirlos artificialmente, actualizando `collectCoverageFrom` solo si sus patrones existentes no los incorporan. No imponer nuevos umbrales por encima de los `>=70 %` ya aprobados.
- **Tests nuevos sugeridos (solo si los existentes no cubren lo mismo):** (1) estado inicial sin flash, (2) login válido → Dashboard, (3) credenciales inválidas → error y pantalla login, (4) logout → login y acceso cerrado, (5) error de red o config ausente → no bypass. Puede agruparse en una suite con 4–6 casos; no es una cuota de tests.
- El test **unitario** con gateway falso no acredita autenticación remota; se necesita **un smoke Android real** con proyecto y usuario demo configurados. Verificar manualmente login exitoso, error por contraseña incorrecta, Dashboard real con ambas tabs, logout y que Android Back no permita reingreso sin autenticación. No pedir E2E automatizados.
- **Regresión sensible focalizada en Android** tras login: ejecutar una apertura y cierre normales de Card Secure View sin capturas de datos completos, y un recorrido mapa → carrusel → marcador para comprobar que la compuerta no rompió integración existente. **No repetir** todas las pruebas de token, screenshot, TTL y eventos históricos.
- Si falla Gradle por permisos del sandbox, reportar **NO EJECUTADO/BLOQUEADO** y usar `npm run test:all` desde Terminal del propietario si procede, consignando origen y límites reales de la evidencia. No cambiar Gradle por rutina.
- No ejecutar acciones con Firebase Console automáticamente; reportar lo pendiente para la persona autorizada.

---

## 9. Definition of Done — **12 criterios proporcionales**

Marcar `[x]` **solo después de evidencia real**. La ausencia de proyecto/cuenta Firebase autorizados deja los criterios de integración **BLOQUEADOS**, no PASS.

- [x] **D09-01.** Una única dependencia SDK Firebase JS compatible instalada con versión exacta; RN 0.88.0, New Architecture y lockfile preservados. **PASS** — firebase 12.19.0 exacto; Auth/App engines >=20, Node 22.23.4; bundle Android y 0 versiones previas alteradas.
- [x] **D09-02.** Existe una capability `auth` mínima y separada por un puerto/adaptador, sin nuevo framework, store redundante ni acceso directo a Firebase desde la UI. **PASS** — auth con puerto, adapter y hook; sin store/DI/router nuevos.
- [x] **D09-03.** Configuración cliente explícita, validada y documentada; sin credenciales personales, contraseñas demo, tokens ni material administrativo en código/logs. **PASS** — config vacía validada; error explícito sin Dashboard y guía README; sin credenciales reales.
- [x] **D09-04.** Login auténtico por Email/Password con **usuario demo Firebase real** funciona en Android; credenciales inválidas mantienen el acceso cerrado. **PASS** — el propietario confirmó login válido al Dashboard y credenciales inválidas permanecen en Login en el emulador Android; ver evidencia y límite de observación en §13.14.
- [x] **D09-05.** Inicio de app sin flash de Dashboard; solo la sesión autenticada permite navegar a las **dos tabs existentes**. **PASS** — authFlow inicial sin flash y observer como única autoridad; tests históricos de tabs conservados.
- [x] **D09-06.** Cerrar sesión regresa al login; Android Back no salta la compuerta. Política in-memory documentada. **PASS** — el propietario confirmó logout → Login y que Android Back/reapertura no permite regresar al Dashboard; política en memoria documentada (§13.14).
- [x] **D09-07.** Login accesible, coherente con tema, con loading, error comprensible, retry y prevención de envíos duplicados. **PASS** — validación, secureTextEntry, labels, estado pendiente, error/retry y duplicados PASS RNTL.
- [x] **D09-08.** Card Secure View y `secureToken` nativo permanecen independientes de Firebase; no se modificaron contratos de Cards, Benefits, Fabric/TurboModule/Codegen. **PASS** — native-components/Kotlin/specs y puertos Cards/Benefits intactos; Firebase solo uid hacia UI.
- [x] **D09-09.** Pruebas Jest/RNTL nuevas **focalizadas** pasan, junto a regresión existente y cobertura sobre los archivos Auth nuevos incluidos cuando corresponda. **PASS** — 113 Jest en 13 suites; 7 casos nuevos, baseline 106 preservada; coverage 44/44 runtime.
- [x] **D09-10.** `npm run lint`, `npm run typecheck`, `npm run format:check` y `npm run test:all` realmente PASS o resultado/habilitación claramente documentados (un bloqueo en verificación requerida impide cierre definitivo). **PASS** — lint/typecheck/format, test:all y bundle Android PASS; Gradle incremental, sin atribuir métodos JUnit nuevos.
- [x] **D09-11.** Smoke Android **real** validado: login correcto, login erróneo, logout y regresión mínima de Cards/Secure View/Benefits, con evidencia de dispositivo y cuenta demo configurados. **PASS** — propietario confirmó el smoke completo en el emulador Android: autenticación válida e inválida, logout/Back, dos pestañas, apertura/cierre de Card Secure View y recorrido Benefits mapa → carrusel → marcador (§13.14).
- [x] **D09-12.** README actualizado solo en sección Auth, reporte §10 entregado, diff limitado; sin publicación, servicios externos auto-configurados, Swift/MapKit, Paso 08 ni ejecución del Paso 10. **PASS** — README Auth, reporte §13, sin cambios cloud/publicación/Swift ni 08/10/11.

**Criterio de cierre:** `12/12 PASS`, con Firebase demo real habilitado y prueba Android efectiva. Si la autorización/configuración externa está pendiente, estado **IMPLEMENTACIÓN LOCAL LISTA — INTEGRACIÓN EXTERNA BLOQUEADA** y no declarar Paso 09 cerrado. Un error reproducible de SDK se documenta antes de ampliar el alcance.

---

## 10. Formato de reporte del implementador

Entregar **solo** estas secciones al terminar, con evidencia y sin resultados supuestos:

1. **Resumen:** qué quedó implementado, estado (`COMPLETO`, `PARCIAL` o `BLOQUEADO`) y si Firebase se probó contra servicio real.
2. **Cambios:** archivos creados/modificados, árbol real y motivo; explicar la dependencia `firebase` elegida.
3. **Arquitectura:** sesión/compuerta, `AuthGateway`, Firebase adapter, inicialización única, independencia del `secureToken`.
4. **Firebase externo:** registrar **solo** si el propietario entregó/activó configuración y usuario demo; nunca imprimir password, Firebase ID tokens ni datos privados.
5. **Comandos ejecutados:** tabla comando, entorno, resultado/exit code, cantidad real de Jest/JUnit y métricas actuales; distinguir evidencias del implementador versus Terminal del propietario.
6. **Pruebas focalizadas:** casos nuevos y regresión existente; evidencia del smoke Android (dispositivo, escenarios, resultados), sin capturas de datos sensibles.
7. **DoD:** 12 filas D09-01…D09-12 con `PASS` / `FAIL` / `BLOQUEADO` / `NO EJECUTADO` y evidencia.
8. **Trade-offs y riesgos residuales:** sesión en memoria, internet/Firebase disponible, cuenta demo pública para evaluadores, ausencia de features productivas y dependencia de configuración externa.
9. **Git y límites:** `git status --short`, cambios del propietario preservados, sin commits/push, sin cambios en librería nativa ni ejecución de Paso 08/10/11.
10. **Siguiente etapa:** `STEP-10-DOCUMENTATION-DELIVERY.md` **solo cuando el propietario apruebe el cierre del Paso 09; no ejecutarla automáticamente**.

---

## 11. Trade-offs y riesgos residuales para sustentación

| Decisión | Beneficio | Límite aceptado / tratamiento |
| --- | --- | --- |
| Firebase Auth real con email/password | Extra verificable ante BCP y navegación autenticada | Requiere internet y un servicio externo; cuenta demo dedicada, sin privilegios, revocable |
| Firebase **JS SDK** frente a RN Firebase nativo | No tocar Android/Gradle ni librería propia; única dependencia JS | Capacidades móviles avanzadas fuera de alcance; comprobar compatibilidad real con RN 0.88 |
| Sesión **en memoria** | Sin AsyncStorage adicional y sin persistir credenciales en dispositivo | Al terminar proceso se requiere login nuevo; explicitarlo durante demo |
| `AuthGateway` pequeño + observer | Testabilidad sin acoplar UI al proveedor | Añade solo una frontera útil, no otro sistema de estados |
| Dashboard condicionado por sesión | Preserva navigator y dos tabs ya aprobados | El Dashboard se desmonta al salir; no prometer restauración tras logout |
| Firebase distinto de `secureToken` | Mantiene invariante sensible: PAN/CVV/titular solo Kotlin | Login no convierte token mock/secure view en seguridad bancaria productiva |
| Credential demo por canal privado | El evaluador puede ejecutar login; no insertar contraseña en repo | Credencial compartida temporal: revocar tras evaluación, no usar datos reales |
| No publicar paquete ni optimizar adicionalmente | Reduce regresión/esfuerzo | Extras diferidos y límites documentados; README/video/Paso 10 y iOS/Paso 11 separados |

**Limitaciones declaradas:** no es autenticación bancaria productiva; no hay MFA, enrolamiento, recuperación de contraseña, administración de usuarios ni persistencia duradera. La Card Secure View conserva seguridad nativa **independiente del login**. No se prometen resultados de profiling o pruebas de iOS no ejecutados.

---

## 12. Estado de configuración externa

La ejecución de código fue autorizada expresamente por el propietario. Durante el trabajo, el propietario añadió Firebase al proyecto Google Cloud existente y mostró el registro de una aplicación web en Firebase Console. Aún no entregó la configuración cliente al checkout ni confirmó Email/Password y la cuenta demo. Estas operaciones externas siguen a cargo del propietario; el implementador no creó proyectos, apps ni usuarios en servicios externos.

**Estado vigente:** integración contra Firebase real y smoke Android completados según confirmación manual del propietario (§13.14); Paso 09 cerrado con 12/12 DoD PASS. El Paso 08 sigue omitido y el Paso 10 no se inicia.


---

## 13. Ejecución real del Paso 09 — 06/11/2026

### 13.1. Resumen

**COMPLETADO — PASO 09 CERRADO, 12/12 DoD PASS.** Login Email/Password, sesión inicial, compuerta, errores seguros, logout y política en memoria implementados mediante SDK oficial. El Dashboard solo se monta al recibir una identidad del observador. El propietario confirmó el smoke real en Android con credenciales válidas e inválidas, logout/Back y regresión focalizada de tabs, Card Secure View y Benefits (§13.14). No se introdujo login simulado en producción. La evidencia manual es confirmación del propietario; el implementador no observó ni operó el emulador.

Fuentes leídas: documento completo, PDF real pp. 5/7/8 mediante PDFKit, baseline Firebase, contratos de arquitectura/seguridad y cierre definitivo 07 §25.8. No se reabrieron auditorías ni DoD históricos. El Paso 08 fue omitido y permanece fuera de alcance.

### 13.2. Cambios y dependencia

```text
src/capabilities/auth/
  application/ports/AuthGateway.ts
  infrastructure/firebase/
    firebaseConfig.ts
    firebaseClient.ts
    FirebaseAuthGateway.ts
  infrastructure/__tests__/firebaseAuth.test.ts
  presentation/hooks/useAuthSession.ts
  presentation/screens/LoginScreen.tsx
  presentation/__tests__/authFlow.test.tsx
src/app/composition/authDependencies.ts
```

Modificados: `src/app/AppRoot.tsx` agrega compuerta y acción compartida Cerrar sesión; `package.json`/`package-lock.json` agregan únicamente **firebase 12.19.0** como dependencia directa; `__tests__/App.test.tsx` y `benefitsPresentation.test.tsx` reciben un doble autenticado del puerto para mantener sus assertions de Dashboard; README agrega solo Auth; este Step09 preexistente se actualiza con ejecución y DoD. `App.tsx`, header, navigator, stores, Cards productivo y librería nativa intactos.

Se consultó Firebase **13.2.0** (última): Auth 1.13.9 exige Node >=24.12. Se eligió **12.19.0**, con Auth **1.13.6** y App **0.16.2**, ambos engines >=20, compatible con Node **22.23.4** ya instalado. Export React Native verificado en metadata y source map del bundle. **67 entradas transitivas añadidas**, 0 retiradas, **0 cambios de versión en dependencias preexistentes**. Sin AsyncStorage, SDK nativo Firebase, polyfills ni plugins nuevos. RN **0.88.0** intacto. [Entornos oficiales Firebase](https://firebase.google.com/docs/web/environments-js-sdk).

### 13.3. Arquitectura

`AppRoot → useAuthSession → AuthGateway → FirebaseAuthGateway → SDK`. El puerto expone `observeSession`, `signIn`, `signOut`; solo `{uid}` sale del adapter. Errores Firebase se convierten a tres fallos públicos y mensajes estáticos sin reenviar payloads ni enumerar usuarios. La presentación no importa Firebase.

El cliente valida los cuatro campos requeridos y reutiliza la app Firebase nombrada `io-products-benefits-auth`. `initializeAuth` se invoca con las mismas dependencias e **inMemoryPersistence**; el SDK instalado devuelve la instancia existente cuando ya está inicializada con esas dependencias. Un solo listener activo por raíz, con unsubscribe y protección de callbacks del observador anterior al reintentar. No se añade Zustand para Auth.

Mientras se confirma sesión: indicador neutro, sin Dashboard. Sesión ausente: Login. Promesa de signIn resuelta: aún se espera al observador; contraseña se limpia. Logout pide signOut al SDK y el observador desmonta Dashboard. El único NavigationContainer y las tabs originales permanecen. Los stores no se reinicializan manualmente. Tokens Firebase quedan gestionados internamente por el SDK; **no sustituyen al secureToken Kotlin** ni se envían a Secure View/Fabric. PAN/CVV/titular siguen exclusivamente Kotlin. [Referencia initializeAuth/persistencia](https://firebase.google.com/docs/reference/js/auth).

### 13.4. Firebase externo

El propietario mostró proyecto Firebase y app web registrada en Console. **Configuración cliente local completada por el propietario y verificada sin imprimir valores**; Email/Password y usuario demo **sin confirmación**. No hubo llamadas reales de login/logout ni cambios remotos del implementador. El propietario indicó que, al finalizar esta preparación, continuaremos con la configuración.

Completar `firebaseConfig.ts` localmente con apiKey/authDomain/projectId/appId de la app web; habilitar proveedor y cuenta demo desde Console; introducir contraseña solo en Login. El propietario pidió mantener la configuración real fuera de Git: `firebaseConfig.ts` está ignorado y `firebaseConfig.ts.example` conserva valores vacíos. `postinstall` crea el archivo local desde ese ejemplo cuando falta, sin sobrescribir uno existente; también puede ejecutarse con `npm run postinstall`. No versionar valores reales ni contraseñas/tokens/admin keys. Recargar la app después de configurar. Ausencia de config muestra error explícito y mantiene cerrado el acceso; no existe bypass demo.

### 13.5. Comandos y resultados

CWD raíz `io-products-benefits`, rama `main`. Entorno inicial Node 20.12.2/npm 10.6.0; comandos JS con PATH de **Node 22.23.4/npm 10.9.9**. Java/JBR 17 y SDK Android existente para Gradle. Ejecutores: **S** entorno restringido; **E** entorno local con acceso aprobado fuera del sandbox; **ningún resultado atribuido a Terminal del propietario**. Logs en `coverage/step09/`, ignorados.

| Comando | Entorno | Exit | Resultado real |
| --- | --- | --- | --- |
| `pwd`, `git branch --show-current`, `git status --short`, versiones, `npm ls react-native firebase` | S raíz | 0 | main; inicialmente solo Step09 untracked; Firebase ausente |
| Lectura completa Step09, PDF pp. 5/7/8 con Swift/PDFKit, fuentes pertinentes | S raíz | 0 | Requisitos consultados, sin reauditar DoD anteriores |
| `npm view firebase version engines --json` | S → E raíz | 1 → 0 | DNS sandbox ENOTFOUND; consulta permitida confirma 13.2.0 |
| `npm view firebase@12 version --json`, versiones/engines/exports concretos Auth/App | E raíz | 0 | Selección 12.19.0 documentada |
| `npm install --save-exact firebase@12.19.0` | E raíz | 1 | EACCES por caché global con archivos root-owned; sin sudo/chown |
| `npm install --save-exact firebase@12.19.0 --cache /private/tmp/io-step09-npm-cache` | E raíz | 0 | 67 paquetes añadidos, versión exacta y único lockfile |
| Prettier sobre archivos TS/TSX afectados | S raíz | 0 | Formato aplicado solo al diff |
| `npm run lint` | S raíz | 0 | PASS, lint-final.log |
| `npm run typecheck` | S raíz | 0 | PASS strict, typecheck-final.log |
| `npm run format:check` | S raíz | 1 inicial → 0 final | Un test nuevo pendiente de formato, corregido; format-final.log |
| `npm test -- --watch=false --runInBand --runTestsByPath src/capabilities/auth/presentation/__tests__/authFlow.test.tsx src/capabilities/auth/infrastructure/__tests__/firebaseAuth.test.ts` | S raíz | 1 inicial | Ajustadas nuevas pruebas/semántica accesible y handlers de formulario; no se relajó regresión histórica |
| `npm test -- --watch=false --runInBand --coverage --json --outputFile=coverage/step09/final-tests.json` | S raíz | 0 final | **113 PASS/13 suites**, coverage-final.log y final-tests.json |
| `npm run test:all` | S raíz | 1 | Jest PASS; Gradle bloqueado antes de tareas por wrapper zip.lck |
| `npm run test:all` | E raíz, SDK definido | 0 | **113 Jest/13 suites** + Gradle BUILD SUCCESSFUL in 2s; 29 tareas up-to-date; test-all-final.log |
| `./node_modules/.bin/react-native bundle --platform android --dev false --entry-file index.js --bundle-output coverage/step09/index.android.bundle --assets-dest coverage/step09/assets --sourcemap-output coverage/step09/index.android.bundle.map` | S raíz | 0 | PASS bundle Android/exports RN; no equivale a smoke de autenticación |
| `npm audit --omit=dev --json --cache /private/tmp/io-step09-npm-cache` | E raíz | 1 | Avisos de dependencias contextualizados §13.8; no audit fix |
| Parsing source map, lock y XML JUnit; `git diff --check`/status | S raíz | 0 final | 44 runtime, RN preserved, sin cambios nativos; helper inicial source-map asumió formato plano y se corrigió para sections |
| Smoke Firebase real en Android | Terminal/emulador del propietario | — | Confirmado manualmente por el propietario; ver escenarios y límite de evidencia en §13.14. El implementador no ejecutó `npm run android` ni observó el emulador |

JUnit: XML canónicos **13 tests**, 3 token + 5 sesión + 5 mapa, 0 failures/errors/skipped. En las ejecuciones oficiales de este paso las tareas estaban **UP-TO-DATE**; timestamps XML `2026-11-06T14:19:21.243Z–.298Z`. **No se afirma que los 13 métodos se reejecutaran** en esta etapa ni se usa el PASS externo de 07 como ejecución nueva. La regresión del pipeline actual sí terminó exitosa, de forma incremental.

| Cobertura | Statements | Branches | Functions | Lines | Runtime |
| --- | --- | --- | --- | --- | --- |
| Paso 07 heredado | 464/480 · 96,66 % | 387/409 · 94,62 % | 157/163 · 96,31 % | 432/446 · 96,86 % | 37/37 |
| Paso 09 real | **550/571 · 96,32 %** | **434/462 · 93,93 %** | **180/187 · 96,25 %** | **514/531 · 96,79 %** | **44/44** |
| Delta cubiertos/totales | +86/+91 | +47/+53 | +23/+24 | +82/+85 | +7 |

Gates S/L >=70 **PASS**, configuración Jest y exclusiones intactas. Nuevos runtime incluidos automáticamente por patrones existentes; los 37 previos se conservan. La leve variación se debe a lógica Auth agregada y rutas de configuración/composición mockeadas en tests: config cliente vacío queda visible al 0 %, no excluido ni cubierto con test trivial. Cuatro entradas 0/0 previas continúan no cuantificables; no equivalen a 100 % demostrado. Snapshot/skipped/todo = 0. No métrica de rendimiento ni auditoría del Paso 08.

### 13.6. Pruebas focalizadas y Android

**Siete pruebas nuevas, dos suites:** cinco RNTL del flujo y dos del adapter/cliente. Cubren: espera inicial sin flash y cleanup; signIn resuelto sin acceso hasta observer, Dashboard con tabs reales y logout; formulario inválido, envíos duplicados, error de credenciales y retry; config ausente/red, limpieza del observer anterior y mensajes públicos; logout fallido/reintento; inicialización en memoria/reuso de app/proyección uid y delegación SDK; config vacía y normalización de fallos SDK.

Las **106 pruebas anteriores se preservan**. Dos suites que montaban App reciben sesión autenticada mediante mock **local de composición**, manteniendo assertions de Products/Benefits/tabs y mappers; no hay bypass productivo ni mock global nuevo. No tests JUnit nuevos ni cambios a Kotlin.

Android: bundle/SDK RN resuelto PASS. El propietario confirmó después el smoke real con cuenta Firebase demo en el emulador `emulator-5556`: login válido, credenciales inválidas, logout y Android Back sin bypass, ambas pestañas, apertura/cierre de Card Secure View y recorrido mapa → carrusel → marcador (§13.14). Estos resultados son manuales y reportados por el propietario, no pruebas ejecutadas ni observadas por el implementador. No se capturaron passwords, tokens ni datos completos de tarjeta.

### 13.7. DoD real

| ID | Estado | Evidencia / límite |
| --- | --- | --- |
| D09-01 | PASS | firebase 12.19.0 exacto; Auth/App engines >=20, Node 22.23.4; bundle Android y 0 versiones previas alteradas |
| D09-02 | PASS | auth con puerto, adapter y hook; sin store/DI/router nuevos |
| D09-03 | PASS | config vacía validada; error explícito sin Dashboard y guía README; sin credenciales reales |
| D09-04 | PASS | Propietario confirmó login real válido al Dashboard y rechazo de credenciales inválidas en Android (§13.14) |
| D09-05 | PASS | authFlow inicial sin flash y observer como única autoridad; tests históricos de tabs conservados |
| D09-06 | PASS | Propietario confirmó logout → Login y Android Back/reapertura sin bypass; política en memoria documentada (§13.14) |
| D09-07 | PASS | validación, secureTextEntry, labels, estado pendiente, error/retry y duplicados PASS RNTL |
| D09-08 | PASS | native-components/Kotlin/specs y puertos Cards/Benefits intactos; Firebase solo uid hacia UI |
| D09-09 | PASS | 113 Jest en 13 suites; 7 casos nuevos, baseline 106 preservada; coverage 44/44 runtime |
| D09-10 | PASS | lint/typecheck/format, test:all y bundle Android PASS; Gradle incremental, sin atribuir métodos JUnit nuevos |
| D09-11 | PASS | Propietario confirmó smoke con cuenta demo en `emulator-5556`: login válido/inválido, logout/Back, dos tabs, Secure View abrir/cerrar y Benefits mapa→carrusel→marcador (§13.14) |
| D09-12 | PASS | README Auth, reporte §13, sin cambios cloud/publicación/Swift ni 08/10/11 |

**12 PASS + 0 BLOQUEADOS = 12 evaluados.** Paso 09 cerrado. D09-04/06/11 se basan en el smoke real ejecutado por el propietario y confirmado en la conversación; las pruebas automatizadas del implementador se reportan por separado y no se atribuye su ejecución al implementador.

### 13.8. Trade-offs y riesgos residuales

- Sesión en memoria deliberada: cierre del proceso/reload requiere login; no AsyncStorage ni persistencia añadida. No mantener contraseña fuera del formulario efímero; SDK gestiona internamente sus tokens.
- La cuenta demo y conectividad se usaron en el smoke Android confirmado por el propietario. Riesgo residual: cuenta educativa/demo y autenticación cliente no sustituyen controles de backend ni son adecuadas como identidad de producción; mantener la contraseña fuera del repositorio y de logs.
- `firebase` instala servicios transitivos aunque solo se importan `firebase/app` y `firebase/auth`. La instalación reportó **24 avisos (11 bajos, 9 moderados, 4 altos)**. Consulta omit=dev: **10 (5 bajos, 1 moderado, 4 altos)**. Los cuatro altos son la cadena `firebase → firestore / firestore-compat → @grpc/grpc-js` (instalado 1.9.16), con advisories GHSA-m9gg-hp2v-232j y GHSA-f596-whhp-79r4. Los riesgos descritos afectan configuraciones/handlers de **servidores Node gRPC**. **No se usan servidores gRPC ni Firestore**: source map del bundle Android muestra 2 fuentes RN Auth y **0 implementaciones Firestore/gRPC**, evidencia sdk-bundle-check.json. Paquetes afectados permanecen en el lock, sin afirmar cero vulnerabilidades ni aplicar overrides/upgrades ajenos al flujo Auth. [Advisory upstream gRPC](https://github.com/grpc/grpc-node/security/advisories/GHSA-m9gg-hp2v-232j).
- Compatibilidad estática y bundling verificados; comportamiento real SDK/RN/servicio requiere smoke. No se añadieron polyfills por sospecha ni se promete paridad Swift/MapKit.
- Auth es extra educativo, sin MFA/registro/recuperación/perfiles/Analytics/backend. No modifica la seguridad nativa ni convierte secureToken mock en auth bancaria.

### 13.9. Git y límites

Inicial `?? docs/steps/STEP-09-EXTRAS.md`, rama main, tracked diff vacío. Documento del propietario preservado y actualizado; sin contenido privado nuevo. Estado final:

```text
 M README.md
 M __tests__/App.test.tsx
 M package-lock.json
 M package.json
 M src/app/AppRoot.tsx
 M src/capabilities/benefits/presentation/__tests__/benefitsPresentation.test.tsx
?? docs/steps/STEP-09-EXTRAS.md
?? src/app/composition/authDependencies.ts
?? src/capabilities/auth/
```

Sin commit/push/publicación, servicios externos auto-configurados, cambios a Kotlin/Gradle, `io-native-components`, TurboModule/Fabric/Codegen, puertos Cards/Benefits o stores. No se reintrodujeron los cambios cancelados del Paso 08. No se ejecutaron Pasos 08/10/11.

### 13.10. Siguiente etapa / detención

Paso 09 completado y detenido tras el reporte. No se inicia `STEP-10-DOCUMENTATION-DELIVERY.md` ni ninguna etapa posterior.


### 13.11. Configuración cliente fuera de Git — decisión posterior del propietario

`firebaseConfig.ts` es exclusivamente local y está ignorado. La plantilla `firebaseConfig.ts.example` contiene campos vacíos y es la única configuración destinada al repositorio. `scripts/prepare-firebase-config.cjs`, ejecutado por `postinstall`, crea el archivo local si falta; conserva cualquier archivo existente. Así una instalación nueva puede compilar sin credenciales y mostrar el estado no configurado. Con `--ignore-scripts`, ejecutar `npm run postinstall` antes de compilar. Esta decisión no modifica el flujo Auth ni sus contratos y no añade dependencias. La validación del emulador permanece a cargo del propietario.

Verificación local de esta decisión: `git check-ignore` confirma el archivo real ignorado y la plantilla no ignorada; `git ls-files` confirma que el archivo real no está versionado. `npm run postinstall` y prueba en un directorio temporal verificaron creación cuando falta y conservación de un archivo existente. `npm install --package-lock-only --ignore-scripts --offline`, lint, typecheck, format:check, sintaxis/formato del script y `git diff --check` PASS. Sin cambios al flujo de sesión ni operaciones en el emulador.


### 13.12. Configuración local completada por el propietario

El propietario completó `firebaseConfig.ts`. Se verificó mediante AST, sin imprimir valores, que apiKey/authDomain/projectId/appId son strings no vacíos y la sintaxis es válida. La plantilla mantiene sus cuatro campos vacíos. Git confirma que la configuración real está ignorada y no está versionada. `npm run typecheck` PASS posterior a la configuración. En ese momento no se ejecutaron llamadas de autenticación remota ni comandos de emulador desde el entorno local; el smoke manual posterior se registra en §13.14.


### 13.13. Correo demo precargado por solicitud del propietario

El propietario confirmó la creación de la cuenta demo y solicitó precargar únicamente su correo. LoginScreen lo muestra editable; la contraseña permanece vacía y solo se introduce en el Login. Se reforzó la prueba existente del formulario inicial, sin añadir casos nuevos. El smoke Android posterior se documenta en §13.14; no se gestionó el emulador desde el entorno local.


### 13.14. Smoke Android confirmado por el propietario — 06/11/2026

El propietario confirmó que los tres grupos de escenarios manuales fueron conformes en Android usando la cuenta demo configurada:

| Escenario | Resultado comunicado |
| --- | --- |
| Firebase Email/Password válido | Login abre Dashboard y están disponibles las dos pestañas existentes |
| Credenciales inválidas | Se muestra el error y se mantiene el acceso cerrado en Login |
| Logout y Android Back | Logout vuelve a Login; Back/reapertura no regresa al Dashboard |
| Regresión focalizada | Card Secure View abre/cierra; Benefits recorre mapa → carrusel → marcador |

Dispositivo reportado por contexto de la sesión: Android Emulator `emulator-5556`. La evidencia es la confirmación manual del propietario; el implementador no ejecutó ni observó estas interacciones y no presenta resultados automatizados para ellas. No se compartieron contraseñas, tokens ni datos completos de tarjetas. Con esta confirmación, D09-04, D09-06 y D09-11 pasan a PASS y el Paso 09 queda en **12/12 PASS**. El Paso 10 no se inicia.
