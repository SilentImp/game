import RAPIER from '@dimforge/rapier2d';
import * as THREE from 'three';

class Satellite {
    static #mass = 0;
    static #fragments = 32;
    #dropHandler;
    #setellite;
    #x;
    #y;
    #deg;
    #scene;
    #physics;
    #rigidBody;
    #collider;
    #radius;

    /**
     * Constructor for creating a Satellite.
     *
     * @param {Object} options - The options for initializing the Satellite.
     * @param {RAPIER.World} options.physics - The physics engine for the Satellite.
     * @param {THREE.Scene} options.scene - The scene where the Satellite will be placed.
     * @param {number} [options.radius=1] - The radius of the Satellite.
     * @param {number} [options.x=0] - The x-coordinate of the Satellite.
     * @param {number} [options.y=0] - The y-coordinate of the Satellite.
     * @param {number} [options.deg=0] - The initial degree of the Satellite rotation.
     * @return Satellite
     */
    constructor({
        physics,
        scene,
        radius = 1,
        x = 0,
        y = 0,
        deg = 0,
        dropHandler = () => {},
    }) {
        this.#radius = radius;
        this.#dropHandler = dropHandler;
        this.#scene = scene;
        this.#physics = physics;
        this.#x = x;
        this.#y = y;
        this.#deg = deg;

        let options = {color: 'lime'}
        if (scene.userData.debug) {
            options = {
                ...options,
                transparent: true,
                opacity: .05,
                visible: false,
            }
        }

        const material = new THREE.MeshBasicMaterial(options);
        material.wireframe = !!scene.userData.debug;

        this.#setellite = new THREE.Mesh(
            new THREE.SphereGeometry(this.#radius, Satellite.#fragments, Satellite.#fragments),
            material
        );
        scene.add(this.#setellite);

        const RigidBodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setCcdEnabled(true);
        RigidBodyDesc.setTranslation(this.#x, this.#y);

        this.#rigidBody = this.#physics.world.createRigidBody(RigidBodyDesc); 
        const ball = new RAPIER.Ball(this.#radius);
        const colliderDesc = new RAPIER.ColliderDesc(ball)
            .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)
            .setMass(Satellite.#mass);
        this.#collider = this.#physics.world.createCollider(colliderDesc, this.#rigidBody);
        this.#setellite.userData.body = this.#rigidBody;

        console.log('Satellite', this.getHandler());

        this.setRotation(deg);
    }

    remove = () => {
        if (!(this.#setellite instanceof THREE.Object3D)) return false;
        this.#physics.world.removeRigidBody(this.#rigidBody);
        this.#physics.world.removeCollider(this.#collider);
        this.#setellite.removeFromParent();
        this.#dropHandler();
    };

    getHandler = () => this.#rigidBody.handle;

    setRotation = (deg) => {
        this.#deg = deg;
        const x = this.#x*Math.cos(this.#deg) - this.#y*Math.sin(this.#deg);
        const y = this.#y*Math.cos(this.#deg) + this.#x*Math.sin(this.#deg);
        this.#setellite.userData.body.setTranslation(new RAPIER.Vector2(x, y));
        
        this.update();
    }

    update = () => {
        this.#setellite.material.visible = !this.#scene.userData.debug;

        this.#setellite.position.x = this.#setellite.userData.body.translation().x;
        this.#setellite.position.y = this.#setellite.userData.body.translation().y;
    }

}

export default Satellite;