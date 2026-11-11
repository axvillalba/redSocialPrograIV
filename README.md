# Red Social LoL — Grieta del Invocador ⚡

Aplicación web full-stack inspirada en la temática Hextech de **League of Legends**, desarrollada para la *Tecnicatura Universitaria en Programación (UTN)*. El proyecto implementa un sistema de autenticación seguro, gestión de perfiles de invocador, creación de publicaciones en tiempo real y una arquitectura desplegada 100% en la nube.

---

## 🛠️ Tecnologías Utilizadas

### **Frontend**
* **Framework:** Angular 19 (Componentes Standalone)
* **Estilos:** SCSS con diseño temático **Hextech / League of Legends** (responsive)
* **HTTP:** `HttpClient` con consumo dinámico mediante variables de entorno (`environment.ts`)
* **Despliegue:** Vercel (Configurado como SPA)

### **Backend**
* **Framework:** NestJS 12 (Configurado en modo ES Modules — ESM)
* **Base de Datos:** MongoDB Atlas (Mongoose ODM)
* **Seguridad:** Encriptación de contraseñas con `bcrypt` y respuestas HTTP semánticas (`200`, `201`, `401`, `400`)
* **Gestión de Archivos:** Módulo `FileService` con Multer + Cloudinary (en standby / maquetado)
* **Despliegue:** Vercel Serverless Functions

---

## 🚀 Funcionalidades Principales (Sprint 1)

* 🔐 **Módulo de Autenticación:**
  * **Registro:** Alta de nuevos invocadores procesando `nombre`, `apellido`, `correo`, `nombreUsuario`, `fechaNacimiento`, `descripcion` y foto de perfil en Base64. Contraseñas encriptadas mediante hash de `bcrypt`.
  * **Login:** Inicio de sesión validando usuario/correo y contraseña en texto plano contra el hash almacenado.
* 👤 **Perfil de Invocador (`MiPerfil`):**
  * Vista personalizada con tarjeta estética Hextech, avatar dinámico, estadísticas y datos del usuario autenticado.
* 📝 **Módulo de Publicaciones:**
  * Creación y listado de publicaciones persistidas en MongoDB Atlas.
* 🌐 **Infraestructura Cloud:**
  * Base de datos remota con cluster MongoDB Atlas.
  * Backend y Frontend vinculados mediante HTTPS y políticas CORS habilitadas para solicitudes preflight (`OPTIONS`).

---

## 📂 Estructura del Proyecto

```text
tp2-redsocial-lol/
├── back/                      # Servidor NestJS
│   ├── api/                   # Handler de entrada para Vercel Serverless (index.ts)
│   ├── src/
│   │   ├── autenticacion/     # Módulo de Login y Registro
│   │   ├── usuarios/          # Módulo de usuarios y perfiles
│   │   ├── publicaciones/     # Módulo de feed / posts
│   │   ├── file/              # Servicio e integración de Cloudinary / Multer
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json           # Declarado con "type": "module" (ESM)
│   └── vercel.json            # Enrutamiento de Serverless Functions
│
└── front/                     # Cliente Angular 19
    ├── src/
    │   ├── app/
    │   │   ├── components/    # Componentes de Login, Registro y MiPerfil
    │   │   └── services/      # AuthService y consumo de la API REST
    │   ├── environments/      # Configuración de URLs de desarrollo y producción
    │   ├── assets/            # Favicon e imágenes del tema Hextech
    │   └── styles.scss        # Estilos globales de la Grieta del Invocador
    ├── package.json
    └── vercel.json            # Rewrites para manejo de rutas en Angular SPA
```

---

## ⚙️ Configuración del Entorno Local

### 1. Requisitos Previos
* Node.js v18+ 
* npm v9+
* Cuenta activa en MongoDB Atlas (o instancia local de MongoDB)

### 2. Configurar el Backend (`back/`)

1. Navegá a la carpeta del backend e instalá las dependencias:
   ```bash
   cd back
   npm install
   ```

2. Creá un archivo `.env` en la raíz de `back/`:
   ```env
   PORT=3000
   MONGODB_URI=mongodb+srv://<usuario>:<password>@cluster0.xxx.mongodb.net/redsocial-lol?retryWrites=true&w=majority
   CLOUDINARY_CLOUD_NAME=tu_cloud_name
   CLOUDINARY_API_KEY=tu_api_key
   CLOUDINARY_API_SECRET=tu_api_secret
   ```

3. Ejecutá el servidor en modo desarrollo:
   ```bash
   npm run start:dev
   ```
   El backend iniciará en `http://localhost:3000`.

---

### 3. Configurar el Frontend (`front/`)

1. Navegá a la carpeta del frontend e instalá las dependencias:
   ```bash
   cd front
   npm install
   ```

2. Verificá que la URL de la API apunte al entorno deseado en `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:3000'
   };
   ```

3. Iniciá la aplicación en Angular:
   ```bash
   ng serve
   ```
   Abrí tu navegador en `http://localhost:4200`.

---

## ☁️ Despliegue en Producción (Vercel)

El proyecto está preparado para desplegarse como dos servicios independientes dentro de Vercel:

### **Backend (`back`)**
* **Root Directory:** `back`
* **Environment Variables:** `MONGODB_URI`
* **Build Command:** `npm run build`
* **Output:** Manejado automáticamente por `@vercel/node` vía `api/index.ts`.

### **Frontend (`front`)**
* **Root Directory:** `front`
* **Framework Preset:** Angular
* **Output Directory:** `dist/front/browser`
* **Environment Prod (`environment.prod.ts`):** Apuntando a la URL pública del backend desplegado en Vercel (ej. `https://red-social-progra-iv.vercel.app`).

---

## 🧪 Pruebas de Endpoints con Postman

| Método | Endpoint | Descripción | Body (JSON / RAW) | Respuesta Esperada |
|---|---|---|---|---|
| `POST` | `/autenticacion/registro` | Registro de usuario | Objeto usuario completo | `201 Created` |
| `POST` | `/autenticacion/login` | Inicio de sesión | `{ "login": "...", "password": "..." }` | `200 OK` (Objeto usuario) |
| `GET` | `/publicaciones` | Obtener publicaciones | N/A | `200 OK` (Arreglo `[]`) |
| `POST` | `/publicaciones` | Crear publicación | `{ "titulo": "...", "mensaje": "...", "autor": "ID" }` | `201 Created` |   