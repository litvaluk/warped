import * as ECS from '../../libs/pixi-ecs';
import * as PIXI from 'pixi.js';
import { MessageActions, PLAYER_IMMORTALITY_DURATION, PLAYER_IMMORTALITY_FLASHES, SHIELD_DURATION, STARTING_LASER_LEVEL, STARTING_LIVES, STARTING_SCORE, Tag } from '../constants';
import { MenuFactory } from '../factories/menuFactory';
import { PlayerComponent } from './player';
import { GameFactory } from '../factories/gameFactory';

export class GameStatsComponent extends ECS.Component {

  score = STARTING_SCORE;
  lives = STARTING_LIVES;
  laserLevel = STARTING_LASER_LEVEL;
  immortal = false;

  onInit(): void {
    super.onInit();
    this.name = 'game-stats';
    this.subscribe(MessageActions.ADD_LIFE);
    this.subscribe(MessageActions.REMOVE_LIFE);
    this.subscribe(MessageActions.ADD_SCORE);
    this.subscribe(MessageActions.IMMORTALITY_ON);
    this.subscribe(MessageActions.SHIELD_ON);
  }

  onMessage(msg: ECS.Message) {
    if (msg.action === MessageActions.ADD_LIFE) {
      if (this.lives < 5) {
        this._addLife();
      }
    } else if (msg.action === MessageActions.REMOVE_LIFE) {
      if (this.lives > 0) {
        this._removeLife();
      }
      if (this.lives === 0) {
        this.scene.callWithDelay(0, () => {
          this.scene.clearScene();
          MenuFactory.getInstance().loadGameOverStage(this.scene, this.score);
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
    this.lives += 1;
    GameFactory.getInstance().createLifeSprite(this.scene, this.lives);
  }

  private _removeLife() {
    const life = this.scene.findObjectByName(`life-${this.lives}`);
    life.parent.removeChild(life);
    this.lives -= 1;
  }

  private _addScore(toAdd: number) {
    this.score += toAdd;
    let scoreText = this.scene.stage.getChildByName('score-text') as PIXI.Text;
    scoreText.text = `${this.score}`;
  }

  private _startImmortality(shield: boolean) {
    let playerSprite = this.scene.findObjectByTag(Tag.PLAYER);
    if (playerSprite) {
      this.immortal = true;
      if (!shield) {
        this.scene.stage.addComponentAndRun(new ECS.ChainComponent()
          .beginRepeat(PLAYER_IMMORTALITY_FLASHES)
          .call(() => { playerSprite.alpha = 0.3 })
          .waitTime(1000 * PLAYER_IMMORTALITY_DURATION / PLAYER_IMMORTALITY_FLASHES / 2)
          .call(() => { playerSprite.alpha = 1 })
          .waitTime(1000 * PLAYER_IMMORTALITY_DURATION / PLAYER_IMMORTALITY_FLASHES / 2)
          .endRepeat()
          .call(() => {
            let playerComponent = playerSprite.findComponentByName('player') as PlayerComponent;
            if (playerComponent && !playerComponent.shieldActive) {
              this.sendMessage(MessageActions.IMMORTALITY_OFF)
              this.immortal = false;
            }
          })
        );
      } else {
        this.scene.stage.addComponentAndRun(new ECS.ChainComponent()
          .waitTime(1000 * SHIELD_DURATION)
          .call(() => {
            this.sendMessage(MessageActions.IMMORTALITY_OFF)
            this.immortal = false;
          })
        );
      }
    }
  }

}