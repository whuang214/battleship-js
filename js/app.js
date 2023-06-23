console.log("app.js loaded");

/*----- constants -----*/

let winner = 0; // 0 = no winner, 1 = player, -1 = computer

/**
 * Represents the state of a square on the game board.
 */
const state = {
  EMPTY: "empty",
  HIT: "hit",
  MISS: "miss",
  SHIP: "ship",
};

/**
 * Represents a ship in the game.
 * @class
 */
class Ship {
  /**
   * Create a new Ship instance.
   * @constructor
   * @param {string} name - The name of the ship.
   * @param {number} length - The length of the ship in units.
   */
  constructor(name, length) {
    this.name = name;
    this.length = length;
  }
}

/**
 * represents all ships in the game.
 */
const allShips = {
  carrier: new Ship("carrier", 5),
  battleship: new Ship("battleship", 4),
  cruiser: new Ship("cruiser", 3),
  submarine: new Ship("submarine", 3),
  destroyer: new Ship("destroyer", 2),
};

/**
 * Represents a square on the game board.
 */
class Square {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.state = state.EMPTY;
    this.ship = null;
    this.orientation = null;
    this.start = null;
    this.end = null;
  }
}

/*----- state variables -----*/
let playerBoard = []; // the players game board represented as a 2D array of Square objects
let computerBoard = []; // the players game board represented as a 2D array of Square objects

let focusedShip; // the e.target of the ship being interacted with
let focusedShipOrientation; // the orientation of the ship being interacted with

let cheats = false; // if true, show the computer ships

/*----- cached dom elements  -----*/
const ships = document.querySelectorAll(".ship");
const playerSquares = document.querySelectorAll(".player-board div");
const computerSquares = document.querySelectorAll(".computer-board div");

const playButton = document.getElementById("startBtn");
const resetButton = document.getElementById("resetShipsButton");
const randomizeShipsButton = document.getElementById("randomBtn");
const replayButton = document.getElementById("replayBtn");

const shipContainer = document.querySelector(".ships-container");

const mainMessage = document.querySelector(".info-container #main-message");
const secondaryMessage = document.querySelector(
  ".info-container #secondary-message"
);

/*----- event listeners -----*/

document.getElementById("playButton").addEventListener("click", () => {
  document.querySelector(".overlay").style.display = "none";
  initGame();
});

/*----- functions -----*/

/**
 * Renders the game boards by calling the renderBoard function for the player and computer boards.
 * @returns {void}
 */
function render() {
  renderBoard(playerBoard, "player");
  renderBoard(computerBoard, "computer");
}

/**
 * Renders the game board by updating the DOM elements with the corresponding board state.
 * @param {Array<Array<Object>>} board - The game board to be rendered.
 * @param {string} playerOrComputer - Indicates whether the board belongs to the player or computer.
 * @returns {void}
 */
function renderBoard(board, playerOrComputer) {
  // loop through the board
  // get the dom element
  // update the dom with the board state

  for (let i = 0; i < board.length; i++) {
    // loop through the board
    for (let j = 0; j < board[i].length; j++) {
      const square = board[i][j];
      // get the dom element
      const div = document.getElementById(`${playerOrComputer}-${i}-${j}`);
      // update the dom with the board state
      div.classList.remove(...div.classList);
      div.classList.add("square");
      if (square.ship !== null) {
        div.classList.add("ship");
        div.classList.add(square.ship.name);
        div.classList.add(square.orientation);
        if (square.start) {
          div.classList.add("start");
        }
        if (square.end) {
          div.classList.add("end");
        }
        if (!cheats && playerOrComputer === "computer") {
          div.classList.add("hidden");
        }
        if (square.state === state.HIT) {
          div.classList.add(state.HIT);
        }
        // console.log(square.ship.name);
      } else {
        div.classList.add(square.state);
      }
    }
  }
}

/**
 * Initializes the game by setting up the game boards, rendering them, and adding event listeners.
 */
