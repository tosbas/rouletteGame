const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const result = document.querySelector('#result');

const MARGIN = 20;
const TAU = Math.PI * 2;
const HALF_PI = Math.PI / 2;

const ROTATION_POWER = 1;
const DECELERATION = 0.99;
const MIN_VELOCITY = 0.001;

let radius;
let currentAngle = 0.15;
let angularVelocity = 0;
let isSpinning = false;

const sectors = generateSectors();
const sectorArc = TAU / sectors.length;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const diameter = Math.min(canvas.width, canvas.height);
    radius = diameter / 2 - MARGIN;

    drawWheel();
}

function generateSectors() {
    const colors = ['#f82', '#fb0', '#ac4848ff'];

    const sectors = Array.from({ length: 10 }, (_, i) => ({
        label: (i + 1) * 5,
        color: colors[i % colors.length]
    }));

    for (let i = sectors.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sectors[i], sectors[j]] = [sectors[j], sectors[i]];
    }

    return sectors;
}

function getCurrentSectorIndex() {
    return Math.floor(
        sectors.length - currentAngle / TAU * sectors.length
    ) % sectors.length;
}

function drawSector(sector, index) {
    const angle = sectorArc * index;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.save();

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, angle, angle + sectorArc);
    ctx.closePath();

    ctx.fillStyle = sector.color;
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000";
    ctx.stroke();

    ctx.translate(centerX, centerY);
    ctx.rotate(angle + sectorArc / 2);

    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";
    ctx.font = "bold 30px sans-serif";
    ctx.fillText(sector.label, radius - 10, 10);

    ctx.restore();
}

function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    sectors.forEach(drawSector);
}

function animate() {

    if (angularVelocity < MIN_VELOCITY) {
        result.classList.add('anim');
        isSpinning = false;
        return;
    }

    angularVelocity *= DECELERATION;

    currentAngle = (currentAngle + angularVelocity) % TAU;

    result.textContent = sectors[getCurrentSectorIndex()].label;

    canvas.style.transform =
        `rotate(${currentAngle - HALF_PI}rad)`;

    requestAnimationFrame(animate);
}

result.addEventListener('click', () => {

    if (isSpinning) return;

    result.classList.remove('anim');

    isSpinning = true;

    angularVelocity =
        ROTATION_POWER / (1 - DECELERATION);

    animate();
});

window.addEventListener('resize', resizeCanvas);

resizeCanvas();