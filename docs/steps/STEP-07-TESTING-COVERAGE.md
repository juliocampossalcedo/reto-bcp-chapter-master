# STEP-07 — Testing integral y cobertura efectiva (React Native / TypeScript / Android)

> **Actualización de alcance — 06/11/2026:** el Paso 08 fue **OMITIDO por decisión del propietario**, por resultar redundante para el reto BCP. Su documento de ejecución fue eliminado. Las referencias históricas a esa etapa corresponden al plan original y no constituyen trabajo pendiente ni un requisito de cierre. Este paso conserva su aprobación y sus controles implementados.

**Proyecto:** `io-products-benefits`  
**Aplicación:** iO Productos & Beneficios  
**Librería nativa única:** `io-native-components`  
**Etapa:** 07 de 12  
**Versión de este documento:** 1.2 — ejecución y cierre validado del Paso 07 (§25)  
**Estado:** **COMPLETADO Y VALIDADO — 65/65 DoD PASS; comandos nativos confirmados desde Terminal del propietario**  
**Prerrequisitos confirmados por el propietario:** Pasos 01–06 **completados y aprobados**  
**Referencia de cierre vigente:** `STEP-06-MAP-CAROUSEL-SYNC.md`, **§24.14**: 57/57 DoD aplicables; criterio original 42 (TalkBack manual) **EXCLUIDO / NO APLICA**  
**Stack inmutable:** React Native **0.88.0** + TypeScript estricto, New Architecture, React Navigation, Zustand, TurboModule, Fabric, Codegen; Android/Kotlin  
**Plataforma principal:** Android + Google Maps SDK oficial  
**Plataforma adicional:** iOS/Swift y MapKit **reservados al Paso 11**  
**Ruta prevista en el repositorio:** `docs/steps/STEP-07-TESTING-COVERAGE.md`  
**Documento rector:** `RETO_BCP_TECHNICAL_BASELINE.md`  
**Enunciado oficial:** `Reto técnico - Chapter Master Frontend.pdf`

> **Estado documental:** §§1–24 conservan las instrucciones aprobadas y la línea base histórica. **§25 registra la ejecución real**, el inventario, pruebas, métricas y cierre de los dos bloqueos mediante Terminal del propietario. Los porcentajes históricos no se reutilizan como evidencia nueva. No se creó otro MD de reporte.

---

## 1. Plan de implementación

> Actúa como **Chapter Frontend / Staff React Native Engineer y responsable de calidad**, especializado en React Native **0.88.0**, TypeScript estricto, Jest, React Native Testing Library (RNTL), cobertura Istanbul/Jest, Clean Architecture, capabilities BIAN, Zustand, New Architecture, TurboModule/Fabric/Codegen y JUnit/Kotlin.
>
> **EJECUTA EXCLUSIVAMENTE EL PASO 07 — TESTING INTEGRAL Y COBERTURA.** Trabaja en el repositorio **existente** `io-products-benefits`. Los Pasos **01–06 están cerrados y aprobados**; el Paso 05 terminó en **47/47 DoD** y el Paso 06 en **57/57 criterios aplicables**. **NO** reimplementes, reaudites históricamente ni reabras esas etapas.
>
> **Objetivo:** establecer el **denominador real de cobertura de toda la capa React Native/TypeScript productiva pertinente**, identificar omisiones de instrumentación, revisar y **reutilizar** las 90 pruebas Jest / 10 suites vigentes, fortalecer únicamente escenarios insuficientemente protegidos, preservar y ejecutar las 13 pruebas JUnit nativas, producir un reporte reproducible y demostrar el **mínimo recomendado por BCP de 70 % de cobertura React Native**, con métricas, exclusiones y límites explícitos.
>
> **No confundas** cobertura instrumental, cobertura funcional y validación manual; ninguna reemplaza a las otras. No agregues pruebas triviales para subir porcentajes, no modifiques código productivo para satisfacer mocks ni escondas archivos sin cobertura mediante patrones de exclusión. Mantén `npm test`, `npm run test:native:android` y `npm run test:all` operativos. Los tests unitarios obligatorios deben seguir disponibles mediante un solo comando `npm test`.
>
> **Empieza con una inspección de solo lectura** (fuentes, tests existentes, configuración Jest y alcance del reporte). Registra la línea base de coverage **antes de ampliar tests**, corrige la **instrumentación** si es insuficiente, identifica la matriz de vacíos realmente probados y desarrolla solo los tests de alto valor que falten. Si detectas un defecto reproducible en comportamiento productivo, documenta primero el escenario y limita el fix al mínimo estrictamente necesario, sin cambiar contratos. No conviertas este paso en hardening general.
>
> **Ejecuta realmente** los checks y suites que permita el entorno. Proporciona evidencia de comandos, test count, matriz existente/extendida, archivos elegibles e ignorados y reporte final `coverage/`. Un bloqueo real de Gradle, emulator o sandbox se reporta como `BLOQUEADO`/`NO EJECUTADO`, jamás `PASS`. No declares aprobado este paso si no puedes acreditar el umbral sobre un denominador íntegro o la regresión nativa exigida.
>
> Preserva cambios del propietario; **no hagas commit, push, releases, publicación npm, cambios de remotos ni exposición de credenciales**. Al terminar presenta **exactamente el reporte de §21**, actualiza el checklist §20 con evidencias y **DETENTE**. **No ejecutes el Paso 08 ni ninguna etapa posterior.**

### 1.1. Fuentes y orden de lectura obligatorio

1. **PDF oficial** `Reto técnico - Chapter Master Frontend.pdf`: especialmente páginas **2–4** (datos sensibles, tabs, contratos mapa/secure view) y **6–7** (pruebas obligatorias, errores, bordes, `--coverage` y 70 % recomendado). Si el implementador no encuentra físicamente el PDF en su checkout, **debe informarlo** y consultar el baseline, sin afirmar haberlo leído.
2. **`RETO_BCP_TECHNICAL_BASELINE.md`**: arquitectura, capacidades, seguridad, testing y cobertura.
3. **`docs/steps/STEP-02-ARCHITECTURE.md`**: contratos aprobados de `Card`, `Account`, `Benefit`, `SecureTokenProvider`, `SecureViewGateway`, `AvailableCardBrandsReader`, `MapMarker` y `CustomMapProps`.
4. **`docs/steps/STEP-04-NATIVE-SECURE-VIEW.md`**: una sola librería; interfaz de TurboModule, política de token **60 s**, sesión **45 s**, eventos, seguridad y scripts de test.
5. **`docs/steps/STEP-05-BENEFITS-CUSTOM-MAP.md`**, principalmente §11 (diseño de tests) y cierre **§21.9**: pipeline de datos/elegibilidad, wrapper Fabric, mapa y **13 JUnit**.
6. **`docs/steps/STEP-06-MAP-CAROUSEL-SYNC.md` completo**, especialmente §14 (J01–J40), §18 (DoD) y **§24.14 (cierre definitivo)**. **§§24.1–24.13 registran estados históricos; en contradicción prevalece §24.14.** No utilizar cifras parciales anteriores como estado vigente.
7. **Checkout real**: `package.json`, `jest.config.*`, setups, transformaciones, scripts, código `src/`, runtime TS/TSX de `packages/io-native-components/src/`, tests actuales, `App.tsx`, archivos de cobertura si existen y configuración Gradle del paquete. **La implementación real manda para ubicar archivos y juzgar qué está probado**, siempre dentro de los contratos aprobados.
8. **Este Paso 07** y documentación oficial enlazada en §23 para detalles de Jest/RNTL compatibles con las versiones **realmente instaladas**.

**Precedencia:** requisitos del **PDF oficial > baseline técnico > contratos aprobados y comportamiento real validado 01–06 > este documento > conveniencias de implementación de tests**. Si hay una discrepancia significativa, registrar el conflicto y preservar la solución segura, sin redefinir contratos para simplificar pruebas.

### 1.2. Reglas de intervención

- Identificadores intactos: `io-products-benefits`, `IoProductsBenefits`, `io-native-components`, `com.ioproductsbenefits` y `com.ioproductsbenefits.nativecomponents`.
- React Native **0.88.0**, Hermes/New Architecture, TypeScript `strict`, npm y **único** `package-lock.json` intactos. No usar Expo, Legacy Bridge, wrappers de mapas ni nuevas librerías nativas.
- **No** modificar firmas de dominio/aplicación, API pública de `CustomMap`, `SecureViewGateway`, TurboModule o Codegen para elevar coverage.
- **No** modificar Kotlin/Fabric/Codegen por testabilidad. JUnit se ejecuta como regresión; incorporar tests Kotlin solo si un vacío real, de alto riesgo y testeable sobre el seam existente lo justifica **sin cambiar producción**.
- **No** instalar nuevas herramientas de test, frameworks de mocking o E2E por rutina. Aprovechar Jest, RNTL, JUnit y el tooling existente.
- **No** implementar Firebase, Swift, MapKit, backend, release/publishing, perf profiling profundo ni hardening global del Paso 08.
- **No** imponer ni reportar una prueba manual específica de TalkBack. El criterio 42 original del Paso 06 permanece **EXCLUIDO / NO APLICA**. La semántica y controles de accesibilidad estándar **sí** se prueban con RNTL.
- No reabrir los DoD de etapas cerradas: la ejecución de tests anteriores es **regresión del Paso 07**, no repetición de auditorías históricas.

---

## 2. Línea base confirmada y límites de evidencia

### 2.1. Estado aprobado al entrar al Paso 07

| Dimensión | Evidencia previa confirmada | Interpretación correcta |
| --- | --- | --- |
| Pasos 01–04 | Completados y aprobados por el propietario | No reabrir funcionalidades ni contratos. |
| Paso 05 | **47/47 DoD** (§21.9) | Benefits + `CustomMap` Android aprobados. |
| Paso 06 | **57/57 DoD aplicables** (§24.14) | Carrusel/sincronización aprobados; criterio 42 excluido. |
| Jest | **90 PASS, 10 suites** | Línea base de regresión, **no** número obligatorio de tests nuevos. |
| JUnit/Kotlin | **13 PASS** (5 de mapa + 8 de token/sesión, según cierre 05) | Mantener y volver a ejecutar vía script existente. |
| `npm run test:all` | PASS desde la terminal del propietario (registro del Paso 06, §24.10/§24.14) | Evidencia pasada; **debe volver a ejecutarse** al cerrar Paso 07. |
| Statements (instrumentados) | **95,78 %** | No es coverage global auditado. |
| Branches (instrumentadas) | **91,19 %** | No es coverage global auditado. |
| Functions (instrumentadas) | **97,50 %** | No es coverage global auditado. |
| Lines (instrumentadas) | **95,69 %** | No es coverage global auditado. |
| Accesibilidad | Labels, roles, selected state, alternativa textual y controles no gestuales validados | No implica prueba manual TalkBack. |
| Límite Android | Se confirmó zoom visible tras corrección en `CustomMapView` y sincronización funcional | No equivale a traza completa de eventos, FPS/leaks ni una auditoría de Codegen. |
| iOS | Ambas tabs y fallback honesto reportados en Paso 06 | No existe implementación Swift/MapKit de esta librería. |

**Advertencia central:** `95,78 %` de statements, `91,19 %` de branches, `97,50 %` de functions y `95,69 %` de lines **solo describen los archivos que Jest instrumentó al cierre del Paso 06**. No se conoce todavía el **inventario completo de archivos productivos TS/TSX que deberían entrar en ese denominador**. Por tanto **no se puede declarar aún el 70 % global BCP** mediante esas cifras.

### 2.2. Código y suites documentados, no una inspección actual del checkout

El Paso 06 §24.2/§24.5 identifica implementaciones y tests tales como:

- `src/capabilities/benefits/presentation/store/useBenefitsStore.ts`.
- `src/capabilities/benefits/presentation/utils/reconcileBenefitSelection.ts`.
- `src/capabilities/benefits/presentation/utils/CarouselCoordinator.ts`.
- `src/capabilities/benefits/presentation/components/BenefitsCarousel.tsx`.
- `src/capabilities/benefits/presentation/components/BenefitCarouselCard.tsx`.
- `src/capabilities/benefits/presentation/screens/BenefitsScreen.tsx`.
- `src/capabilities/benefits/presentation/__tests__/selectionAndScroll.test.ts`.
- `src/capabilities/benefits/presentation/__tests__/carouselIntegration.test.tsx`.
- `src/capabilities/benefits/presentation/__tests__/benefitsPresentation.test.tsx`.
- Integración Cards, emisión de tokens y adapters `IoSecureView`, wrapper `CustomMap` y tests previos (rutas finales a verificar en repositorio).

La existencia documentada de estos archivos **orienta la auditoría**, pero **no** prueba que cada línea/branch esté cubierta; tampoco autoriza asumir que un test faltante debe implementarse antes de leer las suites.

### 2.3. Fronteras de cobertura a reconocer

1. **React Native/TypeScript productivo:** se audita con **Jest `--coverage`**; incluir también los archivos productivos que **no se importaron durante las pruebas**.
2. **Kotlin nativo:** se prueba con **JUnit** existente. **No** sumar 13 JUnit a porcentajes de Jest ni presentar un porcentaje Jest como coverage nativo.
3. **TurboModule/Fabric/Codegen:** Jest prueba **adaptadores y contratos TS** con dobles de las fronteras físicas; JUnit prueba lógica Kotlin extraíble; **build Android/runtime** prueban vinculación y render real.
4. **Pruebas manuales:** validan comportamientos del OS/SDK difíciles de simular (mapa, screenshots bloqueadas, Activity, gestos reales), **sin porcentaje de líneas**.

---

## 3. Objetivo, entregables y definición de éxito

### 3.1. Objetivo verificable

Al cerrar el Paso 07 debe existir una **cobertura efectiva, reproducible y auditable de React Native/TypeScript** con un denominador declarado, una matriz de funcionalidades críticas cubierta por tests con valor, y **ninguna regresión** en el Dashboard, Cards, Secure View, Benefits, mapa o carrusel. El objetivo recomendado por el evaluador es **≥ 70 % de cobertura React Native**, aclarando que el PDF no fija una métrica interna única.

### 3.2. Entregables permitidos

1. **Inventario** de fuentes productivas RN/TS/TSX, entradas en coverage, exclusiones justificadas y archivos no medidos.
2. **Comparativo** de cobertura: reporte heredado del Paso 06 (instrumentado) vs. baseline auditada con denominador completo vs. reporte final tras tests.
3. Configuración **Jest reproducible** con `collectCoverageFrom` (y `coverageReporters`/umbrales si procede), sin alterar el preset funcional RN 0.88.
4. **Matriz de pruebas** que identifique lo existente, lo suficiente, lo faltante, lo incorporado y lo que queda manual/native.
5. Extensión **mínima y focalizada** de Jest/RNTL para casos críticos no cubiertos; sin duplicar arbitrariamente J01–J40.
6. Regresión **13 JUnit** mediante script nativo oficial del repo; JUnit nuevos solo con justificativo verificable.
7. Comandos estándar verdes, cobertura cuantificada y evidencia de no exposición de datos sensibles.
8. Actualización **acotada** del README sobre testing, alcance/denominador, comandos, porcentajes y limitaciones.
9. Reporte formal del implementador de §21 y estado real de los DoD §20.

### 3.3. No son entregables de este paso

Nuevas pantallas/product features; navegación distinta; segunda librería; Native Modules adicionales; alteración por rutina de Google Maps SDK, Kotlin, Codegen o Gradle; Suite E2E; Firebase; Swift/MapKit; correcciones cosméticas/benchmarking/hardening del Paso 08; publicación de paquete; nueva auditoría de 01–06; pruebas manuales específicas de TalkBack.

---

## 4. Distinción obligatoria: cobertura instrumental, funcional y manual

| Concepto | Qué demuestra | Cómo se acredita | Qué **NO** demuestra |
| --- | --- | --- | --- |
| **Cobertura instrumental** | Proporción de statements, branches, functions y lines ejecutadas respecto de **archivos elegibles instrumentados** | `collectCoverageFrom`, `coverage-summary.json`, `lcov.info`, `lcov-report`, inventario de archivos y configuración Jest | Calidad de assertions, UX Android, seguridad del OS, vínculo físico nativo. |
| **Cobertura funcional** | Que requisitos/escenarios críticos tienen assertions útiles sobre la conducta real de la capa correspondiente | Matriz requisito → test concreto → escenario → resultado; RNTL/Jest/JUnit | % de líneas universal; interacción física de la plataforma. |
| **Validación manual** | Que gestos, layout, APIs y protección del sistema se comportan en dispositivo/emulador real | Escenarios y evidencia **efectivamente ejecutados**; priorizar regresión focalizada | Cobertura instrumental o cumplimiento unitario por sí solos. |

**Reglas:**

- Un `100 %` de un subconjunto de archivos **no equivale** a `100 %` de RN. Un test que solo comprueba que un componente se monta **no demuestra** sincronización ni ausencia de exfiltración.
- JUnit y pruebas del bridge no alteran el denominador RN de Jest; reportarlos **por separado**.
- La matriz funcional debe indicar **frontera física mockeada**. No atribuir a Jest la prueba de teselas, `FLAG_SECURE` ejecutándose o realismo de secuencia `momentum` en Android.
- La **validación manual de 01–06 permanece aprobada**. En este Paso 07 solo se requerirá un smoke **proporcional a los cambios efectivamente realizados**; si el cambio es puramente de config/tests, no exigir repetir todas las matrices manuales históricas.

---

## 5. Fase A — Diagnóstico inicial, sin modificación de producto

### 5.1. Estado de working tree y herramientas

Desde la **raíz real** del repositorio, ejecutar:

```bash
pwd
git branch --show-current
git status --short
node --version
npm --version
npm ls react-native jest @testing-library/react-native
```

**Registrar:** rama, cambios preexistentes (distinguirlos de los nuevos), versiones efectivas y limitaciones de entorno. No revertir/reinicializar/limpiar el trabajo del propietario. No leer ni imprimir `android/secrets.properties`, credenciales de Maps ni archivos privados ignorados.

### 5.2. Inventario del árbol productivo y suites

Inspeccionar, **sin ejecutar todavía cambios**:

```bash
# Inventario de fuentes, contratos y pruebas; salida a revisión local, no supone que
# todos estos archivos deban instrumentarse ni que todo .ts sea runtime.
rg --files src packages/io-native-components/src
rg --files src packages/io-native-components/src | rg '(__tests__/|\.(test|spec)\.[jt]sx?$)'

# Localizar configuración y scripts sin imprimir secretos:
rg --files -g 'jest.config.*' -g '*jest*setup*' -g 'package.json' \
  -g 'tsconfig*.json' -g 'babel.config.*' -g '.gitignore'

# Descubrir suites que Jest realmente resuelve:
npm test -- --listTests --runInBand
```

Si la CLI Jest instalada interpreta `--listTests` con otra combinación de flags, usar su sintaxis efectiva sin cambiar la semántica de `npm test`. Registrar el **número real de archivos productivos, suites, tests ejecutables, skipped/todo y archivos no importados**. **No asumir** que los 90 tests siguen intactos si el checkout actual difiere; investigar y explicar.

### 5.3. Configuración efectiva de Jest

Revisar:

