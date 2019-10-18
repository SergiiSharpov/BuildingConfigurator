import {VIEWER_LOADED, VIEWER_LOAD_START, VIEWER_LOAD_PROGRESS} from "./const/Events";
import EventEmitter from "./core/EventEmitter";

class ViewerLoader extends EventEmitter {
    // static chunksPath = './';
    static assetsPath = './assets';

    load() {
        this.dispatch({type: VIEWER_LOAD_START});

        return import(`./core.js`)
            .then((module) => {

                return module.loadResources((event) => {
                    this.dispatch({type: VIEWER_LOAD_PROGRESS, data: event});
                }).then(() => {
                    this.dispatch({type: VIEWER_LOADED});

                    return module;
                });
            });
    }
}

export default ViewerLoader;
