# STEP-02 — Arquitectura y contratos

> **Actualización de alcance — 06/11/2026:** el Paso 08 fue **OMITIDO por decisión del propietario**, por resultar redundante para el reto BCP. Su documento de ejecución fue eliminado. Las referencias históricas a esa etapa corresponden al plan original y no constituyen trabajo pendiente ni un requisito de cierre. Este paso conserva su aprobación y sus controles implementados.

**Proyecto:** `io-products-benefits`<br>
**Aplicación:** iO Productos & Beneficios<br>
**Librería nativa futura:** `io-native-components`<br>
**Etapa:** 02 de 12<br>
**Estado:** Completado el 5 de noviembre de 2026<br>
**Prerequisito:** `STEP-01-BOOTSTRAP.md` completado y sus Definition of Done aprobados el 4 de noviembre de 2026<br>
**Plataforma prioritaria:** Android + Kotlin<br>
**Plataforma adicional:** iOS + Swift, Paso 11<br>
**Documento rector:** `RETO_BCP_TECHNICAL_BASELINE.md`<br>
**Referencia normativa del reto:** `Reto técnico - Chapter Master Frontend.pdf`

---

## 1. Instrucciones de implementación

> **Actúa como un Chapter Frontend / Senior React Native Engineer**, con criterio en Clean Architecture, SOLID, Vertical Slicing por capabilities alineadas al lenguaje de BIAN, TypeScript estricto y React Native New Architecture.
>
> **Ejecuta solamente el PASO 02 — ARQUITECTURA Y CONTRATOS.** El Paso 01 ya terminó satisfactoriamente. No reinicialices el proyecto, no repitas el bootstrap y no implementes funcionalidades reservadas para las etapas 03 a 12.
>
> Trabaja **dentro del repositorio existente** `io-products-benefits`, preservando la compilación, el arranque, la prueba de humo y la configuración verificada del Paso 01.
>
> Tu objetivo es dejar una arquitectura **real, mínima, tipada, verificable y preparada para evolucionar**, no crear una aplicación funcional todavía ni multiplicar abstracciones sin consumidores identificables.

### 1.1. Orden de lectura y precedencia

Antes de modificar código:

1. Lee completo `RETO_BCP_TECHNICAL_BASELINE.md`.
2. Lee `docs/steps/STEP-01-BOOTSTRAP.md` y confirma qué se implementó realmente en el repositorio. Si el archivo está en otra ruta, localízalo sin duplicarlo.
3. Lee `Reto técnico - Chapter Master Frontend.pdf` **si está disponible localmente**. Si no está en el repositorio, utiliza las exigencias ya transcritas en el documento maestro y reporta su ausencia; no inventes contenido del PDF.
4. Inspecciona `src/`, `App.tsx`, `tsconfig.json`, `package.json`, scripts npm, ESLint, Prettier, Jest y el estado Git para comprobar la línea base.
5. Ante una discrepancia: **PDF oficial > requisitos internos del documento maestro > decisiones de este paso > preferencias de implementación**. No hagas cambios importantes por suposiciones; registra el conflicto concreto y conserva la alternativa más fiel al PDF.

### 1.2. Regla de ejecución

- Cambia únicamente lo necesario para crear los contratos y las fronteras previstas en este documento.
- **No borres ni reescribas** la pantalla de bootstrap, el entry point o los tests existentes salvo corrección mínima y justificada.
- No declares como ejecutado un comando que no hayas corrido.
- No hagas `git commit`, `push`, publicaciones, cambios de remoto ni operaciones que expongan credenciales.
- Al finalizar, entrega el reporte del apartado 16 y **detente**; el siguiente paso será 03, pero no debes ejecutarlo.

---

## 2. Decisiones cerradas y alcance exacto

| Tema | Decisión obligatoria |
| --- | --- |
| Aplicación | React Native Community CLI, sin Expo |
| Versión RN | Mantener la versión **0.88.0** aprobada en Paso 01 |
| Lenguaje | TypeScript con `strict: true` |
| Nombres | `IoProductsBenefits`, `io-products-benefits`, `io-native-components`, `com.ioproductsbenefits` |
| Arquitectura | **Capability-first** con separación interna `domain / application / infrastructure / presentation` |
| Capabilities | `cards` = **Cards / Account Management**; `benefits` = **Benefits** |
| Transversales | `app` para composición y `shared` solo para contratos realmente transversales |
| Dependencias | Apuntan **hacia el dominio**; detalles externos dependen de puertos, no al revés |
| Datos | Interfaces de repositorios y data sources; **sin implementar mocks JSON todavía** |
| Nativo | Una sola librería futura, `io-native-components`; TurboModule para la vista segura y Fabric para `CustomMap` |
| Prioridad | Android/Kotlin primero; iOS/Swift en Paso 11 |
| Navegación / estado | React Navigation y Zustand **se integran en su etapa funcional**, no ahora |
| Calidad | Mantener npm, lockfile, lint, formato, typecheck y test existentes |

**Definición de éxito de este paso:** los modelos y puertos se pueden importar, los límites de dependencia son claros, las decisiones de bridge están documentadas, los checks están verdes y **la app sigue mostrando la pantalla de bootstrap sin nuevos flujos de producto**.

---

## 3. Arquitectura objetivo

### 3.1. Principio de diseño

La división principal es **vertical por capability**, y cada capability organiza internamente sus capas de Clean Architecture. No construir cuatro carpetas globales (`domain/`, `application/`, etc.) que mezclen tarjetas y beneficios.

