import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  MeshLambertMaterial,
  Mesh,
} from "three";

export const playerModel = () => {
  let player = new Group();

  let torsoGeometry = new BoxGeometry(2.5, 2.5, 0.5);
  let torsoMaterial = new MeshLambertMaterial({ color: 0xf7f1ed });
  let torsoMesh = new Mesh(torsoGeometry, torsoMaterial);

  let legGeometry = new BoxGeometry(0.75, 3, 0.4);
  let legMaterial = new MeshLambertMaterial({ color: 0x0077f5 });
  let leftLegMesh = new Mesh(legGeometry, legMaterial);
  leftLegMesh.position.set(0.8, -3, 0);

  let rightLegMesh = new Mesh(legGeometry, legMaterial);
  rightLegMesh.position.set(-0.8, -3, 0);

  let shoeGeometry = new BoxGeometry(0.85, 0.2, 0.5);
  let shoeMaterial = new MeshLambertMaterial({ color: 0x654321 });
  let leftShoeMesh = new Mesh(shoeGeometry, shoeMaterial);
  leftShoeMesh.position.set(0.8, -4, 0.1);

  let rightShoeMesh = new Mesh(shoeGeometry, shoeMaterial);
  rightShoeMesh.position.set(-0.8, -4, 0.1);

  let leftArmGeometry = new CylinderGeometry(0.3, 0.2, 3);
  let armMaterial = new MeshLambertMaterial({ color: 0xdc956c });
  let leftArmMesh = new Mesh(leftArmGeometry, armMaterial);
  leftArmMesh.position.set(2, 0.3, 0.1);
  leftArmMesh.rotation.z = 0.3;

  let rightArm = new Group();
  let upperArmGeometry = new BoxGeometry(0.4, 1.4, 0.25);
  let upperArmMesh = new Mesh(upperArmGeometry, armMaterial);
  upperArmMesh.position.set(-2, 0.6, 0.1);
  upperArmMesh.rotation.z = -0.5;

  rightArm.add(upperArmMesh);

  player.add(torsoMesh);
  player.add(leftLegMesh);
  player.add(leftArmMesh);
  player.add(rightLegMesh);
  player.add(leftShoeMesh);
  player.add(rightShoeMesh);

  player.receiveShadow = true;
  player.castShadow = true;

  return player;
};
