import { Vector3 } from "three";
import { checkCollision, maze } from "../core";

export class PlayerMovement {
  constructor(camera, controls, keys, collisionEnabledFn = () => true) {
    this.camera = camera;
    this.controls = controls;
    this.keys = keys;
    this.moveSpeed = 8.0;
    this.delta = 0.016;
    this.collisionEnabledFn = collisionEnabledFn;
  }

  update() {
    if (!this.controls || !this.controls.isLocked || !this.keys) return;

    const step = this.moveSpeed * this.delta;

    if (this.keys.w) {
      this.moveForward(step);
    }
    if (this.keys.s) {
      this.moveForward(-step);
    }
    if (this.keys.d) {
      this.moveRight(step);
    }
    if (this.keys.a) {
      this.moveRight(-step);
    }
  }

  moveForward(distance) {
    const direction = new Vector3(); // creates a new vector
    this.camera.getWorldDirection(direction); // fils direction with the diretion camera is looking at
    direction.y = 0; // zeroing y component removes vertical part so movement is confined to the x/z plane since this is first-person
    direction.normalize();

    const moveVec = direction.multiplyScalar(distance); // displacement vector of what you want to add to the camera pos.

    const hasCollision = checkCollision(this.camera.position, moveVec, maze);

    if (!hasCollision) {
      this.camera.position.add(moveVec);
    }
  }

  moveRight(distance) {
    const direction = new Vector3();
    this.camera.getWorldDirection(direction);
    direction.y = 0;

    const right = new Vector3();
    right.crossVectors(direction, this.camera.up).normalize();

    const moveVec = right.multiplyScalar(distance);

    const hasCollision = checkCollision(this.camera.position, moveVec, maze);

    if (!hasCollision) {
      this.camera.position.add(moveVec);
    } 
  }
}
