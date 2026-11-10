# STEP-05 — Benefits y CustomMap (Android/Kotlin)

> **Actualización de alcance — 06/11/2026:** el Paso 08 fue **OMITIDO por decisión del propietario**, por resultar redundante para el reto BCP. Su documento de ejecución fue eliminado. Las referencias históricas a esa etapa corresponden al plan original y no constituyen trabajo pendiente ni un requisito de cierre. Este paso conserva su aprobación y sus controles implementados.

**Proyecto:** `io-products-benefits`  
**Aplicación:** iO Productos & Beneficios  
**Librería nativa única:** `io-native-components`  
**Etapa:** 05 de 12  
**Estado del documento:** VERSIÓN 1.1 EJECUTADA — **PASO 05 COMPLETADO Y VALIDADO (47/47 DoD)**  
**Prerrequisitos confirmados por el propietario:** Pasos 01, 02, 03 y 04 **ejecutados, completados y aprobados**  
**Plataforma funcional obligatoria:** Android + Kotlin  
**Plataforma reservada:** iOS + Swift en Paso 11  
**Stack inmutable:** React Native 0.88, TypeScript estricto, New Architecture, Clean Architecture, SOLID y Vertical Slicing por capabilities  
**Ubicación prevista:** `docs/steps/STEP-05-BENEFITS-CUSTOM-MAP.md`  
**Documento rector:** `RETO_BCP_TECHNICAL_BASELINE.md`  
**Fuente de evaluación:** `Reto técnico - Chapter Master Frontend.pdf`

> **Actualización de referencia — 05/11/2026:** se leyó el documento completo `STEP-04-NATIVE-SECURE-VIEW.md` **revisado (22 secciones y 60 DoD)**, incorporado a las fuentes del proyecto. Aunque ese archivo conserva una cabecera redactada *antes* de su ejecución, el propietario confirma expresamente que **el Paso 04 ya se ejecutó y aprobó**. Sus decisiones aprobadas se conservan en esta revisión del Paso 05. En los detalles que dependen de archivos realmente generados (clases Codegen, registro, Gradle), **el código del repositorio y el reporte de cierre del Paso 04 son la evidencia final**; el implementador debe comprobar solo las superficies necesarias para extender la librería, **no reauditar ni rehacer los 60 DoD anteriores**.
>
> **Baseline nativa definida por el Paso 04 que no debe romperse:** `io-native-components` (`file:./packages/io-native-components`), namespace `com.ioproductsbenefits.nativecomponents`, Codegen `IoNativeComponentsSpec` bajo `src/specs` (`type: modules` al terminar Paso 04), TurboModule `IoSecureView`, spec `NativeIoSecureView.ts`, clase Kotlin `IoSecureViewModule`, paquete `IoNativeComponentsPackage`, `CardSecureActivity` no exportada, token mock **60 s**, sesión protegida **45 s**, cuatro eventos tipados y scripts `npm run test:native:android` y `npm run test:all`. En Paso 05 **solo** se añade Fabric y se cambia el `type` del mismo `codegenConfig` a `all`, si el repositorio conserva el valor de Paso 04.

---

## 1. Plan de implementación

> Actúa como un **Chapter Frontend / Senior React Native Engineer**, con experiencia demostrable en React Native 0.88 New Architecture, Fabric Native Components, Codegen, Kotlin, Google Maps SDK for Android, Clean Architecture, BIAN, accesibilidad y testing.
>
> **Ejecuta exclusivamente el PASO 05 — BENEFITS Y CUSTOMMAP (ANDROID/KOTLIN)** dentro del repositorio **existente** `io-products-benefits`.
>
> Los Pasos 01–04 están **completados y aprobados**. **No repitas sus implementaciones ni sus auditorías de cierre.** Inspecciona solamente las interfaces, ubicaciones, registros y mecanismos de integración que necesites para implementar esta etapa sin romper las anteriores.
>
> **Objetivo:** materializar la capability `Benefits` sobre los contratos del Paso 02, filtrar los beneficios por las marcas de las tarjetas del usuario, transformarlos a marcadores y renderizarlos en un **mapa real de Google Maps SDK para Android** mediante un **Fabric Native Component propio** dentro de la **librería ya creada** `packages/io-native-components`. La tab **Beneficios** debe dejar de ser un placeholder en Android y mostrar datos, mapa, estados de UI y eventos funcionales.
>
> **No implementes** el carrusel ni sincronización bidireccional mapa ↔ carrusel (Paso 06), **no implementes** Swift/MapKit (Paso 11), **no uses** `react-native-maps`, wrappers de mapas ni bridges de terceros, **no crees** una segunda librería y **no modifiques** el TurboModule o la Card Secure View del Paso 04 salvo una adaptación de registro estrictamente indispensable, mínima y documentada.
>
> **Trabaja incrementalmente, ejecuta las verificaciones reales, entrega un reporte de evidencias y detente al cerrar este paso.** No hagas `git commit`, `git push`, publicaciones, configuración remota en Google Cloud ni cambios irreversibles sin autorización del propietario.

### 1.1. Orden de fuentes y lectura

1. `Reto técnico - Chapter Master Frontend.pdf`, si está disponible localmente. **Requisito del evaluador prevalente.**
2. `RETO_BCP_TECHNICAL_BASELINE.md`.
3. Contratos **realmente presentes** y aprobados del Paso 02, en particular `Benefit`, `BenefitRepository`, `BenefitsDataSource`, `AvailableCardBrandsReader`, `CardBrand` y `CustomMapContracts.ts`.
4. Código real aprobado de Pasos 03 y 04: source de tarjetas, store/composición, `packages/io-native-components`, Codegen, autolinking, registro Android y tests.
5. `docs/steps/STEP-04-NATIVE-SECURE-VIEW.md`, **documento ya disponible y leído**: conservar sus identificadores, contratos, registro Kotlin, política de eventos/seguridad y comandos de testing. Si no está físicamente en el checkout local usado por el implementador, informarlo y usar el código efectivo **sin inventar diferencias**.
6. Este documento y fuentes técnicas oficiales.

**Orden ante discrepancias:** PDF oficial > baseline maestro > contratos aprobados/implementación efectiva > este prompt > preferencias del agente. Si un contrato real difiere de la referencia escrita, **adaptar el código nuevo**, justificar el desfase y **no reescribir un contrato estable por conveniencia de Codegen**.

### 1.2. Inspección estrictamente necesaria, sin reauditar 01–04

- Confirmar root, branch y `git status --short`; **no limpiar modificaciones preexistentes**.
- Leer `package.json`, `package-lock.json`, scripts actuales y versiones **efectivas** de RN, Kotlin, Gradle, Android Gradle Plugin y JDK, únicamente para elegir una integración compatible.
- Localizar **la única** librería `io-native-components`; comprobar específicamente el baseline del Paso 04: `codegenConfig.name=IoNativeComponentsSpec`, `type=modules`, `jsSrcsDir=src/specs`, `android.javaPackageName=com.ioproductsbenefits.nativecomponents`, el TurboModule `IoSecureView` y `IoNativeComponentsPackage`. Si la implementación efectiva difiere, documentar el valor real y corregir el **mínimo** para agregar Fabric.
- Identificar cómo se entrega `CardRepository`, se alimenta `useProductsStore` y se construye el composition root; reutilizar esos objetos y no montar un segundo modelo de tarjetas. Confirmar que los scripts existentes `test:native:android` y `test:all` de Paso 04 se conservarán, no se reemplazarán por una suite incompleta.
- Inspeccionar la pantalla placeholder de Beneficios y el navegador para reemplazar **solo** el contenido de la tab.
- Revisar `CustomMapContracts.ts` existente y comprobar su firma exacta. **No sustituirlo por la spec nativa.**
- Registrar de antemano si hay entorno Android y un emulador/dispositivo con **Google Play services**. El mapa real necesita credencial configurada y conectividad; el compilado no demuestra que las teselas se rendericen.

**No detenerse a recalcular los DoDs de los pasos anteriores.** La inspección previa es una lectura de integración y protección contra regresiones, no la reapertura de etapas cerradas. El Paso 04 tiene **60 criterios ya aprobados por el propietario**; este paso solo exige el **smoke/regresión focalizada** indispensable para asegurar que la extensión Fabric no los rompe.

---

## 2. Requisitos del PDF y delimitación incremental

El enunciado oficial solicita una tab **Beneficios**, beneficios aplicables a las tarjetas del usuario (`applicableBrands`), un componente nativo propio `<CustomMap />`, los parámetros `markers` y `selectedMarkerId`, el evento `onMarkerPress`, marcadores dinámicos, una **sola librería nativa propia** y pruebas unitarias. Autoriza **Google Maps SDK oficial en Android** y prohíbe wrappers de RN que resuelvan mapas.

| Entregable | **Paso 05** | Paso posterior |
| --- | --- | --- |
| `benefits.json` con esquema del PDF | **Implementar** | — |
| Data source, repositorio y use case de Benefits | **Implementar** | — |
| Conexión con marcas de Cards mediante puerto `AvailableCardBrandsReader` | **Implementar** | — |
| Filtrado por intersección de `applicableBrands` | **Implementar** | — |
| `Benefit.id: number` → `MapMarker.id: string` | **Implementar** | — |
| `<CustomMap />` real dentro de la librería preexistente | **Implementar Android** | iOS en 11 |
| Fabric + Codegen + Kotlin + Google Maps SDK | **Implementar Android** | iOS/Swift en 11 |
| Props `markers`, `selectedMarkerId` y `onMarkerPress` | **Implementar y probar** | Reutilizar en 06 |
| Lista/carrusel horizontal de beneficios | **Prohibido en este paso** | **06** |
| Sincronización mapa ↔ carrusel en ambos sentidos | **Prohibido en este paso** | **06** |
| Testing JS y JUnit específico de este paso | **Implementar** | Cobertura integral en 07 |
| Hardening transversal, auditoría profunda y optimizaciones adicionales | Solo higiene indispensable | 08 |
| Firebase, backend, publicación de librería | **No implementar** | 09–10 según prioridad |
| Swift, MapKit y paridad del mapa iOS | **No implementar** | 11 |

**Definición de éxito:** en Android la tab Beneficios muestra un mapa real con marcadores elegibles, responde correctamente a un tap de marcador y a cambios de props; resuelve carga/vacío/error; no afecta Mis productos ni la Card Secure View. **Esto NO significa que el reto completo esté terminado:** el carrusel y su sincronización siguen pendientes del Paso 06.

---

## 3. Arquitectura — extensión de los contratos existentes

### 3.1. Flujo de datos obligatorio

```text
Cards / Account Management                    Benefits
┌──────────────────────────────┐             ┌─────────────────────────────┐
│ CardRepository o fuente       │             │ LocalBenefitsDataSource     │
│ aprobada de productos seguros │             │   -> BenefitRepository     │
└──────────────┬───────────────┘             └─────────────┬───────────────┘
               │                                             │
               ▼                                             ▼
     AvailableCardBrandsReader                       Use case Benefits
       (puerto de Benefits)                   normalizar + filtrar + validar
               │                                + convertir a MapMarker
               └───────────────────┬─────────────────────────┘
                                   ▼
                        Benefits presentation
                      loading/success/empty/error
                                   │
                                   ▼
                         CustomMap (wrapper TS)
                                   │
                                   ▼
                    io-native-components (Fabric)
                                   │
                                   ▼
                     Kotlin + Google Maps SDK
                      MapView / GoogleMap / Marker
                                   │
                              onMarkerPress
                                   ▼
                        callback TS con markerId
```

**Dirección de dependencias:** `domain` no conoce UI, JSON ni SDK; `application` consume repositorios y puertos; `infrastructure` materializa adapters; `presentation` usa casos de uso/contratos; `app/composition` crea dependencias. El adapter de marcas **pertenece a la composición o a infraestructura definida por el proyecto**, **no** a una importación de `benefits` hacia los detalles internos de `cards`.

### 3.2. Árbol de cambios orientativo — adaptar al repositorio real

```text
src/
  app/
    composition/
      benefitsDependencies.ts               # conexión manual; extender composición real
  capabilities/
    benefits/
      domain/
        models/Benefit.ts                   # EXISTENTE: NO redefinir
        repositories/BenefitRepository.ts   # EXISTENTE: NO redefinir
      application/
        ports/AvailableCardBrandsReader.ts  # EXISTENTE: NO redefinir
        usecases/
          loadEligibleBenefits.ts           # sugerido; nombre adaptable
        mappers/
          benefitToMapMarker.ts             # si la separación aporta claridad
      infrastructure/
        mocks/benefits.json                 # NUEVO
        datasources/
          BenefitsDataSource.ts             # EXISTENTE: interfaz
          LocalBenefitsDataSource.ts         # NUEVO
        repositories/
          MockBenefitRepository.ts          # NUEVO
      presentation/
        contracts/CustomMapContracts.ts     # EXISTENTE: contrato público
        screens/BenefitsScreen.tsx           # sustituye placeholder Android
        hooks/useBenefits.ts                # si aporta separación real
        components/BenefitsStatusView.tsx    # solo si tiene uso real
        store/useBenefitsStore.ts            # OPCIONAL si mejora conservación real
packages/
  io-native-components/                      # EXISTENTE; ÚNICA LIBRERÍA
    package.json                             # `IoNativeComponentsSpec`: modules -> all, MISMO bloque
    src/
      specs/
        NativeIoSecureView.ts                # EXISTENTE: conservar spec TurboModule íntegra
        CustomMapNativeComponent.ts          # NUEVA spec Fabric; mismo jsSrcsDir=src/specs
      CustomMap.tsx                          # wrapper propio, exportado por index existente
      index.ts                               # añadir export SIN romper secure view
    android/
      build.gradle                           # solo dependencia oficial Maps compatible
      src/main/java/com/ioproductsbenefits/nativecomponents/
        IoNativeComponentsPackage.kt         # EXISTENTE: extender createViewManagers, sin duplicar paquete
        IoSecureViewModule.kt                # EXISTENTE: NO modificar salvo fix indispensable
        secureview/CardSecureActivity.kt     # EXISTENTE: NO modificar lifecycle ni FLAG_SECURE
        map/CustomMapView.kt                 # contenedor y lifecycle
        map/CustomMapViewManager.kt          # prop setters y Fabric delegate
        map/MapMarkerReconciler.kt           # lógica testeable, si se justifica
      src/test/java/com/ioproductsbenefits/nativecomponents/map/
        ...Test.kt                           # JUnit sin SDK gráfico real
android/
  app/                                       # inyección controlada de clave + manifest
README.md                                     # documentación incremental
```

