import * as PIXISound from '@pixi/sound';
import { CollectableType, MessageActions, PLAY_SOUND, Tag, VOLUME } from '../constants';
import { CollidableComponent } from './collidable';

export class CollectableComponent extends CollidableComponent {

  type: CollectableType;

  constructor(type: CollectableType) {
    super();
    this.type = type;
  }

  onUpdate(): void {
    this._checkPlayerCollision();
  }

  private _checkPlayerCollision() {
    let player = this.scene.findObjectByTag(Tag.PLAYER);
    if (player && this.collidesWith(player)) {
      switch (this.type) {
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

  onRemove(): void {
    let collectableSprite = this.owner;
    if (collectableSprite && collectableSprite.parent) {
      collectableSprite.parent.removeChild(collectableSprite);
    }
  }

}