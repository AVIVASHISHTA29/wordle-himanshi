/* ---------- Config ---------- */
const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

/* A tiny demo list; replace with a bigger dictionary or fetch daily word */
const WORDS = ['apple', 'grape', 'crane', 'plant', 'brine', 'smile', 'chair'];

const ANSWER = WORDS[Math.floor(Math.random() * WORDS.length)].toUpperCase();

let currentRow = 0;
let currentCol = 0;
let grid = [];

/* ---------- DOM refs ---------- */
const board = document.getElementById('board');
const keyboard = document.getElementById('keyboard');

/* ---------- Build empty board ---------- */
for (let r = 0; r < MAX_GUESSES; r++) {
    grid[r] = [];
    for (let c = 0; c < WORD_LENGTH; c++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        board.appendChild(tile);
        grid[r][c] = tile;
    }
}

/* ---------- Build keyboard ---------- */
const KEYS_ROW1 = 'QWERTYUIOP';
const KEYS_ROW2 = 'ASDFGHJKL';
const KEYS_ROW3 = ['Enter', ...'ZXCVBNM', '←'];

[KEYS_ROW1, KEYS_ROW2, KEYS_ROW3].forEach(row => {
    [...row].forEach(k => {
        const btn = document.createElement('button');
        btn.textContent = k;
        btn.className = 'key' + (k === 'Enter' || k === '←' ? ' wide' : '');
        btn.onclick = () => handleKey(k);
        keyboard.appendChild(btn);
    });
});

/* ---------- Event listeners ---------- */
window.addEventListener('keydown', e => {
    const k = e.key.toUpperCase();
    if (k === 'BACKSPACE') return handleKey('←');
    if (k === 'ENTER') return handleKey('Enter');
    if (/^[A-Z]{1}$/.test(k)) handleKey(k);
});

/* ---------- Game logic ---------- */
function handleKey(key) {
    if (currentRow >= MAX_GUESSES) return; // game over

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
    if (guess.length < WORD_LENGTH) return; // safety

    /* Evaluate guess */
    const answerArr = ANSWER.split('');
    const guessArr = guess.split('');

    // First pass: greens
    guessArr.forEach((ch, i) => {
        if (ch === answerArr[i]) {
            markTile(i, 'correct');
            answerArr[i] = null; // consume
            guessArr[i] = null;
        }
    });

    // Second pass: yellows / grays
    guessArr.forEach((ch, i) => {
        if (ch === null) return;
        const idx = answerArr.indexOf(ch);
        if (idx > -1) {
            markTile(i, 'present');
            answerArr[idx] = null;
        } else {
            markTile(i, 'absent');
        }
    });

    // Win / lose?
    if (guess === ANSWER) {
        setTimeout(() => alert('🎉 You win!'), 100);
    } else if (++currentRow === MAX_GUESSES) {
        setTimeout(() => alert(`The word was ${ANSWER}`), 100);
    }
    currentCol = 0;
}

function markTile(col, state) {
    const tile = grid[currentRow][col];
    tile.className = `tile ${state}`;
    const letter = tile.textContent;
    const keyBtn = [...keyboard.children]
        .find(b => b.textContent === letter);
    if (keyBtn && !keyBtn.classList.contains('correct')) { // don't downgrade green
        keyBtn.classList.add(state);
    }
}

function shakeRow(row) {
    grid[row].forEach(t => {
        t.style.animation = 'shake .3s';          // quick shake effect
        t.addEventListener('animationend', () => t.style.animation = '', { once: true });
    });
}
