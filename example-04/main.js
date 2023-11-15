import './style.css'
import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    BoxGeometry,
    MeshBasicMaterial,
    Mesh,
    PlaneGeometry,
    LineBasicMaterial,
    Vector3,
    BufferGeometry,
    Line,
    SphereGeometry,
    BackSide
} from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import {GUI} from "dat.gui";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";

const world = {
    plane: {
        width: 610,
        height: 610,
        widthSegments: 500,
        heightSegments: 500,
        opacity: 0.2,
        wireframe: true,
        position: {
            x: 295,
            y: 0,
            z: 295
        }
    },
    boxes: {
        amount: 80,
        innerBoxSize: 2,
        outerBoxSize: 2,
        opacity: 0.3,
        spacing: 3
    },
    stars: {
        amount: 10000,
        size: 1,
        speed: 0.005
    },
    camera: {
        '2D': false
    }
}

const gltfLoader = new GLTFLoader()
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/examples/jsm/libs/draco/');
gltfLoader.setDRACOLoader(dracoLoader);

const scene = new Scene();

const camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)

camera.position.set(55, 50, 26)

const renderer = new WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement);

const boxPositions = generateBoxPositions(world.boxes.amount, world.boxes.spacing);
const boxes = generateBoxes(boxPositions, world.boxes.outerBoxSize, world.boxes.innerBoxSize, world.boxes.opacity);
boxes.forEach(box => scene.add(box));

const plane = generatePlane();
scene.add(plane);

const points = generateLinePoints();
const lines = generateLines(points);
lines.forEach(line => scene.add(line))

const starPositions = generateStarPositions();
const stars = generateStars(starPositions);
scene.add(...stars);

window.addEventListener('resize', onWindowResize, false)

const stats = new Stats();
document.body.appendChild(stats.dom);

loadSolarisIcon();

generateGUI()

animate()

function render() {
    renderer.render(scene, camera)
}

function animate() {
    requestAnimationFrame(animate)
    setControls();
    stars.forEach(star => star.position.set(star.position.x + world.stars.speed, star.position.y + world.stars.speed, star.position.z + world.stars.speed))
    render();
    stats.update();
}

function generateGUI() {
    const gui = new GUI();
    const planeFolder = gui.addFolder('Plane');
    planeFolder.add(world.plane, 'width', 1, 1000).onChange(adjustPlane);
    planeFolder.add(world.plane, 'height', 1, 1000).onChange(adjustPlane);
    planeFolder.add(world.plane, 'widthSegments', 1, 1000).onChange(adjustPlane);
    planeFolder.add(world.plane, 'heightSegments', 1, 1000).onChange(adjustPlane);
    planeFolder.add(world.plane, 'opacity', 0.01, 1, 0.001).onChange(adjustPlane);
    const planeController = planeFolder.add(world.plane, 'wireframe').name('wireframe').listen();
    planeController.onChange(adjustPlane)

    const planePositionFolder = planeFolder.addFolder('position');
    planePositionFolder.add(world.plane.position, 'x', -500, 500, 1).onChange(adjustPlanePosition);
    planePositionFolder.add(world.plane.position, 'y', -500, 500, 1).onChange(adjustPlanePosition);
    planePositionFolder.add(world.plane.position, 'z', -500, 500, 1).onChange(adjustPlanePosition);
    planeFolder.open();
    planePositionFolder.open();

    const boxesFolder = gui.addFolder('Boxes');
    boxesFolder.add(world.boxes, 'amount', 1, 1000).onChange(regenerateBoxes);
    boxesFolder.add(world.boxes, 'spacing', 0.1, 5, 0.001).onChange(regenerateBoxes);
    boxesFolder.add(world.boxes, 'innerBoxSize', 0.1, 5, 0.001).onChange(regenerateBoxes);
    boxesFolder.add(world.boxes, 'outerBoxSize', 0.1, 5, 0.001).onChange(regenerateBoxes);
    boxesFolder.add(world.boxes, 'opacity', 0.1, 1, 0.001).onChange(regenerateBoxes);
    boxesFolder.open();

    const starsFolder = gui.addFolder('Stars');
    starsFolder.add(world.stars, 'amount', 1000, 50000, 100).onChange(regenerateStars);
    starsFolder.add(world.stars, 'size', 1, 100, 1).onChange(regenerateStars);
    starsFolder.add(world.stars, 'speed', 0.001, 1, 0.001);
    starsFolder.open();

    const cameraFolder = gui.addFolder('Camera');
    const cameraController = cameraFolder.add(world.camera, '2D').name('2D').listen();
    cameraController.onChange(regenerateBoxes)
    const cameraPosition = cameraFolder.addFolder('position');
    cameraPosition.add(camera.position, "x", -200, 200);
    cameraPosition.add(camera.position, "y", -200, 200);
    cameraPosition.add(camera.position, "z", -200, 200);
    const cameraRotation = cameraFolder.addFolder('rotation');
    cameraRotation.add(camera.rotation, "x", -Math.PI, Math.PI, .001);
    cameraRotation.add(camera.rotation, "y", -Math.PI, Math.PI, .001);
    cameraRotation.add(camera.rotation, "z", -Math.PI, Math.PI, .001);
    cameraFolder.open();
    cameraPosition.open();
    cameraRotation.open();
}

function generatePlane() {
    const geometry = new PlaneGeometry(world.plane.width, world.plane.height, world.plane.widthSegments, world.plane.widthSegments);
    const material = new MeshBasicMaterial({
        color: 0x0080FF,
        side: BackSide,
        wireframe: world.plane.wireframe,
        transparent: true,
        opacity: world.plane.opacity
    });
    const plane = new Mesh(geometry, material);
    plane.position.set(world.plane.position.x, world.plane.position.y, world.plane.position.z);
    plane.rotation.x = Math.PI / 2;
    return plane;
}

