// ELEMENTOS

const cat = document.querySelector('.cat-container');
const eyes = document.querySelectorAll('.eye');
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

const state = {
  isDraggingFood: false,
  isCatEating: false,
  isPurring: false,
  language: "en"
};

const translations = {
  en: {
    interaction: "Interact with him",
    food: "Food",
    meow: "🐱 Meow"
  },
  pt: {
    interaction: "Interaja com ele",
    food: "Comida",
    meow: "🐱 Miar"
  }
};

// INICIALIZAÇÃO

function init() {
  setupEvents();
  setupAudio();
  resetFoodPosition();
}

function setupAudio() {
  purrSound.volume = 1;
  meowSound.volume = 0.30;
}

init();

// EFEITOS SONOROS

function setupEvents() {
  langBtn.addEventListener('click', toggleLanguage);
  meowBtn.addEventListener('click', handleMeow);

  document.addEventListener('mousemove', handleEyeTracking);
  document.addEventListener('mousemove', handleFoodDragging);
  document.addEventListener('mouseup', stopDraggingFood);
  document.addEventListener('mouseleave', stopDraggingFood);

  food.addEventListener('mousedown', startDraggingFood);

  cat.addEventListener('mouseenter', startPurring);
  cat.addEventListener('mouseleave', stopPurring);
}

// TRADUÇÃO

function toggleLanguage() {
  state.language = state.language === "en" ? "pt" : "en";

  const t = translations[state.language];

  interactionText.textContent = t.interaction;
  foodText.textContent = t.food;
  meowBtn.textContent = t.meow;

  langBtn.textContent = state.language === "en" ? "PT" : "EN";
}

// OLHOS (SEGUINDO O MOUSE)

function handleEyeTracking(event) {

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
  if (state.isCatEating) return;

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
  if (state.isDraggingFood || state.isCatEating) return;

  state.isPurring = true;
  purrSound.currentTime = 0;
  purrSound.play();
  cat.classList.add('ronronar');
}


function stopPurring() {
  state.isPurring = false;
  purrSound.pause();
  purrSound.currentTime = 0;
  cat.classList.remove('ronronar');
}

// DRAG DA ALIMENTAÇÃO

function startDraggingFood() {
  state.isDraggingFood = true;
  document.body.style.cursor = "grabbing";
}

function stopDraggingFood() {
  state.isDraggingFood = false;
  document.body.style.cursor = "default";
}

function handleFoodDragging(event) {
  if (!state.isDraggingFood || state.isCatEating) return;

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
  if (state.isCatEating) return;

  state.isCatEating = true;
  state.isDraggingFood = false;

  document.body.style.cursor = "default";
  food.style.pointerEvents = "none";

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
    food.style.pointerEvents = 'auto';

    cat.classList.remove('eat');
    state.isCatEating = false;
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
  const offset = 10;
  const rect = foodContainer.getBoundingClientRect();

  food.style.left = rect.left + rect.width / 2 - offset + 'px';
  food.style.top = rect.top + rect.height / 2 - offset + 'px';
}