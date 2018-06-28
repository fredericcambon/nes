import PPUMemory from "./PPUMemory";

import {
  INTERRUPTS,
  RENDERING_MODES,
  COLORS,
  SCANLINES,
  CYCLES
} from "./constants";

import { readTile } from "./utils";

/**
 * Picture Processing Unit.
 * Handles graphics.
 */
class PPU {
  constructor() {
    this.memory = new PPUMemory();
    this.cycle = 0;
    this.cycleType = null;
    this.scanline = 261;
    this.scanlineType = null;
    this.frame = 0;
    this.interrupt = null;
    this.action = null;

    //
    // PPU registers
    // https://wiki.nesdev.com/w/index.php/PPU_scrolling#PPU_registers
    //

    // v & t are pointers used to point where to read & write to PPU memory (background)

    // current vram address (15 bit)
    this.v = 0;
    // temporary vram address (15 bit)
    // can also be thought of as the address of the top left onscreen tile.
    this.t = 0;
    // Y, used to help compute vram address
    this.y = 0;
    // fine x scroll (3 bit)
    this.x = 0;
    // write toggle (1 bit)
    this.w = 0;
    // even/odd frame flag (1 bit)
    this.f = 0;

    this.register = 0;

    // NMI flags (Non Maskable Interrupt) controls VBlank
    // https://wiki.nesdev.com/w/index.php/NMI
    this.nmiOccurred = 0;
    this.nmiOutput = 0;

    //
    // Containers holding bufferized data to display
    //

    // Background temporary variables
    this.tileData = [];
    this.lowTileByte = 0;
    this.highTileByte = 0;

    // Sprite temporary variables
    this.spriteCount = 0;
    this.sprites = new Array(8);

    for (var i = 0; i < 8; i++) {
      this.sprites[i] = {
        pattern: [],
        x: null,
        priority: null,
        index: null
      };
    }

    // https://wiki.nesdev.com/w/index.php/PPU_OAM
    // Max 64 sprites
    // Byte 0 => Y position
    // Byte 1 => Bank nbr (address in mapper)
    // Byte 2 => Attributes (priority, hori. vert. switch)
    // Byte 3 => X position

    // FIXME: Should be in PPUMemory
    this.oamData = new Uint8Array(256);

    //
    // Registers
    //

    this.registerRead = 0;
    this.registerBuffer = 0;

    // 0x2000 PPUCTRL
    // Current nametable 0: $2000; 1: $2400; 2: $2800; 3: $2C00
    this.fNameTable = 0;
    // Increment vram of 1 or 32
    this.fIncrement = 0;
    // 0x0000 or 0x1000 (ignored in 8x16 mode)
    this.fSpriteTable = 0;
    // 0x0000 or 0x1000
    this.fBackgroundTable = 0;
    // 8x8 or 8x16
    this.fSpriteSize = 0;
    // Unused yet ?
    this.fMasterSlave = 0;

    // 0x2001 PPUMASK
    this.fGrayscale = 0; // 0: color; 1: grayscale
    this.fShowLeftBackground = 0; // 0: hide; 1: show
    this.fShowLeftSprites = 0; // 0: hide; 1: show
    this.fShowBackground = 0; // 0: hide; 1: show
    this.fShowSprites = 0; // 0: hide; 1: show
    // Unused
    this.fRedTint = 0; // 0: normal; 1: emphasized
    this.fGreenTint = 0; // 0: normal; 1: emphasized
    this.fBlueTint = 0; // 0: normal; 1: emphasized

    // 0x2002 PPUSTATUS

    // Set if sprite 0 overlaps background pixel
    this.fSpriteZeroHit = 0;
    this.fSpriteOverflow = 0;

    // 0x2003 OAMADDR
    this.tmpOamAddress = 0;
    this.oamAddress = 0;

    // 0x2007 PPUDATA
    this.bufferedData = 0; // for buffered reads

    // Buffered data
    this.setRenderingMode(RENDERING_MODES.NORMAL);
    this.frameBuffer = new Uint8Array(256 * 240 * 4).fill(0x00);
    this.frameBackgroundBuffer = new Uint8Array(256 * 240 * 4).fill(0x00);
    this.frameSpriteBuffer = new Int16Array(256 * 240 * 4).fill(-1);
    this.frameColorBuffer = new Uint32Array(256 * 240).fill(0x00);

    this.frameReady = false;

    //
    // Debug data & variables
    //
    this.patternTable1 = new Uint8Array(160 * 160 * 4).fill(0xff);
    this.patternTable2 = new Uint8Array(160 * 160 * 4).fill(0xff); // 124 x 124 + 2px spacing
    this.oamTable = new Uint8Array(80 * 160 * 4); // 64 x 124 + 2 px spacing

    this.patternTablesColors = [
      [0xff, 0xff, 0xff],
      [0x33, 0x33, 0x33],
      [0xbf, 0xbf, 0xbf],
      [0x00, 0x00, 0x00]
    ];
  }

