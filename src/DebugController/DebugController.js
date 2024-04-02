import * as THREE from 'three';

export class DebugController {
    #scene;
    #physicsWorld;
    #lines = null;
    #dimensions;

    
    /**
     * Constructor for DebugController class.
     *
     * @param {RAPIER.World} physicsWorld - The physics object.
     * @param {THREE.scene} scene - The scene object.
     * @param {2 | 3} dimensions - The dimensions of the physics (default is 2).
     * @return {void} Calls the update method to draw debug lines.
     */
    constructor({
        physicsWorld,
        scene,
        dimensions = 2,
    }) {
        if ([2, 3].indexOf(dimensions) === -1) {
            throw new Error('Only 2 and 3 dimension physics are supported');
        }
        this.#dimensions = dimensions;
        this.#scene = scene;
        this.#physicsWorld = physicsWorld;
        this.update();
    }

    /**
     * Initialize debug lines
     */
    #init = () => {
        let material = new THREE.LineBasicMaterial({
            color: 0xffffff,
            vertexColors: true
        });
        let geometry =  new THREE.BufferGeometry();
        this.#lines = new THREE.LineSegments(geometry, material);
        this.#scene.add(this.#lines);
    }

    /**
     * Update debug lines
     * You will need to call this method every frame in your scene loop
     */
    update = () => {
        if (this.#lines === null) this.#init();
        const { vertices, colors } = this.#physicsWorld.debugRender();
        this.#lines.geometry.setAttribute('position', new THREE.BufferAttribute(vertices, this.#dimensions));
        this.#lines.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4));
    }

    /**
     * Remove debug lines in non-blocking way
     * You will need to call this method when you want to switch off debug mode
     */
    clean = () => {
        this.#lines.material.visible = false;
        if (typeof requestIdleCallback === 'function') {
            requestIdleCallback(this.#removeHandler);
        } else {
            setTimeout(this.#removeHandler, 1);
        }
        
    }

    /**
     * Remove debug lines
     */
    #removeHandler = () => {
        this.#removeElement(this.#lines);
        this.#lines = null;
    }

    
    /**
     * Remove the given object3D and its associated resources from the scene.
     *
     * @param {THREE.Object3D} object3D - The object3D to be removed.
     * @return {boolean} Returns `true` if the object3D was successfully removed, `false` otherwise.
     */
    #removeElement(object3D) {
        if (!(object3D instanceof THREE.Object3D)) return false;
        if (object3D.geometry) object3D.geometry.dispose();
        if (object3D.material) {
            if (object3D.material instanceof Array) {
                object3D.material.forEach(material => material.dispose());
            } else {
                object3D.material.dispose();
            }
        }
        object3D.removeFromParent();
        return true;
    }

}