function initGame() {
  // Log a message indicating that the function has been called
  console.log("initGame called");

  // display inital message to users
  mainMessage.style.color = "white";
  mainMessage.textContent =
    "Place your ships. Click on the ship and press 'r' to rotate";

  // initialize the game boards
  initBoard(playerBoard);
  initBoard(computerBoard);

  cheats = false; // hide the computer ships

  // render the game boards
  render();

  // event listeners
  ships.forEach((ship) => {
    // for each ship listen for the following events
    ship.addEventListener("dragstart", dragStartFromContainer);
    ship.addEventListener("keydown", handleKeyPress);
    ship.addEventListener("click", handleClick);
  });

  playerSquares.forEach((square) => {
    // for each square on the player board listen for the following events
    square.addEventListener("dragstart", dragStartFromBoard);
    square.addEventListener("dragover", dragOver);
    square.addEventListener("drop", dragDrop);
  });

  // event listeners for buttons
  playButton.style.display = "inline-block";
  playButton.addEventListener("click", startGame);
  resetButton.style.display = "inline-block";
  resetButton.addEventListener("click", () => {
    resetShips(playerBoard);
  });
  randomizeShipsButton.addEventListener("click", () => {
    randomizeShips(playerBoard);
  });
  randomizeShipsButton.style.display = "inline-block";
  replayButton.style.display = "none";
  replayButton.addEventListener("click", resetGame);
  shipContainer.style.display = "flex";
}

/**
 * creates a 10x10 2D array of Square objects.
 * @param {Array<Array<Square>>} board - The game board to initialize.
 */
function initBoard(board) {
  // if board already exists, clear it
  if (board.length > 0) {
    board = [];
  }
  for (let i = 0; i < 10; i++) {
    // create 10 rows
    const row = []; // create a new row
    for (let j = 0; j < 10; j++) {
      // repeat 10 times
      row.push(new Square(i, j)); // add a new square to the row
    }
    board.push(row); // add the row to the board (push the row onto the board array)
  }
}

/**
 * Starts the game by checking if all ships are placed and setting up the game board for gameplay.
 * @param {Event} e - The event object (e.g., click event) that triggered the function.
 * @returns {void}
 */
function startGame(e) {
  e.preventDefault();

  winner = 0; // reset the winner

  if (allShipsPlaced()) {
    playButton.style.display = "none";
    resetButton.style.display = "none";
    randomizeShipsButton.style.display = "none";
    shipContainer.style.display = "none";
  } else {
    alert("Please place all ships before starting the game.");
    return;
  }

  randomizeShips(computerBoard);
  // hideShips(computerBoard, "computer");

  console.log("game started");

  mainMessage.textContent =
    "Game started. Click on the computer board to fire.";
  secondaryMessage.textContent = "";
  secondaryMessage.style.display = "inline";

  computerSquares.forEach((square) => {
    // listen for clicks on the computer board
    square.addEventListener("click", playTurn);
  });

  // render the updated game board
  render();
}

/**
 * Plays a turn in the game by handling the player's and computer's moves.
 * @param {Event} e - The event object (e.g., click event) that triggered the function.
 * @returns {void}
 */
function playTurn(e) {
  e.preventDefault();

  if (winner !== 0) {
    return;
  }

  // player turn

  const square = e.target;
  const clickedRow = square.id.split("-")[1];
  const clickedCol = square.id.split("-")[2];

  // console.log(`player clicked on row ${clickedRow} col ${clickedCol}`);

  if (computerBoard[clickedRow][clickedCol].state === state.EMPTY) {
    // console.log("player miss");
    mainMessage.textContent = "You missed.";
    mainMessage.style.color = "yellow";
    computerBoard[clickedRow][clickedCol].state = state.MISS;
  } else if (computerBoard[clickedRow][clickedCol].state === state.SHIP) {
    // console.log("player hit");
    mainMessage.textContent = "You hit a ship!";
    mainMessage.style.color = "red";
    computerBoard[clickedRow][clickedCol].state = state.HIT;
  } else {
    // console.log("player already clicked here");
    return;
  }

  // TODO add delay (computer is thinking)

  // computer turn

  let randCol, randRow;

  do {
    randCol = Math.floor(Math.random() * 10);
    randRow = Math.floor(Math.random() * 10);
  } while (
    playerBoard[randRow][randCol].state !== state.EMPTY &&
    playerBoard[randRow][randCol].state !== state.SHIP
  );

  // console.log(`computer clicked on row ${randRow} col ${randCol}`);

  if (playerBoard[randRow][randCol].state === state.EMPTY) {
    // console.log("computer miss");
    secondaryMessage.textContent = "Computer missed.";
    secondaryMessage.style.color = "yellow";
    playerBoard[randRow][randCol].state = state.MISS;
  } else if (playerBoard[randRow][randCol].state === state.SHIP) {
    // console.log("computer hit");
    secondaryMessage.textContent = "Computer hit a ship!";
    secondaryMessage.style.color = "red";
    playerBoard[randRow][randCol].state = state.HIT;
  } else {
    console.log("You idiot, you broke the game");
  }

  render();

  // win
  if (checkWin(playerBoard)) {
    winner = -1;
    gameOver();
    return;
  } else if (checkWin(computerBoard)) {
    winner = 1;
    gameOver();
    return;
  }
}