- `preset` RN y configuración heredada; archivo de config real (`jest.config.js`, etc.), transforms de Babel/Metro y módulos mocks.
- `rootDir`, `roots`, `testMatch`/`testRegex`, `testPathIgnorePatterns`, `moduleNameMapper`, `setupFiles`/`setupFilesAfterEnv`, `transformIgnorePatterns`, `coverageProvider`, `collectCoverage`, `collectCoverageFrom`, `coveragePathIgnorePatterns`, `coverageReporters`, `coverageDirectory`, `coverageThreshold`.
- Si `packages/io-native-components/src` **realmente** entra en `rootDir` y cobertura; cuidado con su `node_modules` symlink de dependencia local y con doble contabilización.
- Si el `App.tsx`, la composición, data sources, repositorios, gateways, wrappers nativos y stores **quedan** dentro de los patrones. Tener tests que importan una parte no garantiza que todos los archivos sean elegibles.
- Si hay restricciones involuntarias por `collectCoverageOnlyFrom`, `forceCoverageMatch`, ignores duplicados o un `collectCoverageFrom` solo de `benefits/presentation`.
- Separar **inclusión de tests** (`testMatch`) de **inclusión del código productivo** (`collectCoverageFrom`); son dos inventarios diferentes.

**Evidencia exigida:** tabla de config anterior, efecto de patrones, rutas reales y ejemplos verificables de archivos **incluidos/excluidos**, no solo una captura del porcentaje total.

### 5.4. Baseline pre-cambio

Ejecutar, **antes de alterar config o tests**:

```bash
npm test -- --watch=false --runInBand --coverage
```

Guardar el resultado inicial y los archivos existentes de `coverage/` **en su alcance real**, sin publicar por defecto el contenido de `coverage/`. No sobrescribir los únicos datos de la comparación: si se van a regenerar outputs, registrar antes los valores y el inventario en el reporte (o copia temporal local segura e ignorada).

**Si el comando falla por una configuración antigua**, registrar causa raíz y el estado `FAIL`. No convertir el reporte previo del Paso 06 en una ejecución nueva. Si el comando corre y muestra 95 % otra vez, **sigue sin cerrar el requisito** hasta la auditoría de archivos.

---

## 6. Fase B — Auditoría del denominador RN/TypeScript

### 6.1. Qué cuenta como capa React Native

El **denominador principal** será el código **runtime, mantenido por el proyecto y ejecutable o llamado desde React Native/TypeScript**, tanto en la app como en la API/adaptadores TS de la librería local:

| Superficie RN/TS | Política por defecto | Justificación |
| --- | --- | --- |
| `src/app/**/*.{js,jsx,ts,tsx}` | **INCLUIR** | Composition root, Dashboard, navegación, tema/runtime y wiring. |
| `src/capabilities/cards/**/*.{js,jsx,ts,tsx}` | **INCLUIR** | Dominio ejecutable, casos de uso, repositorios, data sources, UI, tokens y gateways. |
| `src/capabilities/benefits/**/*.{js,jsx,ts,tsx}` | **INCLUIR** | Elegibilidad, mapper, dataset, store, coordinador, mapa/carrusel y UI. |
| `src/shared/**/*.{js,jsx,ts,tsx}` | **INCLUIR** | Utilidades y lógica común runtime. |
| `App.tsx` (o entry equivalente real) | **INCLUIR** | Entry productivo RN incluso si es delgado. |
| `packages/io-native-components/src/**/*.{js,jsx,ts,tsx}` | **INCLUIR** por defecto | Wrappers, exports y frontera Codegen TS de la **única** librería propia. |
| `.test`, `.spec`, `__tests__`, `__mocks__`, fixtures de test | **EXCLUIR** | Son infraestructura de pruebas, no líneas de producto. |
| `.d.ts` y archivos estrictamente declarativos sin runtime | **EXCLUIR** | No hay instrucciones runtime medibles. |
| Código generado automáticamente (`build`, `generated`, artefactos Codegen) | **EXCLUIR** | No lo mantiene el equipo; verificar que no se excluyan los **wrappers propios**. |
| `node_modules`, `android`, `ios`, Kotlin/Java/Swift, Pods, Gradle | **EXCLUIR del Jest RN** | Otro lenguaje/toolchain o dependencias externas. Kotlin se cubre separadamente con JUnit. |
| Configs, scripts CLI, `babel.config`, `jest.config` | **EXCLUIR salvo runtime integrado real** | Tooling de build/test, no lógica de la app. |
| Assets, mocks JSON de producto, README, `.md` | **No instrumentables en Jest** | Se auditan mediante tests de consumo/validación, no por líneas TS. |

**Precisión sobre Codegen:** la **spec propia** `NativeIoSecureView.ts` puede contener tanto tipos como código runtime (`TurboModuleRegistry.get<Spec>(...)`). **No excluir automáticamente `packages/io-native-components/src/specs/**`** por llamarse `specs` o por ser frontera Codegen. Revisar qué se transforma/ejecuta en la versión real; excluir únicamente lo que sea generado o no instrumentable, con **ruta y justificación individual**. `CustomMapNativeComponent.ts` puede incluir un registro runtime `codegenNativeComponent`. Lo mismo aplica al `index.ts` del paquete: no ocultar imports/exports propios sin causa documentada.

### 6.2. Regla anti-maquillaje

**Prohibido:** retirar de `collectCoverageFrom` pantallas, hooks, casos de uso, data sources, adapters o stores poco probados; excluir por wildcard todo `infrastructure`, `native`, `app`, `specs` o `index`; aplicar `/* istanbul ignore */` indiscriminado; mover lógica sin tests fuera del alcance; usar `coveragePathIgnorePatterns` para esconder rutas productivas; o excluir un archivo solo porque su porcentaje es bajo.

Exclusiones legítimas requieren **tres datos**: ruta/patrón exacto, explicación verificable (generado, type-only, test-only, no producto), y evidencia de que **no se pierde lógica runtime propia**. Deben quedar en la matriz §6.4 y reporte final.

### 6.3. Verificación del denominador

Después de configurar `collectCoverageFrom`, ejecutar el reporte auditable e inspeccionar:

1. **Total de archivos productivos elegibles** identificados en el árbol.
2. **Total de archivos** listados con métricas en `coverage/coverage-summary.json` (sin contar `total`).
3. Coincidencia **archivo por archivo**, normalizando rutas para evitar duplicar symlink real/link.
4. Archivos incluidos aunque **nadie los importe** (normalmente aparecen con **0 %** si son runtime instrumentables).
5. Archivos `0/0` por ser solo tipos: decidir su exclusión justificada **sin tratar 0/0 como 100 %**.
6. Rutas de producción excluidas voluntariamente y justificación; rutas esperadas **ausentes** en coverage.
7. Confirmar que `total` no incluye `src` dos veces a través de `node_modules/io-native-components` y `packages/io-native-components`.

La integridad del denominador es un **gate anterior** a comparar con 70 %. Si existe un archivo productivo ejecutable no incluido, **no declarar cobertura global RN aprobada** aunque el porcentaje de `total` supere 70 %.

### 6.4. Matriz de inventario exigible (el implementador completa con rutas reales)

| Ruta o grupo real | Capability/capa | ¿Runtime propio? | ¿Elegible? | ¿Aparece en reporte? | Statements / Branches / Functions / Lines | Exclusión o acción |
| --- | --- | --- | --- | --- | --- | --- |
| `src/app/...` | Composición/navegación | Por inspeccionar | Por clasificar | Por verificar | **No medido aún** | — |
| `src/capabilities/cards/...` | Cards (todas las capas) | Por inspeccionar | Por clasificar | Por verificar | **No medido aún** | — |
| `src/capabilities/benefits/...` | Benefits (todas las capas) | Por inspeccionar | Por clasificar | Por verificar | **No medido aún** | — |
| `src/shared/...` | Shared | Por inspeccionar | Por clasificar | Por verificar | **No medido aún** | — |
| `packages/io-native-components/src/...` | Wrappers/specs TS | Por inspeccionar | Por clasificar | Por verificar | **No medido aún** | — |
| `App.tsx` / entry real | Entrada | Por inspeccionar | Por clasificar | Por verificar | **No medido aún** | — |
| Archivos test-only/type-only/generados | No producto runtime | Según caso | No, con justificación | No | N/A | Justificar patrón exacto |

**Entrega:** sustituir estas filas orientativas por inventario cuantificado completo o apéndice CSV/Markdown en la documentación técnica del Paso 07. No rellenarlas con `PASS` sin la enumeración real.

---

## 7. Configuración Jest reproducible y reporte de coverage

### 7.1. Principio

**Extender la configuración existente**, **no reemplazar** el `jest.config.*`, el preset RN 0.88, el transformer ni los setups globales aprobados. Una configuración que dibuja un porcentaje alto pero rompe los tests existentes **no cumple** el Paso 07. Validar sintaxis/options con la **versión de Jest realmente instalada**.

### 7.2. Ejemplo orientativo de los campos a incorporar

**Pseudoconfiguración parcial**: integrar solo los campos necesarios en el config real, conservando los demás. **No copiar `module.exports` sobre la configuración completa.** Ajustar rutas si el árbol realmente difiere.

```js
// Campos ilustrativos de jest.config.js (NO un reemplazo completo del config).
// Conservar: preset: 'react-native', transforms, setup, mocks y mappings actuales.
const coveragePolicy = {
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    'packages/io-native-components/src/**/*.{js,jsx,ts,tsx}',
    'App.tsx',
    '!**/*.d.ts',
    '!**/__tests__/**',
    '!**/__mocks__/**',
    '!**/__fixtures__/**',
    '!**/*.{test,spec}.{js,jsx,ts,tsx}',
    '!**/jest.setup.{js,ts}',
    // Añadir EXCLUSIONES EXTRA solo con inventario + razón documentada.
    // NO excluir src/**/infrastructure ni src/specs/** por defecto.
  ],
  coverageProvider: 'babel', // Compatible con el transform RN/Jest; confirmar config real.
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'json-summary',
    'lcov',
    'html',
  ],
};
```

**Notas de integración:**

- Los globs negativos vienen **después** de los inclusivos. Evitar invertir el orden y reintroducir archivos test-only.
- `coverageProvider: 'babel'` es el punto de partida coherente con el preset/transform RN y la instrumentación Istanbul. **No** forzar cambio a `v8` solo para variar porcentajes; si el proyecto funciona ya con otro proveedor, medir y justificar cualquier cambio y no comparar cifras de proveedores distintos como si fuesen idénticas.
- `collectCoverageFrom` cuenta archivos **no cargados por los tests**; comprobar que su definición no perjudique los tests normales cuando `--coverage` no está activo.
- No introducir `forceExit` ni sleeps para ocultar handles abiertos. Evitar transforms adicionales si el preset ya resuelve el paquete local.
- Si el script `test` ya añade opciones, preservar su intención; los flags de CI deben ser compatibles con la configuración real.
- Mantener `coverage/` ignorado por Git (sin `git add` indiscriminado ni publicación de HTML con nombres/datos de producción).
- Si `coverageReporters` no puede generar `json-summary` con la versión efectiva, verificar disponibilidad y usar un formato equivalente **con trazabilidad explícita**, no inventar el archivo.

### 7.3. Comandos objetivo

```bash
# Suite RN normal: un solo comando debe funcionar (requisito PDF).
npm test

# Ejecución RN determinista local / CI (modo no watch):
npm test -- --watch=false --runInBand

# Cobertura auditable: incluir todos los archivos RN runtime del denominador:
npm test -- --watch=false --runInBand --coverage

# Regresión nativa y combinada (scripts existentes aprobados):
npm run test:native:android
npm run test:all
```

**Opcional**: añadir `npm run test:coverage` como alias explícito de los flags Jest ya probados si aporta reproducibilidad, **sin sustituir** `npm test` ni hacer que `test:all` omita JUnit. No añadir nuevos frameworks. El pipeline `test:all` **debe fallar** si fallan Jest o JUnit: no usar `;`, `|| true`, swallowing de exit codes o wrappers silenciosos.

### 7.4. Artefactos verificables

- `coverage/coverage-summary.json`: **métricas globales y por archivo**, cuando esté disponible.
- `coverage/lcov.info`: inspección de líneas/branches y visibilidad en herramientas compatibles.
- `coverage/lcov-report/index.html`: exploración local legible; no cometer al repositorio automáticamente.
- Salida CLI de Jest con suites/tests ejecutados y porcentaje final, guardando **solo metadatos seguros**.
- Matriz de archivos incl./excl. §6.4, **independiente** del resultado porcentual.

**Regla de reproducibilidad:** otra persona desde checkout limpio con `npm ci` y toolchain declarado debe poder ejecutar los mismos scripts y obtener el mismo **denominador**; variación eventual de resultados debe investigarse. No imponer igualdad byte a byte de HTML/tiempos. La ejecución `npm ci` puede ser una verificación adicional en entorno limpio si los recursos lo permiten, pero **no** debe cambiar el lockfile ni instalar globales.

---

## 8. Política de umbrales: mínimo del evaluador, no números arbitrarios

### 8.1. Interpretación explícita del 70 %

El PDF del reto exige generar coverage con `--coverage` y **recomienda como mínimo 70 % en la capa React Native**; **no** define si se trata de statements, branches, functions o lines. Para un criterio transparente y evaluable del Paso 07:

1. **Gate mínimo RN de aceptación:** **`global.statements >= 70 %` y `global.lines >= 70 %`** sobre el **denominador RN íntegro** auditado de §6. Se eligen ambas como lectura conservadora del requisito por líneas de código ejecutables y sentencias, **no** como un número superior inventado.
2. **Branches y functions:** **reportarlas obligatoriamente**, examinar hotspots y casos críticos. No presentar 70 % de branches/functions como exigencia literal del PDF; **adoptar umbral adicional solo si el baseline auditado y la matriz funcional lo justifican** y se puede sostener sin tests artificiales.
3. **Sin cuotas por archivo inventadas:** ningún `90 %` o `100 %` universal, ni `80 %` arbitrario por capability. Un archivo crítico con rama de seguridad sin prueba **se corrige por riesgo funcional**, aunque el global supere 70 %.
4. **Sin exclusiones compensatorias:** si el porcentaje cae por incorporar código que antes estaba fuera de instrumentación, esa caída es el resultado correcto y debe documentarse; **no** ajustar globs para recuperar el 95 % anterior.

**Ejemplo de threshold mínimo**, **solo después de validar el denominador**:

```js
// Fusionar con la configuración real de Jest después de auditar el inventario.
coverageThreshold: {
  global: {
    statements: 70,
    lines: 70,
  },
},
```

No fijar arbitrariamente `branches` o `functions` en cero o un porcentaje acomodaticio. Si se configura `coverageThreshold`, asegurar que Jest lo aplica al **conjunto global correcto** y no a un subconjunto distorsionado por patrones globales y por-path. Si todavía hay discrepancia de archivos elegibles o el porcentaje real es menor a 70 %, el DoD queda **FAIL/BLOQUEADO**, no se retira el threshold ni se flexibiliza para declarar PASS.

### 8.2. Cómo reportar porcentajes

Para cada métrica incluir **numerador, denominador y porcentaje**, no solo el valor redondeado. Fórmula por métrica:

```text
coverage_% = 100 × covered_items / total_instrumented_items
```

El reporte distingue tres snapshots:

| Medición | Statements | Branches | Functions | Lines | Archivos elegibles/instrumentados | Interpretación |
| --- | --- | --- | --- | --- | --- | --- |
| Cierre histórico Paso 06 | 95,78 % | 91,19 % | 97,50 % | 95,69 % | **Desconocido** | Solo archivos instrumentados entonces. |
| **A**: baseline Paso 07 con denominator auditado, antes de nuevos tests | **Pendiente** | **Pendiente** | **Pendiente** | **Pendiente** | **Pendiente** | Comparación honesta (puede bajar). |
| **B**: cierre de Paso 07 tras tests focalizados | **Pendiente** | **Pendiente** | **Pendiente** | **Pendiente** | **Pendiente** | Único candidato al gate de 70 %. |

Calcular y reportar `B − A` **por métrica** y cobertura por capability (`cards`, `benefits`, `app/shared`, wrapper TS de la librería), indicando los paths/archivos que entran en cada agregado. **No sumar porcentajes ni promediar porcentajes de archivos**: agregar **contadores cubiertos y totales** de cada métrica. El `total` de Jest es la fuente primaria del gate cuando el denominador sea íntegro.

---

## 9. Estrategia de tests por capability y capa

### 9.1. Pirámide de confianza y límites de mocking

| Capa / frontera | Técnica principal | Dobles permitidos | Lógica que **NO** debe mockearse al probarla |
| --- | --- | --- | --- |
| `cards/domain` y `benefits/domain` con lógica runtime | Jest de funciones puras | Entradas inmutables / fixtures seguros | Validadores/mappers propios relevantes. |
| `application` (load, elegibilidad, token coordination) | Jest de casos de uso | `CardRepository`, `BenefitRepository`, `AvailableCardBrandsReader` inyectados | Caso de uso e invariantes que se evalúan. |
| `infrastructure` (JSON/data sources/repos/gateways) | Jest de adapters | Fuente física o TurboModule físico; errores sintéticos seguros | Proyección allowlist, normalización, sanitizer y adapters propios. |
| `presentation` (cards/benefits/navigation) | RNTL | Puertos físicos, host de Fabric, scroll imperativo cuando sea necesario | Render, estados, store y coordinación que se afirma probar. |
| `io-native-components` runtime TS | Jest de wrapper/exports/eventos | Spec Codegen física/host Fabric y emisor nativo | Transformación de props/events y API pública TS. |
| Kotlin token/sesión/mapa | JUnit existente | Reloj/scheduler/sinks/seams de pruebas ya aprobados | Validadores, transiciones, reconciliación Kotlin. |
| Android OS + Google Maps reales | Smoke físico **focalizado**, si el diff lo amerita | Ningún mock que suplante runtime | Binding real, Activity/`FLAG_SECURE`, render/gestos. |

**Regla de fidelidad:** mockear en la **frontera más externa posible** que permita probar el comportamiento interno real. Por ejemplo, probar `NativeSecureViewGateway` contra un fake del módulo físico es útil; mockear directamente `NativeSecureViewGateway` y luego afirmar que se probó el gateway **no** lo es. Probar `BenefitsScreen` con un host Fabric falso está bien para orquestación; **no** afirmar que eso prueba el SDK de Google.

### 9.2. Invariantes arquitectónicos que deben mantenerse

- `cards` y `benefits` siguen separadas por capabilities BIAN: `benefits` lee marcas por `AvailableCardBrandsReader`, no `cards/infrastructure` ni JSON desde JSX.
- Models públicos y JSON RN **no contienen** PAN/CVV/titular completos. `Card` muestra `maskedPan` y `expiry`; el DTO de token es opaco y efímero.
- Bridge `openSecureView` recibe **solo** `cardId` + `secureToken`; eventos de sesión solo IDs, códigos/mensajes seguros y motivos.
- Mapa recibe markers seguros y `selectedMarkerId`, emite `onMarkerPress(markerId)`; `Benefit.id` permanece `number`, `MapMarker.id`/`selectedBenefitId` permanecen `string`.
- El **único estado de selección** duradero en presentación es `selectedBenefitId: string | null` en el store Benefits. Índices, scroll offsets y refs son derivados/transitorios.
- No persistir token, PAN, CVV ni titular en stores, logs, snapshots, navigation params o test fixtures.

### 9.3. Decisión para seleccionar pruebas nuevas

1. Enumerar comportamiento crítico + test existente + assertions reales.
2. Clasificar `CUBIERTO`, `PARCIAL`, `NO CUBIERTO`, `NO AUTOMATIZABLE EN JEST`, `NO APLICA`.
3. Para `PARCIAL` o `NO CUBIERTO`, crear **un test que falle ante una regresión real**, no una aserción al tipo de una función.
4. Reutilizar `describe.each`/fixtures puros donde reduzca duplicación, **sin** contar cada fila como una mejora de calidad por sí misma.
5. Añadir tests de **comportamiento observable** y ramas de riesgo; evitar snapshots nuevos de mapas o vistas sensibles, ni inspecciones de implementación frágiles.
6. Si una prueba existente cubre el escenario con rigor suficiente, **referenciarla en la matriz** y no reescribirla por cumplir la numeración del documento.

