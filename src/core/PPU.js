import PPUMemory from './PPUMemory';

import {
    COLORS,
    SCANLINES,
    CYCLES
} from './constants';

import {
    readTile
} from './utils';

class PPU {
    /*
        Picture Processing Unit.
        Handles graphics.
    */
    constructor() {
        this.memory = new PPUMemory();
        this.cycle = 0;
        this.cycleType = null;
        this.scanline = 261;
        this.scanlineType = null;
        this.frame = 0;

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

        // Sprite temporary variables
        this.spriteCount = 0;
        this.sprites = new Array( 8 );

        for ( var i = 0; i < 8; i++ ) {
            this.sprites[ i ] = {
                pattern: [],
                x: null,
                priority: null,
                index: null
            }
        }

        // https://wiki.nesdev.com/w/index.php/PPU_OAM
        // Max 64 sprites
        // Byte 0 => Y position
        // Byte 1 => Bank nbr (address in mapper)
        // Byte 2 => Attributes (priority, hori. vert. switch)
        // Byte 3 => X position
        this.oamData = new Uint8Array( 256 );

        // $2000 PPUCTRL
        // Current nametable 0: $2000; 1: $2400; 2: $2800; 3: $2C00
        this.fNameTable = 0;
        // Increment vram of 1 or 32
        this.fIncrement = 0;
        // $0000 or $1000 (ignored in 8x16 mode)
        this.fSpriteTable = 0;
        // $0000 or $1000
        this.fBackgroundTable = 0;
        // 8x8 or 8x16
        this.fSpriteSize = 0;
        // Unused yet ?
        this.fMasterSlave = 0;

        // $2001 PPUMASK
        this.fGrayscale = 0; // 0: color; 1: grayscale
        this.fShowLeftBackground = 0; // 0: hide; 1: show
        this.fShowLeftSprites = 0; // 0: hide; 1: show
        this.fShowBackground = 0; // 0: hide; 1: show
        this.fShowSprites = 0; // 0: hide; 1: show
        this.fRedTint = 0; // 0: normal; 1: emphasized
        this.fGreenTint = 0; // 0: normal; 1: emphasized
        this.fBlueTint = 0; // 0: normal; 1: emphasized

        // $2002 PPUSTATUS

        // Set if sprite 0 overlaps background pixel
        this.fSpriteZeroHit = 0;
        this.fSpriteOverflow = 0;

        // $2003 OAMADDR
        this.oamAddress = 0;

        // $2007 PPUDATA
        this.bufferedData = 0; // for buffered reads

        // Buffered data
        this.frameBuffer = new Uint8Array( 256 * 240 * 4 ).fill( 255 );

        this.frameReady = false;

    }

    connect( cpu ) {
        this.cpu = cpu;
    }

    connectROM( rom ) {
        this.memory.mapper = rom.mapper
    }

    reset() {
        // Clean dat shit
        this.memory.flush();
        this.cycle = 0;
        this.scanline = 261;
        this.frame = 0;
        this.oamData.fill( 0 );
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
        this.frameBuffer.fill( 255 );
        this.frameReady = false;
    }

    read8( address ) {
        /*
            Handles the read communication between CPU and PPU
        */
        switch ( address ) {
        case 0x2002:
            {
                /*
                    $2002: PPUSTATUS

                    Used to describe the status of a PPU frame
                    Note: Resets write toggle `w`
                */
                var result = this.register & 0x1F;
                result = result | ( this.fSpriteOverflow << 5 );
                result = result | ( this.fSpriteZeroHit << 6 );
                if ( this.nmiOccurred ) {
                    // Avoid reading the NMI right after it is set
                    if ( this.cycles !== 2 || this.scanline !== 241 ) {
                        result = result | ( 1 << 7 );
                    }
                }
                this.nmiOccurred = 0;
                this.w = 0;

                return result;
            }
        case 0x2004:
            {
                return this.oamData[ this.oamAddress ];
            }
        case 0x2007:
            {
                var value = this.memory.read8( this.v );
                // Emulate buffered reads
                if ( ( this.v % 0x4000 ) < 0x3F00 ) {
                    var buffered = this.bufferedData;
                    this.bufferedData = value;
                    value = buffered;
                } else {
                    this.bufferedData = this.memory.read8( this.v - 0x1000 );
                }
                // Increment v address
                if ( this.fIncrement === 0 ) {
                    this.v += 1;
                } else {
                    this.v += 32;
                }
                return value;
            }
        }
        return 0;
    }

