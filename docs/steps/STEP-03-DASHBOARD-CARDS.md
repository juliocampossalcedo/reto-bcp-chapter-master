# STEP-03 — Dashboard y Mis productos

> **Actualización de alcance — 06/11/2026:** el Paso 08 fue **OMITIDO por decisión del propietario**, por resultar redundante para el reto BCP. Su documento de ejecución fue eliminado. Las referencias históricas a esa etapa corresponden al plan original y no constituyen trabajo pendiente ni un requisito de cierre. Este paso conserva su aprobación y sus controles implementados.

**Proyecto:** `io-products-benefits`  
**Aplicación:** iO Productos & Beneficios  
**Librería nativa futura:** `io-native-components`  
**Etapa:** 03 de 12  
**Estado:** **COMPLETADO** el 5 de noviembre de 2026; 41/41 criterios del DoD verificados con el alcance visual descrito abajo  
**Prerequisitos:** Pasos 01 y 02 completados, según reporte del propietario; confirmar el estado real en el repositorio antes de implementar  
**Plataforma prioritaria:** Android + Kotlin (sin implementación nativa en este paso)  
**Plataforma adicional:** iOS + Swift (implementación de librería propia reservada al Paso 11)  
**Documento rector:** `RETO_BCP_TECHNICAL_BASELINE.md`  
**Referencia normativa:** `Reto técnico - Chapter Master Frontend.pdf`  
**Referencias previas:** `docs/steps/STEP-01-BOOTSTRAP.md` y `docs/steps/STEP-02-ARCHITECTURE.md`

---

## 1. Instrucciones de implementación

> **Actúa como un Chapter Frontend / Senior React Native Engineer**, con criterio de producto financiero, Clean Architecture, SOLID, Vertical Slicing por capabilities asociadas al dominio BIAN, React Native 0.88, TypeScript estricto, accesibilidad y testing.
>
> **Ejecuta exclusivamente el PASO 03 — DASHBOARD Y MIS PRODUCTOS.** El propietario reportó que los Pasos 01 y 02 están completos, incluido el cierre de 29/29 DoDs del Paso 02. **Verifícalo con el código real**, sin asumir que el estado consignado en la cabecera del antiguo prompt de Paso 02 está actualizado. Si faltan contratos o existe una discrepancia material, informa la situación antes de improvisar otra arquitectura.
>
> Trabaja en el repositorio existente `io-products-benefits`. No inicialices otra aplicación ni refactorices indiscriminadamente los Pasos 01 y 02.
>
> **Objetivo:** entregar un Dashboard real de dos tabs, con navegación y tema compartidos, y una capability **Cards / Account Management** funcional **solo para visualizar cuentas y tarjetas con datos seguros**. La tab Beneficios existirá como placeholder honesto. **No implementes todavía los flujos nativos, tokens, mapa, carrusel, Firebase ni los extras de etapas posteriores.**
>
> Al terminar, ejecuta las validaciones, aporta evidencia y reporta el estado del DoD. **Detente** sin crear ni ejecutar el Paso 04.

### 1.1 Orden de lectura y precedencia

Antes de modificar código:

1. Lee `RETO_BCP_TECHNICAL_BASELINE.md` completo.
2. Lee `docs/steps/STEP-01-BOOTSTRAP.md` y `docs/steps/STEP-02-ARCHITECTURE.md` (localiza los archivos si la ruta varía, no los dupliques).
3. Lee `Reto técnico - Chapter Master Frontend.pdf`, **si existe localmente**. Si no está, utiliza la transcripción de requisitos del documento maestro e informa la ausencia; no inventes contenido.
4. Inspecciona los contratos TypeScript **reales** creados en Paso 02, la navegación y presentación existentes, `App.tsx`, `package.json`, `package-lock.json`, configuración de Jest, TS, ESLint, Prettier y el estado Git.
5. Respeta este orden de autoridad: **PDF oficial > baseline técnico > contratos efectivamente aprobados del Paso 02 > este prompt > preferencias de implementación**. Ante una incompatibilidad, señala la discrepancia y prioriza el requisito superior sin cambios destructivos.

### 1.2 Condiciones operativas

- No ejecutar `react-native init`, migraciones globales, `expo`, reestructuraciones completas ni cambios de versión de React Native.
- No alterar interfaces de dominio, repositorio ni puertos del Paso 02 por conveniencia. Si alguna firma efectivamente presente difiere del documento, adapta **las implementaciones nuevas** y describe la diferencia.
- No hacer `git commit`, `git push`, publicar paquetes, manipular remotos ni introducir claves reales.
- Preservar cambios previos del propietario; obtener `git status --short` antes y después, y revisar el diff.
- No declarar PASS en pruebas, builds o dispositivos que no se hayan ejecutado realmente.
- Ejecutar en el proyecto actual; no generar una aplicación paralela.

---

## 2. Alcance del Paso 03 y decisiones cerradas

| Tema | Decisión |
| --- | --- |
| Framework | React Native **0.88.0**, Community CLI, New Architecture, sin Expo |
| Lenguaje | TypeScript `strict: true` |
| Arquitectura | Capability-first; `domain / application / infrastructure / presentation` **dentro** de cada capability |
| Navegación | React Navigation **7.x estable**, `@react-navigation/native` y `@react-navigation/bottom-tabs` |
| Tabs visibles | **Mis productos** y **Beneficios** |
| Pantalla inicial | Tab **Mis productos** |
| Dashboard | Un solo contenedor de navegación, header compartido y tema consistente |
| Estado | **Zustand**, un estado mínimo y no persistido para productos seguros; estado de navegación bajo React Navigation |
| Datos | JSON local por capability, data sources y repositorios concretos que implementen contratos del Paso 02 |
| Seguridad | Solo PAN **enmascarado**, expiración `MM/AA` y demás campos seguros del contrato `Card` |
| Vista segura | Solo control visual **deshabilitado y claramente explicado**; integración real en Paso 04 |
| Beneficios | Tab con pantalla informativa provisional, **sin mapa, marcadores, carrusel ni datos de beneficios** |
| Android | Debe compilar y mostrar la nueva interfaz en dispositivo o emulador |
| iOS | Verificar compilación y navegación si el entorno está disponible; no implementar Swift propio |
| Testing | Jest + React Native Testing Library, usando las herramientas ya instaladas cuando existan |

**Resultado esperado:** una app demostrable con navegación entre dos tabs; en **Mis productos** se ven cuentas y tarjetas reales de mocks seguros, con estados de UI, accesibilidad y pruebas. El flujo de ver datos sensibles **no puede darse por implementado** en este paso, aunque el control exista visualmente.

### 2.1 Exclusiones expresas

No implementar ahora:

- `Card Secure View`, `openSecureView`, `SecureViewGateway` concreto, validación nativa, protección anti-screenshot, blur, timeout ni eventos de sesión.
- Generación, renovación, almacenamiento o validación de `secureToken`; no llamar `SecureTokenProvider`.
- TurboModules, Fabric, Codegen, `NativeModules`, módulos Kotlin o Swift propios ni creación efectiva de `packages/io-native-components`.
- Google Maps SDK, MapKit, `CustomMap`, `benefits.json`, filtrado `applicableBrands`, marcadores, carrusel y sincronización.
- Firebase, login, API remota, backend, pagos, saldos ficticios, transacciones o publicaciones npm.
- Persistencia local de Zustand con `AsyncStorage` u otro almacenamiento: no se requiere para esta etapa.
- Librerías de mapas, wrappers de vistas seguras ni bridges ajenos, **prohibidos por el PDF**.

