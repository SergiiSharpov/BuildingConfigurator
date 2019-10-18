import {Object3D, Vector3} from "three";
import {cache} from "../../resources";
import {ft2cm} from "../../../helpers/Dimensions";
import Stage from "./Stage";
import Roof from "./Roof";
import {DRAG_ITEM_MODE, OFF_MODE, SELECT_STAGE_MODE} from "../../../const/Props";
import {clamp, gridAlign} from "../../../helpers/Math";
import {wallXOffset, wallYOffset} from "../../../const/Sizes";
import {STAGE_SELECTED_EVENT} from "../../../const/Events";
import {drawTextRotated, fillArrow, getArrowLine, strokeLine} from "../../../helpers/Canvas";


class Building extends Object3D {
    roof = null;

    walls = [];
    stages = [];

    windows = [];
    doors = [];

    objects = new Set();

    selectMode = OFF_MODE;
    currentDrag = null;

    currentWall = null;
    currentStage = null;

    lastSelectedStage = null;
    selectedStage = null;

    mouseRealCoord = new Vector3();

    lastSelectedItem = null;
    selectedItem = null;

    stagesCount = 0;

    defaultMaterial = cache.materials.Default;
    defaultStageHeight = ft2cm(8);
    defaultStageCount = 2;

    width = ft2cm(40);
    depth = ft2cm(16);

    overallHeight = this.defaultStageCount * this.defaultStageHeight;

    constructor(width, depth, stageHeight, stages, material) {
        super();

        this.defaultStageHeight = stageHeight || this.defaultStageHeight;
        this.defaultStageCount = stages || this.defaultStageCount;
        this.defaultMaterial = material || this.defaultMaterial;

        this.stagesCount = this.defaultStageCount;

        this.width = width || this.width;
        this.depth = depth || this.depth;

        for (let i = 0; i < this.defaultStageCount; i++) {
            let stage = new Stage(this.width, this.defaultStageHeight, this.depth, this.defaultMaterial);
            stage.number = i;

            stage.position.y = i * this.defaultStageHeight;

            this.stages.push(stage);
            this.add(stage);
        }

        this._updateWalls();

        this.roof = new Roof(this.width, this.depth);

        this.add(this.roof);

        this._updateOverallHeight();

        window.addEventListener('mouseup', () => {
            if (this.selectMode === DRAG_ITEM_MODE) {
                this._finishDrag();
            }
        });

        window.addEventListener('drop', () => {
            if (this.selectMode === DRAG_ITEM_MODE) {
                this._finishDrag();
            }
        });
    }

    _finishDrag = () => {
        this.selectMode = OFF_MODE;

        this._updateObjects();

        this.setDrag(null);
    };

    _updateObjects = () => {
        this.objects = [];

        this.stages.forEach((stage) => {
            stage.walls.forEach((wall) => {
                console.log(wall.objects.length);
                wall.objects = wall.objects.filter((obj) => obj.currentWall === wall);

                this.objects = this.objects.concat(wall.objects);
            });
        });
    };

    setDrag = (object) => {
        this.selectMode = (object) ? DRAG_ITEM_MODE : OFF_MODE;

        this.currentDrag = object;
    };

    getStage = (number) => {
        for (let target of this.stages) {
            if (target.number === number) {
                return target;
            }
        }
    };

    removeSelectedStage = () => {
        this.removeStage(this.selectedStage);
    };

    setStageHeight = (stage, height) => {
        if (!stage) {
            return false;
        }

        stage.setHeight(height);

        this._updateWalls();

        this._updateOverallHeight();
    };

    setStageMaterial = (stage, material) => {
        if (!stage || !material) {
            return false;
        }

        stage.walls.forEach((wall) => {
            wall.plane.setMaterial(material);
            wall.holes.forEach((hole) => {
                hole.planes.forEach((plane) => {
                    plane.setMaterial(material);
                });
            });
        });
    };

    setRoofMaterial = (material) => {
        if (!material) {
            return false;
        }

        this.roof.walls.forEach((wall) => {
            wall.plane.setMaterial(material);
        });
    };

    _updateWalls = () => {
        this.walls = this.stages.map((stage) => {
            return stage.walls.map((wall) => {
                return wall.plane;
            })
        }).flat();
    };

    _updateOverallHeight = () => {
        let targetHeight = 0;

        for (let target of this.stages) {
            target.position.y = targetHeight;
            targetHeight += target.height;
        }

        this.overallHeight = targetHeight;
        this._updateRoof();
    };

    _updateRoof = () => {
        this.roof.position.y = this.overallHeight;
    };

