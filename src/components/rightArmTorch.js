import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  MeshLambertMaterial,
  PointLight,
  TextureLoader,
} from "three";

import { topTorch } from "../assets/textures";

export const rightArmTorch = () => {
  let model = new Group();
  let torch = new Group();

  let armMaterial = new MeshLambertMaterial({ color: 0xdc956c });
  let armGeometry = new CylinderGeometry(0.7, 0.5, 2);
  let armMesh = new Mesh(armGeometry, armMaterial);

  armMesh.rotation.set(Math.PI / 2 + 0.5, 0, -0.5);
  model.add(armMesh);

  let torchGeometry = new BoxGeometry(0.5, 0.5, 2);
  let torchMaterial = new MeshStandardMaterial({
    color: 0x4b2e0f,
    roughness: 0.9,
    metalness: 0,
  });

  let torchMesh = new Mesh(torchGeometry, torchMaterial); // wooden part of torch
  torchMesh.position.set(-0.7, 1.2, 0);
  torchMesh.rotation.set(Math.PI / 2, 0, 0);

  let textureLoader = new TextureLoader();
  let topTorchTexture = textureLoader.load(topTorch);

  let fireGeometry = new BoxGeometry(0.6, 0.6, 0.6);

  let fireMaterial = new MeshStandardMaterial({ map: topTorchTexture });

  let fireMesh = new Mesh(fireGeometry, fireMaterial);
  fireMesh.position.set(-0.7, 2.5, 0);

  torch.add(fireMesh);
  torch.add(torchMesh);

  let topTorchLight = new PointLight(0xf8e17a, 80.0, 50, 1);
  topTorchLight.name = "mainTorchLight";
  topTorchLight.position.set(0.7, 4, 0);
  topTorchLight.castShadow = true;
  topTorchLight.shadow.mapSize.width = 1024;
  topTorchLight.shadow.mapSize.height = 1024;
  topTorchLight.shadow.camera.near = 0.3;
  topTorchLight.shadow.camera.far = 15;

  let rightTorchLight = new PointLight(0xf8e17a, 5.0, 50, 1);
  rightTorchLight.position.set(0, 2.5, 1);
  rightTorchLight.castShadow = true;

  let leftTorchLight = new PointLight(0xf8e17a, 5.0, 50, 1);
  leftTorchLight.position.set(-1.7, 2.5, 0);
  leftTorchLight.castShadow = true;
  
  let torchLight = new Group();

  torchLight.add(topTorchLight);
  torchLight.add(rightTorchLight);
  torchLight.add(leftTorchLight);

  torch.add(torchLight);
  model.add(torch);

  return model;
};