  /**
   * Utils methods
   */

  connectROM(rom) {
    this.memory.mapper = rom.mapper;
  }

  _parsePatternTable(_from, to, patternTable) {
    var value = null;
    var lowTileData = 0;
    var highTileData = 0;
    var v = 0;
    var i = _from;
    var y = 0;
    var z = 0;
    var s = 0;

    while (i < to) {
      lowTileData = this.memory.read8(i);
      highTileData = this.memory.read8(i + 8);

      z = 0;

      while (z < 8) {
        value = (((lowTileData >> z) & 1) << 1) + ((highTileData >> z) & 1);
        v = (i % 8) * 160; // Tmp vertical position
        v += y * 160; // Permanent vertical position;
        v += 7 - z; // Tmp horizontal position
        v += (s % 16) * 10; // Permanent horizontal position
        v *= 4; // RGBA

        patternTable[v] = this.patternTablesColors[value][0];
        patternTable[v + 1] = this.patternTablesColors[value][1];
        patternTable[v + 2] = this.patternTablesColors[value][2];
        patternTable[v + 3] = 0xff;

        z++;
      }

      if (i % 256 === 0 && i > _from) {
        y += 10; // 10 instead of 8 because need 2px spacing for display
      }

      i++;

      if (i % 8 == 0) {
        i += 8;
        s++;
      }
    }
    return patternTable;
  }

  /**
   *  Used for debugging
   */

  getPatternTables() {
    return [
      this._parsePatternTable(0, 4096, this.patternTable1),
      this._parsePatternTable(4096, 8192, this.patternTable2)
    ];
  }

