import * as THREE from 'three';

class SpeedVector {
  static #material = new THREE.LineBasicMaterial( {
    color: 0xffffff,
  } );

  vector;
  #geometry;
  #vectorLength;

  constructor({
    vectorLength = 20,
    speedVector = {
      x: 0,
      y: 0,
    }
  }) {
    this.#vectorLength = vectorLength;
    const points = [];
    points.push( new THREE.Vector3( 0, 0, 0 ) );
    const magnitude = Math.sqrt(
      Math.pow(speedVector.x, 2) + 
      Math.pow(speedVector.y, 2)
    );
    points.push(new THREE.Vector3(
      this.#vectorLength*(speedVector.x)/magnitude,
      this.#vectorLength*(speedVector.y)/magnitude, 
      0, 
    ));
    this.#geometry = new THREE.BufferGeometry().setFromPoints( points );
    this.vector = new THREE.Line( this.#geometry, SpeedVector.#material );
  }

  remove = () => {
    if (!(this.vector instanceof THREE.Object3D)) return false;
    this.vector.removeFromParent();
    this.#geometry.dispose();
  };

  update = (speedVector = {
    x: 0,
    y: 0,
  }) => {
    const points = [];  
    points.push( new THREE.Vector3( 0, 0, 0 ) );
    const magnitude = Math.sqrt(
      Math.pow(speedVector.x, 2) + 
      Math.pow(speedVector.y, 2)
    );
    points.push(new THREE.Vector3(
      this.#vectorLength*(speedVector.x)/magnitude,
      this.#vectorLength*(speedVector.y)/magnitude, 
      0, 
    ));
    this.#geometry.dispose();
    this.#geometry = new THREE.BufferGeometry().setFromPoints( points );
    this.vector.geometry = this.#geometry;
  };
}

export default SpeedVector;