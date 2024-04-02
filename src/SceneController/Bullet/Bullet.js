import RAPIER from '@dimforge/rapier2d';
import * as THREE from 'three';

class Bullet {
    #bullet;
    #dropHandler;
    #scene;
    #physics;
    #x;
    #y;
    #rigidBody;
    #collider;

    static #geometry;
    static #material;
    static #fragments = 16;
    static #mass = .5;
    static #radius = 1;

    constructor({
        dropHandler = () => {},
        scene,
        physics,
        x,
        y,
        vector,
        speed,
        radius,
        mass,
    }) {
        this.#scene = scene;
        this.#physics = physics;
        this.#dropHandler = dropHandler;

        this.#x = x;
        this.#y = y;

        let options = {color: 'cyan'}
        if (scene.userData.debug) {
            options = {
                ...options,
                transparent: true,
                opacity: .1,
                visible: false,
            }
        }

        if (Bullet.#geometry === undefined) {
            Bullet.#geometry = new THREE.SphereGeometry(radius, Bullet.#fragments, Bullet.#fragments);
        }

        if (Bullet.#material === undefined) {
            Bullet.#material = new THREE.MeshBasicMaterial(options);
            Bullet.#material.wireframe = !!scene.userData.debug;
        }

        this.#bullet = new THREE.Mesh(
            Bullet.#geometry,
            Bullet.#material,
        );

        scene.add(this.#bullet);

        const RigidBodyDesc = RAPIER.RigidBodyDesc
            .dynamic()
            .setCcdEnabled(true);
        RigidBodyDesc
            .setTranslation(this.#x, this.#y)
            .setLinvel(vector.x*speed, vector.y*speed);
        this.#rigidBody = this.#physics.world.createRigidBody(RigidBodyDesc); 
        const colliderDesc = new RAPIER.ColliderDesc(new RAPIER.Ball(Bullet.#radius))
            .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)
            .setMass(mass)
            .setFriction(.5)
            .setRestitution(.5);
        this.#collider = this.#physics.world.createCollider(colliderDesc, this.#rigidBody);

        this.#bullet.userData.body = this.#rigidBody;

        console.log('Bullet', this.getHandler());
    }

    getHandler = () => this.#rigidBody.handle;

    remove = () => {
        if (!(this.#bullet instanceof THREE.Object3D)) return false;
        this.#physics.world.removeRigidBody(this.#rigidBody);
        this.#physics.world.removeCollider(this.#collider);
        this.#bullet.removeFromParent();
        this.#dropHandler();
    };

    calculateDistance = () => {
        const {x, y} = this.#bullet.userData.body.translation();
        const distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        if (this.#scene.getDistance() <= distance) {
            this.remove();
        }
    };

    update = () => {
        this.#bullet.material.visible = !this.#scene.userData.debug;

        this.#bullet.position.x = this.#bullet.userData.body.translation().x;
        this.#bullet.position.y = this.#bullet.userData.body.translation().y;
        this.calculateDistance();
    };
}

export default Bullet;