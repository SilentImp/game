import RAPIER from '@dimforge/rapier2d';
import * as THREE from 'three';
import SpeedVector from '../SpeedVector/SpeedVector';

class Asteroid {
    #geometry;
    static #material;
    static #fragments = 16;
    static #damage = 20;

    #asteroid;
    #symbol;
    #collider;
    #rigidBody;
    #scene;
    #physics;
    #dropHandler;
    #splitHandler;
    #radius;
    #x;
    #y;
    #speed;
    #level;
    #vector = null;
    isRemoved = false;
    #mass;

    constructor({
        physics,
        scene,
        level = 1,
        radius = 1,
        speed = .25,
        mass = 1,
        vector,
        x = 0,
        y = 0,
        symbol,
        dropHandler = () => {},
        splitHandler = () => {},
    }) {
        this.#mass = mass;
        this.#symbol = symbol;
        this.#speed = speed;
        this.#x = x;
        this.#y = y;
        this.#level = level;
        this.#radius = radius;
        this.#scene = scene;
        this.#physics = physics;
        this.#dropHandler = dropHandler;
        this.#splitHandler = splitHandler;

        let options = {color: 'red'}
        if (scene.userData.debug) {
            options = {
                ...options,
                transparent: true,
                opacity: .1,
                visible: false,
            }
        }
        
        this.#geometry = new THREE.SphereGeometry(this.#radius, Asteroid.#fragments, Asteroid.#fragments);

        if (Asteroid.#material === undefined) {
            Asteroid.#material = new THREE.MeshBasicMaterial(options);
            Asteroid.#material.wireframe = !!scene.userData.debug;
        }

        this.#asteroid = new THREE.Mesh(
            this.#geometry,
            Asteroid.#material,
        );

        this.#asteroid.position.x = this.#x;
        this.#asteroid.position.y = this.#y;
        this.#asteroid.position.z = 0;

        scene.add(this.#asteroid);

        const RigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setCcdEnabled(true);
        RigidBodyDesc
            .setTranslation(this.#x, this.#y)
            .setLinvel(vector.x*this.#speed, vector.y*this.#speed);
        this.#rigidBody = physics.world.createRigidBody(RigidBodyDesc);
        const colliderDesc = new RAPIER.ColliderDesc(new RAPIER.Ball(this.#radius))
            .setMass(this.#mass)
            .setFriction(.2)
            .setRestitution(.2);
        this.#collider = physics.world.createCollider(colliderDesc, this.#rigidBody);
        this.#asteroid.userData.body = this.#rigidBody;

        console.log('Asteroid', this.getHandler(), 'level: ', this.#level);

        this.buildSpeedVector();
    }

    buildSpeedVector = () => {
        this.#vector = new SpeedVector({
            speedVector: this.#rigidBody?.linvel(),
            vectorLength: this.#radius*1.5,
        });
        this.#asteroid.add(this.#vector.vector);
    }

    getDamage = (health) => (health - (Asteroid.#damage*this.#level));

    getHandler = () => this.#rigidBody.handle;

    getLevel = () => this.#level;

    explode = () => {
        const newRadius = this.#radius/2;
        const distance = this.#radius + newRadius + .1; 
        let index = this.#level > 1
            ? this.#level
            : 0;
        const startAndle = Math.random()*Math.PI*2;
        const delta = Math.PI*2/this.#level;
        let angle = startAndle;

        while(index--) {
            const symbol = Symbol();
            angle += delta;

            const linear = this.#rigidBody.linvel();
            const x = this.#x + (distance)*Math.cos(angle);
            const y = this.#y + (distance)*Math.sin(angle);
            
            let new_dx = linear.x * Math.cos(angle) - linear.y * Math.sin(angle);
            let new_dy = linear.x * Math.sin(angle) + linear.y * Math.cos(angle);

            const vector = {
                x: new_dx, 
                y: new_dy,
            };

            const asteroid = new Asteroid({
                symbol,
                vector,
                mass: this.#mass/this.#level,
                scene: this.#scene,
                speed: 1.2,
                physics: this.#physics,
                radius: newRadius,
                level: this.#level - 1,
                x,
                y,
                dropHandler: this.#dropHandler,
                splitHandler: this.#splitHandler
            });
            this.#splitHandler(asteroid, symbol);
        }

        this.remove();
    };

    remove = () => {
        this.isRemoved = true;
        if (!(this.#asteroid instanceof THREE.Object3D)) return false;
        this.#physics.world.removeRigidBody(this.#rigidBody);
        this.#physics.world.removeCollider(this.#collider);
        if (this.#vector) this.#vector.remove();
        this.#asteroid.removeFromParent();
        this.#dropHandler(this, this.#symbol);
    };

    calculateDistance = () => {
        const {x, y} = this.#asteroid.userData.body.translation();
        const distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        if (this.#scene.getDistance() <= distance) {
            this.remove();
        }
    };

    update = () => {
        this.#asteroid.material.visible = !this.#scene.userData.debug;

        this.#x = this.#asteroid.userData.body.translation().x;
        this.#y = this.#asteroid.userData.body.translation().y;

        this.#asteroid.position.x = this.#x;
        this.#asteroid.position.y = this.#y;

        this.calculateDistance();

        if (!this.isRemoved) {
            const vect = this.#rigidBody.linvel();
            this.#vector.update(vect);
        }
    };

    isInView = () => {
        if (this.#x > this.#scene.sizes.width/2 || this.#x < -this.#scene.sizes.width/2) return false;
        if (this.#y > this.#scene.sizes.height/2 || this.#y < -this.#scene.sizes.height/2) return false;
        return true;
    };

    get level() {
        return this.#level;
    }
}

export default Asteroid;