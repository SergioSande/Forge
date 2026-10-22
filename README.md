# Forge

**Talento emergente, proyectos reales.**

Forge es un prototipo funcional de SaaS que conecta a estudiantes sin experiencia laboral con empresas que necesitan ideas frescas para un reto concreto. El estudiante descubre proyectos ordenados por afinidad con sus habilidades e intereses, envía una solución y empieza a construir experiencia real. La empresa publica retos, revisa las propuestas recibidas y descubre talento junior alineado con su equipo.

Este proyecto fue creado para un hackathon y funciona íntegramente en el navegador, sin backend.

## Arrancar el proyecto

```bash
npm install
npm run dev
```

Abre [http://127.0.0.1:5173](http://127.0.0.1:5173).

Para generar la versión de producción:

```bash
npm run build
npm run preview
```

## Cuentas de demostración

Puedes entrar con un clic desde la pantalla de login, o usar estas credenciales:

| Perfil | Email | Contraseña |
| --- | --- | --- |
| Estudiante | `lucia@demo.forge` | `demo1234` |
| Empresa | `nebula@demo.forge` | `demo1234` |

La cuenta de estudiante incluye proyectos recomendados, postulaciones en distintos estados y un perfil completo. La cuenta de empresa incluye dos retos publicados con soluciones recibidas para revisar.

## Qué incluye

- **Bienvenida de primer uso** con elección de rol (estudiante o empresa).
- **Registro dinámico por pasos**, con preguntas diferentes según el rol:
  - Estudiantes: datos de cuenta, universidad, grado, curso, zona, disponibilidad, habilidades, intereses, bio y enlaces.
  - Empresas: datos de cuenta, sector, tamaño, ubicación, web, persona de contacto y áreas de talento.
- **Login y sesión persistente** en `localStorage`.
- **Dashboard de estudiante** con mejor match, retos recomendados, estado de postulaciones y empresas afines.
- **Exploración de retos** con búsqueda, filtros por área y modalidad, orden por match o reciente y umbral de afinidad.
- **Matching explicable**: el porcentaje se calcula cruzando habilidades e intereses del estudiante con las áreas y habilidades del reto.
- **Detalle del proyecto** adaptado al rol: envío de solución para estudiantes, gestión de propuestas para la empresa propietaria.
- **Interfaz de empresa** con proyectos publicados, métricas, creación de nuevos retos y listado de soluciones recibidas.
- **Gestión de soluciones**: aceptar, preseleccionar, descartar y recuperar propuestas.
- **Comunidad** con directorio de estudiantes y empresas, buscador y filtros.
- **Perfiles públicos completos** de estudiantes y empresas, con contexto de afinidad.
- **Perfil propio editable** y menú de usuario con compartir perfil, reiniciar demo y cerrar sesión.
- **Diseño responsive** en azul claro y blanco, con estados vacíos, toasts y formularios validados.

## Stack

- React 18 + TypeScript
- Vite
- React Router (HashRouter)
- Lucide React para iconografía
- CSS propio, sin librerías de UI
- Persistencia con `localStorage`

## Estructura

```text
src/
  components/       Componentes reutilizables, layout y modales
  data/seed.ts      Datos de demostración
  lib/              Constantes, matching y utilidades
  pages/            Vistas de landing, auth y aplicación
  store/            Estado global y persistencia
  App.tsx           Rutas
  styles.css        Base visual y componentes compartidos
  app.css           Layout de la app y responsive
```

## Notas del prototipo

- No hay backend ni autenticación real: los datos viven en el navegador para poder probar el flujo completo sin configuración.
- Las cuentas, proyectos y soluciones creados se guardan en `localStorage`.
- Desde el menú de perfil puedes pulsar **Reiniciar demo** para volver a los datos originales y a la bienvenida inicial.
- El matching es una simulación transparente y explicable, pensada para la demo, no un sistema de recomendación productivo.

Hecho para aprender haciendo.