**No adelantar funciones para aparentar una entrega terminada.** El enunciado oficial tiene requisitos de seguridad y funcionalidades nativas que se cumplirán en las siguientes etapas.

---

## 3. Arquitectura: extender el Paso 02, no sustituirlo

### 3.1 Estructura objetivo orientativa

Usar los directorios/contratos que ya existen. Crear **solo archivos con implementación o uso real**, sin fabricar una estructura paralela. Nombres de implementaciones sugeridos, ajustables al código aprobado:

```text
src/
├── app/
│   ├── AppRoot.tsx                       # navegación/tema/composición general
│   ├── navigation/
│   │   └── DashboardNavigator.tsx       # dos tabs; navegación tipada
│   ├── theme/
│   │   └── tokens.ts                    # colores, espacios, tipografía y radios
│   ├── components/
│   │   └── AppHeader.tsx                 # header compartido
│   └── composition/
│       └── cardsDependencies.ts         # wiring manual de mocks y repositorios
├── capabilities/
│   ├── cards/
│   │   ├── domain/                      # contratos existentes de Paso 02
│   │   │   ├── models/{Account,Card}.ts
│   │   │   └── repositories/{AccountRepository,CardRepository}.ts
│   │   ├── application/
│   │   │   ├── ports/{SecureTokenProvider,SecureViewGateway}.ts
│   │   │   └── usecases/
│   │   │       └── loadProducts.ts      # coordinación mínima, si aporta claridad
│   │   ├── infrastructure/
│   │   │   ├── mocks/{accounts,cards}.json
│   │   │   ├── datasources/
│   │   │   │   ├── AccountsDataSource.ts # existente: interfaz
│   │   │   │   ├── CardsDataSource.ts    # existente: interfaz
│   │   │   │   ├── LocalAccountsDataSource.ts
│   │   │   │   └── LocalCardsDataSource.ts
│   │   │   └── repositories/
│   │   │       ├── MockAccountRepository.ts
│   │   │       └── MockCardRepository.ts
│   │   └── presentation/
│   │       ├── screens/CardsScreen.tsx
│   │       ├── components/
│   │       │   ├── AccountItem.tsx
│   │       │   ├── CardItem.tsx
│   │       │   └── ProductsStatusView.tsx # si se justifica reuso
│   │       ├── hooks/useProducts.ts     # integración de carga y estado
│   │       └── store/useProductsStore.ts
│   └── benefits/
│       ├── domain/                      # intacto del Paso 02
│       ├── application/                 # intacto del Paso 02
│       ├── infrastructure/              # intacto del Paso 02
│       └── presentation/
│           ├── contracts/CustomMapContracts.ts # existente, NO usar aún
│           └── screens/BenefitsPlaceholderScreen.tsx
└── shared/
    └── domain/CardBrand.ts            # existente, sin redefinir

App.tsx                                    # entrada delgada; delega a src/app
README.md                                  # actualizar estado, uso y límites
```

**La estructura es una propuesta, no una orden de crear todos esos archivos exactamente.** `loadProducts.ts`, `useProducts.ts` y `ProductsStatusView.tsx` solo se justifican si separan responsabilidades reales. No introducir un DI container, UI kit global, `shared/utils` indiscriminado ni servicios redundantes.

### 3.2 Reglas de dependencia obligatorias

- **Dominio `cards`:** `Account`, `Card`, repositorios; sin React, RN, JSON, Zustand o SDK.
- **Aplicación `cards`:** orquestación de carga (si existe), depende de repositorios abstractos; no importa JSON, Zustand, UI ni `app`.
- **Infraestructura `cards`:** conoce JSON local y materializa `AccountsDataSource`, `CardsDataSource`, `AccountRepository`, `CardRepository`; nunca retorna campos sensibles completos.
- **Presentación `cards`:** componentes, hooks y Zustand; consumen interfaces/repositorios inyectados o un caso de uso, **no importan directamente mocks ni implementación de infraestructura**.
- **Composición `app`:** conecta implementaciones con consumidores y configura navegación/tema; no concentra reglas de filtrado o render de tarjetas.
- **`benefits`:** por ahora solo una vista de placeholder. No importar internals de `cards`.
- **`shared`:** únicamente elementos transversales reales; reutilizar `CardBrand`, no crear otro tipo equivalente.

**No redefinir** `Card`, `Account`, `Benefit`, `CardRepository`, `AccountRepository`, `CardsDataSource`, `AccountsDataSource`, `AvailableCardBrandsReader`, `SecureViewGateway` ni `CustomMapProps` si ya existen y cumplen el Paso 02.

### 3.3 Integración con contratos aprobados

Aprovechar **literalmente** (o conforme a sus equivalentes reales aprobados) las siguientes firmas:

```ts
interface CardRepository {
  listCards(): Promise<readonly Card[]>;
}

interface AccountRepository {
  listAccounts(): Promise<readonly Account[]>;
}

interface CardsDataSource {
  readCards(): Promise<readonly CardRecord[]>;
}

interface AccountsDataSource {
  readAccounts(): Promise<readonly AccountRecord[]>;
}
```

- Implementar data sources y repositorios **concretos**, sin sustituir interfaces por llamadas directas a `require` o `import` desde `CardsScreen`.
- La UI recibe dependencias por composición simple, props, hook/adaptador o una solución equivalente que preserve las fronteras; **no** introducir contenedores de inyección.
- `SecureTokenProvider` y `SecureViewGateway` **siguen como interfaces sin implementación ni invocación**.
- `AvailableCardBrandsReader` **no se implementa prematuramente**: se conectará en el Paso 05 para el filtrado real de beneficios.
- `CustomMapContracts` y `BenefitRepository` permanecen intactos hasta sus etapas.

---

## 4. Dependencias y configuración de navegación

### 4.1 Instalaciones permitidas

Desde la raíz del proyecto, **primero comprobar qué paquetes ya están instalados** y sus versiones. Agregar solo lo necesario:

```bash
npm install --save-exact @react-navigation/native@7 @react-navigation/bottom-tabs@7
npm install --save-exact react-native-screens react-native-safe-area-context
npm install --save-exact zustand
```

Los comandos son **orientativos**: resolver versiones estables efectivamente compatibles con **RN 0.88**, comprobar sus `peerDependencies`, guardar **versiones exactas** con `--save-exact` y registrar las versiones instaladas. No usar `@next`, prereleases, versiones flotantes de React Navigation 8 ni `--force`/`--legacy-peer-deps` para ocultar conflictos. Fijar resultado en `package-lock.json` y actualizar el README. Evitar instalar `react-native-gesture-handler` y `react-native-reanimated` **salvo necesidad comprobada del navegador elegido**; no agregar librerías de iconos, animación o UI por rutina.

Elegir el **Bottom Tabs Navigator de React Navigation 7.x** (API estable `createBottomTabNavigator`). **No usar el Native Bottom Tabs experimental** ni un navegador legacy innecesario.

