import EventController from '../EventContoller/EventController';
import InputController from '../InputController/InputController';
import SceneController from '../SceneController/SceneController';

class GameController {
    #scene;

    #state = {
        
        isFiring: false,
        isMovingRight: false,
        isMovingLeft: false,
        speed: (Math.PI*2/360)*3,
        satelliteRotationAngle: 0,
        
        screen: '',
        isPlaying: false,

        width: Infinity,
        height: Infinity,
    };

    #startMovingLeft = () => {
        this.#state.isMovingLeft = true;
        this.#state.isMovingRight = false;
    }

    #startMovingRight = () => {
        this.#state.isMovingRight = true;
        this.#state.isMovingLeft = false;
    }

    #stopMovingLeft = () => {
        this.#state.isMovingLeft = false;
    }

    #stopMovingRight = () => {
        this.#state.isMovingRight = false;
    }

    #updateScene = () => {
        this.#scene.setSatelliteRotation(this.#state.satelliteRotationAngle);
    }

    #loop = () => {
        if (this.#state.isMovingLeft) {
            this.#state.satelliteRotationAngle -= this.#state.speed;
        }

        if (this.#state.isMovingRight) {
            this.#state.satelliteRotationAngle += this.#state.speed;
        }

        this.#updateScene();
    }

    #nextTick = () => {
        this.#loop();
        requestAnimationFrame(this.#nextTick);
    }


    constructor() {
        new InputController();
        this.#scene = new SceneController();

        this.#nextTick = this.#nextTick.bind(this);
        this.#startMovingLeft = this.#startMovingLeft.bind(this);
        this.#startMovingRight = this.#startMovingRight.bind(this);
        this.#stopMovingLeft = this.#stopMovingLeft.bind(this);
        this.#stopMovingRight = this.#stopMovingRight.bind(this);
        this.#stopMovingRight = this.#stopMovingRight.bind(this);

        EventController.listenTo('game:start:left', this.#startMovingLeft);
        EventController.listenTo('game:start:right', this.#startMovingRight);
        EventController.listenTo('game:stop:left', this.#stopMovingLeft);
        EventController.listenTo('game:stop:right', this.#stopMovingRight);

        this.#nextTick();
    }
}

export default GameController;