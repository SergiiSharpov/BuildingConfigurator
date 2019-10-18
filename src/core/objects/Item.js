import {Box3, Object3D, Vector3} from "three";


class Item extends Object3D {
    model = null;
    box = new Box3();
    size = new Vector3();
    center = new Vector3();

    currentWall = null;
    currentStage = null;

    currentHole = null;

    constructor(model, box) {
        super();

        this.model = model.clone();
        this.add(this.model);

        if (box) {
            this.box.copy(box);
        } else {
            this.box.setFromObject(this.model);
        }

        this.box.getSize(this.size);
        this.box.getCenter(this.center);
    }

    setCurrentWall = (wall) => {
        if (this.currentWall && this.currentHole && this.currentWall !== wall) {
            this.currentWall.removeHole(this.currentHole);
            this.currentWall.remove(this);
        }

        if (this.currentWall !== wall && wall) {
            this.currentWall = wall;
            this.currentWall.add(this);

            if (wall.objects.indexOf(this) === -1) {
                wall.objects.push(this);
            }

            let pos = this.position.clone();

            this.currentHole = wall.addHole(
                pos,
                this.size,
                -this.box.min.z,
            );
        }
    };

    clone = () => {
        return new Item(this.model, this.box);
    }
}

export default Item;
