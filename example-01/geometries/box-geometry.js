import * as THREE from 'three';
export const BoxGeometry = new THREE.BufferGeometry();
// Define each corner point of the cube
const vertices = new Float32Array([
    // Front face
    -1.0, -1.0,  1.0,
    1.0, -1.0,  1.0,
    1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,

    // Back face
    -1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    1.0,  1.0, -1.0,
    -1.0,  1.0, -1.0,
]);

// Define the indices for the vertices to create the cube's faces
const indices = new Uint16Array([
    0, 1, 2,  0, 2, 3, // front
    4, 5, 6,  4, 6, 7, // back
    5, 1, 2,  5, 2, 6, // top
    4, 0, 3,  4, 3, 7, // bottom
    4, 5, 1,  4, 1, 0, // right
    3, 2, 6,  3, 6, 7  // left
]);

// Create an attribute for the position vectors
BoxGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
BoxGeometry.setIndex(new THREE.BufferAttribute(indices, 1));

// Define normals for the vertices
const normals = new Float32Array([
    // Front
    0,  0,  1,
    0,  0,  1,
    0,  0,  1,
    0,  0,  1,

    // Back
    0,  0, -1,
    0,  0, -1,
    0,  0, -1,
    0,  0, -1,
    // ... normals for each vertex
]);

// Create an attribute for the normals
BoxGeometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
