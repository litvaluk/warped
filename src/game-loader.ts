import * as ECS from '../libs/pixi-ecs';
import { Factory } from './factory';

export class GameLoader {

  loadGame(engine: ECS.Engine) {
    engine.app.loader
      .reset()

      // backgrounds
      .add('background', './assets/background/stars1.png')
      // spaceships
      .add('player', './assets/spaceship/player.png')
      .add('enemy-red-1', './assets/spaceship/red1.png')
      .add('enemy-red-2', './assets/spaceship/red2.png')
      .add('enemy-red-3', './assets/spaceship/red3.png')
      .add('enemy-red-4', './assets/spaceship/red4.png')
      .add('enemy-purple-1', './assets/spaceship/purple1.png')
      .add('enemy-purple-2', './assets/spaceship/purple2.png')
      .add('enemy-purple-3', './assets/spaceship/purple3.png')
      .add('enemy-purple-4', './assets/spaceship/purple4.png')
      .add('enemy-green-1', './assets/spaceship/green1.png')
      .add('enemy-green-2', './assets/spaceship/green2.png')
      .add('enemy-green-3', './assets/spaceship/green3.png')
      .add('enemy-green-4', './assets/spaceship/green4.png')
      .add('enemy-orange-1', './assets/spaceship/orange1.png')
      .add('enemy-orange-2', './assets/spaceship/orange2.png')
      .add('enemy-orange-3', './assets/spaceship/orange3.png')
      .add('enemy-orange-4', './assets/spaceship/orange4.png')
      .add('enemy-yellow-1', './assets/spaceship/yellow1.png')
      .add('enemy-yellow-2', './assets/spaceship/yellow2.png')
      .add('enemy-yellow-3', './assets/spaceship/yellow3.png')
      .add('enemy-yellow-4', './assets/spaceship/yellow4.png')
      // lasers
      .add('laser-blue', './assets/laser/blue.png')
      .add('laser-red', './assets/laser/red.png')
      .add('laser-purple', './assets/laser/purple.png')
      .add('laser-green', './assets/laser/green.png')
      .add('laser-orange', './assets/laser/orange.png')
      .add('laser-yellow', './assets/laser/yellow.png')
      // ui
      .add('heart', './assets/ui/heart.png')

      .load(() => this.onAssetsLoaded(engine));
  }

  private onAssetsLoaded(engine: ECS.Engine) {
    Factory.getInstance().loadScene(engine.scene);
  }

}