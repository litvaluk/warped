import * as ECS from '../../libs/pixi-ecs';
import { LASER_SPEED, SCENE_HEIGHT, SCENE_WIDTH } from '../constants';

export class LaserComponent extends ECS.Component {

  onUpdate() {
    this._updatePosition();
    if (this._isOutOfScreen()) {
      this.finish();
      return
    }
  }

  private _updatePosition(): void {
    this.owner.x += Math.cos(this.owner.rotation - Math.PI / 2) * LASER_SPEED;
    this.owner.y += Math.sin(this.owner.rotation - Math.PI / 2) * LASER_SPEED;
  }

  private _isOutOfScreen(): boolean {
    return this.owner.x > SCENE_WIDTH || this.owner.x < 0 || this.owner.y > SCENE_HEIGHT || this.owner.y < 0;
  }

  onRemove(): void {
    if (!this.scene) {
      return;
    }
    let laserSprite = this.owner;
    if (laserSprite && laserSprite.parent) {
      laserSprite.parent.removeChild(laserSprite);
    }
  }

}