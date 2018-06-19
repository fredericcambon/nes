import CPU from "./CPU";
import PPU from "./PPU";
import ROM from "./ROM";
import APU from "./APU";
import Controller from "./Controller";
import { MODES, OPCODES } from "./constants.js";

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

    // Debug variables
    this.frameNbr = 0;
    this.opCodesKeys = Object.keys(OPCODES);
    this.modeKeys = Object.keys(MODES);
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

  loadROMData(data) {
    // TODO: Should directly take in the data, not the path
    this.rom = new ROM(data);
    this.cpu.connectROM(this.rom);
    this.ppu.connectROM(this.rom);
    this.reset();
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
    this._tick = this.tick;
    this.frameReq = requestAnimationFrame(this.frame.bind(this));
  }

  startDebug() {
    this._tick = this.tickDebug;
    this.frameReq = requestAnimationFrame(this.frame.bind(this));
  }

  stop() {
    cancelAnimationFrame(this.frameReq);
  }

  tickDebug() {
    /**
       Same a tick() but with additional notify calls for debug purposes.
       Slows down the main loop which is why it needs a separate codepath
     */
    var cycles = 0;
    cycles = this.cpu.tick();
    cycles = cycles * 3;

    this.notifyObservers("cpu-tick", [
      this.cpu.instrCode,
      this.opCodesKeys[this.cpu.instrOpCode],
      this.modeKeys[this.cpu.instrMode],
      this.cpu.instrSize,
      this.cpu.instrCycles,
      this.cpu.addr
    ]);

    for (; cycles > 0; cycles--) {
      this.ppu.tick();

      // Check when next scanline is done

      this.notifyObservers("ppu-tick");

      if (this.ppu.frameReady) {
        this.notifyObservers("frame-ready", this.ppu.frameBuffer);
        this.notifyObservers("frame-ready-debug");

        this.ppu.acknowledgeFrame();
        this.frameNbr++;
        return false;
      }
    }

    return true;
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
      if (!this._tick()) {
        break;
      }
    }
    this.frameReq = requestAnimationFrame(this.frame.bind(this));
  }
}

export default Console;
