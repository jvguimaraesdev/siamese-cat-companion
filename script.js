// ESTADO DO PROJETO

let isDraggingFood = false;
let isCatEating = false;
let isPT = false;

// ELEMENTOS

const cat = document.querySelector('.cat-container');
const food = document.getElementById('food');
const foodContainer = document.querySelector('.food-container');

const meowSound = document.getElementById('meow-sound');
const purrSound = document.getElementById('purr-sound');
const eatingSound = document.getElementById('eating-sound');

const soundWave = document.getElementById('sound-wave');

const langBtn = document.getElementById('lang-btn');
const interactionText = document.getElementById('interaction-text');
const foodText = document.getElementById('food-text');
const meowBtn = document.getElementById('meow-btn');

// INICIALIZAÇÃO

function init() {
    resetFoodPosition();
    setupEventListeners();
    purrSound.volume = 1;
    meowSound.volume = 0.30;
}

init();

// EFEITOS SONOROS

function setupEventListeners() {
    langBtn.addEventListener('click', toggleLanguage);
    meowBtn.addEventListener('click', handleMeow);

    document.addEventListener('mousemove', handleEyeTracking);
    document.addEventListener('mousemove', handleFoodDragging);
    document.addEventListener('mouseup', stopDraggingFood);

    food.addEventListener('mousedown', startDraggingFood);

    cat.addEventListener('mouseenter', startPurring);
    cat.addEventListener('mouseleave', stopPurring);
}

// TRADUÇÃO

function toggleLanguage() {
    isPT = !isPT;

    interactionText.textContent = isPT ? "Interaja com ele" : "Interact with him";
    foodText.textContent = isPT ? "Comida" : "Food";
    meowBtn.textContent = isPT ? "🐱 Miar" : "🐱 Meow";
    langBtn.textContent = isPT ? "EN" : "PT";
}

// OLHOS (SEGUINDO O MOUSE)

function handleEyeTracking(event) {
    const eyes = document.querySelectorAll('.eye');

    eyes.forEach(eye => {
    const rect = eye.getBoundingClientRect();

    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);

    const angle = Math.atan2(dy, dx);
    const distance = Math.min(Math.hypot(dx, dy), 8);

    eye.style.transform =
    `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
    });
}

// MIAR DO GATO

function handleMeow() {
    if (isCatEating) return;

    meowSound.currentTime = 0;
    meowSound.play();

    cat.classList.add('meow');
    setTimeout(() => cat.classList.remove('meow'), 200);

    animateSoundWave();
}

function animateSoundWave() {
    const rect = cat.getBoundingClientRect();

    soundWave.style.left = rect.left + rect.width / 2 - 25 + 'px';
    soundWave.style.top = rect.top + rect.height / 2 - 25 + 'px';
    soundWave.style.opacity = 1;

    let startTime = null;

    function animate(time) {
        if (!startTime) startTime = time;

        const progress = (time - startTime) / 300;

        soundWave.style.transform = `scale(${1 + progress})`;
        soundWave.style.opacity = 1 - progress;

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }

    requestAnimationFrame(animate);
}

// RONRONAR DO GATO

function startPurring() {
    if (!isDraggingFood && !isCatEating) {
        purrSound.play();
        cat.classList.add('ronronar');
    }
}

function stopPurring() {
    purrSound.pause();
    cat.classList.remove('ronronar');
}

// DRAG DA ALIMENTAÇÃO

function startDraggingFood() {
    isDraggingFood = true;
}

function stopDraggingFood() {
    isDraggingFood = false;
}

function handleFoodDragging(event) {
    if (!isDraggingFood) return;

    food.style.left = (event.clientX - 10) + 'px';
    food.style.top = (event.clientY - 10) + 'px';

    checkIfFoodIsNearCat();
}

// SISTEMA DE ALIMENTAÇÃO

function checkIfFoodIsNearCat() {
    const catRect = cat.getBoundingClientRect();
    const foodRect = food.getBoundingClientRect();

// DISTÂNCIA DA COMIDA (ATÉ A BOCA DO GATO)

    const dx = (foodRect.left + 10) - (catRect.left + catRect.width / 2);
    const dy = (foodRect.top + 10) - (catRect.top + catRect.height * 0.48);

    const distance = Math.hypot(dx, dy);

    if (distance < 25) {
        handleEat(foodRect.left + 10, foodRect.top + 10);
    }
}

function handleEat(x, y) {
    if (isCatEating) return;

    isCatEating = true;
    isDraggingFood = false;

    stopPurring();

    eatingSound.currentTime = 0;
    eatingSound.play();

    createCrumbs(x, y);

    cat.classList.add('eat');

    food.style.transform = 'scale(0)';
    food.style.opacity = '0';

    setTimeout(() => {
        resetFoodPosition();

        food.style.transform = 'scale(1)';
        food.style.opacity = '1';

        cat.classList.remove('eat');
        isCatEating = false;
    }, 150);
}

// EFEITO DE MIGALHAS

function createCrumbs(x, y) {
    for (let i = 0; i < 5; i++) {
        const crumb = document.createElement('div');
        crumb.className = 'crumb';

        document.body.appendChild(crumb);

        crumb.style.left = x + 'px';
        crumb.style.top = y + 'px';

        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 15;

        requestAnimationFrame(() => {
            crumb.style.transform =
                `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
            crumb.style.opacity = 0;
        });

        setTimeout(() => crumb.remove(), 400);
    }
}

// RESET DA ALIMENTAÇÃO

function resetFoodPosition() {
    const rect = foodContainer.getBoundingClientRect();

    food.style.left = rect.left + rect.width / 2 - 10 + 'px';
    food.style.top = rect.top + rect.height / 2 - 10 + 'px';
}