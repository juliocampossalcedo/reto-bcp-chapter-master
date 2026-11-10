# STEP-06 — Carrusel de beneficios y sincronización bidireccional mapa ↔ carrusel

> **Actualización de alcance — 06/11/2026:** el Paso 08 fue **OMITIDO por decisión del propietario**, por resultar redundante para el reto BCP. Su documento de ejecución fue eliminado. Las referencias históricas a esa etapa corresponden al plan original y no constituyen trabajo pendiente ni un requisito de cierre. Este paso conserva su aprobación y sus controles implementados.

**Proyecto:** `io-products-benefits`  
**Aplicación:** iO Productos & Beneficios  
**Librería nativa única:** `io-native-components`  
**Etapa:** 06 de 12  
**Versión del documento:** 1.1 — ejecutado en código; TalkBack excluido por decisión del propietario  
**Estado:** **PASO 06 COMPLETADO Y VALIDADO — 57/57 CRITERIOS APLICABLES; CRITERIO ORIGINAL 42 EXCLUIDO**  
**Fecha de preparación:** 05/11/2026  
**Prerrequisitos:** Pasos 01, 02, 03, 04 y 05 **completados y aprobados** por el propietario  
**Evidencia del paso inmediato:** `STEP-05-BENEFITS-CUSTOM-MAP.md`, §21.9, **47/47 DoD**  
**Stack fijado:** React Native **0.88.0**, TypeScript estricto, New Architecture, React Navigation, Zustand, Fabric + Codegen y Android/Kotlin  
**Plataforma obligatoria:** Android con Google Maps SDK oficial, reutilizando `CustomMap`  
**Plataforma adicional:** iOS/Swift + MapKit **exclusivamente en Paso 11**  
**Ubicación de destino en el repositorio:** `docs/steps/STEP-06-MAP-CAROUSEL-SYNC.md`

**Ajuste de alcance — 05/11/2026:** por instrucción expresa del propietario, no se implementa lógica específica para TalkBack. Sus anuncios específicos son opcionales y su prueba manual es recomendada, pero no obligatoria para cerrar el Paso 06. La accesibilidad estándar de React Native sigue siendo un requisito de BCP. **M15 y DoD 42 están EXCLUIDOS / NO APLICAN**, no aprobados como pruebas ejecutadas. Se conservan la accesibilidad base, labels, roles, estados seleccionados, controles alternativos, fuente ampliada y sus pruebas RNTL. No es necesario instalar/configurar TalkBack ni crear otro emulador para cerrar este paso. La numeración original 01–58 se conserva para trazabilidad; quedan **57 criterios aplicables**. Esta exclusión no se cuenta como prueba aprobada; los demás criterios se cerraron con las evidencias de §24.14.

> **Regla de estado vigente:** §§1–23 conservan la especificación técnica; §24 registra la ejecución. El cierre final está en **§24.14**. Los bloqueos, cifras parciales y pruebas pendientes de apartados anteriores son históricos y quedan superados por la evidencia posterior explícita. Los Pasos 01–05 conservan su aprobación.

---

## 1. Plan de implementación

> Actúa como un **Chapter Frontend / Senior React Native Engineer**, especialista en React Native 0.88, TypeScript, React Navigation, Zustand, Fabric/Codegen, Clean Architecture, SOLID, accesibilidad móvil, rendimiento de listas virtualizadas y testing con Jest/React Native Testing Library.
>
> **EJECUTA EXCLUSIVAMENTE EL PASO 06 — CARRUSEL DE BENEFICIOS Y SINCRONIZACIÓN BIDIRECCIONAL MAPA ↔ CARRUSEL** en el repositorio existente `io-products-benefits`.
>
> Los **Pasos 01–05 están completados y aprobados**. El Paso 05 terminó el **05/11/2026 con 47/47 DoD**. **No repitas auditorías ni implementaciones anteriores**, no reinicialices la app, no sustituyas la capability `Benefits` y no reconstruyas `CustomMap`.
>
> **Objetivo funcional:** incorporar un carrusel horizontal **100 % React Native** que utilice exclusivamente los beneficios elegibles y representables en el mapa del Paso 05; sincronizar de manera estable **tocar marcador → seleccionar/desplazar carrusel** y **deslizar carrusel → seleccionar marcador**, utilizando **una sola fuente de verdad para `selectedBenefitId`**, y respetar navegación entre tabs, estados y accesibilidad.
>
> **Restricciones principales:** conservar los contratos `Benefit`, `MapMarker`, `CustomMapProps`, `markers`, `selectedMarkerId` y `onMarkerPress`; reutilizar la librería nativa `io-native-components`; **no modificar Fabric/Codegen/Kotlin** sin un defecto reproducible y justificación explícita; no usar `react-native-maps`, carruseles de terceros, Firebase, Swift/MapKit ni dependencias innecesarias.
>
> Lee primero las fuentes en §1.1, inspecciona solo las superficies necesarias, implementa incrementalmente las tareas de §17, ejecuta las pruebas y verificaciones reales de §14–16 y entrega el reporte de §21 con el DoD de §18 respaldado por evidencia. **Detente al completar el Paso 06.** No crees ni ejecutes el Paso 07. No hagas commits, push ni publicaciones sin instrucción del propietario.

### 1.1. Orden de lectura y precedencia

Antes de modificar cualquier archivo:

1. `Reto técnico - Chapter Master Frontend.pdf`: documento oficial, especialmente págs. 2–4, 6–8 para interacción, contratos, conservación del estado, pruebas, UX y restricciones. Si no está en el checkout local, consignar su ausencia y consultar el baseline; no inventar contenido.
2. `RETO_BCP_TECHNICAL_BASELINE.md`: objetivos, capítulos de arquitectura, `Benefits`, sincronización, carrusel, accesibilidad, performance y testing.
3. `docs/steps/STEP-02-ARCHITECTURE.md`: **contratos aprobados** de `Benefit`, `CustomMapProps`, `MapMarker`, `BenefitRepository`, `AvailableCardBrandsReader` y fronteras de dependencia.
4. `docs/steps/STEP-04-NATIVE-SECURE-VIEW.md`: leer **solo** lo imprescindible para preservar el paquete único, `IoSecureView`, eventos, protección nativa y scripts de pruebas.
5. **`docs/steps/STEP-05-BENEFITS-CUSTOM-MAP.md` completo, incluida §21.9 y su evidencia final**. Las secciones §21.1–21.8 son historial de validación y **no** representan el estado final si contradicen §21.9.
6. Código real del checkout: pantalla Benefits, navegación, composición, hooks/stores, mapper, paquete `io-native-components`, mocks de tests y scripts actuales; inspeccionar **sin reabrir los DoD** de 01–05.
7. Este documento y documentación oficial de React Native 0.88 y RNTL cuando corresponda (§22).

**Precedencia en conflictos:** **PDF oficial > baseline maestro > contratos aprobados del Paso 02 y comportamiento real validado de los Pasos 03–05 > este prompt > conveniencias de implementación.** Registrar cualquier desviación material. No cambiar un contrato estable para facilitar el carrusel.

### 1.2. Disciplina operativa

- Antes de cambiar: `pwd`, `git status --short`, `git branch --show-current`, inspección focalizada de archivos y scripts; preservar modificaciones del propietario.
- No ejecutar `react-native init`, `expo`, migraciones de versiones, sustitución de navegación ni instalación de paquetes por rutina.
- Mantener `React Native 0.88.0`, New Architecture, `npm`, **un solo `package-lock.json`**, Hermes y TypeScript estricto.
- No sobrescribir información privada o credenciales; la key de Google Maps sigue en `android/secrets.properties` ignorado; **no imprimirla ni copiarla**.
- No usar `any`, `@ts-ignore`, listeners globales improvisados ni timers que se queden vivos tras un unmount.
- No marcar como PASS una compilación, test o interacción física que no se haya ejecutado.
- No cambiar los documentos cerrados del Paso 01–05 para hacer que el Paso 06 aparente cumplido.

---

## 2. Contexto real confirmado al finalizar el Paso 05

**Fuente:** cierre vigente de `STEP-05-BENEFITS-CUSTOM-MAP.md`, §21.9, junto con sus contratos de implementación. Esta es la línea base **documentada**; el implementador verificará las referencias reales al conectarlas, sin reauditoría.

| Superficie | Estado aprobado que el Paso 06 debe **reutilizar** |
| --- | --- |
| Dashboard | Dos tabs: **Mis productos** y **Beneficios**, con React Navigation, header/tema compartido y conservación de navegación. |
| Cards | Fuente segura de marcas de tarjetas; sin PAN, CVV ni titular completos en JS. |
| Benefits | `LocalBenefitsDataSource` → repositorio → `loadEligibleBenefits`; filtrado por `applicableBrands` usando `AvailableCardBrandsReader` compuesto con `CardRepository`. |
| Datos | `Benefit.id: number` y `MapMarker.id: string` derivado mediante `String(benefit.id)`. Datos ficticios de Lima; **no** beneficios reales de comercios. |
| Ubicaciones | Beneficios con coordenadas inválidas se omiten de los marcadores y se contabilizan (`omittedLocations` o equivalente real). Todos los puntos inválidos producen un error de ubicación, no un empty engañoso. |
| Native package | Único `packages/io-native-components`, Codegen `IoNativeComponentsSpec`, `type: all`; Fabric `CustomMap` y TurboModule `IoSecureView` conviven. |
| Mapa Android | Google Maps SDK oficial, reconciliación incremental, selección controlada por prop y taps emitidos por Fabric. |
| Selección preliminar | `BenefitsScreen` conserva una selección local de marcador para el flujo mapa → texto/mapa, **sin carrusel**. Este estado se migrará, no se duplicará. |
| Accesibilidad | Existe alternativa textual vertical para identificar/seleccionar beneficios; mantener o integrar sin perder su propósito. |
| iOS | Fallback accesible y honesto; **no** hay mapa nativo iOS ni paridad de sincronización. |
| Compatibilidad Android | Se documentó ajuste de manifest `<uses-library android:name="org.apache.http.legacy" android:required="false" />` por el renderer del emulador; conservarlo. |
| Calidad reportada al cierre | **47/47 DoD**, **58 tests Jest / 8 suites** y **13 JUnit**; builds y smoke Android aprobados por el propietario. Son cifras del Paso 05, **no resultados del Paso 06**. |

**Límites conservados del cierre 05:** no se reportó prueba manual TalkBack; hubo una info window de Google Maps recortada en un borde, con título accesible en el texto RN; no se ejecutaron manualmente escenarios de pérdida de red/Play services ni pruebas de presión de memoria. **No convertir esos límites en afirmaciones de PASS en Paso 06.** El carrusel puede aportar un texto alternativo mejor sin justificar cambios nativos fuera del alcance.

### 2.1. Qué exige el evaluador en esta etapa

El PDF oficial exige **tocar un marcador y destacar el beneficio en un carrusel horizontal**, y también **deslizar el carrusel para resaltar el marcador**. Las dos tabs deben ser adaptativas, accesibles y **conservar su estado al cambiar**. Las pruebas unitarias de Benefits deben comprobar la sincronización en ambos sentidos. El mapa nativo sigue exponiendo `markers`, `selectedMarkerId` y `onMarkerPress`.

---

## 3. Alcance, entregables y exclusiones

| Entregable | En Paso 06 | Observación |
| --- | --- | --- |
| Carrusel horizontal con `FlatList` de RN | **Sí** | Sin paquete externo; snapping, selección visible y scroll imperativo. |
| Reutilizar elegibilidad, marcas, mapper y markers | **Sí** | **No** reimplementar reglas de Benefits. |
| Mapa → carrusel | **Sí** | `onMarkerPress(id)` válido actualiza selección y alinea tarjeta. |
| Carrusel → mapa | **Sí** | Gesto finalizado selecciona ID; prop `selectedMarkerId` resalta pin. |
| Fuente única `selectedBenefitId` | **Sí** | Estado seguro de presentación de Benefits; sin duplicado nativo. |
| Preservación al cambiar tabs | **Sí** | Selección por ID y realineación por geometría al reabrir. |
| Dataset dinámico, reorder, 0/1/N, IDs inválidos | **Sí** | Reconciliación determinista y pruebas. |
| Accesibilidad y responsive | **Sí** | Alternativa textual real, labels/roles, fuente ampliada y safe areas; TalkBack excluido por decisión del propietario. |
| Jest + RNTL + smoke Android | **Sí** | Ambos sentidos y regresiones focalizadas. |
| JUnit del Paso 05 | **Regresión** | No añadir código Kotlin sin defecto demostrado. |
| Seguridad/README | **Actualización focalizada** | Documentar integración y preservar límites existentes. |
| Coverage transversal >=70 %, hardening general | **No como auditoría de este paso** | Meta global del Paso 07; reportar cobertura efectiva disponible. |
| Firebase, publicación nativa, Swift/MapKit | **No** | Pasos posteriores. |

### 3.1. Fuera de alcance explícito

No reconstruir `Benefits` ni sus repositorios, filtrado o carga; no duplicar `benefits.json`, tarjetas ni catálogo de marcas; no crear una segunda librería; no añadir APIs Fabric, comandos imperativos al mapa, cambios en `MapView`/Kotlin/Codegen ni eventos nativos nuevos **solo** para animar el carrusel. No implementar cámara reactiva al swipe salvo que el contrato nativo aprobado **ya** lo haga: **destacar el marcador seleccionado es obligatorio; mover la cámara a cada swipe no lo es**. No añadir GPS, geolocalización, clustering, imágenes remotas obligatorias, animaciones pesadas, backend, analytics, persistencia en disco o permisos nuevos.

---

## 4. Arquitectura: integración dentro de Benefits, no otro subsistema

### 4.1. Diagrama de responsabilidad

```text
Cards / Account Management              Benefits (ya implementado en 05)
  CardRepository                              BenefitRepository
        │                                           │
        └─> AvailableCardBrandsReader ─────> loadEligibleBenefits
                                                     │
                                    eligible + valid map markers
                                                     │
                                              presentation
                                                     │
                       ┌─────────────────────────────┴──────────────────────┐
                       │          selectedBenefitId: string | null        │
                       │          ÚNICA FUENTE DE VERDAD                  │
                       └─────────────────────────────┬──────────────────────┘
                                                     │
                         ┌───────────────────────────┴────────────────────┐
                         ▼                                                ▼
              <CustomMap markers={...}                      <BenefitsCarousel
                selectedMarkerId={...}                        selectedBenefitId={...}
                onMarkerPress={...} />                        onSettledBenefit={...} />
                         │                                                │
                    Fabric → Kotlin                                  FlatList RN
                    Google Maps SDK                                  snap/scrollToIndex
```

