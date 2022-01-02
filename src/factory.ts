import * as ECS from '../libs/pixi-ecs';
import * as PIXI from 'pixi.js';
import { SCENE_HEIGHT, SCENE_WIDTH, Position, Tags, LASER_OFFSET, PLAYER_STARTING_X, PLAYER_STARTING_Y, EnemyColor, EnemyVariant, LaserColor } from './constants';
import { EnemySpawnerState, EnemyState, LaserState, PlayerState } from './state-structs';
import { Player } from './player';
import { Laser } from './laser';
import { Enemy } from './enemy';
import { EnemySpawner } from './enemy-spawner';

export class Factory {

  private static _instance: Factory;

  private _laserCounter = 0;
  private _enemyCounter = 0;

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
    scene.stage.addComponent(new Player(new PlayerState(scene, initPosition)));
    scene.stage.addComponent(new EnemySpawner(new EnemySpawnerState))
  }

  spawnLaser(scene: ECS.Scene, color: LaserColor) {
    const playerSprite = scene.findObjectByTag(Tags.PLAYER);
    const spriteName = `laser-${++this._laserCounter}`;

    const laserTexture = PIXI.Texture.from(`laser-${color}`);
    const laser = new ECS.Sprite(spriteName, laserTexture);

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
    laser.addTag(Tags.LASER);

    scene.stage.addChild(laser);
    scene.stage.addComponent(new Laser(new LaserState(scene, initPosition, Tags.LASER, spriteName)));
  }

  spawnEnemy(scene: ECS.Scene, position: Position, color: EnemyColor, variant: EnemyVariant) {
    const spriteName = `enemy-${++this._enemyCounter}`;

    const enemyTexture = PIXI.Texture.from(`enemy-${color}-${variant}`);
    const enemy = new ECS.Sprite(spriteName, enemyTexture);

    enemy.anchor.set(0.5, 0.5);
    enemy.position.set(position.x, position.y);
    enemy.addTag(Tags.ENEMY);

    scene.stage.addChild(enemy);
    scene.stage.addComponent(new Enemy(new EnemyState(scene, position, Tags.ENEMY, color, variant, spriteName)));
  }

}