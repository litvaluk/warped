import * as ECS from '../libs/pixi-ecs';
import { CollectableType, MessageActions } from './constants';
import { CollectableState } from './state-structs';

export class Collectable extends ECS.Component<CollectableState> {

  onUpdate(): void {
    this._checkPlayerCollision();
  }

  private _checkPlayerCollision() {
    if (this._collidesWith(this.scene.findObjectByName('player'))) {
      console.log(`${this.props.type} picked up`);
      switch (this.props.type) {
        case CollectableType.LIFE:
          this.sendMessage(MessageActions.ADD_LIFE);
          break;
        case CollectableType.LASER:
          // todo
          break;
        case CollectableType.SHIELD:
          // todo
          break;
      }
      this.finish();
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
    let collectableSprite = this.scene.findObjectByName(this.props.spriteName);
    if (collectableSprite) {
      collectableSprite.parent.removeChild(collectableSprite);
    }
  }

}