Mantener el proyecto con acceso nativo total del RN CLI. Si `react-native-screens` o una dependencia exige configuración adicional de Android/iOS, revisar la documentación y la plantilla actual. **No introducir código Kotlin/Swift de negocio, bridge ni cambios nativos ajenos al Paso 03**. Si hubiera un cambio en código Kotlin/Swift estrictamente imprescindible para que funcione la navegación, **reportarlo como bloqueo técnico antes de violar la restricción de esta etapa**; no afirmar que todo funciona con una integración incompleta.

### 4.2 Navigator

Crear un único `NavigationContainer` en la raíz React Native de la app y el `DashboardNavigator` con exactamente dos rutas internas estables (los nombres internos pueden ser `Products` y `Benefits`) y etiquetas visibles:

- **Mis productos** — ruta inicial.
- **Beneficios** — ruta provisional navegable.

Requisitos:

1. Bottom bar visible, con indicador de tab seleccionada, etiquetas en español e iconografía coherente. No depender solo del color para mostrar selección.
2. **Header único reutilizado** en ambas tabs. Evitar renderizar simultáneamente un header del navigator y otro dentro de la pantalla.
3. Aplicar el tema de forma consistente a `NavigationContainer`, header, fondo, barra inferior, textos y estados.
4. Tab activa y navegación gestionadas por React Navigation, **no duplicadas en Zustand**.
5. Conservar componentes/estado al alternar tabs: evitar desmontajes forzados y resets por foco; no reconsultar datos ya cargados por un cambio de pestaña.
6. Navegación tipada; no usar nombres mágicos repetidos ni `any` en props.
7. Respetar Android Back (comportamiento predeterminado documentado), safe areas y orientación disponible.
8. No agregar Stack Navigator, deep linking, notificaciones ni login si no hay un flujo real que los requiera.

### 4.3 Integración con el bootstrap

- `App.tsx` sigue siendo una entrada delgada que delega a `src/app/`.
- Reemplazar **intencionalmente** la pantalla visible de bootstrap por el Dashboard del Paso 03; **no** conservarla como tercera pantalla de producto.
- **Actualizar** el smoke test anterior para validar el nuevo arranque y mantener su propósito. No borrar cobertura anterior sin sustitución.
- Conservar RN 0.88, Hermes, New Architecture, identificadores `com.ioproductsbenefits`, scripts, lockfile y convenciones de los pasos previos.

---

## 5. Diseño visual de una aplicación financiera

### 5.1 Dirección de diseño

Construir una interfaz **profesional, clara y actual**, con jerarquía visual deliberada. Se espera un producto visualmente convincente, no solo una lista de textos que compile.

Orientación propuesta (no confundir con una guía oficial de marca de BCP/iO):

- Fondo neutro claro; superficies de tarjetas con contraste suave y separación legible.
- Color primario azul profundo, acento azul/turquesa y neutrales; estados de error y deshabilitado distinguibles.
- Header con **iO Productos & Beneficios** o una composición equivalente, sin fingir logos oficiales descargados o inventar recursos de marca.
- Sección **Cuentas** diferenciada de la sección **Tarjetas**.
- Tarjetas financieras visuales con marca, alias, PAN enmascarado y fecha; la jerarquía debe resaltar el producto sin exponer datos.
- Bottom tabs con iconos simples consistentes, labels legibles y estado activo claro. Si se agregan assets de iconos, usar recursos locales legítimos; no agregar paquetes pesados solo por dos iconos.
- Espaciados consistentes (p. ej. escala 4/8/12/16/24), radios y elevación moderados, estados vacíos y de error cuidados.
- Estilos mediante `StyleSheet` y tokens; sin estilos dispares hardcodeados en cada componente.

La paleta y los tokens exactos pueden ajustarse durante la implementación, justificando accesibilidad. Evitar copiar visualmente una pantalla bancaria existente sin assets/licencias disponibles.

### 5.2 Elementos visibles mínimos

**Header compartido:**

- Identificación de la app.
- Subtítulo o contexto de la tab cuando aporte claridad, sin duplicar el título.
- Respeto de safe area y tipografía escalable.

**Mis productos:**

- Título de pantalla o sección inequívoco.
- Subtítulo corto que explique que la información está protegida/enmascarada, sin prometer un mecanismo de seguridad todavía inexistente.
- Resumen **Cuentas** con alias y, si existe, `maskedNumber`.
- Resumen **Tarjetas** con `alias`, `brand`, `maskedPan` y `expiry`.
- Control **Ver datos sensibles** visible en cada tarjeta, **deshabilitado en el Paso 03** y con indicación textual accesible del estado provisional.
- Estados loading/empty/error y reintento claro.

**Beneficios:**

- Una pantalla deliberadamente provisional con el título **Beneficios** y un mensaje como **«Esta sección estará disponible en la próxima etapa»**.
- No mostrar beneficios ficticios, un mapa dibujado para simular el componente nativo ni un carrusel decorativo que pueda confundirse con implementación real.
- Mantener el tema visual y la barra inferior activos.

### 5.3 Adaptación

- Evitar anchos absolutos pensados solo para un dispositivo.
- Soportar como mínimo teléfonos Android de ancho estrecho (p. ej. ~360 dp) y normal; probar un tamaño más amplio si está disponible.
- Respetar safe areas, barras del sistema, tamaños de texto aumentados y textos largos sin truncar datos críticos.
- Evitar que el botón de cada tarjeta quede fuera de pantalla o cubierto por la barra inferior.
- Permitir que elementos de contenido hagan wrap cuando sea necesario, sin perder legibilidad.
- No introducir orientación forzada, layout tablet ni dark mode completo si el tiempo no lo justifica; documentar el alcance real.

---

## 6. Capability Cards / Account Management: modelos seguros

### 6.1 Modelos existentes: fuente de verdad

Consumir las declaraciones del Paso 02 sin introducir modelos alternativos. Referencia conceptual de sus campos:

| Modelo | Propiedades públicas permitidas | Observaciones |
| --- | --- | --- |
| `Account` | `accountId`, `alias`, `maskedNumber?` | El PDF exige cuentas pero no define un esquema de cuenta; conservar el mínimo aprobado. |
| `Card` | `cardId`, `alias`, `maskedPan`, `brand`, `expiry`, `accountId` | **No** posee `holder`, `pan`, `fullPan`, `cvv` ni datos equivalentes completos. |
| `CardBrand` | `string` | Reutilizar `src/shared/domain/CardBrand.ts`; normalizar marcas en la frontera de datos si procede. |

No añadir saldos, nombres completos, moneda, números de cuenta íntegros, movimientos, límites de crédito o fechas de vencimiento inventadas que el PDF no exige.

### 6.2 Mocks locales

Crear `cards.json` y `accounts.json` **dentro de la infraestructura de `cards`**. Deben representar un escenario útil para la demo (p. ej. **2 cuentas y 3 tarjetas**, con marcas `VISA` y `MASTERCARD`). Todos los `cardId` y `accountId` únicos; cada tarjeta debe apuntar a una cuenta existente.

**Ejemplo de forma de registro segura en `cards.json`** — valores ficticios y ya enmascarados:

