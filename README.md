# Spider Animation - 2D Directional Gait

Simulador de araña con animación realista de patas usando cinemática inversa (IK) y sistema de marcha direccional 2D inspirado en [Factorio FFF-425](https://factorio.com/blog/post/fff-425).

## Características

### Sistema de Animación
- **8 patas articuladas** con 3 segmentos cada una
- **IK (Inverse Kinematics)** para posicionamiento natural
- **Ciclo de marcha tetrapod** (grupos alternados de 4 patas)
- **Sistema reach-pull/push-recovery** basado en dirección de movimiento

### Detección Direccional 2D
- **Producto punto** para detectar patas delanteras/traseras según velocidad
- **Patas delanteras**: Reach (extender) → Pull (contraer y tirar)
- **Patas traseras**: Push (empujar) → Recovery (recuperar posición)

### Rotación del Cuerpo
- Rotación suave basada en vector de velocidad
- Las patas se adaptan automáticamente durante giros
- Interpolación suave (0.05) para movimiento orgánico

### Movimiento
- Navegación 2D multidireccional por superficie del árbol
- Cambio de dirección en bordes
- Velocidad ajustable independiente (cuerpo lento, patas rápidas)

## Tecnologías

- **Vanilla JavaScript** - Sin dependencias
- **Canvas 2D API** - Renderizado vectorial
- **Bézier curves** - Formas orgánicas

## Estructura del Proyecto

```
├── index.html       # Página principal
├── style.css        # Estilos minimalistas
├── main.js          # Game loop principal
├── spider.js        # Clase Spider con IK y animación
├── tree.js          # Árbol con tronco y ramas
└── movement.js      # Sistema de navegación por superficie
```

## Cómo Ejecutar

1. Abre `index.html` en un navegador moderno
2. La araña comenzará a moverse automáticamente por el árbol

## Detalles Técnicos

### IK de 3 Segmentos
Cada pata resuelve su posición usando cinemática inversa:
- Segmento 1: 25px
- Segmento 2: 30px  
- Segmento 3: 20px

### Parámetros de Marcha
- **Velocidad de cuerpo**: 0.3 px/frame
- **Velocidad de ciclo**: 0.025 rad/frame
- **Distancia de reposo**: 55px
- **Longitud de zancada**: 18px

### Rotación
- **Velocidad angular**: 0.05 (interpolación muy suave)
- **Basada en**: `Math.atan2(velocityY, velocity)`

## Inspiración

Este proyecto está inspirado en el artículo [Factorio Friday Facts #425 - Behind the legs](https://factorio.com/blog/post/fff-425), que explica el sistema de animación de patas usadas en los Pentapods de Factorio: Space Age.

## Desarrollo

El proyecto usa commits descriptivos con convenciones:
- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bugs
- `refactor:` - Refactorización de código

---

**Desarrollado con ❤️ usando cinemática inversa y matemáticas vectoriales**
