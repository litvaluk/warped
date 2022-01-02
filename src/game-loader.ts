import * as ECS from '../libs/pixi-ecs';
import { Factory } from './factory';

export class GameLoader {

  loadGame(engine: ECS.Engine) {
    engine.app.loader
      .reset()
      .add('player', './assets/spaceship/player.png')
      .add('background', './assets/background/stars1.png')
      .add('bullet', './assets/laser/blue.png')
      .load(() => this.onAssetsLoaded(engine));
  }

  private onAssetsLoaded(engine: ECS.Engine) {
    Factory.getInstance().loadScene(engine.scene);
  }

}