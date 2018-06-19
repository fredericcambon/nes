import Mapper from "./Mapper";

import { BANK_SIZES, NAMETABLE_MIRRORS } from "./constants";

const MMC1_MIRRORS = {
  0: NAMETABLE_MIRRORS.SINGLE_SCREEN_0,
  1: NAMETABLE_MIRRORS.SINGLE_SCREEN_1,
  2: NAMETABLE_MIRRORS.VERTICAL,
  3: NAMETABLE_MIRRORS.HORIZONTAL
};

/**
 * http://wiki.nesdev.com/w/index.php/MMC1
 */
class MMC1 extends Mapper {
  constructor(rom) {
    super(rom);
    this.buffer = 0x10;
    this.bufferIndex = 0;
    this.conf = 0x0c;
    this.prgBankMode = 0;
    this.chrBankMode = 0;
  }

  read8(addr) {
    if (addr < 0x2000) {
      return this.chr.read8(addr);
    } else if (addr < 0x8000) {
      return this.sram[addr - 0x6000];
    } else {
      return this.prg.read8(addr - 0x8000);
    }
  }

  /**
   *  MMC1 has an internal buffer which needs to be written 5 times before switching banks or
   *  updating registers
   */
  write8(addr, value) {
    if (addr < 0x2000) {
      this.chr.write8(addr, value);
    } else if (addr < 0x8000) {
      this.sram[addr - 0x6000] = value;
    } else {
      if ((value & 0x80) != 0) {
        this.buffer = 0x10;
        this.bufferIndex = 0;
        this.control(this.conf | 0x0c);
      } else {
        // Write Register
        this.buffer = (this.buffer >> 1) | ((value & 1) << 4);
        this.bufferIndex++;

        if (this.bufferIndex == 5) {
          value = this.buffer;

          // Control
          if (addr < 0xa000) {
            this.control(value);
          }

          // CHR Bank 0
          else if (addr < 0xc000) {
            if (!this.chr.fixed) {
              this.chr.switchBank(0, 0x1000, value);
            } else {
              value = parseInt(value >> 1);
              this.chr.switchBank(0, 0x2000, value);
            }
          }

          // CHR Bank 1
          else if (addr < 0xe000) {
            if (!this.chr.fixed) {
              //this.chr.updateUpperBank(value);
              this.chr.switchBank(0x1000, 0x2000, value);
            }
          }

          // PRG Bank
          else {
            if (this.prg.fixed) {
              value = parseInt(value >> 1);
              this.prg.switchBank(0, 0x8000, value);
            } else {
              if (this.prg.swapMode === 0) {
                this.prg.switchBank(0, 0x4000, 0);
                this.prg.switchBank(0x4000, 0x8000, value);
              } else {
                this.prg.switchBank(0, 0x4000, value);
                this.prg.switchBank(0x4000, 0x8000, this.prg.bankNbr / 16 - 1);
              }
            }
          }

          this.buffer = 0x10;
          this.bufferIndex = 0;
        }
      }
    }
  }

  control(value) {
    this.conf = value;
    this.prgBankMode = (value >> 2) & 3;
    this.chrBankMode = (value >> 4) & 1;
    this.mirrorType = MMC1_MIRRORS[value & 3];

    if (this.prgBankMode === 2) {
      this.prg.swapMode = 0;
    }
    if (this.prgBankMode === 3) {
      this.prg.swapMode = 1;
    }

    this.prg.fixed = bool(this.prgBankMode === 0 || this.prgBankMode === 1);
    this.chr.fixed = bool(this.chrBankMode === 0);
  }
}

export default MMC1;
