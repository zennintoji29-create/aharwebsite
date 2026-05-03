import * as THREE from 'three';
import { throttle } from './utils.js';

let scene, camera, renderer, particles, centerBlob;
let mouseX = 0;
let mouseY = 0;
let clock = new THREE.Clock();

function createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(232, 130, 12, 1)');
    gradient.addColorStop(0.3, 'rgba(232, 130, 12, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
}

function initThree() {
    try {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas) return;

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 25;

        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xE8820C, 15);
        pointLight.position.set(10, 10, 10);
        scene.add(pointLight);

        const pointLight2 = new THREE.PointLight(0xC4522A, 10);
        pointLight2.position.set(-10, -10, 10);
        scene.add(pointLight2);

        // Central Liquid Blob
        const blobGeo = new THREE.SphereGeometry(7, 128, 128);
        blobGeo.userData.originalPositions = blobGeo.attributes.position.clone();

        const blobMat = new THREE.MeshPhysicalMaterial({
            color: 0xE8820C,
            emissive: 0x2D1A00,
            roughness: 0.1,
            metalness: 0.9,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            reflectivity: 1.0,
        });

        centerBlob = new THREE.Mesh(blobGeo, blobMat);
        scene.add(centerBlob);

        // Particle Spice Dust
        const particleGeo = new THREE.BufferGeometry();
        const particleCount = 1200;
        const posArray = new Float32Array(particleCount * 3);
        const phaseArray = new Float32Array(particleCount);

        for (let i = 0; i < particleCount * 3; i += 3) {
            posArray[i] = (Math.random() - 0.5) * 80;
            posArray[i + 1] = (Math.random() - 0.5) * 60;
            posArray[i + 2] = (Math.random() - 0.5) * 50;
            phaseArray[i / 3] = Math.random() * Math.PI * 2;
        }

        particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        particleGeo.setAttribute('aPhase', new THREE.BufferAttribute(phaseArray, 1));

        const particleMat = new THREE.PointsMaterial({
            size: 0.6,
            map: createParticleTexture(),
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        particles = new THREE.Points(particleGeo, particleMat);
        scene.add(particles);

        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX - window.innerWidth / 2) * 0.001;
            mouseY = (e.clientY - window.innerHeight / 2) * 0.001;
        });

    } catch (e) {
        console.error("Three.js initialization failed", e);
    }
}

function animateThree() {
    if (!renderer) return;
    requestAnimationFrame(animateThree);

    const time = clock.getElapsedTime();

    if (centerBlob) {
        const positions = centerBlob.geometry.attributes.position;
        const origPositions = centerBlob.geometry.userData.originalPositions;

        for (let i = 0; i < positions.count; i++) {
            const v = new THREE.Vector3().fromBufferAttribute(origPositions, i);
            const noise = 
                Math.sin(v.x * 0.3 + time * 1.5) * 
                Math.cos(v.y * 0.3 + time * 1.2) * 
                Math.sin(v.z * 0.3 + time * 0.8);
            v.addScaledVector(v.clone().normalize(), noise * 1.2);
            positions.setXYZ(i, v.x, v.y, v.z);
        }

        positions.needsUpdate = true;
        centerBlob.geometry.computeVertexNormals();
        centerBlob.rotation.y += 0.005;
        centerBlob.rotation.z += 0.002;
    }

    if (particles) {
        const positions = particles.geometry.attributes.position;
        const phases = particles.geometry.attributes.aPhase;

        for (let i = 0; i < positions.count; i++) {
            const phase = phases.getX(i);
            const y = positions.getY(i);
            const x = positions.getX(i);
            positions.setY(i, y + 0.015);
            positions.setX(i, x + Math.sin(time * 0.5 + phase) * 0.01);
            if (positions.getY(i) > 30) positions.setY(i, -30);
        }
        positions.needsUpdate = true;
    }

    // Camera Parallax
    camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 5 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

initThree();
animateThree();

window.addEventListener('resize', throttle(() => {
    if (renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}));
