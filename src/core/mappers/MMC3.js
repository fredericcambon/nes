import Mapper from './Mapper';

class MMC3 extends Mapper {
    // FIXME ffs
    constructor( rom ) {
        super( rom );
        this.prg = rom.prg;
        this.chr = rom.chr;
        this.prgOffsets = new Array( 4 );
        this.chrOffsets = new Array( 8 );
        this.prgMode = 0;
        this.chrMode = 0;
        this.counter = 0;
        this.reload = 0;

        this.prgOffsets[ 0 ] = this.prgBankOffset( 0 );
        this.prgOffsets[ 1 ] = this.prgBankOffset( 1 );
        this.prgOffsets[ 2 ] = this.prgBankOffset( -2 );
        this.prgOffsets[ 3 ] = this.prgBankOffset( -1 );
    }

    tick( cpu.ppu ) {
        if ( ppu.displayEnabled() && ppu.scanline < 239 ) {
            if ( this.counter == 0 ) {
                this.counter = this.reload;
            } else {
                this.counter--;
                if ( this.counter === 0 && this.irqEnable ) {
                    cpu.triggerIRQ();
                }
            }
        }
    }

    read8() {

    }

    write8() {

    }
}
