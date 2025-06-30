/* ---------- Config ---------- */
const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

/* A tiny demo list; replace with a bigger dictionary or fetch daily word */
const WORDS = ['apple', 'grape', 'crane', 'plant', 'brine', 'smile', 'chair', 'about', 'other', 'which', 'their', 'would', 'there', 'could', 'water'];

const ANSWER = WORDS[Math.floor(Math.random() * WORDS.length)].toUpperCase();

let currentRow = 0;
let currentCol = 0;
let grid = [];
let gameOver = false;

/* ---------- DOM refs ---------- */
const board = document.getElementById('board');
const keyboard = document.getElementById('keyboard');

/* ---------- Build empty board ---------- */
for (let r = 0; r < MAX_GUESSES; r++) {
    grid[r] = [];
    for (let c = 0; c < WORD_LENGTH; c++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.setAttribute('data-row', r);
        tile.setAttribute('data-col', c);
        board.appendChild(tile);
        grid[r][c] = tile;
    }
}

/* ---------- Build keyboard ---------- */
const KEYBOARD_LAYOUT = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '←']
];

KEYBOARD_LAYOUT.forEach(row => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'keyboard-row';

    row.forEach(key => {
        const btn = document.createElement('button');
        btn.textContent = key === '←' ? '⌫' : key;
        btn.className = 'key' + (key === 'Enter' || key === '←' ? ' wide' : '');
        btn.setAttribute('data-key', key);
        btn.onclick = () => handleKey(key);
        rowDiv.appendChild(btn);
    });

    keyboard.appendChild(rowDiv);
});

/* ---------- Event listeners ---------- */
window.addEventListener('keydown', e => {
    if (gameOver) return;

    const k = e.key.toUpperCase();
    if (k === 'BACKSPACE') return handleKey('←');
    if (k === 'ENTER') return handleKey('Enter');
    if (/^[A-Z]{1}$/.test(k)) handleKey(k);
});

/* ---------- Game logic ---------- */
function handleKey(key) {
    if (gameOver || currentRow >= MAX_GUESSES) return;

    if (key === '←') {
        if (currentCol > 0) {
            currentCol--;
            const tile = grid[currentRow][currentCol];
            tile.textContent = '';
            tile.classList.remove('filled');
        }
        return;
    }

    if (key === 'Enter') {
        if (currentCol !== WORD_LENGTH) return shakeRow(currentRow);
        submitGuess();
        return;
    }

    // letter
    if (currentCol < WORD_LENGTH) {
        const tile = grid[currentRow][currentCol];
        tile.textContent = key;
        tile.classList.add('filled');
        currentCol++;
    }
}

function submitGuess() {
    const guess = grid[currentRow].map(t => t.textContent).join('');
    if (guess.length < WORD_LENGTH) return;

    // Disable input during animation
    gameOver = true;

    /* Evaluate guess */
    const answerArr = ANSWER.split('');
    const guessArr = guess.split('');
    const results = [];

    // First pass: greens
    guessArr.forEach((ch, i) => {
        if (ch === answerArr[i]) {
            results[i] = 'correct';
            answerArr[i] = null;
            guessArr[i] = null;
        }
    });

    // Second pass: yellows / grays
    guessArr.forEach((ch, i) => {
        if (ch === null) return;
        const idx = answerArr.indexOf(ch);
        if (idx > -1) {
            results[i] = 'present';
            answerArr[idx] = null;
        } else {
            results[i] = 'absent';
        }
    });

    // Animate tiles with staggered timing
    results.forEach((result, i) => {
        setTimeout(() => {
            flipTile(currentRow, i, result);
        }, i * 100);
    });

    // Check win/lose after all animations complete
    setTimeout(() => {
        if (guess === ANSWER) {
            setTimeout(() => {
                alert('🎉 Congratulations! You guessed the word!');
            }, 500);
        } else if (++currentRow === MAX_GUESSES) {
            setTimeout(() => {
                alert(`Game Over! The word was: ${ANSWER}`);
            }, 500);
        } else {
            gameOver = false; // Re-enable input for next guess
        }
        currentCol = 0;
    }, results.length * 100 + 300);
}

function flipTile(row, col, state) {
    const tile = grid[row][col];
    const letter = tile.textContent;

    tile.classList.add('flip');

    // Change the tile appearance at the midpoint of the flip
    setTimeout(() => {
        tile.classList.add(state);
        updateKeyboard(letter, state);
    }, 300);

    // Remove flip class after animation
    setTimeout(() => {
        tile.classList.remove('flip');
    }, 600);
}

function updateKeyboard(letter, state) {
    const keyBtn = document.querySelector(`[data-key="${letter}"]`);
    if (!keyBtn) return;

    // Don't downgrade from correct to present/absent
    if (keyBtn.classList.contains('correct')) return;

    // Don't downgrade from present to absent
    if (keyBtn.classList.contains('present') && state === 'absent') return;

    keyBtn.classList.remove('correct', 'present', 'absent');
    keyBtn.classList.add(state);
}

function shakeRow(row) {
    grid[row].forEach((tile, i) => {
        setTimeout(() => {
            tile.style.animation = 'shake 0.5s ease-in-out';
            tile.addEventListener('animationend', () => {
                tile.style.animation = '';
            }, { once: true });
        }, i * 50);
    });
}