**Sentido de las dependencias:** `domain` no importa React, RN, Zustand, UI, mapas ni librería nativa. `application` conserva elegibilidad y puertos existentes. `presentation` incorpora carrusel/selección; `app/composition` sigue entregando casos de uso y dependencias. La UI no importa infraestructura ni JSON por comodidad. No introducir `shared/carousel` si el único consumidor es Benefits.

### 4.2. Archivos orientativos (ajustar a los reales)

```text
src/
  app/
    navigation/DashboardNavigator.tsx        # EXISTENTE; tocar solo por layout si hace falta
    composition/benefitsDependencies.ts      # EXISTENTE; sin nueva copia de Benefits
    theme/tokens.ts                          # EXISTENTE; reutilizar tokens
  capabilities/
    benefits/
      domain/                                # INTACTO
      application/
        usecases/loadEligibleBenefits.ts     # EXISTENTE; NO reconstruir
      infrastructure/                        # INTACTO salvo tests/fix demostrado
      presentation/
        contracts/CustomMapContracts.ts      # INTACTO
        screens/BenefitsScreen.tsx           # integrar mapa + carrusel
        components/
          BenefitsCarousel.tsx               # NUEVO, o equivalente
          BenefitCarouselCard.tsx            # NUEVO si separa responsabilidades
        hooks/
          useBenefitSelection.ts             # OPCIONAL, orquestación testable
        store/
          useBenefitsStore.ts                # EXTENDER si ya existe
          # O bien un store mínimo de selección SOLO si la pantalla no conserva
          # selección al desmontarse. Nunca ambos como fuentes de verdad.
        utils/
          reconcileBenefitSelection.ts       # OPCIONAL, función pura de reconciliación
        __tests__/...                        # tests junto al código o convención existente
packages/io-native-components/              # EXISTENTE; SIN CAMBIOS NORMALES
  src/CustomMap.tsx                          # EXISTENTE; reutilizar API pública
  src/specs/CustomMapNativeComponent.ts      # EXISTENTE; NO ALTERAR
  android/.../map/...                        # EXISTENTE; NO ALTERAR
docs/steps/STEP-06-MAP-CAROUSEL-SYNC.md     # este documento
README.md                                   # actualización incremental de uso/tests
```

Nombres y carpetas de componentes nuevos son **orientativos**, no una orden de generar archivos vacíos. No multiplicar controller/reducer/hook/store para una coordinación sencilla. Si se requiere lógica de reconciliación no trivial, una **función pura** y un hook pequeño son preferibles a una máquina de estados externa.

---

## 5. Contratos aprobados e invariantes de identidad

### 5.1. Tipos existentes: reutilización estricta

El **dominio aprobado** tiene `Benefit.id: number`, `title`, `description`, `image`, `promotion`, `address`, `latitude`, `longitude` y `applicableBrands`. No añadir campos de UI ni reemplazar el ID numérico.

```ts
// Referencia semántica existente. NO redefinir el contrato en un archivo nuevo.
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

La conversión **única y aprobada** es `marker.id === String(benefit.id)`. `onMarkerPress` del wrapper público entrega el **string ID**, no el evento nativo `{nativeEvent: ...}`. El carrusel y el estado de selección usan el **mismo string ID** para no crear conversiones divergentes.

### 5.2. Fuente de verdad única

**Decisión cerrada de este paso:**

```ts
// Estado persistente durante la sesión de navegación (no en disco).
selectedBenefitId: string | null;
```

- `selectedMarkerId` **se deriva** de `selectedBenefitId` y **no se guarda** como segundo estado o store. En `CustomMap`: `selectedMarkerId={selectedBenefitId}` (el wrapper existente adapta `null` cuando sea necesario).
- `selectedBenefitIndex` **se deriva** del orden visible: `idToIndex.get(selectedBenefitId)`; no almacenar un índice independiente como fuente de selección.
- El índice visible durante el gesto, `offsetX`, `isDragging`, tokens de solicitud y `pendingProgrammaticScroll` pueden existir en **`useRef` transitorios** para coordinación; **no representan una segunda selección**.
- Si hoy existe `selectedMarkerId` local en `BenefitsScreen` (Paso 05), **migrarlo** a esta única selección. No mantener `selectedMarkerId` y `selectedBenefitId` como estados paralelos.
- Preferir **extender el store Benefits existente**, si ya existe. Si el Paso 05 usó selección únicamente local, adoptar **un estado Zustand mínimo y no persistido en disco** dentro de la capability Benefits para garantizar restauración incluso ante remount/detach. No crear un segundo store de selección en otra capa.
- Los componentes reciben `selectedBenefitId` como prop controlada y callbacks de intención; el carrusel **no** tiene un `useState(selectedId)` independiente.
- `Cards` y la vista segura no consumen este store. Tampoco se almacena `secureToken`, PAN, CVV, titular ni key de Maps.

### 5.3. Invariantes verificables

1. `selectedBenefitId === null` **solo** cuando no existe selección válida (antes de éxito/0 elementos o mientras se resuelve el estado correspondiente).
2. En estado de éxito con **N > 0** beneficios seleccionables, el ID seleccionado pertenece a los IDs de tarjetas visibles **y** a los IDs de marcadores válidos; no hay selección huérfana.
3. Con N > 0 estable, el mapa recibe **exactamente el ID seleccionado**; la tarjeta destacada representa ese mismo ID.
4. El carrusel **nunca** inventa beneficios ni muestra los excluidos por marca.
5. Un tap nativo con ID inexistente/vacío/obsoleto no cambia selección ni genera scroll.
6. Una actualización programática de `FlatList` no crea una segunda intención de usuario ni reenvía una selección al mapa en loop.
7. Re-render de pantalla, vuelta de tabs, resize y `onViewableItemsChanged` **no** modifican selección por sí mismos.
8. La selección solo se confirma mediante intención explícita **o** reconciliación de dataset, jamás durante el render de un componente.

---

## 6. Dataset del carrusel: misma elegibilidad y misma capacidad de ubicación

### 6.1. Reutilizar el pipeline del Paso 05

No volver a filtrar por `applicableBrands` dentro del componente ni leer tarjetas desde el JSX. Consumir el **resultado ya resuelto y validado** por `loadEligibleBenefits` (o la API real aprobada). Conservar su orden determinístico, casos `loading / success / empty / error`, reconexión con Cards, `omittedLocations`, `Reintentar` y tratamiento de requests obsoletos.

**Decisión de consistencia mapa ↔ carrusel:** el carrusel sincronizado representa los **beneficios elegibles que poseen un marcador válido en el conjunto actualmente enviado al mapa**. Así se garantiza correspondencia 1:1 entre tarjeta seleccionable y pin; no existe una tarjeta que exija destacar un marcador no representable.

```ts
// PSEUDOCÓDIGO: adaptar a la estructura de retorno REAL del Paso 05.
const validMarkerIds = new Set(markers.map(marker => marker.id));
const carouselBenefits = eligibleBenefits.filter(benefit =>
  validMarkerIds.has(String(benefit.id)),
);
```

**No usar este filtrado como una segunda validación de negocio:** es una **proyección de presentación por pertenencia a `markers` ya aprobados**. Si la implementación de Paso 05 devuelve directamente el conjunto de elegibles ubicables, consumirlo sin recomputar. Los beneficios omitidos por ubicación permanecen documentados en `omittedLocations`/aviso existente; no reintroducirlos en el carrusel con una ubicación ficticia. Si **todos** los elegibles tienen ubicación inválida, conservar el estado de **error de ubicación** aprobado, no presentarlo como catálogo vacío.

### 6.2. Correspondencia de IDs y orden

- `carouselBenefits.map(b => String(b.id))` debe coincidir **en membresía** con `markers.map(m => m.id)` para los markers renderizados. Si el mapper conserva el mismo orden, usarlo; si no, documentar la proyección sin mutar el JSON.
- Rechazar duplicados o IDs inválidos **en la frontera existente del Paso 05**; el carrusel no debe normalizarlos silenciosamente de una forma alternativa.
- Usar `keyExtractor={benefit => String(benefit.id)}`; nunca índices como keys.
- Crear `idToIndex` con `useMemo` sobre **la lista visible estable**, no rehacerlo a cada pixel de scroll.
- Los changes de contenido con mismo ID (título, promoción, descripción) actualizan la tarjeta sin perder selección.
- Los reorders conservan la selección por ID y realinean al nuevo índice sin disparar un evento de usuario.

### 6.3. Política de 0, 1 y N

| Tamaño visible | Selección | Render / comportamiento |
| --- | --- | --- |
| **0** | `null`; limpiar selección tras éxito `empty` | Conservar el empty/error de Benefits aprobado; **no** montar carrusel vacío ni placeholders falsos; mapa sin selección. |
| **1** | Único ID automáticamente en primer éxito | Una tarjeta completa; sin swipe innecesario, sin indicadores de páginas engañosos ni `scrollToIndex` repetidos. |
| **N >= 2** | Primer ID en primera carga exitosa, salvo selección válida preexistente | Lista horizontal con snapping; posición/selección mantenidas por ID, no por offset absoluto. |

La selección automática inicial y la reconciliación **no** deben emitir `onMarkerPress` ni anunciarse como interacción física. El primer marker elegido puede destacarse de forma declarativa al recibir la prop sin tocar Kotlin.

---

## 7. Estrategia de selección y reconciliación determinista

### 7.1. API de intención, no callbacks circulares

Se recomienda una acción única de escritura con identidad e idempotencia, localizada en presentación:

```ts
// Interfaz conceptual, NO contrato de dominio y NO spec de Codegen.
type SelectionOrigin = 'map' | 'carousel' | 'dataset' | 'restore' | 'a11y';

function selectBenefit(id: string, origin: SelectionOrigin): void {
  // 1. Comprobar que id pertenece a la versión vigente de IDs seleccionables.
  // 2. Si id === selectedBenefitId, no escribir de nuevo el store.
  // 3. Publicar SOLO selectedBenefitId.
  // 4. Efecto visual del carrusel/mapa según origen, nunca repetir la intención.
}
```

`origin` puede vivir únicamente en el evento/hook de coordinación para prevenir ecos, **no** necesita persistirse en Zustand. Un `source` no justifica un event bus global. El control nativo del mapa se mantiene **declarativo**, no existe `selectMarker()` imperativo en Kotlin.

### 7.2. Política al cambiar el dataset

El **ID tiene prioridad sobre el índice**. En cada conjunto de datos exitoso y confirmado (no en requests viejos):

1. Si queda vacío → `selectedBenefitId = null`; invalidar scroll programático en vuelo.
2. Si el ID previo sigue presente → conservar **el mismo ID**, aunque haya cambiado de índice o contenido.
3. Si el ID previo desapareció → elegir el beneficio más próximo **por posición anterior**: índice de selección previo, acotado a `[0, nuevaLongitud - 1]`. Si no hay índice previo conocido, elegir el primero.
4. Si no había selección previa y hay elementos → elegir el primero.
5. Realinear el carrusel con `animated: false` después de disponer de medidas de layout; no dejar que callbacks de scroll de ese realineamiento modifiquen el ID elegido.
6. El mapa recibe la prop derivada. No emitir un tap falso ni llamar a un setter nativo.

**Ejemplos obligatorios para test:**

```text
Antes ["1", "2", "3"], seleccionado "2"
Después ["3", "2", "4"]         -> mantiene "2" (ahora índice 1)
Después ["1", "3", "4"]         -> "3" (índice previo 1, acotado)
Después ["4"]                 -> "4" (índice 0)
Después []                    -> null
Antes null, después ["5", "6"] -> "5"
```

Evitar que el cambio transitorio `loading` o un resultado rechazado de un request anterior sustituya una selección válida de un snapshot confirmado. Si la política de pantalla existente mantiene datos durante refresh/error, conservarlos coherentemente; si reemplaza el dataset por un estado sin contenido, no forzar una tarjeta invisible. La **política de datos del Paso 05 prevalece**.

### 7.3. Guardas de concurrencia

- Reutilizar el `requestId`/cancelación de cargas del Paso 05; si la carga A termina después de la B, **A no reconcilia selección ni mueve el carrusel**.
- Mantener un `datasetEpoch`/firma de **orden de IDs** solo como **guard de efectos**, nunca como segunda selección. Debe actualizarse al cambiar el conjunto/orden, no por renders idénticos.
- Invalida solicitudes de scroll que referencien una firma anterior cuando el dataset cambie, se desmonte la pantalla o cambie el ancho del carrusel.
- En cada callback asíncrono/completion, comprobar pertenencia a los IDs vigentes. No confiar en closures con índices desactualizados.
- No lanzar `setState` desde el render al observar que una selección ya no existe: reconciliar con el resultado de carga/evento o con un efecto acotado e idempotente.

---

## 8. Carrusel horizontal React Native: diseño y geometría

### 8.1. Componente propuesto

`BenefitsCarousel` recibe **datos y selección controlados**. Su responsabilidad es dibujar las tarjetas, manejar la interacción de scroll y comunicar **solo selecciones deliberadas y estabilizadas**; no consulta repositorios ni SDK nativos.

```ts
// API orientativa de presentación; ajustar nombres, NO duplicar modelos.
interface BenefitsCarouselProps {
  readonly benefits: readonly Benefit[];
  readonly selectedBenefitId: string | null;
  readonly onBenefitSettled: (benefitId: string) => void;
}
```

El padre puede exponer adicionalmente un `ref`/comando de alineación interna para sincronizar el scroll con la prop seleccionada. **No** trasladar esa acción a `CustomMap` ni crear un `NativeModule` para el carrusel.

### 8.2. UI y contenido mínimo

- Renderizar por tarjeta: **promoción**, **título**, **dirección** y una descripción resumida si cabe; respetar jerarquía visual y tokens existentes.
- Una tarjeta **activa** se distingue con borde/superficie/tipografía/indicador textual como **«Seleccionado»**, nunca solo color. El resto mantiene legibilidad y estructura consistente.
- Mostrar contador accesible **«Beneficio 2 de 5»** cuando N >= 2, derivado del ID; sin contador ficticio en empty.
- Opcional: indicio de tarjeta vecina (“peek”) y texto de ayuda «Desliza para ver más beneficios» si no recarga UI. No simular datos ni inventar categorías de beneficios.
- El campo `image` de los mocks del Paso 05 puede contener URLs `example.com` **no resolubles**. No hacer que la tarjeta dependa de descargar esas imágenes. Preferir composición sin imagen o placeholder **local legítimo**; si se muestra `Image`, manejar `onError` y accesibilidad sin spinners perpetuos, trackers ni dependencia adicional.
- Respetar header y bottom bar existentes. El mapa debe seguir ocupando una superficie útil; no taparlo totalmente con un overlay táctil.

### 8.3. `FlatList` y snapping consistente

Usar `FlatList` horizontal (no `ScrollView` de N tarjetas no virtualizadas). Como base de diseño:

```tsx
// ESTRUCTURA ILUSTRATIVA; validar API/medidas exactas contra RN 0.88.
<FlatList
  horizontal
  data={benefits}
  keyExtractor={item => String(item.id)}
  renderItem={renderBenefitCard}
  extraData={selectedBenefitId}
  showsHorizontalScrollIndicator={false}
  snapToInterval={stride}
  snapToAlignment="start"
  decelerationRate="fast"
  getItemLayout={(_data, index) => ({
    length: stride,
    offset: stride * index,
    index,
  })}
  onScrollToIndexFailed={handleScrollToIndexFailed}
  // onScrollBeginDrag / onScrollEndDrag / onMomentumScrollBegin /
  // onMomentumScrollEnd se coordinan según §9; NO publicar cada onScroll.
