# Reto Técnico BCP - Chapter Frontend
## Baseline técnico, prerequisitos y plan de ejecución

> Documento raíz de referencia para el reto técnico.
>
> Su objetivo es fijar desde el inicio el alcance, restricciones, arquitectura, stack, contratos, seguridad, testing y plan general.
> Cada paso del plan tendrá posteriormente su propio documento `.md` con el detalle de implementación.
>
> **Principio de trabajo:** cumplir primero con exactitud las Partes 1 y 2 y sus pruebas obligatorias; los extras se incorporan únicamente cuando la base obligatoria esté estable.

---
# 0. Identidad del proyecto

- **Nombre del proyecto:** iO Products & Benefits
- **Repositorio GitHub:** io-products-benefits
- **Nombre de la aplicación:** iO Productos & Beneficios
- **Librería nativa:** io-native-components
- **Android Application ID:** com.ioproductsbenefits
- **iOS Bundle Identifier:** com.ioproductsbenefits
- **Plataformas:** Android (Kotlin) e iOS (Swift)
- **Framework:** React Native + TypeScript

## Convenciones de nombres

Todos los pasos de implementación deben respetar esta
identidad y utilizar los nombres definidos.

No utilizar nombres genéricos como:
- MyApp
- ReactNativeApp
- RetoBCP
- TestApp

Los nombres deben mantenerse consistentes en:
- Configuración de React Native
- Proyectos Android e iOS
- Librería nativa
- Documentación
- Pruebas automatizadas


# 1. Objetivo del reto

Construir desde cero una aplicación móvil en **React Native** con un Dashboard de dos tabs:

1. **Mis productos**
   - Mostrar cuentas y tarjetas del usuario.
   - Mostrar información no sensible enmascarada.
   - Permitir abrir una vista nativa segura para consultar PAN, CVV, fecha y titular completos.

2. **Beneficios**
   - Mostrar beneficios aplicables a las tarjetas del usuario.
   - Renderizar los beneficios en un mapa nativo.
   - Mostrar un carrusel horizontal sincronizado con el mapa.

Ambas funcionalidades deben apoyarse en **una única librería nativa propia**, responsable de:

- `CustomMap`
- `Card Secure View`

La solución debe demostrar:

- integración React Native ↔ código nativo;
- SOLID;
- Clean Architecture;
- Vertical Slicing por capability;
- React / React Native avanzado;
- seguridad móvil;
- accesibilidad;
- performance;
- pruebas unitarias;
- documentación técnica;
- capacidad de sustentación del código.

---

# 2. Alcance obligatorio

## Parte 1 - Aplicación React Native

Debe existir una sola aplicación con:

- Dashboard.
- Navegación inferior por tabs.
- Tab `Mis productos`.
- Tab `Beneficios`.
- Header y tema visual compartidos.
- Estado compartido cuando corresponda.
- Capa de datos común.
- Estado conservado al cambiar entre tabs.
- Diseño adaptativo.
- Accesibilidad (`a11y`).
- Estados de:
  - carga;
  - vacío;
  - error.
- Transiciones fluidas.
- Experiencia de usuario cuidada.

## Parte 2 - Librería nativa propia

Una sola librería nativa, con nombre y namespace claros, que exponga:

- `CustomMap`
- `Card Secure View`

La plataforma principal elegida para la implementación será:

**Android + Kotlin**

La implementación **iOS + Swift** queda incorporada como **Paso 11 explícito** del plan. Sigue siendo un extra según el enunciado: Android debe estar completo primero, y el plazo de entrega obligatorio tiene prioridad.

---

# 3. Restricciones no negociables

No utilizar:

- `react-native-maps`;
- wrappers de React Native que ya resuelvan mapas;
- librerías que implementen una Secure Card View equivalente;
- bridges de terceros que resuelvan el ejercicio;
- soluciones donde PAN, CVV o titular completos pasen a JavaScript.

Sí utilizar:

- React Native;
- APIs del sistema operativo;
- Google Maps SDK oficial en Android;
- código Kotlin propio;
- componentes nativos propios;
- bridge propio entre React Native y Kotlin.

## Regla crítica de seguridad

Los datos sensibles completos:

