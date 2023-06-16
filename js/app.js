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
  // loop through board
  // get each square
  // set the class of the square to the state of the square
  // empty, ship, hit, miss
  // on miss and hit, add a class to show the red or white circle
  // on ship add a class to show the ship
  // update the DOM
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

function rotateShip() {
  if (draggedShip.classList.contains("carrier-horizontal")) {
    draggedShip.classList.remove("carrier-horizontal");
    draggedShip.classList.add("carrier-vertical");
  } else {
    draggedShip.classList.remove("carrier-vertical");
    draggedShip.classList.add("carrier-horizontal");
  }
}

function dragStart(e) {
  draggedShip.style.border = "none";
  draggedShip = e.target;
}

function dragDrop(e) {
  e.target.append(draggedShip);
}

function dragOver(e) {
  e.preventDefault();
}