```json
[
  {
    "cardId": "card_001",
    "alias": "Crédito Visa",
    "maskedPan": "**** **** **** 1234",
    "brand": "VISA",
    "expiry": "12/28",
    "accountId": "acc_101"
  }
]
```

**Ejemplo de `accounts.json`:**

```json
[
  {
    "accountId": "acc_101",
    "alias": "Cuenta principal",
    "maskedNumber": "**** 0456"
  }
]
```

**Regla superior al ejemplo de `cards.json` del PDF:** aunque allí aparece `holder`, el mismo enunciado exige que **PAN, CVV y titular completos vivan solo en el módulo nativo y jamás pasen por JS**. Por consiguiente, **no incluir `holder` en mocks ni modelos React Native**, aunque ello implique omitir ese campo del ejemplo oficial. La interpretación y el aislamiento fueron establecidos en Paso 02.

También se prohíbe guardar PAN completo para luego enmascararlo en JS: **el mock nace enmascarado**.

### 6.3 Validación y proyección al dominio

Los data sources deben:

1. Leer el JSON local, **sin peticiones HTTP, almacenamiento externo ni simulación artificial de latencia**.
2. Tratar el JSON como entrada que requiere validación razonable de forma, tipos y valores.
3. Proyectar por **allowlist** a nuevos objetos con **solo** las propiedades públicas del modelo; no propagar objetos completos con `...record` ni hacer `as Card` sobre registros sin depurar.
4. Garantizar `cardId`, `accountId`, `alias`, `maskedPan`, `brand` y `expiry` coherentes antes de entregarlos.
5. Comprobar que `maskedPan` ya tiene el patrón visual seguro `**** **** **** 1234` (o el equivalente enmascarado aprobado, con únicamente los cuatro últimos dígitos visibles). Rechazar registros que no estén enmascarados; **nunca** reconstruir PAN completo.
6. Comprobar `expiry` en formato **MM/AA**, con mes de `01` a `12` y dos dígitos para año; no confundirlo con el TTL de token.
7. Normalizar `brand` de forma simple y consistente (`trim().toUpperCase()` cuando sea necesario). No cambiar el tipo `CardBrand` del Paso 02 ni imponer un catálogo fijo incompatible.
8. Validar identificadores únicos y referencias de `accountId` donde se coordine la carga. Ante datos inconsistentes, emitir un error de dominio/aplicación **no sensible**, mostrado de forma amigable en la UI.
9. Devolver arreglos tipados `readonly` cuando corresponda y evitar modificar in-place los datos importados.
10. No imprimir objetos de entrada, tokens, información de tarjetas ni excepciones con payload bruto en logs.

**Trade-off:** no incorporar Zod, Yup, una capa HTTP, un framework de mapeo ni un sistema genérico de validación para dos JSON locales. Comprobaciones pequeñas y probadas son suficientes.

### 6.4 Repositorios concretos y composición

- `LocalCardsDataSource` implementa `CardsDataSource`.
- `LocalAccountsDataSource` implementa `AccountsDataSource`.
- `MockCardRepository` implementa `CardRepository` apoyándose en el data source inyectado.
- `MockAccountRepository` implementa `AccountRepository` de manera equivalente.
- El composition root `src/app/` conecta las dependencias **una vez**, y la pantalla/hook/store consume puertos o un caso de uso.

**No** inyectar los mocks JSON directamente al JSX ni importar implementaciones desde las capas `domain`/`application`.

---

## 7. Carga, estado y errores: un flujo testable

### 7.1 Estados del flujo de productos

Representar al menos:

```text
idle (interno, antes de cargar)
   └── loading
          ├── success  (hay cuentas y/o tarjetas)
          ├── empty    (no hay cuentas ni tarjetas)
          └── error    (fallo controlado)

error ── reintentar ──> loading
```

- `loading`: indicador visible y anunciado; sin ocultar indefinidamente el dashboard.
- `success`: renderizar los datos disponibles. Si una lista está vacía y la otra tiene elementos, mostrar **estado vacío parcial** para esa sección, no una pantalla totalmente vacía.
- `empty`: mensaje claro cuando faltan ambos productos y opción de volver a consultar si tiene sentido.
- `error`: mensaje amigable y acción **Reintentar**; nunca mostrar stack traces o valores brutos del mock.
- La prueba de error se consigue inyectando repositorios que rechacen promesas; **no** agregar un botón «Simular error» en la app final ni modificar el mock de producción para provocar fallas.

### 7.2 Orquestación

Una carga inicial puede coordinar `listAccounts()` y `listCards()` de manera paralela (`Promise.all`) o equivalente sencillo. Mantener una única transformación de resultados al estado visible. Gestionar la posibilidad de que una pantalla se desmonte o reintente para no aplicar respuestas obsoletas sobre una carga más reciente.

No construir una infraestructura compleja de caching, React Query, Redux Saga ni observables para datos JSON estáticos.

### 7.3 Estado Zustand mínimo

Crear **un único store** (sugerencia: `useProductsStore`) para los datos seguros de productos que deberán ser compartidos entre tabs **en pasos posteriores**, con estas responsabilidades máximas:

- `accounts: readonly Account[]`.
- `cards: readonly Card[]`.
- `status: 'idle' | 'loading' | 'success' | 'empty' | 'error'`.
- `errorMessage: string | null` (mensaje sanitizado, no errores brutos).
- Acciones pequeñas para cargar/publicar/reintentar con prevención básica de peticiones duplicadas.

El store puede exponer acciones de ciclo de carga o recibir un caso de uso inyectado, siempre que **no importe repositorios concretos ni mocks de infraestructura**. Mantener suscripción selectiva y evitar devolver objetos compuestos nuevos sin necesidad en cada render.

**No almacenar:** `secureToken`, estado de sesión segura, PAN completo, CVV, titular completo, navegación seleccionada, marcadores, beneficios de ejemplo, secretos o datos derivados duplicados innecesariamente.

El conjunto de marcas disponibles podrá **derivarse** de las tarjetas del store cuando realmente se utilice en el Paso 05. **No** crear un segundo arreglo global de marcas ni implementar `AvailableCardBrandsReader` sin consumidor real.

El store **no usa `persist`**: conservar estado al cambiar de tabs no significa persistir información en disco.

### 7.4 Conservación de estado entre tabs

- Una vez cargados los productos, ir a Beneficios y regresar a Mis productos no debería disparar otra lectura del mismo mock solo por cambiar de tab.
- React Navigation conserva el estado del navegador; no habilitar unmount/reset deliberado al cambiar de tab.
- Mantener la posición de scroll de la lista al alternar cuando el navegador mantiene la pantalla montada; verificarlo manualmente.
- Reintentar después de un error sí puede iniciar una nueva lectura.
- Probar que no se limpian productos ni se reinicializa el store por un focus event.

---

## 8. Pantalla Mis productos y componentes

### 8.1 Estructura de UI

Una composición recomendable:

```text
Dashboard (header compartido)
 └── Tab Mis productos
     ├── Encabezado de sección / contexto
     ├── Cuentas
     │    ├── AccountItem
     │    └── AccountItem
     └── Tarjetas
          ├── CardItem (VISA, PAN enmascarado, MM/AA)
          ├── CardItem (MASTERCARD, PAN enmascarado, MM/AA)
          └── CardItem (...)
             └── Ver datos sensibles [deshabilitado: Paso 04]

Bottom tabs: [Mis productos] [Beneficios]
```