- PAN;
- CVV;
- titular;

**viven únicamente dentro del módulo nativo**.

Nunca deben:

- formar parte del estado JS;
- viajar por props;
- viajar por callbacks/eventos;
- almacenarse en Redux/Zustand;
- aparecer en logs;
- aparecer en snapshots;
- aparecer en fixtures de tests React Native.

JavaScript únicamente conoce identificadores y datos seguros/enmascarados.

---

# 4. Stack técnico propuesto

## Aplicación

- React Native.
- TypeScript.
- React Native CLI / proyecto con acceso completo a código nativo.
- React Navigation para navegación.
- Bottom Tabs para el Dashboard.
- Zustand para estado compartido de UI/dominio que necesite persistir entre tabs.
- JSON local para los mocks solicitados.
- Jest.
- React Native Testing Library.

## Android

- Kotlin.
- Android SDK.
- Google Maps SDK for Android.
- JUnit para pruebas nativas.
- APIs Android para protección de ventana y lifecycle.

## Calidad de código

- TypeScript en modo estricto.
- ESLint.
- Prettier.
- Imports y nombres consistentes.
- Separación explícita entre dominio, infraestructura, presentación y bridge.
- Evitar dependencias innecesarias.

## Versionado

Las versiones exactas de:

- React Native;
- React;
- Node;
- JDK;
- Kotlin;
- Gradle;
- Android SDK;

se fijarán al inicializar el proyecto y quedarán documentadas en el README.

No se dependerá de versiones flotantes.

---

# 5. Arquitectura

El reto exige explícitamente:

- SOLID;
- Clean Architecture;
- Vertical Slicing;
- separación por capabilities alineada a BIAN.

## Capabilities principales

### Cards / Account Management

Responsabilidades:

- cuentas;
- tarjetas;
- datos enmascarados;
- solicitud/renovación de `secureToken`;
- apertura de `Card Secure View`;
- manejo de eventos de sesión segura.

### Benefits

Responsabilidades:

- beneficios;
- filtrado por marcas disponibles para el usuario;
- transformación de beneficios a marcadores;
- selección de beneficio;
- sincronización mapa ↔ carrusel.

## Shared

Solo para elementos realmente transversales:

- navegación;
- tema;
- componentes visuales genéricos;
- utilidades;
- contratos comunes;
- infraestructura compartida;
- configuración.

## Regla de arquitectura

La organización debe ser **feature-first / capability-first**, no una colección global de carpetas técnicas desconectadas del dominio.

Estructura conceptual:

```text
src/
  app/
  capabilities/
    cards/
    benefits/
  shared/

native/
  android/
    secure-view/
    map/
    bridge/
```

La estructura definitiva se fijará en el paso de bootstrap.

---

# 6. Patrones y principios

## SOLID

Aplicar especialmente:

- **SRP:** UI, dominio, token, bridge y código nativo con responsabilidades separadas.
- **OCP:** contratos que permitan cambiar implementación de datos o token sin modificar consumidores.
- **LSP:** implementaciones intercambiables detrás de interfaces cuando aplique.
- **ISP:** contratos pequeños y específicos.
- **DIP:** casos de uso dependen de abstracciones, no directamente de detalles de infraestructura.

## Clean Architecture

Separar conceptualmente:

- presentation;
- application/use cases;
- domain;
- infrastructure;
- native integration.

El código de UI no debe contener reglas de seguridad ni lógica de dominio compleja.

## Vertical Slicing

Cada capability debe contener lo necesario para evolucionar de forma independiente.

Evitar una arquitectura horizontal basada únicamente en:

```text
components/
services/
hooks/
utils/
```

para toda la aplicación.

## Adapter / Gateway

La interacción con la librería nativa debe quedar encapsulada detrás de una interfaz TypeScript propia.

La UI no debe invocar `NativeModules` directamente.

## Repository

Los mocks JSON deben consumirse detrás de repositorios o data sources para mantener testabilidad y permitir reemplazar posteriormente el origen de datos.

## State machine implícita para Secure View

El flujo debe poder representar estados como:

```text
IDLE
TOKEN_REQUESTED
OPENING
OPEN
VALIDATION_ERROR
TIMEOUT
CLOSED
```

