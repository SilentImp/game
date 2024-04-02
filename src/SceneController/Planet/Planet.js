import RAPIER from '@dimforge/rapier2d';
import * as THREE from 'three';
import RoundIndicator from '../RoundIndicator/RoundIndicator';

class Planet {
    #scene;
    #physics;
    #planet;
    #fragments = 32;
    #rigidBody;
    #collider;
    #dropHandler;
    #totalHealth = 100;
    #currentHealth = this.#totalHealth;
    #healthIndicator;
    #radius;

    get health() {
        return this.getHealth();
    }

    set health(health) {
        this.setHealth(health);
    }

    constructor({
        physics,
        scene,
        radius = 10,
        dropHandler = () => {},
    }) {
        this.#radius = radius;
        this.#scene = scene;
        this.#physics = physics;
        this.#dropHandler = dropHandler;

        let options = {}
        if (scene.userData.debug) {
            options = {
                ...options,
                transparent: true,
                opacity: .5,
                visible: false,
            }
        }

        const material = new THREE.MeshNormalMaterial(options);
        material.wireframe = !!scene.userData.debug;

        this.#planet = new THREE.Mesh(
            new THREE.SphereGeometry(radius, this.#fragments, this.#fragments),
            material
        );
        this.#scene.add(this.#planet);

        const rigidBodyDesc = RAPIER.RigidBodyDesc.fixed().setCcdEnabled(true);
        this.#rigidBody = this.#physics.world.createRigidBody(rigidBodyDesc);

        const colliderDesc = new RAPIER.ColliderDesc(new RAPIER.Ball(radius))
            .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
        this.#collider = this.#physics.world.createCollider(colliderDesc, this.#rigidBody);

        this.#planet.userData.body = this.#rigidBody;

        console.log('Planet', this.getHandler());

        this.#healthIndicator = new RoundIndicator({
            radius: this.#radius*2,
            percent: this.#currentHealth*100/this.#totalHealth,
            width: 1,
            parent: this.#scene,
        });
    }

    getHealth = () => this.#currentHealth;

    setHealth = (health) => {
        this.#currentHealth = health;
        if (this.#currentHealth <= 0) {
            this.remove();
        } else {
            this.#healthIndicator.value = this.#currentHealth*100/this.#totalHealth;
        }
    }

    remove = () => {
        if (!(this.#planet instanceof THREE.Object3D)) return false;
        this.#physics.world.removeRigidBody(this.#rigidBody);
        this.#physics.world.removeCollider(this.#collider);
        this.#healthIndicator.remove();
        this.#planet.removeFromParent();
        this.#dropHandler();
    };

    getHandler = () => this.#rigidBody.handle;

    update = () => {
        this.#planet.material.visible = !this.#scene.userData.debug;

        this.#planet.position.x = this.#planet.userData.body.translation().x;
        this.#planet.position.y = this.#planet.userData.body.translation().y;

        this.#healthIndicator.update();
    }
}

export default Planet;