function generateBoxPositions(amount = 1, spacing = 1) {
    const boxPositions = [];
    for (let x = 0; x < amount; x++) {
        for (let z = 0; z < amount; z++) {
            boxPositions.push(x * 1.25 * spacing * 2, world.camera["2D"] ? 0 : 1, z * 1.25 * spacing * 2)
        }
    }
    return boxPositions;
}

function generateBoxes(positions, outerBoxSize = 1, innerBoxSize = 1, innerBoxOpacity = 0.5) {

    const boxes = [];
    for (let i = 0; i < positions.length; i += 3) {

        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];

        const innerGeometry = new BoxGeometry(innerBoxSize, world.camera["2D"] ? 0 :0.25*innerBoxSize, innerBoxSize, 1, 1, 1);
        const innerMaterial = new MeshBasicMaterial({color: 0x049ef4, alphaTest: 0.5});
        const innerCube = new Mesh(innerGeometry, innerMaterial);

        const outerGeometry = new BoxGeometry(1.25 * outerBoxSize, world.camera["2D"] ? 0 : 0.375 *outerBoxSize, 1.25 * outerBoxSize, 1, 1, 1);
        const outerMaterial = new MeshBasicMaterial({color: 0x049ef4, transparent: true, opacity: innerBoxOpacity});
        const outerCube = new Mesh(outerGeometry, outerMaterial);

        outerCube.add(innerCube)
        outerCube.position.set(x, y, z)

        boxes.push(outerCube);
    }
    return boxes;
}

function generateLinePoints() {
    const points = [];

    const y = world.camera["2D"] ? 0 : 1;

    const spacing = world.boxes.spacing;
    const amount = world.boxes.amount;
    for(let i =0; i< amount; i++){
        const start = i * 1.25 * spacing * 2;
        const end = (amount-1) * 1.25 * spacing * 2;
        points.push(new Vector3(0,y,start), new Vector3(end,y,start))
    }
    for(let i =0; i < amount; i++){
        const start = i * 1.25 * spacing * 2;
        const end = (amount-1) * 1.25 * spacing * 2;
        points.push(new Vector3(start,y,0), new Vector3(start,y,end))
    }

    return points;
}

function generateLines(points) {
    const lines = [];
    const material = new LineBasicMaterial({color: 0x00ff00});
    for(let i =0; i<points.length; i+=2){
        const geometry = new BufferGeometry().setFromPoints([points[i], points[i+1]])
        const line = new Line(geometry, material);
        lines.push(line);
    }
    return lines;
}

function adjustPlane() {
    plane.geometry.dispose();
    plane.material = new MeshBasicMaterial({
        color: 0x0080FF,
        side: BackSide,
        wireframe: world.plane.wireframe,
        transparent: true,
        opacity: world.plane.opacity
    });
    plane.geometry = new PlaneGeometry(
        world.plane.width,
        world.plane.height,
        world.plane.widthSegments,
        world.plane.heightSegments
    );
}

function adjustPlanePosition() {
    plane.position.set(world.plane.position.x, world.plane.position.y, world.plane.position.z)
}

function regenerateBoxes() {
    const boxPositions = generateBoxPositions(world.boxes.amount, world.boxes.spacing);
    boxes.forEach(box => box.removeFromParent());
    boxes.splice(0, boxes.length);
    generateBoxes(boxPositions, world.boxes.outerBoxSize, world.boxes.innerBoxSize, world.boxes.opacity).forEach(box => boxes.push(box))
    boxes.forEach(box => scene.add(box))

    loadSolarisIcon();

    points.splice(0, points.length);
    points.push(...generateLinePoints(boxPositions));
    lines.forEach(line => line.removeFromParent())
    lines.splice(0, lines.length);
    lines.push(...generateLines(points))
    lines.forEach(line => scene.add(line));
}

function regenerateStars() {
    const starPositions = generateStarPositions();
    stars.forEach(star => star.removeFromParent());
    stars.splice(0, stars.length);
    stars.push(...generateStars(starPositions));
    scene.add(...stars)
}

function generateStarPositions(amount = world.stars.amount) {
    const starPositions = [];
    for (let i = 0; i < amount; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;

        starPositions.push(x, y, z);
    }
    return starPositions;
}

function generateStars(positions) {
    const stars = [];
    for (let i = 0; i < positions.length; i += 3) {
        const geometry = new SphereGeometry((Math.random() / 2) * world.stars.size, 10, 10);
        const material = new MeshBasicMaterial({color: 0xffffff});
        const sphere = new Mesh(geometry, material);

        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];

        sphere.position.set(x, y, z);
        stars.push(sphere);
    }
    return stars;
}
function setControls(){
    if(world.camera["2D"]){
        controls.target.set(0, 0, 0);
        camera.rotation.set(Math.PI / -2, 0, 0)
        controls.enableRotate = false;
        controls.enableZoom = true;
        controls.object.rotation.set(Math.PI / -2, 0, 0)
    }else{
        controls.enableRotate = true;
    }
}

function loadSolarisIcon(){
    gltfLoader.load('public/icons/glb/solaris.glb', glb => {
        const glbMesh  = glb.scene.children[0];
        boxes.forEach(box => {
            const mesh = glbMesh.clone();
            mesh.rotation.set(0, 0, 0)

            const material = new MeshBasicMaterial({ color: 0xffffff, wireframe: false });
            mesh.material = material
            mesh.children.forEach(child => child.material = material);
            world.camera["2D"] ? mesh.position.set(0,0,0) :  mesh.position.set(0,0.2* world.boxes.innerBoxSize,0)

            box.add(mesh)
        });
    })
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}
