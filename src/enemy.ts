import * as ECS from '../libs/pixi-ecs';
import { EnemyColor, EnemyVariant, ENEMY_SHOOTING_INTENSITY, LaserColor, LaserOrigin, MessageActions, SCORE_FOR_ENEMY_HUGE, SCORE_FOR_ENEMY_LARGE, SCORE_FOR_ENEMY_MEDIUM, SCORE_FOR_ENEMY_SMALL, Tag } from './constants';
import { Factory } from './factory';
import { GameStats } from './game-stats';
import { EnemyState } from './state-structs';

export class Enemy extends ECS.Component<EnemyState> {

  onInit(): void {
    this.props.intensity = ENEMY_SHOOTING_INTENSITY;
    this.props.nextSpawnTime = this._calculateNextShotTime();
  }

  onUpdate() {
    if (new Date() > this.props.nextSpawnTime) {
      let enemySprite = this.scene.findObjectByName(this.props.spriteName);
      if (enemySprite) {
        Factory.getInstance().spawnLaser(this.scene, this._getLaserColorForEnemy(), enemySprite as ECS.Sprite, LaserOrigin.ENEMY);
        this.props.lastSpawnTime = this.props.nextSpawnTime;
        this.props.nextSpawnTime = this._calculateNextShotTime();
      }
    }
    this._checkCollisions();
  }

  private _checkCollisions() {
    let lasers = this.scene.findObjectsByTag(Tag.LASER_PLAYER);
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
      let gameStatsComponent = this.scene.stage.findComponentByName('game-stats') as GameStats;
      if (gameStatsComponent && !gameStatsComponent.props.immortal) {
        playerSprite.parent.removeChild(playerSprite);
        let playerComponent = this.scene.stage.findComponentByName('player');
        if (playerComponent) {
          Factory.getInstance().spawnExplosion(this.scene, { ...playerComponent.props.position, angle: 0 });
          playerComponent.finish();
        }
        Factory.getInstance().createPlayer(this.scene);
        this.sendMessage(MessageActions.IMMORTALITY_ON);
        this.sendMessage(MessageActions.REMOVE_LIFE);
      }
      this.finish();
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

  private _getLaserColorForEnemy(): LaserColor {
    switch (this.props.color) {
      case EnemyColor.RED:
        return LaserColor.RED;
      case EnemyColor.PURPLE:
        return LaserColor.PURPLE;
      case EnemyColor.GREEN:
        return LaserColor.GREEN;
      case EnemyColor.ORANGE:
        return LaserColor.ORANGE;
      case EnemyColor.YELLOW:
        return LaserColor.YELLOW;
      default:
        break;
    }
  }

  private _calculateNextShotTime(): Date {
    let idealInterval = 60000 / this.props.intensity;
    let actualInterval = this.props.random.uniform(idealInterval * 0.2, idealInterval * 1.8);
    let date = new Date();
    date.setMilliseconds(date.getMilliseconds() + actualInterval);
    return date;
  }

  onRemove() {
    let enemySprite = this.scene.findObjectByName(this.props.spriteName);
    if (enemySprite) {
      enemySprite.parent.removeChild(enemySprite);
    }
    Factory.getInstance().spawnExplosion(this.scene, { ...this.props.position, angle: 0 });
  }

}