const gameBoard = document.getElementById('game-board');
const levelDisplay = document.getElementById('level');
const winScreen = document.getElementById('win-screen');
const playAgainButton = document.getElementById('play-again');

const MAX_LEVEL = 10;
const NUMBERS_PER_LEVEL = 200;

let currentLevel = 1;
let nextNumberToClick = 1;

// Function to shuffle an array (Fisher-Yates shuffle)
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Function to handle clicking a number
function handleNumberClick(event) {
    const clickedElement = event.target;
    const clickedNumber = parseInt(clickedElement.dataset.number, 10);

    if (clickedNumber === nextNumberToClick) {
        clickedElement.classList.add('clicked');
        nextNumberToClick++;

        if (nextNumberToClick > NUMBERS_PER_LEVEL) {
            levelComplete();
        }
    }
}

// Function to handle level completion
function levelComplete() {
    if (currentLevel >= MAX_LEVEL) {
        // Game Won
        winScreen.classList.remove('hidden');
    } else {
        // Advance to the next level
        currentLevel++;
        nextNumberToClick = 1;
        levelDisplay.textContent = currentLevel;
        alert(`Level ${currentLevel - 1} complete! Starting next level.`);
        createLevel();
    }
}

// Function to create and set up a level
function createLevel() {
    gameBoard.innerHTML = ''; // Clear the board

    const numbers = Array.from({ length: NUMBERS_PER_LEVEL }, (_, i) => i + 1);
    const shuffledNumbers = shuffle(numbers);

    shuffledNumbers.forEach(num => {
        const cell = document.createElement('div');
        cell.classList.add('number-cell');
        cell.textContent = num;
        cell.dataset.number = num;
        cell.addEventListener('click', handleNumberClick);
        gameBoard.appendChild(cell);
    });
}

// Function to reset and start the game
function resetGame() {
    currentLevel = 1;
    nextNumberToClick = 1;
    levelDisplay.textContent = currentLevel;
    winScreen.classList.add('hidden');
    createLevel();
}

// Event Listeners
playAgainButton.addEventListener('click', resetGame);

// Initial game start
createLevel();
