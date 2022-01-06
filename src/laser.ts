import * as ECS from '../libs/pixi-ecs';
import { LaserState } from './state-structs';

export class Laser extends ECS.Component<LaserState> {

  onUpdate() {
    this.props.updatePosition();
    const laserSprite = this.scene.findObjectByName(this.props.spriteName);
    if (!laserSprite) {
      this.finish();
      return;
    }
    laserSprite.position.set(this.props.position.x, this.props.position.y);
    if (this.props.isOutOfScreen()) {
      this.finish();
      return
    }
  }

  onRemove(): void {
    if (!this.scene) {
      return;
    }
    let laserSprite = this.scene.findObjectByName(this.props.spriteName);
    if (laserSprite) {
      laserSprite.parent.removeChild(laserSprite);
    }
  }

}