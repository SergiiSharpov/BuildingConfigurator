import {in2cm} from "./Dimensions";

export const clamp = (min, max, value) => {
    return Math.max(min, Math.min(value, max));
};

export const gridAlign = (vec, gridSize = in2cm(12)) => {
    let pos = vec.clone().divideScalar(gridSize);
    pos.set(
        Math.round(pos.x),
        Math.round(pos.y),
        Math.round(pos.z)
    );

    return pos.multiplyScalar(gridSize);
};