`src/specs/`, `IoNativeComponentsSpec`, `com.ioproductsbenefits.nativecomponents`, `NativeIoSecureView.ts` e `IoNativeComponentsPackage` **sí están fijados por el documento revisado del Paso 04**; cotejar únicamente que coincidan con lo que el implementador ya implementó. Los nombres de nuevas clases de mapa y la ubicación final de archivos de pruebas son orientativos. La spec Fabric debe usar el **mismo** `jsSrcsDir`. No crear una segunda configuración `codegenConfig`, segundo `ReactPackage`, proyecto Gradle, librería npm ni árbol duplicado. Registrar el árbol **real** en el informe del implementador.

### 3.3. Contratos inmutables del Paso 02

**Dominio** (`Benefit.ts`):

```ts
interface Benefit {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly image: string;
  readonly promotion: string;
  readonly address: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly applicableBrands: readonly CardBrand[];
}
```

**Puertos existentes:**

```ts
interface BenefitRepository {
  listBenefits(): Promise<readonly Benefit[]>;
}

interface AvailableCardBrandsReader {
  getAvailableBrands(): Promise<readonly CardBrand[]>;
}
```

**Contrato público** (`src/capabilities/benefits/presentation/contracts/CustomMapContracts.ts`):

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

- `Benefit.id` numérico **no cambia** para satisfacer el SDK; el mapper convierte con `String(benefit.id)`.
- El `MapMarker` de la app **no** se cambia por tipos generados de Codegen ni por `com.google.android.gms.maps.model.Marker`.
- `selectedMarkerId` acepta `undefined` o `null` **en el contrato público**. Si la spec Codegen de RN 0.88 no soporta esa unión, el wrapper normaliza `null` hacia `undefined` o el valor nativo neutral conforme al esquema generado; **no modificar el puerto para acomodar el generador**.
- La API pública llama a `onMarkerPress(markerId: string)`; internamente Fabric puede usar `DirectEventHandler<{markerId: string}>` y el wrapper convierte el evento estructurado a `string`.
- No transportar PAN, CVV, token, titular, cardId ni cuentas dentro de markers, props, eventos o logs.

---

## 4. Mocks y reglas del negocio Benefits

### 4.1. `benefits.json` — esquema, calidad y ejemplos

Crear el archivo en la infraestructura de Benefits con **datos ficticios plausibles de Lima**, respetando exactamente los campos del PDF. Ejemplo **ilustrativo** de contenido; el implementador puede ajustar textos y coordenadas sin cambiar el esquema:

```json
[
  {
    "id": 1,
    "title": "Café Miraflores",
    "description": "Promoción demostrativa en cafetería del distrito.",
    "image": "https://example.com/benefits/cafe-miraflores.jpg",
    "promotion": "20% de descuento",
    "address": "Zona comercial de Miraflores, Lima (referencial)",
    "latitude": -12.1191,
    "longitude": -77.0304,
    "applicableBrands": ["VISA"]
  },
  {
    "id": 2,
    "title": "Restaurante San Isidro",
    "description": "Promoción demostrativa en consumo presencial.",
    "image": "https://example.com/benefits/restaurante-san-isidro.jpg",
    "promotion": "15% de descuento",
    "address": "Zona comercial de San Isidro, Lima (referencial)",
    "latitude": -12.095,
    "longitude": -77.04,
    "applicableBrands": ["MASTERCARD"]
  },
  {
    "id": 3,
    "title": "Librería San Miguel",
    "description": "Promoción demostrativa en libros seleccionados.",
    "image": "https://example.com/benefits/libreria-san-miguel.jpg",
    "promotion": "10% de descuento",
    "address": "Zona comercial de San Miguel, Lima (referencial)",
    "latitude": -12.0771,
    "longitude": -77.0823,
    "applicableBrands": ["VISA", "MASTERCARD"]
  },
  {
    "id": 4,
    "title": "Experiencia Barranco",
    "description": "Beneficio de prueba reservado para otra marca.",
    "image": "https://example.com/benefits/barranco.jpg",
    "promotion": "2x1 demostrativo",
    "address": "Zona comercial de Barranco, Lima (referencial)",
    "latitude": -12.1492,
    "longitude": -77.0219,
    "applicableBrands": ["AMEX"]
  }
]
```

**Estos comercios son ejemplos ficticios; no afirmar que los beneficios existen comercialmente.** `example.com` es un placeholder documental, **no** una promesa de que existan imágenes allí. En el Paso 05 no se exige descargar ni renderizar imágenes del carrusel; conservar el campo `image` por compatibilidad con el dominio y el futuro Paso 06. No agregar librería de imágenes, caché remota ni imágenes con derechos dudosos por esta etapa.

La muestra oficial usa `id` numérico y `applicableBrands` como colección de strings. **No sustituirla** por campos ajenos al PDF, no geocodificar direcciones y no inferir coordenadas mediante HTTP.

### 4.2. Data source y repositorio

- `LocalBenefitsDataSource` implementa **la interfaz existente** `BenefitsDataSource.readBenefits(): Promise<readonly BenefitRecord[]>`, usando el JSON local.
- Tratar el JSON como `unknown` en la **frontera lógica**: validar arreglo, objetos y campos, sin confiar en un cast TypeScript de un import.
- Proyectar por **allowlist** un objeto nuevo con las nueve propiedades definidas en `Benefit`, sin `...record` de datos de entrada ni atributos inesperados.
- Comprobar `id` como número entero seguro, positivo y único; cadenas relevantes no vacías (`title`, `description`, `promotion`, `address`); `image` como string; y `applicableBrands` como arreglo de strings no vacíos. No imponer validez de URL de imagen en una etapa que no la usa.
- `latitude` y `longitude` se validan rigurosamente según §5; **no** se aceptan strings numéricos, `NaN` ni infinito.
- Normalizar marcas mediante `trim().toUpperCase()` en la entrada y al consultarlas, manteniendo `CardBrand = string`; no inventar un enum cerrado.
- Los duplicados de `id` o el JSON estructuralmente corrupto deben producir **error controlado**, no duplicar markers ni truncar silenciosamente datos.
- `MockBenefitRepository` implementa `BenefitRepository`, recibe `BenefitsDataSource` inyectado y no contiene JSX ni depende de Google Maps.
- No simular latencia artificial, backend, AsyncStorage, Redux, Zod, geolocalización ni red. Los tests de estados usan promesas/dobles inyectados.

### 4.3. Adapter de marcas y DIP

`AvailableCardBrandsReader` **ya existe** y pertenece a Benefits como puerto consumidor. Crear **una implementación concreta** que use la **fuente legítima de tarjetas ya aprobada en Paso 03**:

1. Preferencia: reutilizar `CardRepository` ya compuesto, o el estado seguro de productos cuando su ciclo de carga garantice un snapshot válido. **No copiar `cards.json` dentro de Benefits.**
2. Resolver el adapter en `src/app/composition/` o en infraestructura compartida específica que el diseño aprobado autorice; **`benefits/application` no importa `cards/infrastructure`, Zustand ni JSON**.
3. Si lee el store de Cards, distinguir `idle/loading/error` de un arreglo válido sin tarjetas: **un fallo/no-cargado no debe interpretarse como «usuario sin marcas»**. En caso necesario, esperar/cargar por el repositorio aprobado en vez de consultar un store incompleto.
4. Normalizar, descartar marcas vacías y deduplicar con un `Set`, sin guardar un segundo arreglo global de marcas.
5. Si el catálogo de tarjetas contiene `VISA` y `MASTERCARD`, el mock ilustrativo ofrece beneficios 1, 2 y 3; el 4 **no debe aparecer**. **Validar la expectativa final contra las tarjetas realmente presentes**, no asumir que los fixtures efectivos contienen exactamente esas marcas.
6. Si no hay tarjetas ni marcas válidas, devolver lista de marcas vacía: no deben aparecer beneficios elegibles.
7. Si la lectura de tarjetas falla, propagar un error público seguro al estado `error` de Benefits; **no mostrar todos los beneficios como fallback**.

### 4.4. Caso de uso: elegibilidad determinista

Definir un caso de uso testable que reciba `BenefitRepository` y `AvailableCardBrandsReader` (por constructor o parámetros inyectados) y devuelva beneficios elegibles **sin conocer React, Zustand, SDK ni JSON**.

Regla estricta:

```ts
const eligible = benefits.filter(benefit =>
  benefit.applicableBrands.some(brand => availableBrands.has(brand)),
);
```

El ejemplo es **semántico**: `availableBrands` es un `Set` de strings **ya normalizadas**. Nunca comparar strings originales sin normalización. No inferir la marca a partir del PAN enmascarado ni del alias.

Invariantes del caso de uso:

- **Intersección no vacía** `applicableBrands ∩ availableBrands` ⇒ elegible.
- Intersección vacía ⇒ excluido, incluso si el título o imagen sugieren otra marca.
- Beneficio multimarcas ⇒ aparece **una sola vez**.
- Usuario con tarjetas repetidas de una marca ⇒ mismo resultado, sin beneficios duplicados.
- Conjunto de marcas vacío ⇒ `[]` (empty, **no** error).
- `applicableBrands` vacío o inválido ⇒ no elegible/rechazado por validación, **nunca** aplicable a todos.
- No mutar la entrada ni introducir orden aleatorio; preservar orden estable de JSON o un orden de negocio explícito y documentado.

---

## 5. Transformación a MapMarker, errores de datos y límites

### 5.1. Mapeo público único

Crear una función pura y testeada, llamada por la orquestación de Benefits **antes** del puente nativo:

```ts
// Pseudocódigo tipado: no copiar sin comprobar los imports reales.
function benefitToMapMarker(benefit: Benefit): MapMarker {
  return {
    id: String(benefit.id),
    latitude: benefit.latitude,
    longitude: benefit.longitude,
    title: benefit.title,
  };
}
```

Se envían únicamente `id`, coordenadas y `title` opcional. `description`, `image`, `promotion`, `address` y `applicableBrands` **permanecen en la capa de dominio/presentación**, no viajan sin motivo a Kotlin. El `id` debe permitir relacionar el evento nativo con un beneficio elegible en el Paso 06.

### 5.2. Validación estricta de coordenadas

```ts
function isValidLatitude(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= -90 && value <= 90;
}

function isValidLongitude(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= -180 && value <= 180;
}
```

- Aceptar valores de borde **-90, 90, -180 y 180**, si son finitos.
- Rechazar `NaN`, `Infinity`, `-Infinity`, `null`, `undefined`, strings y fuera de rango.
- `(0, 0)` es **numéricamente válido**; no usarlo como centro por defecto ni considerarlo inválido sin una regla del negocio (el PDF lo utiliza como ejemplo). Para los mocks de Lima, no usar `(0, 0)` como coordenada accidental.
- Validar **dos veces, con propósitos distintos**: en la frontera JS para garantizar datos de negocio correctos, y en Kotlin para **defensa en profundidad** ante props anómalas durante runtime.
- No proyectar a `LatLng` ni construir `MarkerOptions` con coordenadas inválidas.

### 5.3. Política explícita de datos anómalos

| Situación | Resultado requerido |
| --- | --- |
| JSON válido y ningún beneficio elegible | `empty` con mensaje «No tienes beneficios disponibles para tus tarjetas» |
| Usuario sin marcas/tarjetas | `empty`; **no** renderizar beneficios de otras marcas |
| JSON malformado, ID duplicado, tipos críticos incorrectos | `error` controlado, sin payload bruto ni crash |
| Beneficio elegible con coordenadas fuera de rango/no finitas | No crear marcador; registrar solo diagnóstico técnico **sanitizado**. Reportar invalidación mediante resultado de validación; no mostrar ubicación falsa |
| Algunos elegibles con coordenadas inválidas y otros correctos | Mostrar solo markers válidos; si hay aviso, usar texto no técnico «Algunos beneficios no se pueden ubicar» |
| Todos los elegibles con coordenadas inválidas | Estado `error` de datos de ubicación, **no** «sin beneficios» |
| `markers=[]` recibido por Fabric | Mapa estable sin markers o vista empty; sin excepción |
| Dos registros con el mismo ID de marcador | Rechazar/deduplicar en frontera de forma determinística y testada; nunca dos pins con mismo ID |
| `selectedMarkerId` `undefined`/`null`/`''` | Sin selección destacada; sin evento artificial |
| `selectedMarkerId` que no está en la lista | Ignorar selección/limpiar resaltado; sin crash ni cámara hacia lugar inexistente |
| Tap físico a pin ya eliminado | No emitir ID obsoleto; listener asociado se limpia o valida membership |
| Error de lectura del repositorio de Cards o Benefits | `error` con **Reintentar**; nunca «mostrar todo» |

No imprimir JSON de entrada, stack traces o valores de tarjetas en UI. Distinguir formalmente **error de integridad**, **empty legítimo** y **error de mapa/configuración**.

---

## 6. Librería única, Fabric y Codegen RN 0.88

### 6.1. Regla de empaquetado innegociable

**Extender `packages/io-native-components`**, conservando su `package.json`, nombre npm, autolinking, namespace Android, TurboModule y Card Secure View. **No** ejecutar generadores para crear otra librería, no añadir un segundo `codegenConfig`, no renombrar el módulo seguro y no integrar un bridge legacy paralelo para ahorrar trabajo.

