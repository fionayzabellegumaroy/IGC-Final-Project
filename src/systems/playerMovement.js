import { Vector3 } from "three";
import { checkCollision, maze } from "../core";

export class PlayerMovement {
  constructor(camera, controls, keys, collisionEnabledFn = () => true) {
    this.camera = camera;
    this.controls = controls;
    this.keys = keys;
    this.moveSpeed = 5.0;
    this.delta = 0.016;
    this.collisionEnabledFn = collisionEnabledFn;
  }

  update() {
    // Debug: check if this is being called
    // console.log('UPDATE METHOD ENTERED'); // Very first line
    // console.log('=== UPDATE DEBUG ===');
    // console.log('this.controls:', this.controls);
    console.log("this.controls.isLocked:", this.controls?.isLocked);
    // console.log('this.keys:', this.keys);

    if (!this.controls || !this.controls.isLocked || !this.keys) return;

    const step = this.moveSpeed * this.delta;

    if (this.keys.w) {
      console.log("W pressed, moving forward");
      this.moveForward(step);
    }
    if (this.keys.s) {
      console.log("S pressed, moving backward");
      this.moveForward(-step);
    }
    if (this.keys.d) {
      console.log("D pressed, moving right");
      this.moveRight(step);
    }
    if (this.keys.a) {
      console.log("A pressed, moving left");
      this.moveRight(-step);
    }
  }

  moveForward(distance) {
    const direction = new Vector3();
    this.camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();

    const moveVec = direction.multiplyScalar(distance);

    console.log("Direction:", direction);
    console.log("MoveVec:", moveVec);
    console.log("Target position would be:", {
      x: this.camera.position.x + moveVec.x,
      z: this.camera.position.z + moveVec.z,
    });

    const collisionEnabled =
      typeof this.collisionEnabledFn === "function"
        ? this.collisionEnabledFn()
        : true;
    const hasCollision = checkCollision(this.camera.position, moveVec, maze);

    console.log(
      "Move forward - collision:",
      hasCollision,
      "position before:",
      this.camera.position.clone()
    );

    if (!collisionEnabled || !hasCollision) {
      this.camera.position.add(moveVec);
      console.log("Position after:", this.camera.position.clone());
    } else {
      console.log("Movement blocked by collision");
    }
  }

  moveRight(distance) {
    const direction = new Vector3();
    this.camera.getWorldDirection(direction);
    direction.y = 0;

    const right = new Vector3();
    right.crossVectors(direction, this.camera.up).normalize();

    const moveVec = right.multiplyScalar(distance);

    const collisionEnabled =
      typeof this.collisionEnabledFn === "function"
        ? this.collisionEnabledFn()
        : true;
    const hasCollision = checkCollision(this.camera.position, moveVec, maze);

    console.log("Move right - collision:", hasCollision);

    if (!collisionEnabled || !hasCollision) {
    this.camera.position.add(moveVec);
    } else {
      console.log('Movement blocked by collision');
    }
  }
}
