# 🚚 Apex Vision - Plataforma de Logística Inteligente

**Apex Vision** es una plataforma frontend moderna de logística que optimiza rutas, valida entregas con IA y conecta despachadores (Admins) y conductores (Drivers) en tiempo real. Diseñada con Vue 3, Vite, Bootstrap y Mapbox para una experiencia de usuario fluida y responsive.

> **Lema:** "Lo que no se ve, no se entrega"

---

## 📋 Tabla de Contenidos

- [Características Principales](#características-principales)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación y Configuración](#instalación-y-configuración)
- [Scripts Disponibles](#scripts-disponibles)
- [Guía de Uso](#guía-de-uso)
- [Componentes Principales](#componentes-principales)
- [Sistema de Autenticación](#sistema-de-autenticación)
- [API Integration](#api-integration)
- [Variables de Entorno](#variables-de-entorno)
- [Notas de Desarrollo](#notas-de-desarrollo)

---

## 🎯 Características Principales

✅ **Autenticación Dual (Roles):**
- Transportador (Driver) - Panel de conductor con rutas asignadas
- Administrador (Admin) - Despachador con control total de operaciones

✅ **Gestión Inteligente de Rutas:**
- Optimización de rutas con algoritmos matemáticos (90% más rápidas)
- Integración con Mapbox para mapas interactivos
- Búsqueda inteligente de direcciones en el Área Metropolitana
- Asignación de rutas a conductores en tiempo real

✅ **Sistema de Notificaciones:**
- Notificaciones compactas in-page (desaparecen en 5 segundos)
- Sistema de alertas por eventos de auditoría
- Actividad reciente en tiempo real

✅ **Panel de Control (Dashboard):**
- Estadísticas de pedidos, conductores y rutas
- Monitoreo de eventos de auditoría IA
- Actividad reciente y eficiencia operativa

✅ **Gestión de Conductores:**
- Registro, búsqueda y eliminación de transportadores
- Modal inteligente con búsqueda por teléfono
- Detalles de disponibilidad y experiencia

✅ **Validación Robusta de Contraseñas:**
- Requisitos en tiempo real: mínimo 8 caracteres, mayúscula, número, carácter especial ($&)
- Indicadores visuales: rojo (no cumplido) → verde (cumplido)
- Soporte para mostrar/ocultar contraseña

✅ **Interfaz Adaptable:**
- Modo oscuro para Admin / Modo claro para Driver
- Responsive design (mobile-first)
- Animaciones suaves y transiciones fluidas

---

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **Vue.js** | 3.5.24 | Framework frontend reactivo |
| **Vite** | 7.2.4 | Build tool y dev server ultrarrápido |
| **Vue Router** | 4.6.3 | Enrutamiento entre vistas |
| **Bootstrap** | 5.3.8 | Componentes CSS responsivos |
| **Mapbox GL** | 3.16.0 | Mapas interactivos y geocodificación |
| **GSAP** | 3.13.0 | Animaciones avanzadas (opcional) |
| **Lottie Web** | 5.13.0 | Animaciones JSON (opcional) |
| **Three.js** | 0.181.2 | Gráficos 3D (opcional) |

---

## 📁 Estructura del Proyecto

```
proyecto-logistica-frontend-web/
├── src/
│   ├── api/
│   │   └── authApi.js              # Cliente API para autenticación
│   ├── assets/
│   │   └── logo.png                # Logo de Apex Vision
│   ├── components/
│   │   ├── HelloWorld.vue          # Componente ejemplo (descartable)
│   │   ├── admin/
│   │   │   ├── Dashboard.vue       # Panel de control del Admin
│   │   │   ├── Drivers.vue         # Gestión de conductores
│   │   │   ├── AssignRoutes.vue    # Asignación inteligente de rutas
│   │   │   ├── Notifications.vue   # Logs de actividad
│   │   │   └── Settings.vue        # Configuración de cuenta
│   │   └── driver/
│   │       └── DriverDashboard.vue # Panel del conductor
│   ├── router/
│   │   └── index.js                # Configuración de rutas
│   ├── views/
│   │   ├── Landing.vue             # Página de inicio
│   │   ├── Login.vue               # Formulario de login
│   │   ├── Register.vue            # Formulario de registro
│   │   ├── Layout.vue              # Layout principal (Admin)
│   │   └── DriverLayout.vue        # Layout del conductor
│   ├── App.vue                     # Componente raíz
│   ├── main.js                     # Punto de entrada
│   └── style.css                   # Estilos globales
├── public/
├── index.html                      # HTML principal
├── vite.config.js                  # Configuración de Vite
├── package.json                    # Dependencias
├── .gitignore
└── README.md                       # Este archivo
```

---

## ⚡ Instalación y Configuración

### Requisitos Previos
- Node.js >= 16
- npm o yarn

### Pasos

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Lujuria-Goats/proyecto-logistica-frontend-web.git
   cd proyecto-logistica-frontend-web
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Verificar token de Mapbox:**
   - Abre `src/components/admin/AssignRoutes.vue`
   - Busca `mapboxAccessToken`
   - Reemplaza con tu token de Mapbox (obtén uno en [mapbox.com](https://mapbox.com))

4. **Verificar URL del API:**
   - Abre `src/api/authApi.js`
   - Verifica que `API_BASE_URL` apunta al backend correcto:
     ```javascript
     const API_BASE_URL = "https://service.lujuria.crudzaso.com/api";
     ```

5. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```

6. **Acceder a la app:**
   - Abre `http://localhost:5173` en tu navegador

---

## 📦 Scripts Disponibles

```bash
# Iniciar servidor de desarrollo (con HMR)
npm run dev

# Compilar para producción
npm run build

# Ver preview de build
npm run preview
```

---

## 🚀 Guía de Uso

### 1. **Página de Inicio (Landing)**
- Muestra propuesta de valor de Apex Vision
- Botones para Registrarse e Iniciar Sesión
- Beneficios destacados: rutas 90% más rápidas, IA para validación, GPS en tiempo real

### 2. **Registro de Usuarios**
- **Rol Seleccionable:** Driver (Transportador) o Admin (Despachador)
- **Validación en Tiempo Real:**
  - Mínimo 8 caracteres
  - Al menos una mayúscula
  - Al menos un número
  - Carácter especial ($ o &)
  - Indicadores visuales: rojo → verde
- **Campos Requeridos:** Nombre, Email, Teléfono (10 dígitos)
- **Notificaciones:** Errores y éxito aparecen por 5 segundos en el formulario

### 3. **Login**
- Email y contraseña
- Botón para mostrar/ocultar contraseña
- Redirección automática según rol:
  - **Admin** → `/admin/dashboard`
  - **Driver** → `/driver/dashboard`
- Link para olvidaste contraseña (placeholder)

### 4. **Panel Admin (/admin/dashboard)**
- **Sidebar** con navegación:
  - 📊 Dashboard
  - 🚚 Transportadores
  - 🗺️ Asignar rutas
  - 🔔 Notificaciones
  - ⚙️ Configuración
- **Dashboard Principal:**
  - Tarjetas con estadísticas (Pedidos, Conductores Activos, Rutas, Eventos)
  - Actividad reciente en tiempo real

### 5. **Gestión de Conductores**
- Listado en grid con cards
- Botón para agregar conductores
- Modal con:
  - Búsqueda inteligente por teléfono
  - Vista previa del conductor
  - Información de experiencia

### 6. **Asignación de Rutas (AssignRoutes)**
- Mapa interactivo (Mapbox) de Área Metropolitana
- Búsqueda avanzada de direcciones:
  - Autocomplete de direcciones y POIs
  - Conversión de abreviaturas (Cll → Calle, Cra → Carrera)
  - Soporte para formato colombiano (Calle 20 # 14-23)
  - Navigate con ↑↓ Enter
- Agregar múltiples puntos al mapa
- Lista de puntos asignados
- Guardado y validación con loader

### 7. **Panel de Conductor (/driver/dashboard)**
- Panel simplificado (en desarrollo)
- Visualización de rutas asignadas

---

## 🔐 Sistema de Autenticación

### Flow de Autenticación

1. **Registro:** Usuario crea cuenta con rol
   ```
   POST /api/Auth/register
   { fullName, email, password, phoneNumber, role }
   ```

2. **Login:** Usuario se autentica
   ```
   POST /api/Auth/login
   { email, password }
   → Respuesta: { token: "JWT..." }
   ```

3. **Guardado de Token:**
   - Token se almacena en `localStorage` con clave `token`
   - Se decodifica para extraer rol y datos del usuario

4. **Protección de Rutas:**
   - `beforeEach` en router valida:
     - Presencia de token
     - Rol coincida con ruta requerida
   - Redirección automática si no cumple

### Decodificación de JWT

```javascript
// En Layout.vue
const base64Url = token.split('.')[1];
const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
const jsonPayload = decodeURIComponent(window.atob(base64).split('').map((c) => {
  return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
}).join(''));
const payload = JSON.parse(jsonPayload);
// payload.email, payload.role, etc.
```

---

## 🌐 API Integration

### Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/Auth/register` | Registrar nuevo usuario |
| POST | `/api/Auth/login` | Autenticarse |
| GET/POST | `/geocoding/v5/mapbox.places/...` | Geocodificación Mapbox |

### Cliente API (`authApi.js`)

```javascript
// Registrar
registerUser({ fullName, email, password, phoneNumber, role })

// Login
loginUser({ email, password })

// Token Management
saveToken(token)
getToken()
clearToken()
isAuthenticated()
```

### Base URL

```javascript
const API_BASE_URL = "https://service.lujuria.crudzaso.com/api";
```

---

## 🔑 Variables de Entorno

Actualmente, las siguientes constantes están hardcodeadas:

- **API_BASE_URL:** `https://service.lujuria.crudzaso.com/api` (en `authApi.js`)
- **Mapbox Token:** `pk.eyJ1IjoianZlbGV6MDAwIiwiYSI6ImNtaWkzOHZ5dTAxbnkzZHE3Mmo2c2VnbjQifQ.R-ikqyiMMZVwUHOH9CJ6mg` (en `AssignRoutes.vue`)

**Recomendación:** Usar `.env.local` para desarrollo:
```
VITE_API_BASE_URL=https://service.lujuria.crudzaso.com/api
VITE_MAPBOX_TOKEN=tu_token_aqui
```

---

## 📝 Notas de Desarrollo

### Validaciones Implementadas

1. **Contraseña:**
   - Mínimo 8 caracteres
   - Al menos 1 mayúscula
   - Al menos 1 número
   - Al menos 1 carácter especial ($ o &)
   - Indicador visual en tiempo real

2. **Teléfono:**
   - Exactamente 10 dígitos
   - Solo números
   - Validación en tiempo real

3. **Email:**
   - Formato válido `email@domain.com`

### Notificaciones

Las notificaciones se muestran con:
- **Duración:** 5 segundos (automático)
- **Tipos:** `success`, `error`, `info`
- **Ubicación:** Dentro del formulario (no en toast/modal)

```javascript
showNotification("Mensaje", "success"); // 5s después desaparece
```

### Temas (Light/Dark)

El tema cambia dinámicamente según el rol:
- **Admin:** Tema oscuro (`theme-dark`)
- **Driver:** Tema claro (`theme-light`)

Usa variables CSS:
```css
--card-bg
--text-primary
--text-secondary
--input-bg
--input-border
--rule-invalid-color (rojo)
--rule-valid-color (verde)
```

### Mapbox Configuración

- **Área Metropolitana del Valle de Aburrá:**
  - Bounds: `SW: [-75.70, 6.02] NE: [-75.30, 6.55]`
  - Center: `[−75.5658, 6.2476]`
  - Zoom: 12 - 16

- **Tipos de búsqueda:** `address`, `poi` (Points of Interest)

### Componentes Destacados

1. **PasswordRules** (inline en Register.vue)
   - 4 reglas con indicadores dinámicos
   - Colores: rojo (no cumplido) → verde (cumplido)
   - CSS con `::before` para puntos

2. **AssignRoutes Modal**
   - Mapbox interactivo
   - Búsqueda con autocomplete
   - Loader mini escalado para inputs
   - Loader grande para guardar

3. **NotificationSystem**
   - In-page (no toast)
   - Auto-dismiss 5s
   - Gradientes para success/error

---

## 🔄 Flujo de Datos

```
User → Landing → Register/Login → JWT Token → localStorage
                                        ↓
                            router.beforeEach() valida rol
                                        ↓
                    ┌───────────────────┴───────────────────┐
                    ↓                                         ↓
                Admin Layout                          Driver Layout
            (/admin/dashboard)                   (/driver/dashboard)
                    ↓                                         ↓
        Dashboard, Drivers,                    DriverDashboard
        AssignRoutes, etc.
```

---

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| Error de Mapbox | Verifica token en `AssignRoutes.vue` |
| Rutas protegidas no funcionan | Limpia localStorage: `localStorage.clear()` |
| Notificaciones no aparecen | Verifica que `notification.visible` sea `true` |
| Tema no cambia | Asegúrate de cambiar role con switch |
| Mapa fuera de límites | Solo se aceptan puntos en Área Metropolitana |

---

## 📚 Recursos Adicionales

- [Vue 3 Docs](https://vuejs.org/)
- [Vite Docs](https://vitejs.dev/)
- [Bootstrap 5](https://getbootstrap.com/)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
- [Vue Router](https://router.vuejs.org/)

---

## 👥 Equipo

- **Desarrollado por:** Proyecto Logística Apex Vision
- **Rama activa:** `feature/Juanjo`
- **Organización:** Lujuria-Goats

---

## 📄 Licencia

Este proyecto es parte de Apex Vision. Todos los derechos reservados.

---

## 🎯 Roadmap Futuro

- [ ] Integración con Google Maps (alternativa a Mapbox)
- [ ] Validación de entregas con foto IA
- [ ] Chat en tiempo real entre Admin y Drivers
- [ ] Reportes PDF descargables
- [ ] Soporte multi-idioma (ES/EN)
- [ ] PWA (Progressive Web App)
- [ ] Integración con WhatsApp para notificaciones
- [ ] Dashboard avanzado con gráficos (Chart.js, D3.js)
- [ ] Geolocalización en tiempo real del conductor

---

**Versión:** 0.0.0  
**Última actualización:** 4 de Diciembre, 2025  
**Estado:** En desarrollo 🚀