/**
 * Resets the game by clearing the game board and re-initializing the game.
 * @returns {void}
 */
function resetGame() {
  resetShips(playerBoard);
  resetShips(computerBoard);

  initGame();
}

/**
 * Game over function that displays the winner and a play again button.
 * @returns {void}
 */
function gameOver() {
  console.log("game over");
  // TODO add game over screen
  // TODO unhide play again button
  if (winner === 1) {
    mainMessage.textContent = "You Win!";
    mainMessage.style.color = "green";
    secondaryMessage.style.display = "none";
  } else if (winner === -1) {
    mainMessage.textContent = "Computer Wins!";
    mainMessage.style.color = "red";
    secondaryMessage.style.display = "none";
  }

  replayButton.style.display = "block";
}

/**
 * Randomizes the placement of all ships on the board.
 * @param {Array<Array<Square>>} board The game board to randomize the ships on.
 * @returns {void}
 */
function randomizeShips(board) {
  // reset all ships board
  resetShips(board);

  for (let ship in allShips) {
    let randomRow = Math.floor(Math.random() * 10);
    let randomColumn = Math.floor(Math.random() * 10);
    let randomOrientation = Math.floor(Math.random() * 2);

    let shipOrientation = randomOrientation === 0 ? "horizontal" : "vertical";
    let shipLength = lengthOfShip(ship);

    while (
      !canPlaceShip(ship, shipOrientation, randomRow, randomColumn, board)
    ) {
      randomRow = Math.floor(Math.random() * 10);
      randomColumn = Math.floor(Math.random() * 10);
      randomOrientation = Math.floor(Math.random() * 2);

      shipOrientation = randomOrientation === 0 ? "horizontal" : "vertical";
    }

    for (let i = 0; i < shipLength; i++) {
      if (shipOrientation === "horizontal") {
        board[randomRow][randomColumn + i].ship = allShips[ship];
        board[randomRow][randomColumn + i].state = state.SHIP;
        board[randomRow][randomColumn + i].orientation = shipOrientation;
        if (i === 0) {
          board[randomRow][randomColumn + i].start = true;
        }
        if (i === shipLength - 1) {
          board[randomRow][randomColumn + i].end = true;
        }
      } else {
        board[randomRow + i][randomColumn].ship = allShips[ship];
        board[randomRow + i][randomColumn].state = state.SHIP;
        board[randomRow + i][randomColumn].orientation = shipOrientation;
        if (i === 0) {
          board[randomRow + i][randomColumn].start = true;
        }
        if (i === shipLength - 1) {
          board[randomRow + i][randomColumn].end = true;
        }
      }
    }
  }

  // band aid fix for when the randomizer doesn't work
  if (numOfShips(board) !== 17) {
    // randomizeShips(board);
    console.log(`number of not 17: ${numOfShips(board)}`);
  }

  render();
}

// drag and drop functions
/**
 * Drag start function for when a ship is dragged from the container.
 * @param {Event} e the event object 
 */
function dragStartFromContainer(e) {
  if (focusedShip) {
    focusedShip.style.border = "none";
  }
  if (e.target.classList.contains("ship")) {
    e.target.style.border = "2px solid black";
  }
  focusedShip = e.target;
  if (e.target.classList.contains("horizontal")) {
    focusedShipOrientation = "horizontal";
  }
  else if (e.target.classList.contains("vertical")) {
    focusedShipOrientation = "vertical";
  }
  // console.log(focusedShip);
}

