export var MODES = {
    ABSOLUTE: 0,
    ABSOLUTE_X: 1,
    ABSOLUTE_Y: 2,
    ACCUMULATOR: 3,
    IMMEDIATE: 4,
    IMPLIED: 5,
    INDEXED_INDIRECT_X: 6,
    INDIRECT: 7,
    INDIRECT_INDEXED_Y: 8,
    RELATIVE: 9,
    ZERO_PAGE: 10,
    ZERO_PAGE_X: 11,
    ZERO_PAGE_Y: 12
};


export var OPCODES = {
    ADC: 0,
    AND: 1,
    ASL: 2,
    BCC: 3,
    BCS: 4,
    BEQ: 5,
    BIT: 6,
    BMI: 7,
    BNE: 8,
    BPL: 9,
    BRK: 10,
    BVC: 11,
    BVS: 12,
    CLC: 13,
    CLD: 14,
    CLI: 15,
    CLV: 16,
    CMP: 17,
    CPX: 18,
    CPY: 19,
    DEC: 20,
    DEX: 21,
    DEY: 22,
    EOR: 23,
    INC: 24,
    INX: 25,
    INY: 26,
    JMP: 27,
    JSR: 28,
    LDA: 29,
    LDX: 30,
    LDY: 31,
    LSR: 32,
    NOP: 33,
    ORA: 34,
    PHA: 35,
    PHP: 36,
    PLA: 37,
    PLP: 38,
    ROL: 39,
    ROR: 40,
    RTI: 41,
    RTS: 42,
    SBC: 43,
    SEC: 44,
    SED: 45,
    SEI: 46,
    STA: 47,
    STX: 48,
    STY: 49,
    TAX: 50,
    TAY: 51,
    TSX: 52,
    TXA: 53,
    TXS: 54,
    TYA: 55,

    ASL_ACC: 56,
    LSR_ACC: 57,
    ROL_ACC: 58,
    ROR_ACC: 59,

    // TODO: Unused opcodes
    SLO: 60
};


export var INTERRUPTS = {
    NMI: 0,
    IRQ: 1
};


export var BUTTONS = {
    A: 0,
    B: 1,
    SELECT: 2,
    START: 3,
    UP: 4,
    DOWN: 5,
    LEFT: 6,
    RIGHT: 7
};


export var COLORS = [
    0x666666, 0x002A88, 0x1412A7, 0x3B00A4, 0x5C007E,
    0x6E0040, 0x6C0600, 0x561D00, 0x333500, 0x0B4800,
    0x005200, 0x004F08, 0x00404D, 0x000000, 0x000000,
    0x000000, 0xADADAD, 0x155FD9, 0x4240FF, 0x7527FE,
    0xA01ACC, 0xB71E7B, 0xB53120, 0x994E00, 0x6B6D00,
    0x388700, 0x0C9300, 0x008F32, 0x007C8D, 0x000000,
    0x000000, 0x000000, 0xFFFEFF, 0x64B0FF, 0x9290FF,
    0xC676FF, 0xF36AFF, 0xFE6ECC, 0xFE8170, 0xEA9E22,
    0xBCBE00, 0x88D800, 0x5CE430, 0x45E082, 0x48CDDE,
    0x4F4F4F, 0x000000, 0x000000, 0xFFFEFF, 0xC0DFFF,
    0xD3D2FF, 0xE8C8FF, 0xFBC2FF, 0xFEC4EA, 0xFECCC5,
    0xF7D8A5, 0xE4E594, 0xCFEF96, 0xBDF4AB, 0xB3F3CC,
    0xB5EBF2, 0xB8B8B8, 0x000000, 0x000000
];

export var CYCLES = {
    ZERO: 0,
    ONE: 1,
    PREFETCH: 2,
    VISIBLE: 3,
    SPRITES: 4,
    COPY_Y: 5,
    COPY_X: 6,
    INCREMENT_Y: 7,
    IDLE: 8,
    FLUSH_TILEDATA: 9
};


export var SCANLINES = {
    PRELINE: 0,
    VISIBLE: 1,
    VBLANK: 2,
    IDLE: 3
};
