import { MAZE_COLS, MAZE_ROWS } from "../config";

function generateMazePrims() {
  let maze = Array(MAZE_ROWS)
    .fill(null)
    .map(() => Array(MAZE_COLS).fill(1));

  //Prim's alg. for generation of corridors
  let startX = Math.floor(Math.random() * Math.floor(MAZE_COLS / 2)) * 2;
  let startY = Math.floor(Math.random() * Math.floor(MAZE_ROWS / 2)) * 2;
  maze[startY][startX] = 0;

  let walls = [];

  // add neighboring walls of start cell
  let directions = [
    [0, -2],
    [0, 2],
    [-2, 0],
    [2, 0],
  ];
  //[0, -2] up (row doesn't change, col decreases by 2), [0, 2] down, [-2, 0] left, [2, 0] right

  for (let [dx, dy] of directions) {
    // gets neighbor cell coordinates
    let newX = startX + dx;
    let newY = startY + dy;

    // bounds checking
    if (newX >= 0 && newX < MAZE_COLS && newY >= 0 && newY < MAZE_ROWS) {
      walls.push([startX + dx / 2, startY + dy / 2, newX, newY]); // push wall
    }
  }

  while (walls.length > 0) {
    // pick random wall
    let randomIndex = Math.floor(Math.random() * walls.length);
    let [wallX, wallY, cellX, cellY] = walls.splice(randomIndex, 1)[0];

    // if cell on other side is unvisited
    if (maze[cellY][cellX] === 1) {
      // carve passage through wall
      maze[wallY][wallX] = 0;
      maze[cellY][cellX] = 0;

      // add neighboring walls of new cell
      for (let [dx, dy] of directions) {
        // get neighboring cell coordinates
        let newX = cellX + dx;
        let newY = cellY + dy;
        if (
          newX >= 0 &&
          newX < MAZE_COLS &&
          newY >= 0 &&
          newY < MAZE_ROWS &&
          maze[newY][newX] === 1
        ) {
          // if bounds check passes, push wall
          walls.push([cellX + dx / 2, cellY + dy / 2, newX, newY]);
        }
      }
    }
  }

  // add border walls
  let updatedMaze = new Array(MAZE_ROWS + 2); // +2 because of top of maze and bottom of maze
  for (let i = 0; i < MAZE_ROWS + 2; i++) {
    updatedMaze[i] = new Array(MAZE_COLS + 2);
    for (let j = 0; j < MAZE_COLS + 2; j++) {
      // if edge, it is a wall
      if (i === 0 || i === MAZE_ROWS + 1 || j === 0 || j === MAZE_COLS + 1) {
        updatedMaze[i][j] = 1;
      } else {
        // if not an edge, translate maze info into updated maze
        updatedMaze[i][j] = maze[i - 1][j - 1];
      }
    }
  }

  // find start and end positions
  let startPosition, endPosition;

  let openCells = [];

  // collect all open cells
  for (let i = 1; i < MAZE_ROWS + 1; i++) {
    for (let j = 1; j < MAZE_COLS + 1; j++) {
      if (updatedMaze[i][j] === 0) {
        openCells.push([i, j]);
      }
    }
  }

  // make sure at least 2 open cells
  if (openCells.length < 2) {
    console.error("Maze generation failed - not enough open cells!");
    startPosition = [1, 1];
    endPosition = [1, 2];
    return { maze: updatedMaze, startPosition, endPosition };
  }

  // pick random start position
  let startIndex = Math.floor(Math.random() * openCells.length);
  startPosition = openCells[startIndex];

  // remove start position from available cells
  openCells.splice(startIndex, 1);

  // pick random end position from remaining cells
  let endIndex = Math.floor(Math.random() * openCells.length);
  endPosition = openCells[endIndex];

  return { maze: updatedMaze, startPosition, endPosition };
}

// helper function
function printMaze(mazeArg) {
  const mazeToUse = mazeArg || maze;
  if (!mazeToUse) {
    console.warn("printMaze: no maze available");
    return "";
  }
  return mazeToUse.map((row) => row.join("")).join("\n");
}

export let maze, startPosition, endPosition;

function initMaze() {
  const result = generateMazePrims();
  maze = result.maze;
  startPosition = result.startPosition;
  endPosition = result.endPosition;
  return { maze, startPosition, endPosition };
}

// initialize with defaults
initMaze();

export { initMaze as regenerateMaze, printMaze };
