import CPU from "./CPU";
import PPU from "./PPU";
import ROM from "./ROM";
import APU from "./APU";
import Controller from "./Controller";

import fetchROM from "../utils/Request";
import Notifier from "../utils/Notifier";

class Console extends Notifier {
  /**
   * Main class for the emulator, controls the hardware emulation.
   * Fires up events.
   */
  constructor() {
    super();
    this.cpu = new CPU();
    this.ppu = new PPU();
    this.apu = new APU();
    this.controller = new Controller();
    this.rom = null;

    // CPU, APU, PPU and controller are cross referenced in the code
    this.cpu.connect(this.apu, this.ppu, this.controller);
    this.ppu.connect(this.cpu);

    this.frameReq = null;
  }

  loadROM(path) {
    // TODO: Should directly take in the data, not the path
    return fetchROM(path).then(
      function(res) {
        this.rom = new ROM(res.data);
        this.cpu.connectROM(this.rom);
        this.ppu.connectROM(this.rom);
        this.reset();
      }.bind(this)
    );
  }

  getRomInfo() {
    if (this.rom !== null) {
      return this.rom.toJSON();
    }

    throw "No active ROM found";
  }

  reset() {
    this.cpu.reset();
    this.ppu.reset();
    this.notifyObservers("nes-reset", this.ppu.frameBuffer);
  }

  save() {
    // TODO: Need rom path / name
    var save_data = {
      ROM: this.rom.toJSON(),
      CPU: this.cpu.toJSON(),
      PPU: this.ppu.toJSON()
    };

    console.log(save_data);
  }

  load(data) {
    this.cpu.fromJSON(data.CPU);
    this.ppu.fromJSON(data.ROM);
  }

  start() {
    this.frameReq = requestAnimationFrame(this.frame.bind(this));
  }

  stop() {
    cancelAnimationFrame(this.frameReq);
  }

  tick() {
    var cycles = 0;
    cycles = this.cpu.tick();
    cycles = cycles * 3;

    for (; cycles > 0; cycles--) {
      this.ppu.tick();

      if (this.ppu.frameReady) {
        this.notifyObservers("frame-ready", [
          this.ppu.frameBuffer,
          this.ppu.frameBackgroundBuffer,
          this.ppu.frameSpriteBuffer,
          this.ppu.frameColorBuffer
        ]);
        this.ppu.acknowledgeFrame();
        return false;
      }
    }

    return true;
  }

  frame() {
    while (true) {
      if (!this.tick()) {
        break;
      }
    }
    this.frameReq = requestAnimationFrame(this.frame.bind(this));
  }
}

export default Console;
