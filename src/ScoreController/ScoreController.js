import './ScoreController.css';

class ScoreController {
  #element;
  #fragment;
  
  constructor() {
    // Only makes sense for view
    if (typeof document === 'undefined') return;
    this.#fragment = new DocumentFragment();
    this.#element = document.createElement("div");
    this.#element.className = 'score-controller';
    this.#fragment.appendChild(this.#element);
    document.body.appendChild(this.#fragment);
  }

  update = (score) => {
    this.#element.textContent = score;
  };

  remove = () => {
    this.#fragment.remove();
  }
}

export default ScoreController;