Preferir **un `FlatList` de tarjetas** con `ListHeaderComponent` para el resumen pequeño de cuentas, o una solución de virtualización equivalente. Evitar `ScrollView` envolviendo un `FlatList` vertical del mismo eje, que desactiva ventajas de virtualización y provoca warnings. Para pocos mocks, `AccountItem` puede renderizarse dentro del header sin crear una segunda lista virtualizada anidada.

### 8.2 Tarjetas

La tarjeta visual debe mostrar:

- Alias (`Crédito Visa`, etc.).
- Marca (`VISA`, `MASTERCARD`, etc.).
- `maskedPan` **tal cual seguro**.
- Fecha de vencimiento `MM/AA` con etiqueta contextual (por ejemplo, «Vence 12/28»).
- Botón/control de acción **Ver datos sensibles**.

No mostrar el `cardId` o `accountId` técnico al usuario salvo que exista justificación concreta. `cardId` se usa como `keyExtractor` estable; evitar índices como keys.

### 8.3 Acción «Ver datos sensibles» — límite del Paso 03

**Decisión obligatoria para esta etapa:** mostrar el control con el texto exacto **«Ver datos sensibles»**, pero **deshabilitado de manera real** (`disabled` y estado accesible de deshabilitado) y acompañado por una aclaración visible, por ejemplo **«Disponible en la próxima etapa»**.

Esta decisión es preferible a:

- Fingir que una tarjeta se reveló mostrando una vista RN no protegida.
- Navegar a una pantalla de «datos seguros» que no valida token.
- Enviar `cardId` a un bridge inexistente.
- Generar tokens simulados solo para marcar funcionalidad completa.
- Presentar una acción habilitada que falle silenciosamente.

**Las pruebas de Paso 03 comprobarán la presencia y el estado deshabilitado del control.** El requisito end-to-end del PDF (token + nativo) queda explícitamente **pendiente del Paso 04**, no aprobado todavía.

### 8.4 Render y rendimiento

- `FlatList` con `keyExtractor` estable por `cardId` y estructura accesible.
- `React.memo` en filas reutilizables **solo cuando estabilice props y reduzca renders**.
- `useMemo` para cálculos no triviales y `useCallback` para callbacks que se transmiten a hijos memoizados o que de verdad lo necesiten.
- Selectores de Zustand por campo, sin suscribir toda la pantalla a cambios irrelevantes.
- No cargar de nuevo datos estáticos al re-renderizar.
- Evitar concatenaciones de datos que recrean estructuras completas en cada render sin justificación.
- Revisar warnings de `VirtualizedList`, keys, hooks y consola durante la ejecución.

---

## 9. Accesibilidad transversal

### 9.1 Reglas mínimas

1. Las tabs tienen nombres accesibles **«Mis productos»** y **«Beneficios»**, roles adecuados y estado de selección reconocible para lector de pantalla.
2. El título del Dashboard y los encabezados de sección son identificables y se leen en orden lógico.
3. Cada tarjeta permite comprender **alias, marca, PAN enmascarado y vencimiento** sin leer símbolos decorativos confusos.
4. El control «Ver datos sensibles» tiene `accessibilityRole="button"`, `accessibilityState={{disabled: true}}` o equivalente y un hint/explicación de que no está disponible todavía.
5. Botones activos (incluido «Reintentar») tienen área táctil adecuada (~44–48 dp cuando sea posible), foco legible y feedback.
6. La carga usa un indicador/estado accesible, y los errores se comunican con texto, no solo color o iconos.
7. Respetar `allowFontScaling`, tamaños razonables y líneas de texto que puedan expandirse.
8. Comprobar contrastes adecuados; como referencia, WCAG AA para texto normal (**4.5:1**) y texto grande (**3:1**).
9. No depender exclusivamente de color para indicar selección, deshabilitado o error.
10. Los iconos decorativos no deben generar etiquetas redundantes en TalkBack/VoiceOver.

### 9.2 Comprobaciones

- Tests RNTL para labels, roles, estado deshabilitado, textos de error y tabs.
- Prueba manual con TalkBack en Android cuando esté disponible; si no, reportar **NO EJECUTADO**.
- Revisión visual con texto ampliado y pantalla estrecha; documentar dispositivo/emulador y observaciones.

---

## 10. Pruebas unitarias y de integración de componentes

El objetivo es verificar **comportamientos observables**, no snapshots grandes ni detalles privados de implementación. Reutilizar el Jest y React Native Testing Library instalados en el Paso 01; añadir RNTL solo si falta y es compatible.

### 10.1 Data sources, modelos y repositorios

Verificar como mínimo:

1. `LocalAccountsDataSource` entrega cuentas con las propiedades aprobadas.
2. `LocalCardsDataSource` entrega tarjetas con las propiedades aprobadas.
3. Los repositorios implementan sus contratos y delegan correctamente en data sources inyectados.
4. Los JSON de demo contienen identificadores únicos y `accountId` referencialmente válido.
5. No se agregan propiedades imprevistas desde la entrada; la salida se **proyecta por allowlist**.
6. `maskedPan` está enmascarado y `expiry` cumple MM/AA; si un registro simulado incumple, hay rechazo controlado sin imprimirlo.
7. La marca se mantiene normalizada (`VISA` / `MASTERCARD` u otra cadena válida).

### 10.2 Orquestación y Zustand

8. Estado inicial `idle`, seguido de `loading` y `success` con repositorios que resuelven.
9. `empty` cuando ambas colecciones están vacías.
10. Éxito parcial con cuentas sin tarjetas, y con tarjetas sin cuentas cuando el caso de UI se evalúa con datos controlados (sin relajar la integridad de los JSON finales).
11. `error` ante rechazo y mensaje público seguro.
12. `Reintentar` provoca un nuevo intento y puede pasar de `error` a `success`.
13. No se recarga al volver a la tab si ya se dispone de datos válidos.
14. Las pruebas no contaminan otras pruebas con el estado global: restablecer store/harness entre casos.
15. No existen tokens, PAN completo, CVV ni titular completo en el estado o acciones del store.

### 10.3 Pantalla Mis productos

16. Renderiza el encabezado, secciones Cuentas y Tarjetas y al menos un elemento de cada colección.
17. Renderiza alias, marca, `maskedPan` y fecha `MM/AA` con etiquetas legibles.
18. Se visualiza **«Ver datos sensibles»** para cada tarjeta; el control **está deshabilitado** y su explicación es accesible.
19. La pantalla no genera token, no usa `SecureViewGateway` ni intenta abrir una vista nativa.
20. `loading` muestra estado de progreso; `empty` muestra mensaje correcto; `error` muestra mensaje y botón de reintento.
21. Listas parciales vacías no ocultan la otra colección.
22. Elementos poseen etiquetas de accesibilidad relevantes.

### 10.4 Dashboard y navegación

23. La app inicia con **Mis productos** activa.
24. Existen exactamente las dos tabs visibles **Mis productos** y **Beneficios**.
25. Un test con **navigator real** comprueba la transición a Beneficios y el placeholder; evita mocks del propio React Navigation cuando sea viable.
26. Al regresar, los productos permanecen visibles y no hay una carga duplicada innecesaria.
27. El header y la identidad visual compartida se conservan en ambas tabs.
28. El smoke test de Paso 01 se actualiza para demostrar el arranque en el Dashboard, no para seguir exigiendo la pantalla antigua.

