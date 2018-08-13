(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["NES"] = factory();
	else
		root["NES"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Console = undefined;
	
	var _Console = __webpack_require__(1);
	
	var _Console2 = _interopRequireDefault(_Console);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.Console = _Console2.default;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _CPU = __webpack_require__(2);
	
	var _CPU2 = _interopRequireDefault(_CPU);
	
	var _PPU = __webpack_require__(9);
	
	var _PPU2 = _interopRequireDefault(_PPU);
	
	var _ROM = __webpack_require__(11);
	
	var _ROM2 = _interopRequireDefault(_ROM);
	
	var _APU = __webpack_require__(19);
	
	var _APU2 = _interopRequireDefault(_APU);
	
	var _Controller = __webpack_require__(20);
	
	var _Controller2 = _interopRequireDefault(_Controller);
	
	var _constants = __webpack_require__(4);
	
	var _Merge = __webpack_require__(21);
	
	var _Notifier2 = __webpack_require__(22);
	
	var _Notifier3 = _interopRequireDefault(_Notifier2);
	
	var _Throttle = __webpack_require__(23);
	
	var _Throttle2 = _interopRequireDefault(_Throttle);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	/**
	 * Main class for the emulator, controls the hardware emulation.
	 * Fires up events.
	 */
	var Console = function (_Notifier) {
	  _inherits(Console, _Notifier);
	
	  function Console() {
	    var fps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
	
	    _classCallCheck(this, Console);
	
	    var _this = _possibleConstructorReturn(this, (Console.__proto__ || Object.getPrototypeOf(Console)).call(this));
	
	    _this.cpu = new _CPU2.default();
	    _this.ppu = new _PPU2.default();
	    _this.apu = new _APU2.default();
	    _this.controller = new _Controller2.default();
	    _this.rom = null;
	    _this.cycles = 0;
	    _this.interrupt = null;
	    _this.quickSaveData = null;
	
	    // CPU, APU, PPU and controller are cross referenced in the code
	    _this.cpu.connect(_this.apu, _this.ppu, _this.controller);
	    _this.frameReq = null;
	
	    // Output & CPU throttling
	    _this.frameThrottling = fps ? new _Throttle2.default(fps) : null;
	    _this.nesThrottling = new _Throttle2.default(60);
	
	    // Debug variables
	    _this.frameNbr = 0;
	    _this.opCodesKeys = Object.keys(_constants.OPCODES);
	    _this.modeKeys = Object.keys(_constants.MODES);
	    return _this;
	  }
	
	  _createClass(Console, [{
	    key: "loadROM",
	    value: function loadROM(data) {
	      this.rom = new _ROM2.default(data);
	      this.ppu.connectROM(this.rom);
	      this.reset();
	    }
	  }, {
	    key: "getRomInfo",
	    value: function getRomInfo() {
	      if (this.rom !== null) {
	        return this.rom.toJSON();
	      }
	
	      throw new Error("No active ROM found");
	    }
	  }, {
	    key: "reset",
	    value: function reset() {
	      this.cpu.reset();
	      this.ppu.reset();
	      this.notifyObservers("nes-reset", this.ppu.frameBuffer);
	    }
	  }, {
	    key: "quickSave",
	    value: function quickSave() {
	      // Ok so, this is a bit of a mess here
	      // Save also bundles the current ROM, and our memory buffers take a lot of place.
	      // localStorage has a strict threshold for what you can store.
	      // To work around this, Make a clone of the current NES object and empty the memory buffers
	      var quickSaveData = JSON.parse(JSON.stringify(this.cpu));
	
	      quickSaveData.ppu.frameBuffer = [];
	      quickSaveData.ppu.frameBackgroundBuffer = [];
	      quickSaveData.ppu.frameSpriteBuffer = [];
	      quickSaveData.ppu.frameColorBuffer = [];
	      quickSaveData.ppu.patternTable1 = [];
	      quickSaveData.ppu.patternTable2 = [];
	
	      this.notifyObservers("nes-quick-save");
	      localStorage.quickSave = JSON.stringify(quickSaveData);
	    }
	  }, {
	    key: "loadQuickSave",
	    value: function loadQuickSave(data) {
	      if (localStorage.quickSave) {
	        this.cpu = (0, _Merge.mergeDeep)(this.cpu, JSON.parse(localStorage.quickSave));
	        this.cpu.ppu.resetBuffers();
	        this.notifyObservers("nes-load-quick-save");
	      }
	    }
	  }, {
	    key: "start",
	    value: function start() {
	      this._tick = this.tick;
	      this.frameReq = requestAnimationFrame(this.frame.bind(this));
	    }
	  }, {
	    key: "startDebug",
	    value: function startDebug() {
	      this._tick = this.tickDebug;
	      this.frameReq = requestAnimationFrame(this.frame.bind(this));
	    }
	  }, {
	    key: "stop",
	    value: function stop() {
	      cancelAnimationFrame(this.frameReq);
	    }
	
	    /**
	     *  Same a tick() but with additional notify calls for debug purposes.
	     *  Slows down the main loop which is why it needs a separate codepath
	     */
	
	  }, {
	    key: "tickDebug",
	    value: function tickDebug() {
	      this.cycles = this.cpu.tick();
	      this.cycles = this.cycles * 3;
	
	      this.notifyObservers("cpu-tick", [this.cpu.instrCode, this.opCodesKeys[this.cpu.instrOpCode], this.modeKeys[this.cpu.instrMode], this.cpu.instrSize, this.cpu.instrCycles, this.cpu.addr]);
	
	      for (; this.cycles > 0; this.cycles--) {
	        this.interrupt = this.ppu.tick();
	
	        if (this.interrupt !== null) {
	          if (this.interrupt === _constants.INTERRUPTS.NMI) {
	            this.cpu.triggerNMI();
	          } else if (this.interrupt === _constants.INTERRUPTS.IRQ) {
	            this.cpu.triggerIRQ();
	          }
	        }
	        // Check when next scanline is done
	
	        this.notifyObservers("ppu-tick");
	
	        if (this.ppu.frameReady) {
	          this.notifyObservers("frame-ready", this.ppu.frameBuffer);
	          this.notifyObservers("frame-ready-debug");
	          this.ppu.acknowledgeFrame();
	          this.frameNbr++;
	          return false;
	        }
	      }
	
	      return true;
	    }
	  }, {
	    key: "tick",
	    value: function tick() {
	      this.cycles = this.cpu.tick();
	
	      for (var c = this.cycles; c > 0; c--) {
	        this.apu.tick();
	      }
	
	      for (var _c = this.cycles * 3; _c > 0; _c--) {
	        this.interrupt = this.ppu.tick();
	
	        if (this.interrupt !== null) {
	          if (this.interrupt === _constants.INTERRUPTS.NMI) {
	            this.cpu.triggerNMI();
	          } else if (this.interrupt === _constants.INTERRUPTS.IRQ) {
	            this.cpu.triggerIRQ();
	          }
	        }
	
	        if (this.ppu.frameReady) {
	          if (!this.frameThrottling.isThrottled()) {
	            this.notifyObservers("frame-ready", [this.ppu.frameBuffer, this.ppu.frameBackgroundBuffer, this.ppu.frameSpriteBuffer, this.ppu.frameColorBuffer]);
	          }
	          this.ppu.acknowledgeFrame();
	          return false;
	        }
	      }
	
	      return true;
	    }
	  }, {
	    key: "frame",
	    value: function frame() {
	      if (this.nesThrottling === null || !this.nesThrottling.isThrottled()) {
	        while (true) {
	          if (!this._tick()) {
	            break;
	          }
	        }
	      }
	      this.frameReq = requestAnimationFrame(this.frame.bind(this));
	    }
	  }]);
	
	  return Console;
	}(_Notifier3.default);
	
	exports.default = Console;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _CPUMemory = __webpack_require__(3);
	
	var _CPUMemory2 = _interopRequireDefault(_CPUMemory);
	
	var _constants = __webpack_require__(4);
	
	var _instructions = __webpack_require__(5);
	
	var _modes = __webpack_require__(6);
	
	var _opcodes = __webpack_require__(8);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var CPU = function () {
	  function CPU() {
	    _classCallCheck(this, CPU);
	
	    // Hardware connected to CPU
	    this.memory = new _CPUMemory2.default();
	    this.mapper = null;
	    this.apu = null;
	    this.ppu = null;
	    this.controller = null;
	
	    // Cycles Counter
	    this.cycles = 0;
	    // Branch counter used by some opcodes for extra cycles
	    // when pages are crossed
	    this.b = 0;
	
	    // Program Counter
	    this.pc = 0x00;
	    // Stack Pointer
	    this.sp = 0x00;
	
	    // Registers
	    this.a = 0;
	    this.x = 0;
	    this.y = 0;
	
	    // Flags
	    this.c = 0; // Carry flag
	    this.z = 0; // Zero flag
	    this.i = 0; // Interrupt flag
	    this.d = 0; // Decimal flag
	    // Break flag
	    this.v = 0; // Overflow flag
	    this.n = 0; // Negative flag
	    // Unused flag
	
	    // Interrupt type
	    this.interrupt = null;
	
	    this._modes = _modes.modes;
	    this._instructions = _instructions.instructions;
	    this._opcodes = _opcodes.opcodes;
	
	    this.stallCounter = 0;
	
	    // Tick variables
	    this.tmpCycles = 0;
	    this.instrCycles = 0;
	    this.instrCode = 0;
	    this.instrOpCode = 0;
	    this.instrMode = 0;
	    this.instrSize = 0;
	    this.addr = 0;
	  }
	
	  /*
	   toJSON() {
	    return {
	      memory: this.memory.toJSON(),
	      cycles: this.cycles,
	      b: this.b,
	      pc: this.pc,
	      sp: this.sp,
	      a: this.a,
	      x: this.x,
	      y: this.y,
	      c: this.c,
	      z: this.z,
	      i: this.i,
	      d: this.d,
	      v: this.v,
	      n: this.n,
	      interrupt: this.interrupt,
	      stallCounter: this.stallCounter
	    };
	  }
	   */
	
	  _createClass(CPU, [{
	    key: "loadJSON",
	    value: function loadJSON(obj) {}
	  }, {
	    key: "connect",
	    value: function connect(apu, ppu, controller) {
	      this.apu = apu;
	      this.ppu = ppu;
	      this.controller = controller;
	    }
	  }, {
	    key: "connectROM",
	    value: function connectROM(rom) {
	      // Improve that
	      // this.mapper = rom.mapper;
	      // this.mapper.cpu = this;
	    }
	  }, {
	    key: "stall",
	    value: function stall() {
	      if (this.cycles % 2 === 1) {
	        this.stallCounter += 514;
	      } else {
	        this.stallCounter += 513;
	      }
	    }
	  }, {
	    key: "reset",
	    value: function reset() {
	      this.cycles = 0;
	      this.a = 0;
	      this.x = 0;
	      this.y = 0;
	      this.interrupt = null;
	      this.stallCounter = 0;
	      this.pc = this.read16(0xfffc);
	      this.sp = 0xfd;
	      this.setFlags(0x24);
	    }
	  }, {
	    key: "tick",
	    value: function tick() {
	      this.tmpCycles = this.cycles;
	      this.b = 0;
	
	      // Stalled after PPU OAMDMA
	      if (this.stallCounter > 0) {
	        this.stallCounter--;
	        // Should return 1 but this somehow fixes some games.
	        // Probably due to CPU being not exactly accurate
	        // ¯\_(ツ)_/¯
	        return 0;
	      }
	
	      // TODO Not DRY
	      if (this.interrupt !== null) {
	        switch (this.interrupt) {
	          case _constants.INTERRUPTS.NMI:
	            {
	              this.stackPush16(this.pc);
	              this.stackPush8(this.getFlags() & ~0x10);
	              this.pc = this.read16(0xfffa);
	              this.i = 1;
	              this.cycles += 7;
	              break;
	            }
	          case _constants.INTERRUPTS.IRQ:
	            {
	              if (this.i === 0) {
	                this.stackPush16(this.pc);
	                this.stackPush8(this.getFlags() & ~0x10);
	                this.pc = this.read16(0xfffe);
	                this.i = 1;
	                this.cycles += 7;
	              }
	              break;
	            }
	        }
	
	        this.interrupt = null;
	
	        return 7;
	      }
	
	      try {
	        this.instrCode = this.read8(this.pc);
	      } catch (err) {
	        throw new Error("Could not read next instruction: " + err);
	      }
	
	      var _instructions$instrCo = _slicedToArray(this._instructions[this.instrCode], 4);
	
	      this.instrOpCode = _instructions$instrCo[0];
	      this.instrMode = _instructions$instrCo[1];
	      this.instrSize = _instructions$instrCo[2];
	      this.instrCycles = _instructions$instrCo[3];
	
	
	      this.addr = this._modes[this.instrMode](this);
	
	      this.pc += this.instrSize;
	      this.cycles += this.instrCycles;
	
	      this._opcodes[this.instrOpCode](this.addr, this);
	
	      return this.cycles - this.tmpCycles;
	    }
	
	    /**
	     * Interrupts
	     */
	
	  }, {
	    key: "triggerNMI",
	    value: function triggerNMI() {
	      this.interrupt = _constants.INTERRUPTS.NMI;
	    }
	  }, {
	    key: "triggerIRQ",
	    value: function triggerIRQ() {
	      this.interrupt = _constants.INTERRUPTS.IRQ;
	    }
	
	    /**
	     * Read & Write methods
	     *
	     * CPU RAM: 0x0000 => 0x2000
	     * PPU Registers: 0x2000 => 0x4000
	     * Controller: 0x4016
	     * Controller2: 0x4016
	     * ROM Mapper: 0x6000 => 0x10000
	     */
	
	  }, {
	    key: "read8",
	    value: function read8(addr) {
	      if (addr < 0x2000) {
	        return this.memory.read8(addr);
	      } else if (addr < 0x4000) {
	        // 7 bytes PPU registers
	        // mirrored from 0x2000 to 0x4000
	        return this.ppu.read8(0x2000 + addr % 8);
	      } else if (addr === 0x4014) {
	        return this.ppu.read8(addr);
	      } else if (addr === 0x4015) {
	        return this.apu.read8();
	      } else if (addr === 0x4016) {
	        return this.controller.read8();
	      } else if (addr === 0x4017) {
	        return 0;
	      } else if (addr < 0x6000) {
	        console.log("I/O REGISTERS");
	        return 0;
	      } else {
	        return this.ppu.memory.mapper.read8(addr);
	      }
	    }
	  }, {
	    key: "read16",
	    value: function read16(addr) {
	      // Read two bytes and concatenate them
	      return this.read8(addr + 1) << 8 | this.read8(addr);
	    }
	  }, {
	    key: "read16indirect",
	    value: function read16indirect(addr) {
	      // Special read16 method for indirect mode reading (NES bug)
	      var addr2 = addr & 0xff00 | (addr & 0xff) + 1 & 0xff;
	      var lo = this.read8(addr);
	      var hi = this.read8(addr2);
	
	      return hi << 8 | lo;
	    }
	  }, {
	    key: "write8",
	    value: function write8(addr, value) {
	      if (addr < 0x2000) {
	        this.memory.write8(addr, value);
	      } else if (addr < 0x4000) {
	        // 7 bytes PPU registers
	        // mirrored from 0x2000 to 0x4000
	        this.ppu.write8(0x2000 + addr % 8, value);
	      } else if (addr === 0x4014) {
	        // This might seem a bit odd but this avoids circular reference (ppu using cpu methods)
	        addr = value << 8;
	        this.ppu.tmpOamAddress = this.ppu.oamAddress;
	
	        for (var i = 0; i < 256; i++) {
	          this.ppu.memory.oam[this.ppu.oamAddress] = this.read8(addr);
	          this.ppu.oamAddress++;
	          addr++;
	        }
	
	        this.ppu.oamAddress = this.ppu.tmpOamAddress;
	        this.stall();
	      } else if (addr === 0x4015) {
	        this.apu.write8(addr, value);
	      } else if (addr === 0x4016) {
	        this.controller.write8(value);
	      } else if (addr === 0x4017) {
	        // TODO sound
	      } else if (addr >= 0x6000) {
	        // Write to mapper (handled by PPU)
	        this.ppu.memory.mapper.write8(addr, value);
	      } else if (addr < 0x6000) {
	        // console.log('I/O REGISTERS');
	      }
	    }
	
	    /**
	     * Stack methods
	     */
	
	  }, {
	    key: "stackPush8",
	    value: function stackPush8(value) {
	      this.memory.stack[this.sp] = value;
	      this.sp = this.sp - 1 & 0xff;
	    }
	  }, {
	    key: "stackPush16",
	    value: function stackPush16(value) {
	      // Get the 8 highest bits
	      // Truncate the 8 lower bits
	      // Push the two parts of `value`
	      this.stackPush8(value >> 8);
	      this.stackPush8(value & 0xff);
	    }
	  }, {
	    key: "stackPull8",
	    value: function stackPull8(value) {
	      this.sp = this.sp + 1 & 0xff;
	      return this.memory.stack[this.sp];
	    }
	  }, {
	    key: "stackPull16",
	    value: function stackPull16(value) {
	      return this.stackPull8() | this.stackPull8() << 8;
	    }
	
	    /**
	     * Flag methods
	     */
	
	  }, {
	    key: "setZeroFlag",
	    value: function setZeroFlag(value) {
	      if (value === 0) {
	        this.z = 1;
	      } else {
	        this.z = 0;
	      }
	    }
	  }, {
	    key: "setNegativeFlag",
	    value: function setNegativeFlag(value) {
	      if ((value & 0x80) !== 0) {
	        this.n = 1;
	      } else {
	        this.n = 0;
	      }
	    }
	  }, {
	    key: "getFlags",
	    value: function getFlags() {
	      // Concatenate the values of the flags in an int
	      var flags = 0;
	
	      flags = flags | this.c << 0;
	      flags = flags | this.z << 1;
	      flags = flags | this.i << 2;
	      flags = flags | this.d << 3;
	      flags = flags | 0 << 4;
	      flags = flags | 1 << 5;
	      flags = flags | this.v << 6;
	      flags = flags | this.n << 7;
	
	      return flags;
	    }
	  }, {
	    key: "setFlags",
	    value: function setFlags(value) {
	      this.c = value >> 0 & 1;
	      this.z = value >> 1 & 1;
	      this.i = value >> 2 & 1;
	      this.d = value >> 3 & 1;
	      this.v = value >> 6 & 1;
	      this.n = value >> 7 & 1;
	    }
	  }]);
	
	  return CPU;
	}();
	
	exports.default = CPU;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/**
	 * CPU RAM: 0x0000 => 0x2000
	 */
	var CPUMemory = function () {
	  function CPUMemory() {
	    _classCallCheck(this, CPUMemory);
	
	    this.zp = new Uint8Array(256).fill(0xff);
	    this.stack = new Uint8Array(256).fill(0xff);
	    this.ram = new Uint8Array(1536).fill(0xff);
	  }
	
	  /*
	  toJSON() {
	    return {
	      zp: this.zp,
	      stack: this.stack,
	      ram: this.ram
	    };
	  } */
	
	  _createClass(CPUMemory, [{
	    key: "read8",
	    value: function read8(addr) {
	      // 2k bits RAM
	      // mirrored 4 times
	      addr = addr % 0x800;
	
	      if (addr < 0x100) {
	        return this.zp[addr];
	      } else if (addr < 0x200) {
	        return this.stack[addr - 0x100];
	      } else {
	        return this.ram[addr - 0x200];
	      }
	    }
	  }, {
	    key: "write8",
	    value: function write8(addr, value) {
	      // 2k bits RAM
	      // mirrored 4 times
	      addr = addr % 0x800;
	
	      if (addr < 0x0100) {
	        this.zp[addr] = value;
	      } else if (addr < 0x0200) {
	        this.stack[addr - 0x100] = value;
	      } else {
	        this.ram[addr - 0x200] = value;
	      }
	    }
	  }]);
	
	  return CPUMemory;
	}();
	
	exports.default = CPUMemory;

/***/ }),
/* 4 */
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var RENDERING_MODES = exports.RENDERING_MODES = {
	  NORMAL: 0,
	  SPLIT: 1
	};
	
	var MODES = exports.MODES = {
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
	
	var OPCODES = exports.OPCODES = {
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
	
	var INTERRUPTS = exports.INTERRUPTS = {
	  NMI: 0,
	  IRQ: 1
	};
	
	var KEYBOARD_KEYS = exports.KEYBOARD_KEYS = {
	  A: 88,
	  B: 67,
	  SELECT: 16,
	  START: 13,
	  UP: 38,
	  DOWN: 40,
	  LEFT: 37,
	  RIGHT: 39
	};
	
	var BUTTONS = exports.BUTTONS = {
	  A: 0,
	  B: 1,
	  SELECT: 2,
	  START: 3,
	  UP: 4,
	  DOWN: 5,
	  LEFT: 6,
	  RIGHT: 7
	};
	
	var COLORS = exports.COLORS = [0x666666, 0x002a88, 0x1412a7, 0x3b00a4, 0x5c007e, 0x6e0040, 0x6c0600, 0x561d00, 0x333500, 0x0b4800, 0x005200, 0x004f08, 0x00404d, 0x000000, 0x000000, 0x000000, 0xadadad, 0x155fd9, 0x4240ff, 0x7527fe, 0xa01acc, 0xb71e7b, 0xb53120, 0x994e00, 0x6b6d00, 0x388700, 0x0c9300, 0x008f32, 0x007c8d, 0x000000, 0x000000, 0x000000, 0xfffeff, 0x64b0ff, 0x9290ff, 0xc676ff, 0xf36aff, 0xfe6ecc, 0xfe8170, 0xea9e22, 0xbcbe00, 0x88d800, 0x5ce430, 0x45e082, 0x48cdde, 0x4f4f4f, 0x000000, 0x000000, 0xfffeff, 0xc0dfff, 0xd3d2ff, 0xe8c8ff, 0xfbc2ff, 0xfec4ea, 0xfeccc5, 0xf7d8a5, 0xe4e594, 0xcfef96, 0xbdf4ab, 0xb3f3cc, 0xb5ebf2, 0xb8b8b8, 0x000000, 0x000000];
	
	var CYCLES = exports.CYCLES = {
	  ZERO: 0,
	  ONE: 1,
	  PREFETCH: 2,
	  VISIBLE: 3,
	  SPRITES: 4,
	  COPY_Y: 5,
	  COPY_X: 6,
	  INCREMENT_Y: 7,
	  IDLE: 8,
	  FLUSH_TILEDATA: 9,
	  MAPPER_TICK: 10
	};
	
	var SCANLINES = exports.SCANLINES = {
	  PRELINE: 0,
	  VISIBLE: 1,
	  VBLANK: 2,
	  IDLE: 3
	};

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.instructions = undefined;
	
	var _constants = __webpack_require__(4);
	
	// TODO: Non official instructions
	var instructions = exports.instructions = {
	  0: [_constants.OPCODES.BRK, _constants.MODES.IMPLIED, 1, 7],
	  1: [_constants.OPCODES.ORA, _constants.MODES.INDEXED_INDIRECT_X, 2, 6],
	  // 2: [ OPCODES.KIL, MODES.IMPLIED, 0, 2 ],
	  3: [_constants.OPCODES.SLO, _constants.MODES.INDEXED_INDIRECT_X, 0, 8],
	  // 4: [ OPCODES.NOP, MODES.ZERO_PAGE, 2, 3 ],
	
	  5: [_constants.OPCODES.ORA, _constants.MODES.ZERO_PAGE, 2, 3],
	  6: [_constants.OPCODES.ASL, _constants.MODES.ZERO_PAGE, 2, 5],
	  7: [_constants.OPCODES.SLO, _constants.MODES.ZERO_PAGE, 0, 5],
	  8: [_constants.OPCODES.PHP, _constants.MODES.IMPLIED, 1, 3],
	  9: [_constants.OPCODES.ORA, _constants.MODES.IMMEDIATE, 2, 2],
	  10: [_constants.OPCODES.ASL_ACC, _constants.MODES.ACCUMULATOR, 1, 2],
	  // 11: [ OPCODES.ANC, MODES.IMMEDIATE, 0, 2 ],
	  // 12: [ OPCODES.NOP, MODES.ABSOLUTE, 3, 4 ],
	
	  13: [_constants.OPCODES.ORA, _constants.MODES.ABSOLUTE, 3, 4],
	  14: [_constants.OPCODES.ASL, _constants.MODES.ABSOLUTE, 3, 6],
	  15: [_constants.OPCODES.SLO, _constants.MODES.ABSOLUTE, 0, 6],
	  16: [_constants.OPCODES.BPL, _constants.MODES.RELATIVE, 2, 2],
	  17: [_constants.OPCODES.ORA, _constants.MODES.INDIRECT_INDEXED_Y, 2, 5],
	  // 18: [ OPCODES.KIL, MODES.IMPLIED, 0, 2 ],
	  19: [_constants.OPCODES.SLO, _constants.MODES.INDIRECT_INDEXED_Y, 0, 8],
	  // 20: [ OPCODES.NOP, MODES.ZERO_PAGE_X, 2, 4 ],
	
	  21: [_constants.OPCODES.ORA, _constants.MODES.ZERO_PAGE_X, 2, 4],
	  22: [_constants.OPCODES.ASL, _constants.MODES.ZERO_PAGE_X, 2, 6],
	  23: [_constants.OPCODES.SLO, _constants.MODES.ZERO_PAGE_X, 0, 6],
	  24: [_constants.OPCODES.CLC, _constants.MODES.IMPLIED, 1, 2],
	  25: [_constants.OPCODES.ORA, _constants.MODES.ABSOLUTE_Y, 3, 4],
	  // 26: [ OPCODES.NOP, MODES.IMPLIED, 1, 2 ],
	
	  27: [_constants.OPCODES.SLO, _constants.MODES.ABSOLUTE_Y, 0, 7],
	  // 28: [ OPCODES.NOP, MODES.ABSOLUTE_X, 3, 4 ],
	
	  29: [_constants.OPCODES.ORA, _constants.MODES.ABSOLUTE_X, 3, 4],
	  30: [_constants.OPCODES.ASL, _constants.MODES.ABSOLUTE_X, 3, 7],
	  31: [_constants.OPCODES.SLO, _constants.MODES.ABSOLUTE_X, 0, 7],
	  32: [_constants.OPCODES.JSR, _constants.MODES.ABSOLUTE, 3, 6],
	  33: [_constants.OPCODES.AND, _constants.MODES.INDEXED_INDIRECT_X, 2, 6],
	  // 34: [ OPCODES.KIL, MODES.IMPLIED, 0, 2 ],
	  // 35: [ OPCODES.RLA, MODES.INDEXED_INDIRECT_X, 0, 8 ],
	  36: [_constants.OPCODES.BIT, _constants.MODES.ZERO_PAGE, 2, 3],
	  37: [_constants.OPCODES.AND, _constants.MODES.ZERO_PAGE, 2, 3],
	  38: [_constants.OPCODES.ROL, _constants.MODES.ZERO_PAGE, 2, 5],
	  // 39: [ OPCODES.RLA, MODES.ZERO_PAGE, 0, 5 ],
	  40: [_constants.OPCODES.PLP, _constants.MODES.IMPLIED, 1, 4],
	  41: [_constants.OPCODES.AND, _constants.MODES.IMMEDIATE, 2, 2],
	  42: [_constants.OPCODES.ROL_ACC, _constants.MODES.ACCUMULATOR, 1, 2],
	  // 43: [ OPCODES.ANC, MODES.IMMEDIATE, 0, 2 ],
	  44: [_constants.OPCODES.BIT, _constants.MODES.ABSOLUTE, 3, 4],
	  45: [_constants.OPCODES.AND, _constants.MODES.ABSOLUTE, 3, 4],
	  46: [_constants.OPCODES.ROL, _constants.MODES.ABSOLUTE, 3, 6],
	  // 47: [ OPCODES.RLA, MODES.ABSOLUTE, 0, 6 ],
	  48: [_constants.OPCODES.BMI, _constants.MODES.RELATIVE, 2, 2],
	  49: [_constants.OPCODES.AND, _constants.MODES.INDIRECT_INDEXED_Y, 2, 5],
	  // 50: [ OPCODES.KIL, MODES.IMPLIED, 0, 2 ],
	  // 51: [ OPCODES.RLA, MODES.INDIRECT_INDEXED_Y, 0, 8 ],
	  // 52: [ OPCODES.NOP, MODES.ZERO_PAGE_X, 2, 4 ],
	
	  53: [_constants.OPCODES.AND, _constants.MODES.ZERO_PAGE_X, 2, 4],
	  54: [_constants.OPCODES.ROL, _constants.MODES.ZERO_PAGE_X, 2, 6],
	  // 55: [ OPCODES.RLA, MODES.ZERO_PAGE_X, 0, 6 ],
	  56: [_constants.OPCODES.SEC, _constants.MODES.IMPLIED, 1, 2],
	  57: [_constants.OPCODES.AND, _constants.MODES.ABSOLUTE_Y, 3, 4],
	  // 58: [ OPCODES.NOP, MODES.IMPLIED, 1, 2 ],
	
	  // 59: [ OPCODES.RLA, MODES.ABSOLUTE_Y, 0, 7 ],
	  // 60: [ OPCODES.NOP, MODES.ABSOLUTE_X, 3, 4 ],
	
	  61: [_constants.OPCODES.AND, _constants.MODES.ABSOLUTE_X, 3, 4],
	  62: [_constants.OPCODES.ROL, _constants.MODES.ABSOLUTE_X, 3, 7],
	  // 63: [ OPCODES.RLA, MODES.ABSOLUTE_X, 0, 7 ],
	  64: [_constants.OPCODES.RTI, _constants.MODES.IMPLIED, 1, 6],
	  65: [_constants.OPCODES.EOR, _constants.MODES.INDEXED_INDIRECT_X, 2, 6],
	  // 66: [ OPCODES.KIL, MODES.IMPLIED, 0, 2 ],
	  // 67: [ OPCODES.SRE, MODES.INDEXED_INDIRECT_X, 0, 8 ],
	  // 68: [ OPCODES.NOP, MODES.ZERO_PAGE, 2, 3 ],
	
	  69: [_constants.OPCODES.EOR, _constants.MODES.ZERO_PAGE, 2, 3],
	  70: [_constants.OPCODES.LSR, _constants.MODES.ZERO_PAGE, 2, 5],
	  // 71: [ OPCODES.SRE, MODES.ZERO_PAGE, 0, 5 ],
	  72: [_constants.OPCODES.PHA, _constants.MODES.IMPLIED, 1, 3],
	  73: [_constants.OPCODES.EOR, _constants.MODES.IMMEDIATE, 2, 2],
	  74: [_constants.OPCODES.LSR_ACC, _constants.MODES.ACCUMULATOR, 1, 2],
	  // 75: [ OPCODES.ALR, MODES.IMMEDIATE, 0, 2 ],
	  76: [_constants.OPCODES.JMP, _constants.MODES.ABSOLUTE, 3, 3],
	  77: [_constants.OPCODES.EOR, _constants.MODES.ABSOLUTE, 3, 4],
	  78: [_constants.OPCODES.LSR, _constants.MODES.ABSOLUTE, 3, 6],
	  // 79: [ OPCODES.SRE, MODES.ABSOLUTE, 0, 6 ],
	  80: [_constants.OPCODES.BVC, _constants.MODES.RELATIVE, 2, 2],
	  81: [_constants.OPCODES.EOR, _constants.MODES.INDIRECT_INDEXED_Y, 2, 5],
	  // 82: [ OPCODES.KIL, MODES.IMPLIED, 0, 2 ],
	  // 83: [ OPCODES.SRE, MODES.INDIRECT_INDEXED_Y, 0, 8 ],
	  // 84: [ OPCODES.NOP, MODES.ZERO_PAGE_X, 2, 4 ],
	
	  85: [_constants.OPCODES.EOR, _constants.MODES.ZERO_PAGE_X, 2, 4],
	  86: [_constants.OPCODES.LSR, _constants.MODES.ZERO_PAGE_X, 2, 6],
	  // 87: [ OPCODES.SRE, MODES.ZERO_PAGE_X, 0, 6 ],
	  88: [_constants.OPCODES.CLI, _constants.MODES.IMPLIED, 1, 2],
	  89: [_constants.OPCODES.EOR, _constants.MODES.ABSOLUTE_Y, 3, 4],
	  // 90: [ OPCODES.NOP, MODES.IMPLIED, 1, 2 ],
	
	  // 91: [ OPCODES.SRE, MODES.ABSOLUTE_Y, 0, 7 ],
	  // 92: [ OPCODES.NOP, MODES.ABSOLUTE_X, 3, 4 ],
	
	  93: [_constants.OPCODES.EOR, _constants.MODES.ABSOLUTE_X, 3, 4],
	  94: [_constants.OPCODES.LSR, _constants.MODES.ABSOLUTE_X, 3, 7],
	  // 95: [ OPCODES.SRE, MODES.ABSOLUTE_X, 0, 7 ],
	  96: [_constants.OPCODES.RTS, _constants.MODES.IMPLIED, 1, 6],
	  97: [_constants.OPCODES.ADC, _constants.MODES.INDEXED_INDIRECT_X, 2, 6],
	  // 98: [ OPCODES.KIL, MODES.IMPLIED, 0, 2 ],
	  // 99: [ OPCODES.RRA, MODES.INDEXED_INDIRECT_X, 0, 8 ],
	  // 100: [ OPCODES.NOP, MODES.ZERO_PAGE, 2, 3 ],
	
	  101: [_constants.OPCODES.ADC, _constants.MODES.ZERO_PAGE, 2, 3],
	  102: [_constants.OPCODES.ROR, _constants.MODES.ZERO_PAGE, 2, 5],
	  // 103: [ OPCODES.RRA, MODES.ZERO_PAGE, 0, 5 ],
	  104: [_constants.OPCODES.PLA, _constants.MODES.IMPLIED, 1, 4],
	  105: [_constants.OPCODES.ADC, _constants.MODES.IMMEDIATE, 2, 2],
	  106: [_constants.OPCODES.ROR_ACC, _constants.MODES.ACCUMULATOR, 1, 2],
	  // 107: [ OPCODES.ARR, MODES.IMMEDIATE, 0, 2 ],
	  108: [_constants.OPCODES.JMP, _constants.MODES.INDIRECT, 3, 5],
	  109: [_constants.OPCODES.ADC, _constants.MODES.ABSOLUTE, 3, 4],
	  110: [_constants.OPCODES.ROR, _constants.MODES.ABSOLUTE, 3, 6],
	  // 111: [ OPCODES.RRA, MODES.ABSOLUTE, 0, 6 ],
	  112: [_constants.OPCODES.BVS, _constants.MODES.RELATIVE, 2, 2],
	  113: [_constants.OPCODES.ADC, _constants.MODES.INDIRECT_INDEXED_Y, 2, 5],
	  // 114: [ OPCODES.KIL, MODES.IMPLIED, 0, 2 ],
	  // 115: [ OPCODES.RRA, MODES.INDIRECT_INDEXED_Y, 0, 8 ],
	  // 116: [ OPCODES.NOP, MODES.ZERO_PAGE_X, 2, 4 ],
	
	  117: [_constants.OPCODES.ADC, _constants.MODES.ZERO_PAGE_X, 2, 4],
	  118: [_constants.OPCODES.ROR, _constants.MODES.ZERO_PAGE_X, 2, 6],
	  // 119: [ OPCODES.RRA, MODES.ZERO_PAGE_X, 0, 6 ],
	  120: [_constants.OPCODES.SEI, _constants.MODES.IMPLIED, 1, 2],
	  121: [_constants.OPCODES.ADC, _constants.MODES.ABSOLUTE_Y, 3, 4],
	  // 122: [ OPCODES.NOP, MODES.IMPLIED, 1, 2 ],
	
	  // 123: [ OPCODES.RRA, MODES.ABSOLUTE_Y, 0, 7 ],
	  // 124: [ OPCODES.NOP, MODES.ABSOLUTE_X, 3, 4 ],
	
	  125: [_constants.OPCODES.ADC, _constants.MODES.ABSOLUTE_X, 3, 4],
	  126: [_constants.OPCODES.ROR, _constants.MODES.ABSOLUTE_X, 3, 7],
	  // 127: [ OPCODES.RRA, MODES.ABSOLUTE_X, 0, 7 ],
	  // 128: [ OPCODES.NOP, MODES.IMMEDIATE, 2, 2 ],
	
	  129: [_constants.OPCODES.STA, _constants.MODES.INDEXED_INDIRECT_X, 2, 6],
	  // 130: [ OPCODES.NOP, MODES.IMMEDIATE, 0, 2 ],
	
	  // 131: [ OPCODES.SAX, MODES.INDEXED_INDIRECT_X, 0, 6 ],
	  132: [_constants.OPCODES.STY, _constants.MODES.ZERO_PAGE, 2, 3],
	  133: [_constants.OPCODES.STA, _constants.MODES.ZERO_PAGE, 2, 3],
	  134: [_constants.OPCODES.STX, _constants.MODES.ZERO_PAGE, 2, 3],
	  // 135: [ OPCODES.SAX, MODES.ZERO_PAGE, 0, 3 ],
	  136: [_constants.OPCODES.DEY, _constants.MODES.IMPLIED, 1, 2],
	  // 137: [ OPCODES.NOP, MODES.IMMEDIATE, 0, 2 ],
	
	  138: [_constants.OPCODES.TXA, _constants.MODES.IMPLIED, 1, 2],
	  // 139: [ OPCODES.XAA, MODES.IMMEDIATE, 0, 2 ],
	  140: [_constants.OPCODES.STY, _constants.MODES.ABSOLUTE, 3, 4],
	  141: [_constants.OPCODES.STA, _constants.MODES.ABSOLUTE, 3, 4],
	  142: [_constants.OPCODES.STX, _constants.MODES.ABSOLUTE, 3, 4],
	  // 143: [ OPCODES.SAX, MODES.ABSOLUTE, 0, 4 ],
	  144: [_constants.OPCODES.BCC, _constants.MODES.RELATIVE, 2, 2],
	  145: [_constants.OPCODES.STA, _constants.MODES.INDIRECT_INDEXED_Y, 2, 6],
	  // 146: [ OPCODES.KIL, MODES.IMPLIED, 0, 2 ],
	  // 147: [ OPCODES.AHX, MODES.INDIRECT_INDEXED_Y, 0, 6 ],
	  148: [_constants.OPCODES.STY, _constants.MODES.ZERO_PAGE_X, 2, 4],
	  149: [_constants.OPCODES.STA, _constants.MODES.ZERO_PAGE_X, 2, 4],
	  150: [_constants.OPCODES.STX, _constants.MODES.ZERO_PAGE_Y, 2, 4],
	  // 151: [ OPCODES.SAX, MODES.ZERO_PAGE_Y, 0, 4 ],
	  152: [_constants.OPCODES.TYA, _constants.MODES.IMPLIED, 1, 2],
	  153: [_constants.OPCODES.STA, _constants.MODES.ABSOLUTE_Y, 3, 5],
	  154: [_constants.OPCODES.TXS, _constants.MODES.IMPLIED, 1, 2],
	  // 155: [ OPCODES.TAS, MODES.ABSOLUTE_Y, 0, 5 ],
	  // 156: [ OPCODES.SHY, MODES.ABSOLUTE_X, 0, 5 ],
	  157: [_constants.OPCODES.STA, _constants.MODES.ABSOLUTE_X, 3, 5],
	  // 158: [ OPCODES.SHX, MODES.ABSOLUTE_Y, 0, 5 ],
	  // 159: [ OPCODES.AHX, MODES.ABSOLUTE_Y, 0, 5 ],
	  160: [_constants.OPCODES.LDY, _constants.MODES.IMMEDIATE, 2, 2],
	  161: [_constants.OPCODES.LDA, _constants.MODES.INDEXED_INDIRECT_X, 2, 6],
	  162: [_constants.OPCODES.LDX, _constants.MODES.IMMEDIATE, 2, 2],
	  // 163: [ OPCODES.LAX, MODES.INDEXED_INDIRECT_X, 0, 6 ],
	  164: [_constants.OPCODES.LDY, _constants.MODES.ZERO_PAGE, 2, 3],
	  165: [_constants.OPCODES.LDA, _constants.MODES.ZERO_PAGE, 2, 3],
	  166: [_constants.OPCODES.LDX, _constants.MODES.ZERO_PAGE, 2, 3],
	  // 167: [ OPCODES.LAX, MODES.ZERO_PAGE, 0, 3 ],
	  168: [_constants.OPCODES.TAY, _constants.MODES.IMPLIED, 1, 2],
	  169: [_constants.OPCODES.LDA, _constants.MODES.IMMEDIATE, 2, 2],
	  170: [_constants.OPCODES.TAX, _constants.MODES.IMPLIED, 1, 2],
	  // 171: [ OPCODES.LAX, MODES.IMMEDIATE, 0, 2 ],
	  172: [_constants.OPCODES.LDY, _constants.MODES.ABSOLUTE, 3, 4],
	  173: [_constants.OPCODES.LDA, _constants.MODES.ABSOLUTE, 3, 4],
	  174: [_constants.OPCODES.LDX, _constants.MODES.ABSOLUTE, 3, 4],
	  // 175: [ OPCODES.LAX, MODES.ABSOLUTE, 0, 4 ],
	  176: [_constants.OPCODES.BCS, _constants.MODES.RELATIVE, 2, 2],
	  177: [_constants.OPCODES.LDA, _constants.MODES.INDIRECT_INDEXED_Y, 2, 5],
	  // 178: [ OPCODES.KIL, MODES.IMPLIED, 0, 2 ],
	  // 179: [ OPCODES.LAX, MODES.INDIRECT_INDEXED_Y, 0, 5 ],
	  180: [_constants.OPCODES.LDY, _constants.MODES.ZERO_PAGE_X, 2, 4],
	  181: [_constants.OPCODES.LDA, _constants.MODES.ZERO_PAGE_X, 2, 4],
	  182: [_constants.OPCODES.LDX, _constants.MODES.ZERO_PAGE_Y, 2, 4],
	  // 183: [ OPCODES.LAX, MODES.ZERO_PAGE_Y, 0, 4 ],
	  184: [_constants.OPCODES.CLV, _constants.MODES.IMPLIED, 1, 2],
	  185: [_constants.OPCODES.LDA, _constants.MODES.ABSOLUTE_Y, 3, 4],
	  186: [_constants.OPCODES.TSX, _constants.MODES.IMPLIED, 1, 2],
	  // 187: [ OPCODES.LAS, MODES.ABSOLUTE_Y, 0, 4 ],
	  188: [_constants.OPCODES.LDY, _constants.MODES.ABSOLUTE_X, 3, 4],
	  189: [_constants.OPCODES.LDA, _constants.MODES.ABSOLUTE_X, 3, 4],
	  190: [_constants.OPCODES.LDX, _constants.MODES.ABSOLUTE_Y, 3, 4],
	  // 191: [ OPCODES.LAX, MODES.ABSOLUTE_Y, 0, 4 ],
	  192: [_constants.OPCODES.CPY, _constants.MODES.IMMEDIATE, 2, 2],
	  193: [_constants.OPCODES.CMP, _constants.MODES.INDEXED_INDIRECT_X, 2, 6],
	  // 194: [ OPCODES.NOP, MODES.IMMEDIATE, 0, 2 ],
	
	  // 195: [ OPCODES.DCP, MODES.INDEXED_INDIRECT_X, 0, 8 ],
	  196: [_constants.OPCODES.CPY, _constants.MODES.ZERO_PAGE, 2, 3],
	  197: [_constants.OPCODES.CMP, _constants.MODES.ZERO_PAGE, 2, 3],
	  198: [_constants.OPCODES.DEC, _constants.MODES.ZERO_PAGE, 2, 5],
	  199: [_constants.OPCODES.DCP, _constants.MODES.ZERO_PAGE, 0, 5],
	  200: [_constants.OPCODES.INY, _constants.MODES.IMPLIED, 1, 2],
	  201: [_constants.OPCODES.CMP, _constants.MODES.IMMEDIATE, 2, 2],
	  202: [_constants.OPCODES.DEX, _constants.MODES.IMPLIED, 1, 2],
	  // 203: [ OPCODES.AXS, MODES.IMMEDIATE, 0, 2 ],
	  204: [_constants.OPCODES.CPY, _constants.MODES.ABSOLUTE, 3, 4],
	  205: [_constants.OPCODES.CMP, _constants.MODES.ABSOLUTE, 3, 4],
	  206: [_constants.OPCODES.DEC, _constants.MODES.ABSOLUTE, 3, 6],
	  // 207: [ OPCODES.DCP, MODES.ABSOLUTE, 0, 6 ],
	  208: [_constants.OPCODES.BNE, _constants.MODES.RELATIVE, 2, 2],
	  209: [_constants.OPCODES.CMP, _constants.MODES.INDIRECT_INDEXED_Y, 2, 5],
	  // 210: [ OPCODES.KIL, MODES.IMPLIED, 0, 2 ],
	  // 211: [ OPCODES.DCP, MODES.INDIRECT_INDEXED_Y, 0, 8 ],
	  // 212: [ OPCODES.NOP, MODES.ZERO_PAGE_X, 2, 4 ],
	
	  213: [_constants.OPCODES.CMP, _constants.MODES.ZERO_PAGE_X, 2, 4],
	  214: [_constants.OPCODES.DEC, _constants.MODES.ZERO_PAGE_X, 2, 6],
	  // 215: [ OPCODES.DCP, MODES.ZERO_PAGE_X, 0, 6 ],
	  216: [_constants.OPCODES.CLD, _constants.MODES.IMPLIED, 1, 2],
	  217: [_constants.OPCODES.CMP, _constants.MODES.ABSOLUTE_Y, 3, 4],
	  // 218: [ OPCODES.NOP, MODES.IMPLIED, 1, 2 ],
	
	  // 219: [ OPCODES.DCP, MODES.ABSOLUTE_Y, 0, 7 ],
	  // 220: [ OPCODES.NOP, MODES.ABSOLUTE_X, 3, 4 ],
	
	  221: [_constants.OPCODES.CMP, _constants.MODES.ABSOLUTE_X, 3, 4],
	  222: [_constants.OPCODES.DEC, _constants.MODES.ABSOLUTE_X, 3, 7],
	  // 223: [ OPCODES.DCP, MODES.ABSOLUTE_X, 0, 7 ],
	  224: [_constants.OPCODES.CPX, _constants.MODES.IMMEDIATE, 2, 2],
	  225: [_constants.OPCODES.SBC, _constants.MODES.INDEXED_INDIRECT_X, 2, 6],
	  // 226: [ OPCODES.NOP, MODES.IMMEDIATE, 0, 2 ],
	
	  // 227: [ OPCODES.ISC, MODES.INDEXED_INDIRECT_X, 0, 8 ],
	  228: [_constants.OPCODES.CPX, _constants.MODES.ZERO_PAGE, 2, 3],
	  229: [_constants.OPCODES.SBC, _constants.MODES.ZERO_PAGE, 2, 3],
	  230: [_constants.OPCODES.INC, _constants.MODES.ZERO_PAGE, 2, 5],
	  // 231: [ OPCODES.ISC, MODES.ZERO_PAGE, 0, 5 ],
	  232: [_constants.OPCODES.INX, _constants.MODES.IMPLIED, 1, 2],
	  233: [_constants.OPCODES.SBC, _constants.MODES.IMMEDIATE, 2, 2],
	  234: [_constants.OPCODES.NOP, _constants.MODES.IMPLIED, 1, 2],
	
	  235: [_constants.OPCODES.SBC, _constants.MODES.IMMEDIATE, 2, 2],
	  236: [_constants.OPCODES.CPX, _constants.MODES.ABSOLUTE, 3, 4],
	  237: [_constants.OPCODES.SBC, _constants.MODES.ABSOLUTE, 3, 4],
	  238: [_constants.OPCODES.INC, _constants.MODES.ABSOLUTE, 3, 6],
	  239: [_constants.OPCODES.ISC, _constants.MODES.ABSOLUTE, 0, 6],
	  240: [_constants.OPCODES.BEQ, _constants.MODES.RELATIVE, 2, 2],
	  241: [_constants.OPCODES.SBC, _constants.MODES.INDIRECT_INDEXED_Y, 2, 5],
	  // 242: [ OPCODES.KIL, MODES.IMPLIED, 0, 2 ],
	  // 243: [ OPCODES.ISC, MODES.INDIRECT_INDEXED_Y, 0, 8 ],
	  // 244: [ OPCODES.NOP, MODES.ZERO_PAGE_X, 2, 4 ],
	
	  245: [_constants.OPCODES.SBC, _constants.MODES.ZERO_PAGE_X, 2, 4],
	  246: [_constants.OPCODES.INC, _constants.MODES.ZERO_PAGE_X, 2, 6],
	  247: [_constants.OPCODES.ISC, _constants.MODES.ZERO_PAGE_X, 0, 6],
	  248: [_constants.OPCODES.SED, _constants.MODES.IMPLIED, 1, 2],
	  249: [_constants.OPCODES.SBC, _constants.MODES.ABSOLUTE_Y, 3, 4],
	  // 250: [ OPCODES.NOP, MODES.IMPLIED, 1, 2 ],
	
	  // 251: [ OPCODES.ISC, MODES.ABSOLUTE_Y, 0, 7 ],
	  // 252: [ OPCODES.NOP, MODES.ABSOLUTE_X, 3, 4 ],
	
	  253: [_constants.OPCODES.SBC, _constants.MODES.ABSOLUTE_X, 3, 4],
	  254: [_constants.OPCODES.INC, _constants.MODES.ABSOLUTE_X, 3, 7]
	  // 255: [ OPCODES.ISC, MODES.ABSOLUTE_X, 0, 7 ]
	};

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.modes = undefined;
	
	var _modes;
	
	var _constants = __webpack_require__(4);
	
	var _utils = __webpack_require__(7);
	
	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	
	/**
	 *   Computes and returns a memory address (max 16bit)
	 *   http://wiki.nesdev.com/w/index.php/CPU_addressing_modes
	 */
	var modes = exports.modes = (_modes = {}, _defineProperty(_modes, _constants.MODES.IMMEDIATE, function (cpu) {
	  return cpu.pc + 1;
	}), _defineProperty(_modes, _constants.MODES.ABSOLUTE, function (cpu) {
	  return cpu.read16(cpu.pc + 1);
	}), _defineProperty(_modes, _constants.MODES.ABSOLUTE_X, function (cpu) {
	  var addr = cpu.read16(cpu.pc + 1) + cpu.x & 0xffff;
	
	  if ((0, _utils.isPageCrossed)(addr - cpu.x, addr)) {
	    cpu.b = 1;
	  }
	
	  return addr;
	}), _defineProperty(_modes, _constants.MODES.ABSOLUTE_Y, function (cpu) {
	  var addr = cpu.read16(cpu.pc + 1) + cpu.y & 0xffff;
	
	  if ((0, _utils.isPageCrossed)(addr - cpu.y, addr)) {
	    cpu.b = 1;
	  }
	
	  return addr;
	}), _defineProperty(_modes, _constants.MODES.ACCUMULATOR, function (cpu) {
	  return cpu.a;
	}), _defineProperty(_modes, _constants.MODES.IMPLIED, function (cpu) {
	  return 0;
	}), _defineProperty(_modes, _constants.MODES.RELATIVE, function (cpu) {
	  var addr = cpu.read8(cpu.pc + 1);
	
	  if (addr < 0x80) {
	    return addr + cpu.pc + 2;
	  } else {
	    return addr + cpu.pc + 2 - 0x100;
	  }
	}), _defineProperty(_modes, _constants.MODES.ZERO_PAGE_Y, function (cpu) {
	  return cpu.read8(cpu.pc + 1) + cpu.y & 0xff;
	}), _defineProperty(_modes, _constants.MODES.ZERO_PAGE_X, function (cpu) {
	  return cpu.read8(cpu.pc + 1) + cpu.x & 0xff;
	}), _defineProperty(_modes, _constants.MODES.ZERO_PAGE, function (cpu) {
	  return cpu.read8(cpu.pc + 1);
	}), _defineProperty(_modes, _constants.MODES.INDEXED_INDIRECT_X, function (cpu) {
	  return cpu.read16indirect(cpu.read8(cpu.pc + 1) + cpu.x & 0xff);
	}), _defineProperty(_modes, _constants.MODES.INDIRECT_INDEXED_Y, function (cpu) {
	  var addr = cpu.read16indirect(cpu.read8(cpu.pc + 1)) + cpu.y & 0xffff;
	
	  if ((0, _utils.isPageCrossed)(addr - cpu.y, addr)) {
	    cpu.b = 1;
	  }
	
	  return addr;
	}), _defineProperty(_modes, _constants.MODES.INDIRECT, function (cpu) {
	  return cpu.read16indirect(cpu.read16(cpu.pc + 1));
	}), _modes);

/***/ }),
/* 7 */
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.isPageCrossed = isPageCrossed;
	function isPageCrossed(addr1, addr2) {
	  // A page is crossed when the high byte differs from addr1 to addr2
	  return addr1 >> 8 !== addr2 >> 8;
	}

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.opcodes = undefined;
	
	var _opcodes;
	
	var _constants = __webpack_require__(4);
	
	var _utils = __webpack_require__(7);
	
	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	
	var opcodes = exports.opcodes = (_opcodes = {}, _defineProperty(_opcodes, _constants.OPCODES.ADC, function (addr, cpu) {
	  var a = cpu.a;
	  var value = cpu.read8(addr);
	  cpu.a = a + value + cpu.c;
	
	  if (cpu.a > 0xff) {
	    cpu.c = 1;
	  } else {
	    cpu.c = 0;
	  }
	
	  // Useless?
	  cpu.a = cpu.a & 0xff;
	
	  if (((a ^ value) & 0x80) === 0 && ((a ^ cpu.a) & 0x80) !== 0) {
	    cpu.v = 1;
	  } else {
	    cpu.v = 0;
	  }
	
	  cpu.setNegativeFlag(cpu.a);
	  cpu.setZeroFlag(cpu.a);
	
	  cpu.cycles += cpu.b;
	}), _defineProperty(_opcodes, _constants.OPCODES.SEI, function (addr, cpu) {
	  cpu.i = 1;
	}), _defineProperty(_opcodes, _constants.OPCODES.CLC, function (addr, cpu) {
	  cpu.c = 0;
	}), _defineProperty(_opcodes, _constants.OPCODES.CLV, function (addr, cpu) {
	  cpu.v = 0;
	}), _defineProperty(_opcodes, _constants.OPCODES.TSX, function (addr, cpu) {
	  cpu.x = cpu.sp;
	  cpu.setNegativeFlag(cpu.x);
	  cpu.setZeroFlag(cpu.x);
	}), _defineProperty(_opcodes, _constants.OPCODES.TAX, function (addr, cpu) {
	  cpu.x = cpu.a;
	  cpu.setNegativeFlag(cpu.x);
	  cpu.setZeroFlag(cpu.x);
	}), _defineProperty(_opcodes, _constants.OPCODES.PLA, function (addr, cpu) {
	  cpu.a = cpu.stackPull8();
	  cpu.setNegativeFlag(cpu.a);
	  cpu.setZeroFlag(cpu.a);
	}), _defineProperty(_opcodes, _constants.OPCODES.DEC, function (addr, cpu) {
	  var value = cpu.read8(addr);
	  value = value - 1 & 0xff;
	
	  cpu.setNegativeFlag(value);
	  cpu.setZeroFlag(value);
	  cpu.write8(addr, value);
	}), _defineProperty(_opcodes, _constants.OPCODES.DEY, function (addr, cpu) {
	  cpu.y = cpu.y - 1 & 0xff;
	  cpu.setNegativeFlag(cpu.y);
	  cpu.setZeroFlag(cpu.y);
	}), _defineProperty(_opcodes, _constants.OPCODES.DEX, function (addr, cpu) {
	  cpu.x = cpu.x - 1 & 0xff;
	  cpu.setZeroFlag(cpu.x);
	  cpu.setNegativeFlag(cpu.x);
	}), _defineProperty(_opcodes, _constants.OPCODES.TXS, function (addr, cpu) {
	  cpu.sp = cpu.x;
	}), _defineProperty(_opcodes, _constants.OPCODES.TXA, function (addr, cpu) {
	  cpu.a = cpu.x;
	  cpu.setZeroFlag(cpu.a);
	  cpu.setNegativeFlag(cpu.a);
	}), _defineProperty(_opcodes, _constants.OPCODES.CLD, function (addr, cpu) {
	  cpu.d = 0;
	}), _defineProperty(_opcodes, _constants.OPCODES.PHP, function (addr, cpu) {
	  cpu.stackPush8(cpu.getFlags() | 0x10);
	}), _defineProperty(_opcodes, _constants.OPCODES.BRK, function (addr, cpu) {
	  cpu.stackPush16(cpu.pc + 1);
	  // PHP
	  cpu.stackPush8(cpu.getFlags() | 0x18);
	  // SEI
	  cpu.i = 1;
	  cpu.pc = cpu.read16(0xfffe);
	}), _defineProperty(_opcodes, _constants.OPCODES.JSR, function (addr, cpu) {
	  cpu.stackPush16(cpu.pc - 1);
	  cpu.pc = addr & 0xffff;
	}), _defineProperty(_opcodes, _constants.OPCODES.BVC, function (addr, cpu) {
	  if (cpu.v === 0) {
	    cpu.cycles += (0, _utils.isPageCrossed)(cpu.pc, addr) ? 2 : 1;
	    cpu.pc = addr & 0xffff;
	  }
	}), _defineProperty(_opcodes, _constants.OPCODES.BVS, function (addr, cpu) {
	  if (cpu.v === 1) {
	    cpu.cycles += (0, _utils.isPageCrossed)(cpu.pc, addr) ? 2 : 1;
	    cpu.pc = addr & 0xffff;
	  }
	}), _defineProperty(_opcodes, _constants.OPCODES.BEQ, function (addr, cpu) {
	  if (cpu.z === 1) {
	    cpu.cycles += (0, _utils.isPageCrossed)(cpu.pc, addr) ? 2 : 1;
	    cpu.pc = addr & 0xffff;
	  }
	}), _defineProperty(_opcodes, _constants.OPCODES.BCS, function (addr, cpu) {
	  if (cpu.c === 1) {
	    cpu.cycles += (0, _utils.isPageCrossed)(cpu.pc, addr) ? 2 : 1;
	    cpu.pc = addr & 0xffff;
	  }
	}), _defineProperty(_opcodes, _constants.OPCODES.BNE, function (addr, cpu) {
	  if (cpu.z === 0) {
	    cpu.cycles += (0, _utils.isPageCrossed)(cpu.pc, addr) ? 2 : 1;
	    cpu.pc = addr & 0xffff;
	  }
	}), _defineProperty(_opcodes, _constants.OPCODES.BCC, function (addr, cpu) {
	  if (cpu.c === 0) {
	    cpu.cycles += (0, _utils.isPageCrossed)(cpu.pc, addr) ? 2 : 1;
	    cpu.pc = addr & 0xffff;
	  }
	}), _defineProperty(_opcodes, _constants.OPCODES.BPL, function (addr, cpu) {
	  if (cpu.n === 0) {
	    cpu.cycles += (0, _utils.isPageCrossed)(cpu.pc, addr) ? 2 : 1;
	    cpu.pc = addr & 0xffff;
	  }
	}), _defineProperty(_opcodes, _constants.OPCODES.BMI, function (addr, cpu) {
	  if (cpu.n === 1) {
	    cpu.cycles += (0, _utils.isPageCrossed)(cpu.pc, addr) ? 2 : 1;
	    cpu.pc = addr & 0xffff;
	  }
	}), _defineProperty(_opcodes, _constants.OPCODES.SED, function (addr, cpu) {
	  cpu.d = 1;
	}), _defineProperty(_opcodes, _constants.OPCODES.SEC, function (addr, cpu) {
	  cpu.c = 1;
	}), _defineProperty(_opcodes, _constants.OPCODES.RTI, function (addr, cpu) {
	  cpu.setFlags(cpu.stackPull8() | 0x20);
	  cpu.pc = cpu.stackPull16();
	}), _defineProperty(_opcodes, _constants.OPCODES.AND, function (addr, cpu) {
	  var value = cpu.read8(addr);
	  cpu.a = cpu.a & value;
	
	  cpu.setNegativeFlag(cpu.a);
	  cpu.setZeroFlag(cpu.a);
	
	  cpu.cycles += cpu.b;
	}), _defineProperty(_opcodes, _constants.OPCODES.TAY, function (addr, cpu) {
	  cpu.y = cpu.a;
	  cpu.setNegativeFlag(cpu.y);
	  cpu.setZeroFlag(cpu.y);
	}), _defineProperty(_opcodes, _constants.OPCODES.LDA, function (addr, cpu) {
	  cpu.a = cpu.read8(addr);
	
	  cpu.setNegativeFlag(cpu.a);
	  cpu.setZeroFlag(cpu.a);
	
	  cpu.cycles += cpu.b;
	}), _defineProperty(_opcodes, _constants.OPCODES.LDY, function (addr, cpu) {
	  cpu.y = cpu.read8(addr);
	  cpu.setNegativeFlag(cpu.y);
	  cpu.setZeroFlag(cpu.y);
	
	  cpu.cycles += cpu.b;
	}), _defineProperty(_opcodes, _constants.OPCODES.LDX, function (addr, cpu) {
	  cpu.x = cpu.read8(addr);
	  cpu.setNegativeFlag(cpu.x);
	  cpu.setZeroFlag(cpu.x);
	
	  cpu.cycles += cpu.b;
	}), _defineProperty(_opcodes, _constants.OPCODES.STX, function (addr, cpu) {
	  cpu.write8(addr, cpu.x);
	}), _defineProperty(_opcodes, _constants.OPCODES.STY, function (addr, cpu) {
	  cpu.write8(addr, cpu.y);
	}), _defineProperty(_opcodes, _constants.OPCODES.STA, function (addr, cpu) {
	  cpu.write8(addr, cpu.a);
	}), _defineProperty(_opcodes, _constants.OPCODES.CMP, function (addr, cpu) {
	  var value = cpu.read8(addr);
	  var tmpA = cpu.a - value;
	
	  if (cpu.a >= value) {
	    cpu.c = 1;
	  } else {
	    cpu.c = 0;
	  }
	
	  cpu.setNegativeFlag(tmpA);
	  cpu.setZeroFlag(tmpA);
	
	  cpu.cycles += cpu.b;
	}), _defineProperty(_opcodes, _constants.OPCODES.CPX, function (addr, cpu) {
	  var value = cpu.read8(addr);
	  var tmpX = cpu.x - value;
	
	  if (cpu.x >= value) {
	    cpu.c = 1;
	  } else {
	    cpu.c = 0;
	  }
	
	  cpu.setNegativeFlag(tmpX);
	  cpu.setZeroFlag(tmpX);
	}), _defineProperty(_opcodes, _constants.OPCODES.CPY, function (addr, cpu) {
	  var value = cpu.read8(addr);
	  var tmpY = cpu.y - value;
	
	  if (cpu.y >= value) {
	    cpu.c = 1;
	  } else {
	    cpu.c = 0;
	  }
	
	  cpu.setNegativeFlag(tmpY);
	  cpu.setZeroFlag(tmpY);
	}), _defineProperty(_opcodes, _constants.OPCODES.ASL_ACC, function (addr, cpu) {
	  cpu.c = cpu.a >> 7 & 1;
	  cpu.a = cpu.a << 1 & 0xff;
	
	  cpu.setZeroFlag(cpu.a);
	  cpu.setNegativeFlag(cpu.a);
	}), _defineProperty(_opcodes, _constants.OPCODES.ASL, function (addr, cpu) {
	  var value = cpu.read8(addr);
	
	  cpu.c = value >> 7 & 1;
	  value = value << 1 & 0xff;
	
	  cpu.setZeroFlag(value);
	  cpu.setNegativeFlag(value);
	  cpu.write8(addr, value);
	}), _defineProperty(_opcodes, _constants.OPCODES.SBC, function (addr, cpu) {
	  var a = cpu.a;
	  var b = cpu.read8(addr);
	  var c = cpu.c;
	
	  cpu.a = cpu.a - b - (1 - cpu.c) & 0xff;
	
	  cpu.setNegativeFlag(cpu.a);
	  cpu.setZeroFlag(cpu.a);
	
	  if (a - b - (1 - c) >= 0) {
	    cpu.c = 1;
	  } else {
	    cpu.c = 0;
	  }
	
	  if (((a ^ b) & 0x80) !== 0 && ((a ^ cpu.a) & 0x80) !== 0) {
	    cpu.v = 1;
	  } else {
	    cpu.v = 0;
	  }
	
	  cpu.cycles += cpu.b;
	}), _defineProperty(_opcodes, _constants.OPCODES.EOR, function (addr, cpu) {
	  var value = cpu.read8(addr);
	  cpu.a = (cpu.a ^ value) & 0xff;
	
	  cpu.setZeroFlag(cpu.a);
	  cpu.setNegativeFlag(cpu.a);
	
	  cpu.cycles += cpu.b;
	}), _defineProperty(_opcodes, _constants.OPCODES.RTS, function (addr, cpu) {
	  cpu.pc = cpu.stackPull16() + 1;
	}), _defineProperty(_opcodes, _constants.OPCODES.INY, function (addr, cpu) {
	  cpu.y = cpu.y + 1 & 0xff;
	  cpu.setNegativeFlag(cpu.y);
	  cpu.setZeroFlag(cpu.y);
	}), _defineProperty(_opcodes, _constants.OPCODES.INX, function (addr, cpu) {
	  cpu.x = cpu.x + 1 & 0xff;
	  cpu.setNegativeFlag(cpu.x);
	  cpu.setZeroFlag(cpu.x);
	}), _defineProperty(_opcodes, _constants.OPCODES.INC, function (addr, cpu) {
	  var value = cpu.read8(addr) + 1 & 0xff;
	
	  cpu.setNegativeFlag(value);
	  cpu.setZeroFlag(value);
	
	  cpu.write8(addr, value);
	}), _defineProperty(_opcodes, _constants.OPCODES.PHA, function (addr, cpu) {
	  cpu.stackPush8(cpu.a);
	}), _defineProperty(_opcodes, _constants.OPCODES.PLP, function (addr, cpu) {
	  cpu.setFlags(cpu.stackPull8() & 0xef | 0x20);
	}), _defineProperty(_opcodes, _constants.OPCODES.ORA, function (addr, cpu) {
	  cpu.a = cpu.a | cpu.read8(addr);
	  cpu.setNegativeFlag(cpu.a);
	  cpu.setZeroFlag(cpu.a);
	
	  cpu.cycles += cpu.b;
	}), _defineProperty(_opcodes, _constants.OPCODES.LSR_ACC, function (addr, cpu) {
	  cpu.c = cpu.a & 1;
	  cpu.a = cpu.a >> 1;
	
	  cpu.setNegativeFlag(cpu.a);
	  cpu.setZeroFlag(cpu.a);
	}), _defineProperty(_opcodes, _constants.OPCODES.LSR, function (addr, cpu) {
	  var value = cpu.read8(addr);
	
	  cpu.c = value & 1;
	  value = value >> 1;
	
	  cpu.write8(addr, value);
	  cpu.setNegativeFlag(value);
	  cpu.setZeroFlag(value);
	}), _defineProperty(_opcodes, _constants.OPCODES.TYA, function (addr, cpu) {
	  cpu.a = cpu.y;
	  cpu.setNegativeFlag(cpu.a);
	  cpu.setZeroFlag(cpu.a);
	}), _defineProperty(_opcodes, _constants.OPCODES.ROL_ACC, function (addr, cpu) {
	  var tmpC = cpu.c;
	
	  cpu.c = cpu.a >> 7 & 1;
	  cpu.a = cpu.a << 1 & 0xff | tmpC;
	  cpu.setNegativeFlag(cpu.a);
	  cpu.setZeroFlag(cpu.a);
	}), _defineProperty(_opcodes, _constants.OPCODES.ROL, function (addr, cpu) {
	  var tmpC = cpu.c;
	  var value = cpu.read8(addr);
	
	  cpu.c = value >> 7 & 1;
	  value = value << 1 & 0xff | tmpC;
	
	  cpu.write8(addr, value);
	  cpu.setNegativeFlag(value);
	  cpu.setZeroFlag(value);
	}), _defineProperty(_opcodes, _constants.OPCODES.ROR_ACC, function (addr, cpu) {
	  var tmpC = cpu.c;
	
	  cpu.c = cpu.a & 1;
	  cpu.a = (cpu.a >> 1) + (tmpC << 7);
	  cpu.setNegativeFlag(cpu.a);
	  cpu.setZeroFlag(cpu.a);
	}), _defineProperty(_opcodes, _constants.OPCODES.ROR, function (addr, cpu) {
	  var tmpC = cpu.c;
	  var value = cpu.read8(addr);
	
	  cpu.c = value & 1;
	  value = (value >> 1) + (tmpC << 7);
	
	  cpu.write8(addr, value);
	  cpu.setNegativeFlag(value);
	  cpu.setZeroFlag(value);
	}), _defineProperty(_opcodes, _constants.OPCODES.BIT, function (addr, cpu) {
	  var value = cpu.read8(addr);
	  cpu.v = value >> 6 & 1;
	  cpu.setZeroFlag(value & cpu.a);
	  cpu.setNegativeFlag(value);
	}), _defineProperty(_opcodes, _constants.OPCODES.JMP, function (addr, cpu) {
	  cpu.pc = addr & 0xffff;
	}), _defineProperty(_opcodes, _constants.OPCODES.CLI, function (addr, cpu) {
	  cpu.i = 0;
	}), _defineProperty(_opcodes, _constants.OPCODES.NOP, function (addr, cpu) {}), _defineProperty(_opcodes, _constants.OPCODES.ISC, function (addr, cpu) {}), _opcodes);

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _PPUMemory = __webpack_require__(10);
	
	var _PPUMemory2 = _interopRequireDefault(_PPUMemory);
	
	var _constants = __webpack_require__(4);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/**
	 * Picture Processing Unit.
	 * Handles graphics.
	 */
	var PPU = function () {
	  function PPU() {
	    _classCallCheck(this, PPU);
	
	    this.memory = new _PPUMemory2.default();
	    this.cycle = 0;
	    this.cycleType = null;
	    this.scanline = 261;
	    this.scanlineType = null;
	    this.interrupt = null;
	
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
	
	    // Background & Sprites temporary variables
	    this.backgroundTileBuffer = [];
	    this.lowTileByte = 0;
	    this.highTileByte = 0;
	    this.attributeTableByte = 0;
	    this.spriteCount = 0;
	    this.sprites = new Array(8);
	
	    for (var i = 0; i < 8; i++) {
	      this.sprites[i] = {
	        buffer: [],
	        x: null,
	        priority: null,
	        index: null
	      };
	    }
	
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
	
	    // Pixel rendering variables
	    this.backgroundColor = 0;
	    this.spriteColor = 0;
	    this.spriteIndex = 0;
	    this.isBackgroundPixel = true;
	    this.backgroundPixel = 0;
	    this.spritePixel = 0;
	    this.color = 0;
	
	    // Buffered data
	    this.setRenderingMode(_constants.RENDERING_MODES.NORMAL);
	    this.resetBuffers();
	
	    this.frameReady = false;
	
	    //
	    // Debug data & variables
	    //
	    this.patternTable1 = new Uint8Array(160 * 160 * 4).fill(0xff);
	    this.patternTable2 = new Uint8Array(160 * 160 * 4).fill(0xff); // 124 x 124 + 2px spacing
	    this.oamTable = new Uint8Array(80 * 160 * 4); // 64 x 124 + 2 px spacing
	
	    this.patternTablesColors = [[0xff, 0xff, 0xff], [0x33, 0x33, 0x33], [0xbf, 0xbf, 0xbf], [0x00, 0x00, 0x00]];
	  }
	
	  /**
	   * Utils methods
	   */
	
	  _createClass(PPU, [{
	    key: "connectROM",
	    value: function connectROM(rom) {
	      this.memory.mapper = rom.mapper;
	    }
	  }, {
	    key: "resetBuffers",
	    value: function resetBuffers() {
	      this.frameBuffer = new Uint8Array(256 * 240 * 4).fill(0x00);
	      this.frameBackgroundBuffer = new Uint8Array(256 * 240 * 4).fill(0x00);
	      this.frameSpriteBuffer = new Uint8Array(256 * 240 * 4).fill(0x00);
	      this.frameColorBuffer = new Uint32Array(256 * 240).fill(0x00);
	    }
	
	    /**
	     *  Used for debugging
	     */
	
	  }, {
	    key: "_parsePatternTable",
	    value: function _parsePatternTable(_from, to, patternTable) {
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
	          value = ((lowTileData >> z & 1) << 1) + (highTileData >> z & 1);
	          v = i % 8 * 160; // Tmp vertical position
	          v += y * 160; // Permanent vertical position;
	          v += 7 - z; // Tmp horizontal position
	          v += s % 16 * 10; // Permanent horizontal position
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
	
	        if (i % 8 === 0) {
	          i += 8;
	          s++;
	        }
	      }
	      return patternTable;
	    }
	  }, {
	    key: "getPatternTables",
	    value: function getPatternTables() {
	      return [this._parsePatternTable(0, 4096, this.patternTable1), this._parsePatternTable(4096, 8192, this.patternTable2)];
	    }
	  }, {
	    key: "getOamTable",
	    value: function getOamTable() {
	      var tile, table, spriteSize, attributes, address, lowTileData, highTileData, tileShiftX, tileShiftY, tableY, value, v, isReversedVertically, isReversedHorizontally;
	
	      tableY = 0;
	
	      // Not all sprites slots are used
	      // We must flush it at each frame otherwhise we'll end up
	      // with stale sprites
	      this.oamTable.fill(0xff);
	
	      for (var sprite = 0; sprite < 64; sprite++) {
	        tile = this.memory.oam[sprite * 4 + 1];
	        spriteSize = this.getSpriteSize();
	
	        if (this.fSpriteSize === 0) {
	          table = this.fSpriteTable;
	        } else {
	          table = tile & 1;
	          tile = tile & 0xfe;
	        }
	
	        attributes = this.memory.oam[sprite * 4 + 2];
	        address = 0x1000 * table + tile * 16;
	        isReversedVertically = (attributes & 0x80) === 0x80;
	        isReversedHorizontally = (attributes & 0x40) === 0x40;
	
	        if (tile === 0) {
	          // Unused sprite
	          continue;
	        }
	
	        for (var tileY = 0; tileY < spriteSize; tileY++) {
	          lowTileData = this.memory.read8(address);
	          highTileData = this.memory.read8(address + 8);
	          tileShiftY = isReversedVertically ? spriteSize - 1 - tileY : tileY;
	
	          for (var tileX = 0; tileX < 8; tileX++) {
	            tileShiftX = isReversedHorizontally ? 7 - tileX : tileX;
	            value = lowTileData >> tileShiftX & 1 | (highTileData >> tileShiftX & 1) << 1;
	            v = tileShiftY * 80; // Tmp vertical position
	            v += tableY * 80; // Permanent vertical position;
	            v += 7 - tileX; // Tmp horizontal position
	            v += sprite % 8 * 8 + sprite % 8 * 2; // Permanent horizontal position
	            v *= 4; // RGBA
	
	            this.oamTable[v] = this.patternTablesColors[value][0];
	            this.oamTable[v + 1] = this.patternTablesColors[value][1];
	            this.oamTable[v + 2] = this.patternTablesColors[value][2];
	            this.oamTable[v + 3] = 0xff;
	          }
	
	          address++;
	
	          if (this.fSpriteSize !== 0 && tileY === 7) {
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
	
	  }, {
	    key: "reset",
	    value: function reset() {
	      // Clean dat shit
	      this.memory.flush();
	      this.cycle = 0;
	      this.scanline = 261;
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
	  }, {
	    key: "setRenderingMode",
	    value: function setRenderingMode(mode) {
	      var _RENDERING_MODES$NORM;
	
	      this.renderingMode = (_RENDERING_MODES$NORM = {}, _defineProperty(_RENDERING_MODES$NORM, _constants.RENDERING_MODES.NORMAL, this.normalRenderingMode), _defineProperty(_RENDERING_MODES$NORM, _constants.RENDERING_MODES.SPLIT, this.splitRenderingMode), _RENDERING_MODES$NORM)[mode];
	    }
	
	    /**
	     * Emulation related methods
	     */
	
	  }, {
	    key: "getSpriteSize",
	    value: function getSpriteSize() {
	      return this.fSpriteSize ? 16 : 8;
	    }
	
	    /*  Handles the read communication between CPU and PPU */
	
	  }, {
	    key: "read8",
	    value: function read8(address) {
	      switch (address) {
	        case 0x2002:
	          {
	            /**
	             * 0x2002: PPUSTATUS
	             * Used to describe the status of a PPU frame
	             * Note: Resets write toggle `w`
	             */
	            this.registerRead = this.register & 0x1f;
	            this.registerRead = this.registerRead | this.fSpriteOverflow << 5;
	            this.registerRead = this.registerRead | this.fSpriteZeroHit << 6;
	            if (this.nmiOccurred) {
	              // Avoid reading the NMI right after it is set
	              if (this.cycle !== 2 || this.scanline !== 241) {
	                this.registerRead = this.registerRead | 1 << 7;
	              }
	            }
	            this.nmiOccurred = 0;
	            this.w = 0;
	
	            return this.registerRead;
	          }
	        case 0x2004:
	          {
	            return this.memory.oam[this.oamAddress];
	          }
	        case 0x2007:
	          {
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
	
	  }, {
	    key: "write8",
	    value: function write8(address, value, cpuRead8) {
	      // Pointer to the last value written to a register
	      // Used by PPUSTATUS (0x2002)
	      this.register = value;
	
	      switch (address) {
	        case 0x2000:
	          {
	            /**
	             * 0x2000: PPUCTR
	             * Sets 7 flags that control where/how the ROM data is read
	             */
	            this.fNameTable = value >> 0 & 3;
	            this.fIncrement = value >> 2 & 1;
	            this.fSpriteTable = value >> 3 & 1;
	            this.fBackgroundTable = value >> 4 & 1;
	            this.fSpriteSize = value >> 5 & 1;
	            this.fMasterSlave = value >> 6 & 1;
	            this.nmiOutput = (value >> 7 & 1) === 1;
	            this.t = this.t & 0xf3ff | (value & 0x03) << 10;
	            break;
	          }
	        case 0x2001:
	          {
	            /**
	             * 0x2001: PPUMASK
	             * Sets 8 flags (1 byte) that control how to display pixels on screen
	             */
	            this.fGrayscale = value >> 0 & 1;
	            this.fShowLeftBackground = value >> 1 & 1;
	            this.fShowLeftSprites = value >> 2 & 1;
	            this.fShowBackground = value >> 3 & 1;
	            this.fShowSprites = value >> 4 & 1;
	            this.fRedTint = value >> 5 & 1;
	            this.fGreenTint = value >> 6 & 1;
	            this.fBlueTint = value >> 7 & 1;
	            break;
	          }
	        case 0x2003:
	          {
	            // 0x2003: OAMADDR
	            this.oamAddress = value;
	            break;
	          }
	        case 0x2004:
	          {
	            // 0x2004: OAMDATA (write)
	            this.memory.oam[this.oamAddress] = value;
	            this.oamAddress++;
	            break;
	          }
	        case 0x2005:
	          {
	            /**
	             * 0x2005: PPUSCROLL
	             * Update the scroll variables, aka which pixel of the nametable will be
	             * at the top left of the screen
	             */
	            if (this.w === 0) {
	              this.t = this.t & 0xffe0 | value >> 3;
	              this.x = value & 0x07;
	              this.w = 1;
	            } else {
	              this.t = this.t & 0x8fff | (value & 0x07) << 12;
	              this.t = this.t & 0xfc1f | (value & 0xf8) << 2;
	              this.w = 0;
	            }
	            break;
	          }
	        case 0x2006:
	          {
	            if (this.w === 0) {
	              this.t = this.t & 0x80ff | (value & 0x3f) << 8;
	              this.w = 1;
	            } else {
	              this.t = this.t & 0xff00 | value;
	              this.v = this.t;
	              this.w = 0;
	            }
	            break;
	          }
	        case 0x2007:
	          {
	            // 0x2007: PPUDATA
	            this.memory.write8(this.v, value);
	            if (this.fIncrement === 0) {
	              this.v += 1;
	            } else {
	              this.v += 32;
	            }
	            break;
	          }
	        case 0x4014:
	          {
	            // 0x4014 is handled by the CPU to avoid using cpu methods here
	            break;
	          }
	      }
	    }
	
	    //
	    // https://wiki.nesdev.com/w/index.php/PPU_scrolling
	    //
	
	  }, {
	    key: "updateScrollingX",
	    value: function updateScrollingX() {
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
	  }, {
	    key: "updateScrollingY",
	    value: function updateScrollingY() {
	      // This one really is a mess
	      // Values are coming from nesdev, don't touch, don't break
	      if (this.cycleType === _constants.CYCLES.INCREMENT_Y) {
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
	          this.v = this.v & 0xfc1f | this.y << 5;
	        }
	      }
	
	      if (this.cycleType === _constants.CYCLES.COPY_X) {
	        // https://wiki.nesdev.com/w/index.php/PPU_scrolling#At_dot_257_of_each_scanline
	        this.v = this.v & 0xfbe0 | this.t & 0x041f;
	      }
	    }
	  }, {
	    key: "setVerticalBlank",
	    value: function setVerticalBlank() {
	      this.nmiOccurred = 1;
	    }
	
	    /**
	     * Called at the end of vertical blank
	     * Prepares the PPU for next frame
	     */
	
	  }, {
	    key: "clearVerticalBlank",
	    value: function clearVerticalBlank() {
	      this.nmiOccurred = 0;
	      this.frameReady = true;
	    }
	  }, {
	    key: "acknowledgeFrame",
	    value: function acknowledgeFrame() {
	      // Must be called by code handling the NES
	      this.frameReady = false;
	
	      if (this.fShowSprites === 1) {
	        this.fSpriteOverflow = 0;
	        this.fSpriteZeroHit = 0;
	      }
	
	      this.frameBackgroundBuffer.fill(0x00);
	      this.frameSpriteBuffer.fill(0x00);
	    }
	
	    /**
	     * Returns the current background pixel
	     * if background mode is enabled.
	     *
	     * This is where fine x is used as it points to
	     * the correct bit of the current tile to use.
	     */
	
	  }, {
	    key: "getCurrentBackgroundPixel",
	    value: function getCurrentBackgroundPixel() {
	      if (this.fShowBackground === 0) {
	        return 0;
	      }
	
	      return this.backgroundTileBuffer[this.x] & 0x0f;
	    }
	
	    /**
	     * Return the current sprite pixel
	     * if sprite mode is enabled and there is a pixel to display.
	     */
	
	  }, {
	    key: "getCurrentSpritePixel",
	    value: function getCurrentSpritePixel() {
	      var color, offset;
	
	      if (this.fShowSprites === 0) {
	        return [0, 0];
	      }
	
	      for (var i = 0; i < this.spriteCount; i++) {
	        offset = this.cycle - 1 - this.sprites[i].x;
	        if (offset < 0 || offset > 7) {
	          continue;
	        }
	
	        color = this.sprites[i].buffer[offset] & 0x0f;
	
	        if (color % 4 === 0) {
	          continue;
	        }
	        return [i, color | 0x10];
	      }
	      return [0, 0];
	    }
	
	    /**
	     * Assign a RGBA color to the int8 array
	     */
	
	  }, {
	    key: "setColorToBuffer",
	    value: function setColorToBuffer(buffer, i, color) {
	      buffer[i] = color >> 16 & 0xff;
	      buffer[i + 1] = color >> 8 & 0xff;
	      buffer[i + 2] = color & 0xff;
	      buffer[i + 3] = 0xff;
	    }
	  }, {
	    key: "normalRenderingMode",
	    value: function normalRenderingMode(pos, colorPos, c) {
	      this.setColorToBuffer(this.frameBuffer, colorPos, c);
	    }
	  }, {
	    key: "splitRenderingMode",
	    value: function splitRenderingMode(pos, colorPos, c) {
	      this.frameColorBuffer[pos] = c;
	
	      if (this.isBackgroundPixel) {
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
	
	  }, {
	    key: "renderPixel",
	    value: function renderPixel() {
	      var x = this.cycle - 1;
	      var y = this.scanline;
	      var pos = y * 256 + x;
	
	      this.isBackgroundPixel = true;
	      this.color = 0;
	      this.backgroundColor = x < 8 && this.fShowLeftBackground === 0 ? 0 : this.getCurrentBackgroundPixel();
	
	      // cf priority decision table https://wiki.nesdev.com/w/index.php/PPU_rendering
	      // TODO: Looks like there's a display blinking bug on some games, cf Castlevania
	      var _ref = x < 8 && this.fShowLeftSprites === 0 ? [0, 0] : this.getCurrentSpritePixel();
	
	      var _ref2 = _slicedToArray(_ref, 2);
	
	      this.spriteIndex = _ref2[0];
	      this.spriteColor = _ref2[1];
	      this.backgroundPixel = this.backgroundColor % 4;
	      this.spritePixel = this.spriteColor % 4;
	
	      if (this.backgroundPixel === 0 && this.spritePixel === 0) {
	        this.color = 0;
	      } else if (this.backgroundPixel === 0 && this.spritePixel !== 0) {
	        this.color = this.spriteColor;
	        this.isBackgroundPixel = false;
	      } else if (this.backgroundPixel !== 0 && this.spritePixel === 0) {
	        this.color = this.backgroundColor;
	      } else {
	        if (this.sprites[this.spriteIndex].index === 0 && x < 255) {
	          this.fSpriteZeroHit = 1;
	        }
	        if (this.sprites[this.spriteIndex].priority === 0) {
	          this.color = this.spriteColor;
	          this.isBackgroundPixel = false;
	        } else {
	          this.color = this.backgroundColor;
	        }
	      }
	
	      // Fills the buffer at pos `x`, `y` with rgb color `c`
	      this.renderingMode(pos, pos * 4, _constants.COLORS[this.memory.paletteTable.read8(this.color)]);
	    }
	
	    /**
	     *  Helper method that appends a tile line to `tileData`
	     *  by reading & concatenating lowTileByte, highTileByte and attributeTableByte.
	     *  Must be called 8 times (or 16 for some sprites) to generate a sprite
	     */
	
	  }, {
	    key: "readTileRow",
	    value: function readTileRow(tileData, attributeTableByte, lowTileByte, highTileByte, isReversedHorizontally, flush) {
	      var tileShiftX = 0;
	      var value = 0;
	
	      if (flush) {
	        tileData.length = 0;
	      }
	
	      for (var tileX = 0; tileX < 8; tileX++) {
	        tileShiftX = isReversedHorizontally ? tileX : 7 - tileX;
	        value = attributeTableByte | (lowTileByte >> tileShiftX & 1 | (highTileByte >> tileShiftX & 1) << 1);
	
	        tileData.push(value);
	      }
	    }
	  }, {
	    key: "fetchSpriteRow",
	    value: function fetchSpriteRow(tileData, i, row) {
	      // Sub function of fetchAndStoreSprites
	      var tile = this.memory.oam[i * 4 + 1];
	      var attributes = this.memory.oam[i * 4 + 2];
	      var address;
	      var table = 0;
	      var isReversedVertically = (attributes & 0x80) === 0x80;
	      var isReversedHorizontally = (attributes & 0x40) === 0x40;
	      var attributeTableByte = (attributes & 3) << 2;
	      var spriteSize = this.getSpriteSize();
	
	      if (this.fSpriteSize === 0) {
	        table = this.fSpriteTable;
	      } else {
	        table = tile & 1;
	        tile = tile & 0xfe;
	      }
	
	      row = isReversedVertically ? spriteSize - 1 - row : row;
	
	      if (row > 7) {
	        tile++;
	        row = row % 8;
	      }
	
	      address = 0x1000 * table + tile * 16 + row;
	
	      this.lowTileByte = this.memory.read8(address);
	      this.highTileByte = this.memory.read8(address + 8);
	
	      this.readTileRow(tileData, attributeTableByte, this.lowTileByte, this.highTileByte, isReversedHorizontally, true);
	    }
	
	    /**
	     * Retrieves the sprites that are to be rendered on the next scanline
	     * Executed at the end of a scanline
	     */
	
	  }, {
	    key: "fetchAndStoreSpriteRows",
	    value: function fetchAndStoreSpriteRows() {
	      var y, attributes, row;
	      this.spriteCount = 0;
	      var spriteSize = this.getSpriteSize();
	
	      for (var i = 0; i < 64; i++) {
	        y = this.memory.oam[i * 4 + 0];
	        row = this.scanline - y;
	
	        if (row < 0 || row >= spriteSize) {
	          continue;
	        }
	
	        if (this.spriteCount < 8) {
	          attributes = this.memory.oam[i * 4 + 2];
	
	          this.fetchSpriteRow(this.sprites[this.spriteCount].buffer, i, row);
	          this.sprites[this.spriteCount].x = this.memory.oam[i * 4 + 3];
	          this.sprites[this.spriteCount].priority = attributes >> 5 & 1;
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
	
	  }, {
	    key: "fetchAndStoreBackgroundRow",
	    value: function fetchAndStoreBackgroundRow() {
	      var address;
	      var shift;
	      var fineY;
	      var nameTableByte = 0;
	
	      // Fetch Name Table Byte
	      address = 0x2000 | this.v & 0x0fff;
	      nameTableByte = this.memory.read8(address);
	
	      // Fetch Attribute Table Byte
	      address = 0x23c0 | this.v & 0x0c00 | this.v >> 4 & 0x38 | this.v >> 2 & 0x07;
	      shift = this.v >> 4 & 4 | this.v & 2;
	      this.attributeTableByte = (this.memory.read8(address) >> shift & 3) << 2;
	
	      // Fetch Low Tile Byte
	      fineY = this.v >> 12 & 7;
	      address = 0x1000 * this.fBackgroundTable + nameTableByte * 16 + fineY;
	      this.lowTileByte = this.memory.read8(address);
	
	      // Fetch High Tile Byte
	      fineY = this.v >> 12 & 7;
	      address = 0x1000 * this.fBackgroundTable + nameTableByte * 16 + fineY;
	      this.highTileByte = this.memory.read8(address + 8);
	
	      // Store Tile Data
	      this.readTileRow(this.backgroundTileBuffer, this.attributeTableByte, this.lowTileByte, this.highTileByte, false, false);
	    }
	
	    /**
	     * Determines the type of the cycle
	     * Refer to https://wiki.nesdev.com/w/images/d/d1/Ntsc_timing.png
	     */
	
	  }, {
	    key: "_cycleType",
	    value: function _cycleType() {
	      if (this.cycle === 0) {
	        return _constants.CYCLES.ZERO;
	      } else if (this.cycle === 1) {
	        return _constants.CYCLES.ONE;
	      } else if (this.cycle > 1 && this.cycle < 257) {
	        return _constants.CYCLES.VISIBLE;
	      } else if (this.cycle === 321) {
	        return _constants.CYCLES.FLUSH_TILEDATA;
	      } else if (this.cycle > 321 && this.cycle < 337) {
	        return _constants.CYCLES.PREFETCH;
	      } else if (this.cycle === 259) {
	        return _constants.CYCLES.SPRITES;
	      } else if (this.cycle === 258) {
	        return _constants.CYCLES.INCREMENT_Y;
	      } else if (this.cycle === 257) {
	        return _constants.CYCLES.COPY_X;
	      } else if (this.cycle > 279 && this.cycle < 305) {
	        return _constants.CYCLES.COPY_Y;
	      } else if (this.cycle === 340) {
	        return _constants.CYCLES.MAPPER_TICK;
	      } else {
	        return _constants.CYCLES.IDLE;
	      }
	    }
	
	    /**
	     * Determines the type of the scanline
	     */
	
	  }, {
	    key: "_scanlineType",
	    value: function _scanlineType() {
	      if (this.scanline < 240) {
	        return _constants.SCANLINES.VISIBLE;
	      } else if (this.scanline === 241) {
	        return _constants.SCANLINES.VBLANK;
	      } else if (this.scanline === 261) {
	        return _constants.SCANLINES.PRELINE;
	      } else {
	        return _constants.SCANLINES.IDLE;
	      }
	    }
	  }, {
	    key: "doPreline",
	    value: function doPreline() {
	      if (this.cycleType === _constants.CYCLES.ONE || this.cycleType === _constants.CYCLES.VISIBLE || this.cycleType === _constants.CYCLES.PREFETCH) {
	        this.backgroundTileBuffer.shift();
	
	        if (this.cycle % 8 === 0) {
	          if (this.cycle < 256) {
	            this.fetchAndStoreBackgroundRow();
	          }
	          this.updateScrollingX();
	        }
	      }
	
	      if (this.cycleType === _constants.CYCLES.SPRITES) {
	        this.spriteCount = 0;
	      }
	
	      if (this.cycleType === _constants.CYCLES.COPY_Y) {
	        // https://wiki.nesdev.com/w/index.php/PPU_scrolling#During_dots_280_to_304_of_the_pre-render_scanline_.28end_of_vblank.29
	        this.v = this.v & 0x841f | this.t & 0x7be0;
	      }
	
	      this.updateScrollingY();
	
	      if (this.cycleType === _constants.CYCLES.ONE) {
	        this.clearVerticalBlank();
	      }
	
	      if (this.cycleType === _constants.CYCLES.MAPPER_TICK) {
	        if (this.memory.mapper.tick()) {
	          return _constants.INTERRUPTS.IRQ;
	        }
	      }
	    }
	  }, {
	    key: "doVisibleLine",
	    value: function doVisibleLine() {
	      if (this.cycleType === _constants.CYCLES.ONE || this.cycleType === _constants.CYCLES.VISIBLE) {
	        this.renderPixel();
	      }
	
	      if (this.cycleType === _constants.CYCLES.VISIBLE) {
	        this.backgroundTileBuffer.shift();
	
	        if (this.cycle % 8 === 0) {
	          if (this.cycle < 256) {
	            this.fetchAndStoreBackgroundRow();
	          }
	          this.updateScrollingX();
	        }
	      } else if (this.cycleType === _constants.CYCLES.FLUSH_TILEDATA) {
	        // Hackish hack, empty the remaining tile data at the beginning of prefetch
	        // Needs improvement
	        this.backgroundTileBuffer.length = 0;
	      } else if (this.cycleType === _constants.CYCLES.PREFETCH) {
	        if (this.cycle % 8 === 0) {
	          this.fetchAndStoreBackgroundRow();
	          this.updateScrollingX();
	        }
	      }
	
	      this.updateScrollingY();
	
	      if (this.cycleType === _constants.CYCLES.SPRITES) {
	        this.fetchAndStoreSpriteRows();
	      }
	
	      if (this.cycleType === _constants.CYCLES.MAPPER_TICK) {
	        if (this.memory.mapper.tick()) {
	          return _constants.INTERRUPTS.IRQ;
	        }
	      }
	
	      return null;
	    }
	  }, {
	    key: "doVBlankLine",
	    value: function doVBlankLine() {
	      if (this.cycleType === _constants.CYCLES.SPRITES) {
	        this.spriteCount = 0;
	      }
	
	      // Vertical Blank is set at second tick of scanline 241
	      if (this.cycleType === _constants.CYCLES.ONE) {
	        this.setVerticalBlank();
	        if (this.nmiOutput) {
	          return _constants.INTERRUPTS.NMI; // Clean this shit
	        }
	      }
	
	      return null;
	    }
	  }, {
	    key: "incrementCounters",
	    value: function incrementCounters() {
	      this.cycle++;
	
	      // Skip one cycle when background is on for each odd frame
	      if (this.scanline === 261 && this.cycle === 340 && this.fShowBackground !== 0 && this.f === 1) {
	        this.cycle++;
	        this.f = this.f ^ 1;
	      }
	
	      if (this.cycle === 341) {
	        this.cycle = 0;
	        this.scanline++;
	        if (this.scanline === 262) {
	          this.scanline = 0;
	        }
	      }
	    }
	
	    /**
	     * Main function of PPU.
	     * Increments counters (cycle, scanline, frame)
	     * Executes one action based on scanline + cycle
	     */
	
	  }, {
	    key: "tick",
	    value: function tick() {
	      this.cycleType = this._cycleType();
	      this.scanlineType = this._scanlineType();
	
	      if (this.scanlineType === _constants.SCANLINES.VBLANK) {
	        this.interrupt = this.doVBlankLine();
	      } else if (this.fShowBackground !== 0 || this.fShowSprites !== 0) {
	        if (this.scanlineType === _constants.SCANLINES.PRELINE) {
	          this.interrupt = this.doPreline();
	        } else if (this.scanlineType === _constants.SCANLINES.VISIBLE) {
	          this.interrupt = this.doVisibleLine();
	        }
	      } else {
	        this.interrupt = null;
	      }
	
	      this.incrementCounters();
	
	      return this.interrupt;
	    }
	  }]);
	
	  return PPU;
	}();
	
	exports.default = PPU;

/***/ }),
/* 10 */
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/**
	 * http://wiki.nesdev.com/w/index.php/PPU_nametables
	 */
	var NameTable = function () {
	  function NameTable() {
	    _classCallCheck(this, NameTable);
	
	    this.data = new Uint8Array(2048).fill(0x00);
	    // http://wiki.nesdev.com/w/index.php/Mirroring
	    this.mirrors = [[0, 0, 1, 1], // Horizontal
	    [0, 1, 0, 1], // Vertical
	    [0, 0, 0, 0], // Single screen
	    [1, 1, 1, 1], // Single screen 2
	    [0, 1, 2, 3] // 4 Screen
	    ];
	  }
	
	  _createClass(NameTable, [{
	    key: "flush",
	    value: function flush() {
	      this.data.fill(0x00);
	    }
	  }, {
	    key: "_resolve",
	    value: function _resolve(mode, addr) {
	      addr = addr % 0x1000;
	
	      return this.mirrors[mode][parseInt(addr / 0x400)] * 0x400 + addr % 0x400;
	    }
	  }, {
	    key: "read8",
	    value: function read8(mode, addr) {
	      return this.data[this._resolve(mode, addr)];
	    }
	  }, {
	    key: "write8",
	    value: function write8(mode, addr, value) {
	      this.data[this._resolve(mode, addr)] = value;
	    }
	  }]);
	
	  return NameTable;
	}();
	
	/**
	 * Color lookup table
	 * 8 palettes of 4 colors
	 */
	
	
	var PaletteTable = function () {
	  function PaletteTable() {
	    _classCallCheck(this, PaletteTable);
	
	    this.data = new Uint8Array(32).fill(0x00);
	  }
	
	  _createClass(PaletteTable, [{
	    key: "flush",
	    value: function flush() {
	      this.data.fill(0x00);
	    }
	  }, {
	    key: "write8",
	    value: function write8(addr, value) {
	      addr = addr % 32;
	
	      // Each 4th byte of the palettes are mirrored into each other
	      // $3F10/$3F14/$3F18/$3F1C == $3F00/$3F04/$3F08/$3F0C
	      if (addr % 4 === 0 && addr >= 16) {
	        addr -= 16;
	      }
	
	      this.data[addr] = value;
	    }
	  }, {
	    key: "read8",
	    value: function read8(addr) {
	      addr = addr % 32;
	
	      if (addr % 4 === 0 && addr >= 16) {
	        addr -= 16;
	      }
	      return this.data[addr];
	    }
	  }]);
	
	  return PaletteTable;
	}();
	
	/**
	 *
	 *   Aka. VRAM
	 *
	 *   CHR: 0x0000 => 0x2000
	 *   Nametable: 0x2000 => 0x3f00
	 *   Background palette: 0x3F00 => 0x3F10
	 *   Sprite palette: 0x3F00 => 0x3F20
	 *
	 */
	
	
	var PPUMemory = function () {
	  function PPUMemory() {
	    _classCallCheck(this, PPUMemory);
	
	    this.paletteTable = new PaletteTable();
	
	    // https://wiki.nesdev.com/w/index.php/PPU_OAM
	    // Max 64 sprites
	    // Byte 0 => Y position
	    // Byte 1 => Bank nbr (address in mapper)
	    // Byte 2 => Attributes (priority, hori. vert. switch)
	    // Byte 3 => X position
	    this.oam = new Uint8Array(256).fill(0x00);
	    this.nameTable = new NameTable();
	    this.mapper = null;
	  }
	
	  _createClass(PPUMemory, [{
	    key: "flush",
	    value: function flush() {
	      this.paletteTable.flush();
	      this.oam.fill(0x00);
	      this.nameTable.flush();
	    }
	  }, {
	    key: "write8",
	    value: function write8(addr, value) {
	      addr = addr % 0x4000;
	
	      if (addr < 0x2000) {
	        this.mapper.write8(addr, value);
	      } else if (addr < 0x3f00) {
	        this.nameTable.write8(this.mapper.mirrorType, addr, value);
	      } else if (addr < 0x4000) {
	        this.paletteTable.write8(addr, value);
	      } else {
	        throw new Error("Unknown PPU addr " + addr);
	      }
	    }
	  }, {
	    key: "readNametable",
	    value: function readNametable(addr) {
	      addr = addr % 0x4000;
	      return this.nameTable.read8(this.mapper.mirrorType, addr);
	    }
	  }, {
	    key: "read8",
	    value: function read8(addr) {
	      addr = addr % 0x4000;
	
	      if (addr < 0x2000) {
	        return this.mapper.read8(addr);
	      } else if (addr < 0x3f00) {
	        return this.nameTable.read8(this.mapper.mirrorType, addr);
	      } else if (addr < 0x4000) {
	        this.paletteTable.read8(addr);
	      } else {
	        throw new Error("Unknown PPU addr " + addr);
	      }
	    }
	  }]);
	
	  return PPUMemory;
	}();
	
	exports.default = PPUMemory;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _NROM = __webpack_require__(12);
	
	var _NROM2 = _interopRequireDefault(_NROM);
	
	var _MMC = __webpack_require__(15);
	
	var _MMC2 = _interopRequireDefault(_MMC);
	
	var _MMC3 = __webpack_require__(17);
	
	var _MMC4 = _interopRequireDefault(_MMC3);
	
	var _UXROM = __webpack_require__(18);
	
	var _UXROM2 = _interopRequireDefault(_UXROM);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var HEADER_SIZE = 16;
	var PRG_BANK_SIZE = 16384;
	var CHR_BANK_SIZE = 8192;
	
	var ROM =
	/**
	 * Parse a .nes file according to the INES file format
	 * http://wiki.nesdev.com/w/index.php/INES
	 * https://wiki.nesdev.com/w/index.php/CHR_ROM_vs._CHR_RAM
	  * CHR => Pattern tables, the raw data to render by the PPU
	 * PRG => The program, used by the CPU
	 */
	function ROM(dataBuffer) {
	  _classCallCheck(this, ROM);
	
	  var p = 0;
	  var byteArray = new Uint8Array(dataBuffer);
	  this.header = byteArray.subarray(p, HEADER_SIZE);
	
	  p += HEADER_SIZE;
	
	  this.nbrPRGBanks = this.header[4];
	  this.nbrCHRBanks = this.header[5];
	  // Cf below for types
	  this.mapperType = this.header[6] >> 4 | this.header[7] >> 4 << 4;
	  // Type will depend on the mapper, check mapper classes
	  this.mirrorType = this.header[6] & 1 | (this.header[6] >> 3 & 1) << 1;
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
	    case 0:
	      {
	        this.mapper = new _NROM2.default(this);
	        break;
	      }
	    case 1:
	      {
	        this.mapper = new _MMC2.default(this);
	        break;
	      }
	    case 2:
	      {
	        this.mapper = new _UXROM2.default(this);
	        break;
	      }
	    case 4:
	      {
	        this.mapper = new _MMC4.default(this);
	        break;
	      }
	    default:
	      {
	        throw new Error("Invalid mapper: " + this.mapperType);
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
	} */
	;
	
	exports.default = ROM;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _Mapper2 = __webpack_require__(13);
	
	var _Mapper3 = _interopRequireDefault(_Mapper2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	/**
	 *   http://wiki.nesdev.com/w/index.php/NROM
	 */
	
	var NROM = function (_Mapper) {
	  _inherits(NROM, _Mapper);
	
	  function NROM(rom) {
	    _classCallCheck(this, NROM);
	
	    var _this = _possibleConstructorReturn(this, (NROM.__proto__ || Object.getPrototypeOf(NROM)).call(this, rom));
	
	    _this.prg.switchBank(0x4000, 0x8000, _this.prg.bankNbr / 16 - 1);
	    return _this;
	  }
	
	  _createClass(NROM, [{
	    key: "read8",
	    value: function read8(addr) {
	      if (addr < 0x2000) {
	        return this.chr.read8(addr);
	      } else if (addr < 0x8000) {
	        return this.sram[addr - 0x6000];
	      } else {
	        return this.prg.read8(addr - 0x8000);
	      }
	    }
	  }, {
	    key: "write8",
	    value: function write8(addr, value) {
	      if (addr < 0x2000) {
	        this.chr.write8(addr, value);
	      } else if (addr < 0x8000) {
	        this.sram[addr - 0x6000] = value;
	      } else {
	        console.warn("Invalid write addr", addr);
	      }
	    }
	  }]);
	
	  return NROM;
	}(_Mapper3.default);
	
	exports.default = NROM;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _Bank = __webpack_require__(14);
	
	var _Bank2 = _interopRequireDefault(_Bank);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/**
	 * http://wiki.nesdev.com/w/index.php/Mapper
	 */
	var Mapper = function () {
	  function Mapper(rom) {
	    _classCallCheck(this, Mapper);
	
	    this.chr = new _Bank2.default(rom.chr, 0x2000, true);
	    this.prg = new _Bank2.default(rom.prg, 0x8000, false);
	    this.sram = new Array(0x2000).fill(0xff);
	    this.mirrorType = rom.mirrorType;
	  }
	
	  /**
	   *  Only used for a few mappers
	   */
	
	
	  _createClass(Mapper, [{
	    key: "tick",
	    value: function tick() {}
	  }]);
	
	  return Mapper;
	}();
	
	exports.default = Mapper;

/***/ }),
/* 14 */
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var BankMemory = function () {
	  function BankMemory(data, windowSize, fixed) {
	    _classCallCheck(this, BankMemory);
	
	    this.data = data;
	    this.fixed = fixed;
	    this.swapMode = 0;
	    this.windowSize = windowSize;
	    this.bankNbr = parseInt(this.data.length / 0x0400);
	    this.pointers = new Array(parseInt(windowSize / 0x0400)).fill(0);
	    // Tmp variables
	    this.p = 0;
	    this.o = 0;
	    this.p1 = 0;
	    this.p2 = 0;
	
	    for (var i = 0; i < this.pointers.length; i++) {
	      this.pointers[i] = i;
	    }
	  }
	
	  _createClass(BankMemory, [{
	    key: "switchBank",
	    value: function switchBank(_from, _to, value) {
	      this.p1 = parseInt(_from / 0x0400);
	      this.p2 = parseInt(_to / 0x0400);
	      // Explain
	      value = value * (this.p2 - this.p1);
	
	      for (var i = this.p1; i < this.p2; i++) {
	        this.pointers[i] = value + (i - this.p1);
	      }
	    }
	  }, {
	    key: "write8",
	    value: function write8(addr, value) {
	      this.p = parseInt(addr / 0x0400);
	      this.o = addr % 0x0400;
	      this.data[this.pointers[this.p] * 0x0400 + this.o] = value;
	    }
	  }, {
	    key: "read8",
	    value: function read8(addr) {
	      this.p = parseInt(addr / 0x0400);
	      this.o = addr % 0x0400;
	      return this.data[this.pointers[this.p] * 0x0400 + this.o];
	    }
	  }]);
	
	  return BankMemory;
	}();
	
	exports.default = BankMemory;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _Mapper2 = __webpack_require__(13);
	
	var _Mapper3 = _interopRequireDefault(_Mapper2);
	
	var _constants = __webpack_require__(16);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var MMC1_MIRRORS = {
	  0: _constants.NAMETABLE_MIRRORS.SINGLE_SCREEN_0,
	  1: _constants.NAMETABLE_MIRRORS.SINGLE_SCREEN_1,
	  2: _constants.NAMETABLE_MIRRORS.VERTICAL,
	  3: _constants.NAMETABLE_MIRRORS.HORIZONTAL
	};
	
	/**
	 * http://wiki.nesdev.com/w/index.php/MMC1
	 */
	
	var MMC1 = function (_Mapper) {
	  _inherits(MMC1, _Mapper);
	
	  function MMC1(rom) {
	    _classCallCheck(this, MMC1);
	
	    var _this = _possibleConstructorReturn(this, (MMC1.__proto__ || Object.getPrototypeOf(MMC1)).call(this, rom));
	
	    _this.buffer = 0x10;
	    _this.bufferIndex = 0;
	    _this.conf = 0x0c;
	    _this.prgBankMode = 0;
	    _this.chrBankMode = 0;
	
	    _this.prg.switchBank(0x4000, 0x8000, _this.prg.bankNbr / 16 - 1);
	    return _this;
	  }
	
	  _createClass(MMC1, [{
	    key: "read8",
	    value: function read8(addr) {
	      if (addr < 0x2000) {
	        return this.chr.read8(addr);
	      } else if (addr < 0x8000) {
	        return this.sram[addr - 0x6000];
	      } else {
	        return this.prg.read8(addr - 0x8000);
	      }
	    }
	
	    /**
	     *  MMC1 has an internal buffer which needs to be written 5 times before switching banks or
	     *  updating registers
	     */
	
	  }, {
	    key: "write8",
	    value: function write8(addr, value) {
	      if (addr < 0x2000) {
	        this.chr.write8(addr, value);
	      } else if (addr < 0x8000) {
	        this.sram[addr - 0x6000] = value;
	      } else {
	        if ((value & 0x80) !== 0) {
	          this.buffer = 0x10;
	          this.bufferIndex = 0;
	          this.control(this.conf | 0x0c);
	        } else {
	          // Write Register
	          this.buffer = this.buffer >> 1 | (value & 1) << 4;
	          this.bufferIndex++;
	
	          if (this.bufferIndex === 5) {
	            value = this.buffer;
	
	            // Control
	            if (addr < 0xa000) {
	              this.control(value);
	            } else if (addr < 0xc000) {
	              // CHR Bank 0
	              if (!this.chr.fixed) {
	                this.chr.switchBank(0, 0x1000, value);
	              } else {
	                value = parseInt(value >> 1);
	                this.chr.switchBank(0, 0x2000, value);
	              }
	            } else if (addr < 0xe000) {
	              // CHR Bank 1
	              if (!this.chr.fixed) {
	                // this.chr.updateUpperBank(value);
	                this.chr.switchBank(0x1000, 0x2000, value);
	              }
	            } else {
	              // PRG Bank
	              if (this.prg.fixed) {
	                value = parseInt(value >> 1);
	                this.prg.switchBank(0, 0x8000, value);
	              } else {
	                if (this.prg.swapMode === 0) {
	                  this.prg.switchBank(0, 0x4000, 0);
	                  this.prg.switchBank(0x4000, 0x8000, value);
	                } else {
	                  this.prg.switchBank(0, 0x4000, value);
	                  this.prg.switchBank(0x4000, 0x8000, this.prg.bankNbr / 16 - 1);
	                }
	              }
	            }
	
	            this.buffer = 0x10;
	            this.bufferIndex = 0;
	          }
	        }
	      }
	    }
	  }, {
	    key: "control",
	    value: function control(value) {
	      this.conf = value;
	      this.prgBankMode = value >> 2 & 3;
	      this.chrBankMode = value >> 4 & 1;
	      this.mirrorType = MMC1_MIRRORS[value & 3];
	
	      if (this.prgBankMode === 2) {
	        this.prg.swapMode = 0;
	      }
	      if (this.prgBankMode === 3) {
	        this.prg.swapMode = 1;
	      }
	
	      this.prg.fixed = this.prgBankMode === 0 || this.prgBankMode === 1;
	      this.chr.fixed = this.chrBankMode === 0;
	    }
	  }]);
	
	  return MMC1;
	}(_Mapper3.default);
	
	exports.default = MMC1;

/***/ }),
/* 16 */
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var BANK_SIZES = exports.BANK_SIZES = {
	  "4k": 0x1000,
	  "8k": 0x2000,
	  "16k": 0x4000,
	  "32k": 0x8000
	};
	
	var NAMETABLE_MIRRORS = exports.NAMETABLE_MIRRORS = {
	  HORIZONTAL: 0,
	  VERTICAL: 1,
	  SINGLE_SCREEN_0: 2,
	  SINGLE_SCREEN_1: 3,
	  FOUR_SCREEN: 4
	};

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _Mapper2 = __webpack_require__(13);
	
	var _Mapper3 = _interopRequireDefault(_Mapper2);
	
	var _constants = __webpack_require__(16);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var MMC3_MIRRORS = {
	  0: _constants.NAMETABLE_MIRRORS.VERTICAL,
	  1: _constants.NAMETABLE_MIRRORS.HORIZONTAL
	};
	
	var MMC3 = function (_Mapper) {
	  _inherits(MMC3, _Mapper);
	
	  function MMC3(rom) {
	    _classCallCheck(this, MMC3);
	
	    var _this = _possibleConstructorReturn(this, (MMC3.__proto__ || Object.getPrototypeOf(MMC3)).call(this, rom));
	
	    _this.prgBankMode = 0;
	    _this.chrBankMode = 0;
	    _this.bankRegister = 0;
	    _this.irqCounter = 0;
	    _this.irqLatch = 0;
	    _this.irqEnable = true;
	
	    // PRG banks of MMC3 requires special bank switching at init
	    _this.prg.switchBank(0x4000, 0x6000, _this.prg.bankNbr / 8 - 2);
	    _this.prg.switchBank(0x6000, 0x8000, _this.prg.bankNbr / 8 - 1);
	    _this.prg.switchBank(0x0000, 0x2000, 0);
	    _this.prg.switchBank(0x2000, 0x4000, 1);
	    return _this;
	  }
	
	  /**
	   *  MMC3 has its own tick method. We must trigger IRQ interrupts
	   *  each time our internal counter reaches 0. Then it is reset
	   *  using `irqLatch` which is set in `control()`
	   */
	
	
	  _createClass(MMC3, [{
	    key: "tick",
	    value: function tick() {
	      if (this.irqCounter === 0) {
	        this.irqCounter = this.irqLatch;
	      } else {
	        this.irqCounter--;
	        if (this.irqCounter === 0 && this.irqEnable) {
	          return true;
	        }
	      }
	      return false;
	    }
	  }, {
	    key: "read8",
	    value: function read8(addr) {
	      if (addr < 0x2000) {
	        return this.chr.read8(addr);
	      } else if (addr < 0x8000) {
	        return this.sram[addr - 0x6000];
	      } else {
	        return this.prg.read8(addr - 0x8000);
	      }
	    }
	  }, {
	    key: "write8",
	    value: function write8(addr, value) {
	      if (addr < 0x2000) {
	        this.chr.write8(addr, value);
	      } else if (addr < 0x8000) {
	        this.sram[addr - 0x6000] = value;
	      } else {
	        this.control(addr, value);
	      }
	    }
	
	    /**
	     *  To switch banks, MMC3 require first to set `bankRegister`
	     *  then to make another call to update the appropriate CHR or PRG
	     *  banks using one of two different modes.
	     */
	
	  }, {
	    key: "control",
	    value: function control(addr, value) {
	      var isEven = addr % 2 === 0;
	
	      if (addr < 0x9fff && isEven) {
	        this.prgBankMode = value >> 6 & 1;
	        this.chrBankMode = value >> 7 & 1;
	        this.bankRegister = value & 7;
	      } else if (addr < 0xa000 && !isEven) {
	        switch (this.bankRegister) {
	          // Select 2 KB CHR bank at PPU $0000-$07FF (or $1000-$17FF);
	          case 0:
	            {
	              if (this.chrBankMode === 0) {
	                this.chr.switchBank(0, 0x0400, value & 0xfe);
	                this.chr.switchBank(0x0400, 0x0800, value | 0x01);
	              } else {
	                this.chr.switchBank(0x1000, 0x1400, value & 0xfe);
	                this.chr.switchBank(0x1400, 0x1800, value | 0x01);
	              }
	              break;
	            }
	          // Select 2 KB CHR bank at PPU $0800-$0FFF (or $1800-$1FFF);
	          case 1:
	            {
	              if (this.chrBankMode === 0) {
	                this.chr.switchBank(0x0800, 0x0c00, value & 0xfe);
	                this.chr.switchBank(0x0c00, 0x1000, value | 1);
	              } else {
	                this.chr.switchBank(0x1800, 0x1c00, value & 0xfe);
	                this.chr.switchBank(0x1c00, 0x2000, value | 1);
	              }
	              break;
	            }
	          // Select 1 KB CHR bank at PPU $1000-$13FF (or $0000-$03FF);
	          case 2:
	            {
	              if (this.chrBankMode === 0) {
	                this.chr.switchBank(0x1000, 0x01400, value);
	              } else {
	                this.chr.switchBank(0x0000, 0x0400, value);
	              }
	              break;
	            }
	          // Select 1 KB CHR bank at PPU $1400-$17FF (or $0400-$07FF);
	          case 3:
	            {
	              if (this.chrBankMode === 0) {
	                this.chr.switchBank(0x1400, 0x1800, value);
	              } else {
	                this.chr.switchBank(0x0400, 0x0800, value);
	              }
	              break;
	            }
	          // Select 1 KB CHR bank at PPU $1800-$1BFF (or $0800-$0BFF);
	          case 4:
	            {
	              if (this.chrBankMode === 0) {
	                this.chr.switchBank(0x1800, 0x1c00, value);
	              } else {
	                this.chr.switchBank(0x0800, 0x0c00, value);
	              }
	              break;
	            }
	          // Select 1 KB CHR bank at PPU $1C00-$1FFF (or $0C00-$0FFF);
	          case 5:
	            {
	              if (this.chrBankMode === 0) {
	                this.chr.switchBank(0x1c00, 0x2000, value);
	              } else {
	                this.chr.switchBank(0x0c00, 0x1000, value);
	              }
	              break;
	            }
	          // Select 8 KB PRG ROM bank at $8000-$9FFF (or $C000-$DFFF);
	          case 6:
	            {
	              if (this.prgBankMode === 0) {
	                this.prg.switchBank(0x4000, 0x6000, this.prg.bankNbr / 8 - 2);
	                this.prg.switchBank(0x0000, 0x2000, value);
	              } else {
	                this.prg.switchBank(0x0000, 0x2000, this.prg.bankNbr / 8 - 2);
	                this.prg.switchBank(0x4000, 0x6000, value);
	              }
	
	              break;
	            }
	          // Select 8 KB PRG ROM bank at $A000-$BFFF
	          case 7:
	            {
	              this.prg.switchBank(0x2000, 0x4000, value);
	
	              if (this.prgBankMode === 0) {
	                this.prg.switchBank(0x4000, 0x6000, this.prg.bankNbr / 8 - 2);
	              } else {
	                this.prg.switchBank(0x0000, 0x2000, this.prg.bankNbr / 8 - 2);
	              }
	              break;
	            }
	        }
	      } else if (addr < 0xbfff && isEven) {
	        this.mirrorType = MMC3_MIRRORS[value & 1];
	      } else if (addr < 0xc000 && !isEven) {
	        // Write Protect, not implemented
	      } else if (addr < 0xdfff && isEven) {
	        this.irqLatch = value;
	      } else if (addr < 0xe000 && !isEven) {
	        this.irqCounter = 0;
	      } else if (addr < 0xffff && isEven) {
	        this.irqEnable = false;
	      } else if (addr < 0x10000 && !isEven) {
	        this.irqEnable = true;
	      } else {
	        throw new Error("Unknown control: " + addr);
	      }
	    }
	  }]);
	
	  return MMC3;
	}(_Mapper3.default);
	
	exports.default = MMC3;

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _Mapper2 = __webpack_require__(13);
	
	var _Mapper3 = _interopRequireDefault(_Mapper2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	/**
	 *  http://wiki.nesdev.com/w/index.php/UxROM
	 */
	var UXROM = function (_Mapper) {
	  _inherits(UXROM, _Mapper);
	
	  function UXROM(rom) {
	    _classCallCheck(this, UXROM);
	
	    var _this = _possibleConstructorReturn(this, (UXROM.__proto__ || Object.getPrototypeOf(UXROM)).call(this, rom));
	
	    _this.prg.switchBank(0x4000, 0x8000, _this.prg.bankNbr / 16 - 1);
	    return _this;
	  }
	
	  _createClass(UXROM, [{
	    key: "read8",
	    value: function read8(addr) {
	      if (addr < 0x2000) {
	        return this.chr.read8(addr);
	      } else if (addr < 0x8000) {
	        return this.sram[addr - 0x6000];
	      } else {
	        return this.prg.read8(addr - 0x8000);
	      }
	    }
	  }, {
	    key: "write8",
	    value: function write8(addr, value) {
	      if (addr < 0x2000) {
	        this.chr.write8(addr, value);
	      } else if (addr < 0x8000) {
	        this.sram[addr - 0x6000] = value;
	      } else {
	        this.prg.switchBank(0, 0x4000, value & 0xf);
	      }
	    }
	  }]);
	
	  return UXROM;
	}(_Mapper3.default);
	
	exports.default = UXROM;

/***/ }),
/* 19 */
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	// https://nesdoug.com/2015/12/02/14-intro-to-sound/
	// https://wiki.nesdev.com/w/index.php/APU_Frame_Counter
	
	/**
	 * Is there anybody out there
	 */
	var APU = function () {
	  function APU() {
	    _classCallCheck(this, APU);
	  }
	
	  _createClass(APU, [{
	    key: "write8",
	    value: function write8(address, value) {}
	  }, {
	    key: "read8",
	    value: function read8() {
	      return 255;
	    }
	  }, {
	    key: "tick",
	    value: function tick() {}
	  }]);
	
	  return APU;
	}();
	
	exports.default = APU;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _constants = __webpack_require__(4);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/**
	 * The 8 controller buttons are mapped on 8bits
	 */
	var Controller = function () {
	  function Controller() {
	    _classCallCheck(this, Controller);
	
	    this.buttons = new Array(8).fill(0);
	    // Switch
	    this.strobe = 0;
	    this.i = 0;
	
	    // Welp ... Don't have a better idea
	    document.addEventListener("keydown", this.keyDown.bind(this));
	    document.addEventListener("keyup", this.keyUp.bind(this));
	  }
	
	  _createClass(Controller, [{
	    key: "_checkInput",
	    value: function _checkInput(event, value) {
	      switch (event.keyCode) {
	        case _constants.KEYBOARD_KEYS.START:
	          {
	            this.buttons[_constants.BUTTONS.START] = value;
	            break;
	          }
	        case _constants.KEYBOARD_KEYS.SELECT:
	          {
	            this.buttons[_constants.BUTTONS.SELECT] = value;
	            break;
	          }
	        case _constants.KEYBOARD_KEYS.A:
	          {
	            this.buttons[_constants.BUTTONS.A] = value;
	            break;
	          }
	        case _constants.KEYBOARD_KEYS.B:
	          {
	            this.buttons[_constants.BUTTONS.B] = value;
	            break;
	          }
	        case _constants.KEYBOARD_KEYS.LEFT:
	          {
	            this.buttons[_constants.BUTTONS.LEFT] = value;
	            event.preventDefault();
	            break;
	          }
	        case _constants.KEYBOARD_KEYS.UP:
	          {
	            this.buttons[_constants.BUTTONS.UP] = value;
	            event.preventDefault();
	            break;
	          }
	        case _constants.KEYBOARD_KEYS.RIGHT:
	          {
	            this.buttons[_constants.BUTTONS.RIGHT] = value;
	            event.preventDefault();
	            break;
	          }
	        case _constants.KEYBOARD_KEYS.DOWN:
	          {
	            this.buttons[_constants.BUTTONS.DOWN] = value;
	            event.preventDefault();
	            break;
	          }
	      }
	    }
	  }, {
	    key: "keyDown",
	    value: function keyDown(event) {
	      this._checkInput(event, 1);
	    }
	  }, {
	    key: "keyUp",
	    value: function keyUp(event) {
	      this._checkInput(event, 0);
	    }
	  }, {
	    key: "write8",
	    value: function write8(value) {
	      this.strobe = value;
	      if ((this.strobe & 1) === 1) {
	        this.i = 0;
	      }
	    }
	  }, {
	    key: "read8",
	    value: function read8() {
	      var value = this.buttons[this.i];
	      this.i++;
	
	      return value;
	    }
	  }]);
	
	  return Controller;
	}();
	
	exports.default = Controller;

/***/ }),
/* 21 */
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	exports.isObject = isObject;
	exports.mergeDeep = mergeDeep;
	
	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	
	// From stackoverflow https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge
	
	/**
	 * Simple object check.
	 * @param item
	 * @returns {boolean}
	 */
	function isObject(item) {
	  return item && (typeof item === "undefined" ? "undefined" : _typeof(item)) === "object" && !Array.isArray(item);
	}
	
	/**
	 * Deep merge two objects.
	 * @param target
	 * @param ...sources
	 */
	function mergeDeep(target) {
	  for (var _len = arguments.length, sources = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	    sources[_key - 1] = arguments[_key];
	  }
	
	  if (!sources.length) return target;
	  var source = sources.shift();
	
	  if (isObject(target) && isObject(source)) {
	    for (var key in source) {
	      if (isObject(source[key])) {
	        if (!target[key]) Object.assign(target, _defineProperty({}, key, {}));
	        mergeDeep(target[key], source[key]);
	      } else {
	        Object.assign(target, _defineProperty({}, key, source[key]));
	      }
	    }
	  }
	
	  return mergeDeep.apply(undefined, [target].concat(sources));
	}

/***/ }),
/* 22 */
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Notifier = function () {
	  function Notifier() {
	    _classCallCheck(this, Notifier);
	
	    this.observers = [];
	  }
	
	  _createClass(Notifier, [{
	    key: "addObserver",
	    value: function addObserver(obs) {
	      this.observers.push(obs);
	    }
	  }, {
	    key: "removeObserver",
	    value: function removeObserver(obs) {
	      this.observers = this.observers.filter(function (i) {
	        return i !== obs;
	      });
	    }
	  }, {
	    key: "notifyObservers",
	    value: function notifyObservers(t, e) {
	      this.observers.forEach(function (obs) {
	        return obs.notify(t, e);
	      });
	    }
	  }]);
	
	  return Notifier;
	}();
	
	exports.default = Notifier;

/***/ }),
/* 23 */
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/**
	 * Helper to encapsulate throttling logic
	 */
	var Throttle = function () {
	  function Throttle(fps) {
	    _classCallCheck(this, Throttle);
	
	    this.fpsInterval = 1000 / fps;
	    this.now = null;
	    this.elapsed = null;
	    this.then = null;
	  }
	
	  _createClass(Throttle, [{
	    key: "isThrottled",
	    value: function isThrottled() {
	      this.now = Date.now();
	      this.elapsed = this.now - this.then;
	
	      if (this.elapsed > this.fpsInterval) {
	        this.then = this.now - this.elapsed % this.fpsInterval;
	        return false;
	      }
	      return true;
	    }
	  }]);
	
	  return Throttle;
	}();
	
	exports.default = Throttle;

/***/ })
/******/ ])
});
;
//# sourceMappingURL=nes.js.map