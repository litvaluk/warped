import * as ECS from '../libs/pixi-ecs';
import { MessageActions } from './constants';
import { Factory } from './factory';
import { GameStatsState } from './state-structs';

export class GameStats extends ECS.Component<GameStatsState> {

  onInit(): void {
    super.onInit();
    this.subscribe(MessageActions.ADD_LIFE);
    this.subscribe(MessageActions.REMOVE_LIFE);
  }

  onMessage(msg: ECS.Message) {
    if (msg.action === MessageActions.ADD_LIFE) {
      if (this.props.lives < 5) {
        this._addLife();
      }
    } else if (msg.action === MessageActions.REMOVE_LIFE) {
      if (this.props.lives > 0) {
        this._removeLife();
      }
    }
  }

  private _addLife() {
    this.props.lives += 1;
    this.scene.stage.addChild(Factory.getInstance().createLifeSprite(this.props.lives));
  }

  private _removeLife() {
    const life = this.scene.findObjectByName(`life-${this.props.lives}`);
    life.parent.removeChild(life);
    this.props.lives -= 1;
  }

}