```text
src/
├── app/                           # entrada y composición futura de dependencias
├── capabilities/
│   ├── cards/                     # BIAN: Cards / Account Management
│   │   ├── domain/
│   │   │   ├── models/
│   │   │   │   ├── Account.ts
│   │   │   │   └── Card.ts
│   │   │   └── repositories/
│   │   │       ├── AccountRepository.ts
│   │   │       └── CardRepository.ts
│   │   ├── application/
│   │   │   └── ports/
│   │   │       ├── SecureTokenProvider.ts
│   │   │       └── SecureViewGateway.ts
│   │   ├── infrastructure/
│   │   │   └── datasources/
│   │   │       ├── AccountsDataSource.ts
│   │   │       └── CardsDataSource.ts
│   │   └── presentation/          # reservado para Paso 03
│   └── benefits/                  # BIAN: Benefits
│       ├── domain/
│       │   ├── models/
│       │   │   └── Benefit.ts
│       │   └── repositories/
│       │       └── BenefitRepository.ts
│       ├── application/
│       │   └── ports/
│       │       └── AvailableCardBrandsReader.ts
│       ├── infrastructure/
│       │   └── datasources/
│       │       └── BenefitsDataSource.ts
│       └── presentation/
│           └── contracts/
│               └── CustomMapContracts.ts
└── shared/
    └── domain/
        └── CardBrand.ts          # vocabulario mínimo usado por ambas capabilities

docs/
├── steps/
│   ├── STEP-01-BOOTSTRAP.md
│   └── STEP-02-ARCHITECTURE.md
└── decisions/                     # usar solo ante ADRs reales y justificados

packages/                           # contenedor del Paso 01; NO crear aún la librería
android/                            # intacto en este paso
ios/                                # intacto en este paso
```

Esta es una **estructura objetivo**, no una orden de generar archivos vacíos indiscriminadamente. Crea los archivos de contratos que se especifican en los apartados 5 a 8. Si un directorio de presentación queda sin contenido, conserva el directorio previo del bootstrap o utiliza `.gitkeep` únicamente si hace falta versionarlo. No crear `index.ts` o barrels que no faciliten un uso concreto.

### 3.2. Responsabilidad por capa

| Capa | Responsabilidad | No debe conocer |
| --- | --- | --- |
| `domain` | Entidades/modelos seguros, interfaces de repositorio y vocabulario del negocio | React, React Native, Zustand, JSON, UI, Kotlin, Swift, APIs nativas |
| `application` | Puertos de casos de uso, coordinación futura, contrato de token y sesión | SDK Android/iOS, `NativeModules`, UI concreta, acceso directo a JSON |
| `infrastructure` | Data sources, mappers, repositorios concretos y adaptadores de APIs **cuando se implementen** | Componentes/pantallas; decisiones de layout |
| `presentation` | Componentes, hooks, estado de pantalla y contratos de componentes visuales | Detalles físicos de persistencia, datos sensibles completos, Kotlin/Swift directos |
| `app` | Composición de implementaciones, inicialización, navegación y DI manual futura | Reglas de negocio duplicadas |
| `shared` | Solo piezas genuinamente transversales y estables | Dependencias internas de `cards` o `benefits` |
| `packages/io-native-components` (futuro) | Una librería propia con mapa y vista segura | Lógica de UI React Native de las tabs |

### 3.3. Sentido permitido de dependencias

```text
           app / composition root (posterior)
                      |
       +--------------+--------------+
       |                             |
   cards capability             benefits capability
       |                             |
  presentation                   presentation
       |                             |
  application                    application
       |                             |
     domain                        domain
       ^                             ^
       |                             |
 infrastructure                 infrastructure

         shared/domain/CardBrand
              (sin imports a capabilities)

  [Paso 04/05] infrastructure/presentation adapters
               ---> io-native-components
```

**La flecha conceptual de dependencias de código va siempre hacia abstracciones interiores.** Los repositorios concretos implementarán interfaces de dominio; la infraestructura nativa implementará puertos de aplicación o contratos de UI. Las capas interiores no deben importar las exteriores.

### 3.4. Reglas exigibles

1. `domain` no importa `application`, `infrastructure`, `presentation`, `app`, `react`, `react-native` ni terceros de infraestructura.
2. `application` importa su `domain` y, si hace falta, contratos transversales de `shared`; nunca importa implementaciones de `infrastructure`, componentes UI o `NativeModules`.
3. `infrastructure` puede importar contratos de `domain` y `application` **de su propia capability**; los detalles quedan encapsulados.
4. `presentation` puede consumir la API pública de la capability y sus puertos, pero no importa `infrastructure/datasources` ni SDK nativos.
5. `shared` **no importa ninguna capability**.
6. `cards` y `benefits` **no importan directorios privados una de la otra**. Una dependencia transversal se expresa mediante `shared` o un **puerto definido por la capability consumidora** y se resuelve luego en `app`.
7. `App.tsx` debe continuar como entry point delgado. No convertirlo en service locator ni en lugar de implementar reglas de negocio.
8. No añadir contenedor de inyección de dependencias, event bus global, framework de state machines ni paquetes de arquitectura para cumplir estas reglas.

---

## 4. Política de modelos y seguridad de tipos

- Escribir interfaces o tipos **exportados y explícitos**. Usar `import type` cuando corresponda.
- Preferir `readonly` en objetos de dominio y arreglos expuestos por repositorios.
- `CardBrand` será vocabulario común al filtrado por `applicableBrands` y las tarjetas del usuario. Mantenerlo como cadena normalizada por los adapters que se desarrollarán después; no fijar un catálogo cerrado no requerido por el PDF.
- Los identificadores de tarjeta y cuenta son `string`; el identificador del beneficio es `number` (tal como el mock oficial). **El identificador del marcador nativo es `string`.** La transformación será explícita en Paso 05.
- No introducir `any` para resolver contratos; utilizar `unknown` únicamente en fronteras no confiables y transformarlo antes de llegar al dominio.
- TypeScript no sustituye la validación de datos JSON en runtime. Cuando se implementen data sources, deberán **proyectar solamente los campos seguros permitidos**, aun cuando el objeto de entrada tenga propiedades adicionales.
- Evitar tipos con datos sensibles completos, incluso si sus campos son opcionales. Ninguna interfaz pública React Native debe modelar PAN completo, CVV o titular completo.

---

## 5. Contratos de Cards / Account Management

### 5.1. Vocabulario compartido

**Archivo:** `src/shared/domain/CardBrand.ts`

```ts
/** Marca de tarjeta normalizada por los adapters de datos futuros. */
export type CardBrand = string;
```

**Decisión:** `string` evita inventar un catálogo excluyente a partir del único ejemplo `VISA`. Se exigirá normalización (mayúsculas y formato consistente) en la implementación de datos/filtrado del Paso 05. No implementar esa normalización en este paso.

### 5.2. Modelo público y seguro de tarjeta

**Archivo:** `src/capabilities/cards/domain/models/Card.ts`

```ts
import type {CardBrand} from '../../../../shared/domain/CardBrand';

export interface Card {
  readonly cardId: string;
  readonly alias: string;
  readonly maskedPan: string; // Ejemplo visual: **** **** **** 1234
  readonly brand: CardBrand;
  readonly expiry: string; // MM/AA; validación/render en Paso 03
  readonly accountId: string;
}
```

