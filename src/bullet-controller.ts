import * as ECS from '../libs/pixi-ecs';
import { BulletState } from './state-structs';

export class BulletController extends ECS.Component<BulletState> {
  
  onUpdate() {
    this.props.updatePosition();
    const bulletSprite = this.scene.findObjectByTag(this.props.tag);
    bulletSprite.position.set(this.props.position.x, this.props.position.y);
    if (this.props.isOutOfScreen()) {
      this.finish();
    }
  }

  onRemove() {
    let bullet = this.scene.findObjectByTag(this.props.tag);
    bullet.parent.removeChild(bullet);
  }

}