  getOamTable() {
    var tile,
      table,
      spriteSize,
      attributes,
      address,
      lowTileData,
      highTileData,
      tileShiftX,
      tileShiftY,
      tableY,
      value,
      v,
      isReversedVertically,
      isReversedHorizontally;

    tableY = 0;

    // Not all sprites slots are used
    // We must flush it at each frame otherwhise we'll end up
    // with stale sprites
    this.oamTable.fill(0xff);

    for (let sprite = 0; sprite < 64; sprite++) {
      tile = this.oamData[sprite * 4 + 1];

      if (this.fSpriteSize === 0) {
        spriteSize = 8;
        table = this.fSpriteTable;
      } else {
        spriteSize = 16;
        table = tile & 1;
        tile = tile & 0xfe;
      }

      attributes = this.oamData[sprite * 4 + 2];
      address = 0x1000 * table + tile * 16;
      isReversedVertically = (attributes & 0x80) === 0x80;
      isReversedHorizontally = (attributes & 0x40) === 0x40;

      if (tile === 0) {
        // Unused sprite
        continue;
      }

      for (let tileY = 0; tileY < spriteSize; tileY++) {
        lowTileData = this.memory.read8(address);
        highTileData = this.memory.read8(address + 8);
        tileShiftY = isReversedVertically ? 8 - tileY : tileY;

        for (let tileX = 0; tileX < 8; tileX++) {
          tileShiftX = isReversedHorizontally ? 8 - tileX : tileX;
          value =
            (((lowTileData >> tileShiftX) & 1) << 1) +
            ((highTileData >> tileShiftX) & 1);
          v = tileShiftY * 80; // Tmp vertical position
          v += tableY * 80; // Permanent vertical position;
          v += 7 - tileX; // Tmp horizontal position
          v += (sprite % 8) * 8 + (sprite % 8) * 2; // Permanent horizontal position
          v *= 4; // RGBA

          this.oamTable[v] = this.patternTablesColors[value][0];
          this.oamTable[v + 1] = this.patternTablesColors[value][1];
          this.oamTable[v + 2] = this.patternTablesColors[value][2];
          this.oamTable[v + 3] = 0xff;
        }

        address++;

        if (this.fSpriteSize !== 0 && tileY == 7) {
          tile++;
          address = 0x1000 * table + tile * 16;
        }
      }

      if (sprite % 8 === 0 && sprite > 0) {
        tableY += 18;
      }
    }

    return this.oamTable;
  }

  /**
   * Init methods, configuration
   */

  reset() {
    // Clean dat shit
    this.memory.flush();
    this.cycle = 0;
    this.scanline = 261;
    this.frame = 0;
    this.oamData.fill(0);
    this.v = 0;
    this.t = 0;
    this.x = 0;
    this.w = 0;
    this.f = 0;
    this.register = 0;
    this.nmiOccurred = 0;
    this.nmiOutput = 0;
    this.lowTileByte = 0;
    this.highTileByte = 0;
    this.tileData = [];
    this.spriteCount = 0;
    this.fNameTable = 0;
    this.fIncrement = 0;
    this.fSpriteTable = 0;
    this.fBackgroundTable = 0;
    this.fSpriteSize = 0;
    this.fMasterSlave = 0;
    this.fGrayscale = 0;
    this.fShowLeftBackground = 0;
    this.fShowLeftSprites = 0;
    this.fShowBackground = 0;
    this.fShowSprites = 0;
    this.fRedTint = 0;
    this.fGreenTint = 0;
    this.fBlueTint = 0;
    this.fSpriteZeroHit = 0;
    this.fSpriteOverflow = 0;
    this.oamAddress = 0;
    this.bufferedData = 0;
    this.frameBuffer.fill(0x00);
    this.frameReady = false;
  }

  setRenderingMode(mode) {
    this.renderingMode = {
      [RENDERING_MODES.NORMAL]: this.normalRenderingMode,
      [RENDERING_MODES.SPLIT]: this.splitRenderingMode
    }[mode];
  }

  /**
   * Emulation related methods
   */

  /*  Handles the read communication between CPU and PPU */
  read8(address) {
    switch (address) {
      case 0x2002: {
        /**
         * 0x2002: PPUSTATUS
         * Used to describe the status of a PPU frame
         * Note: Resets write toggle `w`
         */
        this.registerRead = this.register & 0x1f;
        this.registerRead = this.registerRead | (this.fSpriteOverflow << 5);
        this.registerRead = this.registerRead | (this.fSpriteZeroHit << 6);
        if (this.nmiOccurred) {
          // Avoid reading the NMI right after it is set
          if (this.cycles !== 2 || this.scanline !== 241) {
            this.registerRead = this.registerRead | (1 << 7);
          }
        }
        this.nmiOccurred = 0;
        this.w = 0;

        return this.registerRead;
      }
      case 0x2004: {
        return this.oamData[this.oamAddress];
      }
      case 0x2007: {
        this.registerRead = this.memory.read8(this.v);
        // Emulate buffered reads
        if (this.v % 0x4000 < 0x3f00) {
          this.registerBuffer = this.bufferedData;
          this.bufferedData = this.registerRead;
          this.registerRead = this.registerBuffer;
        } else {
          this.bufferedData = this.memory.read8(this.v - 0x1000);
        }
        // Increment v address
        if (this.fIncrement === 0) {
          this.v += 1;
        } else {
          this.v += 32;
        }
        return this.registerRead;
      }
    }
    return 0;
  }

