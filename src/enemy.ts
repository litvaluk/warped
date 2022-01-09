import { Random } from '../libs/aph-math';
import * as ECS from '../libs/pixi-ecs';
import { EnemyColor, EnemyVariant, ENEMY_MOVE_DIRECTION_CHANGE_INTENSITY, ENEMY_SHOOTING_INTENSITY, ENEMY_SPEED, LaserColor, LaserOrigin, MessageActions, Position, SCENE_HEIGHT, SCENE_WIDTH, SCORE_FOR_ENEMY_HUGE, SCORE_FOR_ENEMY_LARGE, SCORE_FOR_ENEMY_MEDIUM, SCORE_FOR_ENEMY_SMALL, Tag } from './constants';
import { Factory } from './factory';
import { GameStats } from './game-stats';
import { getAngleRad } from './helper';
import { EnemyState } from './state-structs';

export class Enemy extends ECS.Component<EnemyState> {

  private _random = new Random(Date.now());
  private _nextDirectionChangeDate: Date;
  private _direction: number;

  onInit(): void {
    this.props.intensity = ENEMY_SHOOTING_INTENSITY;
    this.props.nextSpawnTime = this._calculateNextShotTime();
    this._nextDirectionChangeDate = this._calculateNextDirectionChangeDate();
    let playerSprite = this.scene.findObjectByTag(Tag.PLAYER);
    if (playerSprite) {
      this._direction = getAngleRad(this.props.position.x, this.props.position.y, playerSprite.x, playerSprite.y);
    }
  }

  onUpdate() {
    if (new Date() > this.props.nextSpawnTime) {
      this._shoot();
    }
    if (new Date() > this._nextDirectionChangeDate) {
      this._nextDirectionChangeDate = this._calculateNextDirectionChangeDate();
      this._direction = Math.random() * 2 * Math.PI;
    }
    this._updateAngle();
    this._move();
    this._checkCollisions();
  }

  private _isOutOfScreen(container: ECS.Container): boolean {
    return this.props.position.x > SCENE_WIDTH + container.width ||
      this.props.position.x < 0 - container.width ||
      this.props.position.y > SCENE_HEIGHT + container.height ||
      this.props.position.y < 0 - container.height;
  }

  private _checkCollisions() {
    let lasers = this.scene.findObjectsByTag(Tag.LASER_PLAYER);
    for (let i = 0; i < lasers.length; i++) {
      if (this._collidesWith(lasers[i])) {
        this._removeLaserSprite(lasers[i].name);
        this.sendMessage(MessageActions.ADD_SCORE, { toAdd: this._getScoreForEnemy(this.props.variant) });
        Factory.getInstance().spawnExplosion(this.scene, { ...this.props.position, angle: 0 });
        this.finish();
        return;
      }
    }
    let playerSprite = this.scene.findObjectByName('player');
    if (playerSprite && this._collidesWith(playerSprite)) {
      let gameStatsComponent = this.scene.stage.findComponentByName('game-stats') as GameStats;
      if (gameStatsComponent && !gameStatsComponent.props.immortal) {
        let playerComponent = playerSprite.findComponentByName('player');
        if (playerComponent) {
          Factory.getInstance().spawnExplosion(this.scene, { ...playerComponent.props.position, angle: 0 }, null, false);
          playerComponent.finish();
        }
        Factory.getInstance().createPlayer(this.scene);
        this.sendMessage(MessageActions.IMMORTALITY_ON);
        this.sendMessage(MessageActions.REMOVE_LIFE);
      }
      Factory.getInstance().spawnExplosion(this.scene, { ...this.props.position, angle: 0 });
      this.finish();
      return;
    }
    const enemySprite = this.scene.findObjectByName(this.props.spriteName);
    if (enemySprite && this._isOutOfScreen(enemySprite)) {
      this.finish();
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

  private _shoot() {
    let enemySprite = this.scene.findObjectByName(this.props.spriteName);
    if (enemySprite) {
      const pos: Position = {
        x: enemySprite.x + Math.cos(enemySprite.rotation - Math.PI / 2) * enemySprite.getBounds().width / 1.7,
        y: enemySprite.y + Math.sin(enemySprite.rotation - Math.PI / 2) * enemySprite.getBounds().height / 1.7,
        angle: enemySprite.rotation
      }
      Factory.getInstance().spawnLaser(this.scene, this._getLaserColorForEnemy(), pos, LaserOrigin.ENEMY);
      this.props.lastSpawnTime = this.props.nextSpawnTime;
      this.props.nextSpawnTime = this._calculateNextShotTime();
    }
  }

  private _updateAngle() {
    let enemySprite = this.scene.findObjectByName(this.props.spriteName);
    let playerSprite = this.scene.findObjectByTag(Tag.PLAYER);
    if (enemySprite && playerSprite) {
      enemySprite.rotation = getAngleRad(this.props.position.x, this.props.position.y, playerSprite.x, playerSprite.y);
      this.props.position.angle = enemySprite.rotation;
    }
  }

  private _move() {
    const deltaX = ENEMY_SPEED * Math.cos(this._direction - Math.PI / 2);
    const deltaY = ENEMY_SPEED * Math.sin(this._direction - Math.PI / 2);
    const newX = this.props.position.x + deltaX;
    const newY = this.props.position.y + deltaY;

    let enemySprite = this.scene.findObjectByName(this.props.spriteName);
    if (enemySprite) {
      enemySprite.x = newX;
      enemySprite.y = newY;
    }

    this.props.position.x = newX;
    this.props.position.y = newY;
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

  private _calculateNextDirectionChangeDate(): Date {
    let idealInterval = 60000 / ENEMY_MOVE_DIRECTION_CHANGE_INTENSITY;
    let actualInterval = this._random.normal(idealInterval * 0.5, idealInterval * 1.5);
    let date = new Date();
    date.setMilliseconds(date.getMilliseconds() + actualInterval);
    return date;
  }

  onRemove() {
    if (!this.scene) {
      return;
    }
    let enemySprite = this.scene.findObjectByName(this.props.spriteName);
    if (enemySprite) {
      enemySprite.parent.removeChild(enemySprite);
    }
  }

}