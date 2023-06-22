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

let cheats = false; // if true, show the computer ships

/*----- cached elements  -----*/
const ships = document.querySelectorAll(".ship");
const playerSquares = document.querySelectorAll(".player-board div");
const computerSquares = document.querySelectorAll(".computer-board div");

const playButton = document.getElementById("startBtn");
const resetButton = document.getElementById("resetShipsButton");
const randomizeShipsButton = document.getElementById("randomBtn");

const shipContainer = document.querySelector(".ships-container");

const mainMessage = document.querySelector(".info-container #main-message");
const secondaryMessage = document.querySelector(".info-container #secondary-message");

/*----- event listeners -----*/

document.getElementById("playButton").addEventListener("click", () => {
  document.querySelector(".overlay").style.display = "none";
  initGame();
});

/*----- functions -----*/

// game functions
function initGame() {
  console.log("initGame called");
  mainMessage.textContent = "Place your ships. Click on the ship and press 'r' to rotate";
  // initialize the game boards
  initBoard(playerBoard);
  initBoard(computerBoard);

  // cheatsOn();

  // render the game boards
  render();

  // adding and dropping ships
  ships.forEach((ship) => {
    // for each ship listen for the following events
    ship.addEventListener("dragstart", dragStart);
    ship.addEventListener("keydown", handleKeyPress);
    ship.addEventListener("click", handleClick);
  });

  playerSquares.forEach((square) => {
    // for each square on the player board listen for the following events
    square.addEventListener("dragover", dragOver);
    square.addEventListener("drop", dragDrop);
  });

  playButton.addEventListener("click", startGame);
  resetButton.addEventListener("click", () => {
    resetShips(playerBoard);
  });
  randomizeShipsButton.addEventListener("click", () => {
    randomizeShips(playerBoard)});
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

function startGame(e) {
  e.preventDefault();
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

  mainMessage.textContent = "Game started. Click on the computer board to fire.";

  computerSquares.forEach((square) => {
    // listen for clicks on the computer board
    square.addEventListener("click", playTurn);
  });

  render();
}

function playTurn(e) {
  e.preventDefault();

  // player turn

  const square = e.target;
  const clickedRow = square.id.split("-")[1];
  const clickedCol = square.id.split("-")[2];

  // check if clicked square has already been clicked

  console.log(`player clicked on row ${clickedRow} col ${clickedCol}`);

  if (computerBoard[clickedRow][clickedCol].state === state.EMPTY) {
    console.log("player miss");
    mainMessage.textContent = "You missed.";
    computerBoard[clickedRow][clickedCol].state = state.MISS;
  } else if (computerBoard[clickedRow][clickedCol].state === state.SHIP) {
    console.log("player hit");
    mainMessage.textContent = "You hit a ship!";
    computerBoard[clickedRow][clickedCol].state = state.HIT;
  } else {
    console.log("player already clicked here");
    mainMessage.textContent = "You already clicked here.";
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

  console.log(`computer clicked on row ${randRow} col ${randCol}`);

  if (playerBoard[randRow][randCol].state === state.EMPTY) {
    console.log("computer miss");
    secondaryMessage.textContent = "Computer missed.";
    playerBoard[randRow][randCol].state = state.MISS;
  } else if (playerBoard[randRow][randCol].state === state.SHIP) {
    console.log("computer hit");
    secondaryMessage.textContent = "Computer hit a ship!";
    playerBoard[randRow][randCol].state = state.HIT;
  } else {
    console.log("You idiot, you broke the game");
  }

  // win
  if (checkWin(playerBoard)) {
    alert("Computer Wins!");
    return;
  }
  else if (checkWin(computerBoard)) {
    alert("Player Wins!");
    return;
  }

  render();
}

function randomizeShips(board) {

  // reset board:
  resetShips(board);


  for (let ship in allShips) {
    let randomRow = Math.floor(Math.random() * 10);
    let randomColumn = Math.floor(Math.random() * 10);
    let randomOrientation = Math.floor(Math.random() * 2);

    let shipOrientation = randomOrientation === 0 ? "horizontal" : "vertical";
    let shipLength = lengthOfShip(ship);
    // console.log(shipLength);

    while (
      !canPlaceShip(
        ship,
        shipOrientation,
        randomRow,
        randomColumn,
        board
      )
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
      } else {
        board[randomRow + i][randomColumn].ship = allShips[ship];
        board[randomRow + i][randomColumn].state = state.SHIP;
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

function hideShips(board, computerOrPlayer) {
  // iterate through the board
  // if .ship class, add .hidden class
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board.length; j++) {
      const square = document.getElementById(`${computerOrPlayer}-${i}-${j}`);
      if (board[i][j].state === state.SHIP) {
        square.classList.add("hidden");
        console.log(square.classList);
      }
    }
  }
}

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

  render();
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

function rotateShip() {
  if (focusedShip.classList.contains("horizontal")) {
    focusedShip.classList.remove("horizontal");
    focusedShip.classList.add("vertical");
  } else {
    focusedShip.classList.remove("vertical");
    focusedShip.classList.add("horizontal");
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
      playerBoard[row][column + i].state =  state.SHIP;
    } else if (shipOrientation === "vertical") {
      // vertical
      playerBoard[row + i][column].ship = findShip(focusedShip.classList[1]);
      playerBoard[row + i][column].state = state.SHIP;
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
  if (focusedShip && focusedShip.style.border !== "none") {
    focusedShip.style.border = "none";
  }
  // console.log(e.target);
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

function cheatsOn() {
  cheats = true;
  render();
}


