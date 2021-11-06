import * as ECS from '../libs/pixi-ecs';
import { Direction, Tags } from './constants';
import { Factory } from './factory';
import { BulletState, PlayerState } from './state-structs';

export class Actions {

  static move = (scene: ECS.Scene, playerState: PlayerState, direction: Direction) => {
    return new ECS.ChainComponent()
        .call(() => {
          const playerSprite = scene.findObjectByTag(Tags.PLAYER);
          playerState.move(direction);
          playerSprite.position.set(playerState.position.x, playerState.position.y);
        });
  }

  static updatePlayerAngle = (scene: ECS.Scene, playerState: PlayerState, angle: number) => {
    return new ECS.ChainComponent()
        .call(() => {
          const playerSprite = scene.findObjectByTag(Tags.PLAYER);
          playerState.updateAngle(angle);
          playerSprite.rotation = angle;
        });
  }
  
  static shoot = (scene: ECS.Scene, playerState: PlayerState) => {
    return new ECS.ChainComponent()
        .call(() => {
          const playerSprite = scene.findObjectByTag(Tags.PLAYER);
          Factory.getInstance().spawnBullet(scene);
        });
  }

  static updateBulletLocation = (scene: ECS.Scene, bulletState: BulletState) => {
    return new ECS.ChainComponent()
        .call(() => {
          const bulletSprite = scene.findObjectByTag(bulletState.tag);
          bulletSprite.position.set(bulletState.position.x, bulletState.position.y);
        });
  }

}