import { PlaneGeometry, Mesh, MeshStandardMaterial } from "three";
import { startPosition } from "../core";

const startBlock = () => {
  let cell_size = 2;
  let geometry = new PlaneGeometry(
    cell_size, cell_size
  );

  let material = new MeshStandardMaterial({
    color: 0xFFFF00,
    roughness: 2,
    metalness: 0.2,
  });

  let block = new Mesh(geometry, material);
  block.rotation.x = -Math.PI / 2; // rotate to be horizontal

  block.position.set(
    startPosition[0] * cell_size, //divide by 2 to center Plane Geometry [it starts with being at [-some number, some number] instead of [0,0]
    0,
    startPosition[1] * cell_size 
  );
  return block;
};

export { startBlock };