/>
```

**Regla geométrica obligatoria:** medir el **ancho disponible real** del contenedor del carrusel con `onLayout`. Definir `cardWidth`, `gap` y `horizontalInset/peek` a partir del mismo cálculo; `stride = cardWidth + gap`. La geometría usada por `snapToInterval`, `getItemLayout`, `scrollToIndex` y `offset → índice` debe ser la **misma**. Incluir separadores en el cálculo si existen. No asumir que `Dimensions.get('window').width` coincide siempre con el contenedor después de safe areas/rotación.

- Usar una altura compatible con texto aumentado: permitir varias líneas o una tarjeta lo bastante alta para contenido esencial, sin alterar la **anchura uniforme** que requiere `getItemLayout`.
- Probar ~**360 dp** de ancho y un tamaño mayor, rotación si el host la admite y fuentes ampliadas. Evitar que el bottom tab tape la tarjeta o que los overlays bloqueen taps del mapa.
- Si se usa peek/padding horizontal, verificar en Android los offsets **primero, intermedio y último**; el padding y el stride no deben producir una selección desplazada por uno.
- En N = 1, deshabilitar scrolling cuando corresponda (`scrollEnabled={false}`), y no emitir selección por eventos de scroll espurios.
- No usar simultáneamente `pagingEnabled` y `snapToInterval` con semánticas incompatibles.

### 8.4. Scroll programático sin saltos

Para mapa → carrusel, utilizar `FlatList.scrollToIndex({index, animated: true})` con el índice vigente calculado mediante `idToIndex`. Contemplar:

1. No hacer scroll hasta tener ancho/stride válido, datos listos y ref disponible; guardar **una intención pendiente por ID**, no por índice viejo.
2. `getItemLayout` con longitud/offset correctos para llegar a elementos fuera de la ventana de virtualización.
3. `onScrollToIndexFailed`: recuperar únicamente cuando haya datos/medidas válidas, con **un retry acotado** ligado al ID/dataset vigente. Se puede realizar `scrollToOffset` determinista y luego un solo retry. Sin bucles de timers.
4. Si un nuevo tap llega durante una animación, **la intención más reciente gana**; cancelar/invalidar el objetivo anterior.
5. Si el componente se desmonta, cambia la tab, cambia el dataset o cambia el ancho, cancelar retries pendientes; restaurar posteriormente **por ID**, sin guardar pixeles como estado durable.
6. En restauración/reorder/resize usar `animated: false` si evita transiciones visuales espurias.

---

## 9. Coordinación bidireccional y prevención de loops

### 9.1. Mapa → carrusel (obligatorio)

```text
Usuario pulsa marcador físico "3"
    -> Kotlin/Google Maps (ya implementado Paso 05)
    -> Fabric onMarkerPress({markerId: "3"})
    -> wrapper público onMarkerPress("3")
    -> BenefitsScreen comprueba ID vigente seleccionable
    -> selectBenefit("3", origin="map") [una escritura idempotente]
    -> <CustomMap selectedMarkerId="3" /> [declarativo]
    -> BenefitsCarousel alinea tarjeta "3" [scrollToIndex]
    -> callbacks del scroll programático NO devuelven nueva intención
```

- No llamar a `onMarkerPress` desde JS como si fuera comando; **es un evento de origen nativo**, no una acción para cambiar pin.
- Si el ID es inexistente, vacío o eliminado, ignorar sin excepción. El wrapper del Paso 05 ya filtra, y la pantalla valida otra vez contra el snapshot **vigente**.
- Si el marcador ya era seleccionado, evitar nueva escritura/announcement. Puede **realinearse el carrusel** cuando haya sido desplazado transitoriamente sin confirmar selección.
- No generar una nueva carga de Benefits ni recalcular `markers` completos por cada tap.

### 9.2. Carrusel → mapa (obligatorio)

```text
Usuario desliza FlatList
    -> se asienta en una tarjeta según snapping
    -> índice = clamp(round(offsetX / stride), 0, N-1)
    -> ID obtenido desde dataset vigente, nunca desde índice cacheado viejo
    -> onBenefitSettled(id) una vez por selección realmente distinta
    -> selectBenefit(id, origin="carousel")
    -> <CustomMap selectedMarkerId={id} />
    -> Fabric/Kotlin resalta el pin existente SIN emitir onMarkerPress
```

**El `onScroll` de cada frame no es una fuente de selección.** Usarlo solo si hace falta registrar `offsetX` en ref, sin llamar al store ni a Kotlin por pixel. Consolidar la selección cuando el gesto terminó en un punto de snap final.

### 9.3. Arbitraje de gestos y animaciones programáticas

Implementar una coordinación **pequeña y testeable** (refs/funciones puras; sin framework externo), con estas reglas obligatorias:

| Condición observable | Resultado |
| --- | --- |
| Cambio programático del mapa → `scrollToIndex` | Se registra destino pendiente **por ID y epoch**. Un callback de fin de scroll que corresponda a ese destino **solo confirma alineación**; NO llama a `onBenefitSettled`. |
| Tap de marcador A seguido rápidamente por B | La intención más reciente (**B**) invalida A. Un callback tardío de A no reselecciona A ni borra el destino B. |
| Usuario inicia drag mientras hay scroll programático | La intención física del usuario toma prioridad; se invalida la intención programática previa. El único compromiso posterior será la tarjeta donde **termine efectivamente** el gesto. |
| `onMomentumScrollEnd` tras gesto | Es el punto preferido para calcular índice final y publicar la intención del usuario. |
| Drag lento sin momentum | Debe existir una ruta comprobada de commit por `onScrollEndDrag`/settlement real, **solo cuando se ha determinado que no habrá momentum**; no dejar selección congelada. |
| `onScrollEndDrag` seguido de momentum | No confirmar un índice preliminar que se corregirá al final. Cancelar fallback si empieza momentum. |
| Eventos de fin duplicados del mismo gesto | Una sola transición lógica. Usar ID + epoch/gesto ya resuelto y setter idempotente. |
| Cambio de dataset o ancho durante scroll | Invalidar pendientes, reconciliar selección vigente y realinear por ID con medidas nuevas. |
| Unmount / salida de la pantalla | Limpiar tareas diferidas y referencias; ningún callback modifica un componente desmontado. |

**Importante sobre RN 0.88:** verificar en el emulador Android real la secuencia `onScrollBeginDrag`, `onScrollEndDrag`, `onMomentumScrollBegin` y `onMomentumScrollEnd` en flings, arrastres lentos y programmatic `scrollToIndex`. Las APIs no prometen que toda interacción tenga momentum. Si se usa un fallback diferido para drag sin momentum, debe estar **acotado, cancelable, protegido por epoch e inspeccionar offset final estabilizado**; no depender de un `setTimeout` arbitrario como garantía de sincronización. Documentar duración/condición si se justifica y cubrir con Jest fake timers. Una alternativa basada en viewability es admisible **solo** si no publica cambios intermedios ni callbacks programáticos. **Prohibido** solucionar loops deshabilitando eventos nativos o agregando una segunda selección.

### 9.4. Pseudocódigo de las guardas (ilustrativo, no implementación literal)

```ts
// Estado durable: selectedBenefitId SOLAMENTE.
// Refs efímeros: pendingTarget, gestureEpoch, datasetEpoch,
// lastOffsetX, layoutReady, dragState, pendingNoMomentumSettle.

function onMapMarkerPress(id: string) {
  if (!currentIdToIndex.has(id)) return;
  invalidateOlderProgrammaticScroll();
  selectBenefit(id, 'map');           // idempotente
  alignCarouselToId(id, true);        // intención ligada a epoch actual
}

function onUserScrollSettled(offsetX: number, gestureEpoch: number) {
  if (!isCurrentGesture(gestureEpoch) || !isCurrentDataset()) return;
  const index = clamp(Math.round(offsetX / stride), 0, visibleIds.length - 1);
  const id = visibleIds[index];
  if (!id) return;
  clearProgrammaticGuardForUserGesture();
  selectBenefit(id, 'carousel');      // solo si distinto
}