No es obligatorio incorporar una librería externa de state machines.

---

# 7. Especificaciones React Native

## Dashboard

Debe tener dos tabs inferiores:

- `Mis productos`
- `Beneficios`

Las tabs deben:

- conservar su estado al alternar entre ellas;
- compartir tema;
- compartir navegación;
- compartir la información necesaria del usuario;
- mantener una experiencia consistente.

## Render y performance

Usar correctamente, cuando aporten valor:

- `FlatList`;
- `React.memo`;
- `useMemo`;
- `useCallback`;
- selectors de estado;
- keys estables;
- evitar estados duplicados;
- evitar renders derivados de referencias recreadas innecesariamente.

La optimización debe estar justificada; no aplicar memoización indiscriminada.

---

# 8. Capability Cards / Account Management

## Datos visibles en React Native

La lista debe mostrar:

- cuentas;
- tarjetas;
- alias;
- PAN enmascarado;
- fecha `MM/AA`;
- marca;
- información visual necesaria para identificar el producto.

Ejemplo esperado de PAN:

```text
**** **** **** 1234
```

El reto proporciona como referencia un `cards.json`.

También se requiere mostrar cuentas, aunque el enunciado no fija un schema concreto para `accounts.json`; ese contrato deberá definirse de forma explícita dentro del proyecto.

## Acción "Ver datos sensibles"

Al pulsar el botón:

1. React Native solicita o renueva un `secureToken`.
2. React Native llama al bridge propio.
3. Envía únicamente:
   - `cardId`;
   - `secureToken`.
4. Kotlin abre la `Card Secure View`.
5. El módulo nativo valida el token.
6. Solo el código nativo obtiene y renderiza los datos sensibles.

---

# 9. Secure Token

El reto permite un token mock o generado localmente.

Debe soportar:

- generación;
- renovación;
- expiración;
- validación;
- firma HMAC simulada;
- TTL.

## Casos requeridos

- token válido;
- token inválido;
- token expirado;
- firma HMAC incorrecta.

## Códigos mínimos

```text
TOKEN_EXPIRED
TOKEN_INVALID
```

La implementación es deliberadamente simulada para el reto y debe documentarse como tal.

No debe presentarse como un mecanismo de autenticación productivo.

---

# 10. Card Secure View - Android/Kotlin

Debe ser una vista nativa a pantalla completa.

## Datos mostrados

Solo tras una validación correcta:

- PAN completo;
- CVV;
- fecha;
- titular.

Los valores se obtienen desde un mock interno del módulo Kotlin.

## Seguridad obligatoria

### Anti-screenshot

Usar protección equivalente a:

```text
FLAG_SECURE
```

### Background protection

Al pasar la aplicación a background:

- ocultar o cubrir inmediatamente el contenido sensible;
- restaurar únicamente cuando corresponda según el estado de sesión.

### Timeout

La sesión segura debe expirar automáticamente entre:

```text
30 y 60 segundos
```

Decisión inicial propuesta:

```text
45 segundos
```

### Cierre manual

Incluir botón:

```text
Ocultar
```

### Logging

Nunca registrar:

- PAN;
- CVV;
- titular completo;
- token completo;
- payloads sensibles.

La verificación debe quedar documentada en el README.

---

# 11. Eventos de Card Secure View

Contrato mínimo/sugerido hacia JavaScript:

```ts
onSecureViewOpened(cardId)
onValidationError(code, message)
onCardDataShown(cardId)
onSecureViewClosed(cardId, reason)
```

Motivos mínimos de cierre:

```text
USER_DISMISS
TIMEOUT
```

Errores mínimos:

```text
TOKEN_EXPIRED
TOKEN_INVALID
```

Los eventos no deben transportar datos sensibles.

---

# 12. Capability Benefits

El reto proporciona un `benefits.json` con campos equivalentes a:

```ts
{
  id: number;
  title: string;
  description: string;
  image: string;
  promotion: string;
  address: string;
  latitude: number;
  longitude: number;
  applicableBrands: string[];
}
```

## Filtrado

Mostrar únicamente beneficios cuyo `applicableBrands` tenga intersección con las marcas de las tarjetas del usuario.

