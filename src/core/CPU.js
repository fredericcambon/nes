import _ from "lodash";

import CPUMemory from "../core/CPUMemory";

import { INTERRUPTS, OPCODES } from "./constants.js";

import { instructions } from "./instructions.js";

import { modes } from "./modes.js";

import { opcodes } from "./opcodes.js";

class CPU {
  constructor() {
    // Hardware connected to CPU
    this.memory = new CPUMemory();
    this.mapper = null;
    this.apu = null;
    this.ppu = null;
    this.controller = null;

    // Cycles Counter
    this.cycles = 0;
    // Branch counter used by some opcodes for extra cycles
    // when pages are crossed
    this.b = 0;

    // Program Counter
    this.pc = 0x00;
    // Stack Pointer
    this.sp = 0x00;

    // Registers
    this.a = 0;
    this.x = 0;
    this.y = 0;

    // Flags
    this.c = 0; // Carry flag
    this.z = 0; // Zero flag
    this.i = 0; // Interrupt flag
    this.d = 0; // Decimal flag
    // Break flag
    this.v = 0; // Overflow flag
    this.n = 0; // Negative flag
    // Unused flag

    // Interrupt type
    this.interrupt = null;

    this._modes = modes;
    this._instructions = instructions;
    this._opcodes = opcodes;

    this.stallCounter = 0;

    // Tick variables
    this.tmpCycles = 0;
    this.instrCycles = 0;
    this.instrCode = 0;
    this.instrOpCode = 0;
    this.instrMode = 0;
    this.instrSize = 0;
    this.addr = 0;
  }

  /*

  toJSON() {
    return {
      memory: this.memory.toJSON(),
      cycles: this.cycles,
      b: this.b,
      pc: this.pc,
      sp: this.sp,
      a: this.a,
      x: this.x,
      y: this.y,
      c: this.c,
      z: this.z,
      i: this.i,
      d: this.d,
      v: this.v,
      n: this.n,
      interrupt: this.interrupt,
      stallCounter: this.stallCounter
    };
  }

  */

  loadJSON(obj) {}

  connect(apu, ppu, controller) {
    this.apu = apu;
    this.ppu = ppu;
    this.controller = controller;
  }

  connectROM(rom) {
    // Improve that
    //this.mapper = rom.mapper;
    //this.mapper.cpu = this;
  }

  stall() {
    if (this.cycles % 2 === 1) {
      this.stallCounter += 514;
    } else {
      this.stallCounter += 513;
    }
  }

  reset() {
    this.cycles = 0;
    this.a = 0;
    this.x = 0;
    this.y = 0;
    this.interrupt = null;
    this.stallCounter = 0;
    this.pc = this.read16(0xfffc);
    this.sp = 0xfd;
    this.setFlags(0x24);
  }

  tick() {
    this.tmpCycles = this.cycles;
    this.b = 0;

    // Stalled after PPU OAMDMA
    if (this.stallCounter > 0) {
      this.stallCounter--;
      // Should return 1 but this somehow fixes some games.
      // Probably due to CPU being not exactly accurate
      // ¯\_(ツ)_/¯
      return 0;
    }

    // TODO Not DRY
    if (this.interrupt !== null) {
      switch (this.interrupt) {
        case INTERRUPTS.NMI: {
          this.stackPush16(this.pc);
          this.stackPush8(this.getFlags() & ~0x10);
          this.pc = this.read16(0xfffa);
          this.i = 1;
          this.cycles += 7;
          break;
        }
        case INTERRUPTS.IRQ: {
          if (this.i === 0) {
            this.stackPush16(this.pc);
            this.stackPush8(this.getFlags() & ~0x10);
            this.pc = this.read16(0xfffe);
            this.i = 1;
            this.cycles += 7;
          }
        }
        default: {
          break;
        }
      }

      this.interrupt = null;

      return 7;
    }

    try {
      this.instrCode = this.read8(this.pc);
    } catch (err) {
      throw "Could not read next instruction: " + err;
    }

    [
      this.instrOpCode,
      this.instrMode,
      this.instrSize,
      this.instrCycles
    ] = this._instructions[this.instrCode];

    this.addr = this._modes[this.instrMode](this);

    this.pc += this.instrSize;
    this.cycles += this.instrCycles;

    this._opcodes[this.instrOpCode](this.addr, this);

    return this.cycles - this.tmpCycles;
  }

  /**
   * Interrupts
   */
  triggerNMI() {
    this.interrupt = INTERRUPTS.NMI;
  }

