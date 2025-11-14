import { PlaneGeometry, Mesh, MeshLambertMaterial } from "three";
import { maze, startPosition, endPosition } from "../core";

const ground = () => {
  let cell_size = 5;
  let groundGeometry = new PlaneGeometry(
    maze[0].length * cell_size,
    maze.length * cell_size
  );

  let groundMaterial = new MeshLambertMaterial({
    color: 0x808080,
  });

  let ground = new Mesh(groundGeometry, groundMaterial);
  
  ground.rotation.x = -Math.PI / 2; // rotate to be horizontal

  ground.position.set(
    (maze[0].length * cell_size) / 2 , //divide by 2 to center Plane Geometry [it starts with being at [-some number, some number] instead of [0,0]
    0,
    (maze.length * cell_size) / 2
  );
  return ground;
};

export { ground };
