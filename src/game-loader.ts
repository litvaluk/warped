import * as ECS from '../libs/pixi-ecs';
import { Factory } from './factory';

export class GameLoader {
  
  loadGame(engine: ECS.Engine) {
    engine.app.loader
      .reset()
      .add('player', './assets/player.png')
      .add('background', './assets/background.png')
      .add('bullet', './assets/bullet.png')
      .load(() => this.onAssetsLoaded(engine));
  }

  private onAssetsLoaded(engine: ECS.Engine) {
    Factory.getInstance().loadScene(engine.scene);
  }

}