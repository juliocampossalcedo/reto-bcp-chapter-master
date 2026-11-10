# Pruebas y evidencia de entrega

Corte documental: **09/11/2026 (America/Lima)**. Las ejecuciones siguientes se realizaron localmente sobre la rama `main` del checkout actual. No implican validación interactiva nueva de Android/iOS ni una auditoría de seguridad integral.

## Ejecución actual

| Comando/acción | Plataforma | Estado | Evidencia y límite |
| --- | --- | --- | --- |
| `npm run lint` | RN/TS, Node 22.23.4 | PASS | Salida 0, ESLint sin hallazgos |
| `npm run typecheck` | RN/TS | PASS | `tsc --noEmit`, salida 0 |
| `npm run format:check` | RN/TS | PASS | Prettier: todos los archivos coinciden |
| `npm test -- --watch=false --runInBand --coverage` | Jest/RNTL | PASS | 13 suites, 113/113 tests; cobertura abajo |
| `npm run test:all` | Jest + Gradle | PASS final | 113/113 Jest; Gradle `BUILD SUCCESSFUL in 1s`, 29 tareas UP-TO-DATE. Primer intento falló porque el sandbox bloqueó el lock de la caché Gradle; se repitió con acceso aprobado. No fue fallo de test. |
| `npm run test:native:android` con acceso aprobado a caché Gradle | JUnit Android | PASS de tarea, tests UP-TO-DATE | `BUILD SUCCESSFUL in 10s`; 29 tareas up-to-date. **No se ejecutaron de nuevo los 13 casos** en este paso. |
| `git diff --check -- README.md docs/delivery docs/steps/STEP-10-DOCUMENTATION-DELIVERY.md` y `rg -n '[[:blank:]]+$'` sobre los tres MD de entrega | Documentación | PASS | Sin whitespace en README ni documentos nuevos. Git aún no incluye los MD nuevos en el diff por estar sin staging. |
| Build/arranque/smoke Android de rama actual | Android | NO EJECUTADO | `adb devices` fuera del sandbox devolvió lista vacía el 09/11/2026; sin emulador/dispositivo online. Cierre histórico Paso 11, sección 16. |
| Build/arranque/smoke iOS de rama actual | iOS simulador | NO EJECUTADO | `xcrun simctl list devices booted` fuera del sandbox no mostró simulador iniciado el 09/11/2026; sin smoke ni XCTest nuevos. Cierre histórico Paso 11, sección 16. |
| iPhone físico | iOS | NO EJECUTADO | Omitido expresamente por el propietario en Paso 11 |

Para los comandos npm se seleccionó Node 22.23.4 en esta máquina; en otra instalación basta Node 22.11+ y `npm` del `PATH`.

`xcodebuild -version` informó Xcode 26.2; `java -version`, JDK 17.0.14; `pod --version`, 1.17.0. El `node` por defecto del shell era 20.12.2, por lo que se usó explícitamente Node 22.23.4. Fuera del sandbox, `adb devices` no listó dispositivos y `xcrun simctl list devices booted` no listó simuladores encendidos. No se inició un dispositivo para una tarea exclusivamente documental.

### Cobertura RN/TS medida en Paso 10

Comando: `npm test -- --watch=false --runInBand --coverage`. Resultado Istanbul/Jest actual:

| Métrica | Resultado |
| --- | --- |
| Statements | **96,29 %** (546/567) |
| Branches | **93,66 %** (429/458) |
| Functions | **96,25 %** (180/187) |
| Lines | **96,77 %** (510/527) |
| Jest | **113/113**, 13 suites, 0 snapshots |

Fuente: salida de consola del comando en este paso; `coverage/` queda ignorado por Git y puede regenerarse. `jest.config.js` define `collectCoverageFrom` sobre fuentes productivas RN/TS; los porcentajes corresponden solo a Jest/Istanbul. La cifra supera la recomendación de 70 % RN del enunciado. No se incluye Swift ni Kotlin en ese denominador. Los archivos de entrada declarativos/Codegen pueden aparecer con 0 % o sin instrucciones instrumentables; no se modificó el denominador para elevar la cifra.

### Cierres históricos, separados de la ejecución actual

| Fuente y fecha | Evidencia aprobada |
| --- | --- |
| [Paso 07, sección 25.8](../steps/STEP-07-TESTING-COVERAGE.md#258-cierre-vigente--6565-dod-verificados), 05/11/2026 | 65/65 DoD; 106 Jest/11 suites y 13 JUnit |
| [Paso 09, sección 13.14](../steps/STEP-09-EXTRAS.md#1314-smoke-android-confirmado-por-el-propietario--06112026), 06/11/2026 | 113 Jest/13 suites, 13 JUnit; cobertura RN 96,32/93,93/96,25/96,79 % en statements/branches/functions/lines; 44/44 fuentes instrumentables |
| [Paso 11, sección 16](../steps/STEP-11-IOS-SWIFT-MAPKIT.md#16-reporte-de-ejecución--2026-11-06), 06/11/2026 | 24/24 DoD; 113/113 Jest, 13/13 JUnit, 5/5 XCTest; build y smoke Android/iOS simulador con herramientas y confirmación del propietario |

El XCTest histórico se ejecutó en Xcode con `⌘U` sobre `IoProductsBenefitsTests`, con 5 pruebas y 0 fallos. Las confirmaciones de smoke manual del Paso 11 son del **propietario** y no se atribuyen a las ejecuciones locales del Paso 10.

## Requisito → evidencia

| Requisito | Evidencia aplicable | Límite |
| --- | --- | --- |
| Productos enmascarados / UI | Jest/RNTL `productsPresentation.test.tsx` y `localProducts.test.ts` | Host nativo mockeado |
| Token válido/inválido/expirado | JUnit histórico, XCTest histórico y `nativeAdapters.test.ts` | JUnit fue UP-TO-DATE en Paso 10 |
| TurboModule / vista segura / sesión | JUnit, XCTest y smoke del propietario en Paso 11 | Jest no prueba `FLAG_SECURE` ni UIKit |
| Benefits / marcas / coordenadas | Jest `benefits.test.ts` y `benefitsPresentation.test.tsx` | Catálogo mock |
| Mapa/carrusel | Jest `carouselIntegration.test.tsx` y smoke Android/iOS del Paso 11 | Jest no verifica teselas Google/Apple |
| Auth y compuerta Dashboard | Jest `authFlow.test.tsx` y `firebaseAuth.test.ts`, smoke del propietario | Requiere Firebase y red para login real |
| iOS nativo | XCTest 5/5 histórico, simulador | No iPhone físico; no XCTest nuevo |
| Android nativo | JUnit 13/13 histórico | Tarea actual UP-TO-DATE, no repetición de casos |

Las rutas de tests y la configuración se verificaron en el checkout; el documento no contiene secretos ni captura datos completos de tarjeta.