    write8( address, value ) {
        /*
            Handles the write communication between CPU and PPU
        */

        // Pointer to the last value written to a register
        // Used by PPUSTATUS ($2002)
        this.register = value;

        switch ( address ) {
        case 0x2000:
            {
                /*
                    $2000: PPUCTR
                    Sets 7 flags that control where/how the ROM data is read
                */
                this.fNameTable = ( value >> 0 ) & 3;
                this.fIncrement = ( value >> 2 ) & 1;
                this.fSpriteTable = ( value >> 3 ) & 1;
                this.fBackgroundTable = ( value >> 4 ) & 1;
                this.fSpriteSize = ( value >> 5 ) & 1;
                this.fMasterSlave = ( value >> 6 ) & 1;
                this.nmiOutput = ( ( value >> 7 ) & 1 ) === 1;
                // t: ....BA.. ........ = d: ......BA
                this.t = ( this.t & 0xF3FF ) | ( ( value & 0x03 ) << 10 );
                break;
            }
        case 0x2001:
            {
                /*
                    $2001: PPUMASK

                    Sets 8 flags (1 byte) that control how to display pixels on screen
                */
                this.fGrayscale = ( value >> 0 ) & 1;
                this.fShowLeftBackground = ( value >> 1 ) & 1;
                this.fShowLeftSprites = ( value >> 2 ) & 1;
                this.fShowBackground = ( value >> 3 ) & 1;
                this.fShowSprites = ( value >> 4 ) & 1;
                this.fRedTint = ( value >> 5 ) & 1;
                this.fGreenTint = ( value >> 6 ) & 1;
                this.fBlueTint = ( value >> 7 ) & 1;
                break;
            }
        case 0x2003:
            {
                // $2003: OAMADDR
                this.oamAddress = value;
                break;
            }
        case 0x2004:
            {
                // $2004: OAMDATA (write)
                this.oamData[ this.oamAddress ] = value;
                this.oamAddress++;
                break;
            }
        case 0x2005:
            {
                /*
                    $2005: PPUSCROLL
                    TODO
                */
                if ( this.w === 0 ) {
                    // t: ........ ...HGFED = d: HGFED...
                    // x:               CBA = d: .....CBA
                    // w:                   = 1
                    this.t = ( this.t & 0xFFE0 ) | ( value >> 3 );
                    this.x = value & 0x07;
                    this.w = 1;
                } else {
                    // t: .CBA..HG FED..... = d: HGFEDCBA
                    // w:                   = 0
                    this.t = ( this.t & 0x8FFF ) | ( ( value & 0x07 ) << 12 );
                    this.t = ( this.t & 0xFC1F ) | ( ( value & 0xF8 ) << 2 );
                    this.w = 0;
                }
                break;
            }
        case 0x2006:
            {
                if ( this.w === 0 ) {
                    // t: ..FEDCBA ........ = d: ..FEDCBA
                    // t: .X...... ........ = 0
                    // w:                   = 1
                    this.t = ( this.t & 0x80FF ) | ( ( value & 0x3F ) << 8 );
                    this.w = 1;
                } else {
                    // t: ........ HGFEDCBA = d: HGFEDCBA
                    // v                    = t
                    // w:                   = 0
                    this.t = ( this.t & 0xFF00 ) | value;
                    this.v = this.t;
                    this.w = 0;
                }
                break;
            }
        case 0x2007:
            {
                // $2007: PPUDATA
                this.memory.write8( this.v, value );
                if ( this.fIncrement === 0 ) {
                    this.v += 1;
                } else {
                    this.v += 32;
                }
                break;
            }
        case 0x4014:
            {
                var address = value << 8;
                var oldOamAddress = this.oamAddress;

                for ( var i = 0; i < 256; i++ ) {
                    this.oamData[ this.oamAddress ] = this.cpu.read8( address );
                    this.oamAddress++;
                    address++;
                }

                this.cpu.stall();
                this.oamAddress = oldOamAddress;
                break;
            }
        }
    }