---
## 10. Matriz Cards / Account Management — inventariar antes de agregar

**Regla de lectura de matrices §10–§14:** la columna **«Línea base documentada»** se deriva de los Pasos 03–06; **no es una constatación de cobertura de línea ni del inventario Jest actual**. El implementador debe completar para cada caso el archivo/test **real**, los asserts que lo protegen, cobertura `CUBIERTO / PARCIAL / AUSENTE`, y decisión `REUTILIZAR / AMPLIAR / NUEVO / NO APLICA / MANUAL`. No crear un test nuevo donde uno existente ya cubra correctamente el mismo riesgo.

| ID | Conducta o riesgo a verificar | Línea base documentada | Refuerzo **solo si falta** |
| --- | --- | --- | --- |
| **C07-01** | Render correcto de cuentas y tarjetas en `Mis productos`, aliases, marcas y asociación cuenta/tarjeta | Tests de Paso 03 y regresión J36 | RNTL sobre pantalla con datos válidos; evitar snapshot masivo. |
| **C07-02** | `maskedPan` se muestra siempre enmascarado, solo últimos cuatro dígitos; `expiry` en formato `MM/AA` | Tests de Cards y Paso 03 | Rechazo de entrada con PAN no enmascarado en data source, **sin inyectar PAN completo en fixtures JS**. Probar formato/validación por tipos seguros y patrones. |
| **C07-03** | `LocalCardsDataSource` proyecta solo campos públicos por allowlist, descarta propiedades extra no permitidas | Requisito Paso 03, pruebas anteriores no inspeccionadas | Test del data source **real** ante propiedades ajenas con sentinelas no sensibles. |
| **C07-04** | Marcas se normalizan (`trim`, mayúsculas), sin catálogo cerrado artificial | Requisito Paso 03/05 | Casos con minúsculas, espacios, marca desconocida válida; no inferir desde PAN/alias. |
| **C07-05** | IDs únicos y `accountId` existente: datos corruptos generan error controlado | Requisito Paso 03 | Input duplicado/ref. huérfana, sin render parcial engañoso o filtrado silencioso. |
| **C07-06** | Estados `loading`, `success`, `empty`, `error` y `Reintentar` para cuentas/tarjetas | Tests RNTL previos | Controlar promesas y errores mediante repositorios falsos; comprobar transición real. |
| **C07-07** | Error de una fuente de productos no se presenta como éxito/empty ni muestra payload crudo | Requisito arquitectura/UX | Assert del estado seguro y ausencia de leak en UI; sin snapshot bruto de exception. |
| **C07-08** | Acción «Ver datos sensibles» usa `cardId` correcto, solicita/renueva token y delega a gateway **una vez por intención** | Tests Paso 04 | Probar secuencia con `SecureTokenProvider`/`SecureViewGateway` falsos, **sin** mockear el flujo de coordinación si es el SUT. |
| **C07-09** | Fallo de emisión/renovación o fallo de apertura: error accesible y seguro, sin apertura nativa falsa | Tests Paso 04 | Promise rechazo, módulo ausente, estado de error/retry según UX vigente. |
| **C07-10** | Unmount/reintento/respuesta obsoleta no actualiza estado indebidamente ni duplica apertura | Cobertura previa no inventariada | Test de concurrencia/foco **solo si existe la condición real**; no cambiar flujo productivo por hipótesis. |
| **C07-11** | Zustand de productos retiene datos **solo seguros**; resets entre tests y conservación entre tabs | Paso 03 y regresión J36 | Estado por instancia/suite, sin persistencia sensible; aislamiento explícito. |
| **C07-12** | `App`/Dashboard, tabs, navegación y tema no dejan de montar Cards al ampliar coverage | Smoke y regresión previos | Conservar smoke existente; ampliar solo si falta un escenario observable importante. |

**Criterio de seguridad de C07-02:** jamás crear en JS un PAN de 16 dígitos para después enmascararlo «solo en el test». Usar únicamente mocks ya enmascarados y casos malformados que **no** contengan datos sensibles completos. La política se verifica principalmente por `allowlist`, formato de valores seguros y fronteras del modelo.

---

## 11. Matriz Benefits — datos, elegibilidad, mapa y estados

| ID | Conducta o riesgo a verificar | Línea base documentada | Refuerzo **solo si falta** |
| --- | --- | --- | --- |
| **B07-01** | `benefits.json` consumido por data source real, validación de forma/campos e IDs numéricos únicos | Paso 05 §11.1 | JSON corrupto, ID repetido, obligatoriedad de campos; sin reescribir JSON de producto. |
| **B07-02** | `LocalBenefitsDataSource` realiza proyección allowlist (no pasa propiedades inesperadas) | Tests Paso 05 | Probar retorno exacto de claves seguras. |
| **B07-03** | `MockBenefitRepository` delega y propaga errores sanitizables | Tests Paso 05 | Rechazo de data source y expectativa de error sin payload crudo. |
| **B07-04** | `AvailableCardBrandsReader` obtiene marcas **desde fuente de Cards**, normaliza y deduplica | Tests Paso 05 | Diferenciar fuente no cargada/error vs usuario realmente sin marcas. |
| **B07-05** | Intersección `applicableBrands` filtra VISA/MASTERCARD, excluye AMEX no elegible; multimarcas sin duplicar | Tests Paso 05 y J02 | Variación de mayúsculas/espacios, repetición de tarjetas, array vacío. |
| **B07-06** | Error de lectura de Cards **no** concede acceso a todos los beneficios como fallback | Requisito/test Paso 05 | Error propagado al estado `error`. |
| **B07-07** | `Benefit.id: number` → `MapMarker.id: string`; lat/lon/título sin metadatos sensibles | Paso 05, J01/J02 | Tipo/transformación exacta y no mutación de input. |
| **B07-08** | Validación de coordenadas finitas, límites ±90/±180, `NaN`, infinito, strings | Tests Paso 05 y J02 | Casos límite solo donde haya ramas sin prueba; nada de mocks de Google SDK. |
| **B07-09** | Ubicación inválida parcial → omisión informada; todas inválidas → error, **no** empty engañoso | Tests Paso 05 y J02 | Verificar consistencia marker–carousel. |
| **B07-10** | `loading`, `success`, `empty`, `error`, `Reintentar`: mapa/carrusel solo donde corresponden | J29–J30 | Test de error/retry sin fake timeouts arbitrarios. |
| **B07-11** | ID nativo no existente, vacío o obsoleto no selecciona beneficio ni desplaza lista | Paso 05 wrapper, J08/J16–J17 | Reproducir desde API pública TS/host Fabric mock, no implementar Fake GoogleMap. |
| **B07-12** | `CustomMap` wrapper transporta markers/selección y traduce evento estructurado a `onMarkerPress(string)` | Tests Fabric Paso 05/J38 | Props nuevas y cleanup; no mocks que salten el wrapper que se afirma probar. |
| **B07-13** | Datasets reorder/remove/update/retry conservan lista elegible y correspondencia con markers | J02–J09/J35 | Verificar que **el mismo snapshot** alimenta mapa y carrusel; no volver a filtrar dentro del JSX. |
| **B07-14** | Error del módulo/mapa o plataforma no soportada produce estado/fallback seguro y accesible | Paso 05/J30/J37 | Distinguir error de datos, inicialización y fallback iOS; no simular mapa iOS inexistente. |

**Precisión:** si todos B07-01–14 ya están protegidos por asserts sustantivos, el resultado correcto es **«REUTILIZADOS, 0 tests nuevos»**. La auditoría no se evalúa por contar tests adicionales.

---

## 12. Matriz sincronización mapa ↔ carrusel — aprovechar J01–J40

El Paso 06 **ya documenta 32 nuevos tests** en `selectionAndScroll.test.ts` y `carouselIntegration.test.tsx`, agrupados sobre J01–J40, además de las suites anteriores. **No repetirlos** como otro lote de 40 ni cambiar el coordinador aprobado por estilo de testing.

| ID | Comportamiento crítico | Referencia existente Paso 06 | Refuerzo permitido si el assert real es insuficiente |
| --- | --- | --- | --- |
| **S07-01** | Una sola selección `selectedBenefitId` coherente en mapa, card, contador y alternativa textual | J03–J04, J10, J31 | Assert de consistencia con store **real**; no guardar segundo ID. |
| **S07-02** | Tap marker 1/intermedio/último mueve `FlatList` al índice correspondiente | J11–J12 | Incluir índice no renderizado inicialmente y comprobar destino público. |
| **S07-03** | Scroll programático/fin tardío **no** publica intención de usuario ni genera eco circular | J13–J15 | Verificar número de escrituras/eventos sin sobreacoplar al algoritmo. |
| **S07-04** | Tap rápido A→B, callback viejo de A, última intención válida prevalece | J15, J24–J25 | Simular carrera determinista, sin sleep real. |
| **S07-05** | Swipe y snap confirmado → prop `selectedMarkerId` del mismo ID | J19–J20/J26 | Probar ambos sentidos, límites `[0,N−1]`. |
| **S07-06** | Fling: drag-end preliminar no publica índice que sustituye al fin de momentum | J21 | Comprobar **una** selección final. |
| **S07-07** | Drag lento **sin momentum**: confirmación solo al asentarse, fallback acotado | J22–J23 | Fake timers, ≤8 observaciones/512 ms conforme política real aprobada. |
| **S07-08** | Inicio de gesto físico cancela scroll/retry programático | J24, J18 | Confirmar prioridad del usuario, cleanup de pendiente. |
| **S07-09** | `onScrollToIndexFailed` recupera de modo acotado; ancho 0/empty/unmount no repiten tareas | J16–J18 | Sin loops, no índices negativos, cancelar timers. |
| **S07-10** | Dataset `0/1/N`, reorder, remove, change text, IDs inválidos | J03–J09, J25/J27/J35 | Eliminar seleccionado usa vecino según política aprobada; reordenar conserva por ID. |
| **S07-11** | Geometría `onLayout` real → stride/getItemLayout/snap/offset consistentes | J12/J19–J20/J28 | Verificar ancho distinto, ID lejano y rotación simulada por evento de layout. |
| **S07-12** | Cambio de tab, blur/remount, Home/retorno no restauran selección obsoleta ni recargan sin necesidad | J29/J34–J35 | RNTL de foco/navegación **si no existe** una prueba sólida actual. |
| **S07-13** | Selección accesible por tap textual / Anterior / Siguiente | J31–J33 | Confirmar la misma acción y estado selected para todos los controles. |
| **S07-14** | No remapear marcadores ni recrear cards por **solo** cambiar selección | J39 | Mantener prueba existente; no inventar métricas de FPS Android. |

### 12.1. Qué NO debe afirmar Jest

- Una simulación `fireEvent.scroll(...)` **no** garantiza que el SDK Android produzca idéntica secuencia en un fling físico; esa parte fue validada en el Paso 06 §24.14 y **no debe reabrirse** salvo regresión del Paso 07.
- Un host Fabric mock **no dibuja** Google Maps; solo verifica el contrato TS y el flujo hasta la frontera.
- Una prueba de idempotencia de store **no** demuestra cero renders reales del `MapView`; se pueden observar llamadas de mapper/re-render de subtree como garantía acotada.
- La cámara del mapa no necesita animarse en cada swipe: el contrato exige **destacar el marcador**, no comandar un movimiento imperativo nuevo.

### 12.2. Protección de la excepción Kotlin ya aprobada

En Paso 06 se corrigió un defecto reproducido: controles oficiales +/− y medición/layout del contenido del `MapView` de Fabric. **No modificar esas clases** como parte de coverage. Si el diff de Paso 07 es solo TS/config/tests, mantener la regresión JUnit y API pública, **sin generar test Kotlin artificial que inspeccione una asignación de `isZoomControlsEnabled`** ni exigir repetir las 18 maniobras manuales del Paso 06.

---

## 13. Matriz bridge, TurboModule, Fabric y contratos públicos

### 13.1. Propósito de testing de frontera

Garantizar en Jest el contrato **hacia y desde** la API TS de `io-native-components`, sin fingir ejecución física Kotlin/Google Maps/Codegen. **No** sustituir una comprobación de API pública por un test que mockea esa misma API.

| ID | Prueba de frontera a verificar | Origen aprobado | Doble adecuado / assertion crítica |
| --- | --- | --- | --- |
| **N07-01** | `NativeSecureTokenProvider.getOrRenewToken(cardId)` llama a emisión nativa con ID seguro, retorna token opaco + expiración | Paso 04 | Fake del TurboModule físico; no producir HMAC desde JS. |
| **N07-02** | Renovación emite token nuevo, sin caché persistente; errores/módulo indisponible sanitizados | Paso 04 | Rechazos predecibles; assertions **sin log del token**. |
| **N07-03** | `NativeSecureViewGateway.openSecureView({cardId,secureToken})` transforma firma física sin cambiar `Promise<void>` de aplicación | Paso 04 | Fake de método Codegen, resolver/rechazar; nunca `Card` completa como argumento. |
| **N07-04** | `subscribe` escucha `onSecureViewOpened`/`onCardDataShown` y preserva **solo** `cardId` | Paso 04 | Emitters falsos, assertions exactas de evento/payload seguro. |
| **N07-05** | `onValidationError` transforma **solo** `TOKEN_INVALID`/`TOKEN_EXPIRED`; formato inválido se maneja de modo seguro | Paso 04 | Código desconocido no debe filtrarse como éxito ni payload bruto. |
| **N07-06** | `onSecureViewClosed` transforma **solo** `USER_DISMISS`/`TIMEOUT`; cierre idempotente | Paso 04 | Dos notificaciones/tareas tardías no duplican efecto observacional. |
| **N07-07** | `unsubscribe`, unmount o cambio de listener dejan **0 suscripciones activas** de esa instancia | Paso 04 | Contar altas/bajas en fake de emisor; no forzar `removeAllListeners` global. |
| **N07-08** | Ausencia de TurboModule o iOS no soportado → degradación/error controlado, sin crash al importar | Paso 04/J37 | Mock de `TurboModuleRegistry` compatible; no modificar Codegen para test. |
| **N07-09** | `CustomMap` TS wrapper mapea props `markers`, `selectedMarkerId`, `onMarkerPress` | Paso 05/J38 | Render del wrapper **real** con host Fabric falso. |
| **N07-10** | `onMarkerPress({nativeEvent:{markerId}})` entrega el ID string una vez; IDs malos/obsoletos se descartan | Paso 05/J08/J38 | Fake del evento **físico Fabric** con payload estructurado. |
| **N07-11** | Props de selección actualizadas pasan al host sin emitir un tap nativo inventado | Paso 05/06 | `rerender` del wrapper real y contador de `onMarkerPress` igual. |
| **N07-12** | Paquete exporta la API pública esperada desde **una sola librería**; no imports directos a specs desde UI | Pasos 04/05 | Inspección de rutas + test de export si añade valor; **no** snapshots de objetos `NativeModules`. |
| **N07-13** | TurboModule y Fabric coexisten en `IoNativeComponentsSpec`, sin sobrescribirse los mocks globales | Pasos 04/05 | Tests separados contra fronteras físicas correctas, sin mock universal que elimine uno de los dos. |

### 13.2. Semántica importante de eventos de sesión

- `onSecureViewOpened(cardId)` significa apertura; **no** prueba que se hayan renderizado datos.
- `onCardDataShown(cardId)` es un **aviso de estado**, no entrega datos a JS.
- `onValidationError(TOKEN_INVALID/TOKEN_EXPIRED)` **no es cierre terminal automático** según política aprobada: nativo conserva `ERROR_HIDDEN` hasta **Ocultar/Back** o timeout.
- `onSecureViewClosed(cardId, USER_DISMISS/TIMEOUT)` representa cierre final. No inventar eventos, causas o campos para completar cobertura.
- La tokenización/HMAC/TTL y contenido sensible completo **son responsabilidad Kotlin**; Jest no intenta reconstruir token ni verificar criptografía con mocks vacíos.

### 13.3. Test de límites de datos en la frontera

La estructura de payloads y props debe comprobarse mediante **allowlists exactas de claves públicas** (por ejemplo `cardId`, `code`, `message`, `reason`, `markerId`) y assertions de serialización/mapping cuando corresponda. No usar un test basado únicamente en `expect(log).not.toContain('PAN')`: comprobar que **no existe un campo `pan`, `cvv`, `holder`, `secureToken` o equivalente** dentro de **eventos y props de salida** que no deban transportarlo. `secureToken` está permitido **solo** como argumento temporal de apertura al TurboModule y retorno efímero de emisión; **no** en eventos o stores.

---

## 14. Kotlin/JUnit — conservar regresión nativa existente

### 14.1. Línea base y script

La línea base confirmada es **13 JUnit PASS**, con **5 de mapa y 8 de token/sesión** en el cierre del Paso 05, conservados en Paso 06. La exigencia del Paso 07 es **mantener esos tests funcionando** con:

```bash
npm run test:native:android
npm run test:all
```

**No imponer una cuota de JUnit nuevos.** Si las 13 pruebas reales siguen protegiendo las invariantes importantes, **0 nuevos JUnit es válido**. No duplicar tests de Kotlin que están correctamente probados en sus seams existentes.

### 14.2. Checklist de lectura de las 13 pruebas (no exigir que cada fila sea un test aparte)

| Grupo nativo | Invariantes a mapear contra las 13 pruebas reales | Límite |
| --- | --- | --- |
| Token mock | emisión/renovación, TTL **60 000 ms**, válido/inválido/expirado, firma alterada, cardId incorrecto, input malformado | No extraer secreto/HMAC a JS para coverage. |
| Sesión segura | deadline monotónico **45 000 ms**, cierre `USER_DISMISS`/`TIMEOUT`, idempotencia, no `CardDataShown` antes de autorización, error `ERROR_HIDDEN`, background | No declarar que JUnit prueba `FLAG_SECURE` de ventana real. |
| Mapa | IDs/coordenadas válidos, vacíos/duplicados, selección no existente, reconciliación de snapshots, evento solo en tap válido | No simular teselas ni `GoogleMap` final con mocking frágil. |
| Lifecycle/cleanup | actualizaciones previas a `onMapReady`, destrucción/cancelación y listeners cuando existan seams reales | No introducir Robolectric/Espresso solo para subir test count. |

**Regla de decisión:** si un caso de alto riesgo no tiene coverage JUnit, pero agregarlo requiere **modificar Kotlin de producción** exclusivamente por testabilidad, **documentar el vacío y límite** en vez de romper la restricción del paso. Si la prueba puede agregarse contra una clase pública/seam ya existente y tiene valor, es admisible con justificación y sin nuevos paquetes. Ante un **defecto real** descubierto, registrar reproducción, causa, cambio mínimo y regresión; no realizar refactor general.

### 14.3. Evidencia del script nativo

- Registrar **tarea Gradle exacta** que ejecuta `npm run test:native:android`, número real de pruebas y salida exitosa.
- Exigir exit code 0 **del script oficial del repositorio**; un runner Kotlin/JUnit alternativo suplementario se reporta como **suplementario** y **no reemplaza** `npm run test:native:android` ni `npm run test:all` para cerrar.
- Si `~/.gradle`/wrapper están bloqueados en el sandbox del implementador como ocurrió durante Paso 06, documentar el fallo; la terminal del propietario puede proporcionar evidencia posteriormente, pero el implementador no la inventa ni la atribuye a su propia ejecución.
- **No** pedir APK firmado, secretos, tokens reales ni credenciales de Maps como evidencias.

### 14.4. Relación con Codegen y build

Un build Android correcto comprueba que `IoSecureView`, `CustomMap` y la API nativa generada enlazan; **Jest no puede compilar un spec Kotlin**. En este paso, si no se modifica Kotlin/Codegen, una ejecución de `npm run test:all` y, cuando resulte proporcional, un smoke o build Android son suficiente regresión; **no** regenerar artifacts Codegen o reescribir Gradle por costumbre.

