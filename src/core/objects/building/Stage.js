import {
    AlwaysDepth, BoxBufferGeometry,
    BoxGeometry,
    BoxHelper, DoubleSide,
    Mesh,
    MeshBasicMaterial,
    NeverDepth,
    Object3D,
    Vector2,
    Vector3
} from "three";
import {cache} from "../../resources";
import Wall from "../Wall";
import {HOVERED_COLOR, SELECTED_COLOR} from "../../../const/Props";
import {m2cm} from "../../../helpers/Dimensions";


class Stage extends Object3D {
    isStage = true;

    walls = [];
    number = 1;

    container = new Object3D();

    isSelected = false;

    width = 1;
    height = 1;
    depth = 1;
    baseMaterial = null;

    constructor(width, height, depth, material) {
        super();

        this.baseMaterial = material;
        this.add(this.container);

        this.setSize(width, height, depth);
    }

    setSize(width, height, depth) {
        this.width = width;
        this.height = height;
        this.depth = depth;

        this.generateStage();
    }

    setHeight(height) {
        this.height = height;

        this.generateStage();
    }

    generateStage() {
        let width = this.width;
        let height = this.height;
        let depth = this.depth;

        let wall1 = new Wall(
            new Vector2(width, height),
            new Vector3(0, 0, 0),
            new Vector3(0, 0, 0),
            (this.walls.length) ? this.walls[0].material : this.baseMaterial
        );

        let wall2 = new Wall(
            new Vector2(depth, height),
            new Vector3(width, 0, 0),
            new Vector3(0, Math.PI * 0.5, 0),
            (this.walls.length) ? this.walls[1].material : this.baseMaterial
        );

        let wall3 = new Wall(
            new Vector2(width, height),
            new Vector3(width, 0, -depth),
            new Vector3(0, Math.PI, 0),
            (this.walls.length) ? this.walls[2].material : this.baseMaterial
        );

        let wall4 = new Wall(
            new Vector2(depth, height),
            new Vector3(0, 0, -depth),
            new Vector3(0, Math.PI * 1.5, 0),
            (this.walls.length) ? this.walls[3].material : this.baseMaterial
        );

        this.walls = [wall1, wall2, wall3, wall4];

        while (this.container.children.length) {
            this.container.remove(this.container.children[0]);
        }

        this.container.add(wall1);
        this.container.add(wall2);
        this.container.add(wall3);
        this.container.add(wall4);
    }

    set selected(value) {
        this.traverse((obj) => {
            if (obj instanceof Mesh) {
                obj.material.emissive.set(value ? SELECTED_COLOR : 0x000000);
                obj.material.emissiveIntensity = 0.05;
            }
        });

        this.isSelected = value;
    }

    set hovered(value) {
        if (this.isSelected) {
            return false;
        }

        this.traverse((obj) => {
            if (obj instanceof Mesh) {
                obj.material.emissive.set(value ? HOVERED_COLOR : 0x000000);
                obj.material.emissiveIntensity = 0.05;
            }
        });
    }
}

export default Stage;

