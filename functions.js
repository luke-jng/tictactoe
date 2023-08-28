const Player = function(mark) {
    let _name = ""
    let _score = 0;
    const getMark = () => mark; //using a mediator get function helps keep player info secure
    const addPointToScore = () => _score += 1;
    const getScore = () => _score;
    const resetScore = () => _score = 0;
    const addName = (enteredName) => _name = enteredName;
    const getName = () => _name;

    return {getMark, addPointToScore, getScore, resetScore, addName, getName}
}

const gameBoard = (function() {
    const _boardspots = new Array(9).fill(null);
    const _winConditions = [ //Update later to have conditions correspond to 4x4 or 5x5 board // Maybe not
        [0, 1, 2], //row combinations
        [3, 4, 5],
        [6, 7, 8],

        [0, 3, 6], //column combinations
        [1, 4, 7],
        [2, 5, 8],

        [0, 4, 8], //diagonal combinations
        [2, 4, 6],
    ];

    const getBoard = () => _boardspots;
    const resetBoard = () => {
        for (let i = 0; i < _boardspots.length; i++) {
            _boardspots[i] = null;
        }
    }
    const getTile = (index) => _boardspots[index];
    const addMark = (playermark, index) => _boardspots[index] = playermark;
    const checkWin = (playerAMark, playerBMark) => {//Account victory, draw, or still playing
        const playerAPositions = [];
        const playerBPositions = [];

        // ?: is shortcut for if and else statements; code below gathers all ofinputted player's position
        _boardspots.forEach((mark, index) => mark === playerAMark ? playerAPositions.push(index) : console.log("iterating"))
        _boardspots.forEach((mark, index) => mark === playerBMark ? playerBPositions.push(index) : console.log("iterating"))

        for (let i = 0; i < _winConditions.length; i++) {
            // console.log(winConditions, winConditions[i], "displays   condition array");
            // checks if a win condition array's positions exists in the inputted player's positions on gameboard
            if (_winConditions[i].every(position => playerAPositions.includes(position))) { //check if win condition exists in player A pos
                console.log(`Player ${playerAMark} has won!`)
                return playerAMark; //player A wins
            }
            else if (_winConditions[i].every(position => playerBPositions.includes(position))) {
                console.log(`Player ${playerBMark} has won!`)
                return playerBMark; //player B wins
            }
        }

        //when for loop completes and no winner is identified, check if board is full, and if it is, then the game is a draw
        if (!_boardspots.includes(null)) {
            console.log('The game is a draw!')
            return 'DRAW'
        }

        //if the board is not full, keep playing
        console.log('The game can still go on!');
        return 'CONTINUE'; // none of the conditions apply to the player positions, so player has not won yet
    }
    return {getBoard, resetBoard, getTile, addMark, checkWin};
})();

