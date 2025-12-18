function generateSectors() {
    const wheelSectors = [];
    const sectorColors = ['#f82', '#fb0'];  // Alternance de couleurs
    const specialColor = '#ccc';  // Couleur spéciale pour le secteur de départ (gris clair)
    let sectorValues = [];

    // Créer un tableau avec les valeurs de 5 à 95 et ajouter deux fois 50
    for (let i = 5; i <= 100; i += 5) {
        sectorValues.push(i);
    }
    sectorValues.push(50);  // Ajouter une deuxième occurrence de 50

    // Mélanger les valeurs de manière aléatoire
    sectorValues = sectorValues.sort(() => Math.random() - 0.5);

    // Placer le premier '50' dans une position fixe avec la couleur spéciale
    const fixedSector = sectorValues.indexOf(50); // Trouver la première occurrence de 50
    const fixedSectorColor = specialColor;

    // Générer les secteurs avec des couleurs alternées
    for (let i = 0; i < 21; i++) {
        let color = sectorColors[i % 2];  // Alternance de couleurs
        if (i === fixedSector) {
            // Appliquer la couleur spéciale pour le secteur de départ
            color = fixedSectorColor;
        }
        wheelSectors.push({
            color: color,  // Alternance de couleurs ou couleur spéciale
            label: sectorValues[i].toString()  // Valeur aléatoire
        });
    }

    return wheelSectors;
}

let wheelSectors = generateSectors();

// Paramètre pour contrôler le temps de rotation (modifiable)
let rotationDuration = 10; // Durée de la rotation en secondes (par exemple, 1 seconde)
const fullCircle = 2 * Math.PI;  // Tour complet en radians
const totalSectors = wheelSectors.length;
const spinButton = document.querySelector("#spin");
const result = document.querySelector("#result");
const ctx = document.querySelector("#wheel").getContext('2d');
const canvasDiameter = ctx.canvas.width;
const canvasRadius = canvasDiameter / 2;

let currentAngularVelocity = 0;
let currentAngle = 0.1;  // Angle de rotation initial
let isWheelSpinning = false;
let animationFrameId = null; // ID pour requestAnimationFrame

const decelerationFactor = 0.99;  // Facteur de décélération (ajuste ce facteur pour un arrêt plus rapide ou plus lent)
const minAngularVelocity = 0.001; // Vitesse angulaire minimale pour l'arrêt
const audio = new Audio('wheel-sound.mp3');  // Son pour la roue

let startTime = null; // Moment où le moteur commence à tourner
let elapsedTime = 0; // Temps écoulé depuis le début de la rotation

// Calcul de la vitesse angulaire initiale en fonction du temps de rotation
const initialAngularVelocity = fullCircle / rotationDuration / (1 - decelerationFactor);

// Obtenir l'index du secteur actuel
const getCurrentSectorIndex = () => Math.floor(totalSectors - currentAngle / fullCircle * totalSectors) % totalSectors;

// Dessiner les secteurs sur le canevas
const drawSector = (sector, index) => {
    const sectorArc = fullCircle / totalSectors;
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
    ctx.stroke();

    // Dessiner le texte du secteur
    ctx.translate(canvasRadius, canvasRadius);
    ctx.rotate(sectorAngle + sectorArc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";
    ctx.font = "bold 30px sans-serif";
    ctx.fillText(sector.label, canvasRadius - 10, 10);

    ctx.restore();
};

// Appliquer la rotation CSS au canevas
const applyRotation = () => {
    ctx.canvas.style.transform = `rotate(${currentAngle - Math.PI / 2}rad)`;
};

let previousSectorIndex = -1;
let sectorChangeCounter = 0;

// Fonction de mise à jour de la frame
const updateFrame = () => {
    if (!isWheelSpinning) return;

    // Calculer le temps écoulé depuis le début de la rotation
    elapsedTime = (performance.now() - startTime) / 1000; // Temps en secondes

    // Si le temps écoulé est supérieur ou égal à la durée de la rotation, arrêter
    if (elapsedTime >= rotationDuration) {
        // Arrêter immédiatement la roue
        currentAngularVelocity = 0;
        isWheelSpinning = false;
        audio.pause();
        audio.currentTime = 0;
        result.classList.add('anim');
        cancelAnimationFrame(animationFrameId);
    } else {
        // Appliquer la décélération
        currentAngularVelocity *= decelerationFactor;
    }

    // Mise à jour de l'angle
    currentAngle += currentAngularVelocity;
    currentAngle %= fullCircle; // Normaliser l'angle

    // Afficher le secteur actuel
    result.innerText = wheelSectors[getCurrentSectorIndex()].label;

    applyRotation(); // Appliquer la rotation CSS !

    // Continue à appeler updateFrame tant que la roue tourne
    animationFrameId = requestAnimationFrame(updateFrame);
};

// Démarrer le moteur
const startEngine = () => {
    startTime = performance.now(); // Capturer le temps de démarrage
    currentAngularVelocity = initialAngularVelocity; // Initialiser la vitesse angulaire
    updateFrame(); // Démarrer la mise à jour de la frame
};

// Démarrer la roue lorsqu'on clique sur le bouton
spinButton.addEventListener("click", () => {
    if (isWheelSpinning) return;
    wheelSectors = generateSectors(); // Regénérer les secteurs aléatoirement à chaque clic
    drawWheel(); // Redessiner la roue avec les nouveaux secteurs
    audio.play();
    result.classList.remove('anim');
    result.innerText = '';
    isWheelSpinning = true;
    startEngine(); // Démarrer avec la vitesse calculée
});

// Dessiner la roue avec les nouveaux secteurs
const drawWheel = () => {
    wheelSectors.forEach(drawSector);  // Dessiner tous les secteurs
    applyRotation();  // Appliquer la rotation initiale
};

drawWheel(); // Initialiser la rotation et dessiner les secteurs


