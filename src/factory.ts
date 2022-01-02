import * as ECS from '../libs/pixi-ecs';
import * as PIXI from 'pixi.js';
import { SCENE_HEIGHT, SCENE_WIDTH, Position, Tags, LASER_OFFSET, PLAYER_STARTING_X, PLAYER_STARTING_Y } from './constants';
import { LaserState, PlayerState } from './state-structs';
import { PlayerController } from './player-controller';
import { LaserController } from './laser-controller';

export class Factory {

  private static _instance: Factory;

  private _laserCounter = 0;

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

  spawnLaser(scene: ECS.Scene) {
    const playerSprite = scene.findObjectByTag(Tags.PLAYER);

    const laserTexture = PIXI.Texture.from('laser');
    const laser = new ECS.Sprite('laser', laserTexture);

    const initPosition: Position = {
      x: playerSprite.x + Math.cos(playerSprite.rotation - Math.PI / 2) * LASER_OFFSET,
      y: playerSprite.y + Math.sin(playerSprite.rotation - Math.PI / 2) * LASER_OFFSET,
      angle: playerSprite.rotation
    }

    laser.anchor.set(0.5, 0.5);
    laser.position.set(initPosition.x, initPosition.y)
    laser.rotation = initPosition.angle;
    laser.scale.x = 0.3
    laser.scale.y = 0.3

    let tag = Tags.LASER + ++this._laserCounter;
    laser.addTag(tag);

    scene.stage.addChild(laser);
    scene.stage.addComponent(new LaserController(new LaserState(scene, initPosition, tag)));
  }

  spawnEnemy(scene: ECS.Scene) {

  }

}