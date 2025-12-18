function generateSectors() {
    const wheelSectors = [];
    const sectorColors = ['#f82', '#fb0'];  // Alternance de couleurs
    let sectorValues = [];

    // Créer un tableau avec les valeurs de 5 à 95 et ajouter deux fois 50
    for (let i = 5; i <= 100; i += 5) {
        sectorValues.push(i);
    }
    sectorValues.push(50);  // Ajouter une deuxième occurrence de 50

    // Mélanger les valeurs de manière aléatoire
    sectorValues = sectorValues.sort(() => Math.random() - 0.5);

    // Générer les secteurs avec des couleurs alternées
    for (let i = 0; i < 21; i++) {
        wheelSectors.push({
            color: sectorColors[i % 2],  // Alternance de couleurs
            label: sectorValues[i].toString()  // Valeur aléatoire
        });
    }

    return wheelSectors;
}

const wheelSectors = generateSectors();

// Générer un nombre flottant aléatoire dans la plage min-max
const getRandomInRange = (min, max) => Math.random() * (max - min) + min;

const totalSectors = wheelSectors.length;
const spinButton = document.querySelector("#spin");
const result = document.querySelector("#result");
const ctx = document.querySelector("#wheel").getContext('2d');
const canvasDiameter = ctx.canvas.width;
const canvasRadius = canvasDiameter / 2;
const mathPI = Math.PI;
const fullCircle = 2 * mathPI;  // Tour complet en radians
const sectorArc = fullCircle / totalSectors;
const decelerationFactor = 0.991;  // Facteur de décélération
const minAngularVelocity = 0.001; // Vitesse angulaire minimale pour l'arrêt

let currentAngularVelocity = 0;  // Vitesse angulaire actuelle
let currentAngle = 0.1;  // Angle de rotation initial (en radians)
let isWheelSpinning = false;
let animationFrameId = null; // ID pour requestAnimationFrame

const audio = new Audio('wheel-sound.mp3');  // Son pour la roue

// Calcul de la vitesse angulaire initiale pour un arrêt en 10 secondes
const totalRotationTime = 12; // Temps total pour un tour complet (en secondes)
const initialAngularVelocity = fullCircle / totalRotationTime / (1 - decelerationFactor);

let previousSectorIndex = -1;
let sectorChangeCounter = 0;
//* Obtenir l'index du secteur actuel */
const getCurrentSectorIndex = () => Math.floor(totalSectors - currentAngle / fullCircle * totalSectors) % totalSectors;

//* Dessiner les secteurs et leurs textes sur le canevas */
const drawSector = (sector, index) => {
    const sectorAngle = sectorArc * index;
    ctx.save();

    // Dessiner le segment
    ctx.beginPath();
    ctx.moveTo(canvasRadius, canvasRadius);
    ctx.arc(canvasRadius, canvasRadius, canvasRadius, sectorAngle, sectorAngle + sectorArc);
    ctx.lineTo(canvasRadius, canvasRadius);
    ctx.fillStyle = sector.color;
    ctx.fill();

    // Ajouter une bordure autour du segment
    ctx.lineWidth = 0.5;  // Épaisseur de la bordure
    ctx.strokeStyle = "#000";  // Couleur de la bordure (noir)
    ctx.stroke();  // Appliquer la bordure

    // Dessiner le texte du secteur
    ctx.translate(canvasRadius, canvasRadius);
    ctx.rotate(sectorAngle + sectorArc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";
    ctx.font = "bold 30px sans-serif";
    ctx.fillText(sector.label, canvasRadius - 10, 10);

    ctx.restore();
};

//* Appliquer une rotation CSS au canevas */
const applyRotation = () => {
    const currentSector = wheelSectors[getCurrentSectorIndex()];
    ctx.canvas.style.transform = `rotate(${currentAngle - mathPI / 2}rad)`;
};

const updateFrame = () => {
    if (!isWheelSpinning) return;

    // Appliquer la décélération
    currentAngularVelocity *= decelerationFactor;
    result.innerText = wheelSectors[getCurrentSectorIndex()].label;

    // Si la vitesse est inférieure à la vitesse minimale, arrêter la rotation
    if (currentAngularVelocity < minAngularVelocity) {
        isWheelSpinning = false;
        result.classList.add('anim');
        cancelAnimationFrame(animationFrameId);
    }

    // Mise à jour de l'angle
    currentAngle += currentAngularVelocity;
    currentAngle %= fullCircle; // Normaliser l'angle

    const currentSectorIndex = getCurrentSectorIndex();

    // Condition pour jouer le son avec une fréquence ajustée en fonction de la vitesse
    if (currentSectorIndex !== previousSectorIndex) {
        audio.play();
        if (currentAngularVelocity < 0.01) {  // Jouer moins souvent si la vitesse est élevée
            audio.currentTime = 0; // Réinitialiser le son
        }
        previousSectorIndex = currentSectorIndex;
    }

    applyRotation(); // Appliquer la rotation CSS !

    // Continue à appeler updateFrame tant que la roue tourne
    animationFrameId = requestAnimationFrame(updateFrame);
};

const startEngine = () => {
    currentAngularVelocity = initialAngularVelocity; // Initialiser la vitesse angulaire
    updateFrame(); // Démarrer la mise à jour de la frame
};

// Démarrer le moteur lors du clic sur le bouton
spinButton.addEventListener("click", () => {
    if (isWheelSpinning) return;

    result.classList.remove('anim');
    result.innerText = '';
    isWheelSpinning = true;
    startEngine(); // Démarrer avec la vitesse calculée
});

wheelSectors.forEach(drawSector);
applyRotation(); // Initialiser la rotation


