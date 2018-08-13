import { KEYBOARD_KEYS, BUTTONS } from "./constants.js";

/**
 * The 8 controller buttons are mapped on 8bits
 */
class Controller {
  constructor() {
    this.buttons = new Array(8).fill(0);
    // Switch
    this.strobe = 0;
    this.i = 0;

    // Welp ... Don't have a better idea
    document.addEventListener("keydown", this.keyDown.bind(this));
    document.addEventListener("keyup", this.keyUp.bind(this));
  }

  _checkInput(event, value) {
    switch (event.keyCode) {
      case KEYBOARD_KEYS.START: {
        this.buttons[BUTTONS.START] = value;
        break;
      }
      case KEYBOARD_KEYS.SELECT: {
        this.buttons[BUTTONS.SELECT] = value;
        break;
      }
      case KEYBOARD_KEYS.A: {
        this.buttons[BUTTONS.A] = value;
        break;
      }
      case KEYBOARD_KEYS.B: {
        this.buttons[BUTTONS.B] = value;
        break;
      }
      case KEYBOARD_KEYS.LEFT: {
        this.buttons[BUTTONS.LEFT] = value;
        event.preventDefault();
        break;
      }
      case KEYBOARD_KEYS.UP: {
        this.buttons[BUTTONS.UP] = value;
        event.preventDefault();
        break;
      }
      case KEYBOARD_KEYS.RIGHT: {
        this.buttons[BUTTONS.RIGHT] = value;
        event.preventDefault();
        break;
      }
      case KEYBOARD_KEYS.DOWN: {
        this.buttons[BUTTONS.DOWN] = value;
        event.preventDefault();
        break;
      }
    }
  }

  keyDown(event) {
    this._checkInput(event, 1);
  }

  keyUp(event) {
    this._checkInput(event, 0);
  }

  write8(value) {
    this.strobe = value;
    if ((this.strobe & 1) === 1) {
      this.i = 0;
    }
  }

  read8() {
    var value = this.buttons[this.i];
    this.i++;

    return value;
  }
}

export default Controller;
