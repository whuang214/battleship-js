console.log("app.js loaded");

/*----- constants -----*/

let winner = 0; // 0 = no winner, 1 = player, -1 = computer
let turn = 1; // 1 = player, -1 = computer

/**
 * Represents the state of a square on the game board.
 */
const state = {
  EMPTY: "empty",
  HIT: "hit",
  MISS: "miss",
  SHIP: false,
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
 * Represents a square on the game board.
 */
class Square {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.state = state.EMPTY;
    this.ship = null;
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

/*----- state variables -----*/
let playerBoard = []; // the players game board represented as a 2D array of Square objects
let computerBoard = []; // the players game board represented as a 2D array of Square objects

let focusedShip; // the e.target of the ship being interacted with

/*----- cached elements  -----*/
const ships = document.querySelectorAll(".ship");
const playerSquares = document.querySelectorAll(".player-board div");
const computerSquares = document.querySelectorAll(".computer-board div");

const playButton = document.getElementById("startBtn");
const resetButton = document.getElementById("resetShipsButton");

/*----- event listeners -----*/

document.getElementById("playButton").addEventListener("click", () => {
  document.querySelector(".overlay").style.display = "none";
});

/*----- functions -----*/

// game functions
function initGame() {
  // initialize the game boards
  initBoard(playerBoard);
  initBoard(computerBoard);

  // render the game boards
  render();

  // adding and dropping ships
  ships.forEach((ship) => { // for each ship listen for the following events
    ship.addEventListener("dragstart", dragStart);
    ship.addEventListener("keydown", handleKeyPress);
    ship.addEventListener("click", handleClick);
  });

  playerSquares.forEach((square) => { // for each square on the player board listen for the following events
    square.addEventListener("dragover", dragOver);
    square.addEventListener("drop", dragDrop);
  });

  playButton.addEventListener("click", startGame);

}

function startGame() {

  if (allShipsPlaced()) {
    playButton.style.display = "none";
    resetShipsButton.style.display = "none";
    return;
  }

  console.log("game started");


  
  // player turn
  // computer turn
  // check for winner
  // end game


  computerSquares.forEach((square) => {
    // listen for clicks on the computer board
  });
}

/**
 * creates a 10x10 2D array of Square objects.
 * @param {array} board - The game board to initialize.
 */
function initBoard(board) {
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

function render() {
  renderBoard(playerBoard, "player");
  renderBoard(computerBoard, "computer");
}

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
      if (square.ship !== null) {
        div.classList.add("ship");
        div.classList.add(square.ship.name);
        if (square.state === state.HIT) {
          div.classList.add(state.HIT);
          console.log("hit");
        }
        // console.log(square.ship.name);
      } else {
        div.classList.add(square.state);
      }
    }
  }
}

function rotateShip() {
  if (focusedShip.classList.contains("horizontal")) {
    focusedShip.classList.remove("horizontal");
    focusedShip.classList.add("vertical");
  } else {
    focusedShip.classList.remove("vertical");
    focusedShip.classList.add("horizontal");
  }
}

function randomizeComputerShips() {
  for (let ship in allShips) {
    let randomRow = Math.floor(Math.random() * 10);
    let randomColumn = Math.floor(Math.random() * 10);
    let randomOrientation = Math.floor(Math.random() * 2);

    let shipOrientation = randomOrientation === 0 ? "horizontal" : "vertical";
    let shipLength = lengthOfShip(ship);

    while (
      !canPlaceShip(
        ship,
        shipOrientation,
        randomRow,
        randomColumn,
        computerBoard
      )
    ) {
      randomRow = Math.floor(Math.random() * 10);
      randomColumn = Math.floor(Math.random() * 10);
      randomOrientation = Math.floor(Math.random() * 2);

      shipOrientation = randomOrientation === 0 ? "horizontal" : "vertical";
    }

    for (let i = 0; i < shipLength; i++) {
      if (shipOrientation === "horizontal") {
        computerBoard[randomRow][randomColumn + i].ship = allShips[ship];
      } else {
        computerBoard[randomRow + i][randomColumn].ship = allShips[ship];
      }
    }
  }
}

// drag and drop functions
function dragStart(e) {
  if (focusedShip) {
    focusedShip.style.border = "none";
  }
  focusedShip = e.target;
}

function dragDrop(e) {
  // TODO: fix bug where ship can be placed outside of board
  e.preventDefault();

  const square = e.target;
  const row = parseInt(square.id.split("-")[1]);
  const column = parseInt(square.id.split("-")[2]);

  const shipOrientation = focusedShip.classList[2];
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
      }
    }
  }

  for (let i = 0; i < shipLength; i++) {
    if (shipOrientation === "horizontal") {
      playerBoard[row][column + i].ship = findShip(focusedShip.classList[1]);
      playerBoard[row][column + i].state = true;
    } else if (shipOrientation === "vertical") {
      // vertical
      playerBoard[row + i][column].ship = findShip(focusedShip.classList[1]);
      playerBoard[row + i][column].state = true;
    } else {
      console.log("What kind of edge case is this?");
    }
  }

  // e.target.appendChild(focusedShip);

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
  console.log(e.key);

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
  if (focusedShip && focusedShip.style.border === "2px solid black") {
    focusedShip.style.border = "none";
  }
  console.log(e.target);
  focusedShip = e.target;
  focusedShip.style.border = "2px solid black";
  focusedShip.focus();
}

// helper functions
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

function canPlaceShip(ship, shipOrientation, row, column, board) {
  for (let i = 0; i < lengthOfShip(ship); i++) {
    if (shipOrientation === "horizontal") {
      if (column + i > 8) {
        return false;
      }
      console.log(column + i);
      if (board[row][column + i].ship !== null) {
        // if a ship is already there
        return false;
      }
    } else if (shipOrientation === "vertical") {
      // vertical
      if (row + i > 8) {
        return false;
      }
      console.log(row + i);
      if (board[row + 1][column].ship !== null) {
        return false;
      }
    } else {
      console.log("What kind of edge case is this?");
      return false;
    }
  }
  return true;
}

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

initGame();
