import {Object3D, Vector2, Vector3} from "three";
import {cache} from "../../resources";
import Wall from "../Wall";
import {wallXOffset} from "../../../const/Sizes";


class Roof extends Object3D {
    material = cache.materials.DefaultFloor;
    walls = [];

    constructor(width, depth, material) {
        super();

        this.material = material || this.material;

        let doubleOffset = wallXOffset * 2.0;
        let halfPi = Math.PI * 0.5;
        let Pi = Math.PI;

        let plane1 = new Wall(
            new Vector2(width, doubleOffset),
            new Vector3(0, 0, 0),
            new Vector3(-halfPi, 0, 0),
            this.material
        );
        let plane12 = new Wall(
            new Vector2(width, doubleOffset),
            new Vector3(0, -doubleOffset, -doubleOffset),
            new Vector3(0, 0, 0),
            this.material
        );

        let plane2 = new Wall(
            new Vector2(width, doubleOffset),
            new Vector3(width, 0, -depth),
            new Vector3(halfPi, Pi, 0),
            this.material
        );
        let plane22 = new Wall(
            new Vector2(width, doubleOffset),
            new Vector3(width, -doubleOffset, -depth + doubleOffset),
            new Vector3(0, Pi, 0),
            this.material
        );

        let plane3 = new Wall(
            new Vector2(depth, doubleOffset),
            new Vector3(0, 0, -depth),
            new Vector3(halfPi, Pi, halfPi),
            this.material
        );
        let plane32 = new Wall(
            new Vector2(depth, doubleOffset),
            new Vector3(doubleOffset, 0, -depth),
            new Vector3(halfPi, halfPi, halfPi),
            this.material
        );

        let plane4 = new Wall(
            new Vector2(depth, doubleOffset),
            new Vector3(width, 0, 0),
            new Vector3(-halfPi, 0, halfPi),
            this.material
        );
        let plane42 = new Wall(
            new Vector2(depth, doubleOffset),
            new Vector3(width - doubleOffset, 0, 0),
            new Vector3(-halfPi, -halfPi, halfPi),
            this.material
        );

        let plane5 = new Wall(
            new Vector2(width - doubleOffset * 2.0, depth - doubleOffset * 2.0),
            new Vector3(doubleOffset, -doubleOffset, -doubleOffset),
            new Vector3(-halfPi, 0, 0),
            this.material
        );


        this.add(plane1);
        this.add(plane12);

        this.add(plane2);
        this.add(plane22);

        this.add(plane3);
        this.add(plane32);

        this.add(plane4);
        this.add(plane42);

        this.add(plane5);

        this.walls = this.children.slice(0);
    }

}

export default Roof;