**Restricción crítica — `holder` del ejemplo del PDF:** la muestra `cards.json` del enunciado contiene un campo `holder`, pero el mismo PDF establece expresamente que el **titular completo solo vive en la librería nativa**. Por lo tanto, la representación **pública de RN** `Card` **NO** tendrá `holder`, `fullPan`, `pan`, `cvv`, `cardNumber` completo ni equivalentes. En Paso 03, los fixtures de JavaScript deberán omitir el nombre completo y proyectar únicamente campos seguros. El mock **interno nativo** con titular/PAN/CVV se añadirá en Paso 04, separado de JS.

`maskedPan` es una representación visual segura, no una fuente de verdad para extraer PAN. `expiry` se expone según el requisito del PDF; la expiración de tarjeta no reemplaza la expiración del token.

### 5.3. Modelo mínimo de cuenta

**Archivo:** `src/capabilities/cards/domain/models/Account.ts`

```ts
export interface Account {
  readonly accountId: string;
  readonly alias: string;
  readonly maskedNumber?: string;
}
```

**Decisión explícita:** el PDF exige mostrar cuentas, pero no proporciona un `accounts.json` ni un schema oficial. Se define el mínimo necesario, sin fabricar saldos, tipos de moneda, movimientos ni números de cuenta completos. El modelo puede evolucionar cuando exista un caso de uso demostrado.

### 5.4. Repositorios de dominio

**Archivo:** `src/capabilities/cards/domain/repositories/CardRepository.ts`

```ts
import type {Card} from '../models/Card';

export interface CardRepository {
  listCards(): Promise<readonly Card[]>;
}
```

**Archivo:** `src/capabilities/cards/domain/repositories/AccountRepository.ts`

```ts
import type {Account} from '../models/Account';

export interface AccountRepository {
  listAccounts(): Promise<readonly Account[]>;
}
```

No acoplar estas interfaces a `fetch`, AsyncStorage, rutas `.json`, `require`, Redux/Zustand ni detalles de UI.

### 5.5. Fuentes de datos (infraestructura)

**Archivo:** `src/capabilities/cards/infrastructure/datasources/CardsDataSource.ts`

```ts
import type {Card} from '../../domain/models/Card';

/** Contrato seguro de datos de entrada ya depurados para la app RN. */
export type CardRecord = Readonly<Card>;

export interface CardsDataSource {
  readCards(): Promise<readonly CardRecord[]>;
}
```

**Archivo:** `src/capabilities/cards/infrastructure/datasources/AccountsDataSource.ts`

```ts
import type {Account} from '../../domain/models/Account';

export type AccountRecord = Readonly<Account>;

export interface AccountsDataSource {
  readAccounts(): Promise<readonly AccountRecord[]>;
}
```

**Trade-off intencional:** DTO y entidad coinciden por ahora porque se consumirá JSON local trivial. Mantener la diferencia **de responsabilidad** entre data source y repositorio sin inventar mappers vacíos. Si en Paso 03 el origen contiene formas no confiables, el data source deberá validar/proyectar y el repositorio concretará la transformación.

### 5.6. Puerto del emisor/renovador de secureToken

**Archivo:** `src/capabilities/cards/application/ports/SecureTokenProvider.ts`

```ts
export interface SecureToken {
  readonly value: string;
  readonly expiresAtEpochMs: number;
}

export interface SecureTokenProvider {
  getOrRenewToken(cardId: string): Promise<SecureToken>;
}
```

- El token **es efímero**, y su `value` es opaco. No persistirlo ni registrarlo en logs.
- El proveedor se implementará en Paso 04, junto con el protocolo mock de generación, renovación, TTL y validación nativa.
- No colocar claves HMAC reales o material criptográfico compartido en el bundle JavaScript.
- Es admisible un protocolo **simulado y documentado** porque el enunciado autoriza token mock. No llamarlo mecanismo de producción.
- El vencimiento del token se expresa en milisegundos Unix (`expiresAtEpochMs`) para no confundirlo con la fecha de vencimiento de tarjeta (`expiry`).

### 5.7. Contrato de sesión segura RN ↔ nativo

**Archivo:** `src/capabilities/cards/application/ports/SecureViewGateway.ts`

```ts
export type SecureViewErrorCode = 'TOKEN_EXPIRED' | 'TOKEN_INVALID';
export type SecureViewCloseReason = 'USER_DISMISS' | 'TIMEOUT';

export interface OpenSecureViewRequest {
  readonly cardId: string;
  readonly secureToken: string;
}

export type SecureViewEvent =
  | {
      readonly name: 'onSecureViewOpened';
      readonly payload: {readonly cardId: string};
    }
  | {
      readonly name: 'onValidationError';
      readonly payload: {
        readonly code: SecureViewErrorCode;
        readonly message: string;
      };
    }
  | {
      readonly name: 'onCardDataShown';
      readonly payload: {readonly cardId: string};
    }
  | {
      readonly name: 'onSecureViewClosed';
      readonly payload: {
        readonly cardId: string;
        readonly reason: SecureViewCloseReason;
      };
    };

export type UnsubscribeSecureView = () => void;

export interface SecureViewGateway {
  openSecureView(request: OpenSecureViewRequest): Promise<void>;
  subscribe(listener: (event: SecureViewEvent) => void): UnsubscribeSecureView;
}
```

**Semántica contractual:**

- `openSecureView` solo recibe `cardId` y `secureToken`. **Nunca** recibe información de tarjeta completa.
- `Promise<void>` es el **contrato de aplicación**, no una imposición literal sobre la firma que Codegen soporte. El futuro adapter traducirá retorno/error del TurboModule a esta interfaz sin filtrar datos sensibles.
- Los cuatro nombres de evento reflejan exactamente el enunciado. Sus payloads incluyen exclusivamente IDs, códigos, mensajes seguros y motivos de cierre.
- `subscribe` devuelve una función de limpieza para evitar listeners acumulados; el adapter será implementado y probado más adelante.
- `onCardDataShown` confirma que el **nativo** renderizó el dato: **no lo devuelve a JS**.
- Las fallas de invocación/indisponibilidad del módulo se normalizarán en el futuro adapter sin exponer payloads internos; `TOKEN_EXPIRED`/`TOKEN_INVALID` representan la validación de negocio nativa, no cualquier fallo de infraestructura.
- La secuencia de eventos debe ser coherente: apertura, resultado de validación, eventual visualización y cierre; un token inválido **nunca** produce `onCardDataShown`.

