import { spawnSync } from "child_process";
import fs from "fs";

/**
 * Creates simple NES binaries for our test suite using `nesasm`
 */
export class ASMScript {
  constructor(name, mainFunc, program = "") {
    this.name = name;
    this.asmFilename = "./tests/data/" + this.name + ".asm";
    this.nesFilename = "./tests/data/" + this.name + ".nes";
    this.mainFunc = mainFunc;
    this.program = program;

    this.compile();
  }

  formatScript() {
    // Structure looks a bit funky because ASM format is strict
    return `
  .inesprg 1   ; 1x 16KB PRG code
  .ineschr 1   ; 1x  8KB CHR data
  .inesmap 0   ; mapper 0 = NROM, no bank swapping
  .inesmir 1   ; background mirroring


;;;;;;;;;;;;;;;

  .bank 0 ; (PRG)
  .org $C000

${this.program}

RESET:
  ${this.mainFunc}
NMI:
  PHP
  RTI

;;;;;;;;;;;;;;  

  .bank 1
  .org $FFFA     ;first of the three vectors starts here
  .dw NMI        ;when an NMI happens (once per frame if enabled) the 
                 ;processor will jump to the label NMI:
  .dw RESET      ;when the processor first turns on or is reset, it will jump
                 ;to the label RESET:
  .dw 0          ;external interrupt IRQ is not used in this tutorial

    
;;;;;;;;;;;;;;  

  .bank 2 ; unused for now (CHR)
  .org $0000
`;
  }

  compile() {
    fs.writeFileSync(this.asmFilename, this.formatScript());
    spawnSync("nesasm", [this.asmFilename]);
  }

  read() {
    return fs.readFileSync(this.nesFilename);
  }
}
