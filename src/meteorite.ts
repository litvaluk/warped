import * as ECS from '../libs/pixi-ecs';
import { CollectableOption, CollectableType, COLLECTABLE_SPAWN_PERCENTAGE, LASER_COLLECTABLE_SPAWN_PERCENTAGE, LIFE_COLLECTABLE_SPAWN_PERCENTAGE, MessageActions, MeteoriteSize, METEORITE_SHATTER_ANGLE_CHANGE, METEORITE_SPEED, SCENE_HEIGHT, SCENE_WIDTH, SCORE_FOR_METEOR_LARGE, SCORE_FOR_METEOR_MEDIUM, SCORE_FOR_METEOR_SMALL, SHIELD_COLLECTABLE_SPAWN_PERCENTAGE, Tag } from './constants';
import { Factory } from './factory';
import { GameStats } from './game-stats';
import { MeteoriteState } from './state-structs';

export class Meteorite extends ECS.Component<MeteoriteState> {

  onUpdate(): void {
    this._updatePosition();
    if (this._isOutOfScreen()) {
      this.finish();
      return;
    }
    this._checkCollisions();
  }

  private _updatePosition(): void {
    this.props.position.x += Math.cos(this.props.position.angle - Math.PI / 2) * METEORITE_SPEED;
    this.props.position.y += Math.sin(this.props.position.angle - Math.PI / 2) * METEORITE_SPEED;
    let meteoriteSprite = this.scene.findObjectByName(this.props.spriteName);
    meteoriteSprite.position.set(this.props.position.x, this.props.position.y);
  }

  private _isOutOfScreen(): boolean {
    return this.props.position.x > SCENE_WIDTH + 100 || this.props.position.x < 0 - 100 || this.props.position.y > SCENE_HEIGHT + 100 || this.props.position.y < 0 - 100;
  }

  private _checkCollisions() {
    let lasers = this.scene.findObjectsByTag(Tag.LASER_PLAYER);
    for (let i = 0; i < lasers.length; i++) {
      if (this._collidesWith(lasers[i])) {
        this._removeLaserSprite(lasers[i].name);
        if (this.props.size !== MeteoriteSize.SMALL) {
          this._shatterMeteorite();
        }
        if (Math.random() < COLLECTABLE_SPAWN_PERCENTAGE) {
          Factory.getInstance().spawnCollectable(this.scene, { ...this.props.position, angle: 0 }, this._chooseCollectableType());
        }
        Factory.getInstance().spawnExplosion(this.scene, { ...this.props.position, angle: 0 }, this._getExplosionScaleForMeteorite(this.props.size));
        this.finish();
        this.sendMessage(MessageActions.ADD_SCORE, { toAdd: this._getScoreForMeteorite(this.props.size) });
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
        if (this.props.size !== MeteoriteSize.SMALL) {
          this._shatterMeteorite();
        }
        this.sendMessage(MessageActions.IMMORTALITY_ON);
        this.sendMessage(MessageActions.REMOVE_LIFE);
      }
      Factory.getInstance().spawnExplosion(this.scene, { ...this.props.position, angle: 0 }, this._getExplosionScaleForMeteorite(this.props.size), false);
      this.finish();
      return;
    }
  }

  private _shatterMeteorite() {
    let shatteredLeftPosition = { ...this.props.position, angle: this.props.position.angle - METEORITE_SHATTER_ANGLE_CHANGE };
    let shatteredRightPosition = { ...this.props.position, angle: this.props.position.angle + METEORITE_SHATTER_ANGLE_CHANGE };
    Factory.getInstance().spawnMeteorite(this.scene, this.props.color, this._getSmallerMeteoriteSize(this.props.size), shatteredLeftPosition);
    Factory.getInstance().spawnMeteorite(this.scene, this.props.color, this._getSmallerMeteoriteSize(this.props.size), shatteredRightPosition);
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
    let ownBounds = this.scene.findObjectByName(this.props.spriteName).getBounds();
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
    let meteoriteSprite = this.scene.findObjectByName(this.props.spriteName);
    if (meteoriteSprite) {
      meteoriteSprite.parent.removeChild(meteoriteSprite);
    }
  }

}