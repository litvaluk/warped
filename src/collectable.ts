import * as ECS from '../libs/pixi-ecs';
import * as PIXISound from '@pixi/sound';
import { CollectableType, MessageActions, PLAY_SOUND, VOLUME } from './constants';
import { CollectableState } from './stateStructs';

export class Collectable extends ECS.Component<CollectableState> {

  onUpdate(): void {
    this._checkPlayerCollision();
  }

  private _checkPlayerCollision() {
    let playerSprite = this.scene.findObjectByName('player');
    if (playerSprite && this._collidesWith(playerSprite)) {
      switch (this.props.type) {
        case CollectableType.LIFE:
          this.sendMessage(MessageActions.ADD_LIFE);
          break;
        case CollectableType.LASER:
          this.sendMessage(MessageActions.INCREASE_LASER_LEVEL);
          break;
        case CollectableType.SHIELD:
          this.sendMessage(MessageActions.SHIELD_ON);
          break;
      }
      if (PLAY_SOUND) {
        PIXISound.sound.play('pickup-sfx', { volume: VOLUME * 1.3 });
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