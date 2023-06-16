console.log("app.js loaded");

/*----- constants -----*/

/*----- state variables -----*/
let playerBoard = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // row 0
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // row 1
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // row 2
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // row 3
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // row 4
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // row 5
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // row 6
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // row 7
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // row 8
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] // row 9
]
let computerBoard = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // row 0
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // row 1
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // row 2
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // row 3
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // row 4
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // row 5
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // row 6
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // row 7
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // row 8
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] // row 9
]
let draggedShip;

/*----- cached elements  -----*/
const ships = document.querySelectorAll(".ship");
const squares = document.querySelectorAll(".player-board div");

/*----- event listeners -----*/
document.getElementById("playButton").addEventListener("click", function () {
  document.querySelector(".overlay").style.display = "none";
});

ships.forEach((ship) => ship.addEventListener("dragstart", dragStart));

squares.forEach((square) => {
  square.addEventListener("dragover", dragOver)
  square.addEventListener("drop", dragDrop)
});

/*----- functions -----*/

function dragStart(e) {
  draggedShip = e.target;
}

function dragDrop(e) {
  e.target.append(draggedShip);
}

function dragOver(e) {
  e.preventDefault();
}