### 10.5 Estrategia de mocks y Jest

- Preferir repositorios falsos **inyectados** para provocar carga, éxito, vacío y fallo. No modificar archivos de mock reales en cada test.
- Para un loading determinístico, emplear una promesa controlada en el test, **no** un `setTimeout` agregado a producción.
- Testear navegación desde la UI y el resultado visible; usar las utilidades de interacción de RNTL compatibles con la versión instalada.
- Si React Navigation necesita adaptar `transformIgnorePatterns` por ESM o mocks de **dependencias nativas**, aplicar el cambio **mínimo y documentado** en Jest; no mockear toda la navegación para evitar problemas reales.
- No usar PAN completo, CVV o nombres completos de titulares en fixtures, snapshots, logs ni mensajes de error de prueba.
- No introducir pruebas JUnit/XCTest en esta etapa: todavía no hay comportamiento nativo propio que probar.

### 10.6 Cobertura

- Ejecutar el test suite con un solo comando (`npm test -- --watch=false` o el equivalente real documentado).
- Generar, cuando sea razonable, reporte orientativo mediante `npm test -- --coverage --watch=false` (ajustar sintaxis al script real).
- **No fijar todavía el umbral global de 70% como puerta de salida:** el baseline lo reserva al **Paso 07**; reportar la cobertura real observada de los archivos nuevos si se generó.
- Todas las pruebas de esta etapa deben estar verdes en la rama de trabajo.

---

## 11. Implementación guiada: tareas en orden

### Tarea A — Auditoría del repositorio antes de cambiarlo

1. Verificar ruta de repo, branch, `git status --short`, `package.json`, RN 0.88, lockfile, TS strict, New Architecture y tests existentes.
2. Localizar todos los contratos de Paso 02; confirmar firmas exactas y que `App.tsx` sigue delgado.
3. Identificar discrepancias entre el Paso 02 reportado como completo y los archivos reales. No recrear modelos/puertos si ya existen.
4. Registrar el conjunto inicial de comandos/scripts y el entorno Android/iOS disponibles.

### Tarea B — Instalar navegación y Zustand

1. Comprobar versiones y peer dependencies para React Navigation 7.x, bottom tabs, `react-native-screens`, `react-native-safe-area-context`, Zustand.
2. Instalar dependencias compatibles y estrictamente necesarias con npm, preservando lockfile.
3. Configurar Jest/Metro/iOS Pods **únicamente cuando corresponda por esas dependencias**; no modificar Android/iOS por rutina.
4. Ejecutar typecheck/lint preliminar después de instalar.

### Tarea C — Crear tema, header y Dashboard

1. Crear tokens de tema y un header reutilizable (sin agregar un UI kit completo).
2. Configurar `NavigationContainer` y `DashboardNavigator` con rutas tipadas.
3. Implementar bottom tabs **Mis productos** y **Beneficios**, con labels, indicador activo, accesibilidad y safe area.
4. Crear `BenefitsPlaceholderScreen` honesto y visualmente consistente.
5. Actualizar `App.tsx` y el smoke test para la nueva pantalla de arranque.

### Tarea D — Mocks, data sources y repositorios

1. Crear `accounts.json` y `cards.json` con registros seguros y consistentes.
2. Implementar data sources concretos que validen/proyecten por allowlist.
3. Implementar repositorios concretos a partir de los contratos existentes.
4. Agregar una pequeña composición de dependencias en `src/app/`.
5. Probar estructura, enmascarado, formatos e integridad referencial.

### Tarea E — Estado y pantalla de productos

1. Implementar flujo de carga y store Zustand mínimo con `idle/loading/success/empty/error`.
2. Componer `CardsScreen`, `AccountItem`, `CardItem` y estados visuales, cuidando la calidad del diseño.
3. Renderizar listas con una estrategia de virtualización sana y keys estables.
4. Mostrar «Ver datos sensibles» **deshabilitado**, con explicación; **sin bridge, token ni pantalla de revelación**.
5. Probar comportamiento de alternancia entre tabs y no recarga innecesaria.

### Tarea F — Accesibilidad y estados de borde

1. Verificar labels/roles/hints, estados seleccionados, orden de lectura y texto escalable.
2. Probar data vacía y errores con dobles de repositorio, y reintento real de carga.
3. Revisar pantallas estrechas, safe areas, teclado si fuese pertinente (no se esperan formularios), scroll y superposiciones.
4. Inspeccionar renders redundantes y corregir solo problemas identificables.

### Tarea G — Validar, documentar y detenerse

1. Ejecutar checks reproducibles y compilar/abrir Android.
2. Si el entorno lo permite, recompilar/abrir iOS luego de instalar dependencias nativas de navegación.
3. Comparar `git diff`, comprobar seguridad y documentación.
4. Actualizar README con dependencias instaladas, arquitectura implementada, ejecución y límites del Paso 03.
5. Emitir el reporte final del apartado 16 y **no iniciar el Paso 04**.

---

## 12. Validaciones técnicas reproducibles

Desde la raíz del repo; usar los scripts reales si difieren de estos comandos:

```bash
# Inspección previa y posterior
git status --short
git diff --stat
git diff --check

# Calidad
npm run lint
npm run typecheck
npm run format:check
npm test -- --watch=false

# Cobertura orientativa; si el runner lo permite
npm test -- --coverage --watch=false

# Runtime Android (obligatorio para cerrar en entorno funcional)
npm run android

# Runtime iOS si hay macOS + Xcode + CocoaPods disponibles
npm run ios
```

Reglas:

- No lanzar `npm install` completo de manera destructiva sobre un entorno ya funcional sin razón; sí instalar las nuevas dependencias y mantener lockfile coherente.
- Tras dependencias nativas de navegación, **no confiar solo en hot reload**: compilar de nuevo Android e iOS cuando se valide la plataforma.
- `npm run android` debe **compilar y abrir Dashboard**, no solo retornar un comando sin verificar UI.
- Si iOS requiere `pod install`, seguir el mecanismo del proyecto y registrar el comando. La incorporación de pods de bibliotecas de navegación no constituye implementación Swift propia.
- Si el build está impedido por entorno, indicar **NO EJECUTADO/BLOQUEADO** con causa y evidencia; no marcar Android PASS solo por typecheck.
- Verificar manualmente que, al cambiar de tabs varias veces, la interfaz se mantiene estable y los productos no desaparecen.
- Revisar warnings de Metro/React Native, errores de consola y cambios a scripts/Gradle/Podfile.

### 12.1 Inspección de seguridad estática

Revisar manualmente **en código y fixtures JS nuevos**, con búsqueda textual de apoyo si se dispone de `rg`:

- No hay campos ni datos completos `holder`, `fullPan`, `cvv`, `pan` completo u otros equivalentes en `cards.json`, modelos y estado RN.
- `maskedPan` está ya enmascarado en origen.
- No se creó `secureToken` ni una implementación del proveedor/gateway.
- No existe `NativeModules`, Codegen, nueva librería nativa, mapa ni carrusel.
- No hay logs de `Card`, tokens, errores brutos con payload ni datos privados.

