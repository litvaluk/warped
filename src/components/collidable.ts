import * as ECS from '../../libs/pixi-ecs';

export class CollidableComponent extends ECS.Component {

  collidesWith(other: ECS.Container): boolean {
    let ownBounds = this.owner.getBounds();
    let otherBounds = other.getBounds();
    return ownBounds.x + ownBounds.width > otherBounds.x &&
      ownBounds.x < otherBounds.x + otherBounds.width &&
      ownBounds.y + ownBounds.height > otherBounds.y &&
      ownBounds.y < otherBounds.y + otherBounds.height;
  }

  isOutOfScreen(): boolean {
    return this.owner.x > this.scene.width + this.owner.width ||
      this.owner.x < 0 - this.owner.width ||
      this.owner.y > this.scene.height + this.owner.height ||
      this.owner.y < 0 - this.owner.height;
  }

}