function onProgrammaticScrollEnd(offsetX: number) {
  // Si corresponde al destino vigente, reconocer y liberar guard.
  // Si es obsoleto, ignorar. NUNCA generar selección del usuario.
}
```

**No copiar este pseudocódigo en producción sin resolver el reconocimiento de fin de scroll, drag lento y cancelaciones conforme a los eventos reales de RN 0.88.** Los tests de §14 y maniobras M04–M10 de §15 hacen **obligatoria** la comprobación concreta, no solo un mock del camino feliz.

### 9.5. Semántica de actualización y eventos duplicados

- El único efecto dirigido a `CustomMap` por cambiar selección es **actualizar `selectedMarkerId`**. No reenviar `markers` si el dataset no cambió.
- `onMarkerPress` **solo** debe contabilizar el tap físico comunicado por la implementación nativa previa, jamás un cambio programático o de dataset.
- El setter comparará el valor actual y el siguiente; seleccionar el mismo ID N veces no provoca N escrituras.
- No encadenar `useEffect(selectedBenefitId) → onBenefitSettled` ni `onViewableItemsChanged → selectBenefit` sin distinguir origen; esto causa bucles.
- Si un evento stale llega tras una reconciliación, la verificación del ID/epoch vigente impide restaurar la selección eliminada.
- `onScrollToIndexFailed` no debe producir una selección distinta; es recuperación de posición, no intención de negocio.

---

## 10. Estado al cambiar tabs y reanudación

### 10.1. Persistencia **en memoria** durante navegación

La tab **Beneficios** y la tab **Mis productos** ya existen en el mismo navegador. No introducir un segundo `NavigationContainer`, ni `unmountOnBlur`/reset intencional, ni cargar Benefits de nuevo al recuperar el foco si los datos vigentes continúan disponibles. El estado de selección se guarda en el ámbito de sesión de la capability (**Zustand sin persist** o store de Benefits existente); esto cubre remounts autorizados del navigator.

No usar `AsyncStorage`/secure storage para una preferencia visual temporal. No duplicar el estado de la tab activa en Zustand: React Navigation sigue siendo dueño del navigation state.

### 10.2. Al volver a Beneficios

1. Mostrar el **mismo ID** si sigue elegible/ubicable; de no ser así, aplicar §7.2.
2. Al tener `FlatList`/ancho listos, realinear **al mismo ID** con `animated: false` si la posición física se perdió por remount/detach/rotación.
3. No hacer reset a índice 0 ni emitir una nueva selección del usuario por `onLayout`, `onFocus` o `onViewableItemsChanged`.
4. No crear de nuevo `CustomMap` por cada cambio de tab si está montado; conservar su lifecycle aprobado y evitar reinicios innecesarios del SDK.
5. Si la pantalla sí se desmonta legítimamente, limpiar refs/listeners/retries y restaurar selección al montar desde el estado de sesión.
6. Mis productos y su scroll, cards y Card Secure View permanecen funcionales sin cambios.

### 10.3. Cambio de orientación/tamaño

Al cambiar `onLayout`, **recalcular** `cardWidth` y `stride`, cancelar el scroll pendiente con geometría antigua y alinear al ID actual sin animación; nunca derivar un **nuevo ID** de un offset de la orientación anterior. Si `width <= 0` o aún no existe layout, posponer el scroll sin lanzar excepción.

---

## 11. Accesibilidad real y diseño adaptativo

**Criterio vigente del propietario:** BCP exige accesibilidad (a11y), sin imponer una implementación específica de TalkBack ni su prueba manual como requisito explícito. Excluir esa prueba no elimina propiedades, controles ni obligaciones de accesibilidad estándar de React Native.

| Requisito | Mantener / obligatoriedad |
| --- | --- |
| `accessibilityLabel` descriptivos | Sí, obligatorio |
| `accessibilityRole` correcto | Sí, obligatorio |
| `accessibilityState` del beneficio seleccionado | Sí, obligatorio |
| Contraste adecuado de colores | Sí, obligatorio |
| Tamaños de texto adaptativos | Sí, obligatorio |
| Áreas táctiles suficientemente grandes | Sí, obligatorio |
| Selección accesible sin depender exclusivamente del swipe | Sí, obligatorio |
| Anuncios específicos para TalkBack | Opcionales; no se implementa lógica específica en este paso |
| Pruebas manuales con TalkBack | Recomendadas, no obligatorias para cierre; M15 y criterio original 42 no aplican al checklist exigido |

Se conservan también las propiedades estándar ya presentes, como `accessible` y `accessibilityLiveRegion`. Una live region estándar no es una integración específica de TalkBack. Esta tabla fija requisitos; no constituye por sí sola evidencia de que se hayan probado todos.

### 11.1. Semántica de tarjetas y selección

- La tarjeta/acción seleccionable debe exponer un nombre audible como **«Beneficio 2 de 3, Restaurante San Isidro, 15% de descuento, seleccionado»**; el texto exacto se deriva de los mocks visibles y del índice actual, no de una cadena hardcodeada.
- Usar `accessible`, `accessibilityLabel`, `accessibilityRole` pertinente (por ejemplo, `button` si tocarla selecciona) y `accessibilityState={{selected: isSelected}}` **solo** donde la semántica sea válida; comprobar el árbol de RNTL; no se exige prueba manual TalkBack.
- En N > 1, ofrecer **acceso no gestual**: tocar cada tarjeta visible, y/o controles «Anterior» / «Siguiente» accesibles si se requieren para navegar sin swipe. Esas acciones usan la **misma** selección y alineación, no otra lógica.
- Conservar/refinar la **alternativa textual vertical** aprobada en el Paso 05. Puede integrarse como lista de acceso a los beneficios si duplicar visualmente todo el catálogo satura pantalla, pero **conservar su funcionalidad accesible y su cobertura RNTL; TalkBack manual está excluido**.
- Proporcionar selección visual no basada únicamente en el color (texto «Seleccionado», borde/indicador, índice visible).
- Mantener orden de foco razonable: título de Beneficios → contexto del mapa → carrusel/lista textual → navegación; no atrapar foco dentro de `CustomMap`.

### 11.2. Anuncios y cambios programáticos

**Alcance vigente:** las referencias a TalkBack de esta subsección quedan como orientación técnica opcional; no exigen implementar integración adicional ni ejecutar una prueba manual TalkBack para cerrar este paso.

- Anunciar la nueva selección **solo** si corresponde a una acción deliberada que no ha quedado comunicada claramente por el foco de TalkBack; no anunciar cada frame de scroll.
- Evitar dobles anuncios cuando TalkBack ya lee `accessibilityState.selected`. Si se usa `AccessibilityInfo.announceForAccessibility`, probar que una misma selección se anuncia a lo sumo una vez y que la navegación automática por tabs no provoca spam.
- No desplazar automáticamente el foco accesible a una tarjeta lejana por cada `onMarkerPress` si ello desorienta; documentar el comportamiento observado en Android.
- Loading/empty/error del Paso 05 siguen teniendo labels/roles y mensajes seguros; no renderizar un carrusel fantasma para esconder un error de datos.

### 11.3. Adaptación y gestos

- Probar visualmente Android pequeño (~360 dp), ancho normal y rotación; respetar safe areas, barra inferior, fuentes 1.3x/1.5x cuando el sistema las permita.
- Mantener targets táctiles recomendados de **al menos ~44–48 dp** para controles interactivos sin impedir el pan del `FlatList`.
- Evitar que un overlay del carrusel consuma taps destinados a marcadores; mapa y carrusel deben recibir sus gestos de manera diferenciada.
- Usar alto suficiente para texto esencial y comportamiento predecible con promoción/título largo. No ocultar descripciones críticas solo por fijar un card height demasiado corto.
- Evitar flashing, animaciones obligatorias y transiciones bruscas al restaurar selección. Respetar ajustes de reducción de movimiento cuando sea factible con APIs existentes.
- No exigir permisos de ubicación: solo se muestran coordenadas de promociones ficticias.

---

## 12. Performance, renders y calidad de estado

1. `FlatList` virtualizada con `keyExtractor` estable; tamaño de ventana inicial razonable según datos reales. No usar `.map()` para montar N tarjetas siempre visibles.
2. `React.memo` en `BenefitCarouselCard` **si la medición/prueba muestra beneficio**; props estables, `renderItem` con `useCallback`, `idToIndex`/markers derivados con `useMemo` cuando los inputs lo justifiquen.
3. El cambio de `selectedBenefitId` actualiza las tarjetas que pasan de activo→inactivo y viceversa; las demás **no deberían requerir renders costosos**. `extraData={selectedBenefitId}` es correcto para `FlatList` aunque recalcule su reconciliación; no afirmar «cero renders» sin medir.
4. El cambio de selección **no** reconstruye el resultado de `loadEligibleBenefits`, los mocks, ni la lista `markers` si siguen referencialmente iguales; React puede rerenderizar el wrapper, pero Kotlin no debe recibir nuevas ubicaciones por cada swipe.
5. El mapa nativo mantiene su instancia; **no** forzar `key={selectedBenefitId}` sobre `<CustomMap />`, pantalla ni contenedor.
6. Callbacks/timers programáticos se limpian al desmontar; no se crea una suscripción duplicada por cada tab focus. **El evento Fabric existente** no se replica mediante un `DeviceEventEmitter` global.
7. No usar un intervalo polling para comparar mapa y carrusel; flujo **event-driven y declarativo**.
8. No introducir Reanimated, Gesture Handler, FlatList alternativo o librería de carrusel por defecto si RN 0.88 aporta `FlatList`, `snapToInterval` y eventos suficientes.
9. Para alto número de beneficios, comprobar scroll a un índice alejado y estabilidad con virtualización; no desactivar todo batching para ocultar `scrollToIndex` fallido.
10. Si se instrumentan renders durante desarrollo, usar contadores/tests o profiler de dev sin dejar logs masivos ni telemetría en producción. Reportar evidencia, no porcentajes inventados.

---

## 13. Matriz formal de estados y escenarios límite

| Escenario | Selección esperada | Reacción visible / riesgo evitado |
| --- | --- | --- |
| Initial loading | `null` o selección previa coherente según política de refresh del Paso 05 | Sin scroll sobre lista vacía; mantener loading existente. |
| 0 beneficios elegibles | `null` | Empty de Benefits; no cards ni pins ajenos. |
| 1 beneficio | ID único | Tarjeta visible, pin seleccionado; scrolling apagado, sin loop. |
| N beneficios | ID vigente, o primero | Tarjeta y pin seleccionados en correspondencia 1:1. |
| Tap de pin distinto | ID del pin | Un scroll hacia la tarjeta correcta. |
| Tap de mismo pin | ID sin cambio | Sin escritura ni callbacks duplicados; corrección de alineación si hace falta. |
| Swipe/fling | ID final asentado | Un compromiso lógico de selección final; mapa refleja ID. |
| Drag lento sin momentum | ID de tarjeta asentada | No queda sin sincronizar. |
| A→B taps rápidos | B | Animación antigua no revierte a A. |
| Inicia swipe durante scroll programático | Intención física reciente | No queda fijado un ID de animación vieja. |
| ID nativo `''`, inválido o fuera de dataset | Sin cambio | No crash, no `scrollToIndex(-1)`. |
| Eliminar beneficio seleccionado | Vecino por índice anterior acotado | No tarjeta ni pin huérfanos; realineación sin emisión de tap. |
| Reordenar beneficios | Mismo ID, índice nuevo | Scroll a posición correcta sin cambiar selección. |
| Cambiar título/promoción mismo ID | Mismo ID | Render de contenido actualizado sin scroll injustificado. |
| Cambio de marcas/tarjetas | Reconciliar sobre nueva lista elegible | Beneficio que deja de ser elegible desaparece de ambos. |
| Algunos puntos inválidos | Solo los ubicables seleccionables | Aviso `omittedLocations`, sin pin ficticio. |
| Todos puntos inválidos | Política de error del Paso 05 | No mostrar lista “válida” sin mapa. |
| Refresh A termina después de B | Solo B se aplica | Sin selección/scroll obsoletos. |
| Rotación/tamaño cambia | Mismo ID si vigente | Recalcular stride; no seleccionar por viejo offset. |
| Ir a Mis productos y volver | Mismo ID | Misma tarjeta alineada, sin nueva carga injustificada. |
| Map SDK temporalmente no listo | Selección lógica segura | No modificar nativo; conservar estados/timeout/fallback aprobados. |
| iOS sin mapa | Fallback aprobado | No montar `CustomMap` nativo no disponible ni fingir paridad. |

---

## 14. Testing automatizado: Jest, RNTL y regresiones

### 14.1. Diseño de pruebas y dobles

- **Mockear los límites físicos**, no el algoritmo bajo prueba: `CustomMap` puede ser un host/mock con `markers`, `selectedMarkerId` y una forma de invocar `onMarkerPress`. `FlatList` puede probarse con RNTL y dobles **focalizados** de `scrollToIndex` cuando se necesite observar intención imperativa.
- No mockear `selectBenefit`, `reconcileSelection` o `loadEligibleBenefits` en las pruebas que buscan demostrar sus reglas; inyectar fixtures y puertos reales/fakes según capa.
- En Jest, emitir eventos scroll con `nativeEvent.contentOffset.x` realista y geometría conocida; verificar `onMomentumScrollBegin/End` y ruta drag sin momentum.
- Restablecer Zustand entre tests, limpiar timers fake y mocks; evitar contaminación por estado de selección previo. Usar `act`/`waitFor` apropiadamente sin sleeps reales.
- No tomar snapshots de Android/Google Maps como si fueran prueba de geolocalización. Para Kotlin, **mantener** los JUnit existentes y ejecutar regresión: no inventar nuevas suites nativas para lógica que reside en RN.

### 14.2. Casos puros de identidad/reconciliación (Jest)

| ID | Prueba obligatoria |
| --- | --- |
| J01 | `Benefit.id` numérico ↔ `String(id)` de marker/card; no cambiar modelo de dominio. |
| J02 | Los IDs visibles del carrusel son exactamente los elegibles con marker válido; AMEX no elegible y ubicaciones omitidas no se reintroducen. |
| J03 | Dataset vacío → `null`; primera lista N → selecciona primer ID; único elemento → selecciona único ID. |
| J04 | Selección existente y mismo dataset → conserva ID sin nueva escritura. |
| J05 | Reorder conserva ID y cambia el índice derivado, no el ID. |
| J06 | Eliminar selección usa vecino por índice anterior acotado; luego `[]` limpia. |
| J07 | Cambio de texto/promoción con mismo ID conserva ID y no fuerza nuevo índice. |
| J08 | Evento con ID desconocido, vacío, duplicado obsoleto o removido no cambia selección. |
| J09 | Requests A/B resueltos fuera de orden: A no restaura un ID obsoleto ni induce scroll. |
| J10 | Dos llamadas de seleccionar el mismo ID → una transición observable como máximo. |

### 14.3. Mapa → carrusel y scroll programático (Jest + RNTL)

| ID | Prueba obligatoria |
| --- | --- |
| J11 | Tap nativo simulado al primer marker selecciona primera card y prop `selectedMarkerId` coincide. |
| J12 | Tap a marker intermedio/último llama `scrollToIndex` con índice correcto (incluye ID fuera del render inicial). |
| J13 | Scroll programático reporta `onMomentumScrollEnd`/fin: **no** dispara `onBenefitSettled` ni cambio extra. |
| J14 | Tap repetido al mismo pin: no duplica store/actions; si está desalineado, puede corregir scroll. |
| J15 | Taps rápidos A→B y callback tardío de A: B permanece seleccionado/alineado. |
| J16 | `onScrollToIndexFailed` con layout válido: estrategia de recuperación acotada y último ID vigente; no loop infinito. |
| J17 | `onScrollToIndexFailed` / `onLayout` cuando N=0 o width=0: no crash, no índices negativos. |
| J18 | Se desmonta pantalla antes de completar un scroll/retry: no side effects ni callbacks tardíos. |

### 14.4. Carrusel → mapa y conflicto de eventos (Jest + RNTL)

| ID | Prueba obligatoria |
| --- | --- |
| J19 | Swipe una tarjeta adelante con `offsetX≈stride`: selecciona ID correcto, actualiza prop de `CustomMap`. |
| J20 | Swipe atrás y al último con offset máximo: índices acotados `[0, N-1]`, sin off-by-one. |
| J21 | Fling con drag-end preliminar y momentum final: confirma **solo** tarjeta final, no ambas. |
| J22 | Drag sin momentum termina y confirma tarjeta asentada (ruta fallback real/estable). |
| J23 | Dos eventos de fin del mismo gesto no producen dos escrituras/anuncios. |
| J24 | Comienzo de drag cancela scroll programático pendiente; selección final del usuario gana. |
| J25 | Scroll de usuario seguido de evento viejo tras dataset nuevo: ID obsoleto ignorado. |
| J26 | Cada scroll físico cambia selección sin invocar de nuevo `onMarkerPress` nativo. |
| J27 | N=1: swipe deshabilitado, no existen selecciones falsas ni `scrollToIndex` erróneo. |
| J28 | Gesto a mitad de cambio de ancho/rotación: se recalcula stride y se conserva ID. |

### 14.5. Integración de pantalla, UX y regresiones (Jest + RNTL)

| ID | Prueba obligatoria |
| --- | --- |
| J29 | `BenefitsScreen` muestra mapa y carrusel en `success`, con datos/elegibilidad del Paso 05. |
| J30 | `loading`, `empty`, `error` conservan sus mensajes y reintento; no se monta carrusel imposible. |
| J31 | Un único ID se refleja simultáneamente en `selectedMarkerId`, card destacada, contador y alternativa textual. |
| J32 | La tarjeta seleccionada expone label, rol y `accessibilityState.selected`; no depende solo de color. |
| J33 | Acción accesible alternativa (tap/Anterior/Siguiente según UI final) usa la misma selección. |
| J34 | Cambio de tab y retorno conserva selección; remount permitido restaura posición por ID sin reinicializar la fuente. |
| J35 | Beneficios actualizados mientras tab no visible: al regresar se reconcilia por snapshot actual; sin estado huérfano. |
| J36 | Cards y productos siguen visibles/enmascarados; no se alteran modelos ni secure tokens. |
| J37 | Mock/fallback iOS no intenta montar mapa nativo ausente. |
| J38 | Tests existentes de bridge Fabric, `IoSecureView`, token y eventos siguen verdes sin mocks sustituidos globalmente. |
| J39 | Verificación de renders selectivos o instrumentación muestra que el cambio de selección no recompone markers/dataset. |
| J40 | Ningún fixture/test/snapshot muestra PAN, CVV, titular completo, token completo o key de Google. |

**Expectativa mínima:** cubrir **J01–J40** con tests separados o agrupados (no necesariamente 40 archivos/tests). Nombrar claramente cada comportamiento en la salida/reporte. Si una API de RNTL no reproduce el asentamiento físico de Android, acompañar el test de coordinación con una verificación manual explícita Mxx; no declarar ambas cosas equivalentes.

### 14.6. Tests nativos existentes y contadores base

Al cierre de Paso 05 se documentaron **58 Jest (8 suites) y 13 JUnit**. Mantener todas las pruebas previas; el número final debe ser **>= el previo** salvo refactor de test **justificado y con cobertura equivalente**. Ejecutar `npm run test:native:android` y `npm run test:all` porque el contrato de scripts ya fue aprobado en Paso 04. Si Kotlin **no se modificó**, la prueba nativa es **regresión**, no evidencia de nueva implementación Kotlin.

No imponer globalmente un umbral de coverage inventado en este paso: generar y reportar el porcentaje real disponible y recordar que el **objetivo de >=70 % de la capa RN** está previsto en el Paso 07 / baseline del reto. No anunciar PASS del umbral sin reporte ejecutado.

---

## 15. Validación manual Android: matriz de demostración

**Condición:** ejecutar en emulador/dispositivo Android con Google Play services y Maps SDK/teselas ya funcionales, utilizando únicamente key local ignorada. Capturas o video sin credenciales ni datos sensibles. El contador de `onMarkerPress` no debe mezclarse con el de selecciones de carrusel.

| Caso | Acción manual | Aceptación observable |
| --- | --- | --- |
| **M01** | Abrir Beneficios con datos normales | Mapa y carrusel visibles; IDs/pins elegibles coinciden; primer beneficio activo o selección restaurada. |
| **M02** | Pulsar pin 1, después pin intermedio y último | Cada tap real alinea card correcta; pin seleccionado corresponde a card. |
| **M03** | Pulsar pin seleccionado nuevamente | No parpadea, no se duplica evento ni se vuelve a cargar dataset. |
| **M04** | Pulsar dos pins rápidamente (A→B) | Termina en B; no rebota a A tras animación. |
| **M05** | Deslizar lentamente una card | Snap correcto y pin correcto **sin necesitar fling**. |
| **M06** | Fling a varias cards, adelante/atrás | Pin final sigue card realmente asentada; sin saltos de selección intermedia. |
| **M07** | Iniciar swipe mientras termina scroll por pin | Último gesto físico gana y no deja carrusel/mapa discordantes. |
| **M08** | Navegar a Mis productos y volver repetidamente | Selección y posición idénticas; productos intactos, sin recargas injustificadas. |
| **M09** | Rotar dispositivo o variar ancho (si host permite) | Selección por ID persiste; tarjetas/snap/mapa funcionales, no offset viejo. |
| **M10** | Cambiar dataset en harness temporal dev: 0/1/N | Empty, una tarjeta, N tarjetas y pins sin crashes ni loops; retirar harness al cerrar. |
| **M11** | Dataset dev: eliminar seleccionado, reorder y cambiar textos | Reconciliación según §7.2; no ID huérfano ni cambio accidental. |
| **M12** | Dataset dev: pin inexistente, ID vacío y ubicación omitida | Ignorados/controlados; no scroll a -1, no marcador falso. |
| **M13** | Abrir Mis productos; ver datos sensibles; Ocultar/volver | Card Secure View funciona, protege ventana y no rompe mapa/carrusel. |
| **M14** | Fuente ampliada (~1.3x / 1.5x) y ancho ~360 dp | Textos/tarjetas/controles legibles; bottom tab y map taps accesibles. |
| **M15** | **EXCLUIDO / NO APLICA por decisión del propietario:** prueba manual TalkBack | No se ejecuta ni bloquea el cierre. No se declara PASS; se conservan controles y semántica accesible base. |
| **M16** | Home/background y retorno | Mantiene selección; no crash ni desincronización; Secure View conserva su protección independiente. |
| **M17** | Scroll hacia ID lejano en lista de prueba (p. ej. >=15) | `scrollToIndex` y virtualización llegan a la card correcta, sin huecos persistentes ni bloqueos. |
| **M18** | iOS, si ambiente disponible | Ambas tabs abren; Beneficios conserva fallback sin montaje de `CustomMap` nativo iOS. |

**Harness temporal:** solo si es necesario para datos 0/1/N, reorder y IDs obsoletos, crear un harness **Android/dev, acotado y no versionado en producto** o tests de inyección sin alterar los mocks de entrega. Registrar pruebas realizadas y **retirarlo** antes del DoD final. Su eliminación no debe reabrir el cierre del Paso 05.

**Criterio de honestidad:** M15 (TalkBack) está **EXCLUIDO / NO APLICA** por la decisión del propietario. No se debe solicitar esta prueba ni instalar TalkBack como requisito de cierre; tampoco se debe afirmar que se probó. RNTL acredita únicamente la semántica y los controles accesibles automatizados.

---

## 16. Comandos reproducibles y verificaciones de seguridad

### 16.1. Inspección inicial

```bash
pwd
git status --short
git branch --show-current
node --version
npm --version
npm ls react-native zustand @react-navigation/native @react-navigation/bottom-tabs
```

Leer scripts de `package.json` y confirmar nombres reales de tareas, **sin instalar de nuevo** lo existente. `npm ls` es observación, no autorización de upgrade.

### 16.2. Calidad y pruebas React Native

```bash
npm run lint
npm run typecheck
npm run format:check
npm test -- --watch=false
npm test -- --watch=false --coverage
```

Si `npm test` tiene flags incompatibles con los scripts reales, ajustar el **comando de invocación**, no reemplazar indiscriminadamente la configuración Jest. `--coverage` puede generar salidas en `coverage/` ignoradas. Registrar cifra real si se generó.

### 16.3. Suite nativa + integrada aprobada en el Paso 04

```bash
npm run test:native:android
npm run test:all
```

Estos scripts forman parte de la línea base **aprobada**. No eliminarlos ni redefinir `test:all` para que ejecute solamente Jest. Documentar si uno falta realmente en el checkout y corregir el contrato con el cambio mínimo, no fingir su presencia.

### 16.4. Android runtime y build focalizado

```bash
adb devices
npm run android