---

## 15. Seguridad en las pruebas y no exposición de datos

### 15.1. Invariantes obligatorias

1. No insertar **PAN completo**, **CVV completo**, **titular completo**, `secureToken` real, credenciales ni clave Google Maps en fixtures/snapshots/logs de Jest, archivos `src/` RN o outputs versionados.
2. Los mocks públicos de tarjetas **nacen enmascarados**; no reconstruir PAN en JavaScript ni añadir el campo `holder` del JSON ilustrativo oficial.
3. El `secureToken` opaco circula temporalmente en el flujo JS→TurboModule según contrato del reto; puede ser **simulado con identificadores opacos inocuos de test**, pero nunca persistido en store, emitido a logs o capturado en snapshots.
4. Ningún `console.log`, `console.warn`, `console.error`, mensaje de error, `throw` o falla de assertion debe revelar **payload bruto** del TokenProvider/Gateway/NativeModule. Probar mensajes/códigos sanitizados sin imprimir el objeto original.
5. `CustomMap` transporta **únicamente** datos de marcador seguros (ID, coordenadas, título seguro cuando se usa); **nunca** tarjeta, cuenta, PAN, token, CVV o titular.
6. Los cuatro eventos de sesión seguros mantienen payloads permitidos exactos. `onCardDataShown` **no** devuelve datos.
7. La clave Maps permanece en `android/secrets.properties` (o la ubicación segura efectiva, local/ignorada); **no leerla ni incluirla en el reporte**.
8. La auditoría es de **higiene del código de pruebas y superficies JS/TS**, **no** una certificación PCI, hardening de APK, prueba criptográfica productiva ni el Paso 08.

### 15.2. Estrategia de pruebas recomendada

- En adapters/data sources reales, utilizar **sentinelas no sensibles** como *propiedades inesperadas*, no números de tarjeta ni valores CVV, para demostrar que la allowlist elimina campos extra.
- Assertions de **claves** (p. ej. `Object.keys(payload)` o `toEqual({cardId: ...})`) detectan campos no autorizados sin tener que almacenar secretos ficticios en snapshots.
- En rutas error, usar `Error('synthetic failure')`, errores codegen vacíos o códigos seguros; comprobar que la UI no concatena stacks/payloads. No simular el leak insertando en un error un PAN completo.
- Para logs mockeados, observar si se llamó un logger con argumentos estructurados **sin interpolar sus argumentos en los mensajes de failure**. El informe solo anota la ruta/resultado, no el valor de los argumentos.
- Auditar en modo **solo nombre de archivo/rango**, nunca imprimir coincidencias de potenciales secretos en consola compartida. `rg -l` (solo rutas) es preferible a `rg -n` si el patrón puede coincidir con un secreto. Las expresiones regulares producen falsos positivos/negativos; combinar revisión de contratos con búsquedas focalizadas.
- No leer secretos ignorados ni incluir muestras de vistas seguras abiertas en capturas/video. El documento solo exige **comprobar las fronteras y la ausencia de nuevas exposiciones**.

### 15.3. Checklist estático seguro, sin falsos absolutos

El implementador debe examinar **los archivos versionables pertinentes** (app RN, librería TS y tests) y registrar:

| Superficie | Pregunta de seguridad | Evidencia aceptable |
| --- | --- | --- |
| `Card`/JSON público RN | ¿Solo `maskedPan`, expiry y campos aprobados? | Models/proyección data source + test. |
| Store Zustand | ¿No hay token, PAN/CVV/titular completos en state ni persistencia? | Shape real de store + test/inspección. |
| Gateway token/secure view | ¿`secureToken` se usa solo como dato efímero de invocación? | Tests de firma y errores. |
| Eventos hacia JS | ¿Solo claves/códigos/IDs/motivos permitidos? | Tests de eventos y allowlist. |
| Mapa/carrusel | ¿Markers/eventos no contienen datos sensibles? | Tests del wrapper y del mapper. |
| Snapshots/fixtures/logs | ¿No hay valores sensibles ni `console` con payload bruto? | Revisión de cambios con salida **redactada**. |
| Git/coverage | ¿Archivos ignorados y ningún secreto introducido en diff? | `git status`, `.gitignore`, `git diff --check`, revisión prudente sin exponer valores. |

**No se debe reportar «imposible filtrar secretos en cualquier circunstancia»**: el alcance del Paso 07 es verificar rutas controladas y tests de regresión para las invariantes del reto.

---

## 16. Aislamiento entre pruebas, timers, stores, async y fiabilidad

### 16.1. Riesgos a inspeccionar

- **Zustand:** `useProductsStore` y `useBenefitsStore` son singletons de módulo; resetear a un **estado inicial seguro conocido** con el mecanismo público ya usado en suites previas. No depender del orden de tests. No introducir API de reset en producción solo para acomodar tests.
- **Mocks:** distinguir `clearAllMocks` (limpia invocaciones), `resetAllMocks` (también implementaciones) y `restoreAllMocks` (restaura `jest.spyOn`). Elegir la política compatible con los **fakes por suite**: un `resetMocks: true` global podría eliminar implementaciones necesarias y no debe activarse sin verificar efecto.
- **Timers:** suites de `CarouselCoordinator` usan fake timers para espera estable de **64 ms**, máximo **8 observaciones / 512 ms**, retry acotado **32 ms** cuando aplique. Restituir `useRealTimers`, cancelar tareas en unmount y vaciar pendientes controladamente; **no** usar `runAllTimers` sobre un loop infinito para fabricar PASS.
- **Asincronía:** promises pendientes, request epochs, blur/unmount y callbacks tardíos. Usar `act`, `waitFor`, deferred promises **controladas** o fake clock; **no** `setTimeout` real ni retries arbitrarios.
- **Native emitters:** cada suite obtiene sus propias suscripciones y las da de baja al desmontar. Comprobar **no acumulación** entre tests y que el cleanup no remueve listeners de otras instancias.
- **RNTL:** `cleanup` según versión instalada, componentes desmontados después de assertions, queries semánticas y `accessibilityState.selected` reales.
- **Fixtures:** datos seguros deterministas, sin dependencia de red, geolocalización, Maps tiles o tiempo real.
- **Jest workers:** `--runInBand` para diagnóstico reproducible; ejecutar también modo estándar `npm test` para evitar depender accidentalmente de ejecución serial.

### 16.2. Casos aislantes de alto valor

| ID | Escenario | Criterio |
| --- | --- | --- |
| **I07-01** | Dos tests consecutivos cambian `selectedBenefitId` y reabren pantalla | Cada test empieza en baseline controlada, sin selección heredada. |
| **I07-02** | Dos tests usan fake timers y luego un test asíncrono normal | `jest.useRealTimers()` restaurado; no tareas del coordinador anterior. |
| **I07-03** | Emisor de sesión suscrito y desuscrito en render/unmount | Solo listener vivo de instancia activa; sin duplicados. |
| **I07-04** | Respuesta A lenta resuelve después de B | Store/pantalla conservan snapshot y selección de B, sin warning post-unmount. |
| **I07-05** | Dos suites comparten mocks de la librería por módulo | Un test no sobrescribe permanentemente implementaciones usadas por otro. |
| **I07-06** | Jest se ejecuta repetido desde un estado limpio | Sin flakes, tests skipped/todo inesperados ni handles persistentes. |

**Técnica de confirmación:** ejecutar la suite completa **al menos dos veces** después de los cambios y una vez con la política normal de `npm test`; si un test falla solo al correr en conjunto, es **FAIL de aislamiento**, no un motivo para usar `--runInBand` como ocultamiento de una fuga.

### 16.3. Diagnóstico de fallos intermitentes

`--detectOpenHandles` es **diagnóstico selectivo**, no opción obligatoria permanente ni prueba universal de ausencia de leaks. Utilizarlo si hay un síntoma reproducible; no añadir `--forceExit`, retries automáticos o `test.concurrent` a suites con estado singleton para tapar fallos. Registrar error, frecuencia, causa y corrección mínima.

---
## 17. Orden de ejecución recomendado para el implementador (sin adelantar pasos)

**Todas las fases corresponden al mismo Paso 07.** El orden minimiza cambios innecesarios y evita obtener un porcentaje engañoso.

| Fase | Acción obligatoria | Producto/evidencia antes de avanzar |
| --- | --- | --- |
| **A — Read-only** | Leer fuentes y cierre §24.14; comprobar checkout, branch, scripts y 90+13 tests existentes | Diagnóstico inicial, diferencias reales del checkout, inventario de tests. |
| **B — Auditar coverage** | Ejecutar reporte **heredado** y localizar exactamente archivos/globs omitidos | Tabla instrumental previa, causas de exclusión, archivos no instrumentados. |
| **C — Corregir denominador** | Completar `collectCoverageFrom` sin ocultar runtime, fijar reporters | Matriz completa elegible/instrumentado, cobertura baseline **A** auditada. |
| **D — Gap analysis funcional** | Mapear C07/B07/S07/N07/I07 y J01–J40 contra asserts existentes | Matriz con estados `CUBIERTO/PARCIAL/AUSENTE/...`; backlog **priorizado**, no lista especulativa. |
| **E — Extender tests** | Agregar solamente casos de alto riesgo no probados, primero datos/seguridad/bridge, luego UI/concurrencia si faltan | Nuevas o ampliadas suites con assertions relevantes; no cambios productivos por convenience. |
| **F — Aislamiento** | Verificar stores, async, timers, mocks/emisores y repetibilidad | Suites consistentes sin flakes; sin `forceExit` ni sleeps. |
| **G — Gate RN** | Ejecutar `npm test` y `--coverage` con config final; calcular métricas por archivo/capability | Cobertura final **B** con total real y gate ≥70 % statements/lines. |
| **H — Gate nativo/regresión** | Ejecutar 13 JUnit mediante script oficial y `test:all`, más lint/typecheck/format | Logs y exit codes verdaderos; map/secure view no afectados. |
| **I — Smoke proporcional** | Validar manual Android **solo si el diff o defecto real lo requiere**; no rehacer M01–M18 | Evidencia focalizada o explicación `NO REQUERIDO` por cambio test-only. |
| **J — Documentar y cerrar** | Actualizar README sobre testing; validar diff, exclusiones, DoD y reporte §21 | Estado de Paso 07 sin anticipar Paso 08. |

**Punto de control:** si la fase C revela que la cobertura **A** auditada es inferior a 70 %, **esa es la medición válida** y debe guiar la selección de tests de alto valor. Si llega a ≥70 % y los comportamientos críticos ya tienen pruebas adecuadas, **se puede cerrar con cero tests adicionales**, siempre que el DoD instrumental/funcional/nativo se cumpla.

### 17.1. Priorización de vacíos reales

1. **P0 (innegociable):** pérdida de masking/allowlist, filtrado incorrecto, exposición de datos, falla de bridge, eventos inseguros, store de selección inconsistentes, carrera que causa ID obsoleto, JUnit/script roto, archivos productivos fuera del denominador.
2. **P1 (alto valor):** error/retry, datos malformados, lifecycle y unmount, listeners/timers, cambios de dataset y fallbacks Android/iOS, accesibilidad semántica estándar.
3. **P2 (solo si existe riesgo real):** presentación puramente decorativa, variaciones cosméticas de texto, test de componente estático sin lógica, snapshots redundantes o métricas de render no reproducibles.

**No introducir** tests P2 únicamente para acercarse al umbral. Si la cobertura queda por debajo de 70 % tras P0/P1 y el restante es código válido no ejercitado, identificar el comportamiento funcional correspondiente y añadir pruebas con aserciones reales, no asserts tautológicos.

---

## 18. Comandos reproducibles y validaciones de calidad

**Los siguientes comandos son instrucciones para la ejecución futura en el checkout del usuario.** **No** se han ejecutado durante la elaboración de este documento.

### 18.1. Preflight e inventario

```bash
# Desde la raíz del repositorio existente, sin modificar ni borrar archivos.
pwd
git branch --show-current
git status --short
node --version
npm --version
npm ls react-native jest @testing-library/react-native

# Suites descubiertas por Jest:
npm test -- --listTests --runInBand

# Inventario de fuentes del app y librería propia:
rg --files src packages/io-native-components/src
```

En la ejecución local del implementador, conservar **conteos de archivos** y listas de tests, no un volcado de posibles secretos. Registrar cualquier cambio preexistente en Git antes de tocar coverage. Si `rg` no existe, usar `find`/herramientas locales sin instalar frameworks.

### 18.2. React Native, Jest y calidad

```bash
# Previa a cambios (baseline heredada) y después de configurar denominator:
npm test -- --watch=false --runInBand --coverage

# Test obligatorio en un comando y comprobación normal de invocación:
npm test

# Ejecución explícita de todos los tests sin modo watch:
npm test -- --watch=false --runInBand

# Calidad de TypeScript y código:
npm run lint
npm run typecheck
npm run format:check
```

**No** usar `--updateSnapshot`, `--passWithNoTests`, `--forceExit` ni `--runTestsByPath` como sustituto del **suite completo** de cierre. Jest **debe fallar** ante test o threshold incumplido, sin suprimir exit code.

### 18.3. Android/JUnit y pipeline completo

```bash
# Script aprobado del Paso 04 para los tests Kotlin:
npm run test:native:android

# Comando de regresión global aprobado (Jest + JUnit):
npm run test:all
```

Para inspeccionar la **tarea Gradle efectiva**, consultar el `package.json` real, sin inventar una task ni reemplazar el script aprobado. No tomar como `PASS` un intento de Gradle bloqueado por permisos. Si la terminal del propietario ejecuta estos comandos, consignar **separadamente** la evidencia recibida y el entorno que los corrió.

### 18.4. Validación Android proporcional al diff (si aplica)

```bash
adb devices

# Únicamente si se cambió producto/ruta de ejecución o apareció un defecto
# reproducible; no exigir recompilación manual por modificar solo tests Jest:
npm run android

# Compilado de regresión, si existe motivo técnico concreto:
cd android
./gradlew :app:assembleDebug
cd ..
```

**No forzar smoke manual repetitivo si solo cambian tests/config/README** y los pipelines son verdes. Si una corrección productiva afecta navegación, gateway, mapa, carrusel o seguridad, exigir el escenario físico pertinente antes de declarar `PASS`, con el alcance de §19. El uso de un emulador sin servicios Google no constituye una validación de mapa real.

### 18.5. Higiene final, exclusiones y seguridad

```bash
git diff --check
git status --short
git diff --stat
```

Revisar `git diff` de archivos **no secretos** de manera prudente; no imprimir los valores de `android/secrets.properties` ni contenido de archivos privados ignorados. Comprobar `package-lock.json` intacto salvo cambio de dependencia **estrictamente justificado** (no previsto), no nuevas librerías nativas o test frameworks, no harness temporal de desarrollo reintroducido, y `coverage/` ignorado.

### 18.6. Lectura reproducible de totales de cobertura

Cuando `coverage/coverage-summary.json` exista, un informe local seguro puede imprimir solo **totales y cantidad de entradas**, sin valores de datos de tarjeta:

```bash
node - <<'NODE'
const fs = require('node:fs');
const path = 'coverage/coverage-summary.json';
if (!fs.existsSync(path)) {
  throw new Error('No existe coverage-summary.json; no declarar cobertura PASS');
}
const report = JSON.parse(fs.readFileSync(path, 'utf8'));
const files = Object.keys(report).filter(name => name !== 'total');
const total = report.total;
if (!total || files.length === 0) {
  throw new Error('Reporte vacío/inconsistente; revisar collectCoverageFrom');
}
console.log('Archivos reportados:', files.length);
for (const metric of ['statements', 'branches', 'functions', 'lines']) {
  const value = total[metric];
  if (!value || !Number.isFinite(value.pct)) {
    throw new Error(`Métrica no disponible: ${metric}`);
  }
  console.log(metric, `covered=${value.covered}`, `total=${value.total}`, `pct=${value.pct}`);
}
NODE
```

**Importante:** este comando solo lee los totales **ya producidos por Jest**; **no** verifica por sí mismo que todos los archivos productivos estén instrumentados. Se requiere además la matriz §6.4 y el contraste de archivos. Los umbrales solo son defendibles tras ese contraste.

---

## 19. Evidencias exigibles, regresión y límites de validación manual

### 19.1. Paquete mínimo de evidencias para declarar PASS

| Evidencia | Qué debe contener | Estado al redactar este prompt |
| --- | --- | --- |
| **E07-01** | Branch y `git status --short` antes/después; cambios previos respetados | **PENDIENTE** |
| **E07-02** | Inventario de suites inicial/final; 90 tests y 10 suites de referencia, con variación explicada si la hay | **PENDIENTE** |
| **E07-03** | Config Jest efectiva previa/final; patterns de inclusión/exclusión y motivo de cada exclusión runtime | **PENDIENTE** |
| **E07-04** | Tabla de cobertura **heredada / A auditada / B final**, 4 métricas, numeradores/denominadores y archivos | **PENDIENTE** |
| **E07-05** | Lista de fuentes propias productivas RN/TS y correspondencia completa con coverage (incluidos 0 %) | **PENDIENTE** |
| **E07-06** | Matriz C07/B07/S07/N07/I07 con test existente, nueva prueba o justificación | **PENDIENTE** |
| **E07-07** | `npm test`, `npm test -- --watch=false --runInBand --coverage`: exit codes, suites, tests, thresholds | **PENDIENTE** |
| **E07-08** | `npm run test:native:android`: script/task real, JUnit total, PASS o bloqueo honesto | **PENDIENTE** |
| **E07-09** | `npm run test:all`: ambas fases Jest y JUnit con salida/exit code real | **PENDIENTE** |
| **E07-10** | `npm run lint`, `typecheck`, `format:check` y `git diff --check` | **PENDIENTE** |
| **E07-11** | Verificación de fixtures, mocks, store, bridge y eventos sin datos sensibles; no se imprimieron secretos | **PENDIENTE** |
| **E07-12** | README actualizado: testing, coverage por alcance, exclusiones, pasos reproducibles y límites | **PENDIENTE** |
| **E07-13** | Si hubo cambios productivos: smoke focalizado Android o bloqueo real; si test-only: justificar `NO REQUERIDO` | **PENDIENTE** |
| **E07-14** | Sin cambios indebidos de contratos, versiones, paquetes ni librería; no se avanzó a Paso 08 | **PENDIENTE** |

### 19.2. Cuándo corresponde smoke Android adicional

| Tipo de modificación realmente realizada en Paso 07 | Validación del Paso 07 |
| --- | --- |
| Solo `jest.config.*`, tests, documentación, scripts de coverage **sin alterar `test:all`** | Suites + quality checks + audit de coverage; **no repetir 01–06 manualmente**. |
| Cambio en un adapter de tokens/gateway por bug reproducido | Además de tests, smoke de «Ver datos sensibles», error seguro, cierre y retorno a Dashboard. |
| Cambio en `BenefitsScreen`, selección, coordinador, wrapper Fabric por bug reproducido | Smoke mapa→carrusel, carrusel→mapa, error/restore pertinente en Android con Maps real. |
| Cambio Kotlin/Codegen/Fabric excepcional **solo por defecto reproducible** | Build Android, JUnit y smoke físico exacto de superficie modificada; documentar por qué fue inevitable. |
| No hay emulador/dispositivo/Gradle funcional | Reportar `NO EJECUTADO / BLOQUEADO` de la validación que aplique. No usar un mock Jest como evidencia física. |

**No pedir:** prueba manual específica de TalkBack; revalidación integral de M01–M18; captura de Card Secure View abierta con información completa; key real de Google; nuevas pruebas manuales de Play services offline, red, FPS/leaks si no son parte de un defecto causado por cambios de Paso 07.

