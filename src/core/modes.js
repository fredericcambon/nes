import { MODES, OPCODES } from "./constants.js";

import { isPageCrossed } from "./utils.js";

/**
 *   Computes and returns a memory address (max 16bit)
 *   http://wiki.nesdev.com/w/index.php/CPU_addressing_modes
 */
export var modes = {
  [MODES.IMMEDIATE]: cpu => {
    return cpu.pc + 1;
  },
  [MODES.ABSOLUTE]: cpu => {
    return cpu.read16(cpu.pc + 1);
  },
  [MODES.ABSOLUTE_X]: cpu => {
    var addr = (cpu.read16(cpu.pc + 1) + cpu.x) & 0xffff;

    if (isPageCrossed(addr - cpu.x, addr)) {
      cpu.b = 1;
    }

    return addr;
  },
  [MODES.ABSOLUTE_Y]: cpu => {
    var addr = (cpu.read16(cpu.pc + 1) + cpu.y) & 0xffff;

    if (isPageCrossed(addr - cpu.y, addr)) {
      cpu.b = 1;
    }

    return addr;
  },
  [MODES.ACCUMULATOR]: cpu => {
    return cpu.a;
  },
  [MODES.IMPLIED]: cpu => {
    return 0;
  },
  [MODES.RELATIVE]: cpu => {
    var addr = cpu.read8(cpu.pc + 1);

    if (addr < 0x80) {
      return addr + cpu.pc + 2;
    } else {
      return addr + cpu.pc + 2 - 0x100;
    }
  },
  [MODES.ZERO_PAGE_Y]: cpu => {
    return (cpu.read8(cpu.pc + 1) + cpu.y) & 0xff;
  },
  [MODES.ZERO_PAGE_X]: cpu => {
    return (cpu.read8(cpu.pc + 1) + cpu.x) & 0xff;
  },
  [MODES.ZERO_PAGE]: cpu => {
    return cpu.read8(cpu.pc + 1);
  },
  [MODES.INDEXED_INDIRECT_X]: cpu => {
    return cpu.read16indirect((cpu.read8(cpu.pc + 1) + cpu.x) & 0xff);
  },
  [MODES.INDIRECT_INDEXED_Y]: cpu => {
    var addr = (cpu.read16indirect(cpu.read8(cpu.pc + 1)) + cpu.y) & 0xffff;

    if (isPageCrossed(addr - cpu.y, addr)) {
      cpu.b = 1;
    }

    return addr;
  },
  // TODO: Indirect jump is bugged on the NES, dig/adapt
  [MODES.INDIRECT]: cpu => {
    return cpu.read16indirect(cpu.read16(cpu.pc + 1));
  }
};