La librería ahora expone dos superficies distintas:

```text
io-native-components
  ├─ Turbo Native Module existente → secureToken + Card Secure View (Paso 04)
  └─ Fabric Native Component nuevo  → <CustomMap /> (Paso 05)
```

**Migración exacta desde el Paso 04 aprobado:** cambiar **únicamente** `codegenConfig.type` de `"modules"` a `"all"` dentro del `package.json` de **esta misma** librería, porque ahora coexisten un TurboModule y un Fabric Native Component. Conservar `codegenConfig.name="IoNativeComponentsSpec"`, `jsSrcsDir="src/specs"`, `android.javaPackageName="com.ioproductsbenefits.nativecomponents"`, el package npm `io-native-components` y su dependencia local en la app. Si el código efectivo ya tiene `type: all`, no reescribirlo. No reemplazar el `package.json` completo ni generar un segundo bloque Codegen. La nueva spec de mapa debe terminar en **`NativeComponent.ts`** y ubicarse junto a `NativeIoSecureView.ts`.

**Ejemplo de cambio acotado** (fragmento declarativo, no sobrescribir otros campos existentes):

```json
{
  "codegenConfig": {
    "name": "IoNativeComponentsSpec",
    "type": "all",
    "jsSrcsDir": "src/specs",
    "android": {
      "javaPackageName": "com.ioproductsbenefits.nativecomponents"
    }
  }
}
```

**Invariantes del TurboModule aprobado que deben permanecer operativos:** módulo público `IoSecureView`, spec `src/specs/NativeIoSecureView.ts`, `IoSecureViewModule` Kotlin basado en Codegen, `issueSecureToken(cardId)`, `openSecureView(cardId, secureToken)`, emisores `onSecureViewOpened`, `onValidationError`, `onCardDataShown`, `onSecureViewClosed`, y sus adapters de Cards. La spec Fabric no sustituye estas declaraciones ni cambia sus payloads, nombres o tipos.

### 6.2. Spec Fabric — forma objetivo, no sustituto del contrato público

Implementar una especificación compatible con el subconjunto **real** de tipos admitidos por Codegen **de RN 0.88 fijado en `node_modules`**. Una orientación de diseño es:

```ts
// packages/io-native-components/src/specs/CustomMapNativeComponent.ts
// EJEMPLO CONCEPTUAL: validar el tipo y la sintaxis exactos con Codegen 0.88.
import type {ViewProps} from 'react-native';
import type {DirectEventHandler, Double} from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

type NativeMarker = Readonly<{
  id: string;
  latitude: Double;
  longitude: Double;
  title?: string;
}>;

type MarkerPressEvent = Readonly<{markerId: string}>;

interface NativeProps extends ViewProps {
  markers: ReadonlyArray<NativeMarker>;
  selectedMarkerId?: string;
  onMarkerPress?: DirectEventHandler<MarkerPressEvent>;
}

export default codegenNativeComponent<NativeProps>('CustomMap');
```

**No presentar este fragmento como verificado por ejecución aquí.** El implementador debe **probar** el parser/generador contra la instalación concreta de RN 0.88 y ajustar únicamente lo exigido por Codegen, sin degradar los contratos públicos de Paso 02. No asumir que `readonly MapMarker[]`, `string | null`, callbacks `(id: string) => void` o uniones complejas compilan literalmente como spec nativa.

#### Comportamientos de la spec

- Propiedad `markers`: arreglo de objetos con `id`, `latitude`, `longitude`, `title?`; sin card data ni metadata sensible.
- Propiedad `selectedMarkerId`: string opcional a nivel Codegen; `null` público se normaliza en el wrapper.
- Evento directo `onMarkerPress`: **payload estructurado** `{markerId: string}`. No usar emitter global del TurboModule para taps del mapa.
- El nombre del Host Component de la spec, el nombre devuelto por el Kotlin ViewManager y el nombre registrado deben ser el **mismo** (`CustomMap`, salvo que el sistema real requiera un nombre interno con adaptación pública documentada).
- No utilizar `requireNativeComponent` legacy ni `NativeModules` para el mapa.
- Si se necesitan **señales internas de disponibilidad del mapa** (`onMapReady` / `onMapError` / `onMapStatus`), mantenerlas **mínimas, tipadas y encapsuladas** en el wrapper/adaptador de presentación. No reemplazar los tres elementos contractuales exigidos, no exponer detalles de Google a `domain`, y no fingir que Google Maps proporciona un callback universal de errores de teselas/autorización.

### 6.3. Código generado y registro real

El implementador debe:

1. Ejecutar desde `android/`: `./gradlew generateCodegenArtifactsFromSchema`.
2. Verificar **físicamente** que Codegen genera `CustomMapManagerInterface` / `CustomMapManagerDelegate` (o los nombres reales derivados de la spec) **y sigue generando** `NativeIoSecureViewSpec` / clase base efectiva y métodos/eventos del TurboModule `IoSecureView`. Conservar `IoNativeComponentsSpec` como identidad Codegen; verificar el `schema.json` real, sin tocar artefactos generados a mano.
3. Implementar `CustomMapViewManager` en Kotlin heredando la clase de manager apropiada a RN 0.88 (`SimpleViewManager<CustomMapView>` o equivalente compatible), con `getDelegate()` y las interfaces generadas **de la versión efectiva**.
4. Extender el **`IoNativeComponentsPackage : BaseReactPackage` existente** para que continúe sirviendo `IoSecureView` desde `getModule()`/`getReactModuleInfoProvider()` y además devuelva **`CustomMapViewManager`** desde `createViewManagers(...)`, según la firma de RN 0.88 instalada. **No** crear un `CustomMapPackage` aparte, no cambiar la marca `isTurboModule=true` del módulo seguro, no devolver un ViewManager desde `getModule()` y no registrar el paquete manualmente una segunda vez encima de autolinking.
5. Comprobar que no se crea un segundo registro manual encima de autolinking. Inspeccionar `react-native config` y `PackageList` cuando haga falta.
6. Comprobar generación, compilación Kotlin/Java/C++, enlace y montaje del componente en **Android real/emulador**. **TypeScript compilando no demuestra que Fabric monte la vista.**
7. No versionar artefactos generados en `build/` salvo una necesidad real y justificada de la integración ya aprobada.

### 6.4. Wrapper TypeScript tipado

Exportar un componente **público** `CustomMap` que satisfaga el `CustomMapProps` de `CustomMapContracts.ts` (directamente o por tipo importado), y que:

- Convierta `readonly MapMarker[]` al tipo de props de Codegen sin hacer casts inseguros ni modificar los objetos originales.
- Envíe `selectedMarkerId={undefined}` cuando el consumidor pasa `null` (si así lo exige la spec), sin actualizar selección durante render.
- Transforme el evento nativo `{nativeEvent: {markerId}}` en **`onMarkerPress(markerId: string)`**.
- Ignore eventos con ID vacío, de tipo incorrecto o inexistente dentro de `markers` actuales; la validación de membership se hace con un `Set` estable o equivalente.
- Use estilos y `flex`/dimensiones reales para que la vista nativa tenga tamaño medible en pantalla; no esconder un mapa sin altura.
- Maneje Android de forma funcional. En iOS, la pantalla **no debe montar un componente nativo ausente**: mostrar un mensaje accesible honesto en la tab o fallback explícito. Evitar `getEnforcing`/carga nativa que rompa la importación de la app iOS al importar `io-native-components`.
- No cree duplicados de estado de selección entre Kotlin y el store: Kotlin refleja una prop; React mantiene la fuente de verdad.

---

## 7. Implementación Kotlin con Google Maps SDK oficial

### 7.1. Dependencia y configuración permitidas

- Agregar al **módulo Android de la librería existente** la dependencia oficial `com.google.android.gms:play-services-maps` con una **versión estable explícita y compatible** con el `minSdk`, AGP, Kotlin y Google Play services del proyecto. **Verificar y registrar la versión efectiva antes de fijarla**; no usar `+`, `latest.release`, prereleases ni números inventados.
- Configurar el **Android app host** con la metadata recomendada `com.google.android.geo.API_KEY` en el `AndroidManifest` fusionado, **sin** incluir una credencial real en archivos versionados. Evitar entradas duplicadas `com.google.android.geo.API_KEY` / `com.google.android.maps.v2.API_KEY`.
- No añadir `react-native-maps`, Google Maps Compose, Places SDK, Navigation SDK, Firebase, una biblioteca de clustering o un proveedor alternativo de mapas.
- No pedir permiso de localización: los beneficios tienen coordenadas de mock; **no** hay geolocalización del usuario ni botón «Mi ubicación» en este paso.
- Verificar que el emulador dispone de imagen con **Google Play services**, que Maps SDK for Android está habilitado en el proyecto Google Cloud y que se usa una clave restringida cuando se realice la prueba manual.
- Documentar si el entorno carece de clave/servicios; no inventar resultado de mapa visualizado.

### 7.2. Vista nativa y `MapView`

Implementar `CustomMapView` como contenedor Android (por ejemplo `FrameLayout`) que contenga **`com.google.android.gms.maps.MapView`** —clase oficial de Google Play services—, sin children arbitrarios **dentro del `MapView`**, y que exponga métodos claros para aplicar las props y limpiar recursos.

Separar responsabilidades de forma ligera:

- `CustomMapViewManager`: prop setters generados (`markers`, `selectedMarkerId`), creación y destrucción de instancia, registro de eventos.
- `CustomMapView`: ciclo de vida de Google `MapView`, `getMapAsync`, asociación con `GoogleMap`, eventos de taps y aplicación de cambios.
- Un `MarkerReconciler`/helper **solo si mejora las pruebas**: diff por ID, coordenadas, título y selección; sin sobrearquitectura.

**No crear la UI del mapa dentro del TurboModule seguro** ni ejecutar un `Activity` independiente para este componente embebido. Fabric es declarativo: las props se reciben y reconcilian en la vista montada. En particular, el nuevo `CustomMapView` no debe importar ni controlar `SecureSessionController`, `NativeMockCardRepository`, `MockTokenIssuer`, `MockTokenValidator` ni `CardSecureActivity`.

**Separación de lifecycle y ventana:** el mapa vive en una vista embebida del Dashboard; la `CardSecureActivity` mantiene su propio `FLAG_SECURE` y su propio timeout monotónico de **45 s**. El MapView **no** debe poner/quitar `FLAG_SECURE` en la ventana principal ni tocar el token HMAC mock de **60 s**. Si se abre la Secure View desde Mis productos y luego se regresa a Beneficios, no debe quedar una bandera de ventana o listener de la Activity propagado al mapa.

### 7.3. Lifecycle obligatorio: contrato del SDK, no opcional

El `MapView` oficial exige reenviar:

```text
onCreate(savedInstanceState)
onStart()
onResume()
onPause()
onStop()
onSaveInstanceState(outState)
onLowMemory()
onDestroy()
```

Definir **un ownership verificable por instancia** para conectar los eventos reales de host/Activity/Fragment/React y los métodos de `MapView`:

1. Crear/inicializar `MapView` una sola vez por instancia de Fabric y llamar a `onCreate` antes de usarlo.
2. Observar ciclo de vida real (API compatible con RN 0.88 y AndroidX/ReactContext usada por la librería) y derivar `onStart/onResume/onPause/onStop` sin **llamadas duplicadas** ni secuencias inválidas.
3. Comprobar la semántica concreta de `LifecycleEventListener`/Activity del RN instalado; **no asumir** que `onHostResume` equivale por sí solo a todo `onStart`, ni que el callback de React basta para `onSaveInstanceState`.
4. Para `onSaveInstanceState`, registrar cómo se integra con el owner Android o documentar un fallback seguro de recreación de mapa sin estado previo; **no omitir silenciosamente la exigencia del SDK**.
5. Cuando React Navigation cambie tabs y la vista permanezca montada, impedir callbacks/animaciones innecesarios si la pantalla no está activa, **sin desmontar forzosamente ni perder selección**. No redefinir navegación por este motivo.
6. Al desmontar la vista, hacer cleanup **exactamente una vez** (`onDropViewInstance`/mecanismo apropiado): remover listeners, callbacks, marcadores y referencias a `GoogleMap`/contexto/host; desregistrar lifecycle y llamar a `onDestroy` cuando corresponda.
7. No conservar una referencia estática a `Activity`, `ReactContext`, `GoogleMap`, `MapView` ni ViewManager; evitar memory leaks y callbacks tardíos tras destroy.
8. Manejar rotación, app en background y regreso sin crash; si se recrea el mapa, reaplicar props vigentes una sola vez.
9. `onLowMemory` se reenvía al mapa en vez de ignorarlo. No forzar fullscreen ni cambiar `FLAG_SECURE` del Dashboard.

**Condición de aceptación:** el lifecycle está conectado por código y es verificable por tests/instrumentación y maniobras manuales. Mencionar métodos en un documento **no** equivale a haberlos integrado.

### 7.4. Marcadores dinámicos: actualización incremental

La vista nativa debe mantener, como máximo, una relación por ID:

```text
Map<markerId: String, GoogleMapsMarker>
```

Al recibir nuevos `markers`:

1. Validar cada objeto antes de construir `LatLng`; rechazar IDs vacíos/no únicos y coordenadas fuera de rango/no finitas.
2. Eliminar del mapa y del índice los IDs **desaparecidos**.
3. Agregar nuevos marcadores con ID, posición y título.
4. Para IDs persistentes, actualizar coordenadas o título **si cambiaron**; no ejecutar `googleMap.clear()` en cada render salvo que se justifique con evidencia.
5. Conservar un mapeo robusto `GoogleMapsMarker` ↔ `markerId` (por ejemplo mediante índice/control de tags seguros) sin guardar objetos de beneficio completos.
6. Aplicar el último snapshot de props incluso si estas llegaron **antes** de `getMapAsync()`; al recibir `onMapReady`, consumir la última versión, no una lista obsoleta.
7. Hacer operaciones de UI/mapa en el **hilo principal Android**, conforme al SDK.
8. Resolver el caso de 0, 1 o N markers sin excepción, incluso con varios cambios rápidos de props.
9. Evitar recomputar bounds y mover la cámara en cada rerender. Ajustar cámara **solo** cuando corresponde al primer montaje/primera población o cambio material de conjunto, con política explícita.

