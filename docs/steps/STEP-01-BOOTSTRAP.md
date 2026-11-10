# STEP-01 — Bootstrap del proyecto

**Proyecto:** `io-products-benefits`  
**Aplicación:** iO Productos & Beneficios  
**Librería nativa:** `io-native-components`  
**Etapa:** 01 de 12  
**Estado:** Completado el 4 de noviembre de 2026  
**Plataformas:** Android (Kotlin, prioritaria) e iOS (Swift, preparada desde el inicio)  
**Documento rector:** `RETO_BCP_TECHNICAL_BASELINE.md`

---

## 1. Prompt de implementación

> **Instrucciones para el agente de desarrollo**
>
> Actúa como un **Chapter Frontend / Senior React Native Engineer**, con experiencia en React Native, TypeScript, Android/Kotlin, iOS/Swift y arquitectura móvil. Vamos a construir el reto técnico iO Products & Benefits **incrementalmente, en 12 pasos**.
>
> **Ejecuta solamente el PASO 01 — BOOTSTRAP.** No avances a los pasos 02 a 12 ni agregues funcionalidad que no corresponda a esta etapa.
>
> Antes de escribir código:
>
> 1. Lee `RETO_BCP_TECHNICAL_BASELINE.md` completo.
> 2. Lee el enunciado `Reto técnico - Chapter Master Frontend.pdf` si está disponible en el repositorio. Ante discrepancias, **el PDF manda en requisitos del evaluador** y el documento maestro manda en nuestras decisiones internas mientras no contradigan el PDF.
> 3. Inspecciona el directorio actual y el entorno antes de inicializar o sobrescribir archivos. Si ya existe una base válida, trabájala sin destruirla.
> 4. Ejecuta los comandos de instalación y verificación que sean posibles en el entorno real; no declares como exitosas verificaciones que no ejecutaste.
>
> **Objetivo de esta ejecución:** dejar una aplicación React Native limpia, reproducible y ejecutable, con TypeScript estricto, herramientas de calidad, prueba de arranque y estructuras mínimas para los próximos pasos, sin desarrollar todavía navegación, tarjetas, beneficios, mapa ni vista segura.

---

## 2. Decisiones ya aprobadas: no volver a debatirlas

| Aspecto | Decisión |
| --- | --- |
| Nombre del repositorio / carpeta | `io-products-benefits` |
| Nombre interno del proyecto React Native | `IoProductsBenefits` |
| Nombre visible de la app | `iO Productos & Beneficios` |
| `package.json` → `name` | `io-products-benefits` |
| Android `applicationId` / `namespace` | `com.ioproductsbenefits` |
| iOS Bundle Identifier | `com.ioproductsbenefits` |
| Nombre de la futura librería propia | `io-native-components` |
| Framework | React Native Community CLI **sin Expo** |
| Lenguaje principal | TypeScript en modo estricto |
| Arquitectura nativa RN | **New Architecture** |
| Plataforma obligatoria prioritaria | Android + Kotlin |
| Segunda plataforma, etapa 11 | iOS + Swift |
| Gestor de paquetes de JS | npm (un único `package-lock.json`) |
| Tests JS | Jest + React Native Testing Library (se integra progresivamente) |
| Calidad | ESLint y Prettier |
| Arquitectura futura | Clean Architecture + SOLID + Vertical Slicing por capability |
| Navegación futura | React Navigation + Bottom Tabs |
| Estado futuro | Zustand |

**Nota de nomenclatura:** mantener `IoProductsBenefits` como identificador nativo interno de proyecto/target y `io-products-benefits` como slug de repositorio/paquete; **no forzar guiones en los identificadores nativos**. Cambiar el nombre visible mediante configuración de cada plataforma.

---

## 3. Versiones y compatibilidad

Estándar de inicio aprobado para **noviembre de 2026**:

- React Native **0.88.0** como versión inicial fijada para crear el proyecto.
- React: usar la versión compatible y generada por la plantilla oficial React Native 0.88; no instalar React por separado con una versión arbitraria.
- Node.js: **22.11.0 o superior**, preferiblemente una versión LTS compatible con RN 0.88. Documentar la versión exacta utilizada.
- JDK: **17** para compilación Android.
- Android SDK, Build Tools, Kotlin, AGP, Gradle, TypeScript, CocoaPods y Xcode: conservar versiones compatibles con la plantilla oficial y fijar/documentar las realmente utilizadas.
- Hermes / New Architecture: conservar la configuración moderna de la plantilla. **No retroceder a la arquitectura Legacy** para simplificar los futuros componentes nativos.

