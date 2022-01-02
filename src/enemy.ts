import * as ECS from '../libs/pixi-ecs';
import { EnemyState } from './state-structs';

export class Enemy extends ECS.Component<EnemyState> {

  onUpdate() {
    this._checkLaserCollision();
  }

  private _checkLaserCollision() {
    let lasers = this.scene.findObjectsByTag('laser');
    for (let i = 0; i < lasers.length; i++) {
      if (this._collidesWith(lasers[i])) {
        this._removeLaserSprite(lasers[i].name);
        this.finish();
        return;
      }
    }
  }

  private _collidesWith(other: ECS.Container): boolean {
    let ownBounds = this.scene.findObjectByTag(this.props.tag).getBounds();
    let otherBounds = other.getBounds();
    return ownBounds.x + ownBounds.width > otherBounds.x &&
      ownBounds.x < otherBounds.x + otherBounds.width &&
      ownBounds.y + ownBounds.height > otherBounds.y &&
      ownBounds.y < otherBounds.y + otherBounds.height;
  }

  private _removeLaserSprite(spriteName: string) {
    let laserSprite = this.scene.findObjectByName(spriteName);
    if (laserSprite) {
      laserSprite.parent.removeChild(laserSprite);
    }
  }

  onRemove() {
    let enemySprite = this.scene.findObjectByName(this.props.spriteName);
    if (enemySprite) {
      enemySprite.parent.removeChild(enemySprite);
    }
  }

}