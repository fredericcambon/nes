/**
 * CPU RAM: 0x0000 => 0x2000
 */
class CPUMemory {
  constructor() {
    this.zp = new Uint8Array(256).fill(0xff);
    this.stack = new Uint8Array(256).fill(0xff);
    this.ram = new Uint8Array(1536).fill(0xff);
  }

  read8(addr) {
    // 2k bits RAM
    // mirrored 4 times
    addr = addr % 0x800;

    if (addr < 0x100) {
      return this.zp[addr];
    } else if (addr < 0x200) {
      return this.stack[addr - 0x100];
    } else {
      return this.ram[addr - 0x200];
    }
  }

  write8(addr, value) {
    // 2k bits RAM
    // mirrored 4 times
    addr = addr % 0x800;

    if (addr < 0x0100) {
      this.zp[addr] = value;
    } else if (addr < 0x0200) {
      this.stack[addr - 0x100] = value;
    } else {
      this.ram[addr - 0x200] = value;
    }
  }
}

export default CPUMemory;
