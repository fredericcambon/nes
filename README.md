![Build](https://api.travis-ci.com/fredericcambon/nes.svg?branch=master)

# OnaNES (Oh No Another NES Emulator)

_In Javascript !_

This is my implementation of the NES console, which emulates both the original CPU and PPU.

This git repo comes without a frontend as I wanted it to be as bare as possible.
I started implementing a UI using React.js, you can find the source code [here](https://github.com/fredericcambon/react-nes).

## Getting Started

### Installing

#### NPM

```shell
npm install nes-emulator
```

#### Local

Clone the repo and

```shell
npm install
npm run build
```

### How to Use

The library uses an observer pattern to signal events (frames ready, reset, pause ...).

Here's an example of how to use this library.

```
import { Console } from "nes-emulator";

class NES {
    constructor() {
        this.console = new Console();

        // Will notify `this.notify` upon events
        this.console.addObserver( this );

        // Here romData is the content of a .nes ROM
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

## Examples

### Sketchfab Viewer API (http://grun7.com/sketchfab-viewer-api-nes/)

![Example1](https://i.imgur.com/Znq5kHSl.png)


This was made only for fun, to show it is possible to make this emulator run and displayed on a 3D model.
It uses Sketchfab and its viewer API.

### Demo with React (https://onanes.herokuapp.com/)

![Example 2](https://i.imgur.com/zm9bjGNl.png)

UI using ReactJS

## Features

### Done

* Fully functional CPU
* Functional PPU
* UXROM, NROM, CNROM, MMC1, MMC3 mappers
* Save/Load

### In Progress

* Additional mappers
* Tests

### TODO

The emulator is missing features such as

* Sound
* Make list of playable games

And needs improvement for

* Cycle accurate CPU
* Some PPU glitches

## API Documentation

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

## Acknowledgments

Special thanks for the amazing http://nesdev.com/ and all their technical resources
without which this project would not have been possible.

## License

```
NES Emulator
Copyright (C) 2018 Frédéric Cambon

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