    // NTSC Timing Helper Functions
    // https://wiki.nesdev.com/w/index.php/PPU_scrolling

    incrementX() {
        // https://wiki.nesdev.com/w/index.php/PPU_scrolling#Coarse_X_increment
        // increment hori(v)
        // if coarse X === 31
        if ( ( this.v & 0x001F ) === 31 ) {
            // coarse X = 0
            this.v = this.v & 0xFFE0;
            // switch horizontal nametable
            this.v = this.v ^ 0x0400;
        } else {
            // increment coarse X
            this.v++;
        }
    }

    setVerticalBlank() {
        this.nmiOccurred = 1;

        if ( this.nmiOutput ) {
            this.cpu.triggerNMI();
        }
    }

    clearVerticalBlank() {
        /*
            Called at the end of vertical blank
            Prepares the PPU for next frame
        */
        this.nmiOccurred = 0;
        this.frameReady = true;
    }

    acknowledgeFrame() {
        // Must be called by code handling the NES
        this.frameReady = false;

        if ( this.fShowSprites === 1 ) {
            this.fSpriteOverflow = 0;
            this.fSpriteZeroHit = 0;
        }
    }

    getCurrentBackgroundPixel() {
        /*
            Return the current background pixel
            if background mode is enabled.

            This is where fine x is used as it points to
            the correct bit of the current tile to use.
        */
        if ( this.fShowBackground === 0 ) {
            return 0;
        }

        return ( this.tileData[ this.x ] & 0x0F );
    }

    getCurrentSpritePixel() {
        /*
            Return the current sprite pixel
            if sprite mode is enabled and there is a pixel to display.
        */
        var color, offset = 0;

        if ( this.fShowSprites === 0 ) {
            return [ 0, 0 ];
        }

        for ( var i = 0; i < this.spriteCount; i++ ) {
            offset = ( this.cycle - 1 ) - this.sprites[ i ].x;
            if ( offset < 0 || offset > 7 ) {
                continue;
            }

            color = this.sprites[ i ].pattern[ offset ] & 0x0F;

            if ( ( color % 4 ) === 0 ) {
                continue;
            }
            return [ i, color | 0x10 ];
        }
        return [ 0, 0 ];
    }

