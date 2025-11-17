import { BoxGeometry, Mesh, MeshStandardMaterial } from "three";

// temporary player component
export const player = () => {
  let cellSize = 1;
  let playerMesh = new Mesh(
    new BoxGeometry(cellSize, 0.5, cellSize),
    new MeshStandardMaterial({ color: 0xFFA500 })
  );
  return playerMesh;
};
