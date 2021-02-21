# Corohohonavirus - The Game

This is a simple 2D game, where you play as a medical elf, vacinating other elves to tackle the corohohonavirus.
You can play the game at [corohohonavirus.com](http://corohohonavirus.com). The game is still in the early stages of development.
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.0.

## TODO:

- Limit too many refill stations spawning off-screen (P1)
- Limit too many max elves spawning off-screen (P1)
- Implement destination/time target (P1)
- Calculate the R rate, display on screen (P1)
- Text typing animation for dialogue (P1)
- Write the story (P2)
- Add Sound Spatial Effects (P2)
- Implement a more propper pause feature, automatically triggered by loss of window focus (P2)
- Introduce anti-vax character (P3)
- Make elves partner socialise, perhaps talk
- Make elves cough
- Add particle splash for newly infected elf
- Stop infected elves from sprinting

## BUGS:

- Not convinced Elves are being removed from screen
- Footprints dissapear intantly if an elf despawns (need to be referenced globally)
- Refill Stations spawns and despawns are visible in viewport due to their size

## IDEAS:

- Elf villages, Elf jobs, workshops, Pubs and the like
- Pathways, Fountains, lampposts and decorations

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.