### 19.3. Criterios para un PASS honesto

El Paso 07 es `PASS` solo si:

1. Está demostrada la **integridad del denominador RN** y no quedan exclusiones de código runtime propio sin justificación.
2. Statements y lines finales **≥70 %**, con branches/functions cuantificados y hotspots críticos atendidos.
3. La matriz funcional presenta **cobertura suficiente de rutas críticas**, incluidos errores, datos, bridge, mapa/carrusel y seguridad, o marca límites no automatizables sin falsa aprobación.
4. Todos los Jest existentes y los añadidos **pasan**, sin saltarse suites ni tests por conveniencia, y mantienen aislamiento.
5. Las **13 JUnit de referencia** y `npm run test:native:android` funcionan; `npm run test:all` termina en `PASS` real como pipeline completo, con evidencia desde un entorno que los ejecutó.
6. Lint/typecheck/format/diff y la revisión de seguridad están aprobados.
7. La regresión/manual **proporcional al diff** aplicable está acreditada y las excepciones se registran honestamente.
8. El reporte/README documentan métricas, cambios, tests, exclusiones y límites; la app no fue reconstruida.

**No aprobar** apoyándose únicamente en `95,78 %` del Paso 06, un Jest con denominador recortado o un runner JUnit alternativo cuando el comando oficial falla. Si el umbral final está bajo 70 % o un script requerido no ejecuta, el resultado es `NO APROBADO / BLOQUEADO`, con causa y acción concreta. El código funcional de 01–06 **sigue aprobado** salvo una regresión nueva efectivamente demostrada.

---

## 20. Definition of Done — Paso 07 (estado de ejecución)

**Estado vigente:** **65/65 PASS**. El propietario confirmó ambos comandos oficiales con `BUILD SUCCESSFUL in 1s`, cerrando 49/50 desde su Terminal. Los intentos iniciales bloqueados del implementador se conservan como historial, sin atribuir al sandbox la ejecución externa. Evidencias en §25. No hay criterios excluidos del Paso 07.

### 20.1. Control de alcance y fuentes (01–10)

- [x] **01.** Se ejecutó el trabajo únicamente en el repositorio `io-products-benefits` existente, sin `react-native init`, duplicados ni reimplementaciones. **PASS** — E07-01,14 / §25.1.
- [x] **02.** Se leyó el PDF oficial o se declaró su ausencia local; se usó su prioridad normativa sin inventar contenido. **PASS** — PDFKit págs. 2–4/6–7 / §25.1.
- [x] **03.** Se leyeron baseline, contratos Paso 02, límites de Paso 04, cierre Paso 05 §21.9 y **Paso 06 §24.14**. **PASS** — Referencias locales / §25.1.
- [x] **04.** Se mantuvo intacta la aprobación 01–06, incluido el criterio 42 original de Paso 06 **EXCLUIDO / NO APLICA**. **PASS** — Cierres preservados / §25.1, §25.6.
- [x] **05.** Se registraron branch, `git status` inicial y versiones reales del entorno sin borrar trabajo preexistente. **PASS** — E07-01 / §25.1, §25.7.
- [x] **06.** Se conservó React Native **0.88.0**, New Architecture, Hermes y TypeScript estricto. **PASS** — E07-14 / §25.1, §25.4.
- [x] **07.** Se conservó `io-native-components` como **única** librería propia y los namespaces/IDs aprobados. **PASS** — E07-14 / §25.1, §25.4.
- [x] **08.** No se modificaron contratos públicos de domain/application/bridge ni Codegen/Kotlin/Fabric por conveniencia de tests. **PASS** — E07-14 / §25.1, §25.4.
- [x] **09.** No se añadieron Firebase, Swift/MapKit, Expo, nueva librería nativa, framework de test innecesario ni extras de etapas futuras. **PASS** — E07-14 / §25.1, §25.4.
- [x] **10.** Los cambios de código productivo, si existen, están asociados a un **bug reproducido**, causa y fix mínimo, sin refactor general. **PASS** — E07-14 / §25.1, §25.4.

### 20.2. Denominador y medición de coverage (11–25)

- [x] **11.** Se inventariaron fuentes **runtime propias** RN/TS/TSX (`src`, `App.tsx`, runtime TS de `io-native-components`). **PASS** — E07-03–05 / §25.2.
- [x] **12.** Se inventariaron suites/test files y configuración Jest efectiva sin asumir nombres/rutas obsoletos. **PASS** — E07-03–05 / §25.2.
- [x] **13.** Se ejecutó y registró el reporte de coverage **previo** a cambios de test/config (o fallo real documentado). **PASS** — E07-04 / baseline-imported.log guardado antes de config.
- [x] **14.** Se inspeccionaron `collectCoverageFrom`, ignores, `rootDir`, transforms y provider efectivos. **PASS** — E07-03–05 / §25.2.
- [x] **15.** Se configuró coverage para incluir **todos** los archivos productivos instrumentables, incluso no importados. **PASS** — E07-03–05 / §25.2.
- [x] **16.** Se incluyeron **Cards, Benefits, app, shared, wrappers TS y entrada RN** en el denominador según el árbol real. **PASS** — E07-03–05 / §25.2.
- [x] **17.** Se inspeccionaron las specs TS de TurboModule/Fabric **sin exclusión masiva por directorio**. **PASS** — E07-03–05 / §25.2.
- [x] **18.** Se excluyeron solo tests, fixtures test-only, type-only, terceros y generados, con razones trazables. **PASS** — E07-03–05 / §25.2.
- [x] **19.** Se verificó que el paquete local no se cuente dos veces vía `packages/` y symlink `node_modules`. **PASS** — E07-03–05 / §25.2.
- [x] **20.** No quedaron archivos productivos runtime ausentes del reporte sin razón verificable. **PASS** — E07-03–05 / §25.2.
- [x] **21.** Se produjo baseline **A** con denominador auditado y **B** final, separadas del 95,78 % histórico. **PASS** — E07-03–05 / §25.2.
- [x] **22.** El reporte final incluye **statements, branches, functions y lines**, cada uno con cubiertos, totales y porcentaje. **PASS** — E07-03–05 / §25.2.
- [x] **23.** El reporte final supera **≥70 % statements** en el denominador RN íntegro. **PASS** — E07-03–05 / §25.2.
- [x] **24.** El reporte final supera **≥70 % lines** en el denominador RN íntegro. **PASS** — E07-03–05 / §25.2.
- [x] **25.** El threshold/reporte es reproducible y no usa ignores ni pruebas artificiales para alcanzar el porcentaje. **PASS** — E07-03–05 / §25.2.

### 20.3. Cobertura funcional y tests de calidad (26–42)

- [x] **26.** Se mapearon las **90 pruebas Jest / 10 suites** de referencia a funcionalidades actuales; se identificó variación real si existe. **PASS** — E07-02,06–07 / §25.3.
- [x] **27.** La matriz C07/B07/S07/N07/I07 incluye test concreto y resultado `CUBIERTO/PARCIAL/AUSENTE/...` para cada riesgo. **PASS** — E07-02,06–07 / §25.3.
- [x] **28.** Las pruebas ya existentes se reutilizaron **sin duplicarlas** ni sustituirlas por versiones triviales. **PASS** — E07-02,06–07 / §25.3.
- [x] **29.** Cards: cuentas/tarjetas, PAN enmascarado, fecha, allowlist y errores críticos cuentan con assertions suficientes. **PASS** — E07-02,06–07 / §25.3.
- [x] **30.** Cards: token, acción «Ver datos sensibles», apertura y error seguro cuentan con assertions suficientes. **PASS** — E07-02,06–07 / §25.3.
- [x] **31.** Benefits: datos/IDs/normalización de marcas/filtrado multimarcas cuentan con assertions suficientes. **PASS** — E07-02,06–07 / §25.3.
- [x] **32.** Benefits: coordenadas válidas/incorrectas, ubicaciones omitidas y estados `loading/empty/error/retry` están protegidos. **PASS** — E07-02,06–07 / §25.3.
- [x] **33.** Mapa → carrusel tiene tests sustantivos de selección, índice, callbacks obsoletos, A→B e idempotencia. **PASS** — E07-02,06–07 / §25.3.
- [x] **34.** Carrusel → mapa tiene tests sustantivos de snap, fling, drag sin momentum, selección final y prioridad del gesto físico. **PASS** — E07-02,06–07 / §25.3.
- [x] **35.** Dataset `0/1/N`, reorder, eliminación, cambio de textos, ID inexistente y recuperación del scroll están protegidos. **PASS** — E07-02,06–07 / §25.3.
- [x] **36.** `selectedBenefitId` sigue siendo la **única fuente de verdad**, sin estado de selección duplicado en mapa/carrusel. **PASS** — E07-02,06–07 / §25.3.
- [x] **37.** Persistencia en memoria al cambiar tabs/foco/remount y recuperación de posición por ID siguen cubiertas. **PASS** — E07-02,06–07 / §25.3.
- [x] **38.** Adaptadores TS de TurboModule, eventos de sesión y `subscribe/unsubscribe` tienen tests de frontera adecuados. **PASS** — E07-02,06–07 / §25.3.
- [x] **39.** Wrapper Fabric y API pública `CustomMap` tienen tests de props/events frente a un host mock **sin saltar el wrapper real**. **PASS** — E07-02,06–07 / §25.3.
- [x] **40.** Los tests respetan la frontera: Jest no se presenta como evidencia de render de Google Maps ni de seguridad Android OS. **PASS** — E07-02,06–07 / §25.3.
- [x] **41.** Se conservaron pruebas de accesibilidad estándar (labels, roles, selected, alternativa no gestual), **sin exigir TalkBack manual**. **PASS** — E07-02,06–07 / §25.3.
- [x] **42.** No se añadieron snapshots voluminosos, tests tautológicos ni nuevas dependencias de test por simple porcentaje. **PASS** — E07-02,06–07 / §25.3.

### 20.4. Fiabilidad, nativo y seguridad (43–54)

- [x] **43.** Los stores Zustand se reinicializan/aislan entre tests mediante mecanismos ya existentes. **PASS** — E07-06–07 / §25.3, §25.5.
- [x] **44.** Mocks, `spyOn`, timers fake/reales y `act`/promesas se limpian correctamente sin efectos residuales. **PASS** — E07-06–07 / §25.3, §25.5.
- [x] **45.** Los listeners de bridge y callbacks tardíos se desregistran o ignoran correctamente en cleanup. **PASS** — E07-06–07 / §25.3, §25.5.
- [x] **46.** El suite completo se ejecutó **al menos dos veces** de forma estable tras los cambios; no hay flakes conocidos ocultos. **PASS** — E07-06–07 / §25.3, §25.5.
- [x] **47.** `npm test` y `npm test -- --watch=false --runInBand --coverage` terminan **PASS** con alcance completo. **PASS** — E07-06–07 / §25.3, §25.5.
- [x] **48.** Las 13 pruebas JUnit de referencia se preservaron o cualquier variación quedó justificada con equivalencia demostrada. **PASS** — E07-08 / §25.3: 13 métodos preservados; ejecución no atribuida.
- [x] **49.** `npm run test:native:android` terminó **PASS** en el entorno ejecutor, sin sustituirlo por runner alternativo. **PASS** — E07-08 / §25.8: propietario confirma `BUILD SUCCESSFUL in 1s`; reportes XML conservan 13 tests sin fallos.
- [x] **50.** `npm run test:all` terminó **PASS real**, ejecutando **ambas** fases Jest y JUnit. **PASS** — E07-09 / §25.8: propietario confirma `BUILD SUCCESSFUL in 1s` también para el pipeline oficial; no runner alternativo.
- [x] **51.** Ningún fixture/test/snapshot/evento RN incluye PAN completo, CVV completo, titular completo, token real o credencial. **PASS** — E07-11 / §25.6.
- [x] **52.** Se verificó que token y datos completos no persisten en Zustand/JS ni se registran en logs/errores del flujo. **PASS** — E07-11 / §25.6.
- [x] **53.** El mapper de markers y los eventos públicos TS conservan **solo** claves y valores seguros autorizados. **PASS** — E07-11 / §25.6.
- [x] **54.** Se revisó el diff sin revelar `secrets.properties`, credenciales o contenido de Card Secure View. **PASS** — E07-11 / §25.6.

### 20.5. Calidad, regresión y cierre (55–65)

- [x] **55.** `npm run lint` terminó PASS sin nuevos errores/warnings del cambio. **PASS** — E07-10 / §25.5.
- [x] **56.** `npm run typecheck` terminó PASS con TypeScript estricto. **PASS** — E07-10 / §25.5.
- [x] **57.** `npm run format:check` terminó PASS sin cambios pendientes. **PASS** — E07-10 / §25.5.
- [x] **58.** `git diff --check` terminó PASS y se documentó `git status --short` final. **PASS** — E07-10 / §25.5.
- [x] **59.** El README explica comandos, alcance/denominador RN, 4 métricas, thresholds y límites de JUnit/manual. **PASS** — E07-12 / README.
- [x] **60.** Si se cambió código productivo, se ejecutó smoke Android **focalizado**; si no, se justificó expresamente `NO REQUERIDO`. **PASS** — E07-13 / §25.4: sin código productivo; smoke NO REQUERIDO.
- [x] **61.** No se rompió el Dashboard/Cards/Secure View/Benefits/mapa/carrusel según suites y regresión proporcional. **PASS** — E07-06–07 / §25.3, §25.5: regresión TS PASS, producto intacto.
- [x] **62.** Se proporcionaron evidencias **E07-01 a E07-14** con resultados reales o estado no ejecutado justificado. **PASS** — E07-01–14 / §25.5, incluye bloqueos reales.
- [x] **63.** Se entregó el reporte del implementador según §21, incluyendo gaps descubiertos y corregidos sin inventar cifras. **PASS** — §25: reporte conforme §21.
- [x] **64.** No se modificaron los documentos cerrados de 01–06, no hubo `git commit`, push ni publicaciones. **PASS** — E07-01,14 / §25.4, §25.7.
- [x] **65.** Se detuvo la ejecución en **Paso 07**, sin realizar hardening general del Paso 08 ni etapas posteriores. **PASS** — E07-14 / §25.7.

**Condición de cierre:** **65/65 DoD aplicables con evidencia verificable**, sin maquillar blockers ni migrar criterios fuera de alcance a `PASS`. El criterio 42 **excluido** al que se hace referencia es exclusivamente el **original del Paso 06**; **no** se excluye ni renumera el **DoD 42 de este Paso 07**, que trata de calidad de tests. Si un DoD de Paso 07 fuese verdaderamente no aplicable por arquitectura/ausencia de cambio, mantenerlo en el reporte con **justificación concreta** y ajustar el denominador aprobado de modo transparente; no convertir automáticamente un `NO EJECUTADO` de un comando obligatorio en `NO APLICA`.

---

## 21. Formato obligatorio de reporte final del implementador

Al terminar **la ejecución futura**, devolver el siguiente reporte completo, con enlaces/rutas **reales del checkout** y contadores de las herramientas. **No declarar PASS sin evidencia.**

### 21.1. Resumen y alcance

- Estado: `PASO 07 COMPLETADO / PARCIAL / BLOQUEADO / NO APROBADO`.
- Branch, entorno/versions, `git status` inicial y final.
- Qué se diagnosticó, qué tests se **reutilizaron**, qué se **ampliaron** y por qué. **No** reconstruir relato de 01–06.
- Lista breve de bugs reales detectados (si hubo) y fix mínimo.

### 21.2. Auditoría de cobertura — obligatoria

```text
Cobertura histórica del Paso 06 (NO global):
  statements 95,78 | branches 91,19 | functions 97,50 | lines 95,69

Denominador React Native/TypeScript auditado en Paso 07:
  archivos runtime propios elegibles:  <N real>
  archivos incluidos en coverage:      <N real>
  archivos excluidos legítimamente:    <N real + rutas/motivos>
  archivos productivos sin instrumento: <0 o bloqueo y lista>
  doble conteo por symlink:             <no / problema detallado>

A. Baseline auditada ANTES de tests nuevos:
  statements <cubiertos/total; %>
  branches   <cubiertos/total; %>
  functions  <cubiertos/total; %>
  lines      <cubiertos/total; %>

B. Final auditada DESPUÉS de tests focalizados:
  statements <cubiertos/total; %>
  branches   <cubiertos/total; %>
  functions  <cubiertos/total; %>
  lines      <cubiertos/total; %>

Gate: statements >=70 % <PASS/FAIL> | lines >=70 % <PASS/FAIL>
Otros indicadores: branches/functions <reportados; sin gate arbitrario>
Deltas B-A: <4 diferencias expresadas en puntos porcentuales>
Hotspots: <rutas + riesgos y cómo se cubrieron o se limitaron>

Archivos de evidencia: <rutas reales a coverage-summary.json, lcov.info, HTML>
```

**No** sustituir los placeholders por estimaciones ni omitir archivos 0 %. Adjuntar la matriz §6.4 expandida y detallar si el `total` de Jest cambió por alcance, por código nuevo o por nuevos tests. No comparar «95,78 → 75 %» como pérdida de calidad si se incorporaron archivos que antes eran invisibles; explicar la diferencia de denominador.

### 21.3. Matriz de pruebas existentes y nuevas

| Campo por caso auditado | Valor a entregar |
| --- | --- |
| ID del presente documento | `C07-xx` / `B07-xx` / `S07-xx` / `N07-xx` / `I07-xx` |
| Referencia histórica, cuando existe | `J01–J40` / suite Cards o bridge Paso 04 / suite Benefits Paso 05 |
| Archivo/test real | Ruta y nombre del `it`/`test` que contiene la aserción |
| Estado antes | `CUBIERTO`, `PARCIAL`, `AUSENTE`, `MANUAL`, `NO APLICA` |
| Decisión | `REUTILIZAR`, `AMPLIAR`, `NUEVO`, `DOCUMENTAR LÍMITE` |
| Evidencia después | Comando/suite y resultado; assertion sustantiva añadida o ya existente |

Consolidar los tests sin contar de forma ficticia una misma prueba como 10 tests nuevos. Resumir **tests Jest antes/después, suites antes/después**, JUnit antes/después y **razones verificables** de cada diferencia. Una conclusión «todos los casos críticos ya existían» es aceptable si la matriz lo acredita.

### 21.4. Archivos creados/modificados y decisiones

- Distinguir `created`, `modified`, `unchanged` y no atribuir archivos de etapas previas como nuevos.
- Config Jest, tests, README y scripts tocados. Por cada cambio productivo excepcional: defecto reproducido, causa raíz, diff mínimo, test de regresión y validación física correspondiente.
- Precisar exclusiones de coverage y trade-offs del threshold; no incluir pseudo-contratos o código que no se ejecutó.

### 21.5. Comandos realmente ejecutados

| Comando | Entorno | Exit/result | Contador real o bloqueo |
| --- | --- | --- | --- |
| `npm test` | entorno local/terminal propietario | PASS/FAIL/NO EJECUTADO | N tests, N suites |
| `npm test -- --watch=false --runInBand --coverage` | ... | ... | N tests, métricas y denominator |
| `npm run test:native:android` | ... | ... | N JUnit + task efectiva |
| `npm run test:all` | ... | ... | Jest + JUnit efectivamente terminados |
| `npm run lint` | ... | ... | ... |
| `npm run typecheck` | ... | ... | ... |
| `npm run format:check` | ... | ... | ... |
| `git diff --check` | ... | ... | ... |
| Android build/smoke, **solo si aplica** | ... | .../NO REQUERIDO | Evidencia o motivo |

**No confundir** un proceso bloqueado del sandbox con el resultado de la terminal del propietario. Una corrida suplementaria de JUnit fuera de Gradle se etiqueta **SUPLEMENTARIA**, no reemplaza el script normativo. Si se recibe evidencia del propietario, etiquetarla expresamente con su origen.