# Si se necesita comprobar build sin reinstalación:
cd android
./gradlew :app:assembleDebug
cd ..
```

No es necesario regenerar Codegen por modificar **solo TSX de presentación**. Si el sistema real exige un build/link por algún cambio inevitable, documentar **por qué**. No editar specs o Kotlin preventivamente.

### 16.5. iOS: regresión, no implementación

```bash
# Solo si existe entorno macOS/Xcode funcional en el checkout
npm run ios
```

No añadir Swift, MapKit, podspec nuevo ni stub que finja el mapa. Si el comando no puede ejecutarse por toolchain, marcar **NO EJECUTADO/BLOQUEADO POR ENTORNO**; si el cambio de Paso 06 rompe importación/render iOS que antes funcionaba, es una **regresión propia del paso**.

### 16.6. Higiene final, diff y credenciales

```bash
git diff --check
git status --short
git diff --stat
# Revisar el diff relevante sin imprimir secrets.properties ni otros archivos privados.
```

Comprobar focalizadamente:

- No se añadieron `react-native-maps`, otro paquete nativo, nueva dependencia de carrusel, Firebase ni bridges legacy.
- `io-native-components` sigue siendo **único**, y `IoSecureView`/`CustomMap` tienen sus exports y specs existentes intactos.
- No se filtraron datos sensibles a JS, tests, fixtures, snapshots, logs o documentación. **No imprimir** variables secretas ni inspeccionar el contenido de `android/secrets.properties`.
- `CustomMap` sigue recibiendo solo `markers`, `selectedMarkerId` y `onMarkerPress` según el contrato público; no se añadieron métodos nativos imperativos.
- No hubo commits, push, cambios de remoto ni publicación.

---

## 17. Orden de implementación recomendado para el implementador

1. **Inspección focalizada:** confirmar pantalla/estado preliminar del Paso 05, mapper, carga, componentes de navegación, adapter público `CustomMap` y mocks de Jest. Registrar `git status` y scripts; **no reauditar 47 DoD**.
2. **Diseñar la proyección visible:** obtener `carouselBenefits` desde el mismo snapshot de elegibles/markers válidos; pruebas J01–J02; no duplicar filtrado de marcas.
3. **Seleccionar una sola fuente de verdad:** migrar selección local `selectedMarkerId` a `selectedBenefitId` de Benefits; escoger/store actual o mínimo Zustand no persistido; pruebas de idempotencia/reconciliación J03–J10.
4. **Construir UI de tarjetas:** `BenefitCarouselCard`, layout responsive, `FlatList`, snapping, `getItemLayout`, accesibilidad base y tratamiento 0/1/N, sin conectarlo aún al mapa.
5. **Conectar mapa → carrusel:** `onMarkerPress` existente, membership, scrollToIndex, retry acotado; pruebas J11–J18.
6. **Conectar carrusel → mapa:** confirmar índice asentado, `onBenefitSettled`, mapa declarativo, guardas programmatic/gesture y drag lento; pruebas J19–J28. **No** publicar selección en cada `onScroll`.
7. **Completar lifecycle:** cambio de tabs, remount, refresh, reorder, cambios de ancho/dataset, cancelación de pendientes; pruebas J29–J35.
8. **Accesibilidad/performance:** alternativa textual, labels/roles, tamaño de fuente, render selectivo, `CustomMap` estable. No microoptimizar sin evidencia.
9. **Verificar integración y regresión:** Jest/RNTL, JUnit, `test:all`, `lint`, `typecheck`, `format:check`, build + manual Android M01–M17; iOS M18 si disponible. No reejecutar una auditoría histórica de pasos anteriores.
10. **Documentar y cerrar:** actualizar README solo con arquitectura/uso/API de selección/trade-offs, adjuntar tabla de comandos y matriz Mxx en el reporte final; retirar harness dev; actualizar los DoD de §18 **solo con resultados reales**; detenerse sin empezar Paso 07.

---

## 18. Definition of Done — Paso 06 (57/57 criterios aplicables verificados)

**Cierre — 05/11/2026:** 57/57 criterios aplicables verificados, sin pendientes del alcance acordado. El criterio original 42 (prueba manual TalkBack) está EXCLUIDO, sin casilla ni denominador; no se afirma ejecutado. Evidencia final y límites en §24.14. Se conserva toda accesibilidad estándar de React Native.

### 18.1. Integración, alcance y contratos (01–12)

- [x] **01.** Se trabajó en `io-products-benefits` existente, sin reinstalar ni reinicializar RN.
- [x] **02.** Se conserva RN 0.88.0, TS estricto, New Architecture, npm y único lockfile.
- [x] **03.** Los contratos de dominio y puertos del Paso 02 permanecen intactos.
- [x] **04.** `Benefits` reutiliza el pipeline `loadEligibleBenefits` del Paso 05, sin volver a implementar `applicableBrands`.
- [x] **05.** `CardRepository`/`AvailableCardBrandsReader` aprobados siguen siendo la fuente legítima de marcas.
- [x] **06.** El carrusel no incluye beneficios excluidos por marca ni localizaciones omitidas.
- [x] **07.** Cada tarjeta seleccionable corresponde a un marker válido con `id=String(benefit.id)`.
- [x] **08.** Existe una sola librería `io-native-components`; no se añadió otra librería nativa.
- [x] **09.** `CustomMap` se reutiliza con `markers`, `selectedMarkerId`, `onMarkerPress` sin cambio injustificado.
- [x] **10.** Fabric/Codegen/Kotlin/Google Maps SDK no se modificaron, **o** cualquier excepción tiene bug reproducible, diff mínimo y prueba.
- [x] **11.** `IoSecureView`, Card Secure View, eventos, token 60 s y sesión 45 s se conservaron funcionales.
- [x] **12.** No se incorporaron `react-native-maps`, carrusel de terceros, Swift/MapKit, Firebase ni nuevas dependencias innecesarias.

### 18.2. Estado, datos y sincronización (13–28)

- [x] **13.** `selectedBenefitId: string | null` es la **única fuente** de selección persistente.
- [x] **14.** `selectedMarkerId` e índice del carrusel se derivan del ID; no existen estados paralelos de selección.
- [x] **15.** La selección previa solo existe si pertenece al dataset seleccionable vigente.
- [x] **16.** Primera carga y N>0 seleccionan primer ID; N=1 selecciona único; N=0 limpia.
- [x] **17.** Mapa → carrusel funciona para primer, intermedio y último ID, con scroll programático correcto.
- [x] **18.** `onMarkerPress` con ID vacío, eliminado o inexistente no cambia selección ni scrollea fuera de rango.
- [x] **19.** Carrusel → mapa funciona al asentarse una nueva tarjeta y actualiza `selectedMarkerId`.
- [x] **20.** Fling y drag lento sin momentum concluyen sincronizados y sin selección preliminar errónea.
- [x] **21.** Cambios programáticos de scroll no disparan un nuevo evento/intención de usuario.
- [x] **22.** Dos eventos de fin de scroll para el mismo gesto no causan dos transiciones/anuncios.
- [x] **23.** Dos taps rápidos A→B dejan B seleccionado; callbacks tardíos de A no revocan B.
- [x] **24.** El swipe real iniciado durante un desplazamiento programático tiene prioridad y termina consistente.
- [x] **25.** Reorder conserva ID y ajusta índice/posición sin emisión de tap falso.
- [x] **26.** Al eliminar el seleccionado se aplica vecino por índice anterior; empty limpia selection.
- [x] **27.** Cambio de dataset/carga obsoleta o ID desactualizado no provoca selección huérfana ni condición de carrera.
- [x] **28.** `onScrollToIndexFailed` tiene salida/retry acotado; no bloqueo, crash o loop.

### 18.3. Carrusel, UX, adaptabilidad y accesibilidad (29–42)

- [x] **29.** Carrusel horizontal usa `FlatList` React Native con virtualización y keys estables.
- [x] **30.** El snapping coincide con geometría real (`stride`, `getItemLayout` y offset), sin off-by-one.
- [x] **31.** La card activa se reconoce visualmente **sin depender solo del color**.
- [x] **32.** Título, promoción y dirección se ven sin inventar datos; imagen no bloquea la UI si falla.
- [x] **33.** El estado 0 muestra empty/error apropiado; no se monta carrusel fantasma.
- [x] **34.** El estado 1 no permite scrolling engañoso ni dispara callbacks espurios.
- [x] **35.** En N beneficios, primera/última tarjeta son alcanzables y alineadas correctamente.
- [x] **36.** Cambio de tabs conserva `selectedBenefitId`, posición lógica por ID y datos ya cargados.
- [x] **37.** Remount/rotación/cambio de ancho realinean el ID vigente con nuevas medidas sin seleccionar otro.
- [x] **38.** Se preserva la accesibilidad de la alternativa textual del Paso 05 y/o se mejora sin perder funcionalidad.
- [x] **39.** Labels, roles, estados seleccionados y contador «n de N» están cubiertos por RNTL.
- [x] **40.** Es posible seleccionar un beneficio sin depender **exclusivamente** de gesto horizontal.
- [x] **41.** Layout probado con ancho Android ~360 dp y fuente ampliada, sin tap targets solapados.
- **42. EXCLUIDO / NO APLICA:** prueba manual TalkBack retirada por instrucción expresa del propietario el 05/11/2026. No es una casilla pendiente ni una prueba aprobada; se excluye del denominador aplicable.

### 18.4. Calidad, regresión, evidencia y cierre (43–58)

- [x] **43.** J01–J10 (selección/reconciliación) pasan con Jest.
- [x] **44.** J11–J18 (mapa → carrusel/scrollToIndex) pasan con Jest/RNTL.
- [x] **45.** J19–J28 (carrusel → mapa/gestos/loops) pasan con Jest/RNTL.
- [x] **46.** J29–J40 (pantalla/accesibilidad/regresión/performance) pasan con Jest/RNTL.
- [x] **47.** Suites Jest previas conservadas; `npm test -- --watch=false` PASS.
- [x] **48.** JUnit existentes conservados; `npm run test:native:android` PASS.
- [x] **49.** `npm run test:all` ejecuta JS + nativo y termina PASS.
- [x] **50.** `npm run lint` PASS sin nuevos warnings relevantes.
- [x] **51.** `npm run typecheck` PASS sin `any`/suppressions introducidos para ocultar errores.
- [x] **52.** `npm run format:check` y `git diff --check` PASS.
- [x] **53.** Android build/instalación y runtime con mapa y carrusel reales verificados (no solo Jest).
- [x] **54.** M01–M14, M16 y M17 documentados con resultados **reales**; M15 consignado como EXCLUIDO y M18 según ejecución efectiva.
- [x] **55.** Dashboard/Mis productos/Card Secure View y mapa de Google siguen funcionando tras la integración.
- [x] **56.** Sin datos sensibles, tokens o credenciales reales en JS/logs/tests/artefactos; `secrets.properties` ignorado.
- [x] **57.** README/doc de Paso 06 actualizado con flujo, contratos, trade-offs y comandos; harness dev retirado.
- [x] **58.** Reporte §21 completo: archivos reales, resultados, evidencias Mxx, DoD marcado responsablemente y cierre explícito **sin ejecutar Paso 07**.

**Regla para aprobar:** no basta con que los tests pasen si el mapa y carrusel no se sincronizan en Android. Los criterios funcionales **17–24, 29–37, 53–55** requieren combinación de evidencia automatizada y manual. El **DoD 42 está EXCLUIDO** por decisión del propietario y no bloquea el cierre; solo se podrá declarar cumplimiento de los **57 criterios aplicables** cuando los demás tengan evidencia real. Un bloqueo de entorno se reporta, no se maquilla.

---

## 19. Trazabilidad con el reto y pasos futuros

| Requisito del PDF / baseline | Prueba/evidencia Paso 06 | No hacer |
| --- | --- | --- |
| Tap marker muestra beneficio destacado | J11–J18 + M02–M04 | No redibujar mapa JS ni duplicar evento nativo. |
| Swipe carrusel resalta marker | J19–J28 + M05–M07 | No mandar eventos de scroll frame a Kotlin. |
| `selectedMarkerId`, `onMarkerPress` | J11, J19, J26 + source wrapper | No reemplazar contratos Fabric/Codegen. |
| Solo beneficios aplicables | J01–J02 + M01/M10/M11 | No re-filtrar Cards en cada tarjeta. |
| Estado conservado entre tabs | J34–J35 + M08–M09 | No introducir resets en navigation. |
| UI adaptable, a11y | J31–J33 + M14; M15 excluido | RNTL prueba semántica; no se afirma validación con lector de pantalla. |
| Performance | J16/J39 + M17 + medición | No recrear MapView/markers por swipe. |
| Unit tests / cobertura | J01–J40 + scripts + reporte real | No atribuir tests viejos al paso actual. |
| Una librería nativa propia | Revisión diff + `npm run test:all` | No crear packages ni puentes nuevos. |
| Seguridad de productos | Regresión M13 + tests de Cards | No pasar PAN/CVV/titular a JS. |

- **Paso 07:** cobertura y testing transversal de la solución global; usar los nuevos tests J01–J40 como parte de su baseline.
- **Paso 08 — OMITIDO:** sin auditoría adicional de hardening por decisión del propietario; se conservan los controles ya implementados.
- **Paso 09:** extras opcionales; no adelantar Firebase/publicaciones.
- **Paso 10:** README y video de entrega completos.
- **Paso 11:** implementación Swift/MapKit; reutilizar la semántica React Native de `selectedBenefitId` sin cambiar este contrato de selección.
- **Paso 12:** sustentación técnica, demo y defensa de trade-offs.

---

## 20. Trade-offs que el candidato debe poder defender

1. **`FlatList` + `snapToInterval` vs paquete de carrusel:** el reto evalúa React Native avanzado y evita dependencias innecesarias. `FlatList` permite virtualización, `scrollToIndex`, `getItemLayout` y control del snapping; a cambio, exige coordinar eventos y medición del ancho con disciplina.
2. **ID como fuente de verdad vs índice/offset:** el ID sobrevive reorder, cambios de elegibilidad, tabs y resize; el índice y offset son vistas derivadas y efímeras. Esto evita desincronización semántica.
3. **Mapa controlado vs estado duplicado nativo:** el mapa recibe `selectedMarkerId` y solo emite taps. Si el scroll se publica también como tap nativo, aparece un loop; la frontera Fabric ya resuelve su mitad del contrato.
4. **Sincronizar únicamente beneficios ubicables:** un carrusel de puntos sin marker contradiría el requisito bidireccional. Los no ubicables continúan sujetos a la política de validación/aviso del Paso 05.
5. **Commit al asentarse vs commit por pixel:** evita renders, oscilaciones y nativos repetidos, pero requiere cubrir el caso drag sin momentum con pruebas físicas reales de RN 0.88.
6. **Zustand mínimo sin persistencia en disco:** conservar estado entre tabs/remounts no equivale a necesitar almacenamiento local. El store de sesión es suficiente y no expone datos sensibles.
7. **Accesibilidad textual como complemento de pins del SDK:** los marcadores de Google Maps pueden no ofrecer interacción equivalente con TalkBack; una alternativa RN accesible protege esa experiencia sin duplicar datos de negocio.
8. **Sin nueva API nativa:** el PDF ya provee `selectedMarkerId` y `onMarkerPress`; el carrusel y los conflictos de gestos son un problema de presentación RN, no un motivo para mutar Kotlin.
9. **Imagen opcional:** los `image` de los mocks del Paso 05 son placeholders `example.com`, no imágenes confirmadas. Priorizar tarjetas textuales nítidas y previsibles evita falsas promesas de red o dependencias de assets.
10. **Evidencia manual más tests puros:** RNTL prueba decisiones y mocks de bridge; solo Android permite verificar realmente la sucesión de eventos de scroll, las animaciones, el mapa y el foco TalkBack.

---

## 21. Formato obligatorio de reporte de ejecución del implementador

Al terminar la **ejecución futura** del Paso 06, responder **en español** con estas secciones, sin confundirlas con el estado actual de este documento:

1. **Estado real:** `COMPLETADO`, `INCOMPLETO` o `BLOQUEADO`; resumen funcional mapa ↔ carrusel y alcance no implementado.
2. **Archivos cambiados:** listado real de rutas `new/modified/deleted`, especialmente migración del estado preliminar y componentes de carrusel.
3. **Arquitectura y contratos:** `selectedBenefitId` único, relación con `selectedMarkerId`, proyección por markers válidos y fronteras Benefits/Cards/Fabric.
4. **Carrusel:** layout, snapping, geometría, scroll imperativo, eventos y comportamiento 0/1/N.
5. **Sincronización/concurrencia:** arbitraje map/user/programmatic, manejo A→B, drag sin momentum, `onScrollToIndexFailed`, datasetEpoch y stale callbacks; explicar con secuencias reproducibles.
6. **Accesibilidad y UX:** labels/roles/selección/alternativa textual, tamaños probados y exclusión explícita de la prueba manual TalkBack por decisión del propietario (sin reportarla como ejecutada).
7. **Performance:** qué se memoizó, qué no, por qué; prueba/medición de markers estables, FlatList y limpieza de timers/listeners.
8. **Tests añadidos:** correspondencia J01–J40, cifras **reales** por suite y total; registrar si los 58 Jest / 13 JUnit base se conservan.
9. **Comandos ejecutados:** tabla con `comando | PASS/FAIL/NO EJECUTADO | evidencia | causa/observación`. Incluir `test:all`, coverage real si se corrió, build Android y iOS si disponible.
10. **Matriz manual:** M01–M18 con dispositivo/Android API/Play services, resultado y evidencia; distinguir simulador, mock Jest y gestos reales.
11. **Regresiones focalizadas:** Google Maps real, Dashboard, Mis productos, Card Secure View, key ignorada, iOS fallback, sin reauditar Pasos 01–05.
12. **DoD §18:** checklist actualizado con criterio/estado/evidencia; total `X/57` aplicables verdadero, criterio original 42 EXCLUIDO y bloqueos sin casilla marcada.
13. **Trade-offs y límites:** resultados no verificables, discrepancias con doc Paso 05, riesgos restantes.
14. **Cierre:** cambios a README, limpieza de harness, Git status final, **siguiente etapa `STEP-07-TESTING-COVERAGE.md` solo como referencia, SIN EJECUTARLA**.

**No inventar:** cobertura, resultados de TalkBack, capturas de pantalla, IDs dev, número de renders, ausencia total de leaks ni tiempos de ejecución. No pedir al propietario que envíe secretos. Si un escenario exige prueba manual fuera del agente, identificarlo para que el propietario lo realice y **no** marcar PASS antes de su confirmación.

---

## 22. Fuentes técnicas autorizadas

### 22.1. Documentos del proyecto

- `Reto técnico - Chapter Master Frontend.pdf` — requisito oficial (págs. 2–4: mapa/carrusel y contratos; pág. 6: tests; págs. 7–8: evaluación/restricciones).
- `RETO_BCP_TECHNICAL_BASELINE.md` — §§5–7, 12–17, 19–21, 27–31 (arquitectura, Benefits, sync, carrusel, estado y prueba).
- `STEP-02-ARCHITECTURE.md` — `Benefit`, `MapMarker`, `CustomMapProps`, selección única.
- `STEP-03-DASHBOARD-CARDS.md` — React Navigation, Zustand, tabs, estado de productos.
- `STEP-04-NATIVE-SECURE-VIEW.md` — librería, `IoSecureView`, scripts y seguridad; **solo para proteger regresiones**.
- **`STEP-05-BENEFITS-CUSTOM-MAP.md` completo, especialmente §§3–5, 6.4, 9–12 y 21.9** — el baseline de implementación realmente cerrada.

### 22.2. Documentación oficial para consultar en la ejecución (RN 0.88 efectivo)

- React Native — [`FlatList`](https://reactnative.dev/docs/flatlist): `horizontal`, `extraData`, `getItemLayout`, `scrollToIndex`, `onScrollToIndexFailed`.
- React Native — [`ScrollView`](https://reactnative.dev/docs/scrollview): `snapToInterval`, `snapToAlignment`, `decelerationRate`, `onScrollBeginDrag`, `onScrollEndDrag`, `onMomentumScrollBegin/End`.
- React Native — [Optimizing FlatList Configuration](https://reactnative.dev/docs/optimizing-flatlist-configuration): claves estables, memoización, layout de longitud fija.
- React Native — [Accessibility](https://reactnative.dev/docs/accessibility): labels, roles, `accessibilityState.selected`.
- React Native — [AccessibilityInfo](https://reactnative.dev/docs/accessibilityinfo): TalkBack y anuncios programáticos.
- React Native Testing Library — [Documentación](https://callstack.github.io/react-native-testing-library/): render, events, `act`, `waitFor`; comprobar versión instalada y sus APIs efectivas.
- React Native — [Fabric Native Components](https://reactnative.dev/docs/fabric-native-components-introduction): **consulta de regresión, no instrucción para alterar el native map**.

**Precaución:** estas páginas pueden mostrar la documentación más reciente de React Native. El implementador debe comprobar compatibilidad con **0.88.0 instalada**, usar tipos/eventos realmente disponibles y registrar cualquier diferencia; no migrar versión para seguir un ejemplo nuevo.

---

## 23. Principio de cierre

> **Una sola selección por ID, dos representaciones sincronizadas y ningún puente nativo adicional.** El mapa declara y notifica; el carrusel presenta y propone selección; la capability Benefits arbitra las intenciones y resuelve datasets cambiantes. Ninguna pulsación, swipe, rotación o vuelta de tabs debe dejar un marcador y una tarjeta activos distintos.

El Paso 06 quedará aprobado cuando **Android real** demuestre sincronización bidireccional estable, las pruebas Jest/RNTL y regresiones JUnit estén verdes, el estado único sobreviva a cambios de tabs/dataset, los DoD estén respaldados y los límites se comuniquen honestamente. **No anticipar ni ejecutar el Paso 07.**


## 24. Reporte real de ejecución — 05/11/2026

### 24.1. Estado y alcance

**BLOQUEADO EN VALIDACIÓN NATIVA/MANUAL.** Implementación terminada en código; **33/57 DoD** verificados. Las nuevas pruebas automatizadas pasan, pero no se declara aprobado el Paso 06: ADB/Gradle/CoreSimulator no están accesibles desde el sandbox. No se atribuye al carrusel la evidencia física del Paso 05. No se ejecutó el Paso 07, no hubo commits/push, no se creó reporte separado ni harness de producto.

**Integración:** misma capability Benefits, repositorio, reader, filtrado, mapper y contrato público de mapa. No se cambiaron dominios, puertos, infraestructura, Kotlin, Fabric, Codegen, manifest, Maps SDK, package.json, lockfile ni Pods. Los tests previos se conservan: la única ampliación en su archivo fue resetear el nuevo store antes de cada prueba para mantener aislamiento.

### 24.2. Archivos reales

| Estado | Archivo |
| --- | --- |
| modified | `src/app/navigation/DashboardNavigator.tsx` — entrega foco real de navegación a Benefits |
| modified | `src/capabilities/benefits/presentation/screens/BenefitsScreen.tsx` — migra selección/carga a store, integra carrusel y mantiene alternativa textual |
| modified | `src/capabilities/benefits/presentation/__tests__/benefitsPresentation.test.tsx` — aislamiento del store nuevo; aserciones anteriores conservadas |
| new | `src/capabilities/benefits/presentation/store/useBenefitsStore.ts` |
| new | `src/capabilities/benefits/presentation/utils/reconcileBenefitSelection.ts` |
| new | `src/capabilities/benefits/presentation/utils/CarouselCoordinator.ts` |
| new | `src/capabilities/benefits/presentation/components/BenefitCarouselCard.tsx` |
| new | `src/capabilities/benefits/presentation/components/BenefitsCarousel.tsx` |
| new | `src/capabilities/benefits/presentation/__tests__/selectionAndScroll.test.ts` |
| new | `src/capabilities/benefits/presentation/__tests__/carouselIntegration.test.tsx` |
| modified | `README.md` — arquitectura, ejecución, uso, mediciones y límites de Paso 06 |
| updated, preexisting untracked | `docs/steps/STEP-06-MAP-CAROUSEL-SYNC.md` — documento del propietario, checklist y este registro |

### 24.3. Arquitectura y decisiones

- `useBenefitsStore` es el único dueño de `selectedBenefitId`, del snapshot seguro retornado por `loadEligibleBenefits` y del estado de carga de presentación. La pantalla ya no tiene un segundo selectedMarkerId. Se conserva en memoria, sin persistencia. El snapshot y su loader se reutilizan en remount; no se guarda otro catálogo de marcas ni de beneficios. Request versions y cancelación impiden aplicar A después de B o una respuesta cancelada.
- `reconcileBenefitSelection` conserva ID en reorder/contenido nuevo; si desaparece, usa índice anterior acotado; vacío devuelve null; primera carga elige primero. El índice del carrusel y la selección nativa se derivan del ID.
- `BenefitsCarousel` es controlado. Memoiza IDs/idToIndex; usa FlatList, claves string, getItemLayout y extraData. Mide el ancho real con onLayout: N>1 usa width−24 por card, gap 12 y stride width−12; N=1 usa width completo sin swipe. El padding final permite offset exacto del último índice. No usa pagingEnabled ni viewability para escribir selección.
- El mapa conserva el mismo key por intento de carga; no se cambia por selección. Markers siguen memoizados por snapshot. El wrapper nativo aprobado conserva sus adaptaciones de transporte; no se afirma que no renderice nunca. Una prueba espía del mapper verifica tres conversiones iniciales y ninguna conversión adicional durante taps de selección.
- `BenefitCarouselCard` memoizada recibe props estables. Prueba de identidad del subtree confirma que no se recrea con props iguales; no se inventa una cifra de renders de Android. Ventana FlatList 5, batch 4, primer batch 3; scroll a índice 19 probado mediante puerto/mocks y getItemLayout, **no por gesto nativo**.
- La presentación vertical puede desplazarse para evitar solapar tarjetas/texto ampliado con bottom tabs. Mapa de 200 dp y alto de carrusel 260×max(1,fontScale); ancho siempre medido, no tomado del ancho global. Esta decisión requiere revisión visual en 360 dp, orientación y fuente ampliada antes de aprobar los DoD visuales.
- Las cards muestran promoción, título, dirección y descripción acotada, sin descargar imágenes example.com. «Seleccionado», borde, labels y accessibilityState.selected son complementarios. Se conserva la lista textual vertical y se añaden Anterior/Siguiente. La reducción de movimiento del sistema inhibe animación programática. No se fuerza foco TalkBack ni se añaden anuncios imperativos; la pantalla conserva su live region. TalkBack manual está excluido del alcance por decisión del propietario, sin validación afirmada.
- No se tocó el módulo seguro ni se introdujeron comandos/eventos nativos nuevos. La selección solo actualiza la prop existente selectedMarkerId.

### 24.4. Coordinación, conflictos y recuperación

`CarouselCoordinator` no contiene otra selección durable: mantiene IDs/geometría vigentes, epoch, offset/revisión, gesto, momentum y destino programático por ID. Las tareas son cancelables y acotadas.

1. Tap A → selección A → scroll programático; tap B invalida A. Un fin con offset A no confirma ni limpia el destino B; jamás publica una intención de usuario.
2. Begin-drag invalida destino/retry anterior y toma prioridad. onScroll registra solo offset/revisión. End-drag programa observación, momentum-begin la cancela y momentum-end confirma índice final acotado una sola vez. Eventos con timestamp anterior al inicio del gesto se descartan.
3. Sin momentum se exige offset cercano al snap (≤2 dp) y estable en ventanas de 64 ms. Se comprueba al menos dos veces, máximo ocho (512 ms). Si no se observa asentamiento, no se inventa selección ni queda polling permanente. Debe comprobarse la secuencia física RN 0.88 en M05; no se presenta el temporizador como garantía universal.
4. Fallo de índice: offset determinista y un retry después de 32 ms, sujeto al destino/epoch y membresía actual. Nuevos taps, dataset, ancho, blur y unmount cancelan el intento viejo.
5. Cambios de ancho/dataset/foco realinean por ID sin animación. La disponibilidad de content width confirma la alineación inicial sin publicar selección. Cambiar solo textos con mismos IDs no realinea innecesariamente.
6. El commit físico ya asentado no dispara otra animación por el efecto de props. Repetir tap en el pin seleccionado puede corregir alineación, pero el setter no duplica escrituras. Elegir desde card/lista/Anterior/Siguiente usa la misma acción.

### 24.5. Pruebas: trazabilidad J01–J40

**90 Jest, 10 suites: los 58 previos + 32 pruebas nuevas agrupadas en dos suites.** No se sustituyeron suites de Cards, bridge, tokens ni mapa. No hay snapshots nuevos.

| Casos | Evidencia |
| --- | --- |
| J01–J10 | `selectionAndScroll.test.ts`: elegibles/ubicables, identidad numérica/string, primera selección/empty, reorder/vecino, actualización por ID, membership/idempotencia, respuesta A/B fuera de orden y cancelación |
| J11–J18 | Suite pura + `carouselIntegration.test.tsx`: ID inicial, espera de layout, scroll al índice 19, A→B, no eco, IDs inválidos, una recuperación y cleanup antes de retry |
| J19–J28 | Coordinador real y eventos RNTL: offset final/clamp, drag sin momentum con fake timers, cancelación de fallback, fin duplicado, prioridad física, epoch/timestamp, datos/ancho nuevos y caso único |
| J29–J35 | Pantalla integrada: estados, misma selección en mapa/card/contador/lista, controles accesibles, remount con caché del loader, foco, reorder y actualización de snapshot de sesión |
| J36–J38 | Suites existentes conservadas: Dashboard, productos, masking, gateways, token/eventos, wrapper Fabric e iOS fallback; regresión automatizada, no smoke físico |
| J39 | Mapper espía no se repite con selección y subtree memoizado mantiene identidad; geometría/virtualización se prueban sin simular medición de frames Android |
| J40 | Fixture/snapshot público validado, sin patrón de API key ni secuencia PAN; inspección focalizada del diff y secrets ignorado; el agente no leyó secrets.properties |

Jest cubre reglas/controladores reales con puertos de scroll mockeados y host Fabric mockeado. No se mockea la reconciliación ni el store que se está comprobando. La secuencia física de momentum y la cámara SDK requieren la matriz manual aplicable. La prueba de foco TalkBack está excluida por el propietario.

**Cobertura ejecutada** (`coverage/lcov-report/index.html`, ignorado): 95,78 % sentencias, 91,19 % ramas, 97,50 % funciones, 95,69 % líneas de archivos instrumentados. No es cobertura de todos los archivos no importados ni auditoría global del Paso 07.

### 24.6. Comandos realmente ejecutados

Node 22.23.4 mediante PATH local; JDK local 17. No se instalaron paquetes.

| Comando | Resultado | Evidencia / límite |
| --- | --- | --- |
| `npm run lint` | PASS | Sin errores ni warnings finales |
| `npm run typecheck` | PASS | TS estricto; sin any ni suppressions añadidos |
| `npm run format:check` | PASS | Todos los TS/TSX pertinentes formateados |
| `npm test -- --watch=false --runInBand --coverage` | PASS | 90 pruebas / 10 suites; cobertura arriba |
| `npm run test:native:android` | FAIL por entorno | Wrapper no puede escribir lock de `~/.gradle/...gradle-9.4.1-bin.zip.lck`: Operation not permitted |
| `npm run test:all` | FAIL por entorno | Fase Jest: 90 PASS. Fase JUnit/Gradle bloqueada por el mismo lock; **no** PASS del pipeline |
| `python3 /private/tmp/io-step05-junit.py` | PASS suplementario | Runner temporal ya existente, compilador Kotlin 2.2.0 y JUnit 4.13.2 cacheados: 13 pruebas existentes sin fallos. No sustituye el script Gradle obligatorio |
| `cd android && ./gradlew :app:assembleDebug` | FAIL por entorno | Mismo lock de wrapper; APK del Paso 06 no acreditado |
| `npm run android -- --no-packager` | FAIL por entorno | ADB no puede abrir socket 5037; Gradle tampoco puede acceder al lock |
| `npm run ios -- --no-packager` | FAIL por entorno | CoreSimulatorService inaccesible / Connection refused; no se acreditó build/smoke iOS |
| `git check-ignore android/secrets.properties` | PASS | Archivo privado excluido; contenido nunca impreso |
| `git diff --check` | PASS | Sin whitespace inválido |
| Diff de package/lockfile/Android/librería nativa | PASS estático | Sin modificaciones en esos árboles |

No se regeneró Codegen: no cambió ninguna spec ni código nativo. No se pidió nuevo pod install: no cambió ninguna dependencia iOS. Los fallos de permisos de esta sesión no se clasifican como errores del código ni se marcan aprobados.

### 24.7. Matriz manual real del Paso 06

Dispositivo/API/Play services **no observables en esta sesión**, porque ADB no puede conectarse. Pixel 5 API 34 es la referencia del Paso 05, no una medición nueva.

| Caso | Estado en Paso 06 | Evidencia / acción pendiente |
| --- | --- | --- |
| M01 | BLOQUEADO | Abrir mapa+carousel reales; RNTL comprueba conjunto y selección inicial |
| M02 | BLOQUEADO | Tap físico a primer/intermedio/último; intención imperativa cubierta en mocks |
| M03 | BLOQUEADO | Repetir pin y verificar ausencia de parpadeo/recarga física |
| M04 | BLOQUEADO | A→B real sin rebote; controlador y eventos simulados pasan |
| M05 | BLOQUEADO | Drag lento real sin momentum; fallback solo acreditado con fake timers |
| M06 | BLOQUEADO | Fling real adelante/atrás y secuencia de momentum |
| M07 | BLOQUEADO | Swipe físico durante animación por tap |
| M08 | BLOQUEADO | Tabs reales, selección/posición; regresión RNTL pasa |
| M09 | BLOQUEADO | Rotación real; anchos JS 360/700 probados sin sustituir pantalla física |
| M10 | NO EJECUTADO MANUAL | 0/1/N y dataset inyectado cubiertos en tests; no harness de producto |
| M11 | NO EJECUTADO MANUAL | Reorder/eliminar/cambiar texto cubiertos en tests reales de selección/store |
| M12 | NO EJECUTADO MANUAL | IDs inválidos y omisión de coordenadas cubiertos automáticamente |
| M13 | BLOQUEADO | Smoke nuevo de Card Secure View; código nativo intacto y regresiones automáticas verdes |
| M14 | BLOQUEADO | Revisar ~360 dp, font scale 1.3/1.5 y targets reales |
| M15 | **EXCLUIDO / NO APLICA** | Prueba TalkBack retirada por decisión del propietario; no bloquea cierre ni equivale a PASS |
| M16 | BLOQUEADO | Home/retorno con nueva selección/carrusel |
| M17 | NO EJECUTADO MANUAL | Lista de 20 e índice 19 probados con mocks; faltan virtualización/gestos reales |
| M18 | BLOQUEADO | iOS no accesible; fallback y no montaje del mapa probados en RNTL |

Ninguna captura del Paso 05 se reutiliza como PASS de esta matriz nueva. No se obtuvo captura ni video del carrusel Android desde el agente.

### 24.8. DoD: estado de cada criterio y evidencias

Las 57 casillas aplicables de §18 constituyen el checklist vigente; el criterio original 42 se conserva sin casilla como EXCLUIDO. Agrupación exhaustiva (sin omitir criterios):

| Criterios | Estado | Evidencia |
| --- | --- | --- |
| 01–10 | PASS | Diff de integración y contratos/pipeline/nativo intactos; J01–J02 |
| 11 | PENDIENTE | Suites previas verdes y fuente intacta; falta smoke nuevo M13 |
| 12–16 | PASS | Sin nuevas dependencias; store único y J03–J10 |
| 17–24 | PENDIENTE | Automatización correspondiente PASS; el documento exige combinar con gestos reales M02–M07 |
| 25–28 | PASS AUTOMATIZADO | Reconciliación/reorder/vecino, request version/epoch y retry acotado; J05–J10/J15–J18/J25/J28 |
| 29–37 | PENDIENTE | Implementados y con tests; faltan layout/scroll/tabs/remount/rotación reales según regla estricta |
| 38–40 | PASS AUTOMATIZADO | Alternativa textual conservada, semántica y selección no gestual RNTL; no equivale a TalkBack |
| 41 | PENDIENTE EN REPORTE INICIAL | Medidas/fuente físicas; actualizar según evidencia manual posterior |
| 42 | EXCLUIDO / NO APLICA | Prueba TalkBack retirada por decisión del propietario; no cuenta como PASS ni pendiente |
| 43–47 | PASS | J01–J40 trazados; 90 pruebas / 10 suites, previas conservadas |
| 48–49 | BLOQUEADO | Scripts Gradle y pipeline no aprobaron en sandbox; JUnit directo solo suplementario |
| 50–52 | PASS | Lint/typecheck/formato/diff check finales |
| 53–55 | BLOQUEADO | Build/instalación/runtime/smoke inaccesibles; matriz real documentada sin falsos PASS |
| 56–58 | PASS | Diff/ignore sin secretos, README/documento actualizados y reporte completo; sin harness ni Paso 07 |

**Total real: 33/57 verificados; 24 pendientes.** No se ha solicitado al propietario que envíe credenciales. El criterio original 42 está EXCLUIDO por decisión del propietario: no cuenta entre los 24 pendientes ni se presenta como prueba ejecutada.

### 24.9. Cómo desbloquear, limitaciones y cierre de alcance

Desde Terminal con permisos y emulador disponible: Node 22.23.4, `npm run test:all`; desde android, `./gradlew :app:assembleDebug`; volver a raíz y `npm run android` o recargar Metro si la app/servidor ya están abiertos para probar JS. Recorrer M01–M17; ejecutar `npm run ios` para M18. Registrar los resultados físicos en este mismo documento y corregir defectos reproducibles del Paso 06 si aparecen. Para datasets de borde se pueden usar inyecciones de desarrollo temporales, retirándolas después; no quedaron fixtures de entrega alterados.

La estrategia de asentamiento no es una garantía basada solo en un delay; exige offset estable/snap y cancelación, pero su secuencia Android física sigue sin probar. La navegación y los anuncios con TalkBack no se validaron; esa comprobación está excluida por el propietario y no se afirma soporte probado con lector de pantalla. La altura elegida y scroll vertical requieren revisión en dispositivos pequeños/fuentes grandes. No se afirman cero renders, ausencia absoluta de leaks, FPS ni tiempos de gesto medidos. Si Android demuestra una secuencia distinta, se ajustará el coordinador RN sin alterar la API nativa por conveniencia.

Se termina esta ejecución con código, automatización y documentación revisables; **no se declara aprobado el Paso 06**, no se creó ni ejecutó `STEP-07-TESTING-COVERAGE.md`, y no se hizo commit/push/publicación. Los pasos 01–05 siguen cerrados y no se modificaron sus documentos.


### 24.10. Confirmaciones posteriores del propietario y validación de borde

**Estado vigente: 52/57 DoD aplicables verificados.** Los 33/57 y bloqueos de §24.1–24.9 son el reporte inicial del agente; las comprobaciones realizadas desde la Terminal y emuladores del propietario los superan según este seguimiento.

- `npm run test:all` terminó con `BUILD SUCCESSFUL in 5s`, 29 tasks up-to-date. Por la cadena del script, Jest y el task JUnit terminaron correctamente; no es el runner suplementario del agente.
- Después de la instrucción `npm run android`, el propietario compartió captura del mapa/carrusel funcionando con Café Miraflores seleccionado, contador 1 de 3 y tres pines. No se recibió un log detallado de ese build/instalación; se conserva como evidencia la ejecución confirmada y la captura runtime, sin inventar duración ni contador de tasks.
- Confirmó mapa→carrusel para primer/intermedio/último, drag lento y fling adelante/atrás, A→B sin rebote, y gesto físico durante scroll programático. La evidencia es confirmación manual del propietario más los tests del coordinador, no una traza nativa instrumentada de cada evento.
- Confirmó selección/posición conservadas entre tabs, Home/retorno y rotación; texto ampliado y controles Anterior/Siguiente funcionales.
- Confirmó abrir/Ocultar Card Secure View y volver al mapa/carrusel funcional. También `npm run ios` con ambas tabs y fallback Android correcto. Estas son regresiones del Paso 06, sin reabrir las auditorías 01–05.
- TalkBack específico no se implementa ni se exige prueba manual, según instrucción del propietario. Se mantiene toda accesibilidad estándar; criterio 42 y M15 EXCLUIDOS, sin declarar una prueba aprobada.

Para terminar M10/M11/M12/M17 se preparó `src/app/development/BenefitsValidation.tsx`, accesible solo en Android/development mediante «Validar carrusel (temporal)». Inyecta resultados seguros usando el pipeline real y la misma pantalla: 0/1/3, eliminación, reorder, cambio de texto, IDs inválidos, ubicación omitida por el caso de uso existente y 20 elementos. «Ir al 20» publica el ID mediante la misma acción controlada; no simula un tap Fabric. No modifica los mocks de entrega ni añade reglas de marcas. **Sus resultados físicos están pendientes** y el harness se retirará al finalizar.

La captura y confirmaciones actuales acreditan M01/M02/M04–M09/M13/M14/M16/M18. M03 (repetir el pin seleccionado), M10–M12 y M17 deben registrarse explícitamente durante la validación final; M15 no aplica. Permanecen sin marcar los criterios **18, 33, 34, 54 y 57** hasta probar los bordes y retirar los controles temporales. El reporte inicial de ausencia de harness dejó de ser vigente durante esta preparación.


### 24.11. Casos de borde confirmados y retirada del harness

El propietario confirmó: «acabo de probar todas las opciones y todas funcionan bien ninguna falló». Acredita M10/M11/M12/M17 del harness: empty/único/tres, eliminación del seleccionado con vecino, reorder por ID, cambios de texto, selección inválida/vacía ignorada, ubicación omitida por el pipeline y lista de 20 con llegada al ID 1020. Los botones de ID inválido publicaban la intención mediante el selector de presentación real; no simulaban taps Fabric. El wrapper/evento nativo sigue cubierto por la regresión automatizada y los taps físicos normales ya confirmados. No se alteraron mocks de entrega.

Se eliminó `src/app/development/BenefitsValidation.tsx`, el import/estado/control temporal del navegador y sus estilos. BenefitsRoute vuelve a montar únicamente BenefitsScreen con el loader y foco existentes. Búsqueda final sin referencias al harness. Se conserva toda la accesibilidad estándar, sin lógica específica de TalkBack.

Código final sin harness: lint sin warnings, TypeScript, formato y diff check PASS; **90 Jest / 10 suites**, cobertura 95,78 % sentencias y 95,69 % líneas instrumentadas. **13 JUnit** volvieron a pasar por el runner directo cacheado; no se atribuye esa ejecución al script Gradle del sandbox. test:all ya había sido aprobado desde la Terminal del propietario según §24.10. Esta retirada solo cambió TS/TSX: basta recargar Metro para ver la interfaz normal.

Estado: **56/57 DoD aplicables**. Permanecen confirmadas M01/M02/M04–M14/M16–M18; M15 EXCLUIDO, sin contarlo como aprobado. **M03 no recibió una confirmación manual individual**: la idempotencia ya pasa en Jest, pero falta repetir físicamente el pin seleccionado y confirmar que no hay rebote ni recarga. Por ello el criterio 54 permanece sin marcar hasta esa comprobación final; no se declara aún cerrado el Paso 06. No se creó reporte separado ni se avanzó al Paso 07; sin commit/push.


### 24.12. Defecto reproducido: zoom sin controles visibles

En la comprobación final de doble toque, el propietario observó zoom en el mapa y no encontró cómo alejarlo con botones. Google documenta que el doble toque acerca la cámara y que los controles +/− están desactivados por defecto: [Controls and Gestures](https://developers.google.com/maps/documentation/android-sdk/controls).

Se habilitó exclusivamente `google.uiSettings.isZoomControlsEnabled = true` en el callback existente de mapa listo de `packages/io-native-components/android/src/main/java/com/ioproductsbenefits/nativecomponents/map/CustomMapView.kt`. Es una excepción mínima y justificada a la regla de no tocar Kotlin: defecto observado por el propietario, control oficial del SDK y diff de una línea. No añade método/evento Fabric, lógica de selección, permisos, dependencias ni comportamiento específico de TalkBack. Se mantienen los gestos estándar; +/− permiten acercar/alejar sin gesto multitáctil.

La compilación `./gradlew :io-native-components:compileDebugKotlin :app:assembleDebug` fue intentada y se bloqueó en el lock del wrapper de ~/.gradle (`Operation not permitted`). **No se declara aprobada la corrección en runtime.** No se añadieron tests que solo reflejen la asignación de la bandera del SDK. La prueba necesaria es recompilar/instalar desde la Terminal del propietario (`npm run android`), ver +/− abajo a la derecha, acercar con doble toque, alejar con − y confirmar selección/carrusel sin rebotes. R en Metro **no** aplica este cambio Kotlin.

Estado vigente: **54/57 verificados**, criterios **10, 53 y 54** pendientes de build/smoke posterior al cambio y conclusión de M03. Los 56/57 anteriores son el estado antes de detectar este defecto. Harness temporal ya retirado y regresiones automatizadas previamente aprobadas; no se avanzó al Paso 07 ni se hizo commit/push.


### 24.13. Controles compilados y ajuste de medición del MapView

El propietario compartió una nueva captura sin botones de zoom. Se comprobó que node_modules/io-native-components es un symlink al paquete local; `javap` sobre CustomMapView.class confirmó `setZoomControlsEnabled(true)` en el bytecode compilado. La clase y APK locales son posteriores a la modificación inicial. Esto acredita la compilación de la opción; no permite inspeccionar directamente el APK instalado ni la jerarquía de vistas en ejecución desde el sandbox.

Se encontró que onLayout posicionaba el MapView sin asegurar su medición exacta después de cambios asíncronos de sus hijos. Se añadió `layoutMapContent`: measure con specs EXACTLY del contenedor y luego layout del hijo. requestLayout agrupa solicitudes del SDK en un Runnable cancelable; se solicita también al adjuntar y al habilitar controles. Las tareas se eliminan al desmontar/destruir, y comprueban tamaño positivo, attachment y estado no destruido. Es un ajuste dirigido a que la UI interna del SDK quepa en el área de Fabric; su relación causal con los botones ausentes sigue pendiente de confirmación visual. No hay polling continuo, nuevas props/eventos, dependencias, datos sensibles ni lógica TalkBack.

**Validación efectivamente ejecutada:** compilación directa de CustomMapView.kt con Kotlin 2.2.0, SDK Android y dependencias ya cacheadas: PASS (`Offline Kotlin compilation exit: 0`); aparecen deprecaciones de APIs existentes. El primer intento de este runner temporal falló por classpath incompleto de Lifecycle; se completó el classpath con las dependencias cacheadas, sin cambiar dependencias del proyecto, y el segundo pasó. No equivale a ensamblar el APK con Gradle ni a verificar controles visibles. JUnit suplementario: 13 pruebas existentes PASS. `git diff --check` PASS.

Se conserva **54/57** hasta recompilar/instalar mediante `npm run android` y confirmar que +/− sean visibles/funcionales y que la selección permanezca sincronizada. R en Metro no aplica estos cambios Kotlin. No se declara solucionado en dispositivo antes de esa confirmación.


### 24.14. Cierre definitivo — 57/57 criterios aplicables

**PASO 06 COMPLETADO Y VALIDADO — 05/11/2026.** Después del ajuste de medición/layout del MapView, el propietario confirmó: «muy bien ya aparecen creo que con eso podemos cerrar el paso 6?». Se acepta esa confirmación de controles visibles como cierre de la incidencia de zoom observada al ejecutar M03 y de la revisión final solicitada. Las interacciones de selección/carrusel y los demás escenarios ya habían sido confirmados en §24.10–24.11. No se inventa una confirmación individual de pulsación de cada botón +/− ni una captura adicional: el último resultado acredita explícitamente su aparición. Los controles son los oficiales del SDK, no comandos nuevos del bridge.

Se comprobó además en el workspace que CustomMapView.class y app-debug.apk se regeneraron después de la modificación de CustomMapView.kt; `javap` confirmó `layoutMapContent(int,int)` y `requestLayout()` en la clase compilada. Esto corrobora build posterior al ajuste sin afirmar que Gradle se ejecutó desde el sandbox. La instalación/visualización se acredita por la confirmación del propietario; no se asignan tiempos de build no compartidos.

**Resultado entregado:** FlatList horizontal, selección única por ID en memoria, mapa→carrusel y carrusel→mapa, drag lento/fling, prioridad de gestos, protección ante callbacks viejos, recuperación acotada de scroll, reconciliación 0/1/N/reorder/eliminación/textos, controles no gestuales y alternativa textual. Estado conservado entre tabs, Home y rotación. La adaptación nativa por defecto reproducido queda limitada a habilitar zoom y medir/layout de hijos SDK con callbacks agrupados y cancelables, sin cambiar contratos/specs ni el módulo seguro. El harness y sus controles ya fueron retirados.

**Matriz de cierre (evidencia acumulada, no nuevas pruebas inventadas):**

| Escenarios | Resultado | Evidencia |
| --- | --- | --- |
| M01–M02 | PASS manual | Captura inicial y confirmación de pins/tarjetas primero, intermedio y último |
| M03 | CERRADO tras corrección | Doble toque ejecutado por el propietario produjo zoom estándar; falta de controles detectada y corregida. Última confirmación de controles visibles; idempotencia de selección cubierta por Jest y las interacciones previas |
| M04–M07 | PASS manual | A→B, fling/drag lento y gesto durante animación confirmados |
| M08–M09, M16 | PASS manual | Tabs, Home y rotación con selección/posición conservadas |
| M10–M12, M17 | PASS manual + automatizado | Todas las opciones del harness confirmadas, con alcance de inyección descrito en §24.11; luego retirado |
| M13 | PASS manual | Ver datos sensibles/Ocultar/retorno a mapa-carrusel confirmados; regresión focalizada |
| M14 | PASS manual | Fuente ampliada, legibilidad y Anterior/Siguiente confirmados; captura del layout |
| M15 | EXCLUIDO / NO APLICA | Decisión del propietario; sin lógica TalkBack específica, conservando propiedades a11y estándar |
| M18 | PASS manual | iOS abre ambas tabs con fallback Android; sin mapa nativo iOS ni cierres |

**Pruebas y validaciones que respaldan el cierre:**

- Código final JS sin harness: lint sin warnings, typecheck estricto, format:check y 90 Jest en 10 suites PASS. Se conservan los 58 tests iniciales; 32 añadidos para el Paso 06. Cobertura ejecutada de archivos instrumentados: 95,78 % sentencias, 91,19 % ramas, 97,50 % funciones y 95,69 % líneas; no representa auditoría global del Paso 07.
- `npm run test:all` aprobado desde Terminal del propietario (`BUILD SUCCESSFUL in 5s`), según §24.10. No se atribuye al entorno restringido del agente ni se afirma que ese log corresponda al build posterior de zoom.
- Tras el ajuste Kotlin, compilación directa con SDK/dependencias cacheadas PASS y 13 JUnit suplementarias PASS. El build Android posterior se corrobora por los artefactos regenerados y la confirmación del propietario. El agente no pudo ensamblar el APK mediante su Gradle por restricciones del sandbox.
- `git diff --check` PASS. Sin dependencias nuevas, cambios de contrato ni credenciales expuestas. secrets.properties sigue local/ignorado y nunca se imprimió. Se preservan accessible, accessibilityLabel, accessibilityRole, accessibilityState, accessibilityLiveRegion, contraste, texto adaptativo, targets y selección alternativa al swipe.

**DoD final:** las 57 casillas aplicables de §18 están verificadas. Se cierran los criterios 10 (excepción nativa justificada y probada), 53 (build/runtime posteriores) y 54 (matriz con resultados reales). Criterio 42 excluido expresamente; no se declara 58/58 ni prueba TalkBack ejecutada. Las limitaciones de medición se conservan: no se midieron FPS/leaks, no se instrumentó una traza de cada evento Android y no se simula paridad MapKit.

Se actualizó este documento y README, sin crear reporte nuevo. No se modificaron los cierres 01–05, no se hizo commit/push y **no se creó ni ejecutó el Paso 07**. No queda trabajo pendiente dentro del alcance acordado del Paso 06.
