const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let bodies = [];
let animationId;

// (1) Colors: Red, Yellow, Orange for Stars
const colors = ['#FF4444', '#FFD700', '#FFA500'];
const PLANET_COLOR = '#4488FF'; // Blue for Planet base

// Simulation settings
const G = 1.0;
const SIM_DT = 0.005;
const STEPS_PER_FRAME = 3;
const TRAIL_LENGTH = 1500;

// DOM Elements
const btnFigure8 = document.getElementById('btn-figure8');
const btnChaotic = document.getElementById('btn-chaotic');
const descText = document.getElementById('mode-description');

// Dynamic Camera State
let cameraScale = 150;
let cameraX = 0;
let cameraY = 0;

class Body {
    constructor(x, y, vx, vy, mass, color) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.mass = mass;
        this.color = color;
        this.trail = [];
    }

    update(fx, fy, dt) {
        const ax = fx / this.mass;
        const ay = fy / this.mass;

        this.vx += ax * dt;
        this.vy += ay * dt;

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > TRAIL_LENGTH) {
            this.trail.shift();
        }
    }

    toScreen(simX, simY, scale, offsetX, offsetY) {
        return {
            x: offsetX + simX * scale,
            y: offsetY + (-simY) * scale
        };
    }

    draw(ctx, scale, offsetX, offsetY) {
        if (this.trail.length > 1) {
            ctx.beginPath();
            const start = this.toScreen(this.trail[0].x, this.trail[0].y, scale, offsetX, offsetY);
            ctx.moveTo(start.x, start.y);

            for (let i = 1; i < this.trail.length; i++) {
                const p = this.toScreen(this.trail[i].x, this.trail[i].y, scale, offsetX, offsetY);
                ctx.lineTo(p.x, p.y);
            }
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.3;
            ctx.stroke();
            ctx.globalAlpha = 1.0;
        }

        const pos = this.toScreen(this.x, this.y, scale, offsetX, offsetY);

        ctx.beginPath();
        if (this.mass < 0.1) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = this.color;
            const radius = 4; // Planet size
            ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.strokeStyle = '#fff'; // Ring/Highlight
            ctx.lineWidth = 1;
            ctx.stroke();
        } else {
            ctx.shadowBlur = 25;
            ctx.shadowColor = this.color;
            const radius = Math.max(8, Math.sqrt(this.mass) * 4);
            ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        ctx.shadowBlur = 0;
    }
}

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

function calculateForces() {
    const forces = bodies.map(() => ({ x: 0, y: 0 }));

    for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
            const dx = bodies[j].x - bodies[i].x;
            const dy = bodies[j].y - bodies[i].y;
            const distSq = dx * dx + dy * dy;
            const dist = Math.sqrt(distSq);

            const softening = 0.15;
            const softDistSq = distSq + softening * softening;

            const f = (G * bodies[i].mass * bodies[j].mass) / softDistSq;

            const fx = f * (dx / dist);
            const fy = f * (dy / dist);

            forces[i].x += fx;
            forces[i].y += fy;
            forces[j].x -= fx;
            forces[j].y -= fy;
        }
    }

    // [Soft Boundary] Galactic Potential
    const BOUNDARY_RADIUS = 2.5;
    const RESTORING_STRENGTH = 0.05;

    for (let i = 0; i < bodies.length; i++) {
        if (bodies[i].mass > 0.1) {
            const distSq = bodies[i].x * bodies[i].x + bodies[i].y * bodies[i].y;
            const distFromCenter = Math.sqrt(distSq);

            if (distFromCenter > BOUNDARY_RADIUS) {
                const pullForce = (distFromCenter - BOUNDARY_RADIUS) * RESTORING_STRENGTH;
                const angle = Math.atan2(bodies[i].y, bodies[i].x);
                forces[i].x -= Math.cos(angle) * pullForce;
                forces[i].y -= Math.sin(angle) * pullForce;
            }
        }
    }

    return forces;
}

function updatePlanetColor(planet) {
    let minDist = Infinity;
    for (const body of bodies) {
        if (body === planet) continue;
        const dx = body.x - planet.x;
        const dy = body.y - planet.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) minDist = dist;
    }

    // Dynamic temperature scaling
    // User requested "Planet as Blue".
    // We keep Blue as the "Safe/Cold" base, and shift to Red/White when hot.
    if (minDist < 0.5) {
        planet.color = '#FF4444'; // Scorching (Red)
    } else if (minDist < 1.2) {
        planet.color = '#DDDDFF'; // Temperate/Heating (White-ish Blue)
    } else {
        planet.color = PLANET_COLOR; // Frozen/Safe (Blue)
    }
}

