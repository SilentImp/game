import GUI from 'lil-gui';

import EventController from '../EventContoller/EventController';
import InputController from '../InputController/InputController';
import PhisicsController from '../PhisicsController/PhisicsController';
import SceneController from '../SceneController/SceneController';
import Planet from '../SceneController/Planet/Planet';
import Asteroid from '../SceneController/Asteroid/Asteroid';
import Satellite from '../SceneController/Satellite/Satellite';
import Bullet from '../SceneController/Bullet/Bullet';
import ScoreController from '../ScoreController/ScoreController';
import Stats from 'stats.js';

import { DebugController } from '../DebugController/DebugController';

class GameController {
    #scene;
    #physics;
    #stats;
    #panel;
    #debug;
    #scoreController;

    #handlerRegister = new Map();

    #state = {
        isDebugging: false,

        satellite: {
            pointer: null,
            isFiring: false,
            isMovingRight: false,
            isMovingLeft: false,
            lastMoveTime: null,
            speedPerSecond: (Math.PI*2/360)*130,
            rotationAngle: 0,
            lastRotationAngle: 0,
            radius: 3,
        },

        planet: {
            pointer: null,
            radius: 15,
            health: 100,
        },

        bullets: {
            pointers: new Map(),
            radius: 2,
            speed: 150,
            perSecond: 2,
            lastTimeFired: null,
            isFiring: false,
            mass: .5,
        },

        asteroids: {
            pointers: new Map(),
            radius: 5,
            count: 5,
            speed: 50,
            lastTimeCreated: null,
            perMinute: 40,
        },

        score: 0,

        screen: '',
        isPlaying: true,