### 5.8. Estados conceptuales del flujo seguro — sin implementarlos aún

```text
IDLE → TOKEN_REQUESTED → OPENING → OPEN → CLOSED
                           |         |
                           v         v
                    VALIDATION_ERROR TIMEOUT → CLOSED
```

Esta es una **referencia de diseño**, no autorización para crear un store, reducer, máquina de estados o vista segura en este paso. El Paso 04 concretará transiciones, cancelaciones, timer y lifecycle.

---

## 6. Contratos de Benefits

### 6.1. Modelo del beneficio

**Archivo:** `src/capabilities/benefits/domain/models/Benefit.ts`

```ts
import type {CardBrand} from '../../../../shared/domain/CardBrand';

export interface Benefit {
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

Conservar los **nombres y tipos** de `benefits.json` del PDF; no inventar campos de precio, distancia, geofencing o fidelización. `image` se mantiene como `string` (en el ejemplo, URL), sin introducir un proveedor remoto ni lógica de descarga.

### 6.2. Repositorio y data source

**Archivo:** `src/capabilities/benefits/domain/repositories/BenefitRepository.ts`

```ts
import type {Benefit} from '../models/Benefit';

export interface BenefitRepository {
  listBenefits(): Promise<readonly Benefit[]>;
}
```

**Archivo:** `src/capabilities/benefits/infrastructure/datasources/BenefitsDataSource.ts`

```ts
import type {Benefit} from '../../domain/models/Benefit';

export type BenefitRecord = Readonly<Benefit>;

export interface BenefitsDataSource {
  readBenefits(): Promise<readonly BenefitRecord[]>;
}
```

No crear aún `benefits.json`, repositorios concretos, fetching, filtrado, fixtures ni componentes de beneficios.

### 6.3. Dependencia controlada con Cards

La capability de Benefits necesita **conocer las marcas de las tarjetas disponibles** para cumplir `applicableBrands`. No deberá importar `CardsDataSource`, `CardRepository` concreto, store de tarjetas ni archivos internos de `cards`.

**Archivo:** `src/capabilities/benefits/application/ports/AvailableCardBrandsReader.ts`

```ts
import type {CardBrand} from '../../../../shared/domain/CardBrand';

export interface AvailableCardBrandsReader {
  getAvailableBrands(): Promise<readonly CardBrand[]>;
}
```

La composición de la app (en la etapa funcional) conectará este puerto con la fuente legítima de tarjetas. **Este puerto pertenece al consumidor, Benefits**: aplicación práctica del principio de inversión de dependencias. No crear todavía una implementación ni un store global.

**Regla de negocio futura — no codificar ahora:** un beneficio es elegible si `applicableBrands` tiene **intersección no vacía** con las marcas del usuario; el filtrado será probado en Paso 05. Beneficios no elegibles no deben mostrarse en mapa ni carrusel.

### 6.4. Contrato público de CustomMap

**Archivo:** `src/capabilities/benefits/presentation/contracts/CustomMapContracts.ts`

```ts
export interface MapMarker {
  readonly id: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly title?: string; // Solo metadata no sensible
}

/** API orientada a la app; no es todavía una spec de Codegen. */
export interface CustomMapProps {
  readonly markers: readonly MapMarker[];
  readonly selectedMarkerId?: string | null;
  readonly onMarkerPress: (markerId: string) => void;
}
```

**Reglas del contrato:**

- `MapMarker.id` es `string`, aunque `Benefit.id` sea `number`. El mapper posterior deberá definir `id: String(benefit.id)` de forma determinística y reversible cuando se requiera.
- Las coordenadas se validarán **antes de enviarlas al componente nativo**: latitud finita entre `-90` y `90`, longitud finita entre `-180` y `180` (Paso 05). El nativo también debe tolerar entradas inválidas sin caer.
- `markers=[]`, `selectedMarkerId=null` y un ID seleccionado inexistente son situaciones válidas y no deben provocar crashes.
- La **API pública** recibe `onMarkerPress(markerId: string)`. La futura especificación Fabric/Codegen podrá emitir un evento estructurado `{markerId: string}`; el wrapper público lo adaptará.
- `title` es la única metadata opcional prevista inicialmente; no transportar número de tarjeta, token, titular ni información sensible en marcadores.
- `CustomMapProps` es un **contrato de componente**, no una autorización para crear el componente nativo o dibujar un mapa en Paso 02.

### 6.5. Selección y sincronización — decisión de diseño para Paso 06

La **única fuente de verdad** será el identificador del beneficio seleccionado (a nivel de aplicación/presentación, cuando se implemente). El mapa recibe `selectedMarkerId` derivado de ese estado; el carrusel también reacciona a él.

```text
Mapa (evento id) ──┐
                   ├──> selección única ──> carrusel / mapa
