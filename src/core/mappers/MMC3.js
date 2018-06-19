import Mapper from "./Mapper";
import { NAMETABLE_MIRRORS } from "./constants";

const MMC3_MIRRORS = {
  0: NAMETABLE_MIRRORS.VERTICAL,
  1: NAMETABLE_MIRRORS.HORIZONTAL
};

class MMC3 extends Mapper {
  constructor(rom) {
    super(rom);
    this.prgBankMode = 0;
    this.chrBankMode = 0;
    this.bankRegister = 0;
    this.irqCounter = 0;
    this.irqLatch = 0;
    this.irqEnable = true;

    // PRG banks of MMC3 requires special bank switching at init
    this.prg.switchBank(0x4000, 0x6000, this.prg.bankNbr / 8 - 2);
    this.prg.switchBank(0x6000, 0x8000, this.prg.bankNbr / 8 - 1);
    this.prg.switchBank(0x0000, 0x2000, 0);
    this.prg.switchBank(0x2000, 0x4000, 1);
  }

  /**
   *  MMC3 has its own tick method. We must trigger IRQ interrupts
   *  each time our internal counter reaches 0. Then it is reset
   *  using `irqLatch` which is set in `control()`
   */
  tick() {
    if (this.irqCounter == 0) {
      this.irqCounter = this.irqLatch;
    } else {
      this.irqCounter--;
      if (this.irqCounter === 0 && this.irqEnable) {
        this.cpu.triggerIRQ();
      }
    }
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

  write8(addr, value) {
    if (addr < 0x2000) {
      this.chr.write8(addr, value);
    } else if (addr < 0x8000) {
      this.sram[addr - 0x6000] = value;
    } else {
      this.control(addr, value);
    }
  }

  /**
   *  To switch banks, MMC3 require first to set `bankRegister`
   *  then to make another call to update the appropriate CHR or PRG
   *  banks using one of two different modes.
   */
  control(addr, value) {
    var is_even = addr % 2 === 0;

    if (addr < 0x9fff && is_even) {
      this.prgBankMode = (value >> 6) & 1;
      this.chrBankMode = (value >> 7) & 1;
      this.bankRegister = value & 7;
    } else if (addr < 0xa000 && !is_even) {
      switch (this.bankRegister) {
        // Select 2 KB CHR bank at PPU $0000-$07FF (or $1000-$17FF);
        case 0: {
          if (this.chrBankMode === 0) {
            this.chr.switchBank(0, 0x0400, value & 0xfe);
            this.chr.switchBank(0x0400, 0x0800, value | 0x01);
          } else {
            this.chr.switchBank(0x1000, 0x1400, value & 0xfe);
            this.chr.switchBank(0x1400, 0x1800, value | 0x01);
          }
          break;
        }
        // Select 2 KB CHR bank at PPU $0800-$0FFF (or $1800-$1FFF);
        case 1: {
          if (this.chrBankMode === 0) {
            this.chr.switchBank(0x0800, 0x0c00, value & 0xfe);
            this.chr.switchBank(0x0c00, 0x1000, value | 1);
          } else {
            this.chr.switchBank(0x1800, 0x1c00, value & 0xfe);
            this.chr.switchBank(0x1c00, 0x2000, value | 1);
          }
          break;
        }
        // Select 1 KB CHR bank at PPU $1000-$13FF (or $0000-$03FF);
        case 2: {
          if (this.chrBankMode === 0) {
            this.chr.switchBank(0x1000, 0x01400, value);
          } else {
            this.chr.switchBank(0x0000, 0x0400, value);
          }
          break;
        }
        // Select 1 KB CHR bank at PPU $1400-$17FF (or $0400-$07FF);
        case 3: {
          if (this.chrBankMode === 0) {
            this.chr.switchBank(0x1400, 0x1800, value);
          } else {
            this.chr.switchBank(0x0400, 0x0800, value);
          }
          break;
        }
        // Select 1 KB CHR bank at PPU $1800-$1BFF (or $0800-$0BFF);
        case 4: {
          if (this.chrBankMode === 0) {
            this.chr.switchBank(0x1800, 0x1c00, value);
          } else {
            this.chr.switchBank(0x0800, 0x0c00, value);
          }
          break;
        }
        // Select 1 KB CHR bank at PPU $1C00-$1FFF (or $0C00-$0FFF);
        case 5: {
          if (this.chrBankMode === 0) {
            this.chr.switchBank(0x1c00, 0x2000, value);
          } else {
            this.chr.switchBank(0x0c00, 0x1000, value);
          }
          break;
        }
        // Select 8 KB PRG ROM bank at $8000-$9FFF (or $C000-$DFFF);
        case 6: {
          if (this.prgBankMode === 0) {
            this.prg.switchBank(0x4000, 0x6000, this.prg.bankNbr / 8 - 2);
            this.prg.switchBank(0x0000, 0x2000, value);
          } else {
            this.prg.switchBank(0x0000, 0x2000, this.prg.bankNbr / 8 - 2);
            this.prg.switchBank(0x4000, 0x6000, value);
          }

          break;
        }
        // Select 8 KB PRG ROM bank at $A000-$BFFF
        case 7: {
          this.prg.switchBank(0x2000, 0x4000, value);

          if (this.prgBankMode === 0) {
            this.prg.switchBank(0x4000, 0x6000, this.prg.bankNbr / 8 - 2);
          } else {
            this.prg.switchBank(0x0000, 0x2000, this.prg.bankNbr / 8 - 2);
          }
          break;
        }
      }
    } else if (addr < 0xbfff && is_even) {
      this.mirrorType = MMC3_MIRRORS[value & 1];
    } else if (addr < 0xc000 && !is_even) {
      // Write Protect, not implemented
    } else if (addr < 0xdfff && is_even) {
      this.irqLatch = value;
    } else if (addr < 0xe000 && !is_even) {
      this.irqCounter = 0;
    } else if (addr < 0xffff && is_even) {
      this.irqEnable = false;
    } else if (addr < 0x10000 && !is_even) {
      this.irqEnable = true;
    } else {
      throw Error("Unknown control: " + addr);
    }
  }
}

export default MMC3;
