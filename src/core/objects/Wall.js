import {CanvasTexture, Matrix4, NearestFilter, Object3D, RepeatWrapping, Vector2, Vector3} from "three";
import {cache} from "../resources";
import {getPlane} from "./FormsGenerator";
import {MATERIAL_CHANGED_EVENT} from "../../const/Events";
import {in2cm} from "../../helpers/Dimensions";
import {Math as _Math} from "three";


class Wall extends Object3D {
    plane = getPlane(1, 1, cache.materials.DefaultWall);
    aspect = new Vector2(1.0, 1.0);
    alphaMapCanvas = document.createElement('canvas');
    alphaMapContext = this.alphaMapCanvas.getContext('2d');
    alphaMap = new CanvasTexture(this.alphaMapCanvas, undefined, RepeatWrapping, RepeatWrapping);
    holes = [];
    objects = [];
    holeContainer = new Object3D();
    isWall = true;

    constructor(size = new Vector2(1, 1), position = new Vector3(), rotation = new Vector3(), material) {
        super();

        this.alphaMap.magFilter = NearestFilter;
        this.alphaMap.needsUpdate = true;

        this.plane.addEventListener(MATERIAL_CHANGED_EVENT, () => this.updateAlphaMap());
        this.plane.setSize(size.x, size.y);

        this.add(this.plane);
        this.add(this.holeContainer);

        this.position.copy(position.clone());
        this.rotation.set(rotation.x, rotation.y, rotation.z);

        if (material) {
            this.plane.setMaterial(material);
        }
    }

    updateAlphaMap = () => {
        this.alphaMapContext = this.alphaMapCanvas.getContext('2d');

        this.alphaMapCanvas.width = _Math.ceilPowerOfTwo(this.plane.size.x / in2cm(1.0));
        this.alphaMapCanvas.height = _Math.ceilPowerOfTwo(this.plane.size.y / in2cm(1.0));

        this.aspect = this.alphaMapCanvas.width / this.alphaMapCanvas.height;

        this.alphaMapContext.fillStyle = 'rgba(255, 255, 255, 1.0)';
        this.alphaMapContext.fillRect(0, 0, this.alphaMapCanvas.width, this.alphaMapCanvas.height);

        this.alphaMapContext.fillStyle = 'rgba(0, 0, 0, 1.0)';

        let width, height, x, y;

        for (let hole of this.holes) {

            width = Math.ceil((hole.size.x / this.plane.size.x) * this.alphaMapCanvas.width) - 1;
            height = Math.ceil((hole.size.y / this.plane.size.y) * this.alphaMapCanvas.height) - 1;
            x = Math.ceil((hole.position.x / this.plane.size.x) * this.alphaMapCanvas.width);
            y = Math.ceil((hole.position.y / this.plane.size.y) * this.alphaMapCanvas.height);

            this.alphaMapContext.fillRect(
                x,
                this.alphaMapCanvas.height - y,
                width,
                height
            );
        }

        this.plane.mesh.material.alphaMap = this.alphaMap;
        this.plane.mesh.material.alphaMap.needsUpdate = true;
        this.plane.mesh.material.needsUpdate = true;
    };

    addHole = (pos, size, depth) => {
        let object = new Object3D();

        let plane1 = getPlane(depth, size.y, this.plane.material);
        plane1.rotation.set(0.0,Math.PI * 0.5, 0.0);
        plane1.position.set(
            0,
            0,
            0.0
        );

        let plane2 = plane1.clone();
        plane2.position.set(
            size.x,
            0.0,
            0.0
        );

        let plane3 = getPlane(size.x, depth, this.plane.material);
        plane3.rotation.x = Math.PI * 0.5;
        plane3.position.set(
            0,
            size.y,
            -depth
        );

        let plane4 = plane3.clone();
        plane4.position.set(
            0,
            0,
            -depth
        );

        object.add(plane1);
        object.add(plane2);
        object.add(plane3);
        object.add(plane4);

        object.position.set(pos.x, pos.y - size.y, 0);

        this.holes.push({
            position: pos.clone(),
            size: size.clone(),
            depth,
            object,
            planes: [plane1, plane2, plane3, plane4]
        });

        this.holeContainer.add(object);

        this.updateAlphaMap();

        return this.holes[this.holes.length - 1];
    };

    findNearestHoles = (currentHole) => {
        let left = null;
        let right = null;

        for(let hole of this.holes) {
            if (hole !== currentHole) {
                if (hole.position.x <= currentHole.position.x) {
                    if ((!left) || (left && left.position.x < hole.position.x)) {
                        left = hole;
                    }
                } else if (hole.position.x >= currentHole.position.x) {
                    if ((!right) || (right && right.position.x > hole.position.x)) {
                        right = hole;
                    }
                }
            }
        }

        return {
            left,
            right
        }
    };

    moveHole = (hole, pos) => {
        let oriented = this.getOrientedPos(pos);

        hole.object.position.set(
            oriented.x,
            oriented.y - hole.size.y,
            0.0
        );
        hole.position.set(
            oriented.x,
            oriented.y,
            0.0
        );

        this.updateAlphaMap();
    };

    getOrientedPos = (pos) => {
        let inverse = new Matrix4().getInverse(this.matrix);
        return pos.clone()
            .applyMatrix4(inverse);
    };

    getRealPos = (orientedPos) => {
        return orientedPos.clone()
            .applyMatrix4(this.matrix);
    };

    removeHole = (hole) => {
        this.holes = this.holes.filter((target) => {
            if (target === hole) {
                this.holeContainer.remove(target.object);

                return false;
            }

            return true;
        });
        this.updateAlphaMap();
    };
}

export default Wall;
