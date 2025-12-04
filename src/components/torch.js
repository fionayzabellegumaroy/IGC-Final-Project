import {
  BoxGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  TextureLoader,
  PointLight,
} from "three";
import { topTorch } from "../assets/textures";

let textureLoader = new TextureLoader();
let topTorchTexture = textureLoader.load(topTorch);

let torchGeometry = new BoxGeometry(0.5, 0.5, 2);
let torchMaterial = new MeshLambertMaterial({ color: 0x4b2e0f });

let fireGeometry = new BoxGeometry(0.6, 0.6, 0.6);
let fireMaterial = new MeshLambertMaterial({ map: topTorchTexture });

export const torch = (x, y) => {
  let torchGroup = new Group();

  let torchMesh = new Mesh(torchGeometry, torchMaterial); // wooden part of torch
  torchMesh.position.set(-0.7, 1.2, 0);
  torchMesh.rotation.set(Math.PI / 2, 0, 0);

  let fireMesh = new Mesh(fireGeometry, fireMaterial);
  fireMesh.position.set(-0.7, 2.5, 0);

  torchGroup.add(fireMesh);
  torchGroup.add(torchMesh);

  let topTorchLight = new PointLight(0xf8e17a, 80.0, 50, 1);
  topTorchLight.name = "mainTorchLight";
  topTorchLight.position.set(0.7, 4, 0);
  topTorchLight.castShadow = true;

//   let rightTorchLight = new PointLight(0xf8e17a, 5.0, 50, 1);
//   rightTorchLight.position.set(0, 2.5, 1);
//   rightTorchLight.castShadow = true;

//   let leftTorchLight = new PointLight(0xf8e17a, 5.0, 50, 1);
//   leftTorchLight.position.set(-1.7, 2.5, 0);
//   leftTorchLight.castShadow = true;

  let torchLight = new Group();

  torchLight.add(topTorchLight);
//   torchLight.add(rightTorchLight);
//   torchLight.add(leftTorchLight);

  torchGroup.add(torchLight);

  torchGroup.position.set(x, 1, y);

  return torchGroup;
};
