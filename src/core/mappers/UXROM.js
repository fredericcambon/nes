import Mapper from "./Mapper";

/**
 *  http://wiki.nesdev.com/w/index.php/UxROM
 */
class UXROM extends Mapper {
  constructor(rom) {
    super(rom);
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
      this.prg.updateLowerBank(value & 0xf);
    }
  }
}

export default UXROM;
