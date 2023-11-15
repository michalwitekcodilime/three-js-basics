import './style.css'
import * as THREE from 'three';
import {BoxGeometry} from './geometries/box-geometry';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);

camera.position.set(1, 2, 10);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const axesHelper = new THREE.AxesHelper(10);
scene.add(axesHelper);

// Manually created custom geometry
// const geometry = BoxGeometry;

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshNormalMaterial();
const cube = new THREE.Mesh(geometry, material);

scene.add(cube);
console.log(scene);

renderer.render(scene, camera);
