import * as THREE from 'three';

import { BoxGeometry, Mesh, MeshLambertMaterial } from "three";
import { endPosition } from "../core";

export const endBlock = () => {
  let cellSize = 5;
  let endGeometry = new Mesh(
    new BoxGeometry(cellSize, 0.5, cellSize),
    new MeshLambertMaterial({ color: 0xFFA500 })
  );

  endGeometry.position.set(
    endPosition[0] * cellSize + cellSize / 2, 
    0,
    endPosition[1] * cellSize + cellSize / 2
  );

  endGeometry.userData = {
    type: 'endBlock', 
    gridX: endPosition[0], 
    gridZ: endPosition[1] 
  };
  
  return endGeometry;
};
