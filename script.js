const gameBoard = document.getElementById('game-board');
const levelDisplay = document.getElementById('level');
const nextNumberDisplay = document.getElementById('next-number');
const timerDisplay = document.getElementById('timer');
const winScreen = document.getElementById('win-screen');
const playAgainButton = document.getElementById('play-again');

// Modal Elements
const messageModal = document.getElementById('message-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalAction = document.getElementById('modal-action');

const MAX_LEVEL = 10;
const NUMBERS_PER_LEVEL = 40;
const POOL_SIZE = 99; // Random numbers between 1 and 99
const TIME_LIMIT = 30; // 30 seconds per number

let currentLevel = 1;
// let nextNumberToClick = 1; // DEPRECATED: We now track index in the sorted random sequence
let timerInterval;
let timeLeft = TIME_LIMIT;

let targetSequence = []; // Array to store the sorted random numbers we need to click
let currentIndex = 0; // Current index in targetSequence we are looking for

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
    modalAction.textContent = actionText;

    // Remove old event listeners to prevent stacking
    const newButton = modalAction.cloneNode(true);
    modalAction.parentNode.replaceChild(newButton, modalAction);

    // Update reference
    const currentActionBtn = document.getElementById('modal-action');

    currentActionBtn.addEventListener('click', () => {
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

// Function to handle clicking a number
function handleNumberClick(event) {
    const clickedElement = event.target;
    // Check if element is already clicked to prevent double clicks
    if (clickedElement.classList.contains('clicked')) return;

    const clickedNumber = parseInt(clickedElement.dataset.number, 10);

    // Check against the current expected number in the random sequence
    if (clickedNumber === targetSequence[currentIndex]) {
        clickedElement.classList.add('clicked');

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
    if (currentLevel >= MAX_LEVEL) {
        // Game Won
        winScreen.classList.remove('hidden');
        triggerWinConfetti();
    } else {
        // Advance to the next level
        currentLevel++;
        levelDisplay.textContent = currentLevel;

        // Adding confetti for level complete
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        // Use custom modal instead of alert
        setTimeout(() => {
            // Simply auto-start next level or show a quick success message?
            // User said: "không cần hiện nút xác nhận khi hoàn thành... thay bằng xac nhận bên trong trang web"
            // But also said "limit thời hạn... nếu quá thơi gian thì game sẽ reset"
            // Interpretation: Don't use window.alert. Use smooth transition or in-game UI.
            // We can show a temporary toast or just proceed after a short delay, but a modal is explicitly requested "thay bằng xac nhận bên trong trang web".
            // Actually, re-reading: "không cần hiện nút xác nhận khi hoàn thành ... thay bằng xac nhận bên trong trang web"
            // This implies they DO want a confirmation, but NOT a native alert.

            showModal("Level Complete!", `Ready for Level ${currentLevel}?`, "Start Next Level", () => {
                createLevel();
            });
        }, 500);
    }
}

// Function to create and set up a level
function createLevel() {
    gameBoard.innerHTML = ''; // Clear the board

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
    currentLevel = 1;
    currentIndex = 0;
    levelDisplay.textContent = currentLevel;
    winScreen.classList.add('hidden');
    // Ensure modal is hidden
    messageModal.classList.add('hidden');
    createLevel();
}

// Event Listeners
playAgainButton.addEventListener('click', resetGame);

// Initial game start
createLevel();
