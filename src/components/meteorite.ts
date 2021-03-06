import { CollectableOption, CollectableType, COLLECTABLE_SPAWN_PERCENTAGE, GAME_STATS_COMPONENT_NAME, LASER_COLLECTABLE_SPAWN_PERCENTAGE, LIFE_COLLECTABLE_SPAWN_PERCENTAGE, MessageActions, MeteoriteColor, MeteoriteSize, METEORITE_SHATTER_ROTATION_CHANGE as METEORITE_SHATTER_ROTATION_CHANGE, METEORITE_SPEED, PLAYER_COMPONENT_NAME, Point, SCORE_FOR_METEOR_LARGE, SCORE_FOR_METEOR_MEDIUM, SCORE_FOR_METEOR_SMALL, SHIELD_COLLECTABLE_SPAWN_PERCENTAGE, Tag } from '../constants';
import { GameFactory } from '../factories/gameFactory';
import { CollidableComponent } from './collidable';
import { GameStatsComponent } from './gameStats';
import { PlayerComponent } from './player';

export class MeteoriteComponent extends CollidableComponent {

  size: MeteoriteSize;
  color: MeteoriteColor;

  constructor(size: MeteoriteSize, color: MeteoriteColor) {
    super();
    this.size = size;
    this.color = color;
  }

  onUpdate(): void {
    this._updatePosition();
    if (this.isOutOfScreen()) {
      this.finish();
      return;
    }
    this._checkCollisions();
  }

  onRemove(): void {
    if (this.owner && this.owner.parent) {
      this.owner.parent.removeChild(this.owner);
    }
  }

  private _updatePosition(): void {
    this.owner.x += Math.cos(this.owner.rotation - Math.PI / 2) * METEORITE_SPEED;
    this.owner.y += Math.sin(this.owner.rotation - Math.PI / 2) * METEORITE_SPEED;
  }

  private _checkCollisions() {
    let lasers = this.scene.findObjectsByTag(Tag.LASER_PLAYER);
    for (let i = 0; i < lasers.length; i++) {
      if (this.collidesWith(lasers[i])) {
        this._removeLaser(lasers[i].name);
        if (this.size !== MeteoriteSize.SMALL) {
          this._shatterMeteorite();
        }
        if (Math.random() < COLLECTABLE_SPAWN_PERCENTAGE) {
          GameFactory.getInstance().spawnCollectable(this.scene, { x: this.owner.x, y: this.owner.y }, this._chooseCollectableType());
        }
        GameFactory.getInstance().spawnExplosion(this.scene, { x: this.owner.x, y: this.owner.y }, this._getExplosionScaleForMeteorite(this.size));
        this.finish();
        this.sendMessage(MessageActions.ADD_SCORE, { toAdd: this._getScoreForMeteorite(this.size) });
        return;
      }
    }

    let player = this.scene.findObjectByTag(Tag.PLAYER);
    if (player && this.collidesWith(player)) {
      let gameStatsComponent = this.scene.findGlobalComponentByName<GameStatsComponent>(GAME_STATS_COMPONENT_NAME);
      if (gameStatsComponent && !gameStatsComponent.immortal) {
        player.parent.removeChild(player);
        let playerComponent = player.findComponentByName<PlayerComponent>(PLAYER_COMPONENT_NAME);
        if (playerComponent) {
          GameFactory.getInstance().spawnExplosion(this.scene, { x: player.x, y: player.y }, null, false);
          playerComponent.finish();
        }
        GameFactory.getInstance().spawnPlayer(this.scene);
        if (this.size !== MeteoriteSize.SMALL) {
          this._shatterMeteorite();
        }
        this.sendMessage(MessageActions.IMMORTALITY_ON);
        this.sendMessage(MessageActions.REMOVE_LIFE);
      }
      GameFactory.getInstance().spawnExplosion(this.scene, { x: this.owner.x, y: this.owner.y }, this._getExplosionScaleForMeteorite(this.size));
      this.finish();
      return;
    }
  }

  private _shatterMeteorite() {
    let shatteredLeftPosition: Point = { x: this.owner.x, y: this.owner.y };
    let shatteredRightPosition: Point = { x: this.owner.x, y: this.owner.y };
    GameFactory.getInstance().spawnMeteorite(this.scene, this.color, this._getSmallerMeteoriteSize(this.size), [shatteredLeftPosition, this.owner.rotation - METEORITE_SHATTER_ROTATION_CHANGE]);
    GameFactory.getInstance().spawnMeteorite(this.scene, this.color, this._getSmallerMeteoriteSize(this.size), [shatteredRightPosition, this.owner.rotation + METEORITE_SHATTER_ROTATION_CHANGE]);
  }

  private _getSmallerMeteoriteSize(size: MeteoriteSize): MeteoriteSize {
    switch (size) {
      case MeteoriteSize.LARGE:
        return MeteoriteSize.MEDIUM;
      case MeteoriteSize.MEDIUM:
        return MeteoriteSize.SMALL;
      case MeteoriteSize.SMALL:
        return null;
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
    }
  }

  private _removeLaser(spriteName: string) {
    let laser = this.scene.findObjectByName(spriteName);
    if (laser) {
      laser.parent.removeChild(laser);
    }
  }

  private _chooseCollectableType(): CollectableType {
    let collectables: CollectableOption[] = [
      { type: CollectableType.LIFE, percentage: LIFE_COLLECTABLE_SPAWN_PERCENTAGE },
      { type: CollectableType.LASER, percentage: LASER_COLLECTABLE_SPAWN_PERCENTAGE },
      { type: CollectableType.SHIELD, percentage: SHIELD_COLLECTABLE_SPAWN_PERCENTAGE },
    ];

    let splitPoints: number[] = [0];
    for (let i = 0; i < collectables.length; i++) {
      splitPoints.push(splitPoints[i] + collectables[i].percentage);
    }

    let cut = Math.random() * splitPoints[splitPoints.length - 1];

    for (let i = 0; i < splitPoints.length - 1; i++) {
      if (cut < splitPoints[i + 1]) {
        return collectables[i].type;
      }
    }

    return null;
  }

}