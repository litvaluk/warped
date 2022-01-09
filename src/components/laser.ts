import { LASER_SPEED } from '../constants';
import { CollidableComponent } from './collidable';

export class LaserComponent extends CollidableComponent {

  laserSpeed: number;

  constructor(laserSpeed: number) {
    super();
    this.laserSpeed = laserSpeed;
  }

  onUpdate() {
    this._updatePosition();
    if (this.isOutOfScreen()) {
      this.finish();
      return
    }
  }

  private _updatePosition(): void {
    this.owner.x += Math.cos(this.owner.rotation - Math.PI / 2) * LASER_SPEED;
    this.owner.y += Math.sin(this.owner.rotation - Math.PI / 2) * LASER_SPEED;
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