/**
 * Drag start function for when a ship is dragged from the board.
 * @param {Event} e the event object 
 */
function dragStartFromBoard(e) {
  // if e.target is a square and has a ship, set focusedShip the corresponding ship in ships
  if (e.target.classList.contains("ship")) {
    // if a grid sqaure is dragged
    for (let ship of ships) {
      const shipClassNames = ship.className.split(" ");
      const targetClassNames = Array.from(e.target.classList);
      const filteredTargetClassNames = targetClassNames.filter(
        (className) => 
        className !== "ship" && 
        className !== "vertical" &&
        className !== "horizontal"
      );
      const matchingClass = shipClassNames.find((className) =>
        filteredTargetClassNames.includes(className)
      );

      if (matchingClass) {
        focusedShip = ship;
        if (e.target.classList.contains("horizontal")) {
          focusedShipOrientation = "horizontal";
        }
        else if (e.target.classList.contains("vertical")) {
          focusedShipOrientation = "vertical";
        }
        break;
      }
    }
  }
}

/**
 * Drop function for when a ship is dropped on the board.
 * @param {Event} e the event object 
 * @returns {void}
 */
function dragDrop(e) {
  e.preventDefault();

  if (focusedShip) {
    focusedShip.style.border = "none";
  }

  const square = e.target;
  const row = parseInt(square.id.split("-")[1]);
  const column = parseInt(square.id.split("-")[2]);

  const shipOrientation = focusedShipOrientation;
  const shipLength = lengthOfShip(focusedShip.classList[1]);

  for (let i = 0; i < shipLength; i++) {
    if (shipOrientation === "horizontal") {
      if (column + i > 9) {
        return;
      }
      if (playerBoard[row][column + i].ship !== null) {
        if (
          playerBoard[row][column + i].ship.name !== focusedShip.classList[1]
        ) {
          return;
        }
      }
    } else if (shipOrientation === "vertical") {
      // vertical
      if (row + i > 9) {
        return;
      }
      if (playerBoard[row + 1][column].ship !== null) {
        if (
          playerBoard[row + 1][column].ship.name !== focusedShip.classList[1]
        ) {
          return;
        }
      }
    } else {
      console.log("What kind of edge case is this?");
    }
  }

  // iterate through the board and remove occurances of the ship if it is already placed
  for (let i = 0; i < playerBoard.length; i++) {
    for (let j = 0; j < playerBoard[i].length; j++) {
      if (playerBoard[i][j].ship === findShip(focusedShip.classList[1])) {
        playerBoard[i][j].ship = null;
        playerBoard[i][j].state = state.EMPTY;
        playerBoard[i][j].orientation = null;
        playerBoard[i][j].start = null;
        playerBoard[i][j].end = null;
      }
    }
  }

  for (let i = 0; i < shipLength; i++) {
    if (shipOrientation === "horizontal") {
      playerBoard[row][column + i].ship = findShip(focusedShip.classList[1]);
      playerBoard[row][column + i].state = state.SHIP;
      playerBoard[row][column + i].orientation = shipOrientation;
      if (i === 0) {
        playerBoard[row][column + i].start = true;
      }
      if (i === shipLength - 1) {
        playerBoard[row][column + i].end = true;
      }
    } else if (shipOrientation === "vertical") {
      // vertical
      playerBoard[row + i][column].ship = findShip(focusedShip.classList[1]);
      playerBoard[row + i][column].state = state.SHIP;
      playerBoard[row + i][column].orientation = shipOrientation;
      if (i === 0) {
        playerBoard[row + i][column].start = true;
      }
      if (i === shipLength - 1) {
        playerBoard[row + i][column].end = true;
      }
    } else {
      console.log("there is no ship orientation");
    }
  }
  render();
}

function dragOver(e) {
  e.preventDefault();
}

// listener functions
/**
 * handles when a key is pressed. (r rotates the ship)
 * @param {KeyboardEvent} e - The keyboard event.
 */
function handleKeyPress(e) {
  // console.log(e.key);

  if (e.key === "r") {
    rotateShip();
  }
}

/**
 * handles when a ship is clicked on.
 * @param {MouseEvent} e - The mouse event.
 */
