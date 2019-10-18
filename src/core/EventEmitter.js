/**
 * Base class that helps to emit/listen events
 */
class EventEmitter {
    /**
     * @constructor
     */
    constructor() {
        let eventListeners_ = {};

        /**
         * Emits an event, calling specified previously event listener
         * @param {Object} event Event
         */
        this.dispatch = (event) => {
            if (eventListeners_[event.type]) {
                for(let callback of eventListeners_[event.type]) {
                    callback({
                        data: event.data || null,
                        type: event.type
                    });
                }
            }
        };

        /**
         * Adds listener for event with specified callback
         * @param {String} eventType Event name
         * @param {Function} callback Function that will be executed when event is fired
         */
        this.addEventListener = (eventType, callback) => {
            if (!eventListeners_[eventType]) {
                eventListeners_[eventType] = [];
            }

            eventListeners_[eventType].push(callback);
        };

        /**
         * Removes callback for target event
         * @param {String} eventType Event name
         * @param {Function} callback Function that will be removed
         */
        this.removeEventListener = (eventType, callback) => {
            if (!eventListeners_[eventType]) {
                return;
            }

            eventListeners_[eventType] = eventListeners_[eventType].filter((listener) => {
                return listener !== callback;
            });
        };

        /**
         * Removes all callbacks for target event
         * @param {String} eventType Event name
         */
        this.removeEventListeners = (eventType) => {
            eventListeners_[eventType] = [];
        };
    }
}

export default EventEmitter;
