/* ---------- Config ---------- */
let WORD_LENGTH = 5; // This will be set dynamically based on the word
const MAX_GUESSES = 6;

/* Romantic words for each day from July 4-11, 2025 - now with varying lengths! */
const ROMANTIC_WORDS = [
    {
        word: 'SUSHI',
        meaning: 'Thankyou for introducing me to sushi, yum yum cha and all things nice and delicious, including you 🥰',
        day: '2025-07-04'
    },
    {
        word: 'PYAARU',
        meaning: 'You were, are and forever will be my Pyaaru. Thankyou for being the cutest human alive ✨',
        day: '2025-07-05'
    },
    {
        word: 'SORRY',
        meaning: `Hi, I am sorry for being impatient and annoyed all the time. I really love you and I'll be a better man I promise. Thankyou for loving me and being patient with me when I go through such phases. I am grateful to have you in my life, and grateful that I get to take you out for shopping 🥺 I love you my baby, my princess.`,
        day: '2025-07-06'
    },
    {
        word: 'PROUD',
        meaning: `Hi my hardworking, pyaara studious sweetheart. I know you don't believe me but trust me you make so proud every day, thankyou for being someone I can always look upto and admire. I really adore you, and you inspire me to be a better person each day. I love you 😘`,
        day: '2025-07-07'
    },
    {
        word: 'JAGER',
        meaning: 'The First word you ever taught me, my baby - thankyou for never judging and always fixing my broken english 🥺',
        day: '2025-07-09'
    },
    {
        word: 'MAGIC',
        meaning: 'What happens every time you look at me ✨',
        day: '2025-07-11'
    },
    {
        word: 'SWEETHEART',
        meaning: 'My favorite name for you, my darling 🍯',
        day: '2025-07-10'
    }
];