Ejemplo:

```text
Tarjetas del usuario: VISA + MASTERCARD
Beneficio: applicableBrands = ["VISA"]
Resultado: visible
```

---

# 13. CustomMap - Android/Kotlin

Debe ser un componente nativo propio que use directamente:

**Google Maps SDK for Android**

Contrato conceptual:

```ts
type Marker = {
  id: string;
  latitude: number;
  longitude: number;
  // metadata no sensible necesaria para identificar el marcador
};

type CustomMapProps = {
  markers: Marker[];
  selectedMarkerId?: string;
  onMarkerPress: (markerId: string) => void;
};
```

## Responsabilidades

- renderizar el mapa;
- crear marcadores dinámicos;
- actualizar marcadores cuando cambien props;
- resaltar el marcador seleccionado;
- emitir el identificador al tocar un marcador;
- tolerar listas vacías;
- manejar coordenadas inválidas;
- manejar `selectedMarkerId` inexistente.

---

# 14. Sincronización mapa ↔ carrusel

La relación debe ser bidireccional.

## Mapa → carrusel

```text
tap marker
→ onMarkerPress(id)
→ actualizar selectedBenefit
→ mover carrusel al elemento correspondiente
```

## Carrusel → mapa

```text
scroll carrusel
→ determinar beneficio visible
→ actualizar selectedMarkerId
→ bridge actualiza marcador destacado
```

Debe existir una única fuente de verdad para la selección activa.

Evitar loops de sincronización y estados duplicados.

---

# 15. Carrusel

Implementación React Native.

Características:

- horizontal;
- snapping;
- elemento seleccionado claramente distinguible;
- sincronización estable con el mapa;
- comportamiento correcto con 0, 1 o N beneficios;
- accesible;
- optimizado para no rerenderizar todos los elementos innecesariamente.

---

# 16. Estado compartido

El reto solicita que ambas tabs conecten información.

Estado global mínimo esperado:

- tarjetas del usuario;
- marcas disponibles;
- beneficio seleccionado cuando corresponda;
- estado necesario para preservar navegación/UI.

Se propone **Zustand** por:

- API pequeña;
- selectors simples;
- baja sobrecarga;
- facilidad de test;
- facilidad para evitar rerenders globales.

No almacenar en el store:

- PAN completo;
- CVV;
- titular completo;
- datos sensibles de Card Secure View.

---

# 17. Accesibilidad

Requisito transversal.

Aplicar como mínimo:

- labels descriptivos;
- roles correctos;
- hints cuando aporten contexto;
- orden de foco coherente;
- touch targets adecuados;
- soporte de tamaños de texto razonables;
- contraste suficiente;
- estados seleccionados identificables sin depender únicamente del color.

Casos relevantes:

- tarjetas;
- botón `Ver datos sensibles`;
- tabs;
- carrusel;
- beneficios;
- controles de cierre;
- estados de error.

Las pruebas de `Benefits` deben verificar etiquetas de accesibilidad.

---

# 18. Estados de UI

Cada flujo relevante debe contemplar:

```text
loading
success
empty
error
```

Especialmente:

- carga de productos;
- carga de beneficios;
- ausencia de beneficios compatibles;
- fallo de inicialización del mapa;
- fallo de validación de token.

---

# 19. Testing obligatorio

Las pruebas deben ejecutarse con un único comando:

```bash
npm test
```

o equivalente documentado.

## React Native - Mis productos

Probar:

- render de cuentas;
- render de tarjetas;
- PAN enmascarado;
- fecha `MM/AA`;
- acción `Ver datos sensibles`.

## React Native - Beneficios

Probar:

- transformación de `benefits.json`;
- filtrado por `applicableBrands`;
- conversión a markers;
- marker → carrusel;
- carrusel → marker;
- accesibilidad.

## Token JS

Probar:

- generación;
- renovación;
- expiración.

## Bridge JS

Con módulos nativos mockeados:

- `openSecureView`;
- callbacks/eventos;
- `onMarkerPress`;
- manejo de errores.

## Kotlin - Token

JUnit:

- token válido;
- token inválido;
- token expirado;
- HMAC incorrecto.

