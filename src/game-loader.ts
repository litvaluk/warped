import * as ECS from '../libs/pixi-ecs';
import { Factory } from './factory';

export class GameLoader {

  loadGame(engine: ECS.Engine) {
    engine.app.loader
      .reset()

      // backgrounds
      .add('background', './assets/background/stars1.webp')
      // spaceships
      .add('player', './assets/spaceship/player.webp')
      .add('enemy-red-1', './assets/spaceship/red1.webp')
      .add('enemy-red-2', './assets/spaceship/red2.webp')
      .add('enemy-red-3', './assets/spaceship/red3.webp')
      .add('enemy-red-4', './assets/spaceship/red4.webp')
      .add('enemy-purple-1', './assets/spaceship/purple1.webp')
      .add('enemy-purple-2', './assets/spaceship/purple2.webp')
      .add('enemy-purple-3', './assets/spaceship/purple3.webp')
      .add('enemy-purple-4', './assets/spaceship/purple4.webp')
      .add('enemy-green-1', './assets/spaceship/green1.webp')
      .add('enemy-green-2', './assets/spaceship/green2.webp')
      .add('enemy-green-3', './assets/spaceship/green3.webp')
      .add('enemy-green-4', './assets/spaceship/green4.webp')
      .add('enemy-orange-1', './assets/spaceship/orange1.webp')
      .add('enemy-orange-2', './assets/spaceship/orange2.webp')
      .add('enemy-orange-3', './assets/spaceship/orange3.webp')
      .add('enemy-orange-4', './assets/spaceship/orange4.webp')
      .add('enemy-yellow-1', './assets/spaceship/yellow1.webp')
      .add('enemy-yellow-2', './assets/spaceship/yellow2.webp')
      .add('enemy-yellow-3', './assets/spaceship/yellow3.webp')
      .add('enemy-yellow-4', './assets/spaceship/yellow4.webp')
      // meteorites
      .add('meteorite-white', './assets/meteorite/white.webp')
      .add('meteorite-gray', './assets/meteorite/gray.webp')
      // lasers
      .add('laser-blue', './assets/laser/blue.webp')
      .add('laser-red', './assets/laser/red.webp')
      .add('laser-purple', './assets/laser/purple.webp')
      .add('laser-green', './assets/laser/green.webp')
      .add('laser-orange', './assets/laser/orange.webp')
      .add('laser-yellow', './assets/laser/yellow.webp')
      // ui
      .add('heart', './assets/ui/heart.webp')
      // collectables
      .add('collectable-life', './assets/collectable/life.webp')
      .add('collectable-laser', './assets/collectable/laser.webp')
      .add('collectable-shield', './assets/collectable/shield.webp')
      // explosion animation
      .add('explosion', './assets/explosion/explosion.webp')
      // shield
      .add('shield', './assets/shield/shield.webp')

      .load(() => this.onAssetsLoaded(engine));
  }

  private onAssetsLoaded(engine: ECS.Engine) {
    Factory.getInstance().loadGlobalComponents(engine.scene);
    Factory.getInstance().loadGameStage(engine.scene);
  }

}