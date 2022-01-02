import * as ECS from '../libs/pixi-ecs';
import { LaserState } from './state-structs';

export class LaserController extends ECS.Component<LaserState> {

  onUpdate() {
    this.props.updatePosition();
    const laserSprite = this.scene.findObjectByTag(this.props.tag);
    laserSprite.position.set(this.props.position.x, this.props.position.y);
    if (this.props.isOutOfScreen()) {
      this.finish();
    }
  }

  onRemove() {
    let laser = this.scene.findObjectByTag(this.props.tag);
    laser.parent.removeChild(laser);
  }

}