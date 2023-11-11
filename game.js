const canvasWheel = document.querySelector('#canvas1');
const ctxWheel = canvasWheel.getContext('2d');
const canvasArrow = document.querySelector("#canvas2");
const ctxArrow = canvasArrow.getContext('2d');
const btnSpin = document.getElementById("btn-turn-wheel");
const result = document.getElementById("result");

const rouletteSong = document.getElementById("rouletteSong");
const finishSong = document.getElementById("finishSong");

const overlay = document.getElementById("overlay");

canvasWheel.width = canvasArrow.width = window.innerWidth;
canvasWheel.height = canvasArrow.height = window.innerHeight;

const sectors = [];

for (let i = 5; i < 105; i += 5) {
    let color = (i === 95) ? `hsl(0, 70%, 60%)` : (i === 100) ? "hsl(10, 100%, 50%)" : `hsl(${i * 255}, 70%, 60%)`;
    sectors.push({ id: i, color: color, label: (i === 95) ? 50 : i });
}

const rand = (min, max) => Math.random() * (max - min) + min;

const sectorCount = sectors.length;
const diameter = window.innerHeight - 163;
const radius = diameter / 2;

const PI = Math.PI;
const TAU = 2 * PI;

const sectorAngle = TAU / sectorCount;
const friction = 0.995;
const minAngularVelocity = 0.0005;

let maxAngularVelocity = 0.40;
let currentAngularVelocity = 0;
let currentAngle = rand(-TAU / 2, TAU / 2);

let isSpinning = false;
let isAccelerating = false;

let startTime;
let timeout;
let requestId;

const spinDuration = 24;

const getCurrentSectorIndex = () => Math.floor(sectorCount - currentAngle / TAU * sectorCount) % sectorCount;

const drawSector = (sector, i) => {
    const startAngle = sectorAngle * i;
    ctxWheel.save();
    ctxWheel.beginPath();
    ctxWheel.fillStyle = sector.color;
    ctxWheel.strokeStyle = "white";
    ctxWheel.lineWidth = 2;
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
    finishSong.pause();
    finishSong.currentTime = 0;
    overlay.classList.remove("overlay");
    result.classList.remove("resultVictory");
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
};

const array = [];

const startAnimationLoop = () => {
    requestId = requestAnimationFrame(startAnimationLoop);

    if (!isSpinning) {
        cancelAnimationFrame(requestId);
        return;
    }

    const elapsedTime = (Date.now() - startTime) / 1000;

    if (elapsedTime >= spinDuration) {
        isSpinning = false;
        startTime = Date.now();
        cancelAnimationFrame(requestId);
        displayResult();
        return;
    }

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
            cancelAnimationFrame(requestId);
            displayResult();
            return;
        }
    }

    displaySongRotate(sector);

    currentAngle += currentAngularVelocity;
    currentAngle %= TAU;
    rotateWheel();
};

const displaySongRotate = (sector) => {
    if (!array.includes(sector.id)) {
        array.push(sector.id);

        rouletteSong.volume = 0.5;
        rouletteSong.play();
        if (rouletteSong.currentTime >= rouletteSong.duration) {
            rouletteSong.pause();
        }

        if (array.length > 2) {
            array.splice(0, 2);
        }
    }
};

const displayResult = () => {
    const sector = sectors[getCurrentSectorIndex()];
    result.textContent = `${sector.label}`;
    result.style.backgroundColor = `${sector.color}`;

    finishSong.play();
    overlay.classList.add("overlay");
    result.classList.add("resultVictory");

    rouletteSong.pause();

    timeout = setTimeout(() => {
        result.innerHTML = "GO !";
        result.removeAttribute("style");
        result.style.backgroundColor = "#00000";
        overlay.classList.remove("overlay");
        result.classList.remove("resultVictory");
    }, 7000);
};

btnSpin.addEventListener("click", () => {
    if (isSpinning) return;
    isSpinning = true;
    isAccelerating = true;
    rouletteSong.currentTime = 0;
    currentAngularVelocity = 0.0005;
    startTime = Date.now();
    clearTimeout(timeout);
    cancelAnimationFrame(requestId);
    startAnimationLoop();
});

sectors.forEach(drawSector);

rotateWheel();