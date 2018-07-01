class BankMemory {
  constructor(data, windowSize, fixed) {
    this.data = data;
    this.fixed = fixed;
    this.swapMode = 0;
    this.windowSize = windowSize;
    this.bankNbr = parseInt(this.data.length / 0x0400);
    this.pointers = new Array(parseInt(windowSize / 0x0400)).fill(0);
    // Tmp variables
    this.p = 0;
    this.o = 0;
    this.p1 = 0;
    this.p2 = 0;

    for (let i = 0; i < this.pointers.length; i++) {
      this.pointers[i] = i;
    }
  }

  switchBank(_from, _to, value) {
    this.p1 = parseInt(_from / 0x0400);
    this.p2 = parseInt(_to / 0x0400);
    // Explain
    value = value * (this.p2 - this.p1);

    for (let i = this.p1; i < this.p2; i++) {
      this.pointers[i] = value + (i - this.p1);
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
