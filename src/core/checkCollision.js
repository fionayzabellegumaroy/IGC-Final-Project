import { CELL_SIZE } from '../utils';

export function checkCollision(currentPosition, movementVector, maze, padding = 10.6) {

  // compute next position
  const nextX = currentPosition.x + movementVector.x;
  const nextZ = currentPosition.z + movementVector.z;

  // compute the range of grid cells that the player's radius/padding overlaps
  const minX = nextX - padding;
  const maxX = nextX + padding;
  const minZ = nextZ - padding;
  const maxZ = nextZ + padding;

  const minRow = Math.floor(minX / CELL_SIZE);
  const maxRow = Math.floor(maxX / CELL_SIZE);
  const minCol = Math.floor(minZ / CELL_SIZE);
  const maxCol = Math.floor(maxZ / CELL_SIZE);

  // check for any wall
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      if (r < 0 || r >= maze.length || c < 0 || c >= maze[0].length) {
        return true; // out-of-bounds, so player can't walk off the maze
      }
      if (maze[r][c] === 1) {
        return true; // there is a wall in the way
      }
    }
  }
  return false;
}