**Atención:** documentos existentes del Paso 02 pueden mencionar términos prohibidos como parte de la explicación de seguridad; **la búsqueda textual no es prueba suficiente** de filtración ni de ausencia de filtración. Inspeccionar el código ejecutable y los JSON, no solo contar coincidencias.

### 12.2 Evidencia mínima de UI

Adjuntar o describir en el reporte:

- Dispositivo/emulador y API level utilizado, resolución/tamaño si se conoce.
- Dashboard con Mis productos, cuentas y tarjetas enmascaradas.
- Tab Beneficios y placeholder.
- Control «Ver datos sensibles» deshabilitado.
- Paso a Beneficios y retorno sin pérdida de los datos/estado.
- Estados loading/empty/error comprobados con pruebas reproducibles, sin necesitar botones de debug en UI final.

---

## 13. Criterios de aceptación — Definition of Done (Paso 03)

> Casillas marcadas con evidencia de código, pruebas o ejecución real. La revisión visual cubrió Android Pixel 5 en vertical a escala normal y con texto aumentado, e iOS en vertical a escala normal.

### 13.1 Baseline y dependencias

- [x] Se conservaron `io-products-benefits`, RN 0.88, TS strict, New Architecture, identificadores nativos y configuraciones válidas de Paso 01.
- [x] Se respetaron los contratos efectivos del Paso 02, sin modelos/puertos duplicados ni cambios injustificados.
- [x] React Navigation 7.x estable, Bottom Tabs y sus dependencias compatibles están integrados; versiones documentadas.
- [x] Zustand está instalado y usado de forma acotada, sin dependencias extras de estado/caché.
- [x] `package-lock.json` está coherente y no hay paquetes instalados por accidente.

### 13.2 Dashboard y navegación

- [x] La app abre directamente en el Dashboard con **Mis productos** seleccionada (test de navegador real y captura Android).
- [x] Solo existen las dos tabs visibles: **Mis productos** y **Beneficios**.
- [x] Las tabs permiten alternancia funcional, muestran claramente la selección y conservan estado (test de navegador real).
- [x] Existe **un header compartido** y un tema visual consistente.
- [x] La tab Beneficios muestra un placeholder honesto, sin mapa/carrusel/datos ficticios.
- [x] Safe areas y barra inferior no solapan contenido a escala normal en las capturas de Android e iOS.

### 13.3 Cards / Account Management

- [x] Se crearon mocks locales seguros de cuentas y tarjetas, con referencias e IDs coherentes.
- [x] No existe `holder` completo, PAN completo ni CVV en JSON, modelos públicos, UI o estado JS.
- [x] Data sources realizan validación/proyección por allowlist y retornan estructuras seguras.
- [x] Repositorios concretos implementan los contratos del Paso 02 y son sustituibles en tests.
- [x] El wiring se hace en composición, sin que la UI importe JSON ni data sources directamente.
- [x] La pantalla presenta cuentas y tarjetas con alias, marca, PAN enmascarado y vencimiento **MM/AA**.
- [x] La presentación no incorpora saldos/operaciones/atributos no requeridos por el PDF.
- [x] «Ver datos sensibles» aparece por tarjeta, está **realmente deshabilitado** y explica su carácter provisional.
- [x] No existe ningún intento de generar token, abrir Secure View o invocar un bridge nativo.

### 13.4 Estado, accesibilidad y performance

- [x] Existen y funcionan `loading`, `success`, `empty` y `error`; el reintento recupera de error cuando el repositorio responde.
- [x] Los casos de colecciones parcialmente vacías muestran la sección disponible correctamente.
- [x] Un store Zustand seguro evita recarga al cambiar entre tabs; no se duplican estado de navegación ni marcas innecesariamente.
- [x] `FlatList` (o virtualización equivalente) posee keys estables y no genera warnings de anidamiento en pruebas.
- [x] UI visualmente cuidada, adaptativa a los anchos de los emuladores Android Pixel 5 e iOS en vertical, y a texto aumentado en Pixel 5, sin clipping importante en el contenido visible.
- [x] Tabs, controles, tarjetas y estados tienen labels/roles/hints adecuados y estados distinguibles sin depender del color en inspección de código y pruebas.
- [x] No se detectan rerenders/efectos o listeners innecesarios relevantes en la navegación y carga durante las pruebas JS.

### 13.5 Pruebas y validaciones

- [x] Se crearon pruebas para data sources/repositorios, enmascarado/formato e integridad de los mocks.
- [x] Se probaron carga, éxito, vacío, error, reintento y store sin contaminación entre tests.
- [x] Se probó render de cuentas/tarjetas y acción «Ver datos sensibles» **deshabilitada**.
- [x] Se probó la navegación entre dos tabs y conservación de datos sin recarga superflua.
- [x] Smoke test original actualizado para verificar la app tras este paso.
- [x] `npm run lint` — **PASS real**.
- [x] `npm run typecheck` — **PASS real**.
- [x] `npm run format:check` — **PASS real**.
- [x] `npm test -- --watch=false --runInBand` — **PASS real**: 4 suites y 17 tests.
- [x] `git diff --check` sin errores de whitespace en los cambios de la etapa.
- [x] Android: compilación/apertura de la UI verificadas por el propietario en emulador; capturas de ambas tabs compartidas.
- [x] iOS: `pod install` actualizado en `ios/Podfile.lock`, app abierta en simulador y ambas tabs verificadas por el propietario con capturas.
- [x] README actualizado, con alcance real, scripts, dependencias, decisiones de seguridad y siguientes etapas.
- [x] No se implementaron funciones de Pasos 04–12 y se comunicaron bloqueos/trade-offs verificables.

**Validación registrada (5 nov 2026):** `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm test -- --watch=false --runInBand`, `npm test -- --coverage --watch=false --runInBand` y `git diff --check` pasaron. Cobertura orientativa: 95,28 % sentencias y 94,89 % líneas. El propietario compartió capturas de emuladores Android e iOS con Dashboard, cuentas/tarjetas enmascaradas, tab Beneficios y barra inferior sin solapamiento a escala normal. El lockfile de CocoaPods registra `RNScreens` 4.30.1 y `react-native-safe-area-context` 5.11.1 después de `pod install`. El propietario confirmó que iOS funciona. Una captura adicional del Pixel 5 con texto aumentado muestra encabezado, cuentas y datos visibles de la primera tarjeta sin recortes. **Límite de esta evidencia:** no se cambió el ancho lógico a 320 dp ni se capturó el final de la lista con texto ampliado. TalkBack/VoiceOver: no ejecutados; son verificaciones complementarias fuera del cierre funcional de esta etapa.

**Condición estricta de cierre:** Dashboard y Cards ejecutables en Android, navegación estable, datos exclusivamente enmascarados, pruebas JS relevantes verdes y arquitectura del Paso 02 intacta. Un build Android fallido por error del código implica **PASO 03 INCOMPLETO**; un entorno realmente indisponible implica **BLOQUEADO**, no éxito ficticio.

---

## 14. Matriz de trazabilidad de requisitos