  /* Handles the write communication between CPU and PPU */
  write8(address, value, cpuRead8) {
    // Pointer to the last value written to a register
    // Used by PPUSTATUS (0x2002)
    this.register = value;

    switch (address) {
      case 0x2000: {
        /**
         * 0x2000: PPUCTR
         * Sets 7 flags that control where/how the ROM data is read
         */
        this.fNameTable = (value >> 0) & 3;
        this.fIncrement = (value >> 2) & 1;
        this.fSpriteTable = (value >> 3) & 1;
        this.fBackgroundTable = (value >> 4) & 1;
        this.fSpriteSize = (value >> 5) & 1;
        this.fMasterSlave = (value >> 6) & 1;
        this.nmiOutput = ((value >> 7) & 1) === 1;
        this.t = (this.t & 0xf3ff) | ((value & 0x03) << 10);
        break;
      }
      case 0x2001: {
        /**
         * 0x2001: PPUMASK
         * Sets 8 flags (1 byte) that control how to display pixels on screen
         */
        this.fGrayscale = (value >> 0) & 1;
        this.fShowLeftBackground = (value >> 1) & 1;
        this.fShowLeftSprites = (value >> 2) & 1;
        this.fShowBackground = (value >> 3) & 1;
        this.fShowSprites = (value >> 4) & 1;
        this.fRedTint = (value >> 5) & 1;
        this.fGreenTint = (value >> 6) & 1;
        this.fBlueTint = (value >> 7) & 1;
        break;
      }
      case 0x2003: {
        // 0x2003: OAMADDR
        this.oamAddress = value;
        break;
      }
      case 0x2004: {
        // 0x2004: OAMDATA (write)
        this.oamData[this.oamAddress] = value;
        this.oamAddress++;
        break;
      }
      case 0x2005: {
        /**
         * 0x2005: PPUSCROLL
         * Update the scroll variables, aka which pixel of the nametable will be
         * at the top left of the screen
         */
        if (this.w === 0) {
          this.t = (this.t & 0xffe0) | (value >> 3);
          this.x = value & 0x07;
          this.w = 1;
        } else {
          this.t = (this.t & 0x8fff) | ((value & 0x07) << 12);
          this.t = (this.t & 0xfc1f) | ((value & 0xf8) << 2);
          this.w = 0;
        }
        break;
      }
      case 0x2006: {
        if (this.w === 0) {
          this.t = (this.t & 0x80ff) | ((value & 0x3f) << 8);
          this.w = 1;
        } else {
          this.t = (this.t & 0xff00) | value;
          this.v = this.t;
          this.w = 0;
        }
        break;
      }
      case 0x2007: {
        // 0x2007: PPUDATA
        this.memory.write8(this.v, value);
        if (this.fIncrement === 0) {
          this.v += 1;
        } else {
          this.v += 32;
        }
        break;
      }
      case 0x4014: {
        // 0x4014 is handled by the CPU to avoid using cpu methods here
        break;
      }
    }
  }

  //
  // https://wiki.nesdev.com/w/index.php/PPU_scrolling
  //

  updateScrollingX() {
    // https://wiki.nesdev.com/w/index.php/PPU_scrolling#Coarse_X_increment
    // increment hori(v)
    // if coarse X === 31
    if ((this.v & 0x001f) === 31) {
      // coarse X = 0
      this.v = this.v & 0xffe0;
      // switch horizontal nametable
      this.v = this.v ^ 0x0400;
    } else {
      // increment coarse X
      this.v++;
    }
  }

