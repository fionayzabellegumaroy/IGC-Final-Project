import { Vector3 } from "three";

export function checkCollision(currentPosition, movementVector, maze, cellSize = 5, padding = 0.5) {
  // compute candidate next position
  const nextX = currentPosition.x + movementVector.x;
  const nextZ = currentPosition.z + movementVector.z;

  // compute the range of grid cells that the player's radius/padding overlaps
  const minX = nextX - padding;
  const maxX = nextX + padding;
  const minZ = nextZ - padding;
  const maxZ = nextZ + padding;

  const minRow = Math.floor(minX / cellSize);
  const maxRow = Math.floor(maxX / cellSize);
  const minCol = Math.floor(minZ / cellSize);
  const maxCol = Math.floor(maxZ / cellSize);

  // iterate the covered cell rectangle and check for any wall
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      if (r < 0 || r >= maze.length || c < 0 || c >= maze[0].length) {
        // out-of-bounds — treat as collision so player can't walk off the maze
        return true;
      }
      if (maze[r][c] === 1) {
        return true;
      }
    }
  }
  return false;
}