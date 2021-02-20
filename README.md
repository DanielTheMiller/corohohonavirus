# Corohohonavirus - The Game

This is a simple 2D game, where you play as a medical elf, vacinating other elves to tackle the corohohonavirus.
You can play the game at [corohohonavirus.com](http://corohohonavirus.com). The game is still in the early stages of development.
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.0.

## TODO:

- Write the story
- Add Sound Spatial Effects
- Limit too many refill stations spawning off-screen
- Limit too many max elves spawning off-screen
- Implement a more propper pause feature
- Implement destination/time target in order to facilitate online play down the road
- Calculate the R rate
- Introduce anti-vax character
- Text typing animation for dialogue
- Ensure speed of play is normalised
- Make elves partner socialise, perhaps talk
- Make elves cough
- Add particle splash for newly infected elf

## BUGS:

- Footprints dissapear intantly if an elf despawns (need to be referenced globally)
- Refill Stations spawns and despawns are visible in viewport due to their size
- Make projectiles face in the right direction

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.
