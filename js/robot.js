import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const canvas = document.querySelector('#robotCanvas');
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0b251c, 8, 19);
const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
camera.position.set(5.8, 4.2, 8.5);
camera.lookAt(0, 1.5, 0);
const renderer = new THREE.WebGLRenderer({canvas, alpha: true, antialias: true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
scene.add(new THREE.HemisphereLight(0xc9ffe2, 0x10251c, 2));
const key = new THREE.DirectionalLight(0xffffff, 3);
key.position.set(4, 8, 5);
key.castShadow = true;
scene.add(key);
const rim = new THREE.PointLight(0x3cff9c, 35, 12);
rim.position.set(-3, 3, 2);
scene.add(rim);
const mat = (color, metalness = .65, roughness = .28) => new THREE.MeshStandardMaterial({color, metalness, roughness});
const dark = mat(0x172d28, .8, .25), green = mat(0x42e69a, .55, .22), silver = mat(0x9fbab0, .85, .2),
    glow = mat(0x9dffc9, .3, .2);
const root = new THREE.Group();
scene.add(root);

function cyl(parent, r1, r2, h, material, x, y, z) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, 32), material);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m
}

function sphere(parent, r, material, x, y, z) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24), material);
    m.position.set(x, y, z);
    m.castShadow = true;
    parent.add(m);
    return m
}

function link(parent, a, b, r, material) {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = new THREE.Vector3().subVectors(B, A);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r * .72, r, d.length(), 24), material);
    m.position.copy(A).add(B).multiplyScalar(.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    m.castShadow = true;
    parent.add(m);
    return m
}

const base = cyl(root, .95, 1.05, .35, dark, 0, .2, 0);
cyl(root, .68, .72, .16, green, 0, .45, 0);
cyl(root, .4, .48, .22, silver, 0, .62, 0);
sphere(root, .34, green, 0, .83, 0);
const p1 = [0, .95, 0], p2 = [-.35, 2.15, 0], p3 = [.8, 3.15, 0], p4 = [1.5, 2.75, 0];
link(root, p1, p2, .23, silver);
sphere(root, .31, dark, ...p2);
sphere(root, .17, green, ...p2);
link(root, p2, p3, .18, green);
sphere(root, .25, dark, ...p3);
sphere(root, .13, silver, ...p3);
link(root, p3, p4, .13, silver);
sphere(root, .17, green, ...p4);
// end effector / gripper
link(root, p4, [1.82, 2.55, 0], .09, dark);
link(root, [1.82, 2.55, 0], [2.03, 2.43, 0], .055, green);
link(root, [1.82, 2.55, 0], [1.93, 2.72, 0], .055, green);
sphere(root, .1, glow, 1.82, 2.55, 0);
// subtle floor and concentric rings
const floor = new THREE.Mesh(new THREE.CircleGeometry(3.7, 80), new THREE.MeshStandardMaterial({
    color: 0x0b2a20,
    metalness: .25,
    roughness: .8,
    transparent: true,
    opacity: .65
}));
floor.rotation.x = -Math.PI / 2;
floor.position.y = .015;
floor.receiveShadow = true;
root.add(floor);
for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.35 + i * .48, .008, 8, 100), new THREE.MeshBasicMaterial({
        color: 0x3be69a,
        transparent: true,
        opacity: .25 - i * .05
    }));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = .04 + i * .002;
    root.add(ring)
}
// floating technical nodes
for (let i = 0; i < 9; i++) {
    const a = i / 9 * Math.PI * 2;
    const s = sphere(root, .035, glow, Math.cos(a) * 2.7, 1.1 + Math.sin(a * 2) * .5, Math.sin(a) * 1.8);
}
let pointerX = 0, pointerY = 0;
canvas.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    pointerX = (e.clientX - r.left) / r.width - .5;
    pointerY = (e.clientY - r.top) / r.height - .5
});
canvas.addEventListener('pointerleave', () => {
    pointerX = 0;
    pointerY = 0
});

function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix()
}

new ResizeObserver(resize).observe(canvas);
resize();
let t = 0;

function animate() {
    requestAnimationFrame(animate);
    t += .008;
    root.rotation.y += (pointerX * .65 + Math.sin(t * .5) * .08 - root.rotation.y) * .035;
    root.rotation.x += (pointerY * .16 - root.rotation.x) * .035;
    renderer.render(scene, camera)
}

animate();