  updateScrollingY() {
    // This one really is a mess
    // Values are coming from nesdev, don't touch, don't break
    if (this.cycleType === CYCLES.INCREMENT_Y) {
      // https://wiki.nesdev.com/w/index.php/PPU_scrolling#Y_increment
      // increment vert(v)
      // if fine Y < 7
      if ((this.v & 0x7000) !== 0x7000) {
        // increment fine Y
        this.v += 0x1000;
      } else {
        // fine Y = 0
        this.v = this.v & 0x8fff;
        // let y = coarse Y
        this.y = (this.v & 0x03e0) >> 5;
        if (this.y === 29) {
          // coarse Y = 0
          this.y = 0;
          // switch vertical nametable
          this.v = this.v ^ 0x0800;
        } else if (this.y === 31) {
          // coarse Y = 0, nametable not switched
          this.y = 0;
        } else {
          // increment coarse Y
          this.y++;
        }
        // put coarse Y back into v
        this.v = (this.v & 0xfc1f) | (this.y << 5);
      }
    }

    if (this.cycleType === CYCLES.COPY_X) {
      // https://wiki.nesdev.com/w/index.php/PPU_scrolling#At_dot_257_of_each_scanline
      this.v = (this.v & 0xfbe0) | (this.t & 0x041f);
    }
  }

  setVerticalBlank() {
    this.nmiOccurred = 1;
  }

  /**
   * Called at the end of vertical blank
   * Prepares the PPU for next frame
   */
  clearVerticalBlank() {
    this.nmiOccurred = 0;
    this.frameReady = true;
  }

  acknowledgeFrame() {
    // Must be called by code handling the NES
    this.frameReady = false;

    if (this.fShowSprites === 1) {
      this.fSpriteOverflow = 0;
      this.fSpriteZeroHit = 0;
    }

    this.frameBackgroundBuffer.fill(0x00);
    this.frameSpriteBuffer.fill(-1);
  }

  /**
   * Returns the current background pixel
   * if background mode is enabled.
   *
   * This is where fine x is used as it points to
   * the correct bit of the current tile to use.
   */
  getCurrentBackgroundPixel() {
    if (this.fShowBackground === 0) {
      return 0;
    }

    return this.tileData[this.x] & 0x0f;
  }

  /**
   * Return the current sprite pixel
   * if sprite mode is enabled and there is a pixel to display.
   */
  getCurrentSpritePixel() {
    var color,
      offset = 0;

    if (this.fShowSprites === 0) {
      return [0, 0];
    }

    for (var i = 0; i < this.spriteCount; i++) {
      offset = this.cycle - 1 - this.sprites[i].x;
      if (offset < 0 || offset > 7) {
        continue;
      }

      color = this.sprites[i].pattern[offset] & 0x0f;

      if (color % 4 === 0) {
        continue;
      }
      return [i, color | 0x10];
    }
    return [0, 0];
  }

  setColorToBuffer(buffer, i, color) {
    buffer[i] = (color >> 16) & 0xff;
    buffer[i + 1] = (color >> 8) & 0xff;
    buffer[i + 2] = color & 0xff;
    buffer[i + 3] = 0xff;
  }

  normalRenderingMode(pos, colorPos, c, isBackgroundPixel) {
    this.setColorToBuffer(this.frameBuffer, colorPos, c);
  }

  splitRenderingMode(pos, colorPos, c, isBackgroundPixel) {
    this.frameColorBuffer[pos] = c;

    if (isBackgroundPixel) {
      this.setColorToBuffer(this.frameBackgroundBuffer, colorPos, c);
    } else {
      this.setColorToBuffer(this.frameSpriteBuffer, colorPos, c);
      this.setColorToBuffer(this.frameBackgroundBuffer, colorPos, 0x00);
    }
  }

