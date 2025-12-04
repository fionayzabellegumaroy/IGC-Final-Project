import { letter } from "../assets";
import { BoxGeometry, Mesh, MeshLambertMaterial, TextureLoader } from "three";
import { endPosition } from "../core";
import { CELL_SIZE } from "../utils";

let textureLoader = new TextureLoader();
let texture = textureLoader.load(letter);
let texturedMaterial = new MeshLambertMaterial({ color: 0xffffff,  map: texture });
let plainMaterial = new MeshLambertMaterial({ color: 0xdab980 });

export const endBlock = () => {
  let materials = [];

  materials[0] = plainMaterial; // Right face
  materials[1] = plainMaterial; // Left face
  materials[2] = texturedMaterial; // Top face
  materials[3] = plainMaterial; // Bottom face
  materials[4] = plainMaterial; // Front face
  materials[5] = plainMaterial; // Back face

  let aspect = 115 / 82;
  let width = 1;
  let depth = width * aspect;
  let endGeometry = new Mesh( new BoxGeometry(width * 5, 0.1, depth * 5), materials);

  endGeometry.position.set(
    endPosition[0] * CELL_SIZE + CELL_SIZE / 2,
    0,
    endPosition[1] * CELL_SIZE + CELL_SIZE / 2
  );

  endGeometry.userData = {
    type: "endBlock",
    gridX: endPosition[0],
    gridZ: endPosition[1],
  };

  return endGeometry;
};
