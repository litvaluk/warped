import { Random } from '../../libs/aph-math';
import { EnemyColor, EnemyVariant, ENEMY_MOVE_DIRECTION_CHANGE_INTENSITY, ENEMY_SHOOTING_INTENSITY, ENEMY_SPEED, LaserColor, LaserOrigin, MessageActions, Position, SCENE_HEIGHT, SCENE_WIDTH, SCORE_FOR_ENEMY_HUGE, SCORE_FOR_ENEMY_LARGE, SCORE_FOR_ENEMY_MEDIUM, SCORE_FOR_ENEMY_SMALL, Tag } from '../constants';
import { GameFactory } from '../factories/gameFactory';
import { GameStatsComponent } from './gameStats';
import { getAngleRad } from '../helper';
import { CollidableComponent } from './collidable';

export class Enemy extends CollidableComponent {

  color: EnemyColor;
  variant: EnemyVariant;
  shootingIntensity: number;
  random = new Random(Date.now());
  lastShotDate: Date;
  nextShotDate: Date;
  nextDirectionChangeDate: Date;
  direction: number;

  constructor(color: EnemyColor, variant: EnemyVariant, shootingIntensity: number) {
    super();
    this.color = color;
    this.variant = variant;
    this.shootingIntensity = shootingIntensity;
    this.nextShotDate = this._calculateNextShotTime();
    this.nextDirectionChangeDate = this._calculateNextDirectionChangeDate();
  }

  onInit(): void {
    console.log(this.scene.width, this.scene.height);
    super.onInit();
    let playerSprite = this.scene.findObjectByTag(Tag.PLAYER);
    if (playerSprite) {
      this.direction = getAngleRad(this.owner.x, this.owner.y, playerSprite.x, playerSprite.y);
    }
  }

  onUpdate() {
    if (new Date() > this.nextShotDate) {
      this._shoot();
    }
    if (new Date() > this.nextDirectionChangeDate) {
      this.nextDirectionChangeDate = this._calculateNextDirectionChangeDate();
      this.direction = Math.random() * 2 * Math.PI;
    }
    this._updateAngle();
    this._move();
    this._checkCollisions();
  }

  private _checkCollisions() {
    let lasers = this.scene.findObjectsByTag(Tag.LASER_PLAYER);
    for (let i = 0; i < lasers.length; i++) {
      if (this.collidesWith(lasers[i])) {
        this._removeLaserSprite(lasers[i].name);
        this.sendMessage(MessageActions.ADD_SCORE, { toAdd: this._getScoreForEnemy(this.variant) });
        GameFactory.getInstance().spawnExplosion(this.scene, { x: this.owner.x, y: this.owner.y, angle: 0 });
        this.finish();
        return;
      }
    }
    let playerSprite = this.scene.findObjectByName('player');
    if (playerSprite && this.collidesWith(playerSprite)) {
      let gameStatsComponent = this.scene.stage.findComponentByName('game-stats') as GameStatsComponent;
      if (gameStatsComponent && !gameStatsComponent.immortal) {
        let playerComponent = playerSprite.findComponentByName('player');
        if (playerComponent) {
          GameFactory.getInstance().spawnExplosion(this.scene, { x: playerSprite.x, y: playerSprite.y, angle: 0 }, null, false);
          playerComponent.finish();
        }
        GameFactory.getInstance().spawnPlayer(this.scene);
        this.sendMessage(MessageActions.IMMORTALITY_ON);
        this.sendMessage(MessageActions.REMOVE_LIFE);
      }
      GameFactory.getInstance().spawnExplosion(this.scene, { x: this.owner.x, y: this.owner.y, angle: 0 });
      this.finish();
      return;
    }
    if (this.isOutOfScreen()) {
      this.finish();
      return;
    }
  }

  private _removeLaserSprite(spriteName: string) {
    let laserSprite = this.scene.findObjectByName(spriteName);
    if (laserSprite) {
      laserSprite.parent.removeChild(laserSprite);
    }
  }

  private _shoot() {
    let enemySprite = this.owner;
    if (enemySprite) {
      const pos: Position = {
        x: enemySprite.x + Math.cos(enemySprite.rotation - Math.PI / 2) * enemySprite.getBounds().width / 1.7,
        y: enemySprite.y + Math.sin(enemySprite.rotation - Math.PI / 2) * enemySprite.getBounds().height / 1.7,
        angle: enemySprite.rotation
      }
      GameFactory.getInstance().spawnLaser(this.scene, this._getLaserColorForEnemy(), pos, LaserOrigin.ENEMY);
      this.lastShotDate = this.nextShotDate;
      this.nextShotDate = this._calculateNextShotTime();
    }
  }

  private _updateAngle() {
    let playerSprite = this.scene.findObjectByTag(Tag.PLAYER);
    if (playerSprite) {
      this.owner.rotation = getAngleRad(this.owner.x, this.owner.y, playerSprite.x, playerSprite.y);
    }
  }

  private _move() {
    const deltaX = ENEMY_SPEED * Math.cos(this.direction - Math.PI / 2);
    const deltaY = ENEMY_SPEED * Math.sin(this.direction - Math.PI / 2);
    const newX = this.owner.x + deltaX;
    const newY = this.owner.y + deltaY;

    let enemySprite = this.owner;
    if (enemySprite) {
      enemySprite.x = newX;
      enemySprite.y = newY;
    }

    this.owner.x = newX;
    this.owner.y = newY;
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
    switch (this.color) {
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
    let idealInterval = 60000 / this.shootingIntensity;
    let actualInterval = this.random.uniform(idealInterval * 0.2, idealInterval * 1.8);
    let date = new Date();
    date.setMilliseconds(date.getMilliseconds() + actualInterval);
    return date;
  }

  private _calculateNextDirectionChangeDate(): Date {
    let idealInterval = 60000 / ENEMY_MOVE_DIRECTION_CHANGE_INTENSITY;
    let actualInterval = this.random.normal(idealInterval * 0.5, idealInterval * 1.5);
    let date = new Date();
    date.setMilliseconds(date.getMilliseconds() + actualInterval);
    return date;
  }

  onRemove() {
    if (!this.scene) {
      return;
    }
    let enemySprite = this.owner;
    if (enemySprite && enemySprite.parent) {
      enemySprite.parent.removeChild(enemySprite);
    }
  }

}