### 21.6. Seguridad y límites

- Qué se comprobó de datos sensibles, stores, errores, eventos, mappers y fixtures.
- Qué fronteras **no** comprueban Jest/JUnit (Google Maps real, screenshot OS, interacción física, iOS/MapKit aún no implementado, hardening Paso 08).
- TalkBack manual de Paso 06: **EXCLUIDO / NO APLICA**, sin declarar PASS ni pedir su implementación; a11y estándar RNTL conservada.
- Flakes, mocks incompletos, casos no automatizables y blockers restantes, con riesgo/acción concreta.
- No reportar «cero vulnerabilidades», «100 % protegido» o «sin leaks de memoria» por los test counters.

### 21.7. DoD, cierre y siguiente etapa

- **DoD:** numeración 01–65 con `[x]` **solo** donde exista evidencia suficiente; conteo aplicable/pasado/pending/non-applicable con explicación.
- **Conclusión:** `PASS` solo si §19.3 y scripts/denominador cumplen las condiciones.
- **Siguiente etapa:** el **Paso 08 fue omitido** por decisión del propietario; no preparar su prompt ni exigir su cierre. Las etapas posteriores requieren indicación expresa.
- **Git:** indicar expresamente si no hubo commits, pushes o publicaciones.

---

## 22. Exclusiones y decisiones que debe poder defender el candidato

| Pregunta de sustentación | Respuesta técnica esperada en este Paso 07 |
| --- | --- |
| ¿Por qué el 95,78 % anterior no bastaba? | Era cobertura **instrumentada**, no se había auditado el conjunto de fuentes RN elegibles, incluidos archivos no importados. |
| ¿Qué significa el mínimo 70 % de BCP? | El PDF recomienda 70 % RN sin fijar métrica; adoptamos **statements y lines ≥70 %** en el denominator completo; branches/functions reportadas y revisadas por riesgo. |
| ¿Por qué no pedir 100 %? | El reto evalúa **efectividad**, no ejecutar líneas sin lógica; las pruebas deben proteger riesgos y contratos reales. |
| ¿Cómo evitaste inflar coverage? | `collectCoverageFrom` incluye código no importado; exclusiones justificadas; matriz de assertions; sin tests triviales/ignores selectivos. |
| ¿Por qué Jest no prueba todo Kotlin? | Son lenguajes/runtimes diferentes. Jest testea wrappers/contratos TS con mocks físicos; JUnit valida seams Kotlin; Android físico verifica OS/SDK. |
| ¿Cómo pruebas mapa ↔ carrusel sin mapa real? | Inyectando eventos de host Fabric al wrapper y ejecutando **coordinación/store reales**; el gesto físico Google Maps ya fue validado en Paso 06. |
| ¿Cómo evitas loops y condiciones de carrera? | Selección única, epoch/cancelación, prioridad de gesture, pruebas de callback obsoleto y fake timers controlados. |
| ¿Cómo impides que datos sensibles estén en JS? | Modelos públicos seguros, proyección allowlist, gateway de eventos mínimos, ninguna persistencia/log/snapshot de datos completos y test de fronteras. |
| ¿Por qué no actualizar RN o añadir Detox/Maestro? | El objetivo es coverage y regresión con Jest/RNTL/JUnit existentes, sin ampliar la superficie de integración ni romper RN 0.88. |
| ¿La falta de TalkBack significa ausencia de accesibilidad? | No. Mantener labels/roles/selected, controles alternativos y fuente ampliada; **no** exigir prueba manual TalkBack excluida expresamente. |
| ¿Qué efecto tienen los 13 JUnit en el porcentaje RN? | **Ninguno**: el porcentaje del gate corresponde exclusivamente al conjunto JS/TS instrumentado por Jest; JUnit se reporta aparte. |
| ¿Qué pasa si una categoría contiene archivos sin test? | Aparecen 0 % al entrar al denominator; se prioriza cobertura de comportamientos críticos sin ocultarlos por config. |
| ¿Qué pasa si coverage cae de 95 % a 75 %? | Puede ser correcto al ampliar denominator. Se explica con contadores y se evalúa el objetivo y la matriz, no una comparación de porcentajes heterogéneos. |
| ¿Cómo afecta un nuevo bug al scope? | Solo fix mínimo con reproducción y test específico; si exige cambios extensos de seguridad, escalarlos al Paso 08, **sin** modificar contratos preventivamente. |

---

## 23. Fuentes del proyecto y documentación técnica

### 23.1. Referencias del proyecto (orden de autoridad)

1. `Reto técnico - Chapter Master Frontend.pdf` — enunciado oficial, **págs. 2–4 y 6–7**: tabs, datos seguros, mapa, pruebas, errores y 70 % recomendado.
2. `RETO_BCP_TECHNICAL_BASELINE.md` — requisitos/arquitectura/testability, §§19–20 (testing y coverage).
3. `docs/steps/STEP-02-ARCHITECTURE.md` — modelos, puertos, API pública `CustomMap` y reglas de Clean Architecture.
4. `docs/steps/STEP-04-NATIVE-SECURE-VIEW.md` — pruebas RN/Native, token, secure view, eventos, scripts JUnit.
5. `docs/steps/STEP-05-BENEFITS-CUSTOM-MAP.md` — §11 testing y **§21.9 cierre 47/47**.
6. **`docs/steps/STEP-06-MAP-CAROUSEL-SYNC.md` — §14 J01–J40, §18 y especialmente §24.14, cierre definitivo 57/57 aplicables**. El criterio 42 original de esa etapa está **EXCLUIDO**.

### 23.2. Documentación oficial/primaria de testing (consultar versión efectiva)

- Jest — Configuration (`collectCoverageFrom`, `coverageThreshold`, `coverageProvider`, `coverageReporters`, mocks): https://jestjs.io/docs/configuration
- Jest — CLI (`--coverage`, `--listTests`, `--runInBand`, `--detectOpenHandles`): https://jestjs.io/docs/cli
- Jest — Testing React Native Apps (preset): https://jestjs.io/docs/tutorial-react-native
- Jest — Mock Functions / reset and restore: https://jestjs.io/docs/mock-function-api
- React Native Testing Library — documentación: https://callstack.github.io/react-native-testing-library/
- React Native — testing overview: https://reactnative.dev/docs/testing-overview
- React Native — New Architecture / Codegen: https://reactnative.dev/docs/the-new-architecture/using-codegen
- React Native — Turbo Native Modules: https://reactnative.dev/docs/turbo-native-modules-introduction
- React Native — Fabric Native Components: https://reactnative.dev/docs/fabric-native-components-introduction
- React Native 0.88 release: https://reactnative.dev/blog/2026/10/19/react-native-0.88

**Regla de consulta:** la documentación online puede mostrar una versión posterior. Verificar **la versión de Jest/RNTL realmente instalada en `package-lock.json` y las APIs disponibles en RN 0.88.0**; no actualizar el stack para copiar ejemplos de documentación reciente.

---

## 24. Principio de cierre y control de cambio

El **Paso 07** se considera **aprobable** cuando el equipo pueda demostrar que:

- **Sabe exactamente qué archivos y qué líneas cuentan** para el coverage React Native.
- Alcanza el **≥70 % recomendado** sobre statements y lines de un denominator íntegro, sin adulterar el reporte.
- **Protege los flujos críticos** de Cards, Benefits, token, secure view, bridge y sincronización con assertions sustantivas, reutilizando la inversión en las 90 pruebas existentes.
- Conserva **13 JUnit** y los **tres comandos** `npm test`, `npm run test:native:android`, `npm run test:all` realmente operativos.
- Mantiene los límites de seguridad y los contratos aprobados, con accesibilidad estándar y sin exigencia TalkBack manual.
- Presenta **evidencia ejecutada**, no porcentajes heredados, suposiciones o pruebas físicas inventadas.

**Las instrucciones de §§1–24 se ejecutaron con los resultados reales de §25.** El cierre se acredita en §25.8 con los comandos oficiales confirmados por el propietario; no adelantar Paso 08.


## 25. Ejecución real del Paso 07 — 05/11/2026

### 25.1. Resumen, alcance y estado

**PASO 07 COMPLETADO Y VALIDADO — 65/65 DoD PASS.** El cierre vigente incorpora la confirmación externa de ambos comandos oficiales en §25.8; los intentos iniciales del sandbox se conservan como historial.

Se trabajó en `main`, dentro del checkout existente. Estado inicial: únicamente `?? docs/steps/STEP-07-TESTING-COVERAGE.md` (archivo del propietario, preservado y actualizado aquí). Entorno usado: Node 22.23.4, npm 10.9.9, React Native 0.88.0, React 19.3.0, TypeScript 6.0.3 strict, Jest 29.6.3, RNTL 14.1.0, Java/JBR 17.0.14; wrapper Gradle 9.4.1 declarado, sin arranque por permiso del sandbox. Versiones/contratos/lockfile y la única librería permanecen intactos.

Se leyó el PDF disponible (nombre del filesystem con acentos descompuestos), páginas 2–4 y 6–7 mediante PDFKit: prioridad de datos nativos, pruebas obligatorias y 70 % recomendado. Se consultaron baseline §§19–20, contratos del Paso 02, límites/token/eventos del Paso 04, testing y cierre §21.9 del Paso 05 y cierre vigente §24.14 del Paso 06, conservando su aprobación y exclusión TalkBack. No se reabrieron auditorías 01–06.

Se conservaron **90 pruebas en 10 suites**, añadieron **16 pruebas** en fronteras insuficientemente protegidas y ampliaron dos assertions existentes (marca visible y cada campo prohibido individual). Resultado final **106 PASS en 11 suites, 0 skipped/todo, 0 snapshots**. No se detectó un defecto productivo reproducible que requiriera fix. Ningún código productivo cambió; no se añadieron JUnit ni dependencias. No se ejecutaron builds/Pods/Codegen ni smoke manual: **NO REQUERIDO** para este diff de tests/config/docs (§19.2). No se exige TalkBack manual.

Los intentos iniciales del implementador de `test:native:android` y `test:all` terminaron **exit 1**: el wrapper no puede abrir `~/.gradle/wrapper/dists/gradle-9.4.1-bin/arn2x92ynaizyzdaamcbpbhtj/gradle-9.4.1-bin.zip.lck` (`Operation not permitted`). **JUnit no se ejecutó dentro del sandbox**; el PASS histórico del Paso 06 no se reutilizó como validación nueva. Posteriormente, el propietario confirmó ambos comandos oficiales exitosos para Paso 07 (§25.8). No se solicitó cambiar permisos ni se sustituyó el script por un runner alternativo.

### 25.2. Configuración efectiva y auditoría del denominador

| Campo | Antes | Después / evidencia |
| --- | --- | --- |
| preset/provider | `@react-native/jest-preset` / Babel | Intactos; Babel ahora explícito |
| rootDir/roots | Raíz del checkout | Sin cambio |
| testMatch | defaults Jest `__tests__` y `.test/.spec` JS/TS | Sin cambio; 11 suites descubiertas |
| transforms/setup/resolver | babel-jest + assets, setup/environment/resolver RN 0.88 | Intactos; sin setups globales nuevos |
| moduleNameMapper | aliases RN del preset | Sin cambio; package local resuelto por symlink canónico |
| ignores | test/coverage `/node_modules/`; transform exceptúa RN/navigation | Sin cambio; no ignores productivos nuevos |
| collectCoverageFrom | vacío: solamente archivos importados | App.tsx, index.js, src completo y paquete/src completo; exclusiones exactas type-only y de tests |
| reporters | defaults, sin resumen JSON explícito | text, text-summary, json, json-summary, lcov, html |
| thresholds | ninguno | global statements ≥70 y lines ≥70; branches/functions informativas |

**Inventario real:** 51 archivos propios JS/TS/TSX no-test: **37 runtime incluidos / 14 type-only excluidos**. Los tests son 11 archivos adicionales; tres JSON de producto se prueban por consumo y no se instrumentan. `src/shared/domain/CardBrand.ts` es el único shared y es type-only: no hay runtime shared escondido. Tooling/configs y dependencias/generated/Android/iOS no son RN de aplicación. Ni `infrastructure`, ni `app`, ni specs, ni exports se excluyeron por directorio.

**37/37 rutas presentes**, realpath único por entrada, **0 archivos elegibles ausentes**, sin doble conteo del enlace `node_modules/io-native-components → packages/io-native-components`. Hay **33 entradas con contadores y 4 entradas 0/0**, descritas abajo: 0/0 se reporta **no cuantificable**, nunca como 100 % probado. Las dos pantallas antiguas y el registro index.js permanecen visibles al 0 %; no se añadieron tests triviales para elevarlos.

El transform RN/Babel convierte la spec Fabric en registro `NativeComponentRegistry.get('CustomMap', ...)` y configuración generada; la spec TurboModule resuelve `TurboModuleRegistry.get('IoSecureView')`. Istanbul no asigna contadores propios a esas exportaciones transformadas, ni a los reexports de App.tsx/index.ts. Se conservaron las cuatro rutas en el inventario y coverage (0/0), y se verificó la ejecución de la frontera pública con LIB y el Dashboard con APP. **Límite de medición explícito**: no se interpreta 0/0 como prueba de enlace nativo o cobertura de instrucciones generadas.

| Medición | Statements | Branches | Functions | Lines | Archivos |
| --- | --- | --- | --- | --- | --- |
| Histórico Paso 06 (solo instrumentados) | 95,78 % | 91,19 % | 97,50 % | 95,69 % | No auditado entonces |
| Nueva ejecución preconfig Paso 07 | 454/474 (95.78 %) | 373/409 (91.19 %) | 156/160 (97.5 %) | 422/441 (95.69 %) | 34 importados |
| A: inventario completo, 90 tests, antes de ampliación | 454/480 (94.58 %) | 373/409 (91.19 %) | 156/163 (95.7 %) | 422/446 (94.61 %) | 37 |
| B: final, 106 tests | 464/480 (96.66 %) | 387/409 (94.62 %) | 157/163 (96.31 %) | 432/446 (96.86 %) | 37 |
| Delta B−A (puntos porcentuales) | +2.08 pp | +3.43 pp | +0.61 pp | +2.25 pp | Mismo denominador |

**Gate: PASS statements y PASS lines ≥70 %.** La bajada inicial de 95,78 a 94,58 % no fue una regresión: agregó seis statements previamente invisibles (dos pantallas antiguas y index.js). Las 480 sentencias/446 líneas permanecieron iguales entre A y B. Las ramas y funciones se reportan, sin un gate arbitrario adicional.

Agregados por capability/capa (suma de cubiertos/totales, **no promedio de porcentajes**):

| Grupo / rutas | Statements | Branches | Functions | Lines |
| --- | --- | --- | --- | --- |
| App | 31/33 (93.94 %) | 6/6 (100.00 %) | 13/14 (92.86 %) | 30/32 (93.75 %) |
| Cards | 140/141 (99.29 %) | 133/138 (96.38 %) | 51/51 (100.00 %) | 127/127 (100.00 %) |
| Benefits | 280/291 (96.22 %) | 233/250 (93.20 %) | 88/92 (95.65 %) | 263/274 (95.99 %) |
| Librería TS | 13/13 (100.00 %) | 15/15 (100.00 %) | 5/5 (100.00 %) | 12/12 (100.00 %) |
| Entradas | 0/2 (0.00 %) | 0/0 — no cuantificable | 0/1 (0.00 %) | 0/1 (0.00 %) |

Artefactos reales, regenerables e ignorados por Git: `coverage/coverage-summary.json`, `coverage/coverage-final.json`, `coverage/lcov.info`, `coverage/lcov-report/index.html`, `coverage/index.html`. Copias A/inicial, resultados Jest, configuraciones y logs de comandos en `coverage/step07/`. El reporte fuente es este documento, sin crear un MD de reporte separado.

Inventario expandido (S/B/F/L = cubiertos/total y %; todos runtime propios elegibles y presentes):