**Comportamiento esperado:** primero ejecutar diagnósticos. Si hay incompatibilidades, resolverlas con la documentación oficial de la versión elegida. No subir versiones de todo el stack por impulso; explicar cualquier desviación antes de aplicarla.

Documentación oficial de referencia:

- https://reactnative.dev/blog/2026/10/19/react-native-0.88
- https://reactnative.dev/docs/set-up-your-environment
- https://reactnative.dev/docs/getting-started-without-a-framework
- https://reactnative.dev/docs/the-new-architecture/using-codegen
- https://reactnative.dev/docs/turbo-native-modules-introduction
- https://reactnative.dev/docs/fabric-native-components-introduction

---

## 4. Inspección del entorno (antes de instalar)

Determina si el equipo es macOS, Linux o Windows y comprueba las herramientas que correspondan.

Ejemplos de comandos de diagnóstico:

```bash
node --version
npm --version
java -version
git --version
```

En macOS, comprobar también:

```bash
xcodebuild -version
xcrun simctl list devices available
pod --version
watchman --version
```

Para Android:

```bash
adb version
adb devices
emulator -list-avds
```

Validar variables de entorno de Android y Java (`ANDROID_HOME`, `JAVA_HOME`), Android Studio, SDK y un emulador compatible.

- Si la herramienta no está instalada, **registrar el bloqueo exacto** y el paso manual requerido.
- No introducir rutas absolutas personales en el repositorio.
- No introducir contraseñas, tokens o claves reales en documentación o configuración versionada.
- No instalar ni actualizar herramientas globales sin necesidad.

---

## 5. Inicialización del proyecto

Si el repositorio aún no tiene una app React Native válida, utilizar **React Native Community CLI**, no Expo:

```bash
npx @react-native-community/cli@latest init IoProductsBenefits --version 0.88.0
```

Luego situar el contenido generado en un repositorio cuyo directorio raíz sea:

```text
io-products-benefits/
```

No crear accidentalmente un segundo proyecto anidado `io-products-benefits/IoProductsBenefits/` ni descartar documentos existentes durante la reorganización.

Configurar y verificar:

1. `package.json` → nombre `io-products-benefits`.
2. `app.json` → nombre interno `IoProductsBenefits` y nombre visible `iO Productos & Beneficios`.
3. Android `applicationId` y `namespace`: `com.ioproductsbenefits`.
4. iOS Bundle ID: `com.ioproductsbenefits` (mantener el target/proyecto generado estable).
5. Nombre visible Android en sus recursos y nombre visible iOS en su configuración, sin romper el esquema de compilación.
6. React Native New Architecture y Hermes según la plantilla.
7. Lockfile npm único, válido y versionado.
8. `.gitignore` apto para Node, Metro, Android, Gradle, Xcode, CocoaPods, cachés, artefactos, credenciales y archivos de entorno.

**Si ya existe una app correctamente inicializada:** no ejecutar `init` de nuevo; validar nombres, estructura y configuración y corregir solo lo imprescindible.

---

## 6. Estructura mínima del repositorio

Crear o conservar una estructura que facilite **Vertical Slicing por capability**, sin llenar el proyecto de implementaciones ficticias:

```text
io-products-benefits/
├── android/                       # proyecto Android generado por RN CLI
├── ios/                           # proyecto iOS generado por RN CLI
├── src/
│   ├── app/                       # entrada / composición de la app
│   ├── capabilities/
│   │   ├── cards/                 # reservado para Paso 03
│   │   └── benefits/              # reservado para Pasos 05 y 06
│   └── shared/                    # transversales reales, no cajón de sastre
├── docs/
│   ├── steps/
│   │   └── STEP-01-BOOTSTRAP.md
│   └── decisions/                 # ADRs mínimos, cuando existan decisiones
├── packages/                       # reservada para la librería nativa propia
├── App.tsx                         # entrada del template, delega a src/app
├── package.json
├── package-lock.json
├── tsconfig.json
├── .gitignore
├── README.md
└── RETO_BCP_TECHNICAL_BASELINE.md
```

**Importante:** `packages/io-native-components/` será la única librería nativa propia, preparada o implementada **en las etapas correspondientes**. En el paso 01 **no** se crean bridges, vistas nativas, TurboModules, Fabric components, especificaciones Codegen ni código Kotlin/Swift de negocio. Se puede dejar solo el directorio contenedor `packages/` o una nota de su propósito.

