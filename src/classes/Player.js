import {
  Vector3,
} from "three";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
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
    this.moveSpeed = 20.0;
    this.collisionEnabledFn = collisionEnabledFn;
    this.position = this.camera.position || new Vector3();
    this.rotation = new Vector3();
    this.headBobTimer = 0;
    this.baseYPosition = this.camera.position.y;
    this.isMoving = false; 
  }

  update(delta) {
    if (!this.controls || !this.controls.isLocked || !this.keys) return;

    this.updateMovement(delta);
    this.updateCamera(delta);
  }

  updateMovement(delta) {
    let step = this.moveSpeed * delta;
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

  updateCamera(delta) {
    if (this.isMoving) {
      this.headBobTimer += delta * 8;
    
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