## Kotlin - mapa/sesión

Deseable probar:

- mapeo de markers;
- emisión de eventos;
- timeout;
- motivo de cierre.

## Casos de borde mínimos

### Eventos

```text
TOKEN_EXPIRED
TOKEN_INVALID
USER_DISMISS
TIMEOUT
```

### Mapa

- markers vacíos;
- coordenadas inválidas;
- marker seleccionado inexistente.

## Seguridad en tests

Ningún:

- test;
- log;
- fixture JS;
- snapshot;

debe contener datos sensibles reales.

---

# 20. Cobertura

Generar reporte con:

```bash
npm test -- --coverage
```

o comando equivalente.

Objetivo mínimo de referencia para React Native:

```text
>= 70%
```

La rama entregada debe ejecutar las pruebas en limpio.

---

# 21. Performance

La evaluación considera explícitamente:

- memoria;
- renders;
- listas;
- carrusel.

Puntos a vigilar:

- no duplicar datasets;
- selectors pequeños en el store;
- listas virtualizadas;
- componentes memoizados cuando exista beneficio medible;
- callbacks estables cuando corresponda;
- evitar recalcular markers en cada render;
- evitar reconstruir objetos de props nativas sin necesidad;
- limpiar listeners del bridge;
- limpiar timers de sesión;
- evitar memory leaks en lifecycle nativo.

---

# 22. Secure storage

La competencia evaluada menciona explícitamente secure storage.

Cualquier secreto o dato que realmente necesite persistencia segura debe resolverse con mecanismos nativos seguros.

No se debe utilizar `AsyncStorage` para información sensible.

Para este reto:

- los datos sensibles de tarjeta permanecen en el módulo nativo;
- no se persisten en JavaScript;
- el token mock debe tener una vida limitada;
- cualquier decisión de persistencia debe quedar justificada en el README.

---

# 23. Parte 3 - Extras

Solo después de completar y estabilizar las Partes 1 y 2.

## Firebase Authentication

Login simple:

- usuario predefinido;
- credenciales incluidas para evaluación;
- navegación al Dashboard tras login exitoso.

## State management

Ya quedará cubierto mediante Zustand si se adopta desde la arquitectura base.

## Performance

Incluir optimizaciones justificadas y evidencia de que no existen renders innecesarios relevantes.

---

# 24. Extras valorados de la librería

Posibles extras:

- publicación en npm;
- publicación en GitHub Packages;
- namespaces claros;
- soporte Android + iOS.

Prioridad inicial:

```text
Android completo > Android + iOS incompletos
```

La segunda plataforma solo se abordará cuando el flujo obligatorio esté cerrado.

---

# 25. Documentación obligatoria final

El `README.md` de entrega deberá contener:

- descripción del proyecto;
- requisitos de entorno;
- instalación paso a paso;
- configuración;
- ejecución Android;
- arquitectura;
- diagrama de arquitectura;
- decisiones técnicas;
- trade-offs;
- estructura por capabilities;
- API pública de la librería;
- props de `CustomMap`;
- eventos;
- ejemplos de uso;
- flujo de `Card Secure View`;
- generación/validación del token;
- seguridad;
- verificación anti-screenshot;
- comportamiento en background;
- timeout;
- política de logs;
- ejecución de pruebas;
- cobertura;
- limitaciones conocidas;
- extras implementados.

---

# 26. Entregables

La entrega final debe incluir:

- repositorio GitHub con código de la librería;
- código de la app de ejemplo;
- pruebas unitarias;
- reporte de cobertura;
- README;
- video demostrativo;
- credenciales si se implementa Firebase.

Asunto esperado del correo:

```text
[Frontend] Entrega Reto iO - [Nombre Candidato]
```

---

# 27. Escenarios que deben funcionar antes de entregar

## Productos

- listado correcto;
- PAN enmascarado;
- apertura de secure view;
- token válido;
- token inválido;
- token expirado;
- cierre manual;
- cierre por timeout.

## Seguridad

- screenshot bloqueado;
- contenido oculto al ir a background;
- ausencia de logs sensibles.

## Beneficios