Carrusel (id) ────┘
```

No crear un segundo estado de selección dentro del bridge; el mapa solo **refleja la prop** y notifica pulsaciones. Evitar loops de selección por actualizaciones programáticas. Toda la lógica de sincronización queda para el Paso 06.

---

## 7. Contratos nativos y React Native New Architecture

### 7.1. Una sola librería, dos responsabilidades

El PDF exige una **única librería propia**, `io-native-components`, con:

1. **Card Secure View:** pantalla/vista a pantalla completa invocada de forma imperativa desde RN; el acceso a los datos sensibles y su renderizado quedan exclusivamente en Kotlin (y, en Paso 11, Swift).
2. **CustomMap:** componente visual nativo embebido en la pantalla React Native, con `markers`, `selectedMarkerId` y evento `onMarkerPress`.

### 7.2. Decisión de tecnología

| Recurso | Mecanismo futuro | Justificación |
| --- | --- | --- |
| `openSecureView` y eventos de sesión segura | **Turbo Native Module** + especificación TypeScript/Codegen | Operación imperativa y notificaciones de ciclo de vida |
| `<CustomMap />` | **Fabric Native Component** + especificación TypeScript/Codegen | Vista nativa declarativa, props actualizables y evento de interacción |
| Android | Kotlin + APIs del sistema; Google Maps SDK oficial | Plataforma obligatoria del reto |
| iOS (Paso 11) | Swift + APIs Apple; MapKit | Extra explícito, sin bloquear Android |
| Especificaciones JS ↔ nativo | TS estrictamente compatible con Codegen | Contrato auditable, minimiza desajustes de tipos |

**Distinción esencial:** una interfaz TypeScript de arquitectura (`SecureViewGateway`, `CustomMapProps`) **no equivale** a un módulo nativo disponible ni a una especificación Codegen registrada. En el Paso 02 **solo creamos el contrato público de la app**. Las specs Codegen, registro, implementación y empaquetado se añadirán cuando corresponda.

### 7.3. Plan de ubicación futura, sin implementación presente

```text
packages/io-native-components/           # se creará en Paso 04
├── package.json
├── src/
│   ├── specs/                      # specs Codegen reales, más adelante
│   └── index.ts                    # API pública de la librería
├── android/                         # Kotlin: módulo y mapa (Pasos 04/05)
└── ios/                             # Swift, Paso 11
```

- **No crear** hoy `packages/io-native-components/package.json`, `codegenConfig`, `specs/Native*.ts`, `*NativeComponent.ts`, clases Kotlin, Swift, podspec, Gradle de la librería ni placeholders ejecutables.
- No añadir `NativeModules`, `requireNativeComponent`, registro de Legacy Bridge ni dependencias de terceros que resuelvan el ejercicio.
- Los adapters posteriores estarán encapsulados por capability: `cards/infrastructure/native` para `SecureViewGateway` y `benefits` para su wrapper visual; la app no deberá manipular directamente `TurboModuleRegistry` ni Codegen fuera de la integración de la librería.
- El nombre `CustomMap` debe mantenerse consistente entre la API pública, Fabric y la documentación; la denominación interna del TurboModule se fijará durante Paso 04 sin inventarla aquí.
- Cuando se creen specs Codegen, revisar el **subconjunto de tipos admitidos por RN 0.88**. No asumir que un `readonly`, unión discriminada, `Promise<void>` o callback TypeScript de la API pública se transpila literalmente a Codegen; introducir una adaptación explícita si es necesario.
- No forzar Swift/MapKit antes del Paso 11, pero evitar en los contratos públicos tipos específicos de Kotlin o Android.

### 7.4. Mapa de eventos exigidos

| Emisor nativo | Evento público | Payload permitido | Consumidor RN futuro |
| --- | --- | --- | --- |
| Vista segura | `onSecureViewOpened` | `cardId` | Gestión de sesión |
| Vista segura | `onValidationError` | `code`, `message` | Manejo de error seguro |
| Vista segura | `onCardDataShown` | `cardId` | Confirmación de render nativo |
| Vista segura | `onSecureViewClosed` | `cardId`, `reason` | Limpieza de sesión |
| Mapa | `onMarkerPress` | `markerId` | Selección de beneficio/carrusel |

Códigos previstos por el PDF: `TOKEN_EXPIRED`, `TOKEN_INVALID`; motivos de cierre: `USER_DISMISS`, `TIMEOUT`. No añadir mensajes que incluyan el token, PAN, titular, CVV o datos del mock nativo.

---

## 8. Reglas de seguridad desde la arquitectura

### 8.1. Frontera de datos sensibles

```text
React Native / JavaScript
  cardId, alias, maskedPan, brand, expiry, accountId
  secureToken efímero (solo al invocar el gateway)
            |
            | openSecureView({cardId, secureToken})
            v
io-native-components / Kotlin (Paso 04)
  validación de token mock + TTL
  mock privado PAN completo / CVV / titular completo
  renderizado exclusivamente en pantalla nativa protegida
            |
            | eventos de estado SIN información sensible
            v
