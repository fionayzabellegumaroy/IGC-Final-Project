import { BoxGeometry, Mesh, MeshStandardMaterial } from "three";

// temporary player component
export const player = () => {
  let cellSize = 1;
  let playerMesh = new Mesh(
    new BoxGeometry(cellSize, 0.5, cellSize),
    new MeshStandardMaterial({ color: 0xFFA500 })
  );
  
  playerMesh.position.set(0, -0.75, 0); // adjust player model position relative to camera

  return playerMesh;
};