const displayController = (function() {
    const _player1 = Player('X');
    const _player2 = Player('O');
    let _currentplayer = _player1;

    const _updateCurrentPlayer = () => {
        if (_currentplayer.getMark() == 'X'){
            _currentplayer = _player2;
        }
        else {
            _currentplayer = _player1;
        }
        document.getElementById("current_turn").innerText = `${_currentplayer.getName()}`
    };

    const _updateScoreDisplay = (playerA, playerB) => {
        const playerAScoreDisplay = document.getElementById("p1_score_point");
        const playerBScoreDisplay = document.getElementById("p2_score_point");
        playerAScoreDisplay.innerText = `${playerA.getScore()}`
        playerBScoreDisplay.innerText = `${playerB.getScore()}`
    };

    const _clearDisplayBoard = (boardTiles) => {
        for (let x = 0; x < boardTiles.length; x++) {
            boardTiles[x].innerText = '';
        };
    };

    const _resetButtonClick = function() {
        const resetGameButton = document.getElementById('resetGame');
        resetGameButton.addEventListener('click', () => {
            
            _player1.resetScore();
            _player2.resetScore();
            _updateScoreDisplay(_player1, _player2);

            gameBoard.resetBoard();
            _clearDisplayBoard(document.querySelectorAll('.tile'));
        });

        const resetRoundButton = document.getElementById('resetRound');
        resetRoundButton.addEventListener('click', () => {
            gameBoard.resetBoard();
            _clearDisplayBoard(document.querySelectorAll('.tile'));
        });
    };

    const _exitGameClick = function() {
        const exitButton = document.getElementById('exitGame');
        const page = document.getElementById('page_container');
        exitButton.addEventListener('click', () => {
            _player1.addName(""); //resets _player1 name
            _player2.addName("")  //resets _player2 name

            _player1.resetScore();
            _player2.resetScore();
            _updateScoreDisplay(_player1, _player2);

            gameBoard.resetBoard();
            _clearDisplayBoard(document.querySelectorAll('.tile'));

            page.innerHTML = `
            <div id="namecreation_container">
                <h2>Enter your names!</h2>
                <form id="name_form">
                    <label for="p1name">Player 1: </label>
                    <input type="text" id="p1name" name="p1name" placeholder="Bob" required><br>
                    <label for="p2name">Player 2: </label>
                    <input type="text" id="p2name" name="p2name" placeholder="John" required><br>
                    <div id="error_info"></div>
                    <button type="submit">Start Game!</button>
                </form>
            </div>
            `;

            startGame(); //need to re-add the event listeners bc they get discarded if the elements they are listening to no longer exists, which happens when the html page gets rewritten with innerhtml insertions.
        })
    };

    const _showModalBox = (player) => {
        const modal = document.getElementById('victory_modal');
        const modalcontent = document.getElementById('modal_content')

        if (player == "") {
            modalcontent.innerHTML = `The round is a draw!`
            modal.showModal();
        }
        else {
            modalcontent.innerHTML = `${player.getName()} wins the round!`
            modal.showModal();
        }

    }

    const _closeModalBox = () => { //call this once at the start of game, instead of everytime the _showModalBox opepns, because _showModalBox will be frequently called, but we dont need the event listener to be added everytime because the reference (dialog element in html)
                                  //doesn't disappear until the page gets wiped by changing the innerHTML.
        const modal = document.getElementById('victory_modal');
        const modalbutton = document.getElementById('modal_button');
        modalbutton.addEventListener('click', () => {
            modal.close();

            // closing the modal triggers board wipe
            // since the modal only appears when round ends,
            // and closing means the players are ready to go to next round
            gameBoard.resetBoard();
            _clearDisplayBoard(document.querySelectorAll('.tile'));
            console.log(gameBoard.getBoard())
        })
    }

    const _showWinGameModalBox = (player) => {
        const modal = document.getElementById('victory2_modal');
        const modalcontent = document.getElementById('modal_content2');

        modalcontent.innerHTML = `
            <div>CONGRATULATIONS!</div>
            <div>${player.getName()} wins the game!</div>
            `;
        modal.showModal();
    }

    const _closeWinGameModalBox = () =>  {
        const page = document.getElementById('page_container');
        const modal = document.getElementById('victory2_modal');
        const optionReset = document.getElementById('option_reset');
        const optionExit = document.getElementById('option_exit');

        optionReset.addEventListener('click', () => { //resets the game; code is nearly identical to the one in _resetButtonClick() (just added modal.close())
            modal.close()

            _player1.resetScore();
            _player2.resetScore();
            _updateScoreDisplay(_player1, _player2);

            gameBoard.resetBoard();
            _clearDisplayBoard(document.querySelectorAll('.tile'));

        })
        optionExit.addEventListener('click', () => { //exits the game; code is nearly identical to the one in _exitGameClick() (just added modal.close())
            modal.close()
            _player1.addName(""); //resets _player1 name
            _player2.addName("")  //resets _player2 name

            _player1.resetScore();
            _player2.resetScore();
            _updateScoreDisplay(_player1, _player2);

            gameBoard.resetBoard();
            _clearDisplayBoard(document.querySelectorAll('.tile'));

            page.innerHTML = `
            <div id="namecreation_container">
                <h2>Enter your names!</h2>
                <form id="name_form">
                    <label for="p1name">Player 1: </label>
                    <input type="text" id="p1name" name="p1name" placeholder="Bob" required><br>
                    <label for="p2name">Player 2: </label>
                    <input type="text" id="p2name" name="p2name" placeholder="John" required><br>
                    <div id="error_info"></div>
                    <button type="submit">Start Game!</button>
                </form>
            </div>
            `;

            startGame(); //need to re-add the event listeners bc they get discarded if the elements they are listening to no longer exists, which happens when the html page gets rewritten with innerhtml insertions
        })
    }

    const _tileClicks = function() {
        const tiles = document.querySelectorAll('.tile');
        for (let i = 0; i < tiles.length; i++) { //loop through tiles
            //turns tile background color to green or pink to indicate availability of tile when pointer moves in
            tiles[i].addEventListener('mousemove', () => {
                if (gameBoard.getTile(i) == null) {
                     tiles[i].style.background = "lightgreen";
                    console.log(`hovering over ${tiles[i]}, green`)
                }
                else {
                    tiles[i].style.background = "pink";
                    console.log(`hovering over ${tiles[i]}, pink`)
                }
            });
            
            //turns tile background coloar back to parent grid background when the mouse moves out of the tile
            tiles[i].addEventListener('mouseout', ()=>{
                tiles[i].style.background = '';
            });

            tiles[i].addEventListener('click', () => {
                if (gameBoard.getTile(i) == null) { //if tile not taken
                    gameBoard.addMark(_currentplayer.getMark(), i); //add mark to clicked tile
                    console.log(`tile ${i} has been clicked`, gameBoard.getBoard()); //show board
                    tiles[i].innerText = _currentplayer.getMark(); //update html display
                    tiles[i].style.background = "pink"; //turn the tile color pink because the turn changes to the other player, so the tile have to indicate that it is no longer available to be used.

                    //check for winner here
                    const moveResult = gameBoard.checkWin(_player1.getMark(), _player2.getMark());
                    if (moveResult == _player1.getMark()) { //if moveresult indicates that player one is victor of the round
                        //what happens when player 1 wins the round

                        _player1.addPointToScore();
                        _updateScoreDisplay(_player1, _player2);

                        if (_player1.getScore() == 3) {
                            _showWinGameModalBox(_player1);
                        }
                        else {
                            _showModalBox(_player1); //show victory modal; forces players to close modal to reset round; close button event listener already setup
                        }
                    }
                    else if (moveResult == _player2.getMark()) { //if moveresult indicates that player two is victor of the round
                        //what happens when player 2 wins round
                        _player2.addPointToScore(); //show victory modal; forces players to close modal to reset round; close button event listener already setup
                        _updateScoreDisplay(_player1, _player2);
                        
                        if (_player2.getScore() == 3) {
                            _showWinGameModalBox(_player2);
                        }
                        else {
                            _showModalBox(_player2); // show victory modal
                        }
                    }
                    else if (moveResult == 'DRAW') { //if moveresult indicates that no player is victor of the round
                        //what happens in a draw
                        // _player1.addPointToScore(); //no one gets any points so addpoint isnt needed
                        // _updateScoreDisplay(_player1, _player2); // not needed because no points are added
                        _showModalBox('') //show draw modal (same modal as victory, with different text); forces players to close modal to reset round; close button event listener already setup
                    }
                    else if (moveResult == 'CONTINUE') {
                        //what happens when the game is still on going
                        //do nothing
                    }

                    //update current player
                    _updateCurrentPlayer();
                }
            })
        }
    }

    const _escapeingInputString = (playerName) => {
        return playerName.split('').reduce((newString, currChar) => {
            if (currChar == '<') {
                return newString += '&lt;';
            }
            else if (currChar == '>') {
                return newString += '&gt;'
            }
            else if (currChar == ' ') {
                return newString += '&nbsp;';
            }
            else if (currChar == '&') {
                return newString += '&amp;';
            }
            else if (currChar == '"') {
                return newString += '&quot;';
            }
            else if (currChar == "'") {
                return newString += '&apos;';
            }
            else if (currChar == '{') {
                return newString += '&lbrace;';
            }
            else if (currChar == '}') {
                return newString += '&rbrace;'
            }
            else {
                return  newString += currChar;
            }
        }, ""); 
    }

    const startGame = function() {
        const page = document.getElementById('page_container');
        const nameform = document.getElementById('name_form');
        const errorInfo = document.getElementById('error_info');

        //game starts when the submit event from the name form is received.
        nameform.addEventListener('submit', function(e) {
            e.preventDefault();
            const playerNames = Object.fromEntries(new FormData(nameform));

            const inputtedP1Name = playerNames['p1name'];
            const inputtedP2Name = playerNames['p2name'];

            //check naming requirements
            if ((inputtedP1Name.length < 2 || inputtedP2Name.length < 2) || (inputtedP1Name.length > 12 || inputtedP2Name.length > 12)) {
                errorInfo.innerText = 'The names must be between 1 to 12 characters long.';
            }
            else if (inputtedP1Name == inputtedP2Name) {
                errorInfo.innerText = 'The names must be unique.';
            }
            else if (inputtedP1Name.match(/[A-Za-z]/g) == null || inputtedP2Name.match(/[A-Za-z]/g) == null) {
                errorInfo.innerText = 'The names must contain alphabetical characters.'
            }
            else {
                _player1.addName(_escapeingInputString(inputtedP1Name)); //escape names for security, then add them
                _player2.addName(_escapeingInputString(inputtedP2Name)); 

                page.innerHTML = `
                    <dialog id="victory_modal">
                        <div id="modal_content"></div>
                        <button id="modal_button"> Start next round!</button>
                    </dialog>

                    <dialog id="victory2_modal">
                        <div id="modal_content2"></div>
                        <button id="option_reset">Reset Game</button>
                        <button id="option_exit">Exit Game</button>
                    </dialog>
                
                    <h3>First player to reach 3 points wins the game!</h3>

                    <div class="scores_container">
                        <h2> Scores</h2>
                        <table id="score_table">
                            <tr>
                                <th>Player</th>
                                <th>Mark</th>
                                <th>Points</th>
                            </tr>
                            <tr>
                                <td id="p1_score_name"> ${_player1.getName()}</td>
                                <td>${_player1.getMark()}</td>
                                <td id="p1_score_point"> 0 </td>
                            </tr>
                            <tr>
                                <td id="p2_score_name"> ${_player2.getName()} </td>
                                <td>${_player2.getMark()}</td>
                                <td id="p2_score_point"> 0 </td>
                            </tr>
                        </table>
                    </div>

                    <div id="turn_container">
                        <h2>Current Turn</h2>
                        <div id="current_turn">${_currentplayer.getName()}</div>
                    </div>
            
                    <div class="game_container">
                        <div class="game_board">
                            <div id="tile_11" class="tile"></div>
                            <div id="tile_12" class="tile"></div>
                            <div id="tile_13" class="tile"></div>
    
                            <div id="tile_21" class="tile"></div>
                            <div id="tile_22" class="tile"></div>
                            <div id="tile_23" class="tile"></div>
    
                            <div id="tile_31" class="tile"></div>
                            <div id="tile_32" class="tile"></div>
                            <div id="tile_33" class="tile"></div>
                        </div>
                    </div>

                    <div class="options_container">
                        <button id = "resetGame">Reset Game</button>
                        <button id = "resetRound">Reset Round</button>
                        <button id = "exitGame">Exit Game</button>
                    </div>
                `
                _closeWinGameModalBox();
                _resetButtonClick();
                _exitGameClick();
                _closeModalBox();
                _tileClicks();
            }

        })
    }
    return {startGame}
})();

displayController.startGame()