| Ruta | S | B | F | L | Acción |
| --- | --- | --- | --- | --- | --- |
| `App.tsx` | 0/0 — no cuantificable | 0/0 — no cuantificable | 0/0 — no cuantificable | 0/0 — no cuantificable | Incluir; export/registro transformado, 0/0 no cuantificable |
| `index.js` | 0/2 (0 %) | 0/0 — no cuantificable | 0/1 (0 %) | 0/1 (0 %) | Incluir; medido incluso sin import |
| `packages/io-native-components/src/CustomMap.tsx` | 13/13 (100 %) | 15/15 (100 %) | 5/5 (100 %) | 12/12 (100 %) | Incluir; medido incluso sin import |
| `packages/io-native-components/src/index.ts` | 0/0 — no cuantificable | 0/0 — no cuantificable | 0/0 — no cuantificable | 0/0 — no cuantificable | Incluir; export/registro transformado, 0/0 no cuantificable |
| `packages/io-native-components/src/specs/CustomMapNativeComponent.ts` | 0/0 — no cuantificable | 0/0 — no cuantificable | 0/0 — no cuantificable | 0/0 — no cuantificable | Incluir; export/registro transformado, 0/0 no cuantificable |
| `packages/io-native-components/src/specs/NativeIoSecureView.ts` | 0/0 — no cuantificable | 0/0 — no cuantificable | 0/0 — no cuantificable | 0/0 — no cuantificable | Incluir; export/registro transformado, 0/0 no cuantificable |
| `src/app/AppRoot.tsx` | 3/3 (100 %) | 0/0 — no cuantificable | 1/1 (100 %) | 3/3 (100 %) | Incluir; medido incluso sin import |
| `src/app/BootstrapScreen.tsx` | 0/2 (0 %) | 0/0 — no cuantificable | 0/1 (0 %) | 0/2 (0 %) | Incluir; medido incluso sin import |
| `src/app/components/AppHeader.tsx` | 3/3 (100 %) | 0/0 — no cuantificable | 1/1 (100 %) | 3/3 (100 %) | Incluir; medido incluso sin import |
| `src/app/composition/benefitsDependencies.ts` | 7/7 (100 %) | 0/0 — no cuantificable | 4/4 (100 %) | 6/6 (100 %) | Incluir; medido incluso sin import |
| `src/app/composition/cardsDependencies.ts` | 4/4 (100 %) | 0/0 — no cuantificable | 1/1 (100 %) | 4/4 (100 %) | Incluir; medido incluso sin import |
| `src/app/composition/secureDependencies.ts` | 2/2 (100 %) | 4/4 (100 %) | 0/0 — no cuantificable | 2/2 (100 %) | Incluir; medido incluso sin import |
| `src/app/navigation/DashboardNavigator.tsx` | 9/9 (100 %) | 2/2 (100 %) | 6/6 (100 %) | 9/9 (100 %) | Incluir; medido incluso sin import |
| `src/app/theme/tokens.ts` | 3/3 (100 %) | 0/0 — no cuantificable | 0/0 — no cuantificable | 3/3 (100 %) | Incluir; medido incluso sin import |
| `src/capabilities/benefits/application/usecases/loadEligibleBenefits.ts` | 12/12 (100 %) | 10/10 (100 %) | 6/6 (100 %) | 11/11 (100 %) | Incluir; medido incluso sin import |
| `src/capabilities/benefits/infrastructure/datasources/LocalBenefitsDataSource.ts` | 13/13 (100 %) | 25/25 (100 %) | 5/5 (100 %) | 13/13 (100 %) | Incluir; medido incluso sin import |
| `src/capabilities/benefits/infrastructure/repositories/MockBenefitRepository.ts` | 1/1 (100 %) | 0/0 — no cuantificable | 2/2 (100 %) | 1/1 (100 %) | Incluir; medido incluso sin import |
| `src/capabilities/benefits/presentation/components/BenefitCarouselCard.tsx` | 3/4 (75 %) | 6/6 (100 %) | 1/2 (50 %) | 3/4 (75 %) | Incluir; medido incluso sin import |
| `src/capabilities/benefits/presentation/components/BenefitsCarousel.tsx` | 68/71 (95.77 %) | 24/29 (82.75 %) | 26/28 (92.85 %) | 64/67 (95.52 %) | Incluir; medido incluso sin import |
| `src/capabilities/benefits/presentation/mappers/benefitToMapMarker.ts` | 1/1 (100 %) | 0/0 — no cuantificable | 1/1 (100 %) | 1/1 (100 %) | Incluir; medido incluso sin import |
| `src/capabilities/benefits/presentation/screens/BenefitsPlaceholderScreen.tsx` | 0/2 (0 %) | 0/0 — no cuantificable | 0/1 (0 %) | 0/2 (0 %) | Incluir; medido incluso sin import |
| `src/capabilities/benefits/presentation/screens/BenefitsScreen.tsx` | 45/45 (100 %) | 38/43 (88.37 %) | 19/19 (100 %) | 35/35 (100 %) | Incluir; medido incluso sin import |
| `src/capabilities/benefits/presentation/store/useBenefitsStore.ts` | 22/22 (100 %) | 20/21 (95.23 %) | 9/9 (100 %) | 20/20 (100 %) | Incluir; medido incluso sin import |
| `src/capabilities/benefits/presentation/utils/CarouselCoordinator.ts` | 109/114 (95.61 %) | 102/108 (94.44 %) | 18/18 (100 %) | 109/114 (95.61 %) | Incluir; medido incluso sin import |
| `src/capabilities/benefits/presentation/utils/reconcileBenefitSelection.ts` | 6/6 (100 %) | 8/8 (100 %) | 1/1 (100 %) | 6/6 (100 %) | Incluir; medido incluso sin import |
| `src/capabilities/cards/application/usecases/loadProducts.ts` | 7/7 (100 %) | 2/2 (100 %) | 3/3 (100 %) | 5/5 (100 %) | Incluir; medido incluso sin import |
| `src/capabilities/cards/application/usecases/openSecureCard.ts` | 2/2 (100 %) | 0/0 — no cuantificable | 1/1 (100 %) | 2/2 (100 %) | Incluir; medido incluso sin import |
| `src/capabilities/cards/infrastructure/datasources/LocalAccountsDataSource.ts` | 14/14 (100 %) | 20/20 (100 %) | 5/5 (100 %) | 14/14 (100 %) | Incluir; medido incluso sin import |
| `src/capabilities/cards/infrastructure/datasources/LocalCardsDataSource.ts` | 15/15 (100 %) | 21/21 (100 %) | 5/5 (100 %) | 15/15 (100 %) | Incluir; medido incluso sin import |
| `src/capabilities/cards/infrastructure/native/NativeSecureTokenProvider.ts` | 6/6 (100 %) | 8/8 (100 %) | 2/2 (100 %) | 5/5 (100 %) | Incluir; medido incluso sin import |
| `src/capabilities/cards/infrastructure/native/NativeSecureViewGateway.ts` | 15/15 (100 %) | 18/18 (100 %) | 9/9 (100 %) | 12/12 (100 %) | Incluir; medido incluso sin import |
| `src/capabilities/cards/infrastructure/repositories/MockAccountRepository.ts` | 1/1 (100 %) | 0/0 — no cuantificable | 2/2 (100 %) | 1/1 (100 %) | Incluir; medido incluso sin import |
| `src/capabilities/cards/infrastructure/repositories/MockCardRepository.ts` | 1/1 (100 %) | 0/0 — no cuantificable | 2/2 (100 %) | 1/1 (100 %) | Incluir; medido incluso sin import |
| `src/capabilities/cards/presentation/components/AccountItem.tsx` | 2/2 (100 %) | 1/2 (50 %) | 1/1 (100 %) | 2/2 (100 %) | Incluir; medido incluso sin import |
| `src/capabilities/cards/presentation/components/CardItem.tsx` | 4/4 (100 %) | 4/6 (66.66 %) | 2/2 (100 %) | 4/4 (100 %) | Incluir; medido incluso sin import |
| `src/capabilities/cards/presentation/screens/CardsScreen.tsx` | 57/58 (98.27 %) | 46/48 (95.83 %) | 17/17 (100 %) | 51/51 (100 %) | Incluir; medido incluso sin import |
| `src/capabilities/cards/presentation/store/useProductsStore.ts` | 16/16 (100 %) | 13/13 (100 %) | 2/2 (100 %) | 15/15 (100 %) | Incluir; medido incluso sin import |

Exclusiones individuales verificadas con inspección + `typescript.transpileModule` (removeComments, ESNext): todas producen únicamente `export {};`, sin lógica runtime. No se excluyeron por su porcentaje.

| Ruta | Motivo / evidencia |
| --- | --- |
| `src/capabilities/benefits/application/ports/AvailableCardBrandsReader.ts` | Solo tipos/interfaces/import type; JS vacío tras erasure |
| `src/capabilities/benefits/domain/models/Benefit.ts` | Solo tipos/interfaces/import type; JS vacío tras erasure |
| `src/capabilities/benefits/domain/repositories/BenefitRepository.ts` | Solo tipos/interfaces/import type; JS vacío tras erasure |
| `src/capabilities/benefits/infrastructure/datasources/BenefitsDataSource.ts` | Solo tipos/interfaces/import type; JS vacío tras erasure |
| `src/capabilities/benefits/presentation/contracts/CustomMapContracts.ts` | Solo tipos/interfaces/import type; JS vacío tras erasure |
| `src/capabilities/cards/application/ports/SecureTokenProvider.ts` | Solo tipos/interfaces/import type; JS vacío tras erasure |
| `src/capabilities/cards/application/ports/SecureViewGateway.ts` | Solo tipos/interfaces/import type; JS vacío tras erasure |
| `src/capabilities/cards/domain/models/Account.ts` | Solo tipos/interfaces/import type; JS vacío tras erasure |
| `src/capabilities/cards/domain/models/Card.ts` | Solo tipos/interfaces/import type; JS vacío tras erasure |
| `src/capabilities/cards/domain/repositories/AccountRepository.ts` | Solo tipos/interfaces/import type; JS vacío tras erasure |
| `src/capabilities/cards/domain/repositories/CardRepository.ts` | Solo tipos/interfaces/import type; JS vacío tras erasure |
| `src/capabilities/cards/infrastructure/datasources/AccountsDataSource.ts` | Solo tipos/interfaces/import type; JS vacío tras erasure |
| `src/capabilities/cards/infrastructure/datasources/CardsDataSource.ts` | Solo tipos/interfaces/import type; JS vacío tras erasure |
| `src/shared/domain/CardBrand.ts` | Solo tipos/interfaces/import type; JS vacío tras erasure |

Otras exclusiones: `**/__tests__/**`, `.test/.spec`, `__mocks__`, `__fixtures__`, `.d.ts` son test-only/declarativas (el sufijo `.spec` **no** coincide con los nombres `NativeIoSecureView.ts` y `CustomMapNativeComponent.ts`, que permanecen incluidos). JSON, docs y assets no instrumentables; scripts/config CLI no ejecutan producto. Terceros y generados no se suman a la cobertura propia. Los antiguos componentes Bootstrap/Placeholder sí permanecen en el reporte, sin borrarlos ni excluirlos.

### 25.3. Matriz funcional real y reutilización

Las referencias siguientes se resuelven al archivo completo por alias. Los nombres de test se extrajeron del JSON final de Jest; cada fila señala asserts existentes o ampliados, **no** una prueba nueva por requisito. Todas las referencias Jest terminan PASS. C07 se vincula con suites 03/04, B07/host con suites 05 y SS/CI conservan en sus títulos las referencias J01–J40 del Paso 06. Frontera mockeada: repositorios físicos, TurboModule/emisores, registro/host Fabric y comandos imperativos de scroll; dominio/store/wrappers/coordinador probados son reales.

| Alias | Archivo real | Tests iniciales → finales |
| --- | --- | --- |
| APP | `__tests__/App.test.tsx` | 1 → 1 |
| LIB | `__tests__/nativeLibrary.test.tsx` | 0 → 5 |
| LP | `src/capabilities/cards/infrastructure/__tests__/localProducts.test.ts` | 8 → 10 |
| NA | `src/capabilities/cards/infrastructure/__tests__/nativeAdapters.test.ts` | 5 → 9 |
| PR | `src/capabilities/cards/presentation/__tests__/productsPresentation.test.tsx` | 8 → 13 |
| LOAD | `src/capabilities/cards/application/__tests__/loadProducts.test.ts` | 2 → 2 |
| OPEN | `src/capabilities/cards/application/__tests__/openSecureCard.test.ts` | 1 → 1 |
| BI | `src/capabilities/benefits/infrastructure/__tests__/benefits.test.ts` | 25 → 25 |
| BP | `src/capabilities/benefits/presentation/__tests__/benefitsPresentation.test.tsx` | 8 → 8 |
| CI | `src/capabilities/benefits/presentation/__tests__/carouselIntegration.test.tsx` | 13 → 13 |
| SS | `src/capabilities/benefits/presentation/__tests__/selectionAndScroll.test.ts` | 19 → 19 |

| ID | Archivo/test real (alias anterior) | Antes | Decisión | Evidencia después y límite |
| --- | --- | --- | --- | --- |
| C07-01 | PR · pantalla muestra carga, datos seguros y acción deshabilitada<br>LOAD · carga cuentas y tarjetas a través de sus repositorios | PARCIAL | AMPLIAR | PASS: cuenta, alias, marca visible VISA, PAN/expiry y asociación por repositorios reales. |
| C07-02 | LP · datos locales de productos rechaza tarjetas inválidas sin incluir el registro en el error<br>PR · pantalla muestra carga, datos seguros y acción deshabilitada | CUBIERTO | REUTILIZAR | PASS: formato enmascarado y MM/AA; entradas inválidas seguras rechazadas sin PAN completo. |
| C07-03 | LP · datos locales de productos proyecta solo los campos permitidos y normaliza la marca | CUBIERTO | REUTILIZAR | PASS: igualdad exacta y claves allowlist; sentinel extra descartado. |
| C07-04 | LP · marca desconocida se normaliza sin catálogo cerrado y cuenta sin número sigue válida | PARCIAL | AMPLIAR | PASS: marca futura normalizada sin catálogo cerrado; no inferir desde PAN. |
| C07-05 | LP · datos locales de productos rechaza cuentas con identificadores repetidos<br>LOAD · rechaza referencias de tarjeta a una cuenta inexistente | CUBIERTO | REUTILIZAR | PASS: duplicados y referencia huérfana rechazan controladamente; duplicado Card en LP parametrizado. |
| C07-06 | PR · pantalla vacía y reintento muestran los datos al responder el repositorio<br>PR · error público permite reintentar y recuperar | CUBIERTO | REUTILIZAR | PASS: loading/success/empty/error y recuperación real; secciones parciales en dos casos PR existentes. |
| C07-07 | PR · error público permite reintentar y recuperar | CUBIERTO | REUTILIZAR | PASS: error público estable y detalle interno ausente en UI. |
| C07-08 | OPEN · solicita un token nuevo y envía solo cardId y token al gateway<br>PR · taps durante emisión no duplican apertura y unmount retira la suscripción | PARCIAL | AMPLIAR | PASS: dos intenciones renuevan; doble tap mientras pendiente produce una emisión y una apertura con cardId elegido. |
| C07-09 | PR · fallo de token muestra error seguro, libera control y permite renovar<br>PR · fallo de open muestra error seguro, libera control y permite renovar<br>LIB · API pública y composición android con módulo disponible=false | PARCIAL | AMPLIAR | PASS: emisión/apertura rechazadas muestran alert seguro, liberan botón y permiten reintentar; módulo ausente no se inyecta. |
| C07-10 | PR · store ignora respuesta obsoleta resolve después de reintento<br>PR · store ignora respuesta obsoleta reject después de reintento<br>PR · taps durante emisión no duplican apertura y unmount retira la suscripción | PARCIAL | AMPLIAR | PASS: reintento más reciente gana frente a éxito/error antiguo; taps no duplican; unmount retira listener. No se afirma cancelación de una emisión nativa ya en vuelo al desmontar. |
| C07-11 | APP · abre el Dashboard en Mis productos y conserva los datos al cambiar de tab<br>PR · fallo de token muestra error seguro, libera control y permite renovar | PARCIAL | AMPLIAR | PASS: store conserva snapshot entre tabs y sus claves son exactamente accounts/cards/status/errorMessage/load; resets beforeEach. |
| C07-12 | APP · abre el Dashboard en Mis productos y conserva los datos al cambiar de tab | CUBIERTO | REUTILIZAR | PASS: header, tab inicial y navegación con datos conservados; tokens de tema pasan por render real. |
| B07-01 | BI · datos estructurales inválidos producen error seguro 0<br>BI · mock, allowlist y normalización sin mutar entrada | CUBIERTO | REUTILIZAR | PASS: JSON real consumido; forma/ID duplicado/ID no entero y campos corruptos rechazados en tabla de nueve casos. |
| B07-02 | BI · mock, allowlist y normalización sin mutar entrada<br>CI · J40: snapshot y selección contienen solo datos públicos, sin credenciales ni datos completos de tarjeta | CUBIERTO | AMPLIAR | PASS: proyección, no mutación y claves exactas del snapshot; cada clave prohibida ahora se comprueba individualmente, corrigiendo una assertion negativa débil. |
| B07-03 | BI · repositorio delega y ambos errores se propagan sin mostrar todos | CUBIERTO | REUTILIZAR | PASS: fallo de fuente propagado; BP verifica sanitización final en UI. No se atribuye sanitización al repositorio. |
| B07-04 | BI · reader reutiliza repositorio, normaliza/deduplica y propaga fallos | CUBIERTO | REUTILIZAR | PASS: lee repositorio Cards sin depender de tab montada, normaliza/deduplica, vacío y error distintos. |
| B07-05 | BI · elegibilidad por intersección normalizada estable, multimarcas una vez<br>SS · J01–02: identidad y mismo conjunto de elegibles ubicables, sin reintroducir AMEX ni omitidos | CUBIERTO | REUTILIZAR | PASS: VISA/MASTERCARD normalizadas, multimarcas una vez; AMEX y marcas vacías excluidas. |
| B07-06 | BI · repositorio delega y ambos errores se propagan sin mostrar todos<br>BP · error público y reintento recuperan sin revelar payload | CUBIERTO | REUTILIZAR | PASS: reader fallido rechaza caso de uso; error visible y retry sin mostrar todos. |
| B07-07 | BI · mapper proyecta exclusivamente los cuatro campos públicos | CUBIERTO | REUTILIZAR | PASS: String(id), lat/lon/título exactos y solo cuatro claves públicas. |
| B07-08 | BI · coordenadas 90 180 | CUBIERTO | REUTILIZAR | PASS: diez filas: límites, cero, fuera de rango, NaN, Infinity, null/string/undefined. |
| B07-09 | BI · ubicaciones parcialmente inválidas se omiten; todas inválidas son error distinto a empty<br>SS · J01–02: identidad y mismo conjunto de elegibles ubicables, sin reintroducir AMEX ni omitidos | CUBIERTO | REUTILIZAR | PASS: omite parcialmente con contador, todo inválido es error; mismo conjunto ubicable para mapa/carrusel. |
| B07-10 | BP · carga pendiente, selección controlada y alternativa accesible<br>BP · empty legítimo no monta mapa<br>BP · error público y reintento recuperan sin revelar payload | CUBIERTO | REUTILIZAR | PASS: progressbar, success, empty sin mapa y recuperación sin detalle interno. |
| B07-11 | BP · wrapper normaliza null, filtra eventos y aplica últimas props<br>CI · J08/18: IDs vacíos/desconocidos no seleccionan ni hacen scroll | CUBIERTO | REUTILIZAR | PASS: vacío/número/retirado/desconocido ignorados; ningún scroll ni cambio de selección. |
| B07-12 | BP · wrapper normaliza null, filtra eventos y aplica últimas props<br>LIB · Fabric y TurboModule coexisten por API pública; props nuevas no inventan taps | PARCIAL | AMPLIAR | PASS: wrapper real contra host físico; allowlist sin título opcional, neutral null y evento string una vez. |
| B07-13 | CI · J25/28/35: resize y dataset nuevo invalidan gesto anterior, reorder y vecino conservan reglas<br>CI · J07/12/39: contenido mismo ID no realinea; último índice virtualizado y bounds del layout | CUBIERTO | REUTILIZAR | PASS: reorder conserva ID, remove elige vecino y cambio de texto no realinea; dataset compartido. |
| B07-14 | BP · indisponibilidad nativa y timeout permiten reintentar sin spinner infinito<br>BP · iOS no carga datos ni monta host Android<br>LIB · wrapper público iOS muestra fallback sin montar host Fabric | PARCIAL | AMPLIAR | PASS: timeout/inicialización unavailable permiten retry; wrapper iOS público sin host Android. |
| S07-01 | CI · J11/17/29/31: primer ID coherente; espera medida, y mapa/card/contador comparten selección | CUBIERTO | REUTILIZAR | PASS: ID del store/prop, card selected y contador coherentes; espera layout. |
| S07-02 | CI · J07/12/39: contenido mismo ID no realinea; último índice virtualizado y bounds del layout<br>CI · J12–15/39: taps A→B alinean última tarjeta; fin programático no escribe ni recompone markers | CUBIERTO | REUTILIZAR | PASS: primer/intermedio/último; destino virtualizado índice 19 con layout consistente. |
| S07-03 | CI · J12–15/39: taps A→B alinean última tarjeta; fin programático no escribe ni recompone markers | CUBIERTO | REUTILIZAR | PASS: fin programático no escribe selección ni remapea; dos escrituras por dos taps distintos. |
| S07-04 | SS · J12–15: índice lejano, programático sin eco, A→B e ID inválido<br>SS · J24–25/28: drag invalida programático, timestamps y epoch descartan eventos antiguos | CUBIERTO | REUTILIZAR | PASS: A→B, callback/timestamp/epoch antiguos ignorados y última intención válida gana. |
| S07-05 | CI · J19–21/23/26: gesto publica solo final y no pasa por el callback Fabric<br>SS · J19–21/23/26: fling confirma solo el offset final, clamp y fin duplicado | CUBIERTO | REUTILIZAR | PASS: snap final 1↔3, clamp fuera de límites y fin duplicado idempotente. |
| S07-06 | CI · J19–21/23/26: gesto publica solo final y no pasa por el callback Fabric | CUBIERTO | REUTILIZAR | PASS: solo una escritura al finalizar fling, sin callback Fabric artificial. |
| S07-07 | SS · J22: drag sin momentum espera offset final estable y snap, nunca publica por frame<br>SS · J22: nunca hay polling indefinido ni commit de offset sin snap | CUBIERTO | REUTILIZAR | PASS: asentamiento estable; polling acotado sin publicar offset no alineado. |
| S07-08 | CI · J22/24: drag sin momentum cancela scroll por pin y confirma snap estabilizado<br>SS · J24–25/28: drag invalida programático, timestamps y epoch descartan eventos antiguos | CUBIERTO | REUTILIZAR | PASS: gesto invalida programático y retry anterior; prioridad de usuario. |
| S07-09 | CI · J16/18: recuperación una vez por destino y limpieza en unmount<br>SS · J16–18: recuperación una vez y cancelaciones por resize, dataset, blur y unmount | CUBIERTO | REUTILIZAR | PASS: una recuperación por destino; limpieza en resize/dataset/blur/unmount. |
| S07-10 | CI · J25/28/35: resize y dataset nuevo invalidan gesto anterior, reorder y vecino conservan reglas<br>CI · J27/30: una tarjeta sin swipe; empty/error sin carrusel<br>SS · J04/07/08/10: selección idempotente, ID inválido ignorado, contenido nuevo y reorder mantienen identidad | CUBIERTO | REUTILIZAR | PASS: 0/1/N, reorder/remove/textos e ID inexistente con reconciliación por identidad. |
| S07-11 | SS · J28/30: geometría compartida, width0/360/700 y single<br>CI · J07/12/39: contenido mismo ID no realinea; último índice virtualizado y bounds del layout | CUBIERTO | REUTILIZAR | PASS: width 0/360/700, stride, offset y getItemLayout; no equivale a rotación física nueva. |
| S07-12 | CI · J34/37: remount restaura ID/datos, focus realinea sin animación e iOS mantiene fallback<br>BP · Dashboard Android conserva productos y selección entre tabs | CUBIERTO | REUTILIZAR | PASS: remount/foco y tabs conservan ID sin recarga. Home físico conserva evidencia histórica; no se simula OS con Jest. |
| S07-13 | CI · J31–33: label/rol/selección, promoción/dirección y alternativa no gestual | CUBIERTO | REUTILIZAR | PASS: roles/labels/selected, Anterior/Siguiente y alternativa textual cambian misma selección. |
| S07-14 | CI · J12–15/39: taps A→B alinean última tarjeta; fin programático no escribe ni recompone markers<br>CI · J39: una card memoizada sin props cambiadas no vuelve a renderizar su subtree | CUBIERTO | REUTILIZAR | PASS: conteo mapper estable y subtree memoizado sin props cambiadas; sin claims de FPS. |
| N07-01 | NA · provider solicita un token nuevo por llamada y devuelve solo el contrato público<br>NA · provider proyecta el payload y rechaza formas incompletas sin cachear | PARCIAL | AMPLIAR | PASS: firma física con cardId; retorno exacto token/expiry sin extras, sin reloj/HMAC JS. |
| N07-02 | NA · provider solicita un token nuevo por llamada y devuelve solo el contrato público<br>PR · fallo de token muestra error seguro, libera control y permite renovar<br>LIB · API pública y composición android con módulo disponible=false | PARCIAL | AMPLIAR | PASS: emisión por intención, sin caché; error público sanitizado en pantalla. Rechazos físicos no se publican ni loguean; no se afirma que adapter reescriba todos los Error internos. |
| N07-03 | NA · gateway proyecta los cuatro eventos con ambos códigos y motivos sin campos extra<br>NA · gateway rechaza una apertura no aceptada por el módulo | PARCIAL | AMPLIAR | PASS: método físico recibe solo ID/token; true→Promise<void>, false→rechazo; rechazo físico probado desde UI. |
| N07-04 | NA · gateway proyecta los cuatro eventos con ambos códigos y motivos sin campos extra | PARCIAL | AMPLIAR | PASS: Opened y Shown contienen exclusivamente cardId; sentinel descartado. |
| N07-05 | NA · gateway proyecta los cuatro eventos con ambos códigos y motivos sin campos extra<br>NA · gateway descarta payloads malformados y códigos o motivos desconocidos | PARCIAL | AMPLIAR | PASS: ambos códigos con mensajes públicos exactos; null/tipos incorrectos/desconocidos no notifican. |
| N07-06 | NA · gateway proyecta los cuatro eventos con ambos códigos y motivos sin campos extra<br>NA · gateway descarta payloads malformados y códigos o motivos desconocidos | PARCIAL | AMPLIAR | PASS TS / PASS nativo reportado por propietario (§25.8): ambos motivos permitidos y rechazo de desconocidos PASS TS. Idempotencia nativa preservada en oneActiveSessionAndSingleClose/closeWinsRaceAgainstLateDrawAndErrorCallbacks: pipeline nativo confirmado por el propietario y XML con 13 tests sin fallos, sin atribuir una deduplicación inventada al adapter. |
| N07-07 | NA · unsubscribe repetido retira solo sus listeners y el remount no duplica eventos<br>PR · taps durante emisión no duplican apertura y unmount retira la suscripción | PARCIAL | AMPLIAR | PASS: 8→4→0 listeners, retirar instancia no afecta otra; remount una notificación y unmount cleanup. |
| N07-08 | LIB · API pública y composición android con módulo disponible=false<br>LIB · API pública y composición ios con módulo disponible=false | AUSENTE | NUEVO | PASS: import público con Registry.get(null) no crashea; composición deshabilita acceso sin módulo/iOS. |
| N07-09 | BP · wrapper normaliza null, filtra eventos y aplica últimas props<br>LIB · Fabric y TurboModule coexisten por API pública; props nuevas no inventan taps | PARCIAL | AMPLIAR | PASS: allowlist y props nuevas en host físico conservando wrapper/spec/export reales. |
| N07-10 | BP · wrapper normaliza null, filtra eventos y aplica últimas props<br>LIB · Fabric y TurboModule coexisten por API pública; props nuevas no inventan taps | CUBIERTO | AMPLIAR | PASS: evento estructurado entrega string una vez; inválidos/obsoletos ignorados. |
| N07-11 | LIB · Fabric y TurboModule coexisten por API pública; props nuevas no inventan taps | PARCIAL | AMPLIAR | PASS: rerender selectedMarkerId no incrementa contador de tap; status desconocido descartado. |
| N07-12 | LIB · API pública y composición android con módulo disponible=false | AUSENTE | NUEVO | PASS: exports reales de paquete y composición; inspección: UI consume API pública, no specs. |
| N07-13 | LIB · Fabric y TurboModule coexisten por API pública; props nuevas no inventan taps | PARCIAL | AMPLIAR | PASS: specs reales: Registry TurboModule y registro físico Fabric mockeados por frontera; no mock universal de librería. |
| I07-01 | PR · store pasa de idle a loading y success y evita recargas superfluas<br>SS · J09/18/27: B gana a A, cancelación de carga y empty no resucitan selección | CUBIERTO | REUTILIZAR | PASS: beforeEach usa getInitialState; cargas pendientes concluyen; suite completa repetida mantiene resultados. |
| I07-02 | CI · J16/18: recuperación una vez por destino y limpieza en unmount<br>SS · J22: nunca hay polling indefinido ni commit de offset sin snap | CUBIERTO | REUTILIZAR | PASS: restoreAllMocks/clearAllTimers/useRealTimers y act async revisados; sin sleeps/retries/forceExit. |
| I07-03 | NA · unsubscribe repetido retira solo sus listeners y el remount no duplica eventos<br>CI · J16/18: recuperación una vez por destino y limpieza en unmount | PARCIAL | AMPLIAR | PASS: listeners de instancia 0 y timer tardío no hace scroll tras unmount. |
| I07-04 | SS · J09/18/27: B gana a A, cancelación de carga y empty no resucitan selección<br>PR · store ignora respuesta obsoleta reject después de reintento | CUBIERTO | AMPLIAR | PASS: B gana frente a A tanto en Benefits como Products, éxitos y errores obsoletos. |
| I07-05 | LIB · API pública y composición android con módulo disponible=false<br>APP · abre el Dashboard en Mis productos y conserva los datos al cambiar de tab | PARCIAL | AMPLIAR | PASS: isolateModules + restoreAllMocks; suite completa en workers normales y runInBand sin contaminación. |
| I07-06 | APP · abre el Dashboard en Mis productos y conserva los datos al cambiar de tab | PARCIAL | AMPLIAR | PASS: 106 PASS en npm test estándar, coverage y fase Jest de test:all; repetición posterior al último cambio registrada en comandos. |

