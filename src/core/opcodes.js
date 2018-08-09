import { OPCODES } from "./constants.js";

import { isPageCrossed } from "./utils.js";

export var opcodes = {
  /**
   *     http://obelisk.me.uk/6502/reference.html
   */

  // Add with Carry
  [OPCODES.ADC]: (addr, cpu) => {
    var a = cpu.a;
    var value = cpu.read8(addr);
    cpu.a = a + value + cpu.c;

    if (cpu.a > 0xff) {
      cpu.c = 1;
    } else {
      cpu.c = 0;
    }

    // Useless?
    cpu.a = cpu.a & 0xff;

    if (((a ^ value) & 0x80) === 0 && ((a ^ cpu.a) & 0x80) !== 0) {
      cpu.v = 1;
    } else {
      cpu.v = 0;
    }

    cpu.setNegativeFlag(cpu.a);
    cpu.setZeroFlag(cpu.a);

    cpu.cycles += cpu.b;
  },

  // Set Interrupt Disable
  [OPCODES.SEI]: (addr, cpu) => {
    cpu.i = 1;
  },

  // Clear Carry Flag
  [OPCODES.CLC]: (addr, cpu) => {
    cpu.c = 0;
  },

  // Clear Overflow Flag
  [OPCODES.CLV]: (addr, cpu) => {
    cpu.v = 0;
  },

  // Transfer Stack pointer to X
  [OPCODES.TSX]: (addr, cpu) => {
    cpu.x = cpu.sp;
    cpu.setNegativeFlag(cpu.x);
    cpu.setZeroFlag(cpu.x);
  },

  // Transfer Accumulator to X
  [OPCODES.TAX]: (addr, cpu) => {
    cpu.x = cpu.a;
    cpu.setNegativeFlag(cpu.x);
    cpu.setZeroFlag(cpu.x);
  },

  // Pull Accumulator
  [OPCODES.PLA]: (addr, cpu) => {
    cpu.a = cpu.stackPull8();
    cpu.setNegativeFlag(cpu.a);
    cpu.setZeroFlag(cpu.a);
  },

  // Decrement Memory
  [OPCODES.DEC]: (addr, cpu) => {
    var value = cpu.read8(addr);
    value = (value - 1) & 0xff;

    cpu.setNegativeFlag(value);
    cpu.setZeroFlag(value);
    cpu.write8(addr, value);
  },

  // Decrement Y Register
  [OPCODES.DEY]: (addr, cpu) => {
    cpu.y = (cpu.y - 1) & 0xff;
    cpu.setNegativeFlag(cpu.y);
    cpu.setZeroFlag(cpu.y);
  },

  // Decrement X Register
  [OPCODES.DEX]: (addr, cpu) => {
    cpu.x = (cpu.x - 1) & 0xff;
    cpu.setZeroFlag(cpu.x);
    cpu.setNegativeFlag(cpu.x);
  },

  // Transfer X to Stack Pointer
  [OPCODES.TXS]: (addr, cpu) => {
    cpu.sp = cpu.x;
  },

  // Transfer X to A
  [OPCODES.TXA]: (addr, cpu) => {
    cpu.a = cpu.x;
    cpu.setZeroFlag(cpu.a);
    cpu.setNegativeFlag(cpu.a);
  },

  // Clear Decimal Mode
  [OPCODES.CLD]: (addr, cpu) => {
    cpu.d = 0;
  },

  // Push Processor Status
  [OPCODES.PHP]: (addr, cpu) => {
    cpu.stackPush8(cpu.getFlags() | 0x10);
  },

  // Force Interrupt
  // TODO: http://nesdev.com/the%20'B'%20flag%20&%20BRK%20instruction.txt
  [OPCODES.BRK]: (addr, cpu) => {
    cpu.stackPush16(cpu.pc + 1);
    // PHP
    cpu.stackPush8(cpu.getFlags() | 0x18);
    // SEI
    cpu.i = 1;
    cpu.pc = cpu.read16(0xfffe);
  },

  // Jump to subroutine
  [OPCODES.JSR]: (addr, cpu) => {
    cpu.stackPush16(cpu.pc - 1);
    cpu.pc = addr & 0xffff;
  },

  // Branch if Overflow clear
  [OPCODES.BVC]: (addr, cpu) => {
    if (cpu.v === 0) {
      cpu.cycles += isPageCrossed(cpu.pc, addr) ? 2 : 1;
      cpu.pc = addr & 0xffff;
    }
  },

  // Branch if Overflow set
  [OPCODES.BVS]: (addr, cpu) => {
    if (cpu.v === 1) {
      cpu.cycles += isPageCrossed(cpu.pc, addr) ? 2 : 1;
      cpu.pc = addr & 0xffff;
    }
  },

  // Branch if Equal
  [OPCODES.BEQ]: (addr, cpu) => {
    if (cpu.z === 1) {
      cpu.cycles += isPageCrossed(cpu.pc, addr) ? 2 : 1;
      cpu.pc = addr & 0xffff;
    }
  },

  // Branch if Carry Set
  [OPCODES.BCS]: (addr, cpu) => {
    if (cpu.c === 1) {
      cpu.cycles += isPageCrossed(cpu.pc, addr) ? 2 : 1;
      cpu.pc = addr & 0xffff;
    }
  },

  // Branch if Not Equal
  [OPCODES.BNE]: (addr, cpu) => {
    if (cpu.z === 0) {
      cpu.cycles += isPageCrossed(cpu.pc, addr) ? 2 : 1;
      cpu.pc = addr & 0xffff;
    }
  },

  // Branch if Carry Clear
  [OPCODES.BCC]: (addr, cpu) => {
    if (cpu.c === 0) {
      cpu.cycles += isPageCrossed(cpu.pc, addr) ? 2 : 1;
      cpu.pc = addr & 0xffff;
    }
  },

  // Branch if Positive
  [OPCODES.BPL]: (addr, cpu) => {
    if (cpu.n === 0) {
      cpu.cycles += isPageCrossed(cpu.pc, addr) ? 2 : 1;
      cpu.pc = addr & 0xffff;
    }
  },

  // Branch if Minus
  [OPCODES.BMI]: (addr, cpu) => {
    if (cpu.n === 1) {
      cpu.cycles += isPageCrossed(cpu.pc, addr) ? 2 : 1;
      cpu.pc = addr & 0xffff;
    }
  },

  // Set Decimal Flag
  [OPCODES.SED]: (addr, cpu) => {
    cpu.d = 1;
  },

  // Set Carry Flag
  [OPCODES.SEC]: (addr, cpu) => {
    cpu.c = 1;
  },

  // Return from Interrupt
  [OPCODES.RTI]: (addr, cpu) => {
    cpu.setFlags(cpu.stackPull8() | 0x20);
    cpu.pc = cpu.stackPull16();
  },

  // Logical AND
  [OPCODES.AND]: (addr, cpu) => {
    var value = cpu.read8(addr);
    cpu.a = cpu.a & value;

    cpu.setNegativeFlag(cpu.a);
    cpu.setZeroFlag(cpu.a);

    cpu.cycles += cpu.b;
  },

  // Transfer Accumulator to Y
  [OPCODES.TAY]: (addr, cpu) => {
    cpu.y = cpu.a;
    cpu.setNegativeFlag(cpu.y);
    cpu.setZeroFlag(cpu.y);
  },

  // Load Accumulator
  [OPCODES.LDA]: (addr, cpu) => {
    cpu.a = cpu.read8(addr);

    cpu.setNegativeFlag(cpu.a);
    cpu.setZeroFlag(cpu.a);

    cpu.cycles += cpu.b;
  },

  // Load Y Register
  [OPCODES.LDY]: (addr, cpu) => {
    cpu.y = cpu.read8(addr);
    cpu.setNegativeFlag(cpu.y);
    cpu.setZeroFlag(cpu.y);

    cpu.cycles += cpu.b;
  },

  // Load X Register
  [OPCODES.LDX]: (addr, cpu) => {
    cpu.x = cpu.read8(addr);
    cpu.setNegativeFlag(cpu.x);
    cpu.setZeroFlag(cpu.x);

    cpu.cycles += cpu.b;
  },

  // Store X Register
  [OPCODES.STX]: (addr, cpu) => {
    cpu.write8(addr, cpu.x);
  },

  // Store Y Register
  [OPCODES.STY]: (addr, cpu) => {
    cpu.write8(addr, cpu.y);
  },

  // Store Accumulator
  [OPCODES.STA]: (addr, cpu) => {
    cpu.write8(addr, cpu.a);
  },

  // Compare
  [OPCODES.CMP]: (addr, cpu) => {
    var value = cpu.read8(addr);
    var tmpA = cpu.a - value;

    if (cpu.a >= value) {
      cpu.c = 1;
    } else {
      cpu.c = 0;
    }

    cpu.setNegativeFlag(tmpA);
    cpu.setZeroFlag(tmpA);

    cpu.cycles += cpu.b;
  },

  // Compare X Register
  [OPCODES.CPX]: (addr, cpu) => {
    var value = cpu.read8(addr);
    var tmpX = cpu.x - value;

    if (cpu.x >= value) {
      cpu.c = 1;
    } else {
      cpu.c = 0;
    }

    cpu.setNegativeFlag(tmpX);
    cpu.setZeroFlag(tmpX);
  },

  // Compare Y Register
  [OPCODES.CPY]: (addr, cpu) => {
    var value = cpu.read8(addr);
    var tmpY = cpu.y - value;

    if (cpu.y >= value) {
      cpu.c = 1;
    } else {
      cpu.c = 0;
    }

    cpu.setNegativeFlag(tmpY);
    cpu.setZeroFlag(tmpY);
  },

  // Arithmetic Shift Left (Accumulator Mode)
  [OPCODES.ASL_ACC]: (addr, cpu) => {
    cpu.c = (cpu.a >> 7) & 1;
    cpu.a = (cpu.a << 1) & 0xff;

    cpu.setZeroFlag(cpu.a);
    cpu.setNegativeFlag(cpu.a);
  },

  // Arithmetic Shift Left
  [OPCODES.ASL]: (addr, cpu) => {
    var value = cpu.read8(addr);

    cpu.c = (value >> 7) & 1;
    value = (value << 1) & 0xff;

    cpu.setZeroFlag(value);
    cpu.setNegativeFlag(value);
    cpu.write8(addr, value);
  },

  // Subtract with Carry
  [OPCODES.SBC]: (addr, cpu) => {
    var a = cpu.a;
    var b = cpu.read8(addr);
    var c = cpu.c;

    cpu.a = (cpu.a - b - (1 - cpu.c)) & 0xff;

    cpu.setNegativeFlag(cpu.a);
    cpu.setZeroFlag(cpu.a);

    if (a - b - (1 - c) >= 0) {
      cpu.c = 1;
    } else {
      cpu.c = 0;
    }

    if (((a ^ b) & 0x80) !== 0 && ((a ^ cpu.a) & 0x80) !== 0) {
      cpu.v = 1;
    } else {
      cpu.v = 0;
    }

    cpu.cycles += cpu.b;
  },

  // Exclusive OR
  [OPCODES.EOR]: (addr, cpu) => {
    var value = cpu.read8(addr);
    cpu.a = (cpu.a ^ value) & 0xff;

    cpu.setZeroFlag(cpu.a);
    cpu.setNegativeFlag(cpu.a);

    cpu.cycles += cpu.b;
  },

  // Return From Subroutine
  [OPCODES.RTS]: (addr, cpu) => {
    cpu.pc = cpu.stackPull16() + 1;
  },

  // Increment Y Register
  [OPCODES.INY]: (addr, cpu) => {
    cpu.y = (cpu.y + 1) & 0xff;
    cpu.setNegativeFlag(cpu.y);
    cpu.setZeroFlag(cpu.y);
  },

  // Increment X Register
  [OPCODES.INX]: (addr, cpu) => {
    cpu.x = (cpu.x + 1) & 0xff;
    cpu.setNegativeFlag(cpu.x);
    cpu.setZeroFlag(cpu.x);
  },

  // Increment Memory
  [OPCODES.INC]: (addr, cpu) => {
    var value = (cpu.read8(addr) + 1) & 0xff;

    cpu.setNegativeFlag(value);
    cpu.setZeroFlag(value);

    cpu.write8(addr, value);
  },

  // Push Accumulator
  [OPCODES.PHA]: (addr, cpu) => {
    cpu.stackPush8(cpu.a);
  },

  // Pull Processor Status
  [OPCODES.PLP]: (addr, cpu) => {
    cpu.setFlags((cpu.stackPull8() & 0xef) | 0x20);
  },

  // Logical Inclusive OR
  [OPCODES.ORA]: (addr, cpu) => {
    cpu.a = cpu.a | cpu.read8(addr);
    cpu.setNegativeFlag(cpu.a);
    cpu.setZeroFlag(cpu.a);

    cpu.cycles += cpu.b;
  },

  // Logical Shift Right (Accumulator Mode)
  [OPCODES.LSR_ACC]: (addr, cpu) => {
    cpu.c = cpu.a & 1;
    cpu.a = cpu.a >> 1;

    cpu.setNegativeFlag(cpu.a);
    cpu.setZeroFlag(cpu.a);
  },

  // Logical Shift Right
  [OPCODES.LSR]: (addr, cpu) => {
    var value = cpu.read8(addr);

    cpu.c = value & 1;
    value = value >> 1;

    cpu.write8(addr, value);
    cpu.setNegativeFlag(value);
    cpu.setZeroFlag(value);
  },

  // Transfer Y to Accumulator
  [OPCODES.TYA]: (addr, cpu) => {
    cpu.a = cpu.y;
    cpu.setNegativeFlag(cpu.a);
    cpu.setZeroFlag(cpu.a);
  },

  // Rotate Left (Accumulator)
  [OPCODES.ROL_ACC]: (addr, cpu) => {
    var tmpC = cpu.c;

    cpu.c = (cpu.a >> 7) & 1;
    cpu.a = ((cpu.a << 1) & 0xff) | tmpC;
    cpu.setNegativeFlag(cpu.a);
    cpu.setZeroFlag(cpu.a);
  },

  // Rotate Left
  [OPCODES.ROL]: (addr, cpu) => {
    var tmpC = cpu.c;
    var value = cpu.read8(addr);

    cpu.c = (value >> 7) & 1;
    value = ((value << 1) & 0xff) | tmpC;

    cpu.write8(addr, value);
    cpu.setNegativeFlag(value);
    cpu.setZeroFlag(value);
  },

  // Rotate Right (Accumulator)
  [OPCODES.ROR_ACC]: (addr, cpu) => {
    var tmpC = cpu.c;

    cpu.c = cpu.a & 1;
    cpu.a = (cpu.a >> 1) + (tmpC << 7);
    cpu.setNegativeFlag(cpu.a);
    cpu.setZeroFlag(cpu.a);
  },

  // Rotate Right
  [OPCODES.ROR]: (addr, cpu) => {
    var tmpC = cpu.c;
    var value = cpu.read8(addr);

    cpu.c = value & 1;
    value = (value >> 1) + (tmpC << 7);

    cpu.write8(addr, value);
    cpu.setNegativeFlag(value);
    cpu.setZeroFlag(value);
  },

  // Bit Test
  [OPCODES.BIT]: (addr, cpu) => {
    var value = cpu.read8(addr);
    cpu.v = (value >> 6) & 1;
    cpu.setZeroFlag(value & cpu.a);
    cpu.setNegativeFlag(value);
  },

  // Jump
  // FIXME https://github.com/christopherpow/nes-test-roms/blob/master/stress/NEStress.txt#L141
  [OPCODES.JMP]: (addr, cpu) => {
    cpu.pc = addr & 0xffff;
  },

  // Clear Interrupt Disable
  [OPCODES.CLI]: (addr, cpu) => {
    cpu.i = 0;
  },

  // Nope
  [OPCODES.NOP]: (addr, cpu) => {},

  // SLO
  // [ OPCODES.SLO ]: ( addr, cpu ) => {},

  // SLO
  [OPCODES.ISC]: (addr, cpu) => {}
};