function handleClick(e) {
  if (focusedShip && focusedShip === e.target) {
    return;
  }
  if (focusedShip && focusedShip.style.border !== "none") {
    focusedShip.style.border = "none";
  }
  // console.log(e.target);
  focusedShip = e.target;
  focusedShipOrientation = e.target.classList[2];
  focusedShip.style.border = "2px solid black";
  focusedShip.focus();
}


/**
 * Checks if all the ships have a hit state.
 * @param {Array<Array<Square>>} board the game board to check.
 * @returns {boolean} true if all ships have a hit state, false otherwise.
 */
function checkWin(board) {
  let count = 0;
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j].state === state.HIT) {
        count++;
      }
    }
  }
  // console.log(count);
  return count === 17;
}

/**
 * Resets the ships on the board.
 * @param {} board 
 */
function resetShips(board) {
  // iterate through the player board
  // reset the state of each square to empty
  // reset the ship of each square to null

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      board[i][j].state = state.EMPTY;
      board[i][j].ship = null;
    }
  }

  if (focusedShip) {
    focusedShip.style.border = "none";
    focusedShip = null;
  }

  render();
}

/**
 * rotates the focused ship
 * @returns {void}
 */
function rotateShip() {
  if (focusedShip.classList.contains("horizontal")) {
    focusedShip.classList.remove("horizontal");
    focusedShip.classList.add("vertical");
    focusedShipOrientation = "vertical";
  } else {
    focusedShip.classList.remove("vertical");
    focusedShip.classList.add("horizontal");
    focusedShipOrientation = "horizontal";
  }
}

/**
 * Returns the length of the ship based on its name.
 * @param {string} ship - The name of the ship.
 * @returns {number} - The length of the ship.
 */
function lengthOfShip(ship) {
  if (ship === "carrier") {
    return 5;
  }
  if (ship === "battleship") {
    return 4;
  }
  if (ship === "cruiser") {
    return 3;
  }
  if (ship === "submarine") {
    return 3;
  }
  if (ship === "destroyer") {
    return 2;
  }
}

/**
 * Finds a ship object by its name.
 * @param {string} name - The name of the ship.
 * @returns {Ship|undefined} - The ship object with the specified name, or undefined if not found.
 */
function findShip(name) {
  return allShips[name];
}

/**
 * Checks if a ship can be placed on the board.
 * @param {Ship} ship the ship to place.
 * @param {String} shipOrientation the orientation of the ship.
 * @param {Integer} row the row to place the ship.
 * @param {Integer} column the column to place the ship.
 * @param {Array<Array<Square>>} board the board to place the ship on.
 * @returns {boolean} true if the ship can be placed, false otherwise.
 */
function canPlaceShip(ship, shipOrientation, row, column, board) {
  for (let i = 0; i < lengthOfShip(ship); i++) {
    if (shipOrientation === "horizontal") {
      if (column + i > 9) {
        return false;
      }
      if (board[row][column + i].state !== state.EMPTY) {
        // if a ship is already there
        return false;
      }
    } else if (shipOrientation === "vertical") {
      if (row + i > 9) {
        return false;
      }
      if (board[row + i][column].state !== state.EMPTY) {
        return false;
      }
    } else {
      console.log("something went wrong in canPlaceShip");
      return false;
    }
  }
  return true;
}

/**
 * returns true if all ships are placed, false otherwise.
 * @returns {boolean} true if all ships are placed, false otherwise.
 */
function allShipsPlaced() {
  // iterate through entire playerboard
  // count number of squares that have a ship equal to 5 + 4 + 3 + 3 + 2
  // if not, return false
  let count = 0;
  for (let i = 0; i < playerBoard.length; i++) {
    for (let j = 0; j < playerBoard[i].length; j++) {
      if (playerBoard[i][j].ship !== null) {
        count++;
      }
    }
  }
  return count === 17;
}

/**
 * returns the number of ships on the board.
 * @param {Array<Array<Square>>}} board 
 * @returns {Integer} the number of ships on the board.
 */
function numOfShips(board) {
  // returns number of ships on the board
  let count = 0;
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j].ship !== null) {
        count++;
      }
    }
  }
  return count;
}

/**
 * unhides the computers ships
 * @returns {void}
 */
function cheatsOn() {
  cheats = true;
  render();
}