  /**
   * Render either a background or sprite pixel or a black pixel
   * Executed 256 times per visible (240) scanline
   */
  renderPixel() {
    // TODO: Define variables in constructor, too expansive to allocate at each tick
    var x = this.cycle - 1;
    var y = this.scanline;
    var color = 0;
    var isBackgroundPixel = true;

    if (x < 8 && this.fShowLeftBackground === 0) {
      var bgColor = 0;
    } else {
      var bgColor = this.getCurrentBackgroundPixel();
    }

    if (x < 8 && this.fShowLeftSprites === 0) {
      var [i, spriteColor] = [0, 0];
    } else {
      var [i, spriteColor] = this.getCurrentSpritePixel();
    }

    // cf priority decision table https://wiki.nesdev.com/w/index.php/PPU_rendering
    // TODO: Looks like there's a display blinking bug on some games, cf Castlevania
    var bgPixel = bgColor % 4;
    var spritePixel = spriteColor % 4;

    if (bgPixel === 0 && spritePixel === 0) {
      color = 0;
    } else if (bgPixel === 0 && spritePixel !== 0) {
      color = spriteColor;
      isBackgroundPixel = false;
    } else if (bgPixel !== 0 && spritePixel === 0) {
      color = bgColor;
    } else {
      if (this.sprites[i].index === 0 && x < 255) {
        this.fSpriteZeroHit = 1;
      }
      if (this.sprites[i].priority === 0) {
        color = spriteColor;
        isBackgroundPixel = false;
      } else {
        color = bgColor;
      }
    }

    // Fills the buffer at pos `x`, `y` with rgb color `c`
    var c = COLORS[this.memory.paletteTable.read8(color)];
    var pos = y * 256 + x;
    var colorPos = pos * 4;

    this.renderingMode(pos, colorPos, c, isBackgroundPixel);
  }

  fetchSpritePattern(tileData, i, row) {
    // Sub function of fetchAndStoreSprites
    var tile = this.oamData[i * 4 + 1];
    var attributes = this.oamData[i * 4 + 2];
    var address,
      table = 0;
    var isReversedVertically = (attributes & 0x80) === 0x80;
    var isReversedHorizontally = (attributes & 0x40) === 0x40;
    var attributeTableByte = (attributes & 3) << 2;

    if (this.fSpriteSize === 0) {
      // 8x8 sprites
      if (isReversedVertically) {
        row = 7 - row;
      }
      address = 0x1000 * this.fSpriteTable + tile * 16 + row;
    } else {
      // 16x8 sprites
      if (isReversedVertically) {
        row = 15 - row;
      }
      table = tile & 1;
      tile = tile & 0xfe;
      if (row > 7) {
        tile++;
        row -= 8;
      }
      address = 0x1000 * table + tile * 16 + row;
    }

    this.lowTileByte = this.memory.read8(address);
    this.highTileByte = this.memory.read8(address + 8);

    readTile(
      tileData,
      attributeTableByte,
      this.lowTileByte,
      this.highTileByte,
      isReversedHorizontally,
      true
    );
  }

  /**
   * Retrieves the sprites that are to be rendered on the next scanline
   * Executed at the end of a scanline
   */
  fetchAndStoreSprites() {
    // FIXME: Could be rewritten, simplified, check getOamData
    var y,
      a,
      x,
      row,
      h = 0;
    this.spriteCount = 0;

    if (this.fSpriteSize === 0) {
      h = 8;
    } else {
      h = 16;
    }

    // Here, we constantly iterate over the 64 possible
    // sprites, we should not
    for (var i = 0; i < 64; i++) {
      y = this.oamData[i * 4 + 0];
      a = this.oamData[i * 4 + 2];
      x = this.oamData[i * 4 + 3];
      row = this.scanline - y;
      if (row < 0 || row >= h) {
        continue;
      } // LIGNE PAR LIGNE chec row
      if (this.spriteCount < 8) {
        this.fetchSpritePattern(this.sprites[this.spriteCount].pattern, i, row);
        this.sprites[this.spriteCount].x = x;
        this.sprites[this.spriteCount].priority = (a >> 5) & 1;
        this.sprites[this.spriteCount].index = i;
      }
      this.spriteCount++;

      if (this.spriteCount > 8) {
        this.spriteCount = 8;
        this.fSpriteOverflow = 1;
        break;
      }
    }
  }

