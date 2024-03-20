import * as THREE from 'three';
import Planet from './Planet/Planet';
import Satellite from './Satellite/Satellite';
import Asteroid from './Asteroid/Asteroid';
import animejs from 'animejs';
import PhisicsController from '../PhisicsController/PhisicsController'

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class SceneController {
    #scene;
    #clock;
    #camera;
    #renderer;
    #planet;
    #satellite;
    #satellitePivot;
    #asteroids = [];

    #options = {
        planetRadius: 15,
        satelliteRadius: 3,
        asteroidRadius: 3,
    };

    #sizes = {
        width: window.innerWidth,
        height: window.innerHeight,
        min: Math.min(window.innerWidth, window.innerHeight),
        max: Math.max(window.innerWidth, window.innerHeight),
    };

    #aspect = this.#sizes.width/this.#sizes.height;

    #onResize = () => {
        // Update size and ratio
        this.#sizes.width = window.innerWidth;
        this.#sizes.height = window.innerHeight;
        this.#sizes.min = Math.min(window.innerWidth, window.innerHeight);
        this.#sizes.max = Math.max(window.innerWidth, window.innerHeight);
        this.#aspect = this.#sizes.width/this.#sizes.height;
        
        // Update camera
        this.#camera.left = this.#sizes.height*this.#aspect/-2;
        this.#camera.right = this.#sizes.height*this.#aspect/2;
        this.#camera.top = this.#sizes.height/-2;
        this.#camera.bottom = this.#sizes.height/2;
        this.#camera.zoom = this.#sizes.height/(6*(
            this.#options.planetRadius*2
            + this.#options.satelliteRadius*8
        ));

        this.#camera.updateProjectionMatrix(true);
        
        // Update renderer
        this.#renderer.setSize(this.#sizes.width, this.#sizes.height);
    }

    #setupLight = () => {
        const ambientLight = new THREE.AmbientLight( 0xffffff );
	    this.#scene.add( ambientLight );
    }

    #setupCamera = () => {
        this.#camera = new THREE.OrthographicCamera(
            this.#sizes.height*this.#aspect / -2, 
            this.#sizes.height*this.#aspect / 2,  
            this.#sizes.height / -2, 
            this.#sizes.height / 2, 
            0, 
            this.#sizes.min);
        this.#camera.position.z = this.#sizes.min/2;
        this.#camera.rotation.x = (Math.PI/180)*-45; // -1.17
        // console.log(this.#camera.rotation.x)
        // this.#camera.rotation.x = Math.PI/2;
        // console.log(this.#camera.rotation.x)
        this.#camera.zoom = this.#sizes.height/(6*(
            this.#options.planetRadius*2
            + this.#options.satelliteRadius*8
        ));
        // animejs({
        //     targets: this.#camera,
        //     zoom: 1,
        //     loop: true,
        //     duration: 1000,
        //     direction: 'alternate',
        //     easing: 'linear',
        // })
        this.#scene.add(this.#camera);
    }

    #setupRenderer = () => {
        // @TODO move to DOMController
        const canvas = document.getElementById('scene');
        this.#renderer = new THREE.WebGLRenderer({
            canvas,
        });
        this.#renderer.setSize(this.#sizes.width, this.#sizes.height);
        this.#renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    #nextTick = () => {
        this.#loop();
        requestAnimationFrame(this.#nextTick);
    }

    #loop = () => {
        const deltaTime = this.#clock.getDelta();

        // console.log(this.#camera.rotation.x);

        this.#camera.updateProjectionMatrix(true);

        this.controls.update();
        this.#renderer.render(this.#scene, this.#camera);
    }

    #setupScene = () => {
        
        this.#planet = new Planet({
            radius: this.#options.planetRadius,
            fragments: 64,
        });
        this.#satellite = new Satellite({
            radius: this.#options.satelliteRadius,
        });
        this.#satellitePivot = new THREE.Group();
        this.#satellitePivot.add(this.#satellite);
        this.#satellite.position.x = this.#options.planetRadius + this.#options.satelliteRadius*2;
        this.#satellitePivot.rotation.z = 0;
        
        this.#scene.add(this.#planet);
        this.#scene.add(this.#satellitePivot);

        let i = 60;
        while(i--) {
            const asteroid = new Asteroid({
                radius: this.#options.asteroidRadius,
                scale: .65 + Math.random(),
            });
            const angle = Math.PI*2*Math.random();
            const minDistance = (
                this.#options.planetRadius*2
                + this.#options.satelliteRadius*8
            )*2;
            const maxDistance = 3*minDistance*Math.random() + minDistance;
            asteroid.setPosition(
                Math.cos(angle)*maxDistance,
                Math.sin(angle)*maxDistance,
            )
            // console.log(angle, Math.cos(angle)*maxDistance, Math.sin(angle)*maxDistance);
            this.#asteroids.push(asteroid.asteroid);
            this.#scene.add(asteroid.asteroid);
        }
    }

    setSatelliteRotation = (deg) => {
        this.#satellitePivot.rotation.z = deg;
    }

    constructor() {
        this.#scene = new THREE.Scene();
        this.#scene.background = new THREE.Color( 0x222222 );

        this.#clock = new THREE.Clock();

        this.#setupLight();
        this.#setupCamera();
        this.#setupRenderer();

        new PhisicsController();

        this.#setupScene();

        this.controls = new OrbitControls( this.#camera, this.#renderer.domElement );

        window.addEventListener('resize', this.#onResize);

        this.#nextTick();
    }
}

export default SceneController;