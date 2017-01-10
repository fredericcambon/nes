import Mapper from './Mapper';

import {
    BANK_SIZES,
    NAMETABLE_MIRRORS
} from './constants';


const MMC1_MIRRORS = {
    0: NAMETABLE_MIRRORS.SINGLE_SCREEN_0,
    1: NAMETABLE_MIRRORS.SINGLE_SCREEN_1,
    2: NAMETABLE_MIRRORS.VERTICAL,
    3: NAMETABLE_MIRRORS.HORIZONTAL
}


class MMC1 extends Mapper {
    /*
        http://wiki.nesdev.com/w/index.php/MMC1
    */
    constructor( rom ) {
        super( rom );
        this.buffer = 0x10;
        this.bufferIndex = 0;
        this.conf = 0x0C;
        this.prgBankMode = 0;
        this.chrBankMode = 0;
    }

    read8( addr ) {
        if ( addr < 0x2000 ) {
            return this.chr.read8( addr );
        } else if ( addr < 0x8000 ) {
            return this.sram[ addr - 0x6000 ];
        } else {
            return this.prg.read8( addr - 0x8000 );
        }
    }

    write8( addr, value ) {
        if ( addr < 0x2000 ) {
            this.chr.write8( addr, value );
        } else if ( addr < 0x8000 ) {
            this.sram[ addr - 0x6000 ] = value;
        } else {
            if ( ( value & 0x80 ) != 0 ) {
                this.buffer = 0x10;
                this.bufferIndex = 0;
                this.control( this.conf | 0x0C );
            } else {
                // Write Register
                this.buffer = ( this.buffer >> 1 ) | ( ( value & 1 ) << 4 );
                this.bufferIndex++;

                if ( this.bufferIndex == 5 ) {
                    value = this.buffer;

                    // Control
                    if ( addr < 0xA000 ) {
                        this.control( value );
                    }

                    // CHR Bank 0
                    else if ( addr < 0xC000 ) {
                        this.chr.updateLowerBank( value );
                    }

                    // CHR Bank 1
                    else if ( addr < 0xE000 ) {
                        if ( !this.chr.bankFixed ) {
                            this.chr.updateUpperBank( value );
                        }
                    }

                    // PRG Bank
                    else {
                        this.prg.updateBanks( value );
                    }

                    this.buffer = 0x10;
                    this.bufferIndex = 0;
                }
            }
        }
    }

    control( value ) {
        this.conf = value;
        this.prgBankMode = ( value >> 2 ) & 3;
        this.chrBankMode = ( value >> 4 ) & 1;
        this.mirrorType = MMC1_MIRRORS[ value & 3 ];

        switch ( this.prgBankMode ) {
        case 0:
        case 1:
            {
                this.prg.setFixedBank();
                break;
            }
        case 2:
            {
                this.prg.setSwitchableBank( 0 );
                break;
            }
        case 3:
            {
                this.prg.setSwitchableBank( 1 );
                break;
            }
        }

        if ( !this.chrBankMode ) {
            this.chr.setFixedBank();
        } else {
            this.chr.setSwitchableBank();
        }
    }
}

export default MMC1