React Native / JavaScript
```

**Prohibiciones inmediatas, incluso en código de prueba:**

- No representar PAN completo, CVV ni titular completo en interfaces, estado, fixtures JSON/TS, logs, errores, snapshots, props, bridge o eventos JavaScript.
- No usar `AsyncStorage` para secretos ni para el token. No integrar almacenamiento seguro todavía; si fuese necesario más adelante, se resolverá con mecanismos nativos justificados.
- No registrar `secureToken` ni dejarlo en Zustand, Redux o estado persistente.
- No crear un archivo mock JS que replique los secretos de la futura librería nativa.
- No poner claves HMAC productivas en JS. La futura firma/validación será una **simulación demostrativa**, jamás una promesa de seguridad productiva.

### 8.2. Controles cuya implementación queda para Paso 04/08

- Android: `FLAG_SECURE` mientras el contenido protegido esté visible.
- Protección al pasar a background: ocultar/cubrir inmediatamente el contenido.
- Tiempo de vida de vista segura: **45 segundos** como decisión inicial del documento maestro (dentro de los 30–60 s del PDF).
- Acción explícita **Ocultar** y cierre por `USER_DISMISS` o `TIMEOUT`.
- Validación de token antes de cualquier render sensible; error para tokens inválidos/expirados o firma simulada incorrecta.
- Ausencia de logs sensibles, demostrable en pruebas y documentación final.

No implementar ninguno de estos controles en Paso 02; **documentarlos como invariantes que condicionan los puertos**.

### 8.3. Seguridad no equivale a tipado

El contrato `Card` carece de campos sensibles, pero un objeto de JS puede traer propiedades adicionales en runtime. En Paso 03 el mapper/data source debe crear **objetos nuevos mediante allowlist** (`cardId`, `alias`, `maskedPan`, `brand`, `expiry`, `accountId`) y descartar lo demás. No hacer cast de un JSON completo a `Card` si conserva propiedades de titular.

---

## 9. Composición, estado y uso de los contratos

- La composición final debe conectar los data sources con repositorios concretos y estos con casos de uso/hooks; **el wiring se hará al construir las pantallas y servicios de sus respectivos pasos**.
- Una fábrica de dependencias pequeña, manual, ubicada en `src/app/`, será suficiente si hace falta. No adoptar Inversify, tsyringe ni un service locator.
- Zustand está aprobado como estado compartido **futuro**. No instalarlo ni construir stores durante este paso.
- Evitar duplicar la lista de tarjetas en cada tab. La futura información de marcas se compartirá por el puerto `AvailableCardBrandsReader` o un selector de estado centralizado, sin importar infraestructura de una capability desde otra.
- Los estados de UI futuros `loading`, `success`, `empty` y `error` se resolverán en presentación; no crear tipos genéricos de estado asincrónico sin consumidores en Paso 02.
- La futura persistencia del estado al cambiar tabs debe conservar la selección necesaria y la experiencia del Dashboard, pero no incluye guardar el token ni datos sensibles.

---

## 10. Convenciones de implementación

1. Mantener nombres de carpetas `cards`, `benefits`, `domain`, `application`, `infrastructure`, `presentation`, `models`, `repositories`, `ports`, `datasources` como se especifica.
2. Tipos/interfaces/componentes React: `PascalCase`. Funciones, variables, hooks: `camelCase`. Archivos de modelos y contratos: como los nombres de tipos públicos indicados. Nada de abreviaturas ambiguas.
3. Preferir **named exports** para modelos, puertos y contracts; evitar `default export` en esos archivos.
4. Imports relativos correctos y `import type` donde aplique. No añadir aliases de paths, Babel plugins, transformadores ni cambios a Metro solo por conveniencia.
5. No mezclar responsabilidades: el modelo `Benefit` no conoce un componente Fabric y el modelo `Card` no conoce secureToken.
6. No añadir implementaciones falsas que devuelvan arrays vacíos o lancen `not implemented` solo para compilar; un puerto sin implementación todavía es válido.
7. Conservar la configuración vigente de Jest, ESLint y Prettier. No suprimir problemas con `any`, `@ts-ignore`, `eslint-disable` global ni casts injustificados.
8. No añadir paquetes npm, Gradle o CocoaPods nuevos para formalizar estos contratos. Solo código TypeScript, documentación y, si se justifica, comprobación estática liviana con tooling existente.
9. Las dependencias entre capabilities deben quedar visibles y justificables. `shared` no es un cajón para mover clases que no se saben ubicar.
10. No aplicar patrones por catálogo: Repository, Ports/Adapters y Composition Root resuelven necesidades concretas del reto; no añadir CQRS, GraphQL, event sourcing, DI framework ni state machine externa.

---

## 11. Tareas concretas del implementador — ejecutar en este orden

### Tarea A — Verificar baseline, sin modificarla

- Localizar el root real del repositorio y confirmar RN, TS `strict`, scripts, pruebas de humo y estructura creada en Paso 01.
- Capturar un resumen del `git status --short` previo. **No descartar cambios previos del propietario**.
- Revisar si ya existen algunos contratos; reutilizarlos si cumplen estas reglas sin crear duplicados.
- No reinstalar dependencias ni reconstruir Android si nada del runtime ha cambiado; validar al final según el apartado 13.

### Tarea B — Crear el vocabulario y modelos de dominio

- `shared/domain/CardBrand.ts`.
- `cards/domain/models/Account.ts`, `Card.ts`.
- `benefits/domain/models/Benefit.ts`.
- Confirmar que **no hay propiedades sensibles completas** en `Card` ni otros modelos RN.

### Tarea C — Crear interfaces de repositorio y data source

- `cards/domain/repositories/AccountRepository.ts`, `CardRepository.ts`.
- `cards/infrastructure/datasources/AccountsDataSource.ts`, `CardsDataSource.ts`.
- `benefits/domain/repositories/BenefitRepository.ts`.
- `benefits/infrastructure/datasources/BenefitsDataSource.ts`.
- No agregar JSON, lógica de filtrado, HTTP, AsyncStorage ni implementaciones concretas.

### Tarea D — Crear contratos de puertos y componentes

- `cards/application/ports/SecureTokenProvider.ts`.
- `cards/application/ports/SecureViewGateway.ts`.
- `benefits/application/ports/AvailableCardBrandsReader.ts`.
- `benefits/presentation/contracts/CustomMapContracts.ts`.
- Usar las firmas y uniones discriminadas indicadas en este documento, o equivalentes estrictamente compatibles y **justificados**.

### Tarea E — Documentar límites y decisiones

Agregar una sección de arquitectura **breve** en el `README.md` inicial o un documento de arquitectura compacto en `docs/` enlazado desde el README; preferir un único lugar para no duplicar la misma explicación. Debe contener:

1. Diagrama de capabilities y dependencias.
2. Qué pertenece a cada capa.
3. Por qué hay un puerto `AvailableCardBrandsReader` y un solo vocabulario `CardBrand`.
4. Contrato público de `SecureViewGateway` y `CustomMap`.
5. Decisión TurboModule vs Fabric, y que ambos pertenecerán a **una sola librería**.
6. Regla de datos sensibles, incluida la exclusión del `holder` completo de JS pese al ejemplo `cards.json`.
7. Tabla de etapas posteriores que materializarán los contratos.

Crear un ADR en `docs/decisions/` **solo si hace falta registrar un trade-off nuevo real** (por ejemplo, frontera de `holder` y adaptación Codegen); no generar ADRs mecánicos.

### Tarea F — Validar y detenerse

- Ejecutar los comandos del apartado 13 que existan en el proyecto real.
- Verificar manualmente los límites y el diff: no hay implementación funcional ni paquetes incorporados.
- Si existe una forma **simple** de hacer que ESLint valide imports prohibidos por carpeta, usarla solo si no altera el ecosistema del Paso 01; de lo contrario incluir en el reporte una inspección explícita de imports. No instalar dependency-cruiser ni introducir una infraestructura de reglas compleja para 12–15 contratos.
- Entregar evidencias, DoD y pendientes, y **no avanzar a Paso 03**.

---

## 12. Matriz de trazabilidad hacia el PDF y el plan

| Exigencia | Contrato/decisión del Paso 02 | Implementación posterior |
| --- | --- | --- |
| Cuentas y tarjetas enmascaradas | `Account`, `Card`, repositorios | Paso 03 |
| `cards.json` | Shape seguro `CardRecord` | Paso 03, sin titular completo en JS |
| Token RN y vista segura | `SecureTokenProvider`, `SecureViewGateway` | Paso 04 |
| Eventos de sesión segura | `SecureViewEvent` y códigos oficiales | Paso 04 / pruebas Paso 07 |
| Seguridad de PAN/CVV/titular | Límite nativo obligatorio | Pasos 04 y 08 |
| `benefits.json` | `Benefit`, repositorio, data source | Paso 05 |
| Beneficios por `applicableBrands` | `CardBrand`, `AvailableCardBrandsReader` | Paso 05 |
| `<CustomMap />` propio | `CustomMapProps`, `MapMarker` | Paso 05, Fabric + Google Maps SDK |
| Marcador ↔ carrusel | ID único y evento `onMarkerPress` | Paso 06 |
| Testing unitario obligatorio | Puertos testeables y tipos estrictos | Paso 07; preservar smoke test ahora |
| A11y/performance/hardening | Separación entre presentación y reglas | Pasos 03, 05, 06, 08 |
| Soporte iOS adicional | Contratos públicos sin Kotlin/Android | Paso 11 |
| Defensa técnica | Decisiones y trade-offs documentados | Paso 12 |

---

## 13. Validaciones reproducibles del Paso 02

### 13.1. Checks de código

Ejecutar **desde la raíz del repositorio**, reutilizando los scripts comprobados del Paso 01:

```bash
npm run lint
npm run typecheck
npm run format:check
npm test -- --watch=false
```

Si el nombre de un script difiere en el repo real, usar el equivalente definido allí y **registrar el comando exacto**. Si el formateador incluye este Markdown, ajustar solo el formato del documento creado; no reformatear masivamente archivos ajenos.

### 13.2. Validación de la estructura y de las fronteras

Inspeccionar y reportar:

- Existen exactamente los modelos y puertos esperados en sus capabilities; no hay duplicados de `Card`, `Benefit` o `CardBrand`.
- Todos los imports relativos resuelven (`typecheck` sin fallos).
- `domain` y `application` no importan `react`, `react-native`, `NativeModules`, `TurboModuleRegistry`, `zustand`, `infrastructure`, `presentation` ni detalles de SDK.
- `shared` no importa `cards` ni `benefits`.
- Benefits no importa internals de Cards; utiliza `AvailableCardBrandsReader`.
- El modelo público `Card` y demás contratos RN carecen de PAN completo, CVV y titular completo; el token solo figura en el contrato de invocación.
- No hay implementaciones de mapas, vista segura, repositorios JSON, navegación, store Zustand o pantallas de producto.
- `package.json`, `package-lock.json`, `android/`, `ios/`, Metro, Gradle y Pods se mantienen sin cambios innecesarios.

**Sugerencia de inspección:** `git diff --stat`, `git diff --check`, `git status --short`, búsqueda de imports prohibidos con `rg` (si está disponible) y revisión de archivos `.ts`. Los comandos de búsqueda son apoyo, no sustituyen la revisión semántica. **No declarar PASS porque `rg` no esté instalado.**

### 13.3. Runtime / regresión

La compilación Android y la pantalla inicial ya fueron validadas en Paso 01. Como Paso 02 solo añade declaraciones TypeScript sin modificar el runtime nativo, no se exige reinstalar/build completo **si no hubo cambios ejecutables**. Si el entorno está disponible, un nuevo `npm run android` es evidencia adicional; si no se ejecuta, registrar **NO EJECUTADO — no requerido por cambios de contratos**, sin inventar una ejecución.

Si un error de `typecheck`/Jest obliga a tocar el bootstrap, realizar el ajuste más pequeño y documentarlo. Los tests de negocio y de bridge se implementarán cuando existan comportamientos reales, no con mocks vacíos en este paso.

### 13.4. Criterios específicos de seguridad

- Revisar diff, contratos y documentación: ningún valor PAN completo, CVV, nombre completo de titular ni secreto HMAC real.
- `Card` nunca contiene `holder` completo.
- `OpenSecureViewRequest` contiene **exactamente** `cardId` y `secureToken`.
- `SecureViewEvent` solo transporta los payloads permitidos.
- La nota sobre el mock oficial y el límite de datos sensibles es explícita.

---

## 14. Definition of Done — Paso 02

**Marcar cada casilla únicamente al constatar evidencia real en el repositorio. No marcar nada por el solo hecho de aparecer en este prompt.**

### 14.1. Arquitectura

- [x] Paso 01 conservado; no se reinicializó RN ni se modificó injustificadamente la configuración validada.
- [x] Estructura capability-first (`cards`, `benefits`) y capas internas consistente.
- [x] `shared` contiene solo el vocabulario verdaderamente compartido (`CardBrand`) de esta etapa.
- [x] Se definieron los sentidos de dependencia y no hay imports prohibidos entre capas.
- [x] Benefits no accede a implementaciones internas de Cards.

### 14.2. Modelos y puertos

- [x] `Card`, `Account`, `Benefit` y `CardBrand` creados con tipos correctos.
- [x] `CardRepository`, `AccountRepository` y `BenefitRepository` creados.
- [x] `CardsDataSource`, `AccountsDataSource` y `BenefitsDataSource` creados.
- [x] `SecureTokenProvider` con contrato efímero y expiración tipada creado.
- [x] `SecureViewGateway` creado con apertura, suscripción, limpieza y cuatro eventos seguros.
- [x] Códigos `TOKEN_EXPIRED`, `TOKEN_INVALID` y motivos `USER_DISMISS`, `TIMEOUT` tipados.
- [x] `AvailableCardBrandsReader` definido sin dependencia directa sobre la infraestructura de Cards.
- [x] `MapMarker` y `CustomMapProps` tipados, con selección opcional y `onMarkerPress`.
- [x] Se documentó la conversión futura `Benefit.id: number` → `MapMarker.id: string`.

### 14.3. Nativo y seguridad

- [x] Diseño futuro TurboModule (sesión segura) / Fabric (mapa) coherente con React Native New Architecture.
- [x] Ambos recursos se proyectan dentro de **una sola** librería `io-native-components`.
- [x] No se añadió código Kotlin, Swift, Codegen ni bridge funcional fuera de etapa.
- [x] Los contratos React Native no incluyen PAN completo, CVV ni titular completo.
- [x] Se explicó por qué el `holder` completo del ejemplo PDF no se reproduce en los datos JS.
- [x] Se documentó que el `secureToken` mock no representa seguridad productiva.
- [x] No se agregaron secretos ni logs sensibles.

### 14.4. Calidad y alcance

- [x] `npm run lint` — **PASS real** (o equivalente identificado).
- [x] `npm run typecheck` — **PASS real** (o equivalente identificado).
- [x] `npm run format:check` — **PASS real** (o equivalente identificado).
- [x] `npm test -- --watch=false` — **PASS real**; smoke test de Paso 01 preservado.
- [x] `git diff --check` sin errores de whitespace en el diff actual.
- [x] README/documentación de arquitectura actualizados con decisiones defendibles.
- [x] No hay nuevas dependencias innecesarias ni implementación de funcionalidad de los pasos 03–12.
- [x] Se comunicaron los comandos exactos, resultados, archivos modificados, decisiones y bloqueos.

**Condición de cierre:** los contratos están completos y compilables, las fronteras están claras, **todos los checks JS aplicables pasan**, no se ha afectado el bootstrap y no existe código funcional de etapas futuras. Si un check falla, registrar la etapa como **BLOQUEADA / INCOMPLETA**, con causa raíz y acción concreta.

### 14.5. Registro de cierre — 5 de noviembre de 2026

**Resultado:** Paso 02 cerrado, 29/29 criterios verificados. Se crearon 14 archivos TypeScript de modelos y contratos; el README documenta capas, seguridad y etapas de implementación. El Paso 01, su pantalla y su prueba de humo permanecen intactos.

| Validación ejecutada | Resultado final |
| --- | --- |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run format:check` | PASS tras aplicar `npm run format` a los contratos nuevos |
| `npm test -- --watch=false` | PASS: 1 prueba de arranque |
| `git diff --check` | PASS |
| Revisión de imports y propiedades públicas de `Card`, `OpenSecureViewRequest` y eventos | PASS |
| `npm run android` / `npm run ios` | NO EJECUTADO: el Paso 02 no cambió el runtime; los arranques se validaron en el Paso 01 |

