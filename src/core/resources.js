import {
    CubeTexture,
    MeshBasicMaterial,
    PlaneBufferGeometry,
    Scene,
    Mesh,
    Camera,
    WebGLRenderer,
    Texture,
    RepeatWrapping, MeshPhysicalMaterial, DoubleSide, Box3
} from "three";
import path from "path";
import ViewerLoader from "../base";
import Item from './objects/Item';
import {OBJLoader} from "../helpers/OBJLoader";
import {setMirrorMaterial, setRoughMaterial} from "./objects/FormsGenerator";

export const cache = {
    env: new CubeTexture(),
    textures: {},
    materials: {},
    models: {}
};

const ModelLoader = new OBJLoader();

export const forceTextureInit = (() => {
    const material = new MeshBasicMaterial();
    const geometry = new PlaneBufferGeometry();
    const scene = new Scene();
    scene.add(new Mesh(geometry, material));
    const camera = new Camera();
    const renderer = new WebGLRenderer();

    return function forceTextureInit(map = null, envMap = null) {
        material.map = map;
        scene.background = envMap;
        renderer.render(scene, camera);
    };
})();

const loadModels = (models, classInstance, onProgress) => {
    let names = Object.keys(models);
    let modelPath;

    let promises = [];
    let loaded = 0;

    onProgress({
        message: `Loading models ${loaded} of ${names.length}`
    });

    for (let modelName of names) {
        modelPath = models[modelName];
        promises.push(
            new Promise((resolve, reject) => {
                ModelLoader.load(
                    './' + path.resolve(ViewerLoader.assetsPath, modelPath),
                    (object) => {
                        loaded++;

                        onProgress({
                            message: `Loading models ${loaded} of ${names.length}`
                        });

                        object.rotateY(Math.PI * 0.5);

                        object.traverse((obj) => {
                            if (obj instanceof Mesh) {
                                if (obj.name.match(/glass/i)) {
                                    obj.material = cache.materials.DefaultGlass.object.clone();
                                } else {
                                    obj.material = cache.materials.DefaultPlastic.object.clone();
                                }
                            }
                        });

                        cache.models[modelName] = new classInstance(object);

                        resolve();
                    },
                    undefined,
                    reject
                )
            })
        );
    }

    return Promise.all(promises);
};

const loadImage = (imgPath) => {
    return new Promise((resolve, reject) => {
        fetch(imgPath)
            .then(response => response.blob())
            .then(imageData => {
                let image = document.createElement('img');

                image.onload = () => resolve(image);

                image.src = URL.createObjectURL(imageData);
            })
            .catch(reject)
    });
};

const loadEnv = (mapsPath, onProgress) => {
    let promises = mapsPath.map((envMap, i) => {
        return loadImage('./' + path.resolve(ViewerLoader.assetsPath, envMap));
    });

    onProgress({
        message: 'Loading environment maps...'
    });

    return Promise.all(promises).then((images) => {
        cache.env.image = images;
        cache.env.needsUpdate = true;

        return Promise.resolve();
    });
};

const loadMaterials = (materials) => {
    let names = Object.keys(materials);
    let maps, object;

    for (let materialName of names) {
        cache.materials[materialName] = {
            ...materials[materialName],
            name: materialName,
            object: new MeshPhysicalMaterial({
                side: DoubleSide,
                envMap: cache.env,
                transparent: true,
                alphaTest: 0.1,
                color: materials[materialName].color || 'white'
            })
        };

        maps = cache.textures[materials[materialName].maps];
        object = cache.materials[materialName].object;

        if (maps) {
            object.map = maps.diffuse || null;
            object.normalMap = maps.normal || null;
            //object.roughnessMap = maps.roughness || null;
        }

        let target = cache.materials[materialName].object;

        if (materials[materialName].isGlass) {
            target.roughness = 0.045;
            target.metalness = 0.75;
            target.needsUpdate = true;
        } else if (materials[materialName].isMetal) {
            target.roughness = 0.025;
            target.metalness = 0.75;
            target.reflectivity = 0.4;
            target.needsUpdate = true;
        } else {
            target.roughness = 0.75;
            target.metalness = 0.2;
            target.reflectivity = 0.00;
            target.needsUpdate = true;
        }
    }

    return Promise.resolve();
};

const loadTextures = (textures, onProgress) => {
    let loadedTextures = {};
    let promises = [];

    let names = Object.keys(textures);
    let textureTypes;
    let loaded = 0;

    for (let textureName of names) {
        loadedTextures[textureName] = {};

        cache.textures[textureName] = {};

        textureTypes = Object.keys(textures[textureName]);
        for(let textureType of textureTypes) {

            let promise = loadImage('./' + path.resolve(ViewerLoader.assetsPath, textures[textureName][textureType]))
                .then((image) => {
                    cache.textures[textureName][textureType] = new Texture(
                        image,
                        undefined,
                        RepeatWrapping,
                        RepeatWrapping
                    );

                    loaded++;

                    onProgress({
                        message: `Loading textures ${loaded} of ${names.length * textureTypes.length}`
                    });

                    cache.textures[textureName][textureType].needsUpdate = true;
                });

            promises.push(promise);
        }
    }

    return Promise.all(promises);
};

export const load = (onProgress = () => {}) => {
    return fetch('./' + path.resolve(ViewerLoader.assetsPath, 'resources.json'))
        .then((response) => response.json())
        .then((data) => {
            return loadEnv(data.maps.env, onProgress)
                .then(() => loadTextures(data.maps.textures, onProgress))
                .then(() => loadMaterials(data.materials, onProgress))
                .then(() => loadModels(data.models.windows, Item, onProgress));
        });
};

export const getMaterial = (name) => {
    if (!cache.materials[name]) {
        return null;
    }

    let material = cache.materials[name];
    let object = material.object.clone();

    if (object.map) {
        object.map = object.map.clone();
    }

    if (object.normalMap) {
        object.normalMap = object.normalMap.clone();
    }

    material.object = object;

    return material;
};

export const cloneMaterial = (material) => {
    return getMaterial(material.name);
};
