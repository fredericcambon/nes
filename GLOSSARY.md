## Emulator key words

### Addressing Modes
### Opcodes
### Instructions


## NES key words

### CHR
    Another word for pattern tables, after the traditional name character generator for a tiled background plane.

### CHR RAM
    An SRAM on the cartridge, usually 8192 bytes, normally mapped at 0x0000-0x1FFF and holding pattern tables.

### CHR ROM
    ROM in the cartridge which is connected to the PPU, normally mapped at 0x0000-0x1FFF and holding pattern tables.

### Pattern table
    Two 4096 byte areas of video memory, mapped at PPU 0x0000-0x0FFF and 0x1000-0x1FFF. Each contains 256 tiles.
    Contain the actual data to render. 2bits are used for each pixel of the tiles to render.

### Object Attribute Memory (OAM)
    A 256-byte DRAM inside the PPU holding the sprite display list. Each sprite takes 4 bytes in memory. The OAM can hold up to 64 sprites.

### Display list
    A set of data to be copied to video memory. On the NES, it is usual to prepare display lists for sprites and the background during draw time and copy them to video memory during vertical blank.

### Sprite:
    An entry of 4 bytes in OAM, controlling a small block of 8x8 pixels that can be moved around on the screen. It has X and Y coordinates, a tile index into one of the pattern tables, vertical and horizontal flip switches, and priority.

### Nametable
    Any of four areas in VRAM (PPU addresses 0x2000-0x23FF, 0x2400-0x27FF, 0x2800-0x2BFF, 0x2C00-0x2FFF) specifying which tiles (of pattern tables) to display at which places in the background. Each is 32 by 30 tiles and ends with an attribute table.

### Attribute table
    The 64-byte table of background tile attributes at the end of each of the four nametables. Controls the palette used for associated nametable for each 16x16 block. The attribute table is one byte length per 32x32 pixels (2bits per block).

### Palette Color
    A color lookup table. The NES has a system palette of 64 colors [4], and from that you choose the palettes that are used for rendering. Each palette is 3 unique colors, plus the shared background color. An image has a maximum of 4 palettes. A single palette can be used per block.

### Tile
    An 8x8 pixel piece of graphics. Tile data on the NES has 2 bits per pixel, and each pixel in a tile can have one of three colors or transparency.

### Block
A 16x16 pixel piece of graphics. A block commonly refer to the small regions of the attribute tables. As written above, the attribute table describe which color palette is to be used for each block (2bits per block, 4 block per element in the attribute table).

### Mappers
A mapper is extra hardware shipped with the cartridge. It allows dynamic bank switching (mapping ROM/RAM to CPU/PPU adddress space, allowing for more data). It can also be used to maintain data between game sessions. 

### NMI
Non-maskable intrerupt is a signal sent by the PPU to the CPU during vblank.

### 
