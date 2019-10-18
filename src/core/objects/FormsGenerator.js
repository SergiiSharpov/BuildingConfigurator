import {
    BoxBufferGeometry,
    BufferAttribute,
    DoubleSide,
    Mesh,
    MeshPhysicalMaterial, Object3D,
    PlaneBufferGeometry, Vector2, Vector3,
    ShaderChunk
} from "three";
import {cache, cloneMaterial, getMaterial} from "../resources";
import {MATERIAL_CHANGED_EVENT} from "../../const/Events";

ShaderChunk.alphamap_fragment = ShaderChunk.alphamap_fragment.replace('vUv', 'vUv2');
ShaderChunk.uv2_vertex = ShaderChunk.uv2_vertex.replace('defined( USE_LIGHTMAP )', 'defined( USE_LIGHTMAP ) || defined( USE_ALPHAMAP )');
ShaderChunk.uv2_pars_fragment = ShaderChunk.uv2_pars_fragment.replace('defined( USE_LIGHTMAP )', 'defined( USE_LIGHTMAP ) || defined( USE_ALPHAMAP )');
ShaderChunk.uv2_pars_vertex = ShaderChunk.uv2_pars_vertex.replace('defined( USE_LIGHTMAP )', 'defined( USE_LIGHTMAP ) || defined( USE_ALPHAMAP )');

class Plane extends Object3D {
    size = null;
    isBuildingPlane = true;

    constructor(width, height) {
        super();

        this.size = new Vector2(width, height);

        this.geometry = new PlaneBufferGeometry(width, height);
        let meshMaterial = new MeshPhysicalMaterial({
            color: 0xffffff,
            side: DoubleSide,
            envMap: cache.env
        });

        let uvs = this.geometry.attributes.uv.array.slice(0);
        this.geometry.addAttribute( 'uv2', new BufferAttribute(uvs, 2));

        this.mesh = new Mesh(this.geometry, meshMaterial);

        this.mesh.receiveShadow = true;
        this.mesh.castShadow = true;

        this.receiveShadow = true;
        this.castShadow = true;

        this.add(this.mesh);

        this.setSize(width, height);

        this.material = null;
    }

    clone() {
        let clone = new Plane(this.size.x, this.size.y);

        clone.position.copy(this.position);
        clone.rotation.copy(this.rotation);
        clone.scale.copy(this.scale);

        if (this.material) {
            clone.setMaterial(this.material);
        }

        return clone;
    }

    setSize(x, y) {
        this.size.set(x || this.size.x, y || this.size.y);

        this.geometry.parameters.width = this.size.x;
        this.geometry.parameters.height = this.size.y;

        let position = this.geometry.attributes.position.array;

        for(let i = 0; i < position.length; i += 3) {
            position[i] = (position[i] <= 0.0) ? 0.0 : this.size.x;
            position[i + 1] = (position[i + 1] <= 0.0) ? 0.0 : this.size.y;
        }

        if (this.material)
        this.setUVRepeat(this.material.mapping[0] * this.size.x, this.material.mapping[1] * this.size.y);
    }

    setMaterial(material = null) {
        this.material = (material) ? {...material} : this.material;

        this.mesh.material = this.material.object.clone();
        //if (this.mesh.material.alphaMap)
        //this.mesh.material.alphaMap = this.material.object.alphaMap.clone();

        this.setUVRepeat(this.material.mapping[0] * this.size.x, this.material.mapping[1] * this.size.y);

        this.dispatchEvent({type: MATERIAL_CHANGED_EVENT});
    }

