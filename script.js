const gameBoard = document.getElementById('game-board');
const levelDisplay = document.getElementById('level');
const nextNumberDisplay = document.getElementById('next-number');
const timerDisplay = document.getElementById('timer');
const winScreen = document.getElementById('win-screen');
const playAgainButton = document.getElementById('play-again');
const goldDisplay = document.getElementById('gold');
const btnHint = document.getElementById('btn-hint');
const btnTime = document.getElementById('btn-time');

// Modal Elements
const messageModal = document.getElementById('message-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalAction = document.getElementById('modal-action');

const MAX_LEVEL = 10;
const NUMBERS_PER_LEVEL = 40;
const POOL_SIZE = 99; // Random numbers between 1 and 99
const TIME_LIMIT = 30; // 30 seconds per number
const HINT_COST = 10;
const TIME_COST = 20;

// Audio Setup
const bgMusic = new Audio('./music/chamber_music.mp3');
bgMusic.volume = 0.1;
bgMusic.loop = true;

document.addEventListener('DOMContentLoaded', () => {
    // Start music on first interaction to comply with browser autoplay policies
    document.body.addEventListener('click', () => {
        bgMusic.play().catch(e => console.log("Audio play failed/already playing:", e));
    }, { once: true });
});

// Game State
let gameState = {
    level: 1,
    gold: 0,
    highScore: 0
};

let currentIndex = 0;
let targetSequence = [];
let timerInterval;
let timeLeft = TIME_LIMIT;

const LEVEL_WALLPAPERS = [
    './wallpapers/wallpaper_1.jpg',
    './wallpapers/wallpaper_2.jpg',
    './wallpapers/wallpaper_3.jpg',
    './wallpapers/wallpaper_4.jpg',
    './wallpapers/wallpaper_5.jpg',
    './wallpapers/wallpaper_6.jpg',
    './wallpapers/wallpaper_7.jpg',
    './wallpapers/wallpaper_8.jpg',
    './wallpapers/wallpaper_9.jpg',
    './wallpapers/wallpaper_10.jpg'
];

// Persistence Logic
function saveGame() {
    localStorage.setItem('number_clicker_state', JSON.stringify(gameState));
}

function loadGame() {
    const saved = localStorage.getItem('number_clicker_state');
    if (saved) {
        gameState = JSON.parse(saved);
        updateUI();
    }
}

function updateUI() {
    levelDisplay.textContent = gameState.level;
    goldDisplay.textContent = gameState.gold;
    btnHint.disabled = gameState.gold < HINT_COST;
    btnTime.disabled = gameState.gold < TIME_COST;
}

// Function to shuffle an array (Fisher-Yates shuffle)
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Function to generate random unique numbers
function generateRandomNumbers(count, max) {
    const pool = Array.from({ length: max }, (_, i) => i + 1);
    const shuffled = shuffle([...pool]);
    return shuffled.slice(0, count);
}

// Function to spawn particles at click location
function spawnParticles(x, y) {
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 30,
            spread: 60,
            origin: { x: x / window.innerWidth, y: y / window.innerHeight },
            colors: ['#ffd700', '#ffffff', '#ff00cc'],
            disableForReducedMotion: true,
            zIndex: 1000
        });
    }
}

// Function to handle clapping/confetti
function triggerWinConfetti() {
    if (typeof confetti === 'function') {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            // since particles fall down, start a bit higher than random
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    }
}

// Modal Logic
function showModal(title, message, actionText, actionCallback) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;

    // Get the current button element from the DOM
    const currentActionBtn = document.getElementById('modal-action');
    currentActionBtn.textContent = actionText;

    // Remove old event listeners to prevent stacking by cloning and replacing
    const newButton = currentActionBtn.cloneNode(true);
    currentActionBtn.parentNode.replaceChild(newButton, currentActionBtn);

    newButton.addEventListener('click', () => {
        messageModal.classList.add('hidden');
        if (actionCallback) actionCallback();
    });

    messageModal.classList.remove('hidden');
}

// Timer Logic
function startTimer() {
    clearInterval(timerInterval);
    timeLeft = TIME_LIMIT;
    timerDisplay.textContent = timeLeft;

    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleGameOver();
        }
    }, 1000);
}

function handleGameOver() {
    showModal("Time's Up!", "You ran out of time! Game Over.", "Restart Level 1", () => {
        resetGame();
    });
}

