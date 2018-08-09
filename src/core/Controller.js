import { BUTTONS } from "./constants.js";

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

  keyDown(event) {
    switch (event.keyCode) {
      // Enter
      case 13: {
        this.buttons[BUTTONS.START] = 1;
        break;
      }
      // Select / Shift
      case 16: {
        this.buttons[BUTTONS.SELECT] = 1;
        break;
      }
      // A
      case 88: {
        this.buttons[BUTTONS.A] = 1;
        break;
      }
      // B
      case 67: {
        this.buttons[BUTTONS.B] = 1;
        break;
      }
      // Left
      case 37: {
        this.buttons[BUTTONS.LEFT] = 1;
        event.preventDefault();
        break;
      }
      // Up
      case 38: {
        this.buttons[BUTTONS.UP] = 1;
        event.preventDefault();
        break;
      }
      // Right
      case 39: {
        this.buttons[BUTTONS.RIGHT] = 1;
        event.preventDefault();
        break;
      }
      // Down
      case 40: {
        this.buttons[BUTTONS.DOWN] = 1;
        event.preventDefault();
        break;
      }
    }
  }

  keyUp(event) {
    switch (event.keyCode) {
      // Enter
      case 13: {
        this.buttons[BUTTONS.START] = 0;
        break;
      }
      // Select / Shift
      case 16: {
        this.buttons[BUTTONS.SELECT] = 0;
        break;
      }
      // A
      case 88: {
        this.buttons[BUTTONS.A] = 0;
        break;
      }
      // B
      case 67: {
        this.buttons[BUTTONS.B] = 0;
        break;
      }
      // Left
      case 37: {
        this.buttons[BUTTONS.LEFT] = 0;
        break;
      }
      // Up
      case 38: {
        this.buttons[BUTTONS.UP] = 0;
        break;
      }
      // Right
      case 39: {
        this.buttons[BUTTONS.RIGHT] = 0;
        break;
      }
      // Down
      case 40: {
        this.buttons[BUTTONS.DOWN] = 0;
        break;
      }
    }
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
