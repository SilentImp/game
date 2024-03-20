import * as THREE from 'three';

class Asteroid {
    asteroid;
    static #geometry;
    static #material;

    setPosition = (x, y) => {
        this.asteroid.position.x = x;
        this.asteroid.position.y = y;
    }

    constructor({
        radius = 1,
        fragments = 16,
        scale = 1,
    }) {
        if (Asteroid.#geometry === undefined) {
            Asteroid.#geometry = new THREE.SphereGeometry(radius, fragments, fragments);
        }

        if (Asteroid.#material === undefined) {
            Asteroid.#material = new THREE.MeshBasicMaterial({color: 'red'});
        }

        this.asteroid = new THREE.Mesh(
            Asteroid.#geometry,
            Asteroid.#material,
        );

        this.asteroid.scale.set(scale, scale, scale);
    }
}

export default Asteroid;