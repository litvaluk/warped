import * as ECS from '../../libs/pixi-ecs';
import { CollectableOption, CollectableType, COLLECTABLE_SPAWN_PERCENTAGE, LASER_COLLECTABLE_SPAWN_PERCENTAGE, LIFE_COLLECTABLE_SPAWN_PERCENTAGE, MessageActions, MeteoriteColor, MeteoriteSize, METEORITE_SHATTER_ANGLE_CHANGE, METEORITE_SPEED, SCENE_HEIGHT, SCENE_WIDTH, SCORE_FOR_METEOR_LARGE, SCORE_FOR_METEOR_MEDIUM, SCORE_FOR_METEOR_SMALL, SHIELD_COLLECTABLE_SPAWN_PERCENTAGE, Tag } from '../constants';
import { GameFactory } from '../factories/gameFactory';
import { GameStatsComponent } from './gameStats';

export class MeteoriteComponent extends ECS.Component {

  size: MeteoriteSize;
  color: MeteoriteColor;

  constructor(size: MeteoriteSize, color: MeteoriteColor) {
    super();
    this.size = size;
    this.color = color;
  }

  onUpdate(): void {
    this._updatePosition();
    if (this._isOutOfScreen()) {
      this.finish();
      return;
    }
    this._checkCollisions();
  }

  private _updatePosition(): void {
    this.owner.x += Math.cos(this.owner.rotation - Math.PI / 2) * METEORITE_SPEED;
    this.owner.y += Math.sin(this.owner.rotation - Math.PI / 2) * METEORITE_SPEED;
  }

  private _isOutOfScreen(): boolean {
    return this.owner.x > SCENE_WIDTH + 100 || this.owner.x < 0 - 100 || this.owner.y > SCENE_HEIGHT + 100 || this.owner.y < 0 - 100;
  }

  private _checkCollisions() {
    let lasers = this.scene.findObjectsByTag(Tag.LASER_PLAYER);
    for (let i = 0; i < lasers.length; i++) {
      if (this._collidesWith(lasers[i])) {
        this._removeLaserSprite(lasers[i].name);
        if (this.size !== MeteoriteSize.SMALL) {
          this._shatterMeteorite();
        }
        if (Math.random() < COLLECTABLE_SPAWN_PERCENTAGE) {
          GameFactory.getInstance().spawnCollectable(this.scene, { x: this.owner.x, y: this.owner.y, angle: 0 }, this._chooseCollectableType());
        }
        GameFactory.getInstance().spawnExplosion(this.scene, { x: this.owner.x, y: this.owner.y, angle: 0 }, this._getExplosionScaleForMeteorite(this.size));
        this.finish();
        this.sendMessage(MessageActions.ADD_SCORE, { toAdd: this._getScoreForMeteorite(this.size) });
        return;
      }
    }
    let playerSprite = this.scene.findObjectByName('player');
    if (playerSprite && this._collidesWith(playerSprite)) {
      let gameStatsComponent = this.scene.stage.findComponentByName('game-stats') as GameStatsComponent;
      if (gameStatsComponent && !gameStatsComponent.immortal) {
        playerSprite.parent.removeChild(playerSprite);
        let playerComponent = playerSprite.findComponentByName('player');
        if (playerComponent) {
          GameFactory.getInstance().spawnExplosion(this.scene, { x: playerSprite.x, y: playerSprite.y, angle: 0 }, null, false);
          playerComponent.finish();
        }
        GameFactory.getInstance().spawnPlayer(this.scene);
        if (this.size !== MeteoriteSize.SMALL) {
          this._shatterMeteorite();
        }
        this.sendMessage(MessageActions.IMMORTALITY_ON);
        this.sendMessage(MessageActions.REMOVE_LIFE);
      }
      GameFactory.getInstance().spawnExplosion(this.scene, { x: this.owner.x, y: this.owner.y, angle: 0 }, this._getExplosionScaleForMeteorite(this.size));
      this.finish();
      return;
    }
  }

  private _shatterMeteorite() {
    let shatteredLeftPosition = { x: this.owner.x, y: this.owner.y, angle: this.owner.rotation - METEORITE_SHATTER_ANGLE_CHANGE };
    let shatteredRightPosition = { x: this.owner.x, y: this.owner.y, angle: this.owner.rotation + METEORITE_SHATTER_ANGLE_CHANGE };
    GameFactory.getInstance().spawnMeteorite(this.scene, this.color, this._getSmallerMeteoriteSize(this.size), shatteredLeftPosition);
    GameFactory.getInstance().spawnMeteorite(this.scene, this.color, this._getSmallerMeteoriteSize(this.size), shatteredRightPosition);
  }

  private _getSmallerMeteoriteSize(size: MeteoriteSize): MeteoriteSize {
    switch (size) {
      case MeteoriteSize.LARGE:
        return MeteoriteSize.MEDIUM;
      case MeteoriteSize.MEDIUM:
        return MeteoriteSize.SMALL;
      default:
        break;
    }
  }

  private _getScoreForMeteorite(size: MeteoriteSize): number {
    switch (size) {
      case MeteoriteSize.SMALL:
        return SCORE_FOR_METEOR_SMALL;
      case MeteoriteSize.MEDIUM:
        return SCORE_FOR_METEOR_MEDIUM;
      case MeteoriteSize.LARGE:
        return SCORE_FOR_METEOR_LARGE;
      default:
        break;
    }
  }

  private _getExplosionScaleForMeteorite(size: MeteoriteSize): number {
    switch (size) {
      case MeteoriteSize.SMALL:
        return 0.3;
      case MeteoriteSize.MEDIUM:
        return 0.45;
      case MeteoriteSize.LARGE:
        return 0.75;
      default:
        break;
    }
  }

  private _removeLaserSprite(spriteName: string) {
    let laserSprite = this.scene.findObjectByName(spriteName);
    if (laserSprite) {
      laserSprite.parent.removeChild(laserSprite);
    }
  }

  private _collidesWith(other: ECS.Container): boolean {
    let ownBounds = this.owner.getBounds();
    let otherBounds = other.getBounds();
    return ownBounds.x + ownBounds.width > otherBounds.x &&
      ownBounds.x < otherBounds.x + otherBounds.width &&
      ownBounds.y + ownBounds.height > otherBounds.y &&
      ownBounds.y < otherBounds.y + otherBounds.height;
  }

  private _chooseCollectableType(): CollectableType {
    let collectables: CollectableOption[] = [
      { type: CollectableType.LIFE, percentage: LIFE_COLLECTABLE_SPAWN_PERCENTAGE },
      { type: CollectableType.LASER, percentage: LASER_COLLECTABLE_SPAWN_PERCENTAGE },
      { type: CollectableType.SHIELD, percentage: SHIELD_COLLECTABLE_SPAWN_PERCENTAGE },
    ];

    let splitPoints: number[] = [0];
    for (let i = 0; i < collectables.length; i++) {
      splitPoints.push(splitPoints[i] + collectables[i].percentage)
    }

    let cut = Math.random() * splitPoints[splitPoints.length - 1];

    for (let i = 0; i < splitPoints.length - 1; i++) {
      if (cut < splitPoints[i + 1]) {
        return collectables[i].type;
      }
    }

    return undefined;
  }

  onRemove(): void {
    if (!this.scene) {
      return;
    }
    let meteoriteSprite = this.owner;
    if (meteoriteSprite && meteoriteSprite.parent) {
      meteoriteSprite.parent.removeChild(meteoriteSprite);
    }
  }

}