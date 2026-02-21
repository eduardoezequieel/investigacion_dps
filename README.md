# Integrantes
- Eduardo Ezequiel López Rivera LR230061
- Andrés René Velásquez Rodríguez VR222732
- Diego Guillermo Esnard Romero ER231474
- Diego René López Martínez LM231893
- Christian Gustavo Crespin Lozano CL060107

## Enlace del deploy del proyecto
[Enlace al sitio web](https://eduardoezequieel.github.io/investigacion_dps/)

# TechHub - Tech Store App

Aplicación de tienda de tecnología desarrollada con JavaScript Vanilla y arquitectura modular.

## 📂 Estructura del Proyecto

```
Investigacion_DPS/
├── index.html                 # Página principal
├── css/
│   └── styles.css            # Estilos globales
└── js/
    ├── app.js                # Punto de entrada principal
    ├── data/                 # Datos estáticos y mock data
    │   └── mockData.js       # Productos de ejemplo
    ├── services/             # Lógica de negocio
    │   ├── ProductManager.js # Gestión de productos
    │   └── CartManager.js    # Gestión del carrito
    └── ui/                   # Capa de presentación
        └── UIManager.js      # Renderizado y manipulación DOM
```

## 🎯 Separación de Responsabilidades

### 📊 `/data` - Capa de Datos
- **mockData.js**: Contiene el array de productos simulados
- Responsabilidad: Proveer datos de productos (en producción se reemplazaría por llamadas a API)

### ⚙️ `/services` - Capa de Servicios (Lógica de Negocio)
- **ProductManager.js**: Maneja operaciones relacionadas con productos
  - Obtener todos los productos
  - Buscar productos por ID
  - Filtrar por categoría
  - Búsqueda por texto
  
- **CartManager.js**: Maneja operaciones del carrito de compras
  - Agregar/eliminar artículos
  - Actualizar cantidades
  - Calcular totales
  - Persistencia en localStorage

### 🎨 `/ui` - Capa de Presentación
- **UIManager.js**: Maneja toda la interacción con el DOM
  - Renderizar productos y carrito
  - Gestionar eventos de usuario
  - Mostrar notificaciones
  - Controlar panel del carrito

### 🚀 `/app.js` - Punto de Entrada
- Inicializa la aplicación
- Coordina los diferentes módulos
- Configuración principal

## 🔄 Flujo de Datos

```
Usuario interactúa
       ↓
   UIManager (captura eventos)
       ↓
   Services (procesa lógica)
       ↓
   Data (obtiene/modifica datos)
       ↓
   UIManager (actualiza vista)
```

## ✨ Características

- ✅ Arquitectura modular y escalable
- ✅ Separación clara de responsabilidades
- ✅ Carrito de compras funcional
- ✅ Búsqueda y filtrado de productos
- ✅ Persistencia con localStorage
- ✅ Diseño responsive
- ✅ Notificaciones de usuario

## 🚀 Cómo Usar

1. Sirve el proyecto desde un servidor local (por ejemplo, con la extensión **Live Server** de VS Code) y abre `index.html` — no abrir directamente desde el explorador de archivos, ya que los módulos ES6 requieren un entorno de servidor
2. Explora los productos disponibles
3. Usa la barra de búsqueda o filtros por categoría
4. Agrega productos al carrito
5. Gestiona cantidades en el panel del carrito

## 🛠️ Tecnologías

- JavaScript Vanilla (ES6 Modules)
- CSS3 (Variables, Flexbox, Grid)
- HTML5 Semántico
- LocalStorage API

## 📝 Notas de Desarrollo

- Todos los módulos usan ES6 modules (`import/export`)
- Los comentarios están en español
- La estructura permite fácil expansión y testing
- Cada capa tiene una responsabilidad única y bien definada

