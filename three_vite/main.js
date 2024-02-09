"use strict";

import {
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  BoxGeometry,
  Mesh,
  MeshNormalMaterial, SphereGeometry, MeshBasicMaterial, PlaneGeometry, DoubleSide,
  AmbientLight,
  Clock, Raycaster, Vector3, LineBasicMaterial, BufferGeometry, Line,
  Color
} from 'three';

import {
  OrbitControls
} from 'three/addons/controls/OrbitControls.js';


import * as CANNON from 'cannon-es';


const scene = new Scene();
const aspect = window.innerWidth / window.innerHeight;
const camera = new PerspectiveCamera(75, aspect, 0.1, 1000);

camera.position.set(-0.2, 4.5, 10);

const light = new AmbientLight(0xffffff, 1.0);
scene.add(light);

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let isCameraMode = true;
let direction = new Vector3();

const controls = new OrbitControls(camera, renderer.domElement);
controls.listenToKeyEvents(window);

scene.background = new Color('#77b5fe');

const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.81, 0)
});

const groundGeo = new PlaneGeometry(10, 10);
const groundMat = new MeshBasicMaterial({
  color: 0xffffff,
  side: DoubleSide,
  // wireframe: true
});
const groundMesh = new Mesh(groundGeo, groundMat);
scene.add(groundMesh);

const groundBody = new CANNON.Body({
  //shape: new CANNON.Plane(),
  //mass: 10
  side: DoubleSide,
  shape: new CANNON.Plane(),
  // shape: new CANNON.Box(new CANNON.Vec3(10, 0, 10)),
  type: CANNON.Body.STATIC,
  material: new CANNON.Material()
});

groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);


const sphereGeometry = new SphereGeometry(0.1);
const sphereMaterial = new MeshBasicMaterial({ color: 0x000000 });
const sphereMesh = new Mesh(sphereGeometry, sphereMaterial);
scene.add(sphereMesh);

const sphereBody = new CANNON.Body({
  mass: 10,
  shape: new CANNON.Sphere(0.1),
  position: new CANNON.Vec3(0, 2, 4),
  material: new CANNON.Material()
});

sphereBody.linearDamping = 0.21;
sphereBody.angularDamping = 0.9;

world.addBody(sphereBody);

// Création des bords
const wallHeight = 0.5;
const wallThickness = 0.2;
const wallGeometryNS = new BoxGeometry(10, wallHeight, wallThickness);
const wallGeometryEW = new BoxGeometry(wallThickness, wallHeight, 10);
const wallMaterial = new MeshNormalMaterial();

// Mur nord
const wallNorth = new Mesh(wallGeometryNS, wallMaterial);
wallNorth.position.set(0, wallHeight / 2, 5);
scene.add(wallNorth);
const wallBodyNorth = new CANNON.Body({
  mass: 0,
  shape: new CANNON.Box(new CANNON.Vec3(10, wallHeight / 2, wallThickness / 2))
});
wallBodyNorth.position.set(0, wallHeight / 2, 5);
world.addBody(wallBodyNorth);

// Mur sud
const wallSouth = new Mesh(wallGeometryNS, wallMaterial);
wallSouth.position.set(0, wallHeight / 2, -5);
scene.add(wallSouth);
const wallBodySouth = new CANNON.Body({
  mass: 0,
  shape: new CANNON.Box(new CANNON.Vec3(10, wallHeight / 2, wallThickness / 2))
});
wallBodySouth.position.set(0, wallHeight / 2, -5);
world.addBody(wallBodySouth);

// Mur est
const wallEast = new Mesh(wallGeometryEW, wallMaterial);
wallEast.position.set(5, wallHeight / 2, 0);
scene.add(wallEast);
const wallBodyEast = new CANNON.Body({
  mass: 0,
  shape: new CANNON.Box(new CANNON.Vec3(wallThickness / 2, wallHeight / 2, 10))
});
wallBodyEast.position.set(5, wallHeight / 2, 0);
world.addBody(wallBodyEast);

// Mur ouest
const wallWest = new Mesh(wallGeometryEW, wallMaterial);
wallWest.position.set(-5, wallHeight / 2, 0);
scene.add(wallWest);
const wallBodyWest = new CANNON.Body({
  mass: 0, shape: new CANNON.Box(new CANNON.Vec3(wallThickness / 2, wallHeight / 2, 10))
});
wallBodyWest.position.set(-5, wallHeight / 2, 0);
world.addBody(wallBodyWest);

const cubeGeometry = new BoxGeometry(0.2, 5, 0.2);
const cubeMaterial = new MeshBasicMaterial({ color: 0x7f00ff });
const cubeMesh = new Mesh(cubeGeometry, cubeMaterial);
scene.add(cubeMesh);

