# NES
> A Javascript NES Emulator

This is my implementation of the NES console, which emulates both the original CPU and PPU.

This git repo comes without a frontend as I wanted it to be as bare as possible.
I started implementing a UI using React.js, you can find the source code [here](https://github.com/fredericcambon/react-nes).

## Examples

### Sketchfab Viewer API

https://github.com/fredericcambon/sketchfab-viewer-api-nes

This was made only for fun, to show it is possible to make this emulator run and displayed on a 3D model.
It uses Sketchfab and its viewer API.

### Demo with React

http://grun7.com:8080/

## Installing

### From NPM

```shell
npm install nes-emulator
```

### Locally

Clone the repo and

```shell
npm install
npm run build
```

## Quick Start

The library uses an observer pattern to signal when frames are ready and other stuff.
Here's a quick example of how to use this library.

```
import { Console } from "nes-emulator";

class NES {
    constructor() {
        this.console = new Console();

        // Will notify `this.notify` upon events
        this.console.addObserver( this );

        this.console.loadROM( `romData` );
        this.console.start();
    }

    notify(t, e) {
        switch (t) {
            case 'frame-ready': {
                // Draw the frame using `e` (Uint8Array)
            }
        }
    }

}
```

## Features

* Fully functional CPU
* Functional PPU
* UXROM, NROM, MMC1, MMC3 mappers

## TODO

The emulator is missing key features such as

* Save/Load
* Sound
* Additional mappers ...
* Tests
* Make list of playable games

And needs improvement for

* perfs
* Cycle accurate CPU
* Some PPU glitches

## Documentation

TODO WIP

### Signals triggered by the Console

#### frame-ready

Fired at a 60 fps rate when a frame is ready, provides
a 256x240x4 byte array containing the RGB colors to display.

#### nes-reset

Fired when a game is loaded and the console restarts.

## Contributing

I'm still actively working on it but would welcome your PRs. Do not hesitate to fork
the repository and h4ck around.

## Thanks

Special thanks for the amazing http://nesdev.com/ and all their technical resources
without which this project would not have been possible.

## License

```
NES Emulator
Copyright (C) 2017 Frédéric Cambon

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
```