        width: Infinity,
        height: Infinity,
    };


    collisionPlanetAsteroid = (planet, asteroid) => {
        const health = planet.getHealth();
        const updatedHealth = asteroid.getDamage(health);
        planet.setHealth(updatedHealth);
        asteroid.remove();
    }

    #collisionHandler = (handle1, handle2, started) => {
        // console.log({
        //     handle1,
        //     obj1: this.#handlerRegister.get(handle1),
        //     handle2,
        //     obj2: this.#handlerRegister.get(handle2),
        //     started
        // });

        const item1 = this.#handlerRegister.get(handle1);
        const item2 = this.#handlerRegister.get(handle2);
        
        if (
            item1 instanceof Satellite && item2 instanceof Asteroid
        ) {
            const asteroid = item2;
            this.collisionPlanetAsteroid(this.#state.planet.pointer, asteroid);
        }
        
        if (
            item2 instanceof Satellite && item1 instanceof Asteroid
        ) {
            const asteroid = item1;
            this.collisionPlanetAsteroid(this.#state.planet.pointer, asteroid);
        }

        if (
            item1 instanceof Planet && item2 instanceof Asteroid
        ) {
            const planet = item1;
            const asteroid = item2;
            this.collisionPlanetAsteroid(planet, asteroid);
        }
        
        if (
            item2 instanceof Planet && item1 instanceof Asteroid
        ) {
            const planet = item2;
            const asteroid = item1;
            this.collisionPlanetAsteroid(planet, asteroid);
        }

        if (
            item1 instanceof Bullet && item2 instanceof Asteroid ||
            item2 instanceof Bullet && item1 instanceof Asteroid
        ) {

            if (item2 instanceof Asteroid) {
                this.#state.score+=item2.level*10;
                item1.remove();
                item2.explode();
            } 
            if (item1 instanceof Asteroid) {
                this.#state.score+=item1.level*10;
                item1.explode();
                item2.remove();
            }
        }
    };

    addAsteroid = ({
        offScreen = true,
        isDirected,
        nextToTheView = false,
    } = {}) => {
        const speed = this.#state.asteroids.speed/2 + Math.random()*this.#state.asteroids.speed/2;
        const angle = Math.PI*2*Math.random();
        let minDistance;
        let maxDistance;

        if (offScreen) {
            minDistance = this.#scene.radius + this.#state.asteroids.radius;
            maxDistance = minDistance + this.#scene.radius*Math.random();
        } else if (nextToTheView) {
            minDistance = this.#scene.radius + this.#state.asteroids.radius;
            maxDistance = minDistance;
        } else {
            minDistance = (
                this.#state.planet.radius*2
                + this.#state.satellite.radius*8
            )*2;
            maxDistance = 3*minDistance*Math.random() + minDistance;
        }
        
        const symbol = Symbol();
        const level = Math.ceil(Math.random()*3);
        const radius = this.#state.asteroids.radius*level;
        const x = Math.cos(angle)*maxDistance;
        const y = Math.sin(angle)*maxDistance;

        if(isDirected === undefined) {
            isDirected = Math.random() > .3;
        }

        let vector;
        if (isDirected) {
            const x1 = 0;
            const y1 = 0;
            const x2 = x;
            const y2 = y;
            const magnitude = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
            const vx = (x1 - x2)/magnitude;
            const vy = (y1 - y2)/magnitude;
            vector = {
                x: vx, 
                y: vy, 
            };
        } else {
            const x2 = x;
            const y2 = y;
            const spaceX = this.#scene.sizes.width*3/4;
            const spaceY = this.#scene.sizes.height*3/4;
            const x1 = Math.random()*spaceX - spaceX/2;
            const y1 = Math.random()*spaceY - spaceY/2;
            const magnitude = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
            const vx = (x1 - x2)/magnitude;
            const vy = (y1 - y2)/magnitude;
            vector = {
                x: vx, 
                y: vy, 
            };
        }

        const asteroid = new Asteroid({
            symbol,
            vector,
            mass: level,
            scene: this.#scene,
            physics: this.#physics,
            radius,
            level,
            speed,
            x,
            y,
            dropHandler: (asteroid, symbol) => {
                this.#state.asteroids.pointers.delete(symbol);
                this.#handlerRegister.delete(asteroid.getHandler());
            },
            splitHandler: (asteroid, symbol) => {
                this.#state.asteroids.pointers.set(symbol, asteroid);
                this.#handlerRegister.set(asteroid.getHandler(), asteroid);
            },
        });
        this.#state.asteroids.pointers.set(symbol, asteroid);
        this.#handlerRegister.set(asteroid.getHandler(), asteroid);
    }

    reGenerateAsteroids = () => {
        this.#state.asteroids.pointers.forEach(element => {
            element.remove();
        });
        this.#state.asteroids.pointers.clear();
        this.generateAsteroids(this.#state.asteroids.count, {
            offScreen: false,
        });
    }

    generateAsteroids = (amount = 1, options = {
        offScreen: true,
    }) => {
        let index = amount;
        while(index--) {
            this.addAsteroid(options);
        }
    }

    generatePlanetAndSatellite = () => {
        if (this.#state.planet.pointer !== null) {
            this.#state.planet.pointer.remove();
        }
        this.#state.planet.pointer = new Planet({
            scene: this.#scene,
            physics: this.#physics,
            radius: this.#state.planet.radius,
            dropHandler: () => {
                this.#state.isPlaying = false;
                this.#handlerRegister.delete(this.#state.planet.pointer.getHandler());
                this.#state.planet.pointer = null;
            }
        });
        this.#handlerRegister.set(this.#state.planet.pointer.getHandler(), this.#state.planet.pointer);

        if (this.#state.satellite.pointer !== null) {
            this.#state.satellite.pointer.remove();
        }
        this.#state.satellite.pointer = new Satellite({
            scene: this.#scene,
            physics: this.#physics,
            radius: this.#state.satellite.radius,
            x: this.#state.planet.radius + this.#state.satellite.radius*2,
            y: 0,
            deg: this.#state.satellite.rotationAngle,
            dropHandler: () => {
                this.#state.isPlaying = false; 
                this.#handlerRegister.delete(this.#state.satellite.pointer.getHandler());
                this.#state.satellite.pointer = null;
                this.#panel.controllers.forEach(controller => controller.updateDisplay())
            }
        });
        this.#handlerRegister.set(this.#state.satellite.pointer.getHandler(), this.#state.satellite.pointer);
    }

    #createPanel = () => {
        this.#panel = new GUI({ width: 310 });
        this.#panel.add( this.#state, 'isDebugging' );
        this.#panel.add( this.#state, 'isPlaying' );
        this.#panel.add( this.#state.asteroids, 'count', 1, 100, 1 );
        this.#panel.add( this.#state.planet.pointer, 'health', 0, 100, 1 );
        this.#panel.add( this, 'generateAsteroids' );
        this.#panel.add( this, 'reGenerateAsteroids' );
        this.#panel.add( this, 'generatePlanetAndSatellite' );
        this.#panel.close();
        
        this.#panel.onFinishChange( (event) => {
            switch (event.property) {
                case 'health':
                    this.#state.planet.pointer.setHealth(event.value);
                    break;
                case 'count':
                    this.reGenerateAsteroids();
                    break;
                case 'isPlaying':
                    this.#state.isPlaying = event.value;
                    break;
                case 'isDebugging':
                    this.#state.isDebugging = event.value;
                    this.#scene.userData.debug = event.value;
                    if (event.value === false) {
                        this.#debug.clean();
                    }
                    if (this.#debug === undefined && event.value === true ) {
                        this.#debug = new DebugController({
                            scene: this.#scene,
                            physicsWorld: this.#physics.world,
                        });
                    }
                    break;
            }
            document?.body?.focus();
        });
    }

    #startFire = () => {
        this.#state.bullets.isFiring = true;
    }

    #stopFire = () => {
        this.#state.bullets.isFiring = false;
    }

    #emitBullet = () => {
        const symbol = Symbol();
        const angl = this.#state.satellite.rotationAngle;
        const distance = 
            this.#state.planet.radius + 
            this.#state.satellite.radius*4 +
            .25;
        const speed = this.#state.bullets.speed;
        // const speed = 0;
        const x = distance*Math.cos(angl);
        const y = distance*Math.sin(angl);
        const radius = this.#state.bullets.radius;
        const vector = {
            x: Math.cos(angl), 
            y: Math.sin(angl),
        };
        const bullet = new Bullet({
            deg: this.#state.satellite.rotationAngle,
            mass: this.#state.bullets.mass,
            vector,
            x,
            y,
            radius,
            speed,
            scene: this.#scene,
            physics: this.#physics,
            dropHandler: () => {
                this.#handlerRegister.delete(bullet.getHandler());
                this.#state.bullets.pointers.delete(symbol);
            },
        });
        this.#state.bullets.pointers.set(symbol,  bullet);
        this.#handlerRegister.set(bullet.getHandler(), bullet);
    }

    #startMovingLeft = () => {
        this.#state.satellite.lastMoveTime = performance.now();
        this.#state.satellite.isMovingLeft = true;
        this.#state.satellite.isMovingRight = false;
    }

    #startMovingRight = () => {
        this.#state.satellite.lastMoveTime = performance.now();
        this.#state.satellite.isMovingRight = true;
        this.#state.satellite.isMovingLeft = false;
    }

    #stopMovingLeft = () => {
        this.#state.satellite.lastMoveTime = null;
        this.#state.satellite.isMovingLeft = false;
    }

    #stopMovingRight = () => {
        this.#state.satellite.lastMoveTime = null;
        this.#state.satellite.isMovingRight = false;
    }

    #updateScene = () => {
        if (this.#state.satellite.pointer !== null) {
            if (this.#state.satellite.lastRotationAngle !== this.#state.satellite.rotationAngle) {
                this.#state.satellite.pointer.setRotation(this.#state.satellite.rotationAngle);
                this.#state.satellite.lastRotationAngle = this.#state.satellite.rotationAngle;
            } else {
                this.#state.satellite.pointer.update();
            }   
        }

        for (const [,bullet] of this.#state.bullets.pointers) {
            bullet.update();
        }

        for (const [,asteroid] of this.#state.asteroids.pointers) {
            asteroid.update();
        }

        if (this.#state.planet.pointer !== null) {
            this.#state.planet.pointer.update();
        }
    }

    #loop = () => {
        this.#stats.begin();

        if(!this.#state.isPlaying) {
            this.#stats.end();
            return;
        }

        if (this.#state.satellite.isMovingLeft || this.#state.satellite.isMovingRight) {
            if (this.#state.satellite.lastMoveTime === null) {
                this.#state.satellite.lastMoveTime = performance.now();
            }
            const delta = performance.now() - this.#state.satellite.lastMoveTime;
            this.#state.satellite.lastMoveTime = performance.now();
            const andleChange = delta*this.#state.satellite.speedPerSecond/1000;

            if (this.#state.satellite.isMovingLeft) {
                this.#state.satellite.rotationAngle -= andleChange;
            }

            if (this.#state.satellite.isMovingRight) {
                this.#state.satellite.rotationAngle += andleChange;
            }
        }

        if (this.#state.bullets.isFiring === true) {
            if (this.#state.bullets.lastTimeFired === null) {
                this.#state.bullets.lastTimeFired = performance.now();
                this.#emitBullet();
            } else {
                const time = performance.now();
                const delta = time - this.#state.bullets.lastTimeFired;

                if (delta > 1000/this.#state.bullets.perSecond) {
                    this.#emitBullet();
                    this.#state.bullets.lastTimeFired = time;
                }
            }
        }

        const viewportIsNotEmpty = this.#checkIfAnyAsteroidsInView();
        const options = viewportIsNotEmpty 
            ? {}
            : {
                offScreen: true,
                isDirected: true,
                nextToTheView: true,
            };
        if (this.#state.asteroids.lastTimeCreated === null) {
            this.#state.asteroids.lastTimeCreated = performance.now();
            this.addAsteroid(options);
        } else {
            const time = performance.now();
            const delta = time - this.#state.asteroids.lastTimeCreated;

            if (delta > 60000/this.#state.asteroids.perMinute) {
                this.addAsteroid(options);
                this.#state.asteroids.lastTimeCreated = time;
            }
        }

        this.#physics.update();
        this.#updateScene();
        this.#scene.update();

        if (this.#scene.userData.debug === true) {
            this.#debug.update();
        }

        this.#scoreController.update(this.#state.score);
        this.#panel.controllers.forEach(controller => controller.updateDisplay())
        
        this.#stats.end();
    }

    #nextTick = () => {
        this.#loop();
        requestAnimationFrame(this.#nextTick);
    }

    static #checkIfAnyAsteroidsInViewReducer = (collector, asteroid) => collector || asteroid.isInView();

    #checkIfAnyAsteroidsInView = () => [...this.#state.asteroids.pointers.values()]
            .reduce(GameController.#checkIfAnyAsteroidsInViewReducer, false);

    constructor() {
        new InputController();

        this.#stats = new Stats();
        this.#stats.showPanel(0);
        document.body.appendChild(this.#stats.dom);

        this.#physics = new PhisicsController({
            collisionHandler: this.#collisionHandler,
        });
        this.#scene = new SceneController();

        this.#scene.userData = {};
        this.#scene.userData.debug = this.#state.isDebugging;

        this.generatePlanetAndSatellite();
        this.reGenerateAsteroids();

        this.#scoreController = new ScoreController();
        this.#scoreController.update(this.#state.score);

        if (this.#scene.userData.debug) {
            this.#debug = new DebugController({
                scene: this.#scene,
                physicsWorld: this.#physics.world,
            });
        }

        this.#createPanel();

        EventController.listenTo('game:start:left', this.#startMovingLeft);
        EventController.listenTo('game:start:right', this.#startMovingRight);
        EventController.listenTo('game:start:fire', this.#startFire);
        EventController.listenTo('game:stop:left', this.#stopMovingLeft);
        EventController.listenTo('game:stop:right', this.#stopMovingRight);
        EventController.listenTo('game:stop:fire', this.#stopFire);

        if (typeof requestIdleCallback === 'function') {
            requestIdleCallback(this.#nextTick);
        } else {
            setTimeout(this.#nextTick, 1);
        }
    }
}

export default GameController;