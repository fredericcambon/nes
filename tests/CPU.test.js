import fs from "fs";

import Console from "../src/core/Console";
import { ASMScript } from "./utils";

var c = new Console();

test("LDx, STx Immediate, Zero Page", () => {
  var testScript = new ASMScript(
    "ldx_stx_1",
    `
      LDA #$40
      STA $0

      LDX $0
      INX
      DEX

      STX $1
      LDY $1
      INY
      DEY
      STY $2

      STY $3
      STY $4
      INC $3
      DEC $4
    `
  );

  c.loadROM(testScript.read());
  c.startSync();

  expect(c.cpu.a).toBe(0x40);
  expect(c.cpu.x).toBe(0x40);
  expect(c.cpu.y).toBe(0x40);
  expect(c.cpu.memory.zp[0]).toBe(0x40);
  expect(c.cpu.memory.zp[1]).toBe(0x40);
  expect(c.cpu.memory.zp[2]).toBe(0x40);
  expect(c.cpu.memory.zp[3]).toBe(0x41);
  expect(c.cpu.memory.zp[4]).toBe(0x3f);
});

test("ADC ZeroPage", () => {
  var testScript = new ASMScript(
    "adc_1",
    `
      LDA #$40
      STA $0
      ADC $0
    `
  );

  c.loadROM(testScript.read());

  c.startSync();

  expect(c.cpu.a).toBe(0x80);
  expect(c.cpu.c).toBe(0); // carry flag not set
  expect(c.cpu.v).toBe(1); // overflow flag set
  expect(c.cpu.n).toBe(1); // negative flag set

  var testScript2 = new ASMScript(
    "adc_2",
    `
      LDA #$80
      STA $0
      ADC $0
      `
  );

  c.loadROM(testScript2.read());
  c.startSync();

  expect(c.cpu.a).toBe(0x00); // 8bits wrap
  expect(c.cpu.c).toBe(1); // carry flag set
  expect(c.cpu.v).toBe(1); // overflow flag set
  expect(c.cpu.n).toBe(0); // negative flag not set
});

test("SBC ZeroPage", () => {
  var testScript = new ASMScript(
    "sbc_1",
    `
      LDX #$40
      STX $0
      SBC $0
    `
  );

  c.loadROM(testScript.read());

  c.startSync();

  expect(c.cpu.a).toBe(0xbf);
  expect(c.cpu.v).toBe(1);
  expect(c.cpu.n).toBe(1);
});

test("LDx, STx Zero Page X, Zero Page Y", () => {
  var testScript = new ASMScript(
    "ldx_stx_2",
    `
      LDX #$40
      LDY #$40
      LDA #$10
      STA $41

      LDA $1,x
      LDX $1,y
    `
  );

  c.loadROM(testScript.read());
  c.startSync();

  expect(c.cpu.a).toBe(0x10);
  expect(c.cpu.x).toBe(0x10);
});

test("Clear flags", () => {
  var testScript = new ASMScript(
    "clear_1",
    `
      LDA #$80
      STA $0
      ADC $0

      CLC
      CLV
      CLI
  `
  );

  c.loadROM(testScript.read());
  c.startSync();

  expect(c.cpu.c).toBe(0);
  expect(c.cpu.v).toBe(0);
  expect(c.cpu.i).toBe(0);
});

test("Set flags", () => {
  var testScript = new ASMScript(
    "set_1",
    `
      SED
      SEC
      SEI
    `
  );

  c.loadROM(testScript.read());
  c.startSync();

  expect(c.cpu.d).toBe(1);
  expect(c.cpu.c).toBe(1);
  expect(c.cpu.i).toBe(1);
});

test("BVC", () => {
  var testScript = new ASMScript(
    "bvc_1",
    `
    BVC func_1

    func_1:
      LDA #$1
    `
  );

  c.loadROM(testScript.read());

  c.startSync();

  expect(c.cpu.v).toBe(0);
  expect(c.cpu.a).toBe(1);

  var testScript2 = new ASMScript(
    "bvc_2",
    `
    ADC #$80
    ADC #$80 ; force overflow
    BVC func_2
    `,
    `
    func_2:
      LDA #$1

    `
  );

  c.loadROM(testScript2.read());

  c.startSync();

  expect(c.cpu.v).toBe(1);
  expect(c.cpu.a).toBe(0);
});
