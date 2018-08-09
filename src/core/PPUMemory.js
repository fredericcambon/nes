/**
 * http://wiki.nesdev.com/w/index.php/PPU_nametables
 */
class NameTable {
  constructor() {
    this.data = new Uint8Array(2048).fill(0x00);
    // http://wiki.nesdev.com/w/index.php/Mirroring
    this.mirrors = [
      [0, 0, 1, 1], // Horizontal
      [0, 1, 0, 1], // Vertical
      [0, 0, 0, 0], // Single screen
      [1, 1, 1, 1], // Single screen 2
      [0, 1, 2, 3] // 4 Screen
    ];
  }

  flush() {
    this.data.fill(0x00);
  }

  _resolve(mode, addr) {
    addr = addr % 0x1000;

    return this.mirrors[mode][parseInt(addr / 0x400)] * 0x400 + (addr % 0x400);
  }

  read8(mode, addr) {
    return this.data[this._resolve(mode, addr)];
  }

  write8(mode, addr, value) {
    this.data[this._resolve(mode, addr)] = value;
  }
}

/**
 * Color lookup table
 * 8 palettes of 4 colors
 */
class PaletteTable {
  constructor() {
    this.data = new Uint8Array(32).fill(0x00);
  }

  flush() {
    this.data.fill(0x00);
  }

  write8(addr, value) {
    addr = addr % 32;

    // Each 4th byte of the palettes are mirrored into each other
    // $3F10/$3F14/$3F18/$3F1C == $3F00/$3F04/$3F08/$3F0C
    if (addr % 4 === 0 && addr >= 16) {
      addr -= 16;
    }

    this.data[addr] = value;
  }

  read8(addr) {
    addr = addr % 32;

    if (addr % 4 === 0 && addr >= 16) {
      addr -= 16;
    }
    return this.data[addr];
  }
}

/**
 *
 *   Aka. VRAM
 *
 *   CHR: 0x0000 => 0x2000
 *   Nametable: 0x2000 => 0x3f00
 *   Background palette: 0x3F00 => 0x3F10
 *   Sprite palette: 0x3F00 => 0x3F20
 *
 */
class PPUMemory {
  constructor() {
    this.paletteTable = new PaletteTable();

    // https://wiki.nesdev.com/w/index.php/PPU_OAM
    // Max 64 sprites
    // Byte 0 => Y position
    // Byte 1 => Bank nbr (address in mapper)
    // Byte 2 => Attributes (priority, hori. vert. switch)
    // Byte 3 => X position
    this.oam = new Uint8Array(256).fill(0x00);
    this.nameTable = new NameTable();
    this.mapper = null;
  }

  flush() {
    this.paletteTable.flush();
    this.oam.fill(0x00);
    this.nameTable.flush();
  }

  write8(addr, value) {
    addr = addr % 0x4000;

    if (addr < 0x2000) {
      this.mapper.write8(addr, value);
    } else if (addr < 0x3f00) {
      this.nameTable.write8(this.mapper.mirrorType, addr, value);
    } else if (addr < 0x4000) {
      this.paletteTable.write8(addr, value);
    } else {
      throw new Error("Unknown PPU addr " + addr);
    }
  }

  readNametable(addr) {
    addr = addr % 0x4000;
    return this.nameTable.read8(this.mapper.mirrorType, addr);
  }

  read8(addr) {
    addr = addr % 0x4000;

    if (addr < 0x2000) {
      return this.mapper.read8(addr);
    } else if (addr < 0x3f00) {
      return this.nameTable.read8(this.mapper.mirrorType, addr);
    } else if (addr < 0x4000) {
      this.paletteTable.read8(addr);
    } else {
      throw new Error("Unknown PPU addr " + addr);
    }
  }
}

export default PPUMemory;