  /**
   * Actions that should be done over 8 ticks
   * but instead done into 1 call because YOLO.
   *
   * Retrieves the background tiles that are to be rendered on the next X bytes
   *
   * - Read the nametable byte using current `v`
   * - Fetch corresponding attribute byte using current `v`
   * - Read CHR/Pattern table low+high bytes
   */
  fetchAndStoreBackground() {
    var address,
      shift,
      fineY,
      a,
      p1,
      p2,
      lowTileByte,
      highTileByte,
      attributeTableByte,
      nameTableByte = 0;

    // Fetch Name Table Byte
    address = 0x2000 | (this.v & 0x0fff);
    nameTableByte = this.memory.read8(address);

    // Fetch Attribute Table Byte
    address =
      0x23c0 |
      (this.v & 0x0c00) |
      ((this.v >> 4) & 0x38) |
      ((this.v >> 2) & 0x07);
    shift = ((this.v >> 4) & 4) | (this.v & 2);
    attributeTableByte = ((this.memory.read8(address) >> shift) & 3) << 2;

    // Fetch Low Tile Byte
    fineY = (this.v >> 12) & 7;
    address = 0x1000 * this.fBackgroundTable + nameTableByte * 16 + fineY;
    lowTileByte = this.memory.read8(address);

    // Fetch High Tile Byte
    fineY = (this.v >> 12) & 7;
    address = 0x1000 * this.fBackgroundTable + nameTableByte * 16 + fineY;
    highTileByte = this.memory.read8(address + 8);

    // Store Tile Data
    a = attributeTableByte;
    p1, (p2 = 0);

    readTile(
      this.tileData,
      attributeTableByte,
      lowTileByte,
      highTileByte,
      false,
      false
    );
  }

  /**
   * Determines the type of the cycle
   * Refer to https://wiki.nesdev.com/w/images/d/d1/Ntsc_timing.png
   */
  _cycleType() {
    if (this.cycle === 0) {
      return CYCLES.ZERO;
    } else if (this.cycle === 1) {
      return CYCLES.ONE;
    } else if (this.cycle > 1 && this.cycle < 257) {
      return CYCLES.VISIBLE;
    } else if (this.cycle === 321) {
      return CYCLES.FLUSH_TILEDATA;
    } else if (this.cycle > 321 && this.cycle < 337) {
      return CYCLES.PREFETCH;
    } else if (this.cycle === 259) {
      return CYCLES.SPRITES;
    } else if (this.cycle === 258) {
      return CYCLES.INCREMENT_Y;
    } else if (this.cycle === 257) {
      return CYCLES.COPY_X;
    } else if (this.cycle > 279 && this.cycle < 305) {
      return CYCLES.COPY_Y;
    } else if (this.cycle == 340) {
      return CYCLES.MAPPER_TICK;
    } else {
      return CYCLES.IDLE;
    }
  }

  /**
   * Determines the type of the scanline
   */
  _scanlineType() {
    if (this.scanline < 240) {
      return SCANLINES.VISIBLE;
    } else if (this.scanline === 241) {
      return SCANLINES.VBLANK;
    } else if (this.scanline === 261) {
      return SCANLINES.PRELINE;
    } else {
      return SCANLINES.IDLE;
    }
  }

