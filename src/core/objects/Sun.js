import {AmbientLight, CameraHelper, DirectionalLight, DirectionalLightHelper, Object3D} from "three";

class Sun extends Object3D {
    light = new AmbientLight(0xf0eae0, 1.0);
    dirLight = new DirectionalLight(0x808092, 1.0);

    constructor() {
        super();

        this.add(this.light);
        this.add(this.dirLight);

        this.dirLight.shadow.bias = -0.008;
        this.dirLight.shadow.camera.far = 10000;
        this.dirLight.shadow.mapSize.width = 2048;
        this.dirLight.shadow.mapSize.height = 2048;

        this.dirLight.castShadow = true;

        this.add(this.dirLight.target);
        this.dirLight.target.position.set(1000, 0, 0);
    }
}

export default Sun;
