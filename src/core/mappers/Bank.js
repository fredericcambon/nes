class BankMemory {
  constructor(data, windowSize, bankSize) {
    this.data = data;
    this.swapMode = 0;
    this.windowSize = windowSize;
    // bankNbr is the number of 1kb banks we have in all our data
    this.bankNbr = parseInt(this.data.length / 0x0400);
    this.pointers = new Array(parseInt(windowSize / 0x0400)).fill(0);
    // PRG is 32 by default, CHR is 8, but can be changed
    this.bankSize = bankSize;
    // Tmp variables
    this.p = 0;
    this.o = 0;
    this.p1 = 0;
    this.p2 = 0;

    for (let i = 0; i < this.pointers.length; i++) {
      this.pointers[i] = i;
    }
  }

  setBankSize(size) {
    this.bankSize = size;
  }

  /**
    Move pointers to redirect to new banks
  */
  switchBank(_from, _to, value) {
    this.p1 = parseInt(_from / 0x0400);
    this.p2 = parseInt(_to / 0x0400);

    if (value < 0) {
      // Used to select latest bank, penultimate bank
      value = this.bankNbr / this.bankSize + value;
    }

    value = value * (this.p2 - this.p1);

    for (let x = 0, i = this.p1; i < this.p2; i++, x++) {
      this.pointers[i] = value + x;
    }
  }

  write8(addr, value) {
    this.p = parseInt(addr / 0x0400);
    this.o = addr % 0x0400;
    this.data[this.pointers[this.p] * 0x0400 + this.o] = value;
  }

  read8(addr) {
    this.p = parseInt(addr / 0x0400);
    this.o = addr % 0x0400;
    return this.data[this.pointers[this.p] * 0x0400 + this.o];
  }
}

export default BankMemory;
