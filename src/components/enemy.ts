import { Random } from '../../libs/aph-math';
import { EnemyColor, EnemyVariant, ENEMY_MOVE_DIRECTION_CHANGE_INTENSITY, ENEMY_SPEED, GAME_STATS_COMPONENT_NAME, LaserColor, MessageActions, PLAYER_COMPONENT_NAME, Point, SCORE_FOR_ENEMY_HUGE, SCORE_FOR_ENEMY_LARGE, SCORE_FOR_ENEMY_MEDIUM, SCORE_FOR_ENEMY_SMALL, Tag } from '../constants';
import { GameFactory } from '../factories/gameFactory';
import { GameStatsComponent } from './gameStats';
import { CollidableComponent } from './collidable';
import { PlayerComponent } from './player';

export class Enemy extends CollidableComponent {

  color: EnemyColor;
  variant: EnemyVariant;
  shootingIntensity: number;
  random = new Random(Date.now());
  nextShotDate: Date;
  nextDirectionChangeDate: Date;
  direction: number;

  constructor(color: EnemyColor, variant: EnemyVariant, shootingIntensity: number) {
    super();
    this.color = color;
    this.variant = variant;
    this.shootingIntensity = shootingIntensity;
    this.nextShotDate = this._calculateNextShotDate();
    this.nextDirectionChangeDate = this._calculateNextDirectionChangeDate();
  }

  onInit(): void {
    super.onInit();
    let player = this.scene.findObjectByTag(Tag.PLAYER);
    if (player) {
      this.direction = Math.atan2(player.y - this.owner.y, player.x - this.owner.x) + Math.PI / 2;
    }
  }

  onUpdate() {
    const now = new Date();
    if (this.nextShotDate < now) {
      this._shoot();
    }
    if (this.nextDirectionChangeDate < now) {
      this.nextDirectionChangeDate = this._calculateNextDirectionChangeDate();
      this.direction = Math.random() * 2 * Math.PI;
    }
    this._updateRotation();
    this._move();
    this._checkCollisions();
  }

  private _checkCollisions() {
    let lasers = this.scene.findObjectsByTag(Tag.LASER_PLAYER);
    for (let i = 0; i < lasers.length; i++) {
      if (this.collidesWith(lasers[i])) {
        this._removeLaser(lasers[i].name);
        this.sendMessage(MessageActions.ADD_SCORE, { toAdd: this._getScoreForEnemy() });
        GameFactory.getInstance().spawnExplosion(this.scene, { x: this.owner.x, y: this.owner.y });
        this.finish();
        return;
      }
    }

    let player = this.scene.findObjectByTag(Tag.PLAYER);
    if (player && this.collidesWith(player)) {
      let gameStats = this.scene.findGlobalComponentByName<GameStatsComponent>(GAME_STATS_COMPONENT_NAME);
      if (gameStats && !gameStats.immortal) {
        let playerComponent = player.findComponentByName<PlayerComponent>(PLAYER_COMPONENT_NAME);
        if (playerComponent) {
          GameFactory.getInstance().spawnExplosion(this.scene, { x: player.x, y: player.y }, null, false);
          playerComponent.finish();
        }
        GameFactory.getInstance().spawnPlayer(this.scene);
        this.sendMessage(MessageActions.IMMORTALITY_ON);
        this.sendMessage(MessageActions.REMOVE_LIFE);
      }
      GameFactory.getInstance().spawnExplosion(this.scene, { x: this.owner.x, y: this.owner.y });
      this.finish();
      return;
    }

    if (this.isOutOfScreen()) {
      this.finish();
      return;
    }
  }

  private _removeLaser(spriteName: string) {
    let laser = this.scene.findObjectByName(spriteName);
    if (laser) {
      laser.parent.removeChild(laser);
    }
  }

  private _shoot() {
    const newlaserPosition: Point = {
      x: this.owner.x + Math.cos(this.owner.rotation - Math.PI / 2) * this.owner.getBounds().width / 1.7,
      y: this.owner.y + Math.sin(this.owner.rotation - Math.PI / 2) * this.owner.getBounds().height / 1.7
    }
    GameFactory.getInstance().spawnLaser(this.scene, this._getLaserColorForEnemy(), newlaserPosition, this.owner.rotation, Tag.LASER_ENEMY);
    this.nextShotDate = this._calculateNextShotDate();
  }

  private _updateRotation() {
    let player = this.scene.findObjectByTag(Tag.PLAYER);
    if (player) {
      this.owner.rotation = Math.atan2(player.y - this.owner.y, player.x - this.owner.x) + Math.PI / 2;
    }
  }

  private _move() {
    this.owner.x += ENEMY_SPEED * Math.cos(this.direction - Math.PI / 2);
    this.owner.y += ENEMY_SPEED * Math.sin(this.direction - Math.PI / 2);
  }

  private _getScoreForEnemy(): number {
    switch (this.variant) {
      case EnemyVariant.SMALL:
        return SCORE_FOR_ENEMY_SMALL;
      case EnemyVariant.MEDIUM:
        return SCORE_FOR_ENEMY_MEDIUM;
      case EnemyVariant.LARGE:
        return SCORE_FOR_ENEMY_LARGE;
      case EnemyVariant.HUGE:
        return SCORE_FOR_ENEMY_HUGE;
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

  private _calculateNextShotDate(): Date {
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
    if (this.owner && this.owner.parent) {
      this.owner.parent.removeChild(this.owner);
    }
  }

}