**Hotspots atendidos:** eventos antes verificados solo por nombre ahora exigen payloads exactos, ambos códigos/motivos y rechazo de malformados; cleanup pasa de contar remove() a medir emisores activos por instancia; entrada pública del paquete y módulo ausente antes sin prueba específica ahora tienen prueba de integración TS; errores de emisión/apertura y carrera de Products ahora tienen assertions de estado/ausencia de payload. No hubo ampliación artificial de las 32 pruebas de sincronización ya suficientes.

**Conteo:** 90→106 Jest; 10→11 suites. Incremento: NA +4, LP +2, PR +5, LIB +5 = **16**; CI y PR además refuerzan assertions existentes sin contarlas como tests nuevos. 13 JUnit se preservan **sin cambios** y 0 añadidos: 3 `TokenCodecTest` (emisión/renovación TTL 60000, frontera de expiración, firma/formato/card incorrectos); 5 `SecureSessionCoordinatorTest` (sesión única, deadline 45000, cierre único, error no muestra, background/revalidación y callbacks tardíos); 5 `map/MapStateTest` (coordenadas/IDs, snapshot previo a ready, reconciliación incremental/empty, selección/cleanup idempotente, lifecycle). Se leyeron los 13 métodos y sus assertions. Los comandos oficiales fueron confirmados exitosos por el propietario para Paso 07 (§25.8); XML locales registran 13 tests sin fallos. No se afirma que se forzara una reejecución de tareas incrementales.

### 25.4. Archivos y decisiones técnicas

- **Creado:** `__tests__/nativeLibrary.test.tsx`, 5 casos de frontera pública/composición, wrapper y fallback; mock del registro físico Fabric, sin saltar implementación propia.
- **Modificado:** `jest.config.js`, alcance/reporters/threshold; se mantiene el preset y semántica de scripts.
- **Ampliados:** LP, NA y PR de la tabla anterior; CI corrige su assertion negativa (antes solo rechazaba que aparecieran simultáneamente todas las claves prohibidas; ahora rechaza cada una).
- **Documentación:** README y este Step07 preexistente sin seguimiento, con reporte/checklist en su propio archivo; ningún MD de reporte nuevo.
- **Intactos:** todo código productivo de app/librería, Kotlin/Fabric/Codegen/Gradle/iOS, JSON, package.json, package-lock.json y documentos 01–06. No se añadieron herramientas, frameworks ni mocks globales.

El trade-off del umbral sigue el PDF: 70 % statements y lines sobre inventario completo, con branches/functions visibles y revisión por riesgo. Las entradas 0/0 se mantienen con su limitación; no se cambió transformación para fabricar contadores. Los 0 % de pantallas antiguas/entry se mantienen como deuda visible de bajo impacto, sin tests de exports o estilos para subir el número. La composición pública se prueba porque evita crashear/injectar módulos ausentes, no por incrementar coverage.

### 25.5. Comandos, evidencias y resultados

La tabla siguiente registra los **intentos iniciales del implementador en este workspace**. El cierre posterior desde **Terminal del propietario** se registra por separado en §25.8 y prevalece para 49/50. PATH se ajustó a Node 22.23.4. No se usó --forceExit, reintentos de tests, exclusión de suites ni runner nativo sustituto.

| Comando real | Exit | Resultado / evidencia |
| --- | --- | --- |
| pwd, git branch/status, node/npm --version, npm ls react-native jest @testing-library/react-native | 0 | main; versiones §25.1; estado inicial preservado |
| npm test -- --listTests --runInBand / --showConfig | 0 | inventario inicial 10 suites y config efectiva inicial guardados |
| npm test -- --watch=false --runInBand --coverage (preconfig) | 0 | 90/10, reporte importados guardado antes de editar config/tests |
| Mismo comando con inventario completo, antes de tests nuevos | 0 | 90/10, baseline A guardada antes de ampliación |
| npm test (estándar, sin runInBand) | 0 | 106 PASS/11; workers normales; más de una ejecución estable |
| npm test -- --watch=false --runInBand --coverage | 0 | 106 PASS/11; B y ambos thresholds PASS; repetida con mismo resultado |
| npm run test:native:android | 1 | **NO EJECUTADO JUnit / BLOQUEADO** por wrapper lock no escribible, antes de tareas |
| npm run test:all | 1 | Jest 106/11 PASS; **NO EJECUTADO JUnit / BLOQUEADO**, mismo lock; pipeline completo no PASS |
| npm run lint | 0 | PASS sin warnings |
| npm run typecheck | 0 | PASS strict, sin emisión |
| npm run format:check | 0 | PASS |
| git diff --check | 0 | PASS |
| Inventario realpath vs coverage-summary | 0 | 37/37, sin duplicados, 14 type-only identificados |
| Revisión estática prudente JS/TS/JSON/tests | 0 | 63 archivos, 0 coincidencias de patrones revisados; revisar límites §25.6 |
| Android build/smoke, Codegen, Pods/iOS | — | **NO REQUERIDO / NO EJECUTADO**: producto y código nativo sin cambios |

La repetición completa posterior a los últimos cambios de assertions está guardada en logs npm-test/final-coverage. Skipped/todo/snapshots = 0; ningún flake conocido ocultado. Las ejecuciones no sustituyen el comportamiento OS/SDK por mocks.

| Evidencia | Estado | Dónde se acredita |
| --- | --- | --- |
| E07-01 | PASS | Estado inicial §25.1 y final §25.7 |
| E07-02 | PASS | JSON inicial/final y tabla de 11 suites §25.3 |
| E07-03 | PASS | Config inicial/final guardada y tabla §25.2 |
| E07-04 | PASS | Histórico/preconfig/A/B, cubiertos/totales/deltas §25.2 |
| E07-05 | PASS | Inventario expandido, exclusiones y 0/0 explícitos §25.2 |
| E07-06 | PASS | Matriz completa C07/B07/S07/N07/I07 §25.3 |
| E07-07 | PASS | npm test estándar + coverage, 106/11 §25.5 |
| E07-08 | PASS externo | §25.8: propietario confirma test:native:android exitoso; XML 13 tests sin fallos. native.log conserva el intento local bloqueado |
| E07-09 | PASS externo | §25.8: propietario confirma test:all exitoso; test-all.log conserva el intento inicial local exit 1 |
| E07-10 | PASS | lint/typecheck/format/diff, logs §25.5 |
| E07-11 | PASS | Seguridad de fronteras/asserts y revisión §25.6 |
| E07-12 | PASS | README, apartado testing Paso 07 |
| E07-13 | PASS: NO REQUERIDO | Solo config/tests/docs; sin modificación productiva |
| E07-14 | PASS | Diff de alcance, contratos/stack intactos, no Paso 08 |

### 25.6. Seguridad, alcance y límites

Se comprobaron allowlists exactas de Cards/cuentas, markers y eventos, eliminación de sentinel extra no sensible, mensajes públicos de error sin payload físico, shape de stores sin token/datos completos y uso efímero de token en método de apertura. La inspección de 63 archivos JS/TS/JSON y tests no detectó coincidencias de claves Maps, números de 13–19 dígitos, asignaciones de campos completos pan/cvv/holder ni logging/persistencia según los patrones revisados. **Esto es revisión focalizada con posibles falsos negativos, no certificación de seguridad**. Los tokens de pruebas son etiquetas opacas inofensivas, nunca HMAC real ni credencial.

Se revisó el diff versionable sin leer ni imprimir `android/secrets.properties`; `git check-ignore` confirmó ese archivo y coverage/ ignorados. No se copiaron screenshots/video de datos sensibles. No se introdujeron snapshots, persistencia ni logger; tampoco se leyó el repositorio Kotlin de datos completos como evidencia. El token completo solo puede circular efímeramente según el contrato aprobado; los eventos/stores no lo devuelven.

Jest prueba reglas y contratos TS con hosts físicos dobles; no compila Codegen ni acredita teselas Google, controles de zoom, pantalla FLAG_SECURE, back/background real, enlaces nativos, criptografía/TTL física o FPS/leaks. Esas comprobaciones anteriores siguen aprobadas en 01–06; no se ejecutaron de nuevo. JUnit también tiene límites de seams puras; los comandos oficiales se acreditan desde Terminal del propietario (§25.8), mientras el sandbox conserva su restricción. No hay Swift/MapKit y no se declara paridad iOS. TalkBack manual del Paso 06 permanece **EXCLUIDO / NO APLICA**; a11y estándar (roles/labels/selected/alternativa textual, texto adaptativo y targets existentes) conservada y las assertions RNTL correspondientes pasan.

No hay defecto productivo nuevo reproducido ni fix pendiente. **No quedan bloqueos de cierre:** el propietario confirmó los dos comandos oficiales exitosos (§25.8). La restricción local del sandbox persiste, sin impedir acreditar el resultado externo. No se requieren secretos ni repetir maniobras manuales históricas.

### 25.7. DoD, estado final y acción de cierre

Los **65 criterios** conservan su numeración en §20 y están **65/65 PASS**, sin exclusiones. Los criterios 49/50 se cerraron con la confirmación del propietario de ambos comandos oficiales; los otros 63 ya tenían evidencia local. El DoD 42 de Paso 07 es PASS (calidad de tests); la exclusión TalkBack pertenece únicamente al Paso 06. El DoD 60 es PASS mediante su alternativa explícita: smoke **NO REQUERIDO**, al no cambiar código productivo.

**Conclusión: PASO 07 COMPLETADO Y VALIDADO.** Se conserva el detalle de cobertura y los bloqueos históricos sin presentarlos como el estado actual. No hace falta recompilar la app por este diff de tests/config/docs. El plan original preveía continuar con el Paso 08, **no diseñado ni ejecutado en aquella intervención**; esa etapa fue posteriormente **omitida por decisión del propietario**. No hubo commits, pushes ni publicaciones.

Estado final (`git status --short`):

```text
 M README.md
 M jest.config.js
 M src/capabilities/benefits/presentation/__tests__/carouselIntegration.test.tsx
 M src/capabilities/cards/infrastructure/__tests__/localProducts.test.ts
 M src/capabilities/cards/infrastructure/__tests__/nativeAdapters.test.ts
 M src/capabilities/cards/presentation/__tests__/productsPresentation.test.tsx
?? __tests__/nativeLibrary.test.tsx
?? docs/steps/STEP-07-TESTING-COVERAGE.md
```


### 25.8. Cierre vigente — 65/65 DoD verificados

Después de solicitar las ejecuciones de `npm run test:native:android` y `npm run test:all`, el propietario confirmó: **«ambos dieron BUILD SUCCESSFUL in 1s»**. Se acredita el PASS de ambos scripts **desde su Terminal**, no desde el sandbox del implementador. El script test:all mantiene su secuencia `Jest && test:native:android`; no fue reemplazado ni alterado.

| Comando | Origen de la evidencia | Resultado vigente |
| --- | --- | --- |
| `npm run test:native:android` | Confirmación expresa del propietario | **PASS — BUILD SUCCESSFUL in 1s** |
| `npm run test:all` | Confirmación expresa del propietario | **PASS — BUILD SUCCESSFUL in 1s** |

Se consultaron además, en modo lectura y sin imprimir payloads, los tres XML canónicos de `packages/io-native-components/android/build/test-results/testDebugUnitTest/`: **TokenCodecTest 3, SecureSessionCoordinatorTest 5 y map.MapStateTest 5**, todos con **0 failures, 0 errors, 0 skipped**. Sus timestamps son `2026-11-06T03:13:06.877Z` a `2026-11-06T03:13:06.964Z`. Los XML corresponden al módulo único; el symlink node_modules no se suma como otra batería.

**Límite de atribución:** no se recibió el log completo de la Terminal ni se afirmó uso de `--rerun-tasks`; un BUILD SUCCESSFUL incremental puede reutilizar resultados válidos. Se registra la confirmación real del usuario y el contenido de los reportes, sin inventar tareas ejecutadas, tiempos Jest externos o una corrida desde el sandbox. Los logs iniciales bloqueados del implementador permanecen intactos como evidencia histórica.

Con estos resultados se cierran **49 y 50** y queda **65/65 DoD PASS**. Se mantienen 106 Jest/11 suites, métricas finales auditadas y checks locales del reporte; no se modificó producto ni se requieren nuevas maniobras Android. README y este documento se actualizaron sin crear otro MD. **Paso 07 cerrado; no se avanzó al Paso 08, no se hizo commit ni push.**