    removeStage = (stage) => {
        if (this.stages.length === 1) {
            return false;
        }

        let n = stage.number;

        this.stages.splice(n, 1);

        let targetStage = 0;
        let targetHeight = 0;

        for (let target of this.stages) {
            target.position.y = targetHeight;
            target.number = targetStage;

            targetHeight += target.height;
            targetStage += 1;
        }

        this.stagesCount = targetStage;

        this.remove(stage);

        this.walls = this.stages.map((stage) => {
            return stage.walls.map((wall) => {
                return wall.plane;
            })
        }).flat();

        this._updateOverallHeight();
    };

    addStage = (number, height) => {
        let stage = new Stage(this.width, height || this.defaultStageHeight, this.depth, this.defaultMaterial);
        stage.number = number;

        this.stages = this.stages.map((currentStage, i) => {
            if (i >= number) {
                currentStage.number = i + 1;
            } else {
                currentStage.number = i;
            }

            return currentStage;
        });

        this.stages.splice(number, 0, stage);

        this.add(stage);

        this.walls = this.stages.map((stage) => {
            return stage.walls.map((wall) => {
                return wall.plane;
            })
        }).flat();

        this._updateOverallHeight();
    };

    _onMouseMove = (raycaster) => {
        switch (this.selectMode) {
            case SELECT_STAGE_MODE:
                this._onSelectStage(raycaster, this.hoverStage);
                break;
            case DRAG_ITEM_MODE:
                this._onItemDrag(raycaster);
                break;
        }
    };

    _onMouseDown = (raycaster) => {
        switch (this.selectMode) {
            case SELECT_STAGE_MODE:
                this._onSelectStage(raycaster, this.selectStage);
                break;
            case DRAG_ITEM_MODE:
                this._finishDrag();
                break;
        }
    };

    _updateCurrentWall = (raycaster) => {
        let intersects = raycaster.intersectObjects(this.walls, true);

        this.currentWall = null;
        this.currentStage = null;

        if (intersects.length) {
            let target = intersects[0].object;
            this.mouseRealCoord.copy(intersects[0].point);

            while (!target.isBuildingPlane && target.parent !== null) {
                target = target.parent;
            }

            if (!target.isBuildingPlane) {
                return false;
            }

            while (!(target.isWall) && target.parent !== null) {
                target = target.parent;
            }

            if (!target.isWall) {
                return false;
            }

            this.currentWall = target;

            while (!target.isStage && target.parent !== null) {
                target = target.parent;
            }

            if (target.isStage) {
                this.currentStage = target;
            }
        }
    };

    _onItemDrag = (raycaster) => {
        if (!this.currentDrag) {
            return false;
        }

        this._updateCurrentWall(raycaster);

        if (!this.currentWall) {
            this.currentDrag.setCurrentWall(null);

            return false;
        }

        if (this.currentWall && this.currentDrag.size.y >= this.currentWall.plane.size.y) {
            return false;
        }

        this.currentDrag.setCurrentWall(this.currentWall);

        let mpos = this.mouseRealCoord.clone();
        mpos.set(mpos.x, mpos.y - this.currentStage.position.y, mpos.z);

        let pos = this.currentWall.getOrientedPos(mpos);
        pos.y -= (this.currentDrag.size.y / 2.0);

        pos = gridAlign(pos);

        pos.set(
            clamp(
                wallXOffset + this.currentDrag.box.max.x,
                this.currentWall.plane.size.x - this.currentDrag.size.x - wallXOffset - this.currentDrag.box.min.x,
                pos.x
            ),
            clamp(
                0.0,
                this.currentWall.plane.size.y - this.currentDrag.size.y - wallYOffset,
                pos.y
            ),
            0.0
        );

        this.currentDrag.position.set(pos.x, pos.y, 0.0);

        pos.x = pos.x + this.currentDrag.box.min.x;

        mpos = this.currentWall.getRealPos(pos);
        mpos.y += this.currentDrag.size.y;

        this.currentWall.moveHole(
            this.currentDrag.currentHole,
            mpos
        );
    };

    _onSelectStage = (raycaster, func) => {
        let intersects = raycaster.intersectObjects(this.stages, true);

        if (intersects.length) {
            let target = intersects[0].object;
            while (!(target instanceof Stage) && target.parent !== null) {
                target = target.parent;
            }

            if (!(target instanceof Stage)) {
                func(null);

                return false;
            }

            func(target);

            return false;
        }

        func(null);
    };

