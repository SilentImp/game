import * as THREE from 'three';

class Satellite {
    #setellite;
    constructor({
        radius = 1,
        fragments = 16,
    }) {
        this.#setellite = new THREE.Mesh(
            new THREE.SphereGeometry(radius, fragments, fragments),
            new THREE.MeshBasicMaterial({color: 'lime'}),
        );

        return this.#setellite;
    }
}

export default Satellite;