**Cámara:** para N>1, calcular `LatLngBounds` y ajustar **después de conocer el tamaño del mapa** (layout) con padding razonable. Para un único marker, centrar en su ubicación con zoom de demostración documentado. Con lista vacía, **no centrar en (0,0)** como si fuera una ubicación comercial; conservar cámara o usar una región de demo explícita si está justificado.

### 7.5. Selección y eventos, sin carrusel

- `selectedMarkerId` es **controlado desde React Native**, no un estado de negocio independiente en Kotlin.
- `undefined`, `null` adaptado o ID inexistente eliminan/ignoran el resaltado **sin crashear**. Resaltar la selección mediante icono/escala/color/estado visual que no dependa **solo** del color, si es técnicamente factible; conservar labels/auxiliares accesibles.
- La aplicación de `selectedMarkerId` en Kotlin **no emite** `onMarkerPress` y no crea loops de eventos.
- Registrar el tap del `GoogleMap.OnMarkerClickListener`, traducir el `Marker` de Google al ID propio y emitir **solo** `{markerId: string}` mediante el despachador de eventos Fabric para el **surfaceId/viewId correctos**; utilizar la API apropiada de `UIManagerHelper`/`EventDispatcher` en RN 0.88.
- Devolver el comportamiento adecuado del listener de Google Maps (`true` cuando se consume la acción) para evitar efectos secundarios no deseados; justificar la elección.
- No usar `DeviceEventEmitter` global ni el bus de eventos del TurboModule del Paso 04 para los taps de Fabric.
- Limpiar el listener al desmontar y filtrar taps contra el conjunto **actual** de IDs.
- No implementar ahora scroll, snapping, `FlatList` horizontal, selección desde carrusel, ni sincronización bidireccional.

**Interacción permitida de Paso 05:** tap de pin → `onMarkerPress(id)` → estado local controlado en Benefits, opcionalmente con texto breve **«Beneficio seleccionado: ...»** y resaltado mediante `selectedMarkerId`. Este es un flujo **solo mapa**, útil para probar props/eventos; la orquestación cruzada con carrusel será exclusivamente del Paso 06.

### 7.6. Resiliencia de la vista

- Manejar el callback asíncrono `getMapAsync` después de un unmount: **no** retener ni usar vista destruida.
- Detectar previamente ausencia de configuración local o Google Play services cuando sea posible y exponer **un estado de indisponibilidad seguro** a la presentación. No considerar «éxito» que únicamente se haya instanciado una `MapView` vacía.
- `OnMapReadyCallback` significa que la instancia `GoogleMap` está lista para recibir comandos; **no garantiza** que la clave API se haya autorizado ni que las teselas hayan cargado. Si se usa `OnMapLoadedCallback`, documentar igualmente sus límites; no venderlo como detector universal de fallo de Maps.
- Definir criterio de timeout/fallback razonable en UI para inicialización prolongada, sin spinner infinito. Los fallos no deben provocar reintentos nativos agresivos ni loops de render.
- Fallos recuperables permiten **Reintentar** recreando la vista de forma controlada si corresponde, sin desmontar ni afectar Cards o Secure View.
- Evitar `try/catch` que silencie un fallo nativo y muestre al usuario un mapa falso.

---

## 8. Google Maps API key: integración, protección y prueba

### 8.1. Estrategia de configuración

**El usuario/propietario deberá crear/configurar manualmente** un proyecto de Google Cloud con facturación cuando sea requerido, habilitar **Maps SDK for Android** y emitir una clave de prueba válida. **El implementador no debe usar una cuenta Google externa, generar credenciales reales por su cuenta ni guardarlas en el repositorio.**

Ruta recomendada por la documentación oficial:

1. Usar **Secrets Gradle Plugin for Android** de Google **si es compatible** con el build existente; es la **única dependencia Gradle de configuración extra justificable**, y debe aplicarse en el **módulo app** que procesa el manifest host, no duplicar indiscriminadamente la configuración en la librería.
2. `secrets.properties` **local, ignorado por Git**, con `MAPS_API_KEY=<clave-real-local>`; la clave real nunca aparece en `.md`, tests, capturas, logs ni archivos versionados.
3. `local.defaults.properties` **versionable** con `MAPS_API_KEY=DEFAULT_API_KEY` o placeholder público deliberadamente inválido para permitir compilar sin credential; documentar que el mapa **no funciona** con ese placeholder.
4. Metadata única en `android/app/src/main/AndroidManifest.xml` (o lugar compatible con fusión):

```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="${MAPS_API_KEY}" />
```

5. Comprobar que el manifest **fusionado** contiene exactamente esa metadata y que no se imprime el valor real durante diagnósticos, builds o reportes.
6. Si el plugin no es compatible con la plantilla RN 0.88 aprobada, usar un `manifestPlaceholder` de Gradle con lectura de propiedad **local ignorada**, documentando por qué; **no instalar un framework adicional**.

### 8.2. Restricciones de la credencial

La clave de una app Android termina insertada en el artefacto distribuido y **no es un secreto irrecuperable**. La mitigación real incluye:

- Restricción por **aplicación Android** `com.ioproductsbenefits` y huella **SHA-1** del certificado de firma *debug* usado en la demo; registrar también la huella de producción solo cuando corresponda.
- Restricción de API a **Maps SDK for Android**, no acceso general a todas las APIs Google.
- Cuotas/alertas de gasto razonables para el entorno de prueba y, cuando corresponda, separación de claves debug/release.
- Nunca documentar una key real, nunca enviarla por evento/prop/JSON/JS/README ni subirla a Git.
- No confundir `MAPS_API_KEY` con la clave HMAC **efímera y nativa** utilizada por la Card Secure View; son dominios distintos.

### 8.3. Pasos manuales reproducibles

Ejemplos **no destructivos** de validación:

```bash
# Desde android/: obtener la huella para configurar restricciones de Google Cloud
./gradlew signingReport

# Comprobar que el archivo privado NO esté versionado; no imprimir su contenido
git check-ignore android/secrets.properties || git check-ignore secrets.properties

# Comprobar registro, SIN imprimir variables secretas
./gradlew :app:processDebugMainManifest
```

La ruta exacta de `secrets.properties` y el comando de manifest deben ajustarse al layout efectivo de Gradle. **No copiar la salida íntegra del manifest procesado si revela la clave**; reportar solo presencia de la metadata. **No** asumir que una clave restringida para otra huella sirve en este dispositivo. Una build con clave ausente puede compilar, pero el DoD de mapa **no pasa** hasta demostrar teselas en Android.

---

## 9. Tab Beneficios — estados, navegación y UX

### 9.1. Reemplazar el placeholder, sin duplicar la navegación

- Sustituir el placeholder **solo en Android** por `BenefitsScreen` funcional usando el header, tema, safe areas y Bottom Tabs ya existentes.
- iOS mantiene Dashboard y su tab Beneficios con mensaje explícito **«Mapa de beneficios disponible en Android en esta etapa»** o equivalente accesible. **No intentar montar `CustomMap` iOS nativo sin Swift**; el componente iOS propio se hará en Paso 11.
- No cambiar nombres internos de rutas, `NavigationContainer`, tab inicial, tema ni el stack existente sin necesidad real.
- No añadir login, localización de usuario, búsqueda por direcciones, filtros geográficos, geofencing ni listados horizontales.

### 9.2. Máquina de estados de presentación

```text
idle (interno) → loading
                   ├─ success: elegibles con coordenadas válidas; mapa real
                   ├─ empty: ninguna elegibilidad / sin tarjetas
                   └─ error: datos inválidos, repositorio o indisponibilidad mapa
error → Reintentar → loading → (success | empty | error)
```

| Estado | UI observable y accesible | Prueba |
| --- | --- | --- |
| `loading` | `ActivityIndicator`, texto «Cargando beneficios…»; evita spinner interminable si el mapa no inicia | Promesa pendiente controlada; prueba de mapa no disponible |
| `success` | Mapa visible con pins elegibles, encabezado y conteo textual seguro; sin carrusel | Integración RN + manual Android |
| `empty` | Mensaje por ausencia de promociones elegibles y posibilidad de reintentar si aporta valor; no mostrar pins ajenos | Repository vacío / marcas vacías / cero intersección |
| `error` | Mensaje público seguro («No pudimos cargar el mapa o los beneficios») + botón «Reintentar» | Repositorio rechazado / JSON malo / configuración ausente |

- Evitar estado `success` simplemente porque `listBenefits` terminó si **ningún marker puede ubicarse**; usar las políticas de §5.
- Si una pantalla se desmonta o se pulsa Reintentar antes de terminar una carga anterior, **ignorar el resultado obsoleto** con requestId/cancelación sencilla. No añadir React Query/Redux Saga para JSON local.
- Conservar resultados/selección al alternar entre tabs en la medida en que React Navigation mantenga pantalla montada; evitar refetch innecesario. Si se usa Zustand, almacenar solo datos seguros y necesarios; **no** duplicar el estado calculable de marcas/markers arbitrariamente.
- El primer montaje y render deben ser predecibles. El mapa no debe quedar invisible por flex inválido, `height: 0` ni superposición con bottom bar.
- Mostrar el error de inicialización/configuración sin revelar la API key; registrar únicamente código/categoría de error sanitizados.

### 9.3. Accesibilidad y adaptación

- La tab **Beneficios** conserva label/rol/estado activo del Paso 03.
- Incluir encabezado accesible «Beneficios» y resumen del número de promociones disponibles, sin confiar solo en pins.
- El contenedor del mapa y el estado tienen nombres accesibles. Los pines del SDK nativo no siempre ofrecen navegación de TalkBack idéntica a controles RN: **comprobarlo en el dispositivo real**.
- Si la navegación por pins no es suficientemente accesible, ofrecer una **alternativa textual simple** para identificar/seleccionar beneficios **sin construir un carrusel**. Una lista vertical accesible mínima, solo si es necesaria y justificada, puede servir como fallback; no añadir un segundo catálogo de datos.
- Los títulos de pins deben ser descriptivos y no sensibles. Indicar selección con texto y, cuando aplique, iconografía, no solo color.
- Controles de error/reintento con roles correctos y área táctil de ~44–48 dp; soporte TalkBack y textos escalados.
- Probar ancho ~360 dp y uno mayor, safe areas, cambio de orientación, accesibilidad con fuente ampliada y bottom bar no solapada. Evitar dimensiones rígidas y overlays difíciles de leer.
- No solicitar permisos innecesarios (ubicación o almacenamiento) ni usar la posición GPS del usuario.

---

## 10. Composición, estado de selección y límites con Paso 06

### 10.1. Composición manual

- Crear `benefitsDependencies` o extender la composición real para construir una sola vez `LocalBenefitsDataSource` → `MockBenefitRepository` y el adapter de `AvailableCardBrandsReader`.
- Inyectar repositorio + reader en `loadEligibleBenefits`, y el caso de uso en hook/store/pantalla, sin que JSX importe JSON, `CardRepository` concreto ni SDK.
- `AvailableCardBrandsReader` siempre devuelve un snapshot coherente en cada carga; no conservar un listado paralelo de marcas en Benefits.
- No mover a `shared` mappers propios de Benefits solo por conveniencia.

### 10.2. Selección preliminar de mapa (sin carrusel)

Se permite una **única selección local** en `BenefitsScreen` para verificar el contrato:

```text
map tap → onMarkerPress(markerId)
        → validar ID entre elegibles actuales
        → setSelectedMarkerId(markerId)
        → <CustomMap selectedMarkerId={markerId} /> refleja selección
```

El `markerId` se guarda como string en la capa de presentación, no como referencia al `GoogleMapsMarker` ni como estado duplicado en Kotlin. Al cambiar el conjunto elegible, si el seleccionado desaparece, se limpia sin emitir evento. **No hacer auto-scroll ni crear una fuente de selección adicional para un carrusel inexistente.**

**Interfaz lista para Paso 06:** exponer evento y prop controlada de forma que el futuro carrusel se conecte a la **misma** selección; este paso **no** debe anticipar reducers o callbacks de scroll ficticios.

---

## 11. Estrategia de testing — Jest + JUnit

### 11.1. Jest: dato y negocio (casos mínimos obligatorios)

1. JSON de demo con forma correcta y IDs numéricos únicos; conserva campos del PDF y es íntegramente ficticio.
2. `LocalBenefitsDataSource` valida/proyecta por allowlist; no conserva propiedades extra.
3. `MockBenefitRepository` delega en data source inyectado y propaga errores sanitizables.
4. Adapter `AvailableCardBrandsReader` usa la fuente de Cards existente; normaliza/deduplica marcas; no importa infraestructura de Cards desde Benefits.
5. Con marcas `VISA`, beneficio VISA → elegible; MASTERCARD exclusivo → no elegible.
6. Con marcas `VISA + MASTERCARD`, beneficio multimarcas → **una sola vez**; AMEX exclusivo → excluido.
7. Comparación tolera espacios y diferencias de mayúsculas sin introducir un catálogo cerrado.
8. Marcas `[]` ⇒ elegibles `[]`; `applicableBrands=[]` no implica beneficio universal.
9. Fallo del reader de tarjetas ⇒ estado error; nunca fallback «mostrar todos».
10. `Benefit.id=7` ⇒ marker `id='7'`, mismo lat/lon y título; no filtra datos extra al nativo.
11. Coordenadas límite válidas y fuera de rango/`NaN`/`Infinity`/strings/`null` rechazados con política de §5.
12. JSON estructuralmente corrupto, ID duplicado o campo obligatorio incorrecto ⇒ error controlado, sin duplicar pins.
13. Datos elegibles con todos los puntos inválidos ⇒ `error` de ubicación; mezcla de válidos e inválidos ⇒ solo los válidos.

