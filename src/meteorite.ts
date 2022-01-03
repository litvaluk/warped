import * as ECS from '../libs/pixi-ecs';
import { MessageActions, MeteoriteSize, METEORITE_SHATTER_ANGLE_CHANGE, METEORITE_SPEED, SCENE_HEIGHT, SCENE_WIDTH, SCORE_FOR_METEOR_LARGE, SCORE_FOR_METEOR_MEDIUM, SCORE_FOR_METEOR_SMALL } from './constants';
import { Factory } from './factory';
import { MeteoriteState } from './state-structs';

export class Meteorite extends ECS.Component<MeteoriteState> {

  onUpdate(): void {
    this._updatePosition();
    if (this._isOutOfScreen()) {
      this.finish();
      return;
    }
    this._checkLaserCollision();
  }

  private _updatePosition(): void {
    this.props.position.x += Math.cos(this.props.position.angle - Math.PI / 2) * METEORITE_SPEED;
    this.props.position.y += Math.sin(this.props.position.angle - Math.PI / 2) * METEORITE_SPEED;
    let meteoriteSprite = this.scene.findObjectByName(this.props.spriteName);
    meteoriteSprite.position.set(this.props.position.x, this.props.position.y);
  }

  private _isOutOfScreen(): boolean {
    return this.props.position.x > SCENE_WIDTH || this.props.position.x < 0 || this.props.position.y > SCENE_HEIGHT || this.props.position.y < 0;
  }

  private _checkLaserCollision() {
    let lasers = this.scene.findObjectsByTag('laser');
    for (let i = 0; i < lasers.length; i++) {
      if (this._collidesWith(lasers[i])) {
        this._removeLaserSprite(lasers[i].name);
        if (this.props.size !== MeteoriteSize.SMALL) {
          this._shatterMeteorite();
        }
        this.finish();
        this.sendMessage(MessageActions.ADD_SCORE, { toAdd: this._getScoreForMeteorite(this.props.size) });
        return;
      }
    }
  }

  private _shatterMeteorite() {
    let shatteredLeftPosition = { ...this.props.position, angle: this.props.position.angle - METEORITE_SHATTER_ANGLE_CHANGE };
    let shatteredRightPosition = { ...this.props.position, angle: this.props.position.angle + METEORITE_SHATTER_ANGLE_CHANGE };
    console.log(`shatteredLeftPosition`, shatteredLeftPosition);
    console.log(`shatteredrightPosition`, shatteredRightPosition);
    Factory.getInstance().spawnMeteorite(this.scene, shatteredLeftPosition, this.props.color, this._getSmallerMeteoriteSize(this.props.size));
    Factory.getInstance().spawnMeteorite(this.scene, shatteredRightPosition, this.props.color, this._getSmallerMeteoriteSize(this.props.size));
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

  onRemove(): void {
    let meteoriteSprite = this.scene.findObjectByName(this.props.spriteName);
    if (meteoriteSprite) {
      meteoriteSprite.parent.removeChild(meteoriteSprite);
    }
  }

}