No hay bloqueos del Paso 02. La eliminación previa de `docs/STEP-01-BOOTSTRAP.md` se conservó como cambio del propietario. No se hizo commit ni push. El siguiente paso es `STEP-03-DASHBOARD-CARDS.md`; aún no se ha iniciado.

---

## 15. Fuera de alcance — prohibiciones explícitas

**No implementar en este paso:**

- Dashboard, bottom tabs, React Navigation, header definitivo o pantallas de productos/beneficios (**Paso 03/05**).
- `cards.json`, `accounts.json`, `benefits.json` o repositorios/data sources **concretos** (**Paso 03/05**).
- Listados, render de tarjetas, selección de producto o visualización de datos **Paso 03**.
- Generación/renovación/validación real de token, HMAC simulada, Secure Card View, FLAG_SECURE, timeout, listeners nativos (**Paso 04**).
- Creación efectiva de `packages/io-native-components`, `codegenConfig`, specs Codegen, `TurboModuleRegistry`, Fabric ViewManager, Android Maps SDK (**Pasos 04/05**).
- Filtrado real `applicableBrands`, marcadores renderizados, mapa y carrusel (**Pasos 05/06**).
- Sincronización interactiva mapa ↔ carrusel (**Paso 06**).
- Baterías completas de pruebas de negocio, bridge, Kotlin o cobertura objetivo 70% (**Paso 07**).
- Hardening definitivo, Firebase, publicación npm, video final, iOS/Swift o preparación de sustentación (**Pasos 08–12**).
- Refactors no relacionados, cambios de versiones fijadas, reinstalación completa de npm por rutina o migraciones del proyecto.

