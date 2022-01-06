import * as ECS from '../libs/pixi-ecs';
import * as PIXI from 'pixi.js';
import { MessageActions, PLAYER_IMMORTALITY_DURATION, PLAYER_IMMORTALITY_FLASHES, Tag } from './constants';
import { Factory } from './factory';
import { GameStatsState } from './state-structs';

export class GameStats extends ECS.Component<GameStatsState> {

  private _lastImmortalityStartDate: Date;

  onInit(): void {
    super.onInit();
    this.subscribe(MessageActions.ADD_LIFE);
    this.subscribe(MessageActions.REMOVE_LIFE);
    this.subscribe(MessageActions.ADD_SCORE);
    this.subscribe(MessageActions.IMMORTALITY_ON);
    this.subscribe(MessageActions.IMMORTALITY_OFF);
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
    } else if (msg.action === MessageActions.ADD_SCORE) {
      this._addScore(msg.data.toAdd);
    } else if (msg.action === MessageActions.IMMORTALITY_ON) {
      this.props.immortal = true;
      this._lastImmortalityStartDate = new Date();
      this._startImmortality();
    }
  }

  onUpdate(): void {
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

  private _addScore(toAdd: number) {
    this.props.score += toAdd;
    let scoreText = this.scene.stage.getChildByName('score-text') as PIXI.Text;
    scoreText.text = `${this.props.score}`;
  }

  private _startImmortality() {
    let playerSprite = this.scene.findObjectByTag(Tag.PLAYER);
    if (playerSprite) {
      this.scene.stage.addComponentAndRun(new ECS.ChainComponent()
        .beginRepeat(PLAYER_IMMORTALITY_FLASHES)
        .call(() => { playerSprite.alpha = 0.3 })
        .waitTime(1000 * PLAYER_IMMORTALITY_DURATION / PLAYER_IMMORTALITY_FLASHES / 2)
        .call(() => { playerSprite.alpha = 1 })
        .waitTime(1000 * PLAYER_IMMORTALITY_DURATION / PLAYER_IMMORTALITY_FLASHES / 2)
        .endRepeat()
        .call(() => {
          this.sendMessage(MessageActions.IMMORTALITY_OFF)
          this.props.immortal = false;
        })
      );
    }
  }

}