    renderPixel() {
        /*
            Render either a background or sprite pixel or a black pixel
            Executed 256 times per visible (240) scanline
        */
        var x = this.cycle - 1;
        var y = this.scanline;
        var color = 0;

        if ( x < 8 && this.fShowLeftBackground === 0 ) {
            var bgColor = 0;
        } else {
            var bgColor = this.getCurrentBackgroundPixel();
        }

        if ( x < 8 && this.fShowLeftSprites === 0 ) {
            var [ i, spriteColor ] = [ 0, 0 ];
        } else {
            var [ i, spriteColor ] = this.getCurrentSpritePixel();
        }

        // cf priority decision table https://wiki.nesdev.com/w/index.php/PPU_rendering        
        // TODO: Looks like there's a display blinking bug on some games, cf Castlevania
        var bgPixel = bgColor % 4;
        var spritePixel = spriteColor % 4;

        if ( bgPixel === 0 && spritePixel === 0 ) {
            color = 0;
        } else if ( bgPixel === 0 && spritePixel !== 0 ) {
            color = spriteColor;
        } else if ( bgPixel !== 0 && spritePixel === 0 ) {
            color = bgColor;
        } else {
            if ( this.sprites[ i ].index === 0 && x < 255 ) {
                this.fSpriteZeroHit = 1;
            }
            if ( this.sprites[ i ].priority === 0 ) {
                color = spriteColor;
            } else {
                color = bgColor;
            }
        }

        // Fills the buffer at pos `x`, `y` with rgb color `c`
        var c = COLORS[ this.memory.paletteTable.read8( color ) ];
        var i = ( ( y * 256 ) + x ) * 4;

        this.frameBuffer[ i ] = ( c >> 16 ) & 0xFF;
        this.frameBuffer[ i + 1 ] = ( c >> 8 ) & 0xFF;
        this.frameBuffer[ i + 2 ] = c & 0xFF;
        this.frameBuffer[ i + 3 ] = 0xFF;
    }

    fetchSpritePattern( tileData, i, row ) {
        // Sub function of fetchAndStoreSprites
        var tile = this.oamData[ i * 4 + 1 ];
        var attributes = this.oamData[ i * 4 + 2 ];
        var address, table = 0;

        if ( this.fSpriteSize === 0 ) {
            if ( ( attributes & 0x80 ) === 0x80 ) {
                row = 7 - row;
            }
            address = ( 0x1000 * this.fSpriteTable ) + ( tile * 16 ) + row;
        } else {
            if ( ( attributes & 0x80 ) === 0x80 ) {
                row = 15 - row;
            }
            var table = tile & 1;
            tile = tile & 0xFE;
            if ( row > 7 ) {
                tile++;
                row -= 8;
            }
            address = ( 0x1000 * table ) + ( tile * 16 ) + row;
        }
        var a = ( attributes & 3 ) << 2;
        var lowTileByte = this.memory.read8( address );
        var highTileByte = this.memory.read8( address + 8 );

        readTile( tileData, a, lowTileByte, highTileByte, ( attributes & 0x40 ) === 0x40, true );
    }


    fetchAndStoreSprites() {
        /*
            Retrieves the sprites that are to be rendered on the next scanline
            Executed at the end of a scanline
        */
        var y, a, x, row, h = 0;
        this.spriteCount = 0;

        if ( this.fSpriteSize === 0 ) {
            h = 8;
        } else {
            h = 16;
        }

        for ( var i = 0; i < 64; i++ ) {
            y = this.oamData[ i * 4 + 0 ];
            a = this.oamData[ i * 4 + 2 ];
            x = this.oamData[ i * 4 + 3 ];
            row = this.scanline - y;
            if ( row < 0 || row >= h ) {
                continue;
            }
            if ( this.spriteCount < 8 ) {
                this.fetchSpritePattern( this.sprites[ this.spriteCount ].pattern, i, row );
                this.sprites[ this.spriteCount ].x = x;
                this.sprites[ this.spriteCount ].priority = ( a >> 5 ) & 1;
                this.sprites[ this.spriteCount ].index = i;
            }
            this.spriteCount++;

            if ( this.spriteCount > 8 ) {
                this.spriteCount = 8;
                this.fSpriteOverflow = 1;
                break;
            }
        }
    }