La arquitectura detallada, los contratos y los límites de dependencia se formalizan en **Paso 02**. Los directorios todavía vacíos pueden conservarse con `.gitkeep` cuando corresponda; no agregar clases o abstracciones sin un caso de uso real.

---

## 7. Aplicación mínima y comprobable

Reemplazar, si procede, la pantalla demostrativa genérica de la plantilla con una pantalla **mínima de arranque**, utilizando únicamente componentes nativos de React Native.

Debe mostrar algo equivalente a:

```text
iO Productos & Beneficios
Bootstrap completado
```

Criterios:

- Renderiza sin errores.
- Posee etiquetas básicas de accesibilidad.
- No simula cards, login, mapa ni beneficios.
- No introduce un sistema visual complejo.
- `App.tsx` sigue siendo una entrada delgada, con la vista de arranque en `src/app/`.
- No agrega secretos ni valores PAN/CVV/titular.

---

## 8. TypeScript y convenciones

Configurar o comprobar:

- `strict: true` en `tsconfig.json`, respetando la configuración oficial de RN.
- Imports organizados y convenciones de nombres coherentes.
- Componentes React en `PascalCase`.
- Variables, funciones y hooks en `camelCase`.
- Nombres de archivos y directorios consistentes; evitar una mezcla arbitraria de convenciones.
- Evitar `any` injustificado, `@ts-ignore` como solución permanente o casts para silenciar errores.
- Preferir contratos tipados sobre objetos sin forma.
- Mantener separada la futura interfaz TS de las implementaciones Kotlin/Swift.

No añadir una infraestructura de aliases, generadores, DI containers o monorepo compleja si no aporta valor comprobable en esta etapa.

---

## 9. Lint, formato y scripts reproducibles

Configurar las herramientas **compatibles con RN 0.88**:

- ESLint.
- Prettier.
- TypeScript.
- Jest a partir de la configuración recomendada por la plantilla.

Definir scripts npm coherentes y probados, idealmente:

```json
{
  "scripts": {
    "start": "react-native start",
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "jest"
  }
}
```

**El bloque anterior es una especificación deseada, no un reemplazo ciego del `package.json`.** Preservar los scripts/configuraciones que necesita la plantilla y ajustar comandos según la instalación real. Evitar que Prettier intente recorrer artefactos generados. No añadir un paso de cobertura mínima todavía: el objetivo global `>=70%` corresponde al paso 07.

Instalar solamente dependencias realmente necesarias **para el bootstrap**. React Navigation, Zustand, Google Maps SDK, Firebase y demás paquetes deben integrarse en sus respectivas etapas, tras verificar compatibilidad.

---

## 10. Prueba de humo

Crear o ajustar al menos una prueba de arranque que compruebe que la aplicación mínima renderiza el título sin fallar.

- Utilizar Jest y el tooling compatible con React Native 0.88.
- Si hace falta React Native Testing Library para la prueba, instalar una versión compatible y documentarla.
- Evitar snapshots voluminosos o tests acoplados a detalles internos innecesarios.
- Mantener los datos sensibles fuera de tests y snapshots.

El comando de prueba debe ser reproducible en una instalación nueva.

---

## 11. Validación del bootstrap

Ejecutar realmente, según los recursos del equipo:

```bash
npm install
npm run lint
npm run typecheck
npm run format:check
npm test -- --watch=false
```

Comprobar ejecución Android:

```bash
npm run android
```

En macOS con Xcode y CocoaPods configurados, preparar/validar también el proyecto iOS:

```bash
cd ios
bundle install
bundle exec pod install
cd ..
npm run ios
```

**Reglas:**

- El objetivo mínimo obligatorio del Paso 01 es que la **app base Android compile y arranque en emulador o dispositivo**, además de ejecutar los checks JS.
- La validación iOS es muy recomendable desde el bootstrap, porque el repositorio debe quedar listo para el Paso 11. Si el entorno no permite compilar iOS, documentar el motivo y no bloquear por ello el avance Android.
- Si el equipo carece de SDK/emulador, registrar el resultado como **NO EJECUTADO por falta de entorno**, no como aprobado.
- Si `bundle install` no corresponde a la plantilla generada, utilizar el mecanismo realmente definido por el proyecto y documentarlo.
- No hacer pasar errores de compilación por advertencias normales.
- Ante un fallo: identificar causa raíz y aplicar la corrección mínima; no reescribir sin motivo la plantilla Gradle, Metro o Podfile.

---

## 12. Git, README y trazabilidad