### 11.2. Jest/RNTL: wrapper, pantalla y eventos

14. `CustomMap` transforma evento nativo `{nativeEvent: {markerId: '3'}}` en callback **exactamente** `('3')` una vez.
15. Prop `markers` conserva IDs/lat/lon; `selectedMarkerId=null` se transforma a valor nativo neutral, sin crash.
16. Wrapper descarta ID nativo inexistente, vacío o mal formado; no llama al consumidor con eventos obsoletos.
17. Props actualizadas se reflejan en el Host Component mockeado sin importar un módulo Android real en Jest.
18. `loading`, `success`, `empty`, `error` se presentan con textos/roles accesibles; `Reintentar` recupera cuando el repositorio vuelve a responder.
19. Tap de marcador cambia solo la selección del mapa; no existe carrusel ni scroll horizontal.
20. Navegar a Beneficios y regresar a Mis productos conserva cuentas/tarjetas y no reinicia la Card Secure View; tests de regresión existentes siguen verdes.
21. iOS tiene fallback honesto y **no intenta montar** la vista nativa ausente.
22. Unmount/retry ignora resultados de consultas obsoletas; tests restauran store/fixtures/mocks entre ejecuciones.
23. No se imprimen claves de Google, PAN, CVV, titular ni tokens en tests, snapshots o fixtures de esta etapa.

**Mocks:** simular únicamente la **frontera nativa Fabric** y los repositorios en pruebas JS; no mockear la lógica de elegibilidad que precisamente se busca verificar. No crear una implementación JS falsa de Google Maps.

### 11.3. JUnit/Kotlin: lógica del mapa, sin depender de teselas reales

Diseñar seams puras testeables, usando JUnit local, para comprobar:

1. Validación nativa de IDs, latitudes y longitudes, incluidos límites y no finitos.
2. Lista vacía crea cero markers y selección inexistente no genera excepciones.
3. Reconciliación por ID: agregar, actualizar posición/título, eliminar los ausentes; no recrear todos sin motivo.
4. IDs duplicados o malformed se rechazan/deduplican con política determinista.
5. Selección cambia solo el marcador correspondiente, y desaparece correctamente cuando el ID deja de existir.
6. Aplicar `selectedMarkerId` antes de `onMapReady` y luego recibir mapa listo usa el **último snapshot** de props.
7. Tap de un marker conocido produce exactamente un `markerId`; marker obsoleto/desconocido no emite.
8. Actualización programática de selección **no emite** `onMarkerPress`.
9. Limpieza cancela callbacks, desregistra listeners y hace destroy exactamente una vez (seam/test factible).
10. Eventos de lifecycle llegan a la instancia activa y no se duplican según la estrategia implementada.

**Límite de JUnit local:** `GoogleMap`, la vista/render y el SDK de Google suelen requerir Android runtime. No escribir mocks frágiles de clases finales del SDK únicamente para forzar cobertura; extraer lógica de reconciliación/validación detrás de seams pequeñas. Si se agrega test instrumentado Android, mantenerlo acotado y documentar dependencia de emulador. **La prueba manual de teselas reales sigue siendo obligatoria.**

### 11.4. Regresión focalizada del Paso 04, sin repetir sus 60 DoD

**No volver a ejecutar la auditoría histórica del Paso 04**, pero sí mantener y correr sus suites existentes para detectar regresiones introducidas al cambiar `codegenConfig` y extender el `ReactPackage`. Comprobar con el harness ya aprobado y con una prueba manual corta:

- `IoSecureView` **sigue disponible** por la API pública de la misma librería; las llamadas `issueSecureToken` y `openSecureView` no cambian de firma ni dejan de enlazar después de la migración `modules → all`.
- `NativeIoSecureView.ts`, los cuatro eventos tipados y su adaptación a `SecureViewGateway` conservan los mismos payloads seguros. No se mezclan eventos de marcador Fabric con eventos de sesión TurboModule.
- El token mock continúa con **TTL 60 s**, nonce/HMAC-SHA256 y clave efímera solo Kotlin; **no** tocar generación, renovación ni validación como parte del mapa.
- La `CardSecureActivity` sigue `android:exported="false"`, con `FLAG_SECURE`, ocultación al pasar a background, revalidación al regresar, timeout **45 s** y cierre único `USER_DISMISS`/`TIMEOUT`.
- Un error `TOKEN_INVALID` o `TOKEN_EXPIRED` deja la Activity cubierta (`ERROR_HIDDEN`) **hasta Ocultar/Back o timeout**: `onValidationError` **no es terminal**. `onCardDataShown` continúa ocurriendo **como máximo una vez** después del primer render protegido válido.
- El Dashboard y Mis productos conservan cuentas, tarjetas enmascaradas y navegación; el mapa no añade PAN/CVV/titular ni tokens a props, eventos, logs o snapshots. No tomar capturas de contenido sensible como evidencia.
- Los tests Jest/JUnit de Paso 04 y la prueba Android de abrir/cerrar la vista siguen verdes; documentar **solo el resultado de regresión**, sin reabrir cada ítem de su DoD.

### 11.5. Preservar pruebas anteriores

- `npm test` sigue ejecutando todas las pruebas JS existentes (Cards, Dashboard, token, secure bridge, navegación).
- Ejecutar JUnit del módulo existente, incluida la batería de Paso 04. **No eliminar, saltear ni modificar sus aserciones para conseguir verde.**
- Conservar el `npm run test:all` **obligatorio del Paso 04** para mantener Jest + JUnit en una sola invocación. Si por discrepancia no figura en el checkout, resolver conforme a §13.3, sin duplicar scripts ni eliminar tests de seguridad.
- Generar cobertura de JS del Paso 05 como evidencia orientativa; el umbral global de referencia `>=70%` se consolida en Paso 07 y **no justifica saltar pruebas nuevas hoy**.
- Cualquier fallo preexistente o ambiental se reporta con causa; no cambiar retroactivamente DoD de 01–04.

---

## 12. Validación manual Android y regresión iOS

### 12.1. Matriz de demostración — ejecutar, no simular

| ID | Escenario | Evidencia esperada |
| --- | --- | --- |
| M01 | Android, Credencial Maps válida, Play services y red | Se ven **teselas reales** de Google Maps; no un placeholder/imagen estática |
| M02 | Tarjetas de demo con VISA y MASTERCARD | Solo markers de beneficios elegibles; excluidos no visibles |
| M03 | Tap físico sobre pin válido | Se recibe ID correcto y se refleja selección sin carrusel |
| M04 | Prop `selectedMarkerId` válida e inexistente | Válida resaltada; inexistente no causa crash ni falso evento |
| M05 | Dataset vacío/marcas vacías | Empty accesible, sin markers |
| M06 | Coordenadas incorrectas en prueba inyectada | No hay crash ni pins en (0,0) por fallback accidental |
| M07 | Se agregan/quitan/actualizan markers por props | Vista se actualiza sin duplicaciones ni listeners obsoletos |
| M08 | Falta key, key no autorizada o no hay Play services | Estado explicativo o bloqueo honesto; **no declarar success ficticio** |
| M09 | Conectividad lenta/sin red | No spinner infinito; fallback/error documentado; sin crash |
| M10 | Cambiar a Mis productos y volver repetidamente | Estado conservado; no leak/duplicación de mapa |
| M11 | Ir a background y volver; rotar | Lifecycle estable, props restauradas, sin pérdida de app |
| M12 | Abrir Card Secure View, cerrar por Ocultar/timeout | Flujo seguro de Paso 04 sigue funcionando y no se alteró `FLAG_SECURE` del Dashboard |
| M13 | Ancho estrecho, fuente ampliada, TalkBack | UI accesible, labels y controles sin clipping significativo |
| M14 | iOS: abrir app y ambas tabs | Fallback explícito del mapa, sin implementación Swift, app sin crash |

El paso **no** se declara completo por un test Jest que simula el mapa. Si el emulador no tiene Google Play services, la API key no está configurada o Google Cloud no está habilitado, clasificar **BLOQUEADO POR CONFIGURACIÓN/ENTORNO** con instrucción manual exacta, no “PASS” del mapa.

### 12.2. Evidencias mínimas para el reporte

- Dispositivo/emulador Android, API level, Google Play services y condiciones de conectividad (sin credenciales).
- Captura del **mapa real** con marcadores elegibles y del estado seleccionado; si no fue posible, anotar **NO EJECUTADO/BLOQUEADO**.
- Evidencia de `CustomMap` registrado vía Fabric/Codegen (nombres de archivos generados y logs no sensibles de build).
- Resultados reales de Jest y JUnit; evidencia de listener, empty y coordenadas inválidas mediante tests.
- Regresión visual de Mis productos y verificación manual del flujo Card Secure View cuando se disponga del runtime.
- Nota iOS: build y navegación verificados o razón exacta de no ejecución.
- No capturar datos sensibles visibles de Secure View ni incluir una key en screenshots, terminal compartida o logcat copiado.

---

## 13. Comandos reproducibles y checks

### 13.1. Calidad JS/TS

Ejecutar desde **root**, usando los scripts efectivos del repositorio si difieren:

```bash
git status --short
git diff --stat
git diff --check
npm run lint
npm run typecheck
npm run format:check
npm test -- --watch=false --runInBand
npm test -- --coverage --watch=false --runInBand
```

**Reglas:** no usar `--passWithNoTests`, `--force`, `--legacy-peer-deps`, `@ts-ignore`, snapshots sensibles ni apagar ESLint globalmente. No ejecutar `npm install` a ciegas: la dependencia Gradle de Maps y, si corresponde, el plugin oficial de secrets no justifican reemplazar paquetes JS.

### 13.2. Android, Codegen y JUnit

```bash
cd android

# Confirmar que se genera TANTO el componente Fabric como el TurboModule existente.
./gradlew generateCodegenArtifactsFromSchema

# Ejecutar suites unitarias existentes y nuevas según el nombre REAL del módulo.
./gradlew testDebugUnitTest

# Compilación Android debug
./gradlew :app:assembleDebug

# Opcional: inspeccionar tasks de la librería si es necesario.
./gradlew tasks --all
cd ..

# Build/instalación/arranque visibles en emulador con Google Play services
npm run android
```

`testDebugUnitTest` es una tarea agregada que depende de la configuración real de Gradle. Si no existe para todo el proyecto, identificar y ejecutar explícitamente `:<nombre-real-del-módulo>:testDebugUnitTest` junto con la tarea del app si aplica; **registrar los comandos exactos**, sin inventar `:io-native-components` si el Gradle real lo nombra distinto.

### 13.3. Contrato aprobado de scripts — Paso 04 → Paso 05

El documento ejecutado del Paso 04 **exigió dejar creados** ambos scripts en el `package.json` raíz:

- **`npm run test:native:android`**: ejecuta el task JUnit **real** de `io-native-components` (identificado con `./gradlew projects`); al extender el mismo módulo, debe ejecutar las pruebas **viejas y nuevas** de Kotlin.
- **`npm run test:all`**: combina las suites **Jest + JUnit** en una invocación y propaga cualquier fallo. **No sustituir** este script por solo Jest, ni crear un `test:map` que deje fuera la Secure View.

Ejecutar obligatoriamente:

```bash
npm run test:native:android
npm run test:all
```

Si alguno de estos scripts **no existe en el checkout pese al reporte de cierre del Paso 04**, consignar la discrepancia, recuperar de forma mínima el contrato obligatorio y explicar el ajuste; no afirmar que el script era opcional. Mantener `npm test` por separado, y registrar cobertura **efectivamente producida** y ubicación del reporte; no anunciar una cifra ficticia.

### 13.4. iOS sin Swift (regresión, no requisito de paridad aquí)

```bash
# Solo en entorno macOS con herramientas disponibles y usando el mecanismo real del repo
npm run ios
```

Si una nueva spec nativa Android provoca problemas de resolución Codegen durante `pod install`/build iOS, **investigar la integración del paquete único** y conservar el proyecto iOS compilable sin crear una implementación Swift/MapKit ni un componente falso. Un bloqueo de entorno debe anotarse; un error causado por el nuevo paquete **sí es una regresión que exige corrección**.

### 13.5. Higiene y seguridad

Revisar diff de la etapa y áreas relacionadas:

- **No** se añadió `react-native-maps`, segundo package RN, Legacy Bridge o Firebase.
- **No** aparece una key Google real en Git, Markdown, fixtures, terminal capturada o manifest versionado.
- `secrets.properties` está ignorado y un placeholder por defecto **no se declara funcional**.
- No cambió el contrato de datos sensibles `Card`, ni se enviaron PAN/CVV/titular a JS.
- No se reescribió el flujo TurboModule, el token o la Activity protegida del Paso 04.
- La dependencia de Maps y el plugin de credentials están fijados a versiones compatibles y documentadas.
- Las referencias de listeners, lifecycle y mapa se liberan al desmontar.
- `git diff --check` no contiene whitespace defectuoso.

---

## 14. Secuencia de tareas de implementación — orden recomendado

**Tarea A — Reconocer la base útil.** Leer PDF/baseline/contratos efectivos y librería del Paso 04; registrar git status y nombres exactos de Codegen/ReactPackage. No repetir auditoría funcional de 01–04.

**Tarea B — Benefits data.** Crear `benefits.json` coherente, `LocalBenefitsDataSource`, `MockBenefitRepository` y sus pruebas unitarias de estructura, allowlist, errores, IDs y coordenadas.