- filtrado por marcas;
- markers correctos;
- marker → carrusel;
- carrusel → marker;
- lista vacía;
- coordenada inválida;
- marker inexistente.

## Calidad

- tests verdes;
- cobertura generada;
- navegación sin pérdida de estado;
- accesibilidad base;
- renders controlados;
- listeners/timers limpiados.

---

# 28. Sustentación técnica

La solución debe poder explicarse sin depender del código generado ni de documentación externa.

Preparar explicación de:

1. demo end-to-end;
2. seguridad;
3. arquitectura;
4. SOLID;
5. Vertical Slicing;
6. bridge React Native ↔ Kotlin;
7. contrato de eventos;
8. estrategia de pruebas;
9. cobertura;
10. accesibilidad;
11. performance;
12. trade-offs.

Regla:

> No implementar nada que no podamos explicar y defender técnicamente.

---

# 29. Orden de prioridad

```text
P0 - Cumplimiento funcional obligatorio
P0 - Seguridad de datos sensibles
P0 - Bridge y librería nativa propios
P0 - Pruebas obligatorias
P1 - Arquitectura y calidad
P1 - Accesibilidad
P1 - Performance
P1 - Documentación
P2 - Firebase
P2 - Publicación de librería
P3 - Segunda plataforma
```

---

# 30. Plan general

Cada paso tendrá posteriormente su propio `.md`, excepto el Paso 08, omitido por decisión del propietario.

## Paso 1 - Bootstrap del proyecto

Inicializar repositorio, entorno, convenciones y estructura base.

## Paso 2 - Arquitectura y contratos

Definir capabilities, modelos, interfaces y límites entre React Native y Kotlin.

## Paso 3 - Dashboard y Mis productos

Construir navegación y capability de productos con información enmascarada.

## Paso 4 - Librería nativa y Card Secure View

Construir la base Android/Kotlin, bridge y flujo seguro.

## Paso 5 - Beneficios y CustomMap

Construir capability de beneficios, mapa nativo y filtrado.

## Paso 6 - Sincronización mapa ↔ carrusel

Cerrar la interacción bidireccional entre React Native y el componente nativo.

## Paso 7 - Testing y cobertura

Completar pruebas React Native y Kotlin y generar cobertura.

## Paso 8 - Hardening — OMITIDO

**Omitido por decisión del propietario el 6 de noviembre de 2026.** La auditoría transversal adicional se considera redundante y desproporcionada para este reto BCP. Se eliminó su documento de ejecución y no se exige un checklist ni un cierre separado de esta etapa.

Se conservan los Pasos 01–07 completados y aprobados, sus contratos y los controles de seguridad, accesibilidad, estabilidad y pruebas ya implementados. La omisión de esta etapa formal no elimina esos requisitos del producto ni autoriza ejecutar etapas posteriores.

## Paso 9 - Extras

Evaluar Firebase y publicación de librería según tiempo disponible.

## Paso 10 - Documentación y entrega

Completar README, diagramas, video y checklist de entrega.

## Paso 11 - Implementación iOS con Swift

Extender la librería nativa propia a iOS: `CustomMap` con MapKit, `Card Secure View` segura, integración RN ↔ Swift y pruebas nativas correspondientes. Verificar paridad funcional con Android.

## Paso 12 - Preparación de sustentación

Preparar demo y defensa técnica de arquitectura, seguridad, bridges, testing y trade-offs, incluyendo decisiones y diferencias Android/iOS.

---

# 31. Criterio de avance

No avanzar a extras mientras exista un P0 incompleto.

Cada paso ejecutado, excluyendo el Paso 08 omitido, debe cerrar con:

- código funcionando;
- tests asociados cuando corresponda;
- sin datos sensibles expuestos;
- decisiones importantes documentadas;
- aplicación ejecutable.

---

# 32. Principio de implementación

La solución debe ser:

```text
simple
explicable
testeable
segura
modular
predecible
```

Evitar:

```text
sobrearquitectura
abstracciones sin uso real
dependencias innecesarias
optimización prematura
features fuera del alcance
```

El objetivo no es demostrar cuántas librerías se conocen.

El objetivo es demostrar criterio de **Chapter Frontend** mediante una solución móvil sólida, mantenible y defendible.