// Function to get today's word based on date (IST timezone)
function getTodaysWord() {
    // Get current time in IST (UTC+5:30)
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30 in milliseconds
    const istTime = new Date(now.getTime() + istOffset);
    const today = istTime.toISOString().split('T')[0]; // YYYY-MM-DD format in IST

    console.log('Current UTC time:', now.toISOString());
    console.log('Current IST time:', istTime.toISOString());
    console.log('Today in IST:', today);

    // Check if today is within our special date range (July 4-11, 2025)
    const todaysEntry = ROMANTIC_WORDS.find(entry => entry.day === today);

    if (todaysEntry) {
        console.log('Found scheduled word for today:', todaysEntry.word);
        return todaysEntry;
    }

    // For testing/demo purposes: cycle through words based on current day
    // This ensures we always have a romantic word to play with
    const dayOfYear = Math.floor((istTime - new Date(istTime.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const wordIndex = dayOfYear % ROMANTIC_WORDS.length;

    console.log('Using cycled word:', ROMANTIC_WORDS[wordIndex].word);

    return {
        word: ROMANTIC_WORDS[wordIndex].word,
        meaning: ROMANTIC_WORDS[wordIndex].meaning,
        day: today // Use today's date in IST for display
    };
}

const TODAY_ENTRY = getTodaysWord();
const ANSWER = TODAY_ENTRY.word;
WORD_LENGTH = ANSWER.length; // Set word length dynamically

let currentRow = 0;
let currentCol = 0;
let grid = [];
let gameOver = false;

/* ---------- DOM refs ---------- */
const board = document.getElementById('board');
const keyboard = document.getElementById('keyboard');

/* ---------- Build empty board dynamically ---------- */
function createBoard() {
    // Clear existing board
    board.innerHTML = '';
    grid = [];

    // Update CSS grid columns dynamically
    board.style.gridTemplateColumns = `repeat(${WORD_LENGTH}, var(--tile-size))`;

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
}

// Create the initial board
createBoard();

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
        handleBackspace();
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

function handleBackspace() {
    if (currentCol > 0) {
        currentCol--;
        const tile = grid[currentRow][currentCol];

        // Add pop-out animation only if tile isn't already animating
        if (!tile.style.animation) {
            tile.style.animation = 'tile-pop-out 0.15s ease-in-out';
        }

        // Immediately clear content for responsive feel
        tile.textContent = '';
        tile.classList.remove('filled');

        // Reset any previous states that might be lingering
        tile.classList.remove('correct', 'present', 'absent');

        // Clear animation after it completes
        setTimeout(() => {
            tile.style.animation = '';
        }, 150);
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
                showModal(true, guess);
            }, 500);
        } else if (++currentRow === MAX_GUESSES) {
            setTimeout(() => {
                showModal(false, guess);
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

/* ---------- Sweet Modal System ---------- */
function showModal(isWin, guess) {
    const modal = createModal(isWin, guess);
    document.body.appendChild(modal);

    // Trigger entrance animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 50);
}

function createModal(isWin, guess) {
    const modal = document.createElement('div');
    modal.className = 'game-modal';

    const content = document.createElement('div');
    content.className = 'modal-content';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.innerHTML = '×';
    closeBtn.onclick = () => closeModal(modal);

    const title = document.createElement('h2');
    const message = document.createElement('p');
    const wordReveal = document.createElement('div');
    const meaning = document.createElement('div');
    const playAgainBtn = document.createElement('button');

    if (isWin) {
        title.innerHTML = '🎉 You Got It! 🎉';
        title.className = 'modal-title win';

        const attempts = currentRow + 1;
        const encouragements = [
            'Amazing! You\'re brilliant! 💕',
            'Incredible! You\'re so smart! ✨',
            'Perfect! You\'re amazing! 🥰',
            'Wonderful! You\'re the best! 💖',
            'Fantastic! You\'re incredible! 🌟',
            'Outstanding! You\'re perfect! 💕'
        ];

        message.innerHTML = `${encouragements[Math.min(attempts - 1, encouragements.length - 1)]}<br>You solved it in ${attempts} ${attempts === 1 ? 'try' : 'tries'}!`;
        message.className = 'modal-message win';
    } else {
        title.innerHTML = '💕 So Close, Sweetheart! 💕';
        title.className = 'modal-title lose';

        message.innerHTML = 'Don\'t worry, beautiful! Every puzzle is just another reason for us to spend time together! 🥰';
        message.className = 'modal-message lose';
    }

    wordReveal.innerHTML = `<strong>Today's word was:</strong> <span class="word-display">${ANSWER}</span>`;
    wordReveal.className = 'word-reveal';

    meaning.innerHTML = `<div class="meaning-label">💕 What it means:</div><div class="meaning-text">${(window.TODAY_ENTRY || TODAY_ENTRY).meaning}</div>`;
    meaning.className = 'word-meaning';

    playAgainBtn.textContent = '💕 Play Next Word';
    playAgainBtn.className = 'play-again-btn';
    playAgainBtn.onclick = () => {
        closeModal(modal);
        resetGame();
    };

    content.appendChild(closeBtn);
    content.appendChild(title);
    content.appendChild(message);
    content.appendChild(wordReveal);
    content.appendChild(meaning);
    content.appendChild(playAgainBtn);

    modal.appendChild(content);

    // Close on background click
    modal.onclick = (e) => {
        if (e.target === modal) closeModal(modal);
    };

    return modal;
}

function closeModal(modal) {
    modal.classList.remove('show');
    setTimeout(() => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }, 300);
}

function resetGame() {
    // Get a new word (for demo purposes, cycle to next word)
    const currentIndex = ROMANTIC_WORDS.findIndex(entry => entry.word === ANSWER);
    const nextIndex = (currentIndex + 1) % ROMANTIC_WORDS.length;
    const newEntry = ROMANTIC_WORDS[nextIndex];

    // Update global variables with new word
    Object.assign(window, { TODAY_ENTRY: newEntry, ANSWER: newEntry.word });
    WORD_LENGTH = newEntry.word.length;

    // Reset game state
    currentRow = 0;
    currentCol = 0;
    gameOver = false;

    // Recreate board with new word length
    createBoard();

    // Reset keyboard
    document.querySelectorAll('.key').forEach(key => {
        key.classList.remove('correct', 'present', 'absent');
    });
}