**Una interfaz no justifica crear una implementación ficticia.** Este paso prepara el diseño, no simula funcionalidad terminada.

---

## 16. Formato obligatorio de respuesta del implementador al finalizar

Entregar **en español**, de forma concreta:

1. **Resumen:** qué quedó establecido en Paso 02 y qué **no** se implementó.
2. **Arquitectura:** árbol real de archivos y dirección de dependencias (incluido el puerto entre capabilities).
3. **Contratos:** resumen de modelos/repositorios/data sources/token/gateway/eventos/CustomMap.
4. **Seguridad:** comprobación de que no hay PAN, CVV ni titular completos en JS; tratamiento del campo `holder` del PDF.
5. **Archivos modificados:** lista exacta de nuevos y editados, con motivos.
6. **Comandos ejecutados:** comando + resultado **PASS / FAIL / NO EJECUTADO**, con errores completos relevantes.
7. **DoD:** checklist del apartado 14 actualizado, marcando solo lo verificado.
8. **Trade-offs:** decisiones significativas y por qué son defendibles (no enumerar patrones vacíos).
9. **Pendientes/bloqueos:** causa raíz, impacto y acción siguiente.
10. **Siguiente paso:** indicar `STEP-03-DASHBOARD-CARDS.md`, **sin crearlo ni ejecutarlo**.

**Prohibido** afirmar que Codegen, Fabric, TurboModule, mapa o Secure View funcionan: en esta etapa solo se documentan sus contratos futuros. No afirmar que Android/iOS se recompilaron si no se ejecutaron esas compilaciones.

---

## 17. Referencias para consulta durante la implementación

**Prioridad de requisitos:**

1. `Reto técnico - Chapter Master Frontend.pdf`, páginas 1–8 (competencias, partes obligatorias, modelos de ejemplo, APIs nativas, seguridad, pruebas y restricciones).
2. `RETO_BCP_TECHNICAL_BASELINE.md`, secciones 3–6, 8–14, 19–22 y 29–32.
3. `docs/steps/STEP-01-BOOTSTRAP.md`, decisiones aprobadas y baseline realmente implementado.

**Documentación técnica oficial para las etapas nativas (solo consulta en este paso):**

- React Native 0.88: <https://reactnative.dev/blog/2026/10/19/react-native-0.88>
- Turbo Native Modules: <https://reactnative.dev/docs/turbo-native-modules-introduction>
- Fabric Native Components: <https://reactnative.dev/docs/fabric-native-components-introduction>
- Codegen: <https://reactnative.dev/docs/the-new-architecture/using-codegen>

**Recordatorio:** no crear artefactos de Codegen hasta la etapa que implemente la librería.

---

## 18. Principio de cierre

> **La meta del Paso 02 no es más código, sino una estructura que permita desarrollar tarjetas, beneficios y la integración nativa con responsabilidades claras, contratos explícitos y ninguna fuga de datos sensibles.**
>
> Si el código nuevo puede justificarse en una sustentación de Chapter Frontend, respeta las fronteras y conserva verdes los checks del Paso 01, está en el nivel correcto de ingeniería para este reto.
