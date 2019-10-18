import {
    FogExp2, LinearToneMapping, Mesh, Object3D, PCFSoftShadowMap,
    PerspectiveCamera, Raycaster,
    ReinhardToneMapping,
    Scene,
    Uncharted2ToneMapping,
    Vector2, Vector3,
    WebGLRenderer
} from 'three';
import {Sky} from "../helpers/Sky";
import {cache} from "./resources";
import EventEmitter from './EventEmitter';
import OrbitControls from "../helpers/OrbitControls";
import {ft2cm, km2cm, m2cm} from "../helpers/Dimensions";
import Ground from "./objects/Ground";
import Sun from "./objects/Sun";
import Wall from "./objects/Wall";
import Building from "./objects/building/Building";
import {OFF_MODE, SELECT_STAGE_MODE} from "../const/Props";
import {STAGE_SELECTED_EVENT} from "../const/Events";

class Viewer extends EventEmitter {
    scene = new Scene();
    renderer = new WebGLRenderer({antialias: true});
    camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 999999);
    controls = new OrbitControls(this.camera, this.renderer.domElement);
    sky = new Sky();
    sun = new Sun();

    building = new Building();

    mouse = new Vector2();
    raycaster = new Raycaster();

    walls = [];

    parentElement = window;
    framesToRender = 1;
    shouldRender = () => {
        this.framesToRender++;
    };

    get canvas() {
        return this.renderer.domElement;
    }

    update = () => {
        let [width, height] = [window.innerWidth, window.innerHeight];

        if (this.parentElement !== window) {
            width = this.parentElement.clientWidth;
            height = this.parentElement.clientHeight;
        }

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);

        this.shouldRender();
    };

    onMouseMove = (event) => {
        this.mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        if (this.building) {
            this.building._onMouseMove(this.raycaster);

            this.shouldRender();
        }

        return false;
    };

    onMouseDown = () => {
       if (this.building) {
            this.building._onMouseDown(this.raycaster);

            this.shouldRender();
        }

        return false;
    };

    render = () => {
        requestAnimationFrame(this.render);

        if (this.framesToRender > 0) {
            this.framesToRender = 0;

            this.controls.update();
            this.renderer.render(this.scene, this.camera);
        }
    };

    constructor() {
        super();

        this.renderer.physicallyCorrectLights = true;
        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;
        this.renderer.shadowMap.enabled = true;
        this.renderer.toneMapping = Uncharted2ToneMapping;
        this.renderer.toneMappingExposure = 2.0;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = PCFSoftShadowMap;

        this.render();

        this.controls.maxPolarAngle = Math.PI * 0.45;
        this.controls.minDistance = km2cm(0.0005);
        this.controls.maxDistance = km2cm(0.1);
        this.controls.enablePan = false;
        this.controls.addEventListener('change', () => {
            this.shouldRender();
        });

        this.renderer.domElement.addEventListener('mousemove', this.onMouseMove, false);
        this.renderer.domElement.addEventListener('dragover', (event) => event.preventDefault(), false);
        this.renderer.domElement.addEventListener('dragover', this.onMouseMove, false);
        this.renderer.domElement.addEventListener('mousedown', this.onMouseDown, false);
        this.renderer.domElement.addEventListener('drop', this.onMouseDown, false);

        this.camera.position.set(0, m2cm(1), -m2cm(5));

        this.controls.update();

        this.sky.scale.setScalar(450000);
        this.scene.add(this.sky);

        this.scene.fog = new FogExp2(0x8f9a9f, 0.00005);
        this.scene.background = cache.env;

        this.#updateSun();

        this.scene.add(new Ground());

        this.scene.add(this.sun);
        this.scene.add(this.building);

        this.controls.clampInstance(this.building, this.sun.dirLight);

        this.building.addEventListener(STAGE_SELECTED_EVENT, () => this.dispatch({type: STAGE_SELECTED_EVENT}));
    }

    createEmptyBuilding = (width, depth, stageHeight, stages, material) => {
        if (this.building) {
            this.scene.remove(this.building);
            //this.building.dispose();
        }

        this.building = new Building(
            ft2cm(Math.max(4.0, width)),
            ft2cm(Math.max(4.0, depth)),
            ft2cm(Math.max(8.0, stageHeight)),
            stages,
            material
        );
        this.scene.add(this.building);

        this.building.addEventListener(STAGE_SELECTED_EVENT, () => this.dispatch({type: STAGE_SELECTED_EVENT}));

        this.controls.clampInstance(this.building, this.sun.dirLight);

        this.shouldRender();
    };

    getInstance = (name) => {
        if (cache.models[name]) {
            return cache.models[name].clone();
        }

        return null;
    };

    getMaterial = (name) => {
        if (cache.materials[name]) {
            return cache.materials[name];
        }

        return null;
    };

    setRoofMaterial = (material) => {
        this.building.setRoofMaterial(material);
        this.shouldRender();
    };

    setStageMaterial = (stage, material) => {
        this.building.setStageMaterial(stage, material);
        this.shouldRender();
    };

    setStageSelectMode = (select) => {
        this.building.selectMode = (select) ? SELECT_STAGE_MODE : OFF_MODE;
        this.building.selectStage((select) ? this.building.selectedStage : null);
    };

    setStageHeight = (stage, height) => {
        stage.setHeight(ft2cm(height));

        this.building._updateWalls();
        this.building._updateOverallHeight();

        this.building.selectStage(stage);
        this.shouldRender();
    };

    getStagePlan = (stage) => {
        if (!stage) {
            return false;
        }

        this.building.getWallPlan(stage.walls[0], stage.number, 0);
        this.building.getWallPlan(stage.walls[1], stage.number, 1);
        this.building.getWallPlan(stage.walls[2], stage.number, 2);
        this.building.getWallPlan(stage.walls[3], stage.number, 3);
    };

    #updateSun = () => {
        let distance = 400000;
        let uniforms = this.sky.material.uniforms;
        uniforms[ "turbidity" ].value = 10.0;
        uniforms[ "rayleigh" ].value = 2.0;
        uniforms[ "mieCoefficient" ].value = 0.005;
        uniforms[ "mieDirectionalG" ].value = 0.8;
        uniforms[ "luminance" ].value = 1.0;

        let theta = Math.PI * (0.388 - 0.5);
        let phi = 2 * Math.PI * (0.25 - 0.5);

        uniforms[ "sunPosition" ].value.x = distance * Math.cos( phi );
        uniforms[ "sunPosition" ].value.y = distance * Math.sin( phi ) * Math.sin( theta );
        uniforms[ "sunPosition" ].value.z = distance * Math.sin( phi ) * Math.cos( theta );
    }
}

export default Viewer;