// Power-up Handlers
function useHint() {
    if (gameState.gold >= HINT_COST) {
        gameState.gold -= HINT_COST;
        updateUI();
        saveGame();

        const targetNum = targetSequence[currentIndex];
        const targetCell = Array.from(document.querySelectorAll('.number-cell')).find(cell => parseInt(cell.dataset.number) === targetNum);

        if (targetCell) {
            targetCell.classList.add('hint-highlight');
            setTimeout(() => {
                targetCell.classList.remove('hint-highlight');
            }, 3000);
        }
    }
}

function addTime() {
    if (gameState.gold >= TIME_COST) {
        gameState.gold -= TIME_COST;
        timeLeft += 10;
        timerDisplay.textContent = timeLeft;
        updateUI();
        saveGame();

        // Visual feedback for time added
        timerDisplay.style.color = '#38ef7d';
        setTimeout(() => {
            timerDisplay.style.color = '#ff4757';
        }, 1000);
    }
}

// Function to handle clicking a number
function handleNumberClick(event) {
    const clickedElement = event.target;
    // Check if element is already clicked to prevent double clicks
    if (clickedElement.classList.contains('clicked')) return;

    const clickedNumber = parseInt(clickedElement.dataset.number, 10);

    // Check against the current expected number in the random sequence
    if (clickedNumber === targetSequence[currentIndex]) {
        clickedElement.classList.add('clicked');
        clickedElement.classList.remove('hint-highlight'); // Remove hint if it was there

        // Spawn particles at click position
        const rect = clickedElement.getBoundingClientRect();
        spawnParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);

        currentIndex++;

        // Update next number display
        if (currentIndex < targetSequence.length) {
            nextNumberDisplay.textContent = targetSequence[currentIndex];
        } else {
            nextNumberDisplay.textContent = "Done";
        }

        // Reset timer on correct click
        startTimer();

        if (currentIndex >= targetSequence.length) {
            clearInterval(timerInterval); // Stop timer on level completion
            levelComplete();
        }
    }
}

// Function to handle level completion
function levelComplete() {
    // Reward Gold: Base 10 + (Remaining time / 2)
    const reward = 10 + Math.floor(timeLeft / 2);
    gameState.gold += reward;

    if (gameState.level >= MAX_LEVEL) {
        // Game Won
        winScreen.classList.remove('hidden');
        triggerWinConfetti();
        gameState.level = 1; // Reset for next play
    } else {
        // Advance to the next level
        gameState.level++;

        // Adding confetti for level complete
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        setTimeout(() => {
            showModal("Level Complete!", `You earned 💰 ${reward} gold! Ready for Level ${gameState.level}?`, "Start Next Level", () => {
                createLevel();
            });
        }, 500);
    }
    updateUI();
    saveGame();
}

// Function to create and set up a level
function createLevel() {
    gameBoard.innerHTML = ''; // Clear the board
    updateUI();

    // Set background wallpaper for the level
    const wallpaperUrl = LEVEL_WALLPAPERS[(gameState.level - 1) % LEVEL_WALLPAPERS.length];
    document.body.style.backgroundImage = `url('${wallpaperUrl}')`;

    // Generate random numbers
    const randomNumbers = generateRandomNumbers(NUMBERS_PER_LEVEL, POOL_SIZE);

    // Sort them to get the target sequence to find
    targetSequence = [...randomNumbers].sort((a, b) => a - b);
    currentIndex = 0; // Reset index to look for the first (smallest) number

    // Shuffle them for display on the board
    const shuffledForDisplay = shuffle([...randomNumbers]);

    shuffledForDisplay.forEach((num, index) => {
        const cell = document.createElement('div');
        cell.classList.add('number-cell');
        cell.textContent = num;
        cell.dataset.number = num;

        // Staggered animation delay
        cell.style.animationDelay = `${index * 0.02}s`;

        cell.addEventListener('click', handleNumberClick);
        gameBoard.appendChild(cell);
    });

    nextNumberDisplay.textContent = targetSequence[currentIndex];
    startTimer();
}

// Function to reset and start the game
function resetGame() {
    gameState.level = 1;
    gameState.gold = Math.floor(gameState.gold / 2); // Penalty: lose half gold on game over
    currentIndex = 0;
    winScreen.classList.add('hidden');
    messageModal.classList.add('hidden');
    createLevel();
    saveGame();
}

// Event Listeners
playAgainButton.addEventListener('click', resetGame);
btnHint.addEventListener('click', useHint);
btnTime.addEventListener('click', addTime);

// Initial game start
loadGame();
createLevel();
