import * as ECS from '../libs/pixi-ecs';
import * as PIXI from 'pixi.js';
import { SCENE_HEIGHT, SCENE_WIDTH, Position, Tags, LASER_OFFSET, PLAYER_STARTING_X, PLAYER_STARTING_Y, EnemyColor, EnemyVariant, LaserColor, LIFE_OFFSET_X, LIFE_OFFSET_Y, UI_Z_INDEX, STARTING_SCORE, TEXT_STYLE_SCORE, SCORE_TEXT_OFFSET_X, SCORE_TEXT_OFFSET_Y } from './constants';
import { EnemySpawnerState, EnemyState, GameStatsState, LaserState, PlayerState } from './state-structs';
import { Player } from './player';
import { Laser } from './laser';
import { Enemy } from './enemy';
import { EnemySpawner } from './enemy-spawner';
import { GameStats } from './game-stats';

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

    scene.stage.sortableChildren = true;
    this._createBackground(scene);
    this._createPlayer(scene);
    this._createEnemySpawner(scene);
    this._createGameStats(scene);
    this._createPlayerLives(scene);
    this._createScoreText(scene);
  }

  private _createPlayer(scene: ECS.Scene) {
    const playerTexture = PIXI.Texture.from('player');
    const playerSprite = new ECS.Sprite('player', playerTexture);

    playerSprite.anchor.set(0.5);
    playerSprite.position.x = PLAYER_STARTING_X;
    playerSprite.position.y = PLAYER_STARTING_Y;
    playerSprite.addTag(Tags.PLAYER);

    scene.stage.addChild(playerSprite);
    scene.stage.addComponent(new Player(new PlayerState(scene, { x: PLAYER_STARTING_X, y: PLAYER_STARTING_Y, angle: 0 })));
  }

  private _createBackground(scene: ECS.Scene) {
    const backgroundTexture = PIXI.Texture.from('background');
    const background = new ECS.TilingSprite('background', backgroundTexture, SCENE_WIDTH, SCENE_HEIGHT);
    scene.stage.addChild(background);
  }

  private _createEnemySpawner(scene: ECS.Scene) {
    scene.stage.addComponent(new EnemySpawner(new EnemySpawnerState));
  }

  private _createGameStats(scene: ECS.Scene) {
    scene.stage.addComponent(new GameStats(new GameStatsState));
  }

  private _createPlayerLives(scene: ECS.Scene) {
    scene.stage.addChild(this.createLifeSprite(1));
    scene.stage.addChild(this.createLifeSprite(2));
    scene.stage.addChild(this.createLifeSprite(3));
  }

  private _createScoreText(scene: ECS.Scene) {
    let text = new ECS.Text('score-text', `${STARTING_SCORE}`);
    text.style = TEXT_STYLE_SCORE;
    text.position.set(0 + SCORE_TEXT_OFFSET_X, SCENE_HEIGHT + SCORE_TEXT_OFFSET_Y - text.height);
    text.zIndex = UI_Z_INDEX;
    scene.stage.addChild(text);
  }

  createLifeSprite(order: number): ECS.Sprite {
    const heartSprite = new ECS.Sprite(`life-${order}`, PIXI.Texture.from('heart'));
    heartSprite.anchor.set(0.5);
    heartSprite.scale.set(0.4);
    heartSprite.zIndex = UI_Z_INDEX;

    const x = SCENE_WIDTH + LIFE_OFFSET_X - heartSprite.width / 2 - (order - 1) * heartSprite.width;
    const y = SCENE_HEIGHT + LIFE_OFFSET_Y - heartSprite.height / 2;
    heartSprite.position.set(x, y);

    return heartSprite;
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

    laser.anchor.set(0.5);
    laser.position.set(initPosition.x, initPosition.y)
    laser.rotation = initPosition.angle;
    laser.scale.set(0.3);
    laser.addTag(Tags.LASER);

    scene.stage.addChild(laser);
    scene.stage.addComponent(new Laser(new LaserState(scene, initPosition, Tags.LASER, spriteName)));
  }

  spawnEnemy(scene: ECS.Scene, position: Position, color: EnemyColor, variant: EnemyVariant) {
    const spriteName = `enemy-${++this._enemyCounter}`;

    const enemyTexture = PIXI.Texture.from(`enemy-${color}-${variant}`);
    const enemy = new ECS.Sprite(spriteName, enemyTexture);

    enemy.anchor.set(0.5);
    enemy.position.set(position.x, position.y);
    enemy.addTag(Tags.ENEMY);

    scene.stage.addChild(enemy);
    scene.stage.addComponent(new Enemy(new EnemyState(scene, position, Tags.ENEMY, color, variant, spriteName)));
  }

}