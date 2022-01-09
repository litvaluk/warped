import * as ECS from '../libs/pixi-ecs';
import { MenuFactory } from './factories/menuFactory';

export class GameLoader {

  loadGame(engine: ECS.Engine) {
    engine.app.loader
      .reset()
      // backgrounds
      .add('background', './assets/images/background/stars1.webp')
      // spaceships
      .add('player', './assets/images/spaceship/player.webp')
      .add('enemy-red-1', './assets/images/spaceship/red1.webp')
      .add('enemy-red-2', './assets/images/spaceship/red2.webp')
      .add('enemy-red-3', './assets/images/spaceship/red3.webp')
      .add('enemy-red-4', './assets/images/spaceship/red4.webp')
      .add('enemy-purple-1', './assets/images/spaceship/purple1.webp')
      .add('enemy-purple-2', './assets/images/spaceship/purple2.webp')
      .add('enemy-purple-3', './assets/images/spaceship/purple3.webp')
      .add('enemy-purple-4', './assets/images/spaceship/purple4.webp')
      .add('enemy-green-1', './assets/images/spaceship/green1.webp')
      .add('enemy-green-2', './assets/images/spaceship/green2.webp')
      .add('enemy-green-3', './assets/images/spaceship/green3.webp')
      .add('enemy-green-4', './assets/images/spaceship/green4.webp')
      .add('enemy-orange-1', './assets/images/spaceship/orange1.webp')
      .add('enemy-orange-2', './assets/images/spaceship/orange2.webp')
      .add('enemy-orange-3', './assets/images/spaceship/orange3.webp')
      .add('enemy-orange-4', './assets/images/spaceship/orange4.webp')
      .add('enemy-yellow-1', './assets/images/spaceship/yellow1.webp')
      .add('enemy-yellow-2', './assets/images/spaceship/yellow2.webp')
      .add('enemy-yellow-3', './assets/images/spaceship/yellow3.webp')
      .add('enemy-yellow-4', './assets/images/spaceship/yellow4.webp')
      // meteorites
      .add('meteorite-white', './assets/images/meteorite/white.webp')
      .add('meteorite-gray', './assets/images/meteorite/gray.webp')
      // lasers
      .add('laser-blue', './assets/images/laser/blue.webp')
      .add('laser-red', './assets/images/laser/red.webp')
      .add('laser-purple', './assets/images/laser/purple.webp')
      .add('laser-green', './assets/images/laser/green.webp')
      .add('laser-orange', './assets/images/laser/orange.webp')
      .add('laser-yellow', './assets/images/laser/yellow.webp')
      // ui
      .add('heart', './assets/images/ui/heart.webp')
      .add('key', './assets/images/ui/key.webp')
      .add('left-click', './assets/images/ui/left-click.webp')
      // collectables
      .add('collectable-life', './assets/images/collectable/life.webp')
      .add('collectable-laser', './assets/images/collectable/laser.webp')
      .add('collectable-shield', './assets/images/collectable/shield.webp')
      // explosion animation
      .add('explosion', './assets/images/explosion/explosion.webp')
      // shield
      .add('shield', './assets/images/shield/shield.webp')
      // sfx
      .add('laser-sfx', './assets/sounds/laser.mp3')
      .add('explosion-sfx', './assets/sounds/explosion.mp3')
      .add('pickup-sfx', './assets/sounds/pickup.mp3')
      .load(() => this.onAssetsLoaded(engine));
  }

  private onAssetsLoaded(engine: ECS.Engine) {
    MenuFactory.getInstance().loadMenuStage(engine.scene);
  }

}