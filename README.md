# Matter Destroyer

## Description
- Genre: Space Shooter
- Library: PixiJS
- Space: 2D view from the top, player cannot move outside of the screen
- Objects: player (spaceship), enemies, meteorites, power ups
- Actions:
  - moving within the boundaries of the screen
  - shooting and destroying enemies, meteorites
  - picking up power ups
- Rules
  - the goal is to obtain as much score points as possible by destroying enemies
  - if player runs out of lives, the game ends
  - player can move with WASD and shoot with left mouse click towards the current mouse position
  - at the start, player has 3 lives and shoots with basic projectiles
  - player can sometimes get another life or projectile/weapon upgrades from fallen enemies or destroyed meteorites
  - the enemies gets progressively stronger and spawn more based on elapsed time
- The main mechanic
  - easy AI behavior - enemies shooting on the player and avoiding collisions
  - particle systems - enemies, meteorites exploding, power up pickups

## How to run this project
- the project is powered by parcelJS bundler, TypeScript, PixiJS and ECSLite libraries
- execute `npm install`
- execute `npm run dev`
- go to `localhost:1234` and find your template there

## Deployment
- run `npm run deploy` and find your project in the `build` folder