| Requisito del PDF / baseline | Entrega de Paso 03 | Estado posterior |
| --- | --- | --- |
| Una app con Dashboard y dos tabs inferiores (PDF, pág. 2) | Navegación real y accesible | Cerrable en Paso 03 |
| Header/tema/estado compartidos (PDF, pág. 2) | Tema, header y Zustand para productos seguros | Cerrable en Paso 03 |
| Cuentas y tarjetas enmascaradas; `MM/AA` (PDF, pág. 2) | Mocks + repositorios + CardsScreen | Cerrable en Paso 03 |
| Estado preservado al alternar tabs (PDF, pág. 3) | Navegador que conserva la pantalla + store | Cerrable en Paso 03 |
| Botón «Ver datos sensibles» (PDF, pág. 2) | Control visible y deshabilitado con explicación | **Flujo real pendiente del Paso 04** |
| Token y vista nativa (PDF, págs. 2, 4) | Puertos previos sin invocar | Paso 04 |
| Datos sensibles solo en nativo (PDF, pág. 2) | JS usa únicamente información segura | Paso 04 desarrolla el repositorio nativo sensible |
| `<CustomMap />`, beneficios/carrusel (PDF, págs. 2–4) | Tab Beneficios provisional, sin implementación | Pasos 05–06 |
| Pruebas de tarjetas y navegación (PDF, pág. 6) | Jest + RNTL + pruebas de estado | Suite ampliada en Paso 07 |
| Accesibilidad/performance (PDF, págs. 3, 7) | Base real y validación de esta pantalla | Hardening transversal Paso 08 |
| BIAN/Vertical Slicing, SOLID (PDF, pág. 1) | Capabilities + puertos + composición | Aplicación continua en todos los pasos |
| Video, documentación final y sustentación (PDF, págs. 7–8) | README parcial y evidencia técnica | Pasos 10 y 12 |

**Importante:** el objetivo de esta etapa es **avance incremental**, no certificar las Partes 1 y 2 completas del enunciado antes de implementar el trabajo nativo.

---

## 15. Decisiones técnicas y trade-offs que deben poder defenderse

1. **Por qué React Navigation 7.x:** elección estable para un RN CLI 0.88; no se necesitan APIs experimentales de navegación nativa.
2. **Por qué Zustand y no Redux:** estado compartido pequeño (productos seguros) con selectors; no duplicar estado de rutas ni persistir.
3. **Por qué repositorios y data sources para JSON:** permite tests con inyección y reemplazar origen de datos sin modificar UI.
4. **Por qué JSON sin `holder`:** el PDF contiene un ejemplo con titular, pero impone una frontera de seguridad superior: datos completos exclusivamente en nativo.
5. **Por qué el botón está deshabilitado:** evita simular seguridad inexistente y hace explícita una parte funcional pendiente del Paso 04.
6. **Por qué Benefits es placeholder:** el mapa debe ser nativo propio en Paso 05; una simulación JS contaminaría arquitectura y evaluación.
7. **Por qué `FlatList`:** componente virtualizado y preparado para crecimiento; no necesita lista virtualizada de cuentas dentro de otra lista.
8. **Por qué no sobreingeniería:** no introducir frameworks de DI, librerías de animación, queries remotas ni modelos financieros que nadie pidió.
9. **Por qué no cobertura 70% obligatoria aún:** el plan fija la estabilización y umbral global en Paso 07, sin relajar la obligación de pruebas funcionales presentes.
10. **Qué evidencia demostrar:** ejecución real Android, tests observables, comportamiento de cambio de tabs, seguridad por allowlist, README y `git diff`.

Documentar únicamente los trade-offs **realmente tomados** y cualquier desviación necesaria; no copiar esta sección como lista de decisiones ejecutadas si no corresponden al código final.

---

## 16. Formato obligatorio de respuesta del implementador al finalizar

Entregar **en español**, con evidencias concretas:

1. **Resumen funcional:** qué se implementó y qué no (especialmente flujo seguro y Beneficios).
2. **Arquitectura:** árbol real de archivos nuevos/editados y flujo `JSON → DataSource → Repository → presentación/store → UI`.
3. **Navegación y diseño:** rutas, header/tema, controles de accesibilidad, conservación de estado y aspectos adaptativos probados.
4. **Estado:** store Zustand, datos que contiene, cómo evita recarga y cómo se inyectan dependencias.
5. **Seguridad:** ausencia de PAN/CVV/titular completos y por qué no se incluyó `holder`; control «Ver datos sensibles» deshabilitado.
6. **Archivos y paquetes:** lista exacta de cambios; versiones instaladas y justificación de dependencias.
7. **Pruebas:** casos agregados, comando real, resultado, cobertura **solo si se generó**.
8. **Comandos ejecutados:** `PASS / FAIL / NO EJECUTADO`, errores relevantes y resolución.
9. **Evidencia de ejecución:** Android e iOS si se probó, emulador/dispositivo, navegación y limitaciones.
10. **Definition of Done:** checklist del apartado 13 con solo las casillas efectivamente verificadas.
11. **Trade-offs y pendientes:** problemas reales, alcance pospuesto, impacto y acción próxima.
12. **Siguiente paso:** `STEP-04-NATIVE-SECURE-VIEW.md`, **sin crearlo ni ejecutarlo**.

**No afirmar** que la app ya cumple el flujo completo del PDF, que la vista es segura, que existe un bridge o que el mapa está implementado. **No dar por superada una prueba que solo está descrita.**

---

## 17. Referencias técnicas (solo consulta; no sustituir el PDF)

**Fuente normativa y decisiones locales:**

1. `Reto técnico - Chapter Master Frontend.pdf`, págs. 1–4, 6–8.
2. `RETO_BCP_TECHNICAL_BASELINE.md`, especialmente secciones 3–8, 16–21, 27–32.
3. `docs/steps/STEP-01-BOOTSTRAP.md`, bootstrap validado.
4. `docs/steps/STEP-02-ARCHITECTURE.md`, contratos aprobados.

**Documentación oficial de integración:**

- React Navigation 7.x — inicio: <https://reactnavigation.org/docs/7.x/getting-started/>
- React Navigation 7.x — bottom tabs: <https://reactnavigation.org/docs/7.x/bottom-tab-navigator/>
- React Navigation — testing: <https://reactnavigation.org/docs/testing/>
- React Navigation — safe areas: <https://reactnavigation.org/docs/handling-safe-area/>
- Zustand — `create` y selectors: <https://zustand.docs.pmnd.rs/reference/apis/create>
- React Native — listas: <https://reactnative.dev/docs/flatlist>
- React Native — accesibilidad: <https://reactnative.dev/docs/accessibility>
- React Native Testing Library: <https://callstack.github.io/react-native-testing-library/>

Comprobar siempre que las guías consultadas correspondan a las **versiones instaladas**. No migrar el stack solo porque la documentación general muestre una release más reciente.

---

## 18. Principio de cierre

> **Paso 03 debe entregar una experiencia React Native real, profesional y testeable de Dashboard + Mis productos, sobre los contratos ya creados, sin comprometer la frontera de seguridad de la futura librería nativa.**
>
> Una funcionalidad que aún no existe debe identificarse como pendiente; una funcionalidad implementada debe poder ejecutarse, probarse y explicarse ante el Chapter Frontend de BCP.

**Al terminar el Paso 03, detente. El siguiente documento se diseñará y aprobará por separado.**
