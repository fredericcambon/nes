import {
    MODES,
    OPCODES
} from './constants.js';

import {
    isPageCrossed
} from './utils.js';

export var modes = {
    [ MODES.IMMEDIATE ]: ( cpu ) => {
        return cpu.pc + 1;
    },
    [ MODES.ABSOLUTE ]: ( cpu ) => {
        return cpu.read16( cpu.pc + 1 );
    },
    [ MODES.ABSOLUTE_X ]: ( cpu ) => {
        var addr = ( cpu.read16( cpu.pc + 1 ) + cpu.x ) & 0xFFFF;

        if ( isPageCrossed( addr - cpu.x, addr ) ) {
            cpu.b = 1;
        }

        return addr;

    },
    [ MODES.ABSOLUTE_Y ]: ( cpu ) => {
        var addr = ( cpu.read16( cpu.pc + 1 ) + cpu.y ) & 0xFFFF;

        if ( isPageCrossed( addr - cpu.y, addr ) ) {
            cpu.b = 1;
        }

        return addr;
    },
    [ MODES.ACCUMULATOR ]: ( cpu ) => {
        return cpu.a;
    },
    [ MODES.IMPLIED ]: ( cpu ) => {
        return 0;
    },
    [ MODES.RELATIVE ]: ( cpu ) => {
        var addr = cpu.read8( cpu.pc + 1 );

        if ( addr < 0x80 ) {
            return addr + cpu.pc + 2;
        } else {
            return addr + cpu.pc + 2 - 0x100;
        }
    },
    [ MODES.ZERO_PAGE_Y ]: ( cpu ) => {
        return ( cpu.read8( cpu.pc + 1 ) + cpu.y ) & 0xFF;
    },
    [ MODES.ZERO_PAGE_X ]: ( cpu ) => {
        return ( cpu.read8( cpu.pc + 1 ) + cpu.x ) & 0xFF;
    },
    [ MODES.ZERO_PAGE ]: ( cpu ) => {
        return cpu.read8( cpu.pc + 1 );
    },
    [ MODES.INDEXED_INDIRECT_X ]: ( cpu ) => {
        return cpu.read16indirect( ( cpu.read8( cpu.pc + 1 ) + cpu.x ) & 0xFF );
    },
    [ MODES.INDIRECT_INDEXED_Y ]: ( cpu ) => {
        var addr = ( cpu.read16indirect( cpu.read8( cpu.pc + 1 ) ) + cpu.y ) & 0xFFFF;

        if ( isPageCrossed( addr - cpu.y, addr ) ) {
            cpu.b = 1;
        }

        return addr;

    },
    // https://github.com/scottferg/Fergulator/blob/master/nes/6502.go#L203-L207
    [ MODES.INDIRECT ]: ( cpu ) => {
        return cpu.read16indirect( cpu.read16( cpu.pc + 1 ) );
    }
};
