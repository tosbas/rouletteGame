const canvasWheel = document.querySelector('#canvas1');
const ctxWheel = canvasWheel.getContext('2d');
const canvasArrow = document.querySelector("#canvas2");
const ctxArrow = canvasArrow.getContext('2d');
const btnSpin = document.getElementById("btn-turn-wheel");
const result = document.getElementById("result");

canvasWheel.width = window.innerWidth;
canvasWheel.height = window.innerHeight;

canvasArrow.width = window.innerWidth;
canvasArrow.height = window.innerHeight;

const sectors = [];

for (let i = 5; i < 105; i += 5) {

    let color;

    if (i == 95) {
        color = `hsl(0, 70%, 60%)`;
        sectors.push(
            { color: color, label: 50 }
        );
    }

    if (i === 100) {
        color = "hsl(10, 100%, 50%)";
    } else {
        color = `hsl(${i * 255}, 70%, 60%)`;
    }

    sectors.push(
        { color: color, label: i }
    );
}


const rand = (min, max) => Math.random() * (max - min) + min;

const sectorCount = sectors.length;
const diameter = 800;
const radius = diameter / 2;

const PI = Math.PI;
const TAU = 2 * PI;

const sectorAngle = TAU / sectorCount;
const friction = 0.996;
const minAngularVelocity = 0.001;

let maxAngularVelocity = 0;
let currentAngularVelocity = 0;

let currentAngle = 0;

let isSpinning = false;
let isAccelerating = false;

const getCurrentSectorIndex = () => Math.floor(sectorCount - currentAngle / TAU * sectorCount) % sectorCount;

const drawSector = (sector, i) => {
    const startAngle = sectorAngle * i;
    ctxWheel.save();
    ctxWheel.beginPath();
    ctxWheel.fillStyle = sector.color;
    ctxWheel.strokeStyle = "white";
    ctxWheel.lineWidth = 5;
    ctxWheel.moveTo(canvasWheel.width / 2, canvasWheel.height / 2);
    ctxWheel.arc(canvasWheel.width / 2, canvasWheel.height / 2, radius, startAngle, startAngle + sectorAngle);
    ctxWheel.lineTo(canvasWheel.width / 2, canvasWheel.height / 2);
    ctxWheel.fill();
    ctxWheel.translate(canvasWheel.width / 2, canvasWheel.height / 2);
    ctxWheel.rotate(startAngle + sectorAngle / 2);
    ctxWheel.textAlign = "right";
    ctxWheel.fillStyle = "#fff";
    ctxWheel.font = "bold 30px sans-serif";
    ctxWheel.fillText(sector.label, radius - 10, 10);
    ctxWheel.stroke();
    ctxWheel.restore();

    drawArrow();
};

const rotateWheel = () => {

    canvasWheel.style.transform = `rotate(${currentAngle - PI / 2}rad)`;
};

const arrowLength = 50;
const arrowWidth = 40;
let arrowAngle = 90;

const drawArrow = () => {
    ctxArrow.save();
    ctxArrow.translate(canvasArrow.width / 2, canvasArrow.height / 2 - 450);
    ctxArrow.rotate((arrowAngle * PI) / 180);
    ctxArrow.fillStyle = "orange";
    ctxArrow.strokeStyle = "black";
    ctxArrow.lineWidth = 2;
    ctxArrow.beginPath();
    ctxArrow.moveTo(0, -arrowWidth / 2);
    ctxArrow.lineTo(arrowLength, 0);
    ctxArrow.lineTo(0, arrowWidth / 2);
    ctxArrow.lineTo(0, -arrowWidth / 2);
    ctxArrow.closePath();
    ctxArrow.fill();
    ctxArrow.stroke();
    ctxArrow.restore();
}

const startAnimationLoop = () => {
    requestAnimationFrame(startAnimationLoop);

    if (!isSpinning) {

        return;
    };

    const sector = sectors[getCurrentSectorIndex()];
    result.textContent = `${sector.label}`;
    result.style.backgroundColor = `${sector.color}`;


    if (currentAngularVelocity >= maxAngularVelocity) isAccelerating = false;

    if (isAccelerating) {
        currentAngularVelocity ||= minAngularVelocity;
        currentAngularVelocity *= 1.06;
    } else {
        isAccelerating = false;
        currentAngularVelocity *= friction;

        if (currentAngularVelocity < minAngularVelocity) {
            isSpinning = false;
            currentAngularVelocity = 0;
            cancelAnimationFrame(startAnimationLoop);
            displayResult();
        }
    }

    currentAngle += currentAngularVelocity;
    currentAngle %= TAU;
    rotateWheel();
}

const displayResult = () => {
    const sector = sectors[getCurrentSectorIndex()];
    result.textContent = `${sector.label}`;
    result.style.backgroundColor = `${sector.color}`;
}

btnSpin.addEventListener("click", () => {
    if (isSpinning) return;
    isSpinning = true;
    isAccelerating = true;
    maxAngularVelocity = rand(0.25, 0.40);
    startAnimationLoop();
});

sectors.forEach(drawSector);

currentAngle = rand(-TAU / 2, TAU / 2);
rotateWheel();


