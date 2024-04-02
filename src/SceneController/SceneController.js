import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class SceneController {
    #scene;
    #clock;
    #camera;
    #renderer;

    #options = {
        planetRadius: 15,
        satelliteRadius: 3,
        asteroidRadius: 3,
    };

    sizes = {
        width: window.innerWidth,
        height: window.innerHeight,
        min: Math.min(window.innerWidth, window.innerHeight),
        max: Math.max(window.innerWidth, window.innerHeight),
    };

    #aspect = this.sizes.width/this.sizes.height;

    add = (element) => {
        this.#scene.add(element);
    }

    #onResize = () => {
        // Update size and ratio
        this.sizes.width = window.innerWidth;
        this.sizes.height = window.innerHeight;
        this.sizes.min = Math.min(window.innerWidth, window.innerHeight);
        this.sizes.max = Math.max(window.innerWidth, window.innerHeight);
        this.#aspect = this.sizes.width/this.sizes.height;
        
        // Update camera
        this.#camera.left = this.sizes.height*this.#aspect/-2;
        this.#camera.right = this.sizes.height*this.#aspect/2;
        this.#camera.top = this.sizes.height/-2;
        this.#camera.bottom = this.sizes.height/2;
        this.#camera.zoom = this.sizes.height/(6*(
            this.#options.planetRadius*2
            + this.#options.satelliteRadius*8
        ));

        this.#camera.updateProjectionMatrix(true);
        
        // Update renderer
        this.#renderer.setSize(this.sizes.width, this.sizes.height);
    }

    #setupLight = () => {
        const ambientLight = new THREE.AmbientLight( 0xffffff );
	    this.#scene.add( ambientLight );
    }

    #setupCamera = () => {
        this.#camera = new THREE.OrthographicCamera(
            this.sizes.height*this.#aspect / -2, 
            this.sizes.height*this.#aspect / 2,  
            this.sizes.height / -2, 
            this.sizes.height / 2, 
            0, 
            this.sizes.min);
        this.#camera.position.z = this.sizes.min/2;
        this.#camera.rotation.x = (Math.PI/180)*-45;
        this.#camera.zoom = this.sizes.height/(6*(
            this.#options.planetRadius*2
            + this.#options.satelliteRadius*8
        ));
        // animejs({
        //     targets: this.#camera,
        //     zoom: .1,
        //     loop: true,
        //     duration: 4000,
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
        this.#renderer.setSize(this.sizes.width, this.sizes.height);
        this.#renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    getDelta = () => {
        return this.#clock.getDelta();
    }

    get radius() {
        return Math.sqrt(this.sizes.width**2 + this.sizes.height**2)/2;
    }

    update = () => {
        const deltaTime = this.#clock.getDelta();
        this.#camera.updateProjectionMatrix(true);

        this.controls.update();
        this.#renderer.render(this.#scene, this.#camera);
    }

    getDistance = () => {
        return this.radius*3.5;
    }

    constructor() {
        this.#scene = new THREE.Scene();
        this.#scene.background = new THREE.Color( 0x222222 );

        this.#clock = new THREE.Clock();

        this.#setupLight();
        this.#setupCamera();
        this.#setupRenderer();

        this.controls = new OrbitControls( this.#camera, this.#renderer.domElement );

        window.addEventListener('resize', this.#onResize);
    }
}

export default SceneController;