    fetchAndStoreBackground() {
        /*
            Actions that should be done over 8 ticks
            but instead done into 1 call because YOLO.

            Retrieves the background tiles that are to be rendered on the next X bytes

            - Read the nametable byte using current `v`
            - Fetch corresponding attribute byte using current `v`
            - Read CHR/Pattern table low+high bytes
        */
        var address, shift, fineY, a, p1, p2, lowTileByte, highTileByte, attributeTableByte, nameTableByte = 0;


        // Fetch Name Table Byte
        address = 0x2000 | ( this.v & 0x0FFF );
        nameTableByte = this.memory.read8( address );

        // Fetch Attribute Table Byte
        address = 0x23C0 | ( this.v & 0x0C00 ) | ( ( this.v >> 4 ) & 0x38 ) | ( ( this.v >> 2 ) & 0x07 );
        shift = ( ( this.v >> 4 ) & 4 ) | ( this.v & 2 );
        attributeTableByte = ( ( this.memory.read8( address ) >> shift ) & 3 ) << 2;

        // Fetch Low Tile Byte
        fineY = ( ( this.v >> 12 ) & 7 );
        address = ( 0x1000 * this.fBackgroundTable ) + ( nameTableByte * 16 ) + fineY;
        lowTileByte = this.memory.read8( address );

        // Fetch High Tile Byte
        fineY = ( ( this.v >> 12 ) & 7 );
        address = ( 0x1000 * this.fBackgroundTable ) + ( nameTableByte * 16 ) + fineY;
        highTileByte = this.memory.read8( address + 8 );

        // Store Tile Data
        a = attributeTableByte;
        p1, p2 = 0;

        readTile( this.tileData, attributeTableByte, lowTileByte, highTileByte, false, false );

    }

    // As our dear Napoleon once said: A good sketch is better than a long speech
    // https://wiki.nesdev.com/w/images/d/d1/Ntsc_timing.png
    _cycleType() {
        /*
            Determines the type of the cycle
        */
        if ( this.cycle === 0 ) {
            return CYCLES.ZERO;
        } else if ( this.cycle === 1 ) {
            return CYCLES.ONE
        } else if ( this.cycle > 1 && this.cycle < 257 ) {
            return CYCLES.VISIBLE;
        } else if ( this.cycle === 321 ) {
            return CYCLES.FLUSH_TILEDATA;
        } else if ( this.cycle > 321 && this.cycle < 337 ) {
            return CYCLES.PREFETCH;
        } else if ( this.cycle === 259 ) {
            return CYCLES.SPRITES;
        } else if ( this.cycle === 258 ) {
            return CYCLES.INCREMENT_Y;
        } else if ( this.cycle === 257 ) {
            return CYCLES.COPY_X;
        } else if ( this.cycle > 279 && this.cycle < 305 ) {
            return CYCLES.COPY_Y;
        } else {
            return CYCLES.IDLE;
        }
    }

    _scanlineType() {
        /*
            Determines the type of the scanline
        */
        if ( this.scanline < 240 ) {
            return SCANLINES.VISIBLE
        } else if ( this.scanline === 241 ) {
            return SCANLINES.VBLANK
        } else if ( this.scanline === 261 ) {
            return SCANLINES.PRELINE
        } else {
            return SCANLINES.IDLE
        }

    }

    incrementVRam() {
        if ( this.cycleType === CYCLES.INCREMENT_Y ) {
            // https://wiki.nesdev.com/w/index.php/PPU_scrolling#Y_increment
            // increment vert(v)
            // if fine Y < 7
            if ( ( this.v & 0x7000 ) !== 0x7000 ) {
                // increment fine Y
                this.v += 0x1000;
            } else {
                // fine Y = 0
                this.v = this.v & 0x8FFF;
                // let y = coarse Y
                var y = ( ( this.v & 0x03E0 ) >> 5 );
                if ( y === 29 ) {
                    // coarse Y = 0
                    y = 0;
                    // switch vertical nametable
                    this.v = this.v ^ 0x0800;
                } else if ( y === 31 ) {
                    // coarse Y = 0, nametable not switched
                    y = 0;
                } else {
                    // increment coarse Y
                    y++;
                }
                // put coarse Y back into v
                this.v = ( this.v & 0xFC1F ) | ( y << 5 );
            }
        }

        if ( this.cycleType === CYCLES.COPY_X ) {
            // https://wiki.nesdev.com/w/index.php/PPU_scrolling#At_dot_257_of_each_scanline
            // hori(v) = hori(t)
            // v: .....F.. ...EDCBA = t: .....F.. ...EDCBA
            this.v = ( this.v & 0xFBE0 ) | ( this.t & 0x041F );
        }
    }