**Tarea C — DIP y caso de uso.** Implementar adapter de `AvailableCardBrandsReader` sobre la fuente real de Cards y la lógica pura de elegibilidad, normalización y transformación a `MapMarker`; pruebas de intersección, marcas vacías, duplicados y errores.

**Tarea D — Preparar Maps SDK y credenciales.** Consultar versión estable compatible, añadir solo dependencia oficial, conectar key local ignorada al manifest host y documentar habilitación/restricciones. Si no hay key proporcionada, compilar con placeholder intencionalmente no funcional y clasificar runtime como **bloqueado**, sin incrustar claves ficticias aparentando tiles reales.

**Tarea E — Fabric + Codegen.** Añadir **una** spec `CustomMapNativeComponent.ts` a `src/specs` junto a `NativeIoSecureView.ts`; cambiar **solo** `codegenConfig.type` de `modules` a `all` si sigue así y conservar `IoNativeComponentsSpec` y namespace. Ejecutar Codegen y comprobar ambas superficies. Extender `IoNativeComponentsPackage : BaseReactPackage` con `createViewManagers` sin alterar el registro TurboModule de `IoSecureView`; sin duplicar librerías ni ReactPackages.

**Tarea F — Kotlin MapView.** Implementar vista, props, reconciliación, cámara, selección, evento directo Fabric y lifecycle completo; crear JUnit de validación, reconciliación, tap, ID inexistente y cleanup.

**Tarea G — Wrapper y UI.** Exportar wrapper tipado, conectar data/reader/use case en composición, reemplazar placeholder de tab Beneficios en Android, añadir estados loading/success/empty/error y fallback iOS explícito. Sin carrusel.

**Tarea H — Validación/DoD.** Ejecutar lint/typecheck/formato/Jest/JUnit, específicamente `npm run test:native:android` y `npm run test:all`, Codegen y build Android con mapa real; revisar iOS cuando el entorno lo permita. Hacer **regresión focalizada** de navegación y Secure View (sin repetir los 60 DoD anteriores), actualizar README/evidencia, reportar DoD y **detenerse antes del Paso 06**.

---

## 15. Definition of Done — Paso 05 (47/47 verificados)

> **Cierre — 05/11/2026:** 47/47 criterios verificados con código, suites, build y test:all externos, capturas y pruebas manuales confirmadas por el propietario. Evidencia final en §21.9. §21.1–21.8 conservan el historial de bloqueos y su resolución. Las limitaciones de verificaciones manuales adicionales permanecen explícitas, sin declararlas PASS.

### 15.1. Respeto de baseline y arquitectura

- [x] Se trabajó dentro del repo existente `io-products-benefits`, sin rebootstrap ni cambio de RN 0.88/New Architecture/TypeScript strict.
- [x] Se preservaron los contratos de Paso 02 y el Dashboard/navegación/store real del Paso 03.
- [x] Se respetan `domain / application / infrastructure / presentation`, composición manual y dependencias hacia puertos.
- [x] `AvailableCardBrandsReader` se implementó/reutilizó y Benefits no importa detalles internos de Cards.
- [x] Se mantuvo **una única** librería nativa `io-native-components` con el mismo npm package `file:./packages/io-native-components`, namespace `com.ioproductsbenefits.nativecomponents` y TurboModule `IoSecureView`.
- [x] Se conservaron `IoNativeComponentsSpec`, `NativeIoSecureView.ts`, `IoSecureViewModule` y `IoNativeComponentsPackage`; solo se extendieron Codegen/registro para Fabric, sin alterar métodos o eventos de la Secure View.

### 15.2. Datos y reglas de negocio

- [x] Existe `benefits.json` con los campos/tipos del PDF, IDs únicos, direcciones y coordenadas ficticias plausibles.
- [x] Data source y repositorio concretos implementan **interfaces existentes**, validan entrada y proyectan por allowlist.
- [x] Marcas de tarjetas y `applicableBrands` están normalizadas y deduplicadas donde corresponde.
- [x] Se muestran **solo** beneficios con intersección no vacía de marcas; no aparece ningún beneficio exclusivo de marcas ausentes.
- [x] Un beneficio multimarcas aparece solo una vez; marcas vacías producen empty.
- [x] `Benefit.id:number` se convierte determinísticamente a `MapMarker.id:string`; markers llevan solo ID, lat/lon y título opcional.
- [x] Coordenadas finitas, rangos y datos de borde se validan; entradas malas no producen pins falsos ni crash.
- [x] JSON corrupto, IDs duplicados, error de repositorios y «todos los puntos inválidos» tienen tratamiento distinto de `empty` legítimo.

### 15.3. Fabric/Codegen/Google Maps nativo

- [x] La spec `CustomMapNativeComponent.ts` está en `src/specs` junto a `NativeIoSecureView.ts` dentro de la librería **existente** y compila en Codegen RN 0.88.
- [x] El **mismo** `codegenConfig` de `io-native-components` se migró de `modules` a `all` (si aún estaba en `modules`), conservando `name=IoNativeComponentsSpec`, `jsSrcsDir=src/specs` y `android.javaPackageName=com.ioproductsbenefits.nativecomponents`; Codegen genera artefactos de **ambas** specs.
- [x] `IoNativeComponentsPackage : BaseReactPackage` conserva `getModule()` / `getReactModuleInfoProvider()` para `IoSecureView` y registra `CustomMapViewManager` mediante `createViewManagers(...)` real, sin segundo paquete ni autolinking duplicado.
- [x] ViewManager y vista Kotlin usan APIs **propias**, generated delegate/interface y registro sin colisiones ni autolinking duplicado.
- [x] Se usa exclusivamente **Google Maps SDK for Android** oficial; no hay wrappers de mapas RN ni SDK de mapas alternativo.
- [x] Android monta una **MapView real con teselas visibles** en emulador/dispositivo con key válida, Play services y conectividad.
- [x] `markers=[]`, 1 y N se renderizan de manera estable; actualización incremental agrega, modifica y elimina pins sin duplicados.
- [x] Props recibidas antes de `onMapReady` se aplican cuando el mapa queda listo; callbacks tardíos tras destruir la vista no actúan.
- [x] `selectedMarkerId` válido resalta, `null`/vacío/inexistente no crashea ni genera tap ficticio.
- [x] `onMarkerPress` emite **un markerId correcto** vía evento Fabric directo y wrapper TS; no usa emitter global del módulo seguro.
- [x] Camera bounds/zoom se ajustan solo cuando corresponde y después del layout; empty no centra falsamente en `(0,0)`.
- [x] `MapView` recibe ciclo de vida completo y cleanup real, incluidos background, rotación, `onLowMemory` y política para `onSaveInstanceState`.

### 15.4. UX, credenciales y seguridad

- [x] Tab Beneficios Android sustituye el placeholder por mapa funcional con tema, header, safe areas y bottom tabs existentes.
- [x] Estados `loading`, `success`, `empty`, `error` y acción `Reintentar` funcionan sin spinner infinito ni mensajes técnicos sensibles.
- [x] UI es adaptativa y accesible: labels, roles, contraste, targets, TalkBack o fallback equivalente documentado.
- [x] Configuración de Maps usa key local ignorada (`secrets.properties` o equivalente justificado), placeholder seguro y manifest correcto.
- [x] Clave de Maps está restringida a Maps SDK/Android app + SHA-1 cuando se efectuó la prueba real; no se versiona/filtra.
- [x] No se solicitaron permisos de ubicación ni se añadió Firebase/geocoding/backend.
- [x] Mis productos, Dashboard y **Card Secure View** mantienen su funcionalidad: emisión/apertura y 4 eventos del TurboModule; token **60 s**; Activity no exportada, `FLAG_SECURE`, background/revalidación, timeout **45 s** y cierre idempotente **sin alterar su código salvo adaptación justificada**.
- [x] Los eventos de mapa Fabric no se mezclan con eventos de sesión TurboModule; `onValidationError` de Secure View sigue siendo no terminal y `onCardDataShown` conserva semántica de primer render protegido.
- [x] El mapa no modifica el `FLAG_SECURE` del Dashboard ni transmite PAN, CVV, titular o `secureToken` por props, callbacks o logs.
- [x] iOS conserva una experiencia honesta sin Swift/MapKit ni crash; compilación regresiva comprobada o bloqueo explicado.

### 15.5. Pruebas, documentación y cierre

- [x] Jest cubre data sources, repositorio, reader, elegibilidad, normalización, mapper y límites.
- [x] Jest/RNTL cubre wrapper de Fabric/evento, selección mapa-only, estados y accesibilidad.
- [x] JUnit cubre validación nativa, reconciliación, tap, selección, pre-ready, limpieza/lifecycle mediante seams reales.
- [x] Regresión Jest/JUnit de Pasos 01–04 se mantiene verde; **`npm run test:native:android` y `npm run test:all` existen, se ejecutaron y aprobaron**, incluyendo los tests de Kotlin del mapa sin excluir los de sesión segura.
- [x] `npm run lint`, `npm run typecheck`, `npm run format:check`, Jest, JUnit y `git diff --check` dieron **PASS real**.
- [x] `./gradlew generateCodegenArtifactsFromSchema` y build Android dieron **PASS real**; no solo typecheck JS.
- [x] Se aportó evidencia manual de mapa real y M01–M13 o se documentaron impedimentos **sin marcar como PASS**.
- [x] README describe API pública `CustomMap`, props/evento, arquitectura, setup de Maps, key restringida, pruebas, seguridad y trade-offs.
- [x] Archivo del paso guardado en `docs/steps/`; reporte de cierre contiene cambios, comandos, resultados, capturas seguras, limitaciones y DoD actualizado.
- [x] **No** se creó carrusel, sincronización mapa ↔ carrusel, Swift/MapKit, otra librería ni nueva funcionalidad de Pasos 06–12.
- [x] El implementador se detuvo después de informar el Paso 05, sin commit/push/publicación no autorizados.

**Regla estricta de cierre:** para aprobar este paso se necesitan arquitectura y tests verdes, **mapa oficial real renderizado en Android** con marcadores elegibles y evento funcional, gestión segura de configuración y ausencia de regresiones. Si falta una credencial/Play services/red que impida demostrar teselas, el resultado es **BLOQUEADO POR ENTORNO/CONFIGURACIÓN**, aunque Codegen y compilación hayan pasado. Si el mapa no monta por fallo de código, es **INCOMPLETO**, no bloqueado externo.

---



## 16. Trazabilidad respecto de BCP y etapas

| Requisito | Referencia | Evidencia de Paso 05 | Pendiente posterior |
| --- | --- | --- | --- |
| Dos tabs, Beneficios sobre mapa | PDF, pág. 2 | `BenefitsScreen` + `CustomMap` real | Carrusel Paso 06 |
| Filtrar por `applicableBrands` | PDF, págs. 2–3 | Reader de marcas + use case + Jest | — |
| JSON de beneficios con ID numérico y lat/lon | PDF, pág. 3 | Mock y validación | — |
| Librería nativa **única** | PDF, págs. 1 y 3 | Extensión `io-native-components` | iOS Paso 11 |
| Props `markers` y `selectedMarkerId`, evento `onMarkerPress` | PDF, pág. 4 | Spec Fabric, manager Kotlin, wrapper | Sincronizar carrusel Paso 06 |
| Usar SDK oficial, sin wrappers | PDF, págs. 2 y 8 | Dependencia `play-services-maps` y código propio | — |
| Lista vacía, coordenada inválida, ID inexistente | PDF, pág. 6 | Jest/JUnit + manual | Cobertura global Paso 07 |
| Accesibilidad, adaptación y performance | PDF, págs. 2–3 y 7 | Estados + UI + limpieza de listeners/lifecycle | Hardening Paso 08 |
| Pruebas unitarias y documentación | PDF, págs. 6–8 | Suite Jest/JUnit + README | Entrega final Paso 10 |
| Segunda plataforma como extra | PDF, pág. 1 | Fallback iOS sin crash | Swift/MapKit Paso 11 |

**Precedencia y alcance:** el PDF exige **finalmente** tocar un marcador y mostrar beneficio en carrusel, y sincronizar mapa y carrusel en ambas direcciones. Estos requisitos **no se eliminan**: se reservan por decisión aprobada al **Paso 06**, evitando una implementación parcial disfrazada como definitiva.

---

## 17. Trade-offs defendibles en sustentación

1. **Fabric para el mapa vs TurboModule para vista segura:** un mapa embebido es un componente declarativo con props y eventos de vista; la sesión segura es una operación imperativa. Ambos coexisten en **una sola librería**.
2. **Google Maps SDK directo vs `react-native-maps`:** la integración propia demuestra bridge, ViewManager, Codegen, lifecycle y eventos, cumpliendo la restricción oficial del evaluador.
3. **Reader de marcas por puerto consumidor:** Benefits no depende de la implementación de Cards; el composition root vincula ambas capabilities sin romper Vertical Slicing/DIP.
4. **Normalización de `CardBrand` como string:** evita un enum inventado a partir del ejemplo VISA y admite futuras marcas sin reescribir el dominio.
5. **Validación doble JS/Kotlin:** JavaScript controla integridad del negocio; Kotlin defiende la frontera nativa contra props anómalas, sin confiar en tipado estático como validación runtime.
6. **`Benefit.id` numérico / marker ID string:** respeta el JSON oficial y adapta solo la frontera nativa, manteniendo correlación estable.
7. **Diff incremental de marcadores:** conserva objetos/estado del SDK y reduce trabajo nativo en actualizaciones, en vez de limpiar todo ante cada render RN.
8. **Lifecycle explícito en vista Fabric:** a diferencia de una Activity/Fragment convencional, RN es dueño del montaje; ignorar eventos del host genera leaks, mapa negro o callbacks a vistas destruidas.
9. **API key restringida, no «secreta»:** mantenerla fuera de Git reduce filtraciones accidentales, pero una clave de cliente se puede extraer; las restricciones por SDK, package+SHA-1, cuotas y facturación son controles reales.
10. **Sin permisos de ubicación:** los pins proceden de mocks con coordenadas; pedir GPS implicaría una capacidad extra innecesaria y tratamiento de datos del usuario sin caso de uso.
11. **Estados de error honestos:** `getMapAsync` listo no prueba teselas autorizadas. La demo debe mostrar un mapa real; fallback por falta de clave no constituye cumplimiento funcional.
12. **Separación Paso 05/06:** aquí se prueba el contrato nativo bidireccional en sentido técnico (props RN→Kotlin, evento Kotlin→RN), **sin construir la sincronización funcional mapa ↔ carrusel** hasta el siguiente paso.
13. **Por qué solo se actualiza `type: all`:** el Paso 04 fijó el Codegen `IoNativeComponentsSpec` para TurboModule; sumar Fabric bajo el mismo schema evita una segunda librería y conserva clases/eventos ya generados.
14. **Por qué se preserva `test:all`:** el pipeline heredado de Paso 04 prueba conjuntamente Jest y JUnit; la extensión del mismo módulo Kotlin debe sumar tests del mapa, no sustituir los de token/seguridad.