    selectStage = (stage) => {
        if (stage) {
            this.lastSelectedStage = this.selectedStage;
        }

        for (let target of this.stages) {
            target.selected = (stage === target);
        }

        this.selectedStage = stage;
        this.currentStage = stage;

        this.dispatchEvent({
            type: STAGE_SELECTED_EVENT
        })
    };

    hoverStage = (stage) => {
        for (let target of this.stages) {
            target.hovered = (stage === target);
        }
    };

    getWallPlan = (wall, stageNumber, wallNumber) => {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');

        let fontSize = 13;
        let offset = 24;
        let doubleOffset = offset * 2.0;

        canvas.width = wall.plane.size.x + doubleOffset;
        canvas.height = wall.plane.size.y + doubleOffset;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#000000';
        ctx.strokeStyle = '#000000';
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";

        ctx.strokeWidth = 2;

        ctx.strokeRect(offset, offset, canvas.width - doubleOffset, canvas.height - doubleOffset);

        drawTextRotated(ctx, (canvas.width * 0.5), offset, 0.0, (wall.plane.size.x / 30.48).toFixed(2) + "'");
        drawTextRotated(ctx, (canvas.width * 0.5), canvas.height - offset + fontSize + 2, 0.0, (wall.plane.size.x / 30.48).toFixed(2) + "'");
        drawTextRotated(ctx, offset - fontSize - 2, (canvas.height * 0.5), Math.PI * 0.5, (wall.plane.size.y / 30.48).toFixed(2) + "'");
        drawTextRotated(ctx, canvas.width - offset, (canvas.height * 0.5), Math.PI * 0.5, (wall.plane.size.y / 30.48).toFixed(2) + "'");

        let x, y, dist;
        const arrowSize = 6;

        wall.holes.forEach((hole) => {
            x = offset + hole.position.x;
            y = canvas.height - (offset + hole.position.y);

            ctx.strokeRect(x, y, hole.size.x, hole.size.y);

            dist = (canvas.height - offset) - (y + hole.size.y);
            if (dist > 2) {
                getArrowLine(
                    ctx,
                    x + (hole.size.x * 0.5),
                    y + hole.size.y,
                    x + (hole.size.x * 0.5),
                    canvas.height - offset - arrowSize,
                    arrowSize
                );

                drawTextRotated(ctx, x + (hole.size.x * 0.5), (y + hole.size.y) + (dist * 0.5), Math.PI * 0.5, (dist / 30.48).toFixed(2) + "'");

            }

            drawTextRotated(ctx, x, y + (hole.size.y * 0.5), Math.PI * 0.5, (hole.size.y / 2.54).toFixed(1) + '"');
            drawTextRotated(ctx, x + (hole.size.x * 0.5), y + hole.size.y, 0.0, (hole.size.x / 2.54).toFixed(1) + '"');

            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";

            let nearest = wall.findNearestHoles(hole);
            if (!nearest.left) {
                dist = (x - offset);
                if (dist > 2) {
                    getArrowLine(
                        ctx,
                        x,
                        y + hole.size.y * 0.5,
                        offset + arrowSize,
                        y + hole.size.y * 0.5,
                        arrowSize
                    );
                    ctx.fillText((dist / 30.48).toFixed(2) + "'", offset + (dist * 0.5), y + hole.size.y * 0.5);
                }
            }
            if (nearest.right) {
                dist = ((nearest.right.position.x + offset) - (x + hole.size.x));
                if (dist > 2) {
                    getArrowLine(
                        ctx,
                        x + hole.size.x,
                        y + hole.size.y * 0.5,
                        nearest.right.position.x + offset - arrowSize,
                        y + hole.size.y * 0.5,
                        arrowSize
                    );

                    ctx.fillText( (dist / 30.48).toFixed(2) + "'", (x + hole.size.x) + (dist * 0.5), y + hole.size.y * 0.5);
                }
            } else {
                dist = ((canvas.width - offset) - (x + hole.size.x));
                if (dist > 2) {
                    getArrowLine(
                        ctx,
                        x + hole.size.x,
                        y + hole.size.y * 0.5,
                        canvas.width - offset - arrowSize,
                        y + hole.size.y * 0.5,
                        arrowSize
                    );
                    ctx.fillText((dist / 30.48).toFixed(2) + "'", (x + hole.size.x) + (dist * 0.5), y + hole.size.y * 0.5);
                }
            }
        });

        let a = document.createElement('a');
        a.href = canvas.toDataURL("image/jpeg", 1.0);
        a.download = `stage_${stageNumber}_wall_${wallNumber}.jpeg`;
        document.body.appendChild(a);
        a.click();
    }
}

export default Building;
