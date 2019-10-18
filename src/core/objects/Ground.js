import {Object3D} from "three";
import {getPlane, setRoughMaterial, setMirrorMaterial, applyMaterial} from "./FormsGenerator";
import {ft2cm, km2cm} from "../../helpers/Dimensions";
import {cache} from "../resources";


class Ground extends Object3D {
    plane = getPlane(
        km2cm(0.5),
        km2cm(0.5),
        cache.materials.DefaultGround
    );

    constructor() {
        super();

        this.plane.rotation.x = -Math.PI * 0.5;
        this.plane.position.set(
            km2cm(-0.25),
            0.0,
            km2cm(0.25)
        );
        this.plane.setMaterial();

        setRoughMaterial(this.plane.mesh);

        this.add(this.plane);

        this.receiveShadow = true;
    }
}

export default Ground;