  triggerIRQ() {
    this.interrupt = INTERRUPTS.IRQ;
  }

  /**
   * Read & Write methods
   *
   * CPU RAM: 0x0000 => 0x2000
   * PPU Registers: 0x2000 => 0x4000
   * Controller: 0x4016
   * Controller2: 0x4016
   * ROM Mapper: 0x6000 => 0x10000
   */

  read8(addr) {
    if (addr < 0x2000) {
      return this.memory.read8(addr);
    } else if (addr < 0x4000) {
      // 7 bytes PPU registers
      // mirrored from 0x2000 to 0x4000
      return this.ppu.read8(0x2000 + addr % 8);
    } else if (addr == 0x4014) {
      return this.ppu.read8(addr);
    } else if (addr == 0x4015) {
      return this.apu.read8();
    } else if (addr == 0x4016) {
      return this.controller.read8();
    } else if (addr == 0x4017) {
      return 0;
    } else if (addr < 0x6000) {
      console.log("I/O REGISTERS");
      return 0;
    } else {
      return this.ppu.memory.mapper.read8(addr);
    }
  }

  read16(addr) {
    // Read two bytes and concatenate them
    return (this.read8(addr + 1) << 8) | this.read8(addr);
  }

  read16indirect(addr) {
    // Special read16 method for indirect mode reading (NES bug)
    var addr2 = (addr & 0xff00) | (((addr & 0xff) + 1) & 0xff);
    var lo = this.read8(addr);
    var hi = this.read8(addr2);

    return (hi << 8) | lo;
  }

  write8(addr, value) {
    if (addr < 0x2000) {
      this.memory.write8(addr, value);
    } else if (addr < 0x4000) {
      // 7 bytes PPU registers
      // mirrored from 0x2000 to 0x4000
      this.ppu.write8(0x2000 + addr % 8, value);
    } else if (addr == 0x4014) {
      // This might seem a bit odd but this avoids circular reference (ppu using cpu methods)
      addr = value << 8;
      this.ppu.tmpOamAddress = this.ppu.oamAddress;

      for (var i = 0; i < 256; i++) {
        this.ppu.oamData[this.ppu.oamAddress] = this.read8(addr);
        this.ppu.oamAddress++;
        addr++;
      }

      this.ppu.oamAddress = this.ppu.tmpOamAddress;
      this.stall();
    } else if (addr == 0x4015) {
      this.apu.write8(addr, value);
    } else if (addr == 0x4016) {
      this.controller.write8(value);
    } else if (addr == 0x4017) {
      // TODO sound
    } else if (addr >= 0x6000) {
      // Write to mapper (handled by PPU)
      this.ppu.memory.mapper.write8(addr, value);
    } else if (addr < 0x6000) {
      // console.log('I/O REGISTERS');
    }
  }

  /**
   * Stack methods
   */

  stackPush8(value) {
    this.memory.stack[this.sp] = value;
    this.sp = (this.sp - 1) & 0xff;
  }

  stackPush16(value) {
    // Get the 8 highest bits
    // Truncate the 8 lower bits
    // Push the two parts of `value`
    this.stackPush8(value >> 8);
    this.stackPush8(value & 0xff);
  }

  stackPull8(value) {
    this.sp = (this.sp + 1) & 0xff;
    return this.memory.stack[this.sp];
  }

  stackPull16(value) {
    return this.stackPull8() | (this.stackPull8() << 8);
  }

  /**
   * Flag methods
   */

  setZeroFlag(value) {
    if (value === 0) {
      this.z = 1;
    } else {
      this.z = 0;
    }
  }

  setNegativeFlag(value) {
    if ((value & 0x80) !== 0) {
      this.n = 1;
    } else {
      this.n = 0;
    }
  }

  getFlags() {
    // Concatenate the values of the flags in an int
    var flags = 0;

    flags = flags | (this.c << 0);
    flags = flags | (this.z << 1);
    flags = flags | (this.i << 2);
    flags = flags | (this.d << 3);
    flags = flags | (0 << 4);
    flags = flags | (1 << 5);
    flags = flags | (this.v << 6);
    flags = flags | (this.n << 7);

    return flags;
  }

  setFlags(value) {
    this.c = (value >> 0) & 1;
    this.z = (value >> 1) & 1;
    this.i = (value >> 2) & 1;
    this.d = (value >> 3) & 1;
    this.v = (value >> 6) & 1;
    this.n = (value >> 7) & 1;
  }
}

export default CPU;
