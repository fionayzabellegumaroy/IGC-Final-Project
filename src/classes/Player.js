import {
  BoxGeometry,
  Mesh,
  MeshStandardMaterial,
  Vector3,
} from "three";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { model } from "../assets";
import { checkCollision, maze } from "../core";

export class Player {
  constructor(scene, controls, camera, keys, collisionEnabledFn = () => true) {
    this.scene = scene;
    this.controls = controls;
    this.loader = new GLTFLoader();
    this.model = null;
    this.modelContainer = null;
    this.camera = camera;
    this.keys = keys;
    this.moveSpeed = 8.0;
    this.delta = 0.016;
    this.collisionEnabledFn = collisionEnabledFn;
    this.position = this.camera.position || new Vector3();
    this.rotation = new Vector3();
    this.headBobTimer = 0;
    this.baseYPosition = this.camera.position.y;
    this.isMoving = false; 
  }

  update() {
    if (!this.controls || !this.controls.isLocked || !this.keys) return;

    this.updateMovement();
    this.updateCamera();
  }

  updateMovement() {
    let step = this.moveSpeed * this.delta;
    this.isMoving = false; // Reset each frame

    if (this.keys.w) {
      this.moveForward(step);
      this.isMoving = true;
    }
    if (this.keys.s) {
      this.moveForward(-step);
      this.isMoving = true;
    }
    if (this.keys.d) {
      this.moveRight(step);
      this.isMoving = true;
    }
    if (this.keys.a) {
      this.moveRight(-step);
      this.isMoving = true;
    }
  }

  updateCamera() {
    if (this.isMoving) {
      this.headBobTimer += this.delta * 8;
    
      this.camera.position.y += Math.sin(this.headBobTimer) * 0.03;
    } else {
      // gradually return to base position when not moving
      let currentOffset = this.camera.position.y - this.baseYPosition;
      if (Math.abs(currentOffset) > 0.001) {
        this.camera.position.y -= currentOffset * 0.1;
      } else {
        this.camera.position.y = this.baseYPosition;
        this.headBobTimer = 0; 
      }
    }
  }

  moveForward(distance) {
    let direction = new Vector3();
    this.camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();

    let moveVec = direction.multiplyScalar(distance);
    let hasCollision = checkCollision(this.camera.position, moveVec, maze);

    if (!hasCollision) {
      this.camera.position.add(moveVec);
    }
  }

  moveRight(distance) {
    let direction = new Vector3();
    this.camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();

    let right = new Vector3();
    right.crossVectors(direction, this.camera.up);

    let moveVec = right.multiplyScalar(distance);
    let hasCollision = checkCollision(this.camera.position, moveVec, maze);

    if (!hasCollision) {
      this.camera.position.add(moveVec);
    }
  }
}

export const simplePlayer = () => {
  let cell_size = 1;
  let playerMesh = new Mesh(
    new BoxGeometry(cell_size, 0.5, cell_size),
    new MeshStandardMaterial({ color: 0xffa500 })
  );
  return playerMesh;
};