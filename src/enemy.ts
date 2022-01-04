import * as ECS from '../libs/pixi-ecs';
import { EnemyVariant, MessageActions, SCORE_FOR_ENEMY_HUGE, SCORE_FOR_ENEMY_LARGE, SCORE_FOR_ENEMY_MEDIUM, SCORE_FOR_ENEMY_SMALL } from './constants';
import { Factory } from './factory';
import { EnemyState } from './state-structs';

export class Enemy extends ECS.Component<EnemyState> {

  onUpdate() {
    this._checkCollisions();
  }

  private _checkCollisions() {
    let lasers = this.scene.findObjectsByTag('laser');
    for (let i = 0; i < lasers.length; i++) {
      if (this._collidesWith(lasers[i])) {
        this._removeLaserSprite(lasers[i].name);
        this.finish();
        this.sendMessage(MessageActions.ADD_SCORE, { toAdd: this._getScoreForEnemy(this.props.variant) });
        return;
      }
    }
    let playerSprite = this.scene.findObjectByName('player');
    if (playerSprite && this._collidesWith(playerSprite)) {
      playerSprite.parent.removeChild(playerSprite);
      let playerComponent = this.scene.stage.findComponentByName('player');
      if (playerComponent) {
        Factory.getInstance().spawnExplosion(this.scene, { ...playerComponent.props.position, angle: 0 });
        playerComponent.finish();
      }
      Factory.getInstance().createPlayer(this.scene);
      this.finish();
      this.sendMessage(MessageActions.REMOVE_LIFE);
      return;
    }
  }

  private _collidesWith(other: ECS.Container): boolean {
    let ownBounds = this.scene.findObjectByName(this.props.spriteName).getBounds();
    let otherBounds = other.getBounds();
    return ownBounds.x + ownBounds.width > otherBounds.x &&
      ownBounds.x < otherBounds.x + otherBounds.width &&
      ownBounds.y + ownBounds.height > otherBounds.y &&
      ownBounds.y < otherBounds.y + otherBounds.height;
  }

  private _removeLaserSprite(spriteName: string) {
    let laserSprite = this.scene.findObjectByName(spriteName);
    if (laserSprite) {
      laserSprite.parent.removeChild(laserSprite);
    }
  }

  private _getScoreForEnemy(variant: EnemyVariant): number {
    switch (variant) {
      case EnemyVariant.SMALL:
        return SCORE_FOR_ENEMY_SMALL;
      case EnemyVariant.MEDIUM:
        return SCORE_FOR_ENEMY_MEDIUM;
      case EnemyVariant.LARGE:
        return SCORE_FOR_ENEMY_LARGE;
      case EnemyVariant.HUGE:
        return SCORE_FOR_ENEMY_HUGE;
      default:
        break;
    }
  }

  onRemove() {
    let enemySprite = this.scene.findObjectByName(this.props.spriteName);
    if (enemySprite) {
      enemySprite.parent.removeChild(enemySprite);
    }
    Factory.getInstance().spawnExplosion(this.scene, { ...this.props.position, angle: 0 });
  }

}