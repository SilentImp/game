import config from "./config.json";
import EventController from "../EventContoller/EventController";

class InputController {
    static #mousePosition = {
        currentPosX: null,
        currentPosY: null,
        lastPosX: null,
        lastPosY: null,
    };

    static #gameEventSet = new Set();
    static #keyDownSet = new Set();
    static #isMouseKeyDown = false;

    /**
     * Check if this key have both keyup and keydown events in config
     * @param {string} key — keyboard key
     * @return {boolean} — if true — key react on both keyup and keydown
     * @see https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
     * */ 
    static #isKeySwtich(key) {
        return (
            config.keyboard.keydown[key] !== undefined
            && config.keyboard.keyup[key] !== undefined
        );
    }

    /**
     * @param {boolean} — do we have events on both mouse down and mouse up
     * */ 
    static #isMouseButtonSwtich = (
        config.mouse.mousedown !== undefined
        && config.mouse.mouseup !== undefined
    );

    static #keyboardHandlers = {
        /**
         * Transform keyboard keydown event into game event
         * @param {KeyboardEvent} event - keydown event
         * @returns {boolean} if true — event was defined in the game
         */
        keydown: ({ key }) => {
            const gameEventName = config.keyboard.keydown[key];
            if (gameEventName === undefined) return false;
            const isSwitch = InputController.#isKeySwtich(key);

            if (
                isSwitch
                && !InputController.#keyDownSet.has(key)
                && !InputController.#gameEventSet.has(gameEventName)
            ) {
                InputController.#keyDownSet.add(key);
                InputController.#gameEventSet.add(gameEventName);
                if (gameEventName === null) return true;
                EventController.dispatch(gameEventName);
            }

            if (!isSwitch) {
                EventController.dispatch(gameEventName);
            }

            return true;
        },

        /**
         * Transform keyboard keyup event into game event
         * @param {KeyboardEvent} event - keyup event
         * @returns {boolean} if true — event was defined in the game
         */
        keyup: ({ key }) => {
            const gameEventName = config.keyboard.keyup[key];
            if (gameEventName === undefined) return false;
            const isSwitch = InputController.#isKeySwtich(key);
            const gameEventKeyDownName = config.keyboard.keydown[key];

            if (
                isSwitch
                && InputController.#keyDownSet.has(key)
                && InputController.#gameEventSet.has(gameEventKeyDownName)
            ) {
                InputController.#keyDownSet.delete(key);
                InputController.#gameEventSet.delete(gameEventKeyDownName);
                if (gameEventName === null) return true;
                EventController.dispatch(gameEventName);
            }

            if (!isSwitch) {
                EventController.dispatch(gameEventName);
            }

            return true;
        }
    }

    static #mouseHandlers = {
        mousemove: ({ clientX, clientY}) => {
            // Update current mouse position
            InputController.#mousePosition.currentPosX = clientX;
            InputController.#mousePosition.currentPosY = clientY;
            
            // We should initialize last position on first movement
            if (InputController.#mousePosition.lastPosX === null) {
                InputController.#mousePosition.lastPosX = clientX;
                InputController.#mousePosition.lastPosY = clientY;
            }
        },

        mousedown: ({ clientX, clientY}) => {
            InputController.#mousePosition.currentPosX = clientX;
            InputController.#mousePosition.currentPosY = clientY;

            if (
                InputController.#isMouseButtonSwtich
                && !InputController.#isMouseKeyDown
            ) {
                InputController.#isMouseKeyDown = true;
                EventController.dispatch(config.mouse.mousedown, {
                    ...this.#mousePosition
                });
            }

            if (!InputController.#isMouseButtonSwtich) {
                EventController.dispatch(config.mouse.mousedown, {
                    ...this.#mousePosition
                });
            }
        },

        mouseup: ({ clientX, clientY}) => {
            InputController.#mousePosition.currentPosX = clientX;
            InputController.#mousePosition.currentPosY = clientY;

            if (
                InputController.#isMouseButtonSwtich
                && InputController.#isMouseKeyDown
            ) {
                InputController.#isMouseKeyDown = false;
                EventController.dispatch(config.mouse.mouseup, InputController.#mousePosition);
            }

            if (!InputController.#isMouseButtonSwtich) {
                EventController.dispatch(config.mouse.mouseup, InputController.#mousePosition);
            }
        },
    }

    static #LoopInputHandler() {

        // Mouse handling
        const deltaX = InputController.#mousePosition.lastPosX - InputController.#mousePosition.currentPosX;
        const deltaY = InputController.#mousePosition.lastPosY - InputController.#mousePosition.currentPosY;
        InputController.#mousePosition.lastPosX = InputController.#mousePosition.currentPosX;
        InputController.#mousePosition.lastPosY = InputController.#mousePosition.currentPosY;

        const details = {
            deltaX,
            deltaY,
            ...InputController.#mousePosition,
        };

        if (deltaX > 0) {
            EventController.dispatch(config.mouse.mousemove.left, details);
        } else if (deltaX < 0) {
            EventController.dispatch(config.mouse.mousemove.right, details);
        }

        // Next frame
        requestAnimationFrame(InputController.#LoopInputHandler, InputController.#mousePosition);
    }

    constructor() {
        // Keyboard input handling
        Object.keys(config.keyboard)
            .filter((eventName) => InputController.#keyboardHandlers[eventName] !== undefined)
            .forEach((eventName) => document.addEventListener(eventName, InputController.#keyboardHandlers[eventName]));

        // Mouse input handling
        Object.keys(config.mouse)
            .filter((eventName) => InputController.#mouseHandlers[eventName] !== undefined)
            .forEach((eventName) => document.addEventListener(eventName, InputController.#mouseHandlers[eventName]));

        // Touch-screen input handling

        // Controller input handling

        requestAnimationFrame(InputController.#LoopInputHandler);
    }
}

export default InputController;