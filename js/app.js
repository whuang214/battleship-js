console.log("app.js loaded");

/*----- constants -----*/

let winner = 0; // 0 = no winner, 1 = player, -1 = computer
let turn = 1; // 1 = player, -1 = computer

const state = {
  EMPTY: "empty",
  SHIP: "ship",
  HIT: "hit",
  MISS: "miss",
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
  }
}

/*----- state variables -----*/
let playerBoard = [];
let computerBoard = [];

let draggedShip;
let draggedShipLength;

/*----- cached elements  -----*/
const ships = document.querySelectorAll(".ship");
const squares = document.querySelectorAll(".player-board div");

/*----- event listeners -----*/

document.getElementById("playButton").addEventListener("click", () => {
  document.querySelector(".overlay").style.display = "none";
});

ships.forEach((ship) => {
  ship.addEventListener("dragstart", dragStart);
  ship.addEventListener("keydown", handleKeyPress);
  ship.addEventListener("click", handleClick);
});

squares.forEach((square) => {
  square.addEventListener("dragover", dragOver);
  square.addEventListener("drop", dragDrop);
});

/*----- functions -----*/

function initGame() {
  initBoard(playerBoard);
  initBoard(computerBoard);

  render();

  // place ships on board
  // player places ships
  // computer places ships
  // start game
  // player turn
  // computer turn
  // check for winner
  // end game
}

/**
 * Initializes the game board with square objects.
 *
 * @param {Array<Array<Square>>} board - The game board represented as a 2D array of Square objects.
 * @returns {Array<Array<Square>>} The initialized game board.
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
  renderBoard(playerBoard);
  renderBoard(computerBoard);
}

function renderBoard(board) {
  // loop through the board
  // get the dom element
  // update the dom with the board state

  for (let i = 0; i < board.length; i++) {
    // loop through the board
    for (let j = 0; j < board[i].length; j++) {
      const square = board[i][j];
      // get the dom element
      const div = document.getElementById(`player-${i}-${j}`); 
      // update the dom with the board state
      div.classList.remove("empty", "ship", "hit", "miss");
      div.classList.add(square.state);
    }
  }

}

function handleKeyPress(e) {
  console.log(e.key)

  if (e.key === "r") {
    rotateShip();
  }
}

function handleClick(e) {
  if (draggedShip && draggedShip === e.target) {
    return;
  }
  if (draggedShip && draggedShip.style.border === "2px solid black") {
    draggedShip.style.border = "none";
  }
  console.log(e.target);
  draggedShip = e.target;
  draggedShip.style.border = "2px solid black";
  draggedShip.focus(); 
}

function rotateShip() { // TODO: allow rotation for all ships
  if (draggedShip.classList.contains("horizontal")) {
    draggedShip.classList.remove("horizontal");
    draggedShip.classList.add("vertical");
  } else {
    draggedShip.classList.remove("vertical");
    draggedShip.classList.add("horizontal");
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

function dragStart(e) {
  if (draggedShip) {
    draggedShip.style.border = "none";
  }
  draggedShip = e.target;

}

function dragDrop(e) { // TODO: fix bug where ship can be placed outside of board
  e.preventDefault();
  // check which orientation the ship is in
  // check if the ship can be placed in the square (check if the ship will fit)
  // update the surrounding squares with the ship state
  // update the square with the ship state
  const square = e.target;
  const row = parseInt(square.id.split("-")[1]);
  const column = parseInt(square.id.split("-")[2]);

  console.log(row, column);

  // check if the ship can be placed in the square (check if the ship will fit)
  // change the state of the square to ship plus the surrounding squares

  const shipOrientation = draggedShip.classList[2];
  const shipLength = lengthOfShip(draggedShip.classList[1]);

  for (let i = 0; i < shipLength; i++) {
    if (shipOrientation === "horizontal") {
      if (column + i > 9 || playerBoard[row][column + i].state === state.SHIP) {
        return;
      }
    } else if (shipOrientation === "vertical") { // vertical
      if (row + i > 9 || playerBoard[row + i][column].state === state.SHIP) {
        return;
      }
    }
    else {
      console.log("What kind of edge case is this?");
    }
  }

  e.target.appendChild(draggedShip);

  render();


}

function dragOver(e) {
  e.preventDefault();
}

function printPlayerboard() {
  for (let i = 0; i < playerBoard.length; i++) {
    let row = "";
    for (let j = 0; j < playerBoard[i].length; j++) {
      row += playerBoard[i][j].state + " ";
    }
    console.log(row);
  }
}

initGame();