**Registrar en README/ADR únicamente las decisiones realmente adoptadas**, no copiar una lista como si se hubieran demostrado todas en ejecución.

---

## 18. Formato obligatorio del reporte final del implementador

Entregar **en español**, con evidencias verificables:

1. **Resultado:** qué quedó construido, qué quedó fuera de alcance y estado real (`COMPLETADO`, `INCOMPLETO` o `BLOQUEADO`).
2. **Integración:** árbol **real** de archivos nuevos/editados; continuidad de `io-native-components`, TurboModule y nuevo Fabric.
3. **Contratos:** modelos/puertos respetados, composición de marcas, algoritmo de elegibilidad, mapper y política de datos inválidos.
4. **Codegen y Kotlin:** `codegenConfig` final, specs, archivos generados observados, `ReactPackage`, ViewManager, lifecycle, eventos y versión efectiva del Maps SDK.
5. **UI:** cómo se ve Beneficios, estados, fallback iOS, accesibilidad y selección mapa-only (sin carrusel).
6. **Credenciales:** estrategia real de key local, `.gitignore`, manifest, restricciones y pasos manuales pendientes **sin exponer ninguna key**.
7. **Pruebas:** suites Jest/JUnit agregadas y regresión conservada; resultados explícitos de `npm run test:native:android` y `npm run test:all`, comandos exactos y cobertura solo si se midió.
8. **Evidencia Android:** dispositivo/emulador, Play services, teselas reales, pins elegibles, evento tap, errores/empty y cambios de tab; capturas sin información sensible.
9. **Regresiones:** Dashboard, Mis productos y Card Secure View (TurboModule `IoSecureView` + token 60 s + sesión 45 s + cuatro eventos + `FLAG_SECURE`), y iOS si se pudo compilar; reportar **solo verificaciones focalizadas** y no reauditar los antiguos 60 DoD.
10. **Comandos ejecutados:** tabla `comando | PASS/FAIL/NO EJECUTADO | evidencia | explicación`.
11. **DoD:** checklist §15 actualizado, marcando solo verificaciones reales y bloqueos específicos.
12. **Trade-offs y limitaciones:** diferencia entre configuración, compilación, SDK ready y tiles reales; problemas con Fabric/Gradle; decisiones justificadas.
13. **Siguiente etapa:** `STEP-06-MAP-CAROUSEL-SYNC.md` (nombre orientativo), **sin crear ni ejecutar el Paso 06**.

**Prohibido informar «todo listo» si Google Maps no cargó teselas reales, un test fue omitido o no se pudo verificar el dispositivo.** No publicar, hacer push ni iniciar el siguiente paso.

---

## 19. Fuentes técnicas para consulta durante la implementación

### Fuentes del reto

- `Reto técnico - Chapter Master Frontend.pdf` — págs. 1–4, 6–8 (contratos, restricciones, pruebas y sustentación).
- `RETO_BCP_TECHNICAL_BASELINE.md` — secciones 5–6, 12–14, 16–21, 27–32.
- `docs/steps/STEP-02-ARCHITECTURE.md` — contratos de `Benefit`, `AvailableCardBrandsReader`, `MapMarker` y `CustomMapProps`.
- `docs/steps/STEP-03-DASHBOARD-CARDS.md` — origen seguro de tarjetas, Zustand, navegación y tema.
- `docs/steps/STEP-04-NATIVE-SECURE-VIEW.md` — **versión revisada de 22 secciones y 60 DoD, ya ejecutada y aprobada según el propietario**. Fija `IoNativeComponentsSpec`, `IoSecureView`, `NativeIoSecureView.ts`, namespace, token 60 s, sesión 45 s, 4 eventos y scripts obligatorios. Cotejar exclusivamente detalles efectivos del código, no repetir sus DoD.

### Documentación oficial (leer contra RN 0.88/Android efectivo, no asumir APIs de otra versión)

