document.addEventListener('DOMContentLoaded', () => {
    // Game state
    const state = {
        board: Array(9).fill(''),
        currentPlayer: 'X',
        gameMode: null,
        gameActive: false,
        stats: {
            player1: { wins: 0, losses: 0, draws: 0 },
            player2: { wins: 0, losses: 0, draws: 0 },
            computer: { wins: 0, losses: 0, draws: 0 }
        }
    };

    // DOM elements
    const boardElement = document.getElementById('board');
    const cells = document.querySelectorAll('.cell');
    const statusElement = document.getElementById('status');
    const scoreElement = document.getElementById('score');
    const statsButton = document.getElementById('stats');
    const vsHumanButton = document.getElementById('vsHuman');
    const vsComputerButton = document.getElementById('vsComputer');
    const gameModeDiv = document.querySelector('.game-mode');
    const startButton = document.getElementById('start');
    const resetButton = document.getElementById('reset');

    // Stats elements
    const player1WinsElement = document.getElementById('player1Wins');
    const player1LossesElement = document.getElementById('player1Losses');
    const player1DrawsElement = document.getElementById('player1Draws');
    const player2WinsElement = document.getElementById('player2Wins');
    const player2LossesElement = document.getElementById('player2Losses');
    const player2DrawsElement = document.getElementById('player2Draws');
    const computerWinsElement = document.getElementById('computerWins');
    const computerLossesElement = document.getElementById('computerLosses');
    const computerDrawsElement = document.getElementById('computerDraws');

    // Winning combinations
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    // Initialize the game
    function init() {
        // Event listeners
        vsHumanButton.addEventListener('click', () => selectGameMode('human'));
        vsComputerButton.addEventListener('click', () => selectGameMode('computer'));
        startButton.addEventListener('click', startGame);
        resetButton.addEventListener('click', resetGame);
        statsButton.addEventListener('click', toggleStats);
        cells.forEach(cell => cell.addEventListener('click', handleCellClick));
        
        // Hide elements that shouldn't be visible initially
        boardElement.classList.add('hidden');
        resetButton.classList.add('hidden');
        startButton.classList.add('hidden');
    }

    // Select game mode
    function selectGameMode(mode) {
        state.gameMode = mode;
        statusElement.textContent = `Selected: ${mode === 'human' ? 'Player vs Player' : 'Player vs Computer'}. Click Start!`;
        startButton.classList.remove('hidden');
    }

    // Start the game
    function startGame() {
        if (!state.gameMode) return;
        
        state.board = Array(9).fill('');
        state.currentPlayer = 'X';
        state.gameActive = true;
        
        // Show/hide appropriate elements
        boardElement.classList.remove('hidden');
        resetButton.classList.remove('hidden');
        startButton.classList.add('hidden');
        gameModeDiv.classList.add('hidden');
        scoreElement.classList.add('hidden');
        statsButton.classList.add('hidden');
        
        updateBoard();
        updateStatus();
        
        // If playing against computer and computer goes first
        if (state.gameMode === 'computer' && state.currentPlayer === 'O') {
            setTimeout(makeComputerMove, 500);
        }
    }

    // Toggle stats visibility
    function toggleStats() {
        if (state.gameActive) {
            // If game is active, hide the board when showing stats
            boardElement.classList.toggle('hidden');
        }
        scoreElement.classList.toggle('hidden');
        statsButton.textContent = scoreElement.classList.contains('hidden') ? 'Show Stats' : 'Hide Stats';
    }

    // Reset the game
    function resetGame() {
        state.board = Array(9).fill('');
        state.currentPlayer = 'X';
        state.gameActive = false;
        
        // Hide game elements and show mode selection
        boardElement.classList.add('hidden');
        resetButton.classList.add('hidden');
        gameModeDiv.classList.remove('hidden');
        startButton.classList.add('hidden');
        statsButton.classList.remove('hidden');
        statusElement.textContent = 'Select game mode to start';
        
        updateBoard();
    }

    // Handle cell click
    function handleCellClick(e) {
        if (!state.gameActive) return;
        
        const index = parseInt(e.target.dataset.index);
        
        if (state.board[index] !== '' || !state.gameActive) return;
        
        // Make the move
        state.board[index] = state.currentPlayer;
        updateBoard();
        
        // Check for win or draw
        if (checkWin(state.currentPlayer)) {
            endGame(state.currentPlayer);
            return;
        } else if (checkDraw()) {
            endGame(null);
            return;
        }
        
        // Switch player
        state.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
        updateStatus();
        
        // If playing against computer, make computer move
        if (state.gameMode === 'computer' && state.currentPlayer === 'O' && state.gameActive) {
            setTimeout(makeComputerMove, 500);
        }
    }

    // Make computer move (simple AI)
    function makeComputerMove() {
        if (!state.gameActive) return;
        
        let index;
        
        // 1. Try to win
        index = findWinningMove('O');
        if (index === -1) {
            // 2. Try to block
            index = findWinningMove('X');
        }
        
        if (index === -1) {
            // 3. Try center
            if (state.board[4] === '') {
                index = 4;
            } else {
                // 4. Random move
                const emptyCells = state.board.map((cell, idx) => cell === '' ? idx : null).filter(val => val !== null);
                index = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            }
        }
        
        if (index !== undefined && index !== null) {
            state.board[index] = 'O';
            updateBoard();
            
            if (checkWin('O')) {
                endGame('O');
                return;
            } else if (checkDraw()) {
                endGame(null);
                return;
            }
            
            state.currentPlayer = 'X';
            updateStatus();
        }
    }

    // Find a winning move for the given player
    function findWinningMove(player) {
        for (const combo of winningCombinations) {
            const [a, b, c] = combo;
            
            if (state.board[a] === player && state.board[b] === player && state.board[c] === '') {
                return c;
            }
            if (state.board[a] === player && state.board[c] === player && state.board[b] === '') {
                return b;
            }
            if (state.board[b] === player && state.board[c] === player && state.board[a] === '') {
                return a;
            }
        }
        return -1;
    }

    // Check if current player has won
    function checkWin(player) {
        return winningCombinations.some(combination => {
            return combination.every(index => {
                return state.board[index] === player;
            });
        });
    }

    // Check for a draw
    function checkDraw() {
        return state.board.every(cell => cell !== '');
    }



 // End the game
function endGame(winner) {
    state.gameActive = false;
    statsButton.classList.add('hidden');
    
    if (winner) {
        if (state.gameMode === 'human') {
            if (winner === 'X') {
                state.stats.player1.wins++;
                state.stats.player2.losses++;
            } else {
                state.stats.player2.wins++;
                state.stats.player1.losses++;
            }
        } else {
            if (winner === 'X') {
                state.stats.player1.wins++;
                state.stats.computer.losses++;
            } else {
                state.stats.computer.wins++;
                state.stats.player1.losses++;
            }
        }
        highlightWinningCells(winner);
    } else {
        state.stats.player1.draws++;
        if (state.gameMode === 'human') {
            state.stats.player2.draws++;
        } else {
            state.stats.computer.draws++;
        }
    }
    
    updateStatus(winner);
    updateStats();
  
}
    // Highlight the winning cells
    function highlightWinningCells(player) {
        const winningCombo = winningCombinations.find(combo => {
            return combo.every(index => state.board[index] === player);
        });
        
        if (winningCombo) {
            winningCombo.forEach(index => {
                cells[index].classList.add('winning-cell');
            });
        }
    }

    // Update the board display
    function updateBoard() {
        cells.forEach((cell, index) => {
            cell.textContent = state.board[index];
            cell.className = 'cell';
            cell.classList.remove('winning-cell');
            
            if (state.board[index] === 'X') {
                cell.classList.add('x');
            } else if (state.board[index] === 'O') {
                cell.classList.add('o');
            }
        });
    }

    // Update the game status
    function updateStatus(winner = null) {
        if (winner) {
            if (state.gameMode === 'human') {
                statusElement.textContent = `Player ${winner === 'X' ? '1 (X)' : '2 (O)'} wins!`;
            } else {
                statusElement.textContent = winner === 'X' ? 'Player 1 (X) wins!' : 'Computer wins!';
            }
        } else if (state.gameActive) {
            if (state.gameMode === 'human') {
                statusElement.textContent = `Player ${state.currentPlayer === 'X' ? '1 (X)' : '2 (O)'}'s turn`;
            } else {
                statusElement.textContent = state.currentPlayer === 'X' ? "Player 1 (X)'s turn" : "Computer's turn";
            }
        } else if (winner === null && !state.gameActive && state.gameMode) {
            statusElement.textContent = 'Game ended in a draw!';
        } else {
            statusElement.textContent = 'Select game mode to start';
        }
    }

    // Update the stats display
    function updateStats() {
        player1WinsElement.textContent = state.stats.player1.wins;
        player1LossesElement.textContent = state.stats.player1.losses;
        player1DrawsElement.textContent = state.stats.player1.draws;
        
        player2WinsElement.textContent = state.stats.player2.wins;
        player2LossesElement.textContent = state.stats.player2.losses;
        player2DrawsElement.textContent = state.stats.player2.draws;
        
        computerWinsElement.textContent = state.stats.computer.wins;
        computerLossesElement.textContent = state.stats.computer.losses;
        computerDrawsElement.textContent = state.stats.computer.draws;
    }

    // Initialize the game
    init();
});