- Inicializar Git solo si el repositorio no lo está ya.
- Mantener y respetar `.gitignore`.
- Conservar el documento maestro en raíz.
- Guardar este archivo en `docs/steps/STEP-01-BOOTSTRAP.md` como instrucción ejecutable de la etapa.
- Crear un `README.md` **inicial** (no el README final del reto) con:
  - propósito y alcance mínimo;
  - nombres/identificadores;
  - requisitos del entorno;
  - instalación;
  - comandos de Android y, si está disponible, iOS;
  - comandos de lint, typecheck y test;
  - matriz de versiones efectivas;
  - estado del Paso 01;
  - enlace al documento maestro y a los pasos.
- Incluir un registro breve de decisiones solo cuando sean decisiones reales (por ejemplo, `docs/decisions/0001-react-native-cli.md`).
- No crear ni publicar un remoto GitHub, hacer `push`, ni subir credenciales sin una instrucción explícita del propietario.

---

## 13. Criterios de aceptación (Definition of Done — Paso 01)

Marca cada criterio únicamente con evidencia real:

- [x] Existe una sola aplicación React Native, sin proyecto anidado accidentalmente.
- [x] El repositorio/carpeta se llama `io-products-benefits`.
- [x] El identificador interno de la app es `IoProductsBenefits`.
- [x] El nombre visible es `iO Productos & Beneficios`.
- [x] Android utiliza `com.ioproductsbenefits`.
- [x] iOS declara `com.ioproductsbenefits`.
- [x] React Native 0.88.0 y sus versiones compatibles están fijadas en archivos de proyecto.
- [x] TypeScript está en modo estricto.
- [x] Se conserva la New Architecture.
- [x] Existe una estructura mínima `app / capabilities / shared` sin sobrearquitectura.
- [x] Se reserva espacio para `io-native-components` sin crear aún módulos nativos.
- [x] ESLint ejecutado sin errores.
- [x] Typecheck ejecutado sin errores.
- [x] Prettier verificado sin cambios pendientes.
- [x] Prueba de humo Jest ejecutada y aprobada.
- [x] Android compila y abre la pantalla de arranque, o queda un bloqueo verificable de entorno.
- [x] iOS está preparado; si se pudo, compila y abre la pantalla de arranque.
- [x] README inicial actualizado y comandos reproducibles.
- [x] No hay secretos ni datos sensibles expuestos.
- [x] No se implementó funcionalidad reservada a otros pasos.

### Condición para cerrar la etapa

La etapa se considera **completada** cuando los checks de código están verdes y Android arranca en un entorno con toolchain funcional. Si un requisito externo impide probar Android, el resultado debe permanecer **bloqueado**, no completado.

---

## 14. Formato obligatorio de respuesta al finalizar

Al finalizar tu trabajo, entrega un reporte conciso con estas secciones:

1. **Resumen:** qué quedó construido en el Paso 01.
2. **Archivos:** principales archivos creados o modificados.
3. **Versiones:** Node, npm, React Native, React, TypeScript, JDK, Kotlin, Gradle, Android SDK, Xcode/CocoaPods (si aplica).
4. **Comandos ejecutados:** comando y resultado real (`PASS`, `FAIL`, `NO EJECUTADO`).
5. **Evidencia de ejecución:** en qué emulador/dispositivo se probó Android/iOS.
6. **Decisiones/trade-offs:** solo cambios relevantes respecto al plan.
7. **Pendientes o bloqueos:** con causa raíz y siguiente acción concreta.
8. **DoD:** checklist de aceptación actualizado.
9. **Siguiente paso:** indicar que corresponde `STEP-02-ARCHITECTURE.md`, **sin ejecutarlo**.

**No afirmes “todo listo” si no fue posible compilar o probar. No adelantes funcionalidades.**

---

## 15. Fuera de alcance del Paso 01

**No implementar todavía:**

- Dashboard y tabs definitivas;
- login / Firebase;
- tarjetas y cuentas;
- mocks `cards.json`, `benefits.json` y lógica de negocio;
- `secureToken`, HMAC o validación;
- Card Secure View;
- componentes nativos / bridge / TurboModule / Fabric;
- Google Maps SDK / MapKit;
- carrusel y sincronización de marcadores;
- estado global con Zustand;
- arquitectura detallada y contratos de dominio del Paso 02;
- baterías de pruebas de producto, bridge o seguridad;
- optimización avanzada, publicación de librería o video final.

**Resultado que buscamos:** una base React Native profesional, verificable y fácil de explicar sobre la que se pueda trabajar sin rehacer el proyecto en el Paso 02.
