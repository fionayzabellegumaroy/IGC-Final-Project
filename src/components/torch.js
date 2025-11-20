import { PointLight } from 'three';

export const torch = () => {
    let torchLight = new PointLight(
      0xf8e17a,
      10.0, // intensity
      30, // range/distance
      1.5 // decay (how quickly it falls off)
    );

    torchLight.castShadow = true;
    torchLight.shadow.mapSize.width = 1024;
    torchLight.shadow.mapSize.height = 1024;
    torchLight.shadow.camera.near = 0.1;
    torchLight.shadow.camera.far = 15;

    torchLight.position.set(0.5, -0.2, 0.5); // position it slightly in front of and to the side of camera
    
    return torchLight;
}
