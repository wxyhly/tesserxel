# Tesserxel

## An Engine All About 4D World: Modeling, Rendering, Physics...

Tesserxel is a project aimed for providing 4D scenes rendering and interacting library on web. This project uses new WebGPU API to provide a WebGPU based 4D render engine.
## Examples
- [Online example browser](https://wxyhly.github.io/tesserxel/examples/)

![scree snapshots in example browser](https://wxyhly.github.io/img/tsx005.jpg)
Attention: Examples should be opened by a WebGPU supported browser (e.g. Google Chrome 114 and above), and WebGPU should be enabled in the browser's settings.

## Features
### Display
- Support 3D retina displayer with transparent voxels and wireframe lines.
- Support single retina cross section rendering.
- Support adjustable naked eye stereo mode.
- GUI for display options.

### Modeling
- Support importing standard 3D wavefront obj model.
- Support orietated CWMesh building and convex polyhedra tetrahedralization.
- Support direct product of two arbitrary 2D shapes.
- Support spline and mesh lofting.

### Rendering
With submodule four:
- Support 3D/4D texture maping and Phong material.
- Support customized WGSL texture.
- Support different types of lights.

you can also write your own shader from scratch without submodule four.

### Physics
- Support GJK algorithm for collision detection of convex polytopes.
- Support Spheritorus/Torisphere/Tiger/Duotorus collision detection.
- Support 4D electric/magnetic dipoles simulation.
- 4D Drone/Aircraft Simulation in examples.

### Algebra
- Support 4D Bivector and 4D Rotor with two quaternions (thanks to so(4) = so(3) x so(3)).
- Support coset enumeration algorithm for generating regular polytopes.

## Usage
- Option 1: Download packed js file `/build/tesserxel.js` (umd format), then add following code in your html file: 
```javacript
<script src="/build/tesserxel.js"></script>
```
- Option 2: import js file `/build/esm/tesserxel.js` in esm format.
- Option 3: Use npm to install tesserxel. 
You can also download typescript declaration file `/build/tesserxel.d.ts` to use typescript features. 

See more in [Documentation](/tesserxel/docs/) (TODO).

## Appendix: Introduction to fourth spatial dimension
Here "4D space" is not "spacetime" in physics! If you count time, our journey with tesserxel is in 5d spacetime world.
If you are confused with the concept of 4D, try to look at these websites:
- [My blog to introduce 4D space](https://wxyhly-en.github.io/categories/4D-Space-Series/)
- [Dimension: A walk through mathematics, Film](http://www.dimensions-math.org/)
- [Higher Space, Wiki & Forum](http://hi.gher.space/)
- [Miegakure, Game](https://miegakure.com/)
- [4DToys, Game](https://4dtoys.com/)

