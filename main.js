import './style.css'
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module';
import dat from 'dat.gui';

const world = {
    box: {
        width: 1,
        height: 1,
        depth: 1
    }
}


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);

const light = new THREE.DirectionalLight('#FFFFFF', 1);
light.position.set(0, 1, 1);
scene.add(light)

camera.position.set(1, 1, 10)

const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

const axesHelper = new THREE.AxesHelper(10);
scene.add(axesHelper);

const geometry = new THREE.BoxGeometry(world.box.width, world.box.height, world.box.depth);
// const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
// const material = new THREE.MeshNormalMaterial();
const material = new THREE.MeshPhongMaterial({color: 0x00ff00});
const cube = new THREE.Mesh(geometry, material);

// cube.position.set(2,2,2);
cube.rotation.set(2,2,2);

scene.add(cube);
console.log(scene);

// renderer.render(scene, camera);

const stats = new Stats();
document.body.appendChild(stats.dom);

const guiGenerateBox = () => {
    cube.geometry.dispose();
    cube.geometry = new THREE.BoxGeometry(world.box.width, world.box.height, world.box.depth);
};

const gui = new dat.GUI();
gui.add(world.box, 'width', 1, 20).onChange(guiGenerateBox);
gui.add(world.box, 'height', 1, 20).onChange(guiGenerateBox);
gui.add(world.box, 'depth', 1, 20).onChange(guiGenerateBox);

function animate() {
    requestAnimationFrame(animate)
    render()
}

function render() {
    stats.update();
    renderer.render(scene, camera)

    cube.rotation.x += 0.005;
    cube.rotation.y += 0.005;
    cube.rotation.z += 0.005;
}

animate()
