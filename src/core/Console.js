import CPU from "./CPU";
import PPU from "./PPU";
import ROM from "./ROM";
import APU from "./APU";
import Controller from "./Controller";
import { MODES, OPCODES, INTERRUPTS } from "./constants.js";

import { mergeDeep } from "../utils/Merge";
import fetchROM from "../utils/Request";
import Notifier from "../utils/Notifier";

/**
 * Main class for the emulator, controls the hardware emulation.
 * Fires up events.
 */
class Console extends Notifier {
  constructor() {
    super();
    this.cpu = new CPU();
    this.ppu = new PPU();
    this.apu = new APU();
    this.controller = new Controller();
    this.rom = null;
    this.cycles = 0;
    this.interrupt = null;
    this.quickSaveData = null;

    // CPU, APU, PPU and controller are cross referenced in the code
    this.cpu.connect(this.apu, this.ppu, this.controller);
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
    this.rom = new ROM(data);
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

  quickSave() {
    // Ok so, this is a bit of a mess here
    // Save also bundles the current ROM, and our memory buffers take a lot of place.
    // localStorage has a strict threshold for what you can store.
    // To work around this, Make a clone of the current NES object and empty the memory buffers
    var quickSaveData = JSON.parse(JSON.stringify(this.cpu));

    quickSaveData.ppu.frameBuffer = [];
    quickSaveData.ppu.frameBackgroundBuffer = [];
    quickSaveData.ppu.frameSpriteBuffer = [];
    quickSaveData.ppu.frameColorBuffer = [];
    quickSaveData.ppu.patternTable1 = [];
    quickSaveData.ppu.patternTable2 = [];

    this.notifyObservers("nes-quick-save");
    localStorage.quickSave = JSON.stringify(quickSaveData);
  }

  loadQuickSave(data) {
    if (localStorage.quickSave) {
      this.cpu = mergeDeep(this.cpu, JSON.parse(localStorage.quickSave));
      this.notifyObservers("nes-load-quick-save");
    }
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

  /**
   *  Same a tick() but with additional notify calls for debug purposes.
   *  Slows down the main loop which is why it needs a separate codepath
   */
  tickDebug() {
    this.cycles = this.cpu.tick();
    this.cycles = this.cycles * 3;

    this.notifyObservers("cpu-tick", [
      this.cpu.instrCode,
      this.opCodesKeys[this.cpu.instrOpCode],
      this.modeKeys[this.cpu.instrMode],
      this.cpu.instrSize,
      this.cpu.instrCycles,
      this.cpu.addr
    ]);

    for (; this.cycles > 0; this.cycles--) {
      this.interrupt = this.ppu.tick();

      if (this.interrupt !== null) {
        if (this.interrupt === INTERRUPTS.NMI) {
          this.cpu.triggerNMI();
        } else {
          this.cpu.triggerIRQ();
        }
      }
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
    this.cycles = this.cpu.tick();
    this.cycles = this.cycles * 3;

    for (; this.cycles > 0; this.cycles--) {
      this.interrupt = this.ppu.tick();

      if (this.interrupt !== null) {
        if (this.interrupt === INTERRUPTS.NMI) {
          this.cpu.triggerNMI();
        } else {
          this.cpu.triggerIRQ();
        }
      }

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
