import BankMemory from "./Bank";

class BankMemory2 {
  /*
     TODO: This needs improvement to be compatible with all mappers
     // Unsure this will work with MMC3 because of 1kb banks

     instead of upperBankoffset + lower, maybe an array
     mmc3 has 6 different banks

     // maybe could use a pointer for each slice of 1k data?
     */
  constructor(data, windowSize, bankFixed) {
    this.data = data;
    this.windowSize = windowSize;
    this.halfWindowSize = parseInt(this.windowSize / 2);
    this.bankNbr = parseInt(this.data.length / this.halfWindowSize);
    this.upperBankOffset = this.resolveOffset(
      this.bankNbr > 0 ? this.bankNbr - 1 : 0
    );
    this.lowerBankOffset = this.resolveOffset(0);
    this.bankFixed = bankFixed;
    this.swapMode = 0;
  }

  resolveOffset(bank) {
    return bank * this.halfWindowSize;
  }

  setSwitchableBank(mode) {
    this.bankFixed = false;
    this.swapMode = mode;
  }

  setFixedBank() {
    this.bankFixed = true;
  }

  updateBanks(value) {
    // TODO: reuse value instead of using new var
    var newBank = 0;

    if (this.bankFixed) {
      newBank = parseInt(value >> 1) * 2;
      this.lowerBankOffset = this.resolveOffset(newBank);
      this.upperBankOffset = this.resolveOffset(newBank + 1);
    } else {
      newBank = value;
      if (this.swapMode == 0) {
        this.upperBankOffset = this.resolveOffset(newBank);
        this.lowerBankOffset = this.resolveOffset(0);
      } else {
        this.upperBankOffset = this.resolveOffset(this.bankNbr - 1);
        this.lowerBankOffset = this.resolveOffset(newBank);
      }
    }
  }

  updateLowerBank(value) {
    if (this.bankFixed) {
      this.lowerBankOffset = this.resolveOffset(parseInt(value >> 1) * 2);
    } else {
      this.lowerBankOffset = this.resolveOffset(value);
    }
  }

  updateUpperBank(value) {
    if (this.bankFixed) {
      this.upperBankOffset = this.resolveOffset(parseInt(value >> 1) * 2);
    } else {
      this.upperBankOffset = this.resolveOffset(value);
    }
  }

  read8(addr) {
    addr = addr % this.windowSize;

    if (addr >= this.halfWindowSize) {
      return this.data[
        this.upperBankOffset + (addr & (this.halfWindowSize - 1))
      ];
    }
    return this.data[this.lowerBankOffset + (addr & (this.halfWindowSize - 1))];
  }

  write8(addr, value) {
    addr = addr % this.windowSize;

    if (addr >= this.halfWindowSize) {
      this.data[
        this.upperBankOffset + (addr & (this.halfWindowSize - 1))
      ] = value;
    } else {
      this.data[
        this.lowerBankOffset + (addr & (this.halfWindowSize - 1))
      ] = value;
    }
  }
}

class Mapper {
  /**
        http://wiki.nesdev.com/w/index.php/Mapper
    */
  constructor(rom) {
    this.chr = new BankMemory(rom.chr, 0x2000, true);
    this.prg = new BankMemory(rom.prg, 0x8000, false);
    this.sram = new Array(0x2000).fill(0xff);
    this.mirrorType = rom.mirrorType;
  }

  tick() {
    /**
       Only used for a few mappers
     */
  }
}

export default Mapper;
