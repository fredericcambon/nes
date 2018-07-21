/**
 * Helper to encapsulate throttling logic
 */
class Throttle {
  constructor(fps) {
    this.fpsInterval = 1000 / fps;
    this.now = null;
    this.elapsed = null;
    this.then = null;
  }

  isThrottled() {
    this.now = Date.now();
    this.elapsed = this.now - this.then;

    if (this.elapsed > this.fpsInterval) {
      this.then = this.now - (this.elapsed % this.fpsInterval);
      return false;
    }
    return true;
  }
}

export default Throttle;
