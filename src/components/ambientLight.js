import { AmbientLight } from "three";

export const ambientLight = () => {
    let light = new AmbientLight(0x404040, 0.5);
    return light;
}