function loop() {
    ctx.clearRect(0, 0, width, height);

    for (let s = 0; s < STEPS_PER_FRAME; s++) {
        const forces = calculateForces();
        for (let i = 0; i < bodies.length; i++) {
            bodies[i].update(forces[i].x, forces[i].y, SIM_DT);
        }
    }

    // [Dynamic Camera Logic]
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    let targets = bodies.filter(b => b.mass > 0.1);
    if (targets.length === 0) targets = bodies;

    for (const b of targets) {
        if (b.x < minX) minX = b.x;
        if (b.x > maxX) maxX = b.x;
        if (b.y < minY) minY = b.y;
        if (b.y > maxY) maxY = b.y;
    }

    const boxWidth = maxX - minX;
    const boxHeight = maxY - minY;
    const maxDim = Math.max(boxWidth, boxHeight);
    const targetScale = Math.min(width, height) / (maxDim * 2.0 + 1.0);

    const lerp = 0.05;
    cameraScale += (targetScale - cameraScale) * lerp;

    const targetX = (minX + maxX) / 2;
    const targetY = (minY + maxY) / 2;
    cameraX += (targetX - cameraX) * lerp;
    cameraY += (targetY - cameraY) * lerp;

    const cx = width / 2;
    const cy = height / 2;

    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    for (const body of bodies) {
        if (body.mass < 0.1) updatePlanetColor(body);

        const offsetX = cx - cameraX * cameraScale;
        const offsetY = cy + cameraY * cameraScale;

        body.draw(ctx, cameraScale, offsetX, offsetY);
    }

    animationId = requestAnimationFrame(loop);
}

function initFigure8() {
    if (animationId) cancelAnimationFrame(animationId);

    // Description Update for consistency
    descText.innerHTML = "<strong>Figure-8 Mode (+Planet)</strong><br>A stable periodic orbit of 3 stars. <br>The Blue Planet attempts to survive in the center.";

    const x = 0.97000436;
    const y = -0.24308753;
    const correct_vx = 0.4662036850;
    const correct_vy = 0.4323657300;

    const b1 = new Body(x, y, correct_vx, correct_vy, 1, colors[0]); // Red
    const b2 = new Body(-x, -y, correct_vx, correct_vy, 1, colors[1]); // Yellow
    const b3 = new Body(0, 0, -2 * correct_vx, -2 * correct_vy, 1, colors[2]); // Orange

    bodies = [b1, b2, b3];

    // (2) Add Planet to Figure-8
    // Try to place it safely? Or just let it be tossed? 
    // Let's place it orbiting Body 1 tightly so it survives for a bit.
    // Or just thrown in. Let's throw it in near the center.
    // [FIX] Do NOT place at (0,0) because Body 3 is at (0,0) -> Division by Zero -> NaN -> Black Screen.
    // Giving it a slight offset.
    const planet = new Body(0.1, 0.1, 0.4, 0.1, 0.0001, PLANET_COLOR);
    bodies.push(planet);

    loop();
}

function initChaotic() {
    if (animationId) cancelAnimationFrame(animationId);

    descText.innerHTML = "<strong>Bound Chaos Mode</strong><br>Stars (Red/Yellow/Orange) vs Blue Planet.<br>Broken Triangle setup for long-lasting chaos.";

    bodies = [];

    // 1. Triangular Setup
    const r = 1.0;
    const v_orbital = Math.sqrt(1.0 / (Math.sqrt(3) * r));

    for (let i = 0; i < 3; i++) {
        const theta = (i / 3) * Math.PI * 2;

        let bx = r * Math.cos(theta);
        let by = r * Math.sin(theta);

        let bvx = -v_orbital * Math.sin(theta);
        let bvy = v_orbital * Math.cos(theta);

        // Perturbation
        const perturbation = 0.15;

        bx += (Math.random() - 0.5) * perturbation;
        by += (Math.random() - 0.5) * perturbation;
        bvx += (Math.random() - 0.5) * perturbation;
        bvy += (Math.random() - 0.5) * perturbation;

        // Use new colors cyclically
        bodies.push(new Body(bx, by, bvx, bvy, 1.0, colors[i]));
    }

    // 3. Add Trisolaris (Planet) - Blue
    bodies.push(new Body(0.1, 0.1, 0.2, 0.2, 0.0001, PLANET_COLOR));

    loop();
}

window.addEventListener('resize', resize);

btnFigure8.addEventListener('click', () => {
    btnFigure8.classList.add('active');
    btnChaotic.classList.remove('active');
    initFigure8();
});

btnChaotic.addEventListener('click', () => {
    btnChaotic.classList.add('active');
    btnFigure8.classList.remove('active');
    initChaotic();
});

const btnInfo = document.getElementById('btn-info');
const infoPanel = document.getElementById('info-panel');
const btnCloseInfo = document.getElementById('close-info');

btnInfo.addEventListener('click', () => {
    infoPanel.classList.remove('hidden');
});

btnCloseInfo.addEventListener('click', () => {
    infoPanel.classList.add('hidden');
});

resize();
initFigure8();