// Création du body pour le cube en Cannon.js
const cubeShape = new CANNON.Box(new CANNON.Vec3(0.1, 0.1, 0.1)); // Dimensions du cube
const cubeBody = new CANNON.Body({
  mass: 1, // Masse du cube
  position: new CANNON.Vec3(0, 10.0, -4.5), // Position initiale du cube
  material: new CANNON.Material() // Matériau du cube
});
cubeBody.addShape(cubeShape); // Ajout de la forme au body du cube
world.addBody(cubeBody);

const lineMaterial = new LineBasicMaterial({
  color: 0x000000,
  linewidth: 1,
  linecap: 'round',
  linejoin: 'round'
});

const points = [];
points.push(new Vector3(sphereMesh.position.x, 0, sphereMesh.position.z));
points.push(new Vector3(sphereMesh.position.x + direction.x, 0, sphereMesh.position.z + direction.z));

const geometry = new BufferGeometry().setFromPoints(points);
let line = new Line(geometry, lineMaterial);


world.fixedTimeStep = 1 / 120;
let isVictoryDetected = false;

const animation = () => {

  world.fixedStep();

  groundMesh.position.copy(groundBody.position);
  groundMesh.quaternion.copy(groundBody.quaternion);

  sphereMesh.position.copy(sphereBody.position);
  sphereMesh.quaternion.copy(sphereBody.quaternion);

  wallNorth.position.copy(wallBodyNorth.position);
  wallNorth.quaternion.copy(wallBodyNorth.quaternion);

  wallSouth.position.copy(wallBodySouth.position);
  wallSouth.quaternion.copy(wallBodySouth.quaternion);

  wallEast.position.copy(wallBodyEast.position);
  wallEast.quaternion.copy(wallBodyEast.quaternion);

  wallWest.position.copy(wallBodyWest.position);
  wallWest.quaternion.copy(wallBodyWest.quaternion);

  cubeMesh.position.copy(cubeBody.position);
  cubeMesh.quaternion.copy(cubeBody.quaternion);

  if (camera.position.y < 1) { camera.position.y = 1; }
  if (camera.position.y > 5) { camera.position.y = 5; }
  if (camera.position.x < -20) { camera.position.x = -20; }
  if (camera.position.x > 20) { camera.position.x = 20; }
  if (camera.position.z < -20) { camera.position.z = -20; }
  if (camera.position.z > 20) { camera.position.z = 20; }

  direction = camera.getWorldDirection(direction);

  if (line) {
    scene.remove(line);
  }

  let target = new Vector3(sphereMesh.position.x + direction.x, 0, sphereMesh.position.z + direction.z)

  const points = [sphereMesh.position.clone(), target];
  const geometry = new BufferGeometry().setFromPoints(points);
  const material = new LineBasicMaterial({ color: 0x000000 });
  const newLine = new Line(geometry, material);
  scene.add(newLine);

  line = newLine;

  camera.lookAt(sphereMesh.position.x, sphereMesh.position.y, sphereMesh.position.z);

  const distanceThreshold = sphereBody.position.distanceTo(cubeBody.position);
  const combinedRadii = 0.2 + 0.1 / 2;

  if (distanceThreshold <= combinedRadii && !isVictoryDetected) {
    alert('VICTOIRE!');
    isVictoryDetected = true;
    controls.dispose();
    window.removeEventListener('keydown', handleSpaceKey);


  } else {
    renderer.setAnimationLoop(animation);
    renderer.render(scene, camera);
  }

};

animation();

let isMKeyPressed = false;
let count = 0;

window.addEventListener('keydown', (event) => {
  if (event.key === 'm') {
    console.log("a");
    isMKeyPressed = true;
    count++;
  }
});

window.addEventListener('keyup', (event) => {
  if (event.key === 'm') {
    console.log("b");
    isMKeyPressed = false;

    if (count > 30) {
      count = 30;
    }

    let directionTire = new Vector3(10 * count * direction.x, 0, 10 * count * direction.z);
    sphereBody.applyImpulse(directionTire, sphereBody.position);

    count = 0;
  }
});


function handleSpaceKey(event) {
  if (event.code === 'Space') {
    isCameraMode = !isCameraMode;
    if (isCameraMode) {
      console.log('camera');
      camera.position.set(-0.2, 4.5, 10);
    } else {
      camera.position.set(sphereMesh.position.x, sphereMesh.position.y + 1, sphereMesh.position.z + 1);
    }
  }
}
window.addEventListener('keydown', handleSpaceKey);



window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

