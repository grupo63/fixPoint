# 🔧 FixPoint – Plataforma de reservas y gestión de profesionales

## 📖 Información del proyecto
**FixPoint** es una aplicación **fullstack** que conecta a usuarios con profesionales de distintos rubros.  
Permite a los clientes registrarse, buscar servicios, reservar turnos y gestionar su agenda.  
Los profesionales pueden crear su perfil, configurar disponibilidad, ofrecer servicios y administrar sus reservas.  

---

## 🎯 Propósito y casos de uso
El proyecto busca resolver la gestión de turnos de manera digital e intuitiva.  

Casos de uso:
- 👤 **Usuarios**: registrarse, iniciar sesión, reservar turnos, cancelar o reprogramar.  
- 👨‍🔧 **Profesionales**: crear perfiles, mostrar portfolio, configurar servicios y disponibilidad.  
- 📅 **Sistema**: administrar notificaciones, validaciones de horarios y conexión entre ambas partes.  

---

## 🧰 Tecnologías utilizadas

### Frontend
- **Next.js** (React, App Router)  
- **TypeScript**  
- **TailwindCSS**  
- **Context API** para manejo de estado global  
- **Axios** para requests  

### Backend
- **NestJS**  
- **TypeORM**  
- **PostgreSQL**  
- **JWT** para autenticación  
- **Cloudinary** para gestión de imágenes  

### Infraestructura
- **Railway** (DB + Backend hosting)  
- **Vercel** (Frontend hosting)  

---

## 🛠️ Instalación y ejecución

### 🔑 Requisitos previos
- [Node.js](https://nodejs.org/) (versión LTS recomendada)  
- [PostgreSQL](https://www.postgresql.org/)  
- [Git](https://git-scm.com/)  

Verificar instalaciones:
```bash
node -v
npm -v
git --version
📥 Clonar el repositorio
git clone https://github.com/grupo63/fixPoint.git
cd fixPoint

⚙️ Backend

Entrar en la carpeta back:

cd back


Instalar dependencias:

npm install


Configurar variables de entorno en un archivo .env (ejemplo):

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=fixpoint
JWT_SECRET=supersecret
CLOUDINARY_URL=tu_cloudinary_url


Ejecutar migraciones (si aplica con TypeORM).

Iniciar el servidor:

npm run start:dev


El backend quedará corriendo en 👉 http://localhost:3001

💻 Frontend

En otra terminal, entrar en la carpeta front:

cd front


Instalar dependencias:

npm install


Crear un archivo .env.local con las variables necesarias:

NEXT_PUBLIC_API_BASE_URL=http://localhost:3001


Iniciar la aplicación:

npm run dev


El frontend quedará disponible en 👉 http://localhost:3000