  doPreline() {
    if (
      this.cycleType === CYCLES.ONE ||
      this.cycleType === CYCLES.VISIBLE ||
      this.cycleType === CYCLES.PREFETCH
    ) {
      this.tileData.shift();

      if (this.cycle % 8 === 0) {
        if (this.cycle < 256) {
          this.fetchAndStoreBackground();
        }
        this.updateScrollingX();
      }
    }

    if (this.cycleType === CYCLES.SPRITES) {
      this.spriteCount = 0;
    }

    if (this.cycleType === CYCLES.COPY_Y) {
      // https://wiki.nesdev.com/w/index.php/PPU_scrolling#During_dots_280_to_304_of_the_pre-render_scanline_.28end_of_vblank.29
      this.v = (this.v & 0x841f) | (this.t & 0x7be0);
    }

    this.updateScrollingY();

    if (this.cycleType == CYCLES.ONE) {
      this.clearVerticalBlank();
    }

    if (this.cycleType === CYCLES.MAPPER_TICK) {
      if (this.memory.mapper.tick()) {
        return INTERRUPTS.IRQ;
      }
    }
  }

  doVisibleLine() {
    if (this.cycleType === CYCLES.ONE || this.cycleType === CYCLES.VISIBLE) {
      this.renderPixel();
    }

    if (this.cycleType === CYCLES.VISIBLE) {
      this.tileData.shift();

      if (this.cycle % 8 === 0) {
        if (this.cycle < 256) {
          this.fetchAndStoreBackground();
        }
        this.updateScrollingX();
      }
    } else if (this.cycleType === CYCLES.FLUSH_TILEDATA) {
      // Hackish hack, empty the remaining tile data at the beginning of prefetch
      // Needs improvement
      this.tileData.length = 0;
    } else if (this.cycleType === CYCLES.PREFETCH) {
      if (this.cycle % 8 === 0) {
        this.fetchAndStoreBackground();
        this.updateScrollingX();
      }
    }

    this.updateScrollingY();

    if (this.cycleType === CYCLES.SPRITES) {
      this.fetchAndStoreSprites();
    }

    if (this.cycleType === CYCLES.MAPPER_TICK) {
      if (this.memory.mapper.tick()) {
        return INTERRUPTS.IRQ;
      }
    }

    return null;
  }

  doVBlankLine() {
    if (this.cycleType === CYCLES.SPRITES) {
      this.spriteCount = 0;
    }

    // Vertical Blank is set at second tick of scanline 241
    if (this.cycleType === CYCLES.ONE) {
      this.setVerticalBlank();
      if (this.nmiOutput) {
        return INTERRUPTS.NMI; // Clean this shit
      }
    }

    return null;
  }

  incrementCounters() {
    this.cycle++;

    // Skip one cycle when background is on for each odd frame
    if (
      this.scanline === 261 &&
      this.cycle === 340 &&
      this.fShowBackground !== 0 &&
      this.f === 1
    ) {
      this.cycle++;
      this.f = this.f ^ 1;
    }

    if (this.cycle == 341) {
      this.cycle = 0;
      this.scanline++;
      if (this.scanline == 262) {
        this.scanline = 0;
        this.frame++;
      }
    }
  }

  /**
   * Main function of PPU.
   * Increments counters (cycle, scanline, frame)
   * Executes one action based on scanline + cycle
   */
  tick() {
    this.cycleType = this._cycleType();
    this.scanlineType = this._scanlineType();

    if (this.scanlineType === SCANLINES.VBLANK) {
      this.interrupt = this.doVBlankLine();
    } else if (this.fShowBackground !== 0 || this.fShowSprites !== 0) {
      if (this.scanlineType === SCANLINES.PRELINE) {
        this.interrupt = this.doPreline();
      } else if (this.scanlineType === SCANLINES.VISIBLE) {
        this.interrupt = this.doVisibleLine();
      }
    } else {
      this.interrupt = null;
    }

    this.incrementCounters();

    return this.interrupt;
  }
}

export default PPU;
