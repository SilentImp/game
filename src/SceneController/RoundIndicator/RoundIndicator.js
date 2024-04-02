import anime from 'animejs';
import * as THREE from 'three';

class RoundIndicator {
  #segments = 64;
  #radius;
  #width
  #x;
  #y;
  #z;
  #scene;
  #valueMesh;
  #hasBase;
  #baseMesh;
  #zOffset = -.1;
  #baseOffset;
  #hasSpaceMesh;
  #spaceMesh;
  #dropHandler;

  #color = [
    'rgba(222,13,13,.5)',
    'rgba(222,76,13,.5)',
    'rgba(222,194,13,.5)',
    'rgba(149,222,13,.5)',
    'rgba(13,222,205,.5)',
  ];
  currentColor = this.#color[0];
  lastColor = this.currentColor;

  percent = 0;
  lastPercent = this.percent;

  constructor({
    percent = 70,
    radius = 30,
    width = 4,
    x = 0,
    y = 0,
    z = 0,
    parent: scene,
    hasBase = false,
    baseOffset = 1,
    hasSpaceMesh = false,
    dropHandler = () => { },
  }) {
    this.#dropHandler = dropHandler;
    this.#hasSpaceMesh = hasSpaceMesh;
    this.#radius = radius;
    this.#width = width;
    this.percent = percent;
    this.lastPercent = this.percent;
    this.#x = x;
    this.#y = y;
    this.#z = z;
    this.#scene = scene;
    this.#hasBase = hasBase;
    this.#baseOffset = baseOffset;
    this.currentColor = this.#getColor(percent);

    const outerRadius = this.#radius + this.#width;
    const innerRadius = this.#radius;
    const endAngle = Math.PI * 2 * this.percent / 100;
    const startAngle = 0;
    const segments = this.#segments * this.percent / 100;

    if (this.#hasBase) {
      const sectorGeometry = this.#buildArcGeometry({
        outerRadius: outerRadius + this.#baseOffset,
        innerRadius: innerRadius - this.#baseOffset,
        startAngle: 0,
        endAngle: Math.PI * 2,
        segments: this.#segments,
        x,
        y,
      });
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
      this.#baseMesh = new THREE.Mesh(sectorGeometry, material);
      this.#baseMesh.position.z = this.#zOffset;
      scene.add(this.#baseMesh);
    }

    const sectorGeometry = this.#buildArcGeometry({
      outerRadius,
      innerRadius,
      startAngle,
      endAngle,
      segments,
      x,
      y,
    });

    const rgb = this.#parseRGBA(this.currentColor);
    const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
    material.transparent = true;
    material.color = new THREE.Color(`rgb(${rgb[0]},${rgb[1]},${rgb[2]})`);
    material.opacity = rgb[3];
    this.#valueMesh = new THREE.Mesh(sectorGeometry, material);
    scene.add(this.#valueMesh);

    if (this.#hasSpaceMesh) {
      const sectorGeometry = this.#buildArcGeometry({
        outerRadius,
        innerRadius,
        startAngle: endAngle,
        endAngle: startAngle,
        segments: this.#segments,
        x: this.#x,
        y: this.#y,
      });

      const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
      material.transparent = true;
      material.opacity = 0.25;

      this.#spaceMesh = new THREE.Mesh(sectorGeometry, material);
      scene.add(this.#spaceMesh);
    }

  }

  #buildArcGeometry({
    innerRadius = 10,
    outerRadius = 12,
    startAngle = 0,
    endAngle = Math.PI * 2,
    segments = 64
  }) {
    // Create a shape for the sector of the donut
    const sectorShape = new THREE.Shape();

    // Define the starting point of the sector
    sectorShape.moveTo(outerRadius * Math.cos(startAngle), outerRadius * Math.sin(startAngle));

    // Define the outer arc of the sector
    sectorShape.absarc(0, 0, outerRadius, startAngle, endAngle, false);

    // Define the ending point of the sector
    sectorShape.lineTo(innerRadius * Math.cos(endAngle), innerRadius * Math.sin(endAngle));

    // Define the inner arc of the sector
    sectorShape.absarc(0, 0, innerRadius, endAngle, startAngle, true);

    // Close the sector
    sectorShape.closePath();

    // Create geometry from the sector shape
    const sectorGeometry = new THREE.ShapeGeometry(sectorShape, segments);

    return sectorGeometry;
  }

  setPosition = (x = 0, y = 0, z = 0) => {
    this.#x = x;
    this.#y = y;
    this.#z = z;
    if (this.#valueMesh) this.#valueMesh.position.set(x, y, z);
    if (this.#spaceMesh) this.#spaceMesh.position.set(x, y, z);
    if (this.#baseMesh) this.#baseMesh.position.set(x, y, z + this.#baseOffset);
  }

  set value(percent) {
    anime.remove(this);
    anime({
      targets: this,

      percent: {
        value: percent,
        easing: 'spring(1, 80, 10, 0)',
      },

      currentColor: {
        value: this.#getColor(percent),
        easing: 'linear',
      },
    });
  }

  #parseRGBA = (string) => string
    .split(',')
    .map((part) => part.replaceAll(/[^0-9.]/ig, ''))
    .map((part) => parseFloat(part, 10));

  #getColor = (percent) => {
    const index = Math.floor((this.#color.length - 1) * (percent / 100));
    return this.#color[index];
  }

  updateImmidiate(percent) {
    const updatedPercent = Math.max(0, percent);
    const outerRadius = this.#radius + this.#width;
    const innerRadius = this.#radius;
    const endAngle = Math.PI * 2 * updatedPercent / 100;
    const startAngle = 0;
    const segments = this.#segments * updatedPercent / 100;

    if (this.#valueMesh instanceof THREE.Object3D) {
      this.#valueMesh.geometry?.dispose();
      this.#valueMesh.geometry = this.#buildArcGeometry({
        outerRadius,
        innerRadius,
        startAngle,
        endAngle,
        segments,
        x: this.#x,
        y: this.#y,
      });
    }

    if (this.#spaceMesh instanceof THREE.Object3D) {
      this.#spaceMesh.geometry?.dispose();
      this.#spaceMesh.geometry = this.#buildArcGeometry({
        outerRadius,
        innerRadius,
        startAngle: endAngle,
        endAngle: startAngle,
        segments: this.#segments - segments,
        x: this.#x,
        y: this.#y,
      });
    }
  }

  remove = () => {
    if (this.#valueMesh instanceof THREE.Object3D) this.#valueMesh.removeFromParent();
    if (this.#spaceMesh instanceof THREE.Object3D) this.#spaceMesh.removeFromParent();
    if (this.#baseMesh instanceof THREE.Object3D) this.#baseMesh.removeFromParent();
    this.#dropHandler();
  };

  update = () => {
    if (this.#valueMesh instanceof THREE.Object3D) {
      if (this.lastPercent !== this.percent) {
        this.updateImmidiate(this.percent);
        this.lastPercent = this.percent;
      }

      if (this.lastColor !== this.currentColor) {
        const rgb = this.#parseRGBA(this.currentColor);
        this.#valueMesh.material.color = new THREE.Color(`rgb(${rgb[0]},${rgb[1]},${rgb[2]})`);
        this.#valueMesh.material.opacity = rgb[3];
        this.#valueMesh.material.needsUpdate = true;
        this.lastColor = this.currentColor;
      }
    }
  }
}

export default RoundIndicator;


