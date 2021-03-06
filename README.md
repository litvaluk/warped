# Warped
The game is deployed at [https://warped.lukaslitvan.cz/](https://warped.lukaslitvan.cz/).

## Description
- Genre: Space Shooter
- Library: PixiJS
- Space: 2D view from the top, player cannot move outside of the screen
- Objects: player (spaceship), enemies, meteorites, power ups
- Actions:
  - moving within the boundaries of the screen
  - shooting and destroying enemies, meteorites
  - picking up lives, laser upgrades, shield
- Rules
  - the goal is to obtain as much score points as possible by destroying enemies/meteorites
  - if player runs out of lives, the game ends
  - player can move with WASD and shoot with left mouse click towards the current mouse position
  - at the start, player has 3 lives and shoots with basic laser
  - player can sometimes get another life, laser upgrades or a shield for 10 seconds from destroyed meteorites
  - the enemies spawn more based on elapsed time

## Diagram
![Diagram](./diagram.png "Diagram")

## How to run
- the project is powered by ParcelJS, TypeScript, PixiJS and ECSLite libraries
- install [NodeJS](https://nodejs.org/en/download/)
- execute `npm install`
- execute `npm run dev`
- go to `localhost:1234` and find the project there

## Other scripts
- lint: run `npm run lint` to see if there are linting errors. They can be fixed by using `npm run lint -- --fix`
- compilation test: run `npm run compile-test` to see if there are any TypeScript errors
- deployment: run `npm run deploy` and find the deployed project in the `build` folder

## Libraries
### aph-math
- Math library with functions for pathfinding, perlin noise, steering behavior, etc. Also, it includes structures such as heap, linked-list, and priority queue
- this library is used by the example repo, the link of which you can find on the [web](https://aphgames.io/docs/niaph/intro)

### pixi-ecs
- ECSLite library for component architecture. The documentation can be found on the [web](https://aphgames.io/docs/niaph/tutorials/ecsdocs)

## ParcelJS and Building process
- [parcelJS](https://parceljs.org/) is a simple bundler that requires minimum configuration (alternative to webpack)

## Sources
### Images
- [Background](https://opengameart.org/content/seamless-space-backgrounds)
- [Spaceships](https://opengameart.org/content/2d-space-ships-pack-war-antuz-race)
- [Lasers](https://opengameart.org/content/assets-free-laser-bullets-pack-2020)
- [Meteorites]()
- [Explosion](https://www.seekpng.com/ipng/u2e6r5y3r5y3w7y3_fire2-rpg-maker-mv-explosion-animation/)
- [Shield](https://opengameart.org/content/shield-effect)
### Sounds
- [Laser](https://opengameart.org/content/4-projectile-launches)
- [Explosion](https://opengameart.org/content/2-high-quality-explosions)
- [Pickup](https://opengameart.org/content/plingy-coin)