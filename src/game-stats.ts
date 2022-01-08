import * as ECS from '../libs/pixi-ecs';
import * as PIXI from 'pixi.js';
import { MessageActions, PLAYER_IMMORTALITY_DURATION, PLAYER_IMMORTALITY_FLASHES, SHIELD_DURATION, Tag } from './constants';
import { Factory } from './factory';
import { GameStatsState } from './state-structs';
import { Player } from './player';

export class GameStats extends ECS.Component<GameStatsState> {

  onInit(): void {
    super.onInit();
    this.subscribe(MessageActions.ADD_LIFE);
    this.subscribe(MessageActions.REMOVE_LIFE);
    this.subscribe(MessageActions.ADD_SCORE);
    this.subscribe(MessageActions.IMMORTALITY_ON);
    this.subscribe(MessageActions.SHIELD_ON);
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
      if (this.props.lives === 0) {
        this.scene.callWithDelay(0, () => {
          this.scene.clearScene();
          Factory.getInstance().loadGameOverStage(this.scene, this.props.score);
        });
      }
    } else if (msg.action === MessageActions.ADD_SCORE) {
      this._addScore(msg.data.toAdd);
    } else if (msg.action === MessageActions.IMMORTALITY_ON) {
      this._startImmortality(false);
    } else if (msg.action === MessageActions.SHIELD_ON) {
      this._startImmortality(true);
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

  private _startImmortality(shield: boolean) {
    let playerSprite = this.scene.findObjectByTag(Tag.PLAYER);
    if (playerSprite) {
      this.props.immortal = true;
      if (!shield) {
        this.scene.stage.addComponentAndRun(new ECS.ChainComponent()
          .beginRepeat(PLAYER_IMMORTALITY_FLASHES)
          .call(() => { playerSprite.alpha = 0.3 })
          .waitTime(1000 * PLAYER_IMMORTALITY_DURATION / PLAYER_IMMORTALITY_FLASHES / 2)
          .call(() => { playerSprite.alpha = 1 })
          .waitTime(1000 * PLAYER_IMMORTALITY_DURATION / PLAYER_IMMORTALITY_FLASHES / 2)
          .endRepeat()
          .call(() => {
            let playerComponent = this.scene.stage.findComponentByName('player') as Player;
            if (playerComponent && !playerComponent.props.shieldActive) {
              this.sendMessage(MessageActions.IMMORTALITY_OFF)
              this.props.immortal = false;
            }
          })
        );
      } else {
        this.scene.stage.addComponentAndRun(new ECS.ChainComponent()
          .waitTime(1000 * SHIELD_DURATION)
          .call(() => {
            this.sendMessage(MessageActions.IMMORTALITY_OFF)
            this.props.immortal = false;
          })
        );
      }
    }
  }

}