import './style.css'
// import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module'
// import dat from 'dat.gui';
// import gsap from 'gsap';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement)

const stats = new Stats();
document.body.appendChild(stats.dom);


function animate() {
    requestAnimationFrame(animate)
    render()
}

function render() {
    stats.update();
    renderer.render(scene, camera)
}

animate()
