import * as THREE from 'three';

class Planet {
    #planet;
    constructor({
        radius = 1,
        fragments = 16,
    }) {
        this.#planet = new THREE.Mesh(
            new THREE.SphereGeometry(radius, fragments, fragments),
            new THREE.MeshNormalMaterial()
        );


        return this.#planet;
    }
}

export default Planet;