//basic pattern for most of our new modules
import { Scene } from 'three';

function createScene() {
    const scene = new Scene();
    return scene;
}

export { createScene }