import ViewerLoader from './base';

//ViewerLoader.assetsPath = './assets';

const viewerLoader = new ViewerLoader();

viewerLoader.addEventListener('viewerLoadStart', () => {
    document.body.querySelector('.loader').classList.add('active');
});
viewerLoader.addEventListener('viewerLoaded', () => {
    document.body.querySelector('.loader').classList.remove('active');
});
viewerLoader.addEventListener('viewerLoadProgress', (event) => {
    document.body.querySelector('.loader-text').innerText = event.data.message;
});

viewerLoader.load()
.then(({Viewer}) => {

    let viewer = new Viewer();
    viewer.update();

    document.body.appendChild(viewer.canvas);

    window.addEventListener('resize', () => {
        viewer.update();
    });

    viewer.shouldRender();

    let items = document.body.querySelectorAll('#items .container-item[data-id]');
    items.forEach((item) => {
        item.addEventListener('dragstart', (e) => {
            let crt = document.createElement('div');
            crt.style.display = "none";
            e.dataTransfer.setDragImage(crt, 0, 0);

            viewer.building.setDrag(
                viewer.getInstance(e.currentTarget.dataset.id)
            );
        });
    });

    items = document.body.querySelectorAll('#walls .container-item[data-id]');
    items.forEach((item) => {
        item.addEventListener('dragstart', (e) => {
            let crt = document.createElement('div');
            crt.style.display = "none";
            e.dataTransfer.setDragImage(crt, 0, 0);
            e.dataTransfer.setData('plain/text', `WallMaterial:${e.currentTarget.dataset.id}`);

            viewer.setStageSelectMode(true);
        });
    });

    items = document.body.querySelectorAll('#roofs .container-item[data-id]');
    items.forEach((item) => {
        item.addEventListener('click', (e) => {
            viewer.setRoofMaterial(
                viewer.getMaterial(e.currentTarget.dataset.id)
            );
        });
    });

    viewer.canvas.addEventListener('drop', (e) => {
        let data = e.dataTransfer.getData('plain/text');

        if (data.indexOf('WallMaterial') === 0) {

            let id = data.split(':').pop();

            viewer.setStageMaterial(
                viewer.building.currentStage,
                viewer.getMaterial(id)
            );
        }

        viewer.setStageSelectMode(false);
    });

    document.body.querySelector('#apply').addEventListener('click', () => {
        viewer.createEmptyBuilding(
            document.body.querySelector('#width').valueAsNumber,
            document.body.querySelector('#depth').valueAsNumber,
            document.body.querySelector('#height').valueAsNumber,
            document.body.querySelector('#levels').valueAsNumber,
        );
    });

    let mode = false;
    document.body.querySelector('#selectmode').addEventListener('click', (e) => {
        mode = !mode;
        viewer.setStageSelectMode(mode);

        if (mode) {
            e.currentTarget.classList.add('active');
            e.currentTarget.innerText = 'Disable';
        } else {
            e.currentTarget.classList.remove('active');
            e.currentTarget.innerText = 'Enable';
        }
    });

    let selectedStage = 0;

    viewer.addEventListener('stageSelected', () => {
        let stage = viewer.building.selectedStage;

        if (stage != null) {
            selectedStage = stage.number;
            document.body.querySelector('#selectedlevel').innerText = selectedStage;
            document.body.querySelector('#targetheight').valueAsNumber = stage.height / 30.48;// From cm to ft
        } else {
            selectedStage = -1;
            document.body.querySelector('#selectedlevel').innerText = '-';
        }
    });

    document.body.querySelector('#targetheight').addEventListener('input', (e) => {
        if (+e.currentTarget.value <= 4) {
            e.currentTarget.value = 4;
        }

        if (selectedStage >= 0) {
            viewer.setStageHeight(
                viewer.building.getStage(selectedStage),
                +e.currentTarget.value
            );
        }
    });

    document.body.querySelector('#getplan').addEventListener('click', (e) => {
        let stage = +document.body.querySelector('#targetlevel').value;

        if (stage >= 0) {
            viewer.getStagePlan(
                viewer.building.getStage(stage)
            )
        }
    });

});
