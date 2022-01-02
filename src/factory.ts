import * as ECS from '../libs/pixi-ecs';
import * as PIXI from 'pixi.js';
import { SCENE_HEIGHT, SCENE_WIDTH, Position, Tags, BULLET_OFFSET, PLAYER_STARTING_X, PLAYER_STARTING_Y } from './constants';
import { BulletState, PlayerState } from './state-structs';
import { PlayerController } from './player-controller';
import { BulletController } from './bullet-controller';

export class Factory {

  private static _instance: Factory;

  private _bulletCounter = 0;

  public static getInstance(): Factory {
    if (!Factory._instance) {
      Factory._instance = new Factory();
    }
    return Factory._instance;
  }

  loadScene(scene: ECS.Scene) {
    scene.addGlobalComponentAndRun(new ECS.KeyInputComponent());
    scene.addGlobalComponentAndRun(new ECS.PointerInputComponent({
      handleClick: false,
      handlePointerDown: true,
      handlePointerOver: true,
      handlePointerRelease: true
    }));

    const backgroundTexture = PIXI.Texture.from('background');
    const background = new ECS.TilingSprite('background', backgroundTexture, SCENE_WIDTH, SCENE_HEIGHT);

    const playerTexture = PIXI.Texture.from('player');
    const player = new ECS.Sprite('player', playerTexture);
    player.anchor.set(0.5, 0.5);
    player.addTag(Tags.PLAYER);

    const initPosition: Position = {
      x: PLAYER_STARTING_X,
      y: PLAYER_STARTING_Y,
      angle: 0
    }

    player.position.x = initPosition.x;
    player.position.y = initPosition.y;

    scene.stage.addChild(background);
    scene.stage.addChild(player);
    scene.stage.addComponent(new PlayerController(new PlayerState(scene, initPosition)));
  }

  spawnBullet(scene: ECS.Scene) {
    const playerSprite = scene.findObjectByTag(Tags.PLAYER);

    const bulletTexture = PIXI.Texture.from('bullet');
    const bullet = new ECS.Sprite('bullet', bulletTexture);

    const initPosition: Position = {
      x: playerSprite.x + Math.cos(playerSprite.rotation - Math.PI / 2) * BULLET_OFFSET,
      y: playerSprite.y + Math.sin(playerSprite.rotation - Math.PI / 2) * BULLET_OFFSET,
      angle: playerSprite.rotation
    }

    bullet.anchor.set(0.5, 0.5);
    bullet.position.set(initPosition.x, initPosition.y)
    bullet.rotation = initPosition.angle;
    bullet.scale.x = 0.3
    bullet.scale.y = 0.3

    let tag = Tags.BULLET + ++this._bulletCounter;
    bullet.addTag(tag);

    scene.stage.addChild(bullet);
    scene.stage.addComponent(new BulletController(new BulletState(scene, initPosition, tag)));
  }

}