import NROM from "./mappers/NROM";
import MMC1 from "./mappers/MMC1";
import MMC3 from "./mappers/MMC3";
import UXROM from "./mappers/UXROM";

const HEADER_SIZE = 16;
const PRG_BANK_SIZE = 16384;
const CHR_BANK_SIZE = 8192;

class ROM {
  /**
   * Parse a .nes file according to the INES file format
   * http://wiki.nesdev.com/w/index.php/INES
   * https://wiki.nesdev.com/w/index.php/CHR_ROM_vs._CHR_RAM

   * CHR => Pattern tables, the raw data to render by the PPU
   * PRG => The program, used by the CPU
   */
  constructor(dataBuffer) {
    var p = 0;
    var byteArray = new Uint8Array(dataBuffer);
    this.header = byteArray.subarray(p, HEADER_SIZE);

    p += HEADER_SIZE;

    this.nbrPRGBanks = this.header[4];
    this.nbrCHRBanks = this.header[5];
    // Cf below for types
    this.mapperType = (this.header[6] >> 4) | ((this.header[7] >> 4) << 4);
    // Type will depend on the mapper, check mapper classes
    this.mirrorType = (this.header[6] & 1) | (((this.header[6] >> 3) & 1) << 1);
    // 0: NTSC, 1: PAL
    this.region = this.header[9] & 1;

    var prgLength = this.nbrPRGBanks * PRG_BANK_SIZE;
    var chrLength = this.nbrCHRBanks * CHR_BANK_SIZE;

    this.prg = byteArray.subarray(p, p + prgLength);

    p += prgLength;

    if (chrLength > 0) {
      this.chr = byteArray.subarray(p, p + chrLength);
    } else {
      this.chr = new Uint8Array(CHR_BANK_SIZE).fill(0);
    }

    switch (this.mapperType) {
      case 0: {
        this.mapper = new NROM(this);
        break;
      }
      case 1: {
        this.mapper = new MMC1(this);
        break;
      }
      case 2: {
        this.mapper = new UXROM(this);
        break;
      }
      case 4: {
        this.mapper = new MMC3(this);
        break;
      }
      default: {
        throw "Invalid mapper: " + this.mapperType;
      }
    }
  }

  /*
  toJSON() {
    return {
      nbrPRGBanks: this.nbrPRGBanks,
      nbrCHRBanks: this.nbrCHRBanks,
      mapperType: this.mapperType,
      mirrorType: this.mirrorType,
      region: this.region,
      mapper: this.mapper.toJSON()
    };
  }*/
}

export default ROM;
