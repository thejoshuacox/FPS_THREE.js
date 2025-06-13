# FPS_THREE.js

A simple first‑person shooter demo built with [Three.js](https://threejs.org/). Move around, shoot at walls, and experiment with zooming from your browser.

## Features

- **WASD movement** with jumping
- **Pointer lock** for mouse look control
- **Left click to shoot** – leaves bullet hole decals
- **Right click to zoom** – smooth field‑of‑view transition
- Textured environment with HDR lighting

## Running Locally

Because the project uses ES modules, it must be served over HTTP. Any static server will do. One quick option is Python:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000/](http://localhost:8000/) in your browser and click inside the page to lock the pointer. Press `Esc` to release it.

## File Overview

- `index.html` – sets up the page, crosshair overlays and loads `main.js`
- `main.js` – initializes the scene, handles the animation loop and player movement
- `controls.js` – keyboard/mouse input and pointer lock
- `environment.js` – walls, floor and lights (objects you can collide with)
- `shootzoom.js` – raycasting and zoom logic
- `scene.js` – creates the Three.js renderer, camera and loads HDR backgrounds
- `player.js` & `physics.js` – placeholders for future logic
- `Textures/` – HDRs and texture images used by the environment

Enjoy exploring the code and tweaking the demo!