    doPreline() {
        if ( this.cycleType === CYCLES.ONE ||
            this.cycleType === CYCLES.VISIBLE ||
            this.cycleType === CYCLES.PREFETCH ) {

            this.tileData.shift();

            if ( ( this.cycle % 8 ) === 0 ) {
                if ( this.cycle < 256 ) {
                    this.fetchAndStoreBackground();
                }
                this.incrementX();
            }

        }

        if ( this.cycleType === CYCLES.SPRITES ) {
            this.spriteCount = 0;
        }

        if ( this.cycleType === CYCLES.COPY_Y ) {
            // https://wiki.nesdev.com/w/index.php/PPU_scrolling#During_dots_280_to_304_of_the_pre-render_scanline_.28end_of_vblank.29
            // vert( v ) = vert( t )
            // v: .IHGF.ED CBA..... = t: .IHGF.ED CBA.....
            this.v = ( this.v & 0x841F ) | ( this.t & 0x7BE0 );
        }

        this.incrementVRam();

        if ( this.cycleType == CYCLES.ONE ) {
            this.clearVerticalBlank();
        }

    }


    doVisibleLine() {
        if ( this.cycleType === CYCLES.ONE || this.cycleType === CYCLES.VISIBLE ) {
            this.renderPixel();
        }

        if ( this.cycleType === CYCLES.VISIBLE ) {

            this.tileData.shift();

            if ( ( this.cycle % 8 ) === 0 ) {
                if ( this.cycle < 256 ) {
                    this.fetchAndStoreBackground();
                }
                this.incrementX();
            }

        } else if ( this.cycleType === CYCLES.FLUSH_TILEDATA ) {
            // Hackish hack, empty the remaining tile data at the beginning of prefetch
            // Needs improvement
            this.tileData.length = 0;
        } else if ( this.cycleType === CYCLES.PREFETCH ) {
            if ( ( this.cycle % 8 ) === 0 ) {
                this.fetchAndStoreBackground();
                this.incrementX();
            }
        }

        this.incrementVRam();

        if ( this.cycleType === CYCLES.SPRITES ) {
            this.fetchAndStoreSprites();
        }

    }

    doVBlankLine() {
        if ( this.cycleType === CYCLES.SPRITES ) {
            this.spriteCount = 0;
        }

        // Vertical Blank is set at second tick of scanline 241
        if ( this.cycleType === CYCLES.ONE ) {
            this.setVerticalBlank();
        }
    }

    incrementCounters() {
        this.cycle++;

        // Skip one cycle when background is on for each odd frame
        if ( this.scanline === 261 && this.cycle === 340 && this.fShowBackground !== 0 && this.f === 1 ) {
            this.cycle++;
            this.f = this.f ^ 1;
        }

        if ( this.cycle == 341 ) {
            this.cycle = 0;
            this.scanline++;
            if ( this.scanline == 262 ) {
                this.scanline = 0;
                this.frame++;
            }
        }

    }

    tick() {
        /*
            Main function of PPU.
            Increments counters (cycle, scanline, frame)
            Executes one action based on scanline + cycle
        */
        this.cycleType = this._cycleType();
        this.scanlineType = this._scanlineType();

        if ( this.scanlineType === SCANLINES.VBLANK ) {
            this.doVBlankLine();
        } else if ( this.fShowBackground !== 0 || this.fShowSprites !== 0 ) {
            if ( this.scanlineType === SCANLINES.PRELINE ) {
                this.doPreline();
            } else if ( this.scanlineType === SCANLINES.VISIBLE ) {
                this.doVisibleLine();
            }
        }

        this.incrementCounters();
    }

}

export default PPU