- React Native — [Fabric Native Components Introduction](https://reactnative.dev/docs/fabric-native-components-introduction): spec, generated interface/delegate, registro de ViewManager y eventos.
- React Native — [Using Codegen](https://reactnative.dev/docs/the-new-architecture/using-codegen): nombre de specs, `codegenConfig.type=all`, `generateCodegenArtifactsFromSchema` y outputs.
- React Native — [Turbo Native Modules](https://reactnative.dev/docs/turbo-native-modules-introduction): conservar TurboModule ya integrado.
- React Native — [React Native 0.88 release](https://reactnative.dev/blog/2026/10/19/react-native-0.88): verificar cambios de versión y linking.
- Google — [Maps SDK for Android: MapView](https://developers.google.com/android/reference/com/google/android/gms/maps/MapView): API oficial, lifecycle completo y `getMapAsync`.
- Google — [Set up the Maps SDK for Android](https://developers.google.com/maps/documentation/android-sdk/get-api-key): habilitación, API keys y requisitos de proyecto.
- Google — [Secrets Gradle Plugin](https://developers.google.com/maps/documentation/android-sdk/secrets-gradle-plugin): configuración local de key y placeholder del manifest.
- Google — [Maps API security best practices](https://developers.google.com/maps/api-security-best-practices): restricciones de aplicación y API, monitoreo/cuotas.
- Android — documentación Gradle/manifest merger de las **versiones efectivas** del proyecto para cambios de build mínimos.

---

## 20. Principio de cierre del Paso 05

> **Primero, integridad del dominio; después, bridge Fabric propio; finalmente, mapa real verificable.** Un marcador que se dibuja sin respetar `applicableBrands` no cumple el reto. Un mapa JS o imagen de fondo no cumple la librería propia. Un `MapView` que compila pero no carga teselas no es evidencia de funcionalidad. Y ninguna implementación del mapa justifica comprometer el aislamiento de datos sensibles ya logrado en el Paso 04.

**Al cerrar este paso** deben existir el filtrado de Benefits y el mapa Android propios, simples, explicables, testeables y listos para recibir el carrusel en el **Paso 06**. **Detener la implementación en ese punto.**


## 21. Ejecución y evidencia real — 05/11/2026

**Resultado: BLOQUEADO POR ENTORNO/CONFIGURACIÓN.** Se implementó el alcance en código y se verificaron 33/47 DoD. No se declara funcionamiento nativo aprobado: faltan build/link/montaje y teselas reales. Los Pasos 01–04 siguen aprobados; solo se ejecutaron sus suites como regresión. Este registro actualiza el mismo documento por instrucción del propietario; **no se creó un archivo de reporte**.

### 21.1. Cambios y decisiones efectivas

- Datos ficticios de Lima con las nueve propiedades del PDF, parser unknown con allowlist e IDs únicos. Errores estructurales fallan con mensaje seguro. Coordenadas numéricas inválidas se filtran en el caso de uso: mezcla devuelve válidos y `omittedLocations`; todos inválidos devuelven error, distinto de empty.
- `RepositoryCardBrandsReader` en composición reutiliza el mismo `CardRepository` de Mis productos; no depende de que Zustand ya haya cargado. Normaliza/deduplica. VISA/MASTERCARD existentes producen beneficios 1/2/3, excluyendo AMEX (4).
- `Benefit.id` permanece numérico. El mapper vive en presentación porque adapta dominio a su contrato UI; envía únicamente string ID, coordenadas y título.
- Único `io-native-components`, mismo namespace y Codegen `IoNativeComponentsSpec`, `type: all`, `src/specs`. Spec y eventos seguros íntegros. `createViewManagers` añade el manager al mismo paquete. `react-native config` confirma import/instancia única y `CustomMapComponentDescriptor`; iOS no registra el mapa.
- `CustomMapViewManager` usa delegate/interface generados. `CustomMapView` contiene Google MapView real, reconciliación incremental, selección controlada sin emitir taps programáticos y evento directo Fabric con surfaceId/viewId. Kotlin valida tipos/rangos y deduplica conservando primer ID válido. No se ha compilado aún esta integración SDK.
- AndroidX LifecycleOwner real + visibilidad/attach controlan start/resume/pause/stop. ComponentCallbacks2 conecta low-memory. SavedStateRegistry captura estado del SDK; tras recreación se reconstruye desde props, sin restaurar cámara antigua. Destroy cancela callback de estado, limpia listeners/pins/mapa/owners una vez. JUnit prueba la seam utilizada, no la integración Android.
- Cámara después de layout y solo al cambiar ubicaciones: zoom 14 con uno, bounds con varios; empty conserva cámara. Selección resalta color/z-index/info window y se anuncia con texto en RN; verificación visual pendiente.
- Pantalla con estados, timeout de mapa de 20 s y retry mediante recreación controlada. Alternativa textual vertical accesible para no depender exclusivamente de pins del SDK; sin carrusel ni sincronización cruzada. iOS fallback explícito y spec excluida de esa plataforma.
- Maps `20.1.0` fijado tras consultar release notes oficiales. Se eligió lectura Gradle `Properties` + manifestPlaceholder local para evitar un plugin extra de compatibilidad no comprobada con AGP 9.2.1 en este entorno; no se afirma incompatibilidad del plugin de Google. Resolución Maven, manifest fusionado y compatibilidad binaria siguen pendientes.
- Clave solo en `android/secrets.properties` ignorado; `local.defaults.properties` contiene placeholder inválido. No se crearon credenciales, permisos de ubicación, backend ni Firebase. El mapa no toca FLAG_SECURE ni datos de sesión segura.

### 21.2. Archivos creados/modificados

```text
.gitignore
README.md
__tests__/App.test.tsx
android/app/build.gradle
android/app/src/main/AndroidManifest.xml
android/local.defaults.properties
docs/steps/STEP-05-BENEFITS-CUSTOM-MAP.md
packages/io-native-components/android/build.gradle
packages/io-native-components/android/src/main/java/com/ioproductsbenefits/nativecomponents/IoNativeComponentsPackage.kt
packages/io-native-components/android/src/main/java/com/ioproductsbenefits/nativecomponents/map/CustomMapView.kt
packages/io-native-components/android/src/main/java/com/ioproductsbenefits/nativecomponents/map/CustomMapViewManager.kt
packages/io-native-components/android/src/main/java/com/ioproductsbenefits/nativecomponents/map/MapState.kt
packages/io-native-components/android/src/test/java/com/ioproductsbenefits/nativecomponents/map/MapStateTest.kt
packages/io-native-components/package.json
packages/io-native-components/src/CustomMap.tsx
packages/io-native-components/src/index.ts
packages/io-native-components/src/specs/CustomMapNativeComponent.ts
src/app/composition/benefitsDependencies.ts
src/app/composition/cardsDependencies.ts
src/app/navigation/DashboardNavigator.tsx
src/capabilities/benefits/application/usecases/loadEligibleBenefits.ts
src/capabilities/benefits/infrastructure/__tests__/benefits.test.ts
src/capabilities/benefits/infrastructure/datasources/LocalBenefitsDataSource.ts
src/capabilities/benefits/infrastructure/mocks/benefits.json
src/capabilities/benefits/infrastructure/repositories/MockBenefitRepository.ts
src/capabilities/benefits/presentation/__tests__/benefitsPresentation.test.tsx
src/capabilities/benefits/presentation/mappers/benefitToMapMarker.ts
src/capabilities/benefits/presentation/screens/BenefitsScreen.tsx
```

Se conservó `BenefitsPlaceholderScreen.tsx` como archivo histórico sin uso en el navegador. El test del Dashboard cambió su expectativa textual al nuevo fallback iOS; se añadió una regresión Android de navegación/selección. No se retiraron aserciones de seguridad ni suites anteriores.

### 21.3. Comandos y resultados

Todos los comandos npm usaron Node **22.23.4** disponible localmente.

| Comando | Resultado real | Evidencia / límite |
| --- | --- | --- |
| `npm run lint` | PASS | Sin errores ni warnings finales |
| `npm run typecheck` | PASS | TypeScript strict; imports públicos de RN 0.88 |
| `npm run format:check` | PASS | Formato TS/TSX |
| `npm test -- --watch=false --runInBand --coverage` | PASS | 8 suites, **58 pruebas**; 95,27 % sentencias y 95,23 % líneas de archivos instrumentados; `coverage/lcov-report/index.html` ignorado |
| `python3 /private/tmp/io-step05-junit.py` | PASS suplementario | Kotlin compiler embeddable 2.2.0, JUnit 4.13.2 y SDK local cacheados; **13 pruebas**: 5 mapa + 8 token/sesión. Runner temporal fuera del repo; el comando permanente sigue siendo el script npm/Gradle |
| `npm run test:native:android` | FAIL por entorno | No puede escribir `~/.gradle/...zip.lck` (`Operation not permitted`); no ejecutó tests por Gradle |
| `npm run test:all` | FAIL por entorno | Jest pasa; se bloquea al entrar a JUnit/Gradle. No se marca PASS del pipeline |
| `cd android && ./gradlew generateCodegenArtifactsFromSchema` | FAIL por entorno | Lock del wrapper sin permisos |
| Gradle existente con `-g /private/tmp/io-step05-gradle --no-daemon` | FAIL por entorno | `FileLockContentionHandler` → `SocketException: Operation not permitted`; tampoco resuelve el bloqueo evitando el wrapper |
| `node node_modules/react-native/scripts/generate-codegen-artifacts.js --path . --targetPlatform android --outputPath /private/tmp/io-step05-codegen` | PASS | Parser/generadores reales RN 0.88; no sustituye build Gradle |
| Mismo CLI con `--targetPlatform ios --outputPath /private/tmp/io-step05-codegen-ios` | PASS | Generación iOS finalizada; CustomMap excluido del provider iOS |
| `npx react-native config` | PASS | Un solo paquete y descriptor `CustomMapComponentDescriptor` |
| `cd android && ./gradlew testDebugUnitTest` | FAIL por entorno | Lock wrapper; no se compila Kotlin de la vista |
| `cd android && ./gradlew :app:assembleDebug` | FAIL por entorno | Lock wrapper; APK nuevo no generado |
| `cd android && ./gradlew :app:processDebugMainManifest` | FAIL por entorno | Metadata fusionada no verificada |
| `npm run android -- --no-packager` | FAIL por entorno | ADB no puede abrir socket 5037; luego Gradle falla por lock |
| `npm run ios` | FAIL por entorno | No puede abrir launchPackager desde esta sesión |
| `npm run ios -- --no-packager` | FAIL por entorno | CoreSimulatorService inaccesible; no hay prueba de build/ejecución iOS |
| `git check-ignore android/secrets.properties` | PASS | Archivo privado excluido sin imprimir contenido |
| Inspección fuente/diff de seguridad | PASS estático | Sin literales de clave Google, wrappers RN, permisos de ubicación, logs de datos de mapa ni modificaciones al flujo seguro |
| `git diff --check` | PASS | Sin errores de whitespace |

Artefactos observados bajo `/private/tmp/io-step05-codegen/android/app/build/generated/source/codegen`: `java/com/facebook/react/viewmanagers/CustomMapManagerInterface.java`, `CustomMapManagerDelegate.java`, `java/com/facebook/fbreact/specs/NativeIoSecureViewSpec.java` y `jni/react/renderer/components/IoNativeComponentsSpec/ComponentDescriptors.h`. No se modificó ni versionó código generado.

Jest cubre validación/allowlist, integridad/duplicados, fronteras de coordenadas, normalización, reader/errores, elegibilidad y mapper; wrapper con eventos válidos/obsoletos, última prop y null; estados, recuperación, timeout, cancelación de resultado obsoleto, fallback iOS y navegación Android con selección conservada. JUnit usa `MapState`/`MapLifecycle` que consume la vista real: valida, reconcilia, selecciona, filtra taps y prueba pre-ready/destroy/lifecycle idempotente. No prueba el renderer gráfico de Google ni la Activity real.

### 21.4. Matriz manual y DoD pendientes

| Escenarios | Estado | Causa / siguiente verificación |
| --- | --- | --- |
| M01–M04 | BLOQUEADOS | Sin clave Maps local, ADB ni build accesible. Demostrar teselas, IDs 1/2/3, tap y selección nativa |
| M05–M07 | NO EJECUTADOS en dispositivo | Casos de dato/props cubiertos por Jest/JUnit, pero falta demostrar renderer real con empty, inválidos y cambios |
| M08–M09 | NO EJECUTADOS en dispositivo | UI error/timeout y guard de configuración implementados y cubiertos parcialmente por tests; falta prueba real de SDK/configuración/red |
| M10–M11 | NO EJECUTADOS en dispositivo | Navegación/estado probados en RNTL y transiciones puras en JUnit; faltan tabs repetidas, background/rotación y leaks reales |
| M12 | NO EJECUTADO en dispositivo | Código seguro intacto y suites verdes por separado; falta smoke de apertura/cierre tras enlace Fabric |
| M13 | NO EJECUTADO en dispositivo | Labels/roles y alternativa textual probados; faltan anchos, fuente ampliada y TalkBack reales |
| M14 | BLOQUEADO | Fallback y Codegen iOS probados; CoreSimulatorService impide runtime |

Los **14 criterios sin marcar** de §15 son los números **18, 20, 21, 23, 24, 25, 26, 27, 29, 30, 31, 33, 40 y 42** (orden de aparición): manager/vista compilados, renderer/selección/evento/cámara/lifecycle/UX nativos, configuración fusionada y restricciones reales, smoke seguro y pipeline/build Gradle. Las casillas 15–17 acreditan generación y registro declarativo/config; no su montaje. La casilla 22 acredita la seam real de snapshots/cancelación y su conexión en código, sin pretender validar callbacks del SDK en dispositivo. La casilla 36 permite explícitamente bloqueo de compilación iOS explicado. Las casillas de documentación de impedimentos no equivalen a aprobar pruebas manuales.

### 21.5. Para desbloquear y detener esta etapa correctamente

1. Desde Terminal fuera del sandbox, configurar `android/secrets.properties` local con una key restringida a Maps SDK for Android + `com.ioproductsbenefits` y SHA-1 debug (`./gradlew signingReport`); no enviarla por chat.
2. Ejecutar `npm run test:native:android`, `npm run test:all`, `./gradlew generateCodegenArtifactsFromSchema`, `./gradlew testDebugUnitTest :app:assembleDebug :app:processDebugMainManifest` desde `android/` según corresponda. Revisar cualquier error de compilación/integración pendiente; no atribuirlo al entorno sin evidencia.
3. Abrir Android con Google Play services/red y recorrer M01–M13. Comprobar metadata fusionada sin mostrar su valor; verificar restricciones de clave en Google Cloud. Abrir iOS y ambas tabs para M14.
4. Actualizar estas mismas casillas únicamente con resultados reales. Hasta entonces no cerrar/aprobar el Paso 05. No se creó ni ejecutó `STEP-06-MAP-CAROUSEL-SYNC.md`.


### 21.6. Seguimiento de validación externa y compatibilidad Maps

El propietario ejecutó `npm run test:all` con `BUILD SUCCESSFUL in 15s`, y `generateCodegenArtifactsFromSchema :app:assembleDebug :app:processDebugMainManifest` con `BUILD SUCCESSFUL in 46s`. Tras configurar la clave local, `npm run android` compiló e inició la app en `emulator-5554` (`BUILD SUCCESSFUL in 19s`). Estos resultados corresponden al código anterior al ajuste de compatibilidad descrito abajo; las restricciones del sandbox no impidieron la ejecución desde Terminal. La clave no fue leída ni impresa por el agente.

Al entrar a Beneficios se reprodujo un cierre nativo: `NoClassDefFoundError: org/apache/http/ProtocolVersion`, originado en `com.google.android.gms.dynamite_mapsdynamite@231818044@23.18.18`. Las [release notes oficiales de Google](https://developers.google.com/maps/documentation/android-sdk/release-notes) documentan la retirada de la declaración Apache HTTP en Maps 20.0 y el problema con renderers/Play services antiguos. Se añadió al manifest del host `<uses-library android:name="org.apache.http.legacy" android:required="false" />`, sin dependencias Maven adicionales. XML parseado y declaración única/opcional comprobados; `git diff --check` aprobado. **Pendiente recompilar/reinstalar y verificar el mapa tras este ajuste.** No se acredita aún runtime funcional ni se cierra el Paso 05.


### 21.7. Validación manual confirmada por el propietario — estado vigente

**EN VALIDACIÓN FINAL, 43/47 DoD verificados.** El bloqueo de mapa real quedó resuelto después del ajuste del manifest. Las referencias a bloqueo/33 criterios en §21.1–21.6 son el registro inicial, superado por estas evidencias; no corresponden al estado actual.

- Android Pixel 5 API 34: captura del propietario con teselas de Lima y tres pins elegibles. Confirma recompilación/instalación posterior al fix Apache HTTP.
- Segunda captura: pin de Restaurante San Isidro azul, info window, texto «Beneficio seleccionado: Restaurante San Isidro» y marca de selección en alternativa textual. Acredita evento Fabric → selección React → prop nativa. El título del info window se recorta en el borde derecho; el nombre completo permanece legible en el texto RN debajo del mapa.
- El propietario confirmó conservación de selección al alternar tabs, Home/retorno con interacción posterior, rotación a horizontal y regreso sin fallos, apertura/Ocultar de Card Secure View y retorno al mapa funcional. Es una regresión focalizada, sin reauditar Pasos 01–04.
- Confirmó funcionamiento con fuente ampliada. La alternativa textual cuenta con labels/roles probados en RNTL; no se afirma prueba manual de TalkBack.
- Confirmó `npm run ios` y navegación funcional en ambas tabs: Beneficios muestra aviso Android sin montar mapa iOS ni producir cierre. M14 queda aprobado por confirmación del propietario.
- Scripts nativos/test:all y Codegen/build/manifest procesado fueron aprobados externamente según §21.6. El cambio posterior solo añadió uses-library; su instalación y runtime Android se acreditan con las capturas. El agente no volvió a ejecutar Gradle dentro del sandbox ni leyó secretos.

M01/M02/M03/M10/M11/M12/M14 verificados; M13 verificado para fuente ampliada y fallback textual/labels, sin prueba manual TalkBack. M04 pendiente en su caso de ID inexistente; M05/M06/M07 cubiertos por tests puros/JS pero pendientes del renderer nativo con datasets de borde; M08/M09 cubiertos parcialmente por pruebas de estados, pendientes de prueba manual sin configuración/red. No se marcan esos escenarios manuales como aprobados por tener tests automáticos.

Criterios DoD pendientes: **21** (renderer con 0/1/N y altas/bajas/cambios reales), **23** (ID vacío/inexistente en SDK real, además de los tests verdes), **25** (cámara con un punto y empty además de N visible), **31** (confirmación final de los valores exactos paquete/SHA-1 y API restringida). La captura de Google Cloud sí acredita Apps para Android y una API; no muestra el detalle de ambos valores. No se exigen capturas de la clave.

El paso permanece abierto hasta resolver estos criterios y las limitaciones manuales aplicables. No se inició el Paso 06 ni se hicieron commits/push.


### 21.8. Preparación de los últimos casos nativos

El propietario confirmó selección desde el nombre textual y los valores guardados de la clave (paquete `com.ioproductsbenefits`, SHA-1 debug proporcionado, única API Maps SDK for Android), sin enviar la clave. Se acredita el criterio 31 por confirmación del propietario. Se prepara un harness temporal solo Android/development para 0/1/N marcadores, altas/bajas/cambios, ID inválido/vacío/undefined y coordenada inválida, manteniendo la misma instancia del mapa. No son nuevos controles permanentes del producto; se retirarán después de la prueba. Sus resultados nativos siguen pendientes; no se declara cerrado el Paso 05.

Estado tras la confirmación de credenciales: **44/47 DoD**; pendientes criterios 21, 23 y 25 hasta validar el harness.


### 21.9. Cierre vigente del Paso 05 — 47/47 DoD

**PASO 05 COMPLETADO Y VALIDADO — 05/11/2026.** El propietario confirmó: «hice click en todas las opciones y todas funcionan» en el harness nativo temporal. Se acreditan los criterios restantes 21, 23 y 25 con la misma MapView montada y cambios de props en ejecución:

- 0/N/1 puntos, desaparición de pins sin centro falso en (0,0), cámara con un punto y bounds de varios.
- Dataset cambiado: posición y título modificados, ID retirado y nuevo ID agregado sin duplicación.
- Selección inexistente, vacía y undefined sin crash ni evento artificial; contador reservado a taps físicos.
- Coordenada fuera de rango descartada en Kotlin sin pin ni selección falsa.

Se retiraron el botón «Validar mapa (temporal)», su estado/estilos en DashboardNavigator y el archivo MapRuntimeValidation.tsx. La interfaz normal queda restaurada. El último cambio afecta solo TS/TSX: recargar Metro aplica la retirada; no requiere otra build nativa.

Validación final del código sin harness: `npm run lint`, `npm run typecheck`, `npm run format:check`, Jest (**58 pruebas, 8 suites**) y `git diff --check` PASS. JUnit se ejecutó nuevamente por compilador local cacheado: **13 pruebas** (5 mapa y 8 token/sesión). El pipeline `npm run test:all`, Codegen Gradle y build Android fueron aprobados por el propietario desde Terminal según §21.6, no por el agente dentro del sandbox. La reinstalación tras uses-library y las pruebas manuales acreditan el mapa funcionando. iOS fue compilado/abierto por el propietario con ambas tabs funcionales y fallback Android.

**Límites conservados, sin falsos PASS:** no se ejecutó TalkBack manual; se verificaron labels/roles con RNTL, alternativa textual y fuente ampliada. Los escenarios de ausencia real de Play services/clave y pérdida deliberada de red (M08/M09) no fueron ejecutados manualmente: permanecen documentados como no ejecutados, con estados/error/reintento/timeout cubiertos por tests y límites del SDK explicados. No se probó presión de memoria Android real; el reenvío low-memory y cleanup se validó mediante código/seams JUnit y maniobras background/rotación. La captura mostró un info window recortado en un borde; el nombre completo sigue accesible en el texto RN. No se afirma ausencia absoluta de leaks ni detector universal de errores de autorización. El criterio 43 admite documentar impedimentos en lugar de inventar aprobación de esos escenarios.

La key permanece en archivo local ignorado; no fue leída/impresa por el agente. Restricciones paquete+SHA-1 y única API Maps SDK for Android confirmadas por el propietario. No queda bloqueo de compilación ni funcionalidad del mapa reportado. No hay carrusel ni Swift, no se creó otro reporte, no se hizo commit/push y no se inició el Paso 06.
