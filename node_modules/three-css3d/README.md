# three-css3d

> A typescript port of Three.js CSS3DRenderer, with small tweaks and enhancements.

Originally from:  
http://www.emagix.net/academic/mscs-project/item/camera-sync-with-css3-and-webgl-threejs

Based On:  
[mrdoob/three.js](https://github.com/mrdoob/three.js/blob/r126/examples/js/renderers/CSS3DRenderer.js) & [ivee-tech/three-css3drenderer](https://github.com/ivee-tech/three-css3drenderer/blob/master/index.js)

## Installation

```shell
npm i -S three three-css3d
```

## Usage

```typescript
import {Scene, PerspectiveCamera} from 'three';
import {CSS3DRenderer, CSS3DSprite, CSS3DObject} from 'three-css3d';

// Create Scene, camera and renderer
const scene = new Scene();
const camera = new PerspectiveCamera(50, 1, 0, 500);
const renderer = new CSS3DRenderer();

document.body.appendChild(renderer.domElement);

// Create DOM for CSS3D
const objectDOM = document.createElement('div');
const spriteDOM = document.createElement('div');

// Update style, content for your DOM
// ...

// Create CSS3D Objects
const object = new CSS3DObject(objectDOM);
const sprite = new CSS3DSprite(spriteDOM);

// Change the 3D property of CSS3D Objects
// ...

// Add to your scene
scene.add(object, sprite);

// Render, on each frame, or manually
renderer.render(scene, camera);
```

## API

### CSS3DRenderer

```ts
class CSS3DRenderer()
```

`CSS3DRenderer.domElement`  
Container element of CSS3D Scene.

`CSS3DRenderer.cameraElement`  
Camera element of CSS3D transform.

`CSS3DRenderer.getSize()`  
Get the size of container element.

`CSS3DRenderer.setSize(width: number, height: number)`  
Set the size of container element.

`CSS3DRenderer.render(scene: three.Scene, camera: three.Camera)`  
Update CSS3D scene.

### CSS3DObject

```ts
class CSS3DObject(element: HTMLElement) extends three.Object3D
```

**element**: Target DOM Element.

`CSS3DObject.copy(source: CSS3DObject, recursive: boolean)`  
Copy content from another CSS3DObject.

see: [three.Object3D](https://threejs.org/docs/?q=object3d#api/en/core/Object3D) for more detail.

### CSS3DSprite

```ts
class CSS3DSprite(element: HTMLElement, spriteRatio:number = 1) extends CSS3DObject
```

**element**: Target Sprite DOM Element.  
**spriteRatio**: The ratio for sprite rotation compensation, 1 for full sprite, 0 for normal 3D object.

`CSS3DSprite.spriteRatio`  
Value of current spriteRatio
