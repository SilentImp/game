import RAPIER from '@dimforge/rapier2d';
import Bullet from '../SceneController/Bullet/Bullet';
import Asteroid from '../SceneController/Asteroid/Asteroid';
import Satellite from '../SceneController/Satellite/Satellite';

class PhisicsController {
    world;
    #collisionHandler;

    constructor({
        collisionHandler 
    }) {
        this.#collisionHandler = collisionHandler;
        const gravity = new RAPIER.Vector2(0, 0);
        this.world = new RAPIER.World(gravity); 
    }

    update = () => {
        let eventQueue = new RAPIER.EventQueue(true);
        this.world.step(eventQueue);
        eventQueue.drainCollisionEvents(this.#collisionHandler);
    }

}

export default PhisicsController;