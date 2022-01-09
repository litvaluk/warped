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
      return;
    }
  }

  onRemove(): void {
    if (this.owner && this.owner.parent) {
      this.owner.parent.removeChild(this.owner);
    }
  }

  private _updatePosition(): void {
    this.owner.x += Math.cos(this.owner.rotation - Math.PI / 2) * LASER_SPEED;
    this.owner.y += Math.sin(this.owner.rotation - Math.PI / 2) * LASER_SPEED;
  }

}