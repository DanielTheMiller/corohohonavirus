# Corohohonavirus - The Game

This is a simple 2D game, where you play as a medical elf, vacinating other elves to tackle the corohohonavirus.
You can play the game at [corohohonavirus.com](http://corohohonavirus.com). The game is still in the early stages of development.
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.0.

## TODO:

- Make refill stations actionable
- Add Sound Spatial Effects
- Limit too many refill stations spawning off-screen
- Implement a more propper pause feature
- Implement destination/time target in order to facilitate online play down the road
- Calculate the R rate
- Introduce anti-vax character

## BUGS:

- Footprints dissapear intantly if an elf despawns (need to be referenced globally)
- Refill Stations spawns and despawns are visible in viewport due to their size
- Main elf's zIndex in relative to other elves is not correct
- Make projectiles face in the right direction

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.