    setUVRepeat(repeatX = 1.0, repeatY = 1.0) {

        let uvs = this.geometry.attributes.uv.array;
        let uvs2 = this.geometry.attributes.uv2.array;

        for (let i = 0; i < uvs.length; i += 2) {
            uvs[i] = (uvs[i] <= 0.0) ? 0 : repeatX;
            uvs[i + 1] = (uvs[i + 1] <= 0.0) ? 0 : repeatY;

            uvs2[i] = (uvs2[i] <= 0.0) ? 0 : 1.0;
            uvs2[i + 1] = (uvs2[i + 1] <= 0.0) ? 0 : 1.0;
        }

        this.geometry.attributes.uv.needsUpdate = true;
        this.geometry.attributes.uv2.needsUpdate = true;
    }
}

class Box extends Object3D {
    constructor(width, height, depth) {
        super();

        this.size = new Vector3(width, height, depth);

        this.geometry = new BoxBufferGeometry(width, height, depth);
        let meshMaterial = new MeshPhysicalMaterial({
            color: 0xffffff,
            side: DoubleSide,
            envMap: cache.env
        });

        this.UVOrigin = this.geometry.attributes.uv.array.slice(0);

        let uvs = this.geometry.attributes.uv.array;
        this.geometry.addAttribute( 'uv2', new BufferAttribute(uvs, 2));

        this.mesh = new Mesh(this.geometry, meshMaterial);
        this.add(this.mesh);

        this.material = null;
    }

    setSize(x, y, z) {
        this.size.set(x || this.size.x, y || this.size.y, z || this.size.z);
        this.mesh.geometry = new BoxBufferGeometry(this.size.x, this.size.y, this.size.z);

        //if (this.material) {
        this.setUVRepeat(this.material.mapping[0] * this.size.x, this.material.mapping[1] * this.size.y);
        //}
    }

    setMaterial(material = null) {
        this.material = material || this.material;

        this.mesh.material = this.material.object.clone();

        this.setUVRepeat(this.material.mapping[0] * this.size.x, this.material.mapping[1] * this.size.y);

        this.dispatchEvent({type: MATERIAL_CHANGED_EVENT});
    }

    setUVRepeat(repeatX = 1.0, repeatY = 1.0) {
        for ( let i = 0; i < this.geometry.attributes.uv.count * 2; i += 2 ) {
            this.mesh.geometry.attributes.uv.array[i] = this.UVOrigin[i] / (1.0 / repeatX);
            this.mesh.geometry.attributes.uv.array[i + 1] = this.UVOrigin[i + 1] / (1.0 / repeatY);

            if (this.mesh.geometry.attributes.uv2) {
                this.mesh.geometry.attributes.uv2.array[i] = this.mesh.geometry.attributes.uv.array[i];
                this.mesh.geometry.attributes.uv2.array[i + 1] = this.mesh.geometry.attributes.uv.array[i + 1];
            } else {
                let uvs = this.mesh.geometry.attributes.uv.array;
                this.mesh.geometry.addAttribute( 'uv2', new BufferAttribute(uvs, 2));
            }
        }
    }
}



export const getPlane = (width, height, material) => {
    let plane = new Plane(width, height);

    if (material) {
        plane.setMaterial(material);
    }

    return plane;
};

export const getBox = (width, height, depth, material) => {
    let box = new Box(width, height, depth);

    if (material) {
        box.setMaterial(material);
    }

    return box;
};

export const setMirrorMaterial = (current) => {
    current.traverse((target) => {
        if (target instanceof Mesh) {
            target.material.roughness = 0.025;
            target.material.metalness = 0.75;
            target.material.needsUpdate = true;
        }
    });
};

export const setRoughMaterial = (current) => {
    current.traverse((target) => {
        if (target instanceof Mesh) {
            target.material.roughness = 0.75;
            target.material.metalness = 0.2;
            target.material.reflectivity = 0.00;
            target.material.needsUpdate = true;
        }
    });
};

export const applyMaterial = (mesh, material) => {
    mesh.material.map = material.diffuse || null;
    mesh.material.normalMap = material.normal || null;
    mesh.material.roughnessMap = material.roughness || null;
    mesh.material.aoMap = material.ao || null;
};
