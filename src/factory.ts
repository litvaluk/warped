import * as ECS from '../libs/pixi-ecs';
import * as PIXI from 'pixi.js';
import { SCENE_HEIGHT, SCENE_WIDTH, Position, Tag, PLAYER_STARTING_X, PLAYER_STARTING_Y, EnemyColor, EnemyVariant, LaserColor, LIFE_OFFSET_X, LIFE_OFFSET_Y, UI_Z_INDEX, STARTING_SCORE, TEXT_STYLE_SCORE, SCORE_TEXT_OFFSET_X, SCORE_TEXT_OFFSET_Y, MeteoriteColor, MeteoriteSize, CollectableType, LaserOrigin } from './constants';
import { SpawnerState, EnemyState, GameStatsState, LaserState, MeteoriteState, PlayerState, CollectableState } from './state-structs';
import { Player } from './player';
import { Laser } from './laser';
import { Enemy } from './enemy';
import { EnemySpawner } from './enemy-spawner';
import { GameStats } from './game-stats';
import { Meteorite } from './meteorite';
import { MeteoriteSpawner } from './meteorite-spawner';
import { Collectable } from './collectable';
import { Rectangle } from 'pixi.js';

export class Factory {

  private static _instance: Factory;

  private currentComponents: ECS.Component<any>[] = [];

  private _laserCounter = 0;
  private _enemyCounter = 0;
  private _meteoriteCounter = 0;
  private _collectableCounter = 0;

  public static getInstance(): Factory {
    if (!Factory._instance) {
      Factory._instance = new Factory();
    }
    return Factory._instance;
  }

  loadGlobalComponents(scene: ECS.Scene) {
    scene.addGlobalComponentAndRun(new ECS.KeyInputComponent());
    scene.addGlobalComponentAndRun(new ECS.PointerInputComponent({
      handleClick: false,
      handlePointerDown: true,
      handlePointerOver: true,
      handlePointerRelease: true
    }));
  }

  loadGameStage(scene: ECS.Scene) {
    scene.stage.sortableChildren = true;
    this._createBackground(scene);
    this.createPlayer(scene);
    this._createEnemySpawner(scene);
    this._createMeteoriteSpawner(scene);
    this._createGameStats(scene);
    this._createPlayerLives(scene);
    this._createScoreText(scene);
  }

  loadMenuStage(scene: ECS.Scene) {
    // todo
  }

  loadHighScoresStage(scene: ECS.Scene) {
    // todo
  }

  loadAboutStage(scene: ECS.Scene) {
    // todo
  }

  clearStage(scene: ECS.Scene) {
    this.currentComponents.forEach(component => {
      scene.stage.removeComponent(component);
    })
    this.currentComponents = [];
    let stageChildrenLength = scene.stage.children.length;
    scene.stage.removeChildren(0, stageChildrenLength);
    scene.stage.sortableChildren = false;
  }

  private _addComponentToStage(scene: ECS.Scene, component: ECS.Component<any>) {
    this.currentComponents.push(component);
    scene.stage.addComponent(component);
  }

  createPlayer(scene: ECS.Scene) {
    const spriteName = 'player';

    const playerTexture = PIXI.Texture.from('player');
    const playerSprite = new ECS.Sprite(spriteName, playerTexture);

    playerSprite.anchor.set(0.5);
    playerSprite.position.x = PLAYER_STARTING_X;
    playerSprite.position.y = PLAYER_STARTING_Y;
    playerSprite.addTag(Tag.PLAYER);

    scene.stage.addChild(playerSprite);
    let playerComponent = new Player(new PlayerState(scene, { x: PLAYER_STARTING_X, y: PLAYER_STARTING_Y, angle: 0 }, 'player'));
    playerComponent.name = 'player';
    this._addComponentToStage(scene, playerComponent);
  }

  private _createBackground(scene: ECS.Scene) {
    const backgroundTexture = PIXI.Texture.from('background');
    const background = new ECS.TilingSprite('background', backgroundTexture, SCENE_WIDTH, SCENE_HEIGHT);
    scene.stage.addChild(background);
  }

  private _createEnemySpawner(scene: ECS.Scene) {
    this._addComponentToStage(scene, new EnemySpawner(new SpawnerState));
  }

  private _createMeteoriteSpawner(scene: ECS.Scene) {
    this._addComponentToStage(scene, new MeteoriteSpawner(new SpawnerState));
  }

  private _createGameStats(scene: ECS.Scene) {
    let gameStatsComponent = new GameStats(new GameStatsState);
    gameStatsComponent.name = 'game-stats';
    this._addComponentToStage(scene, gameStatsComponent);
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

  spawnLaser(scene: ECS.Scene, color: LaserColor, position: Position, laserOrigin: LaserOrigin) {
    const spriteName = `laser-${++this._laserCounter}`;

    const laserTexture = PIXI.Texture.from(`laser-${color}`);
    const laserSprite = new ECS.Sprite(spriteName, laserTexture);

    laserSprite.anchor.set(0.5);
    laserSprite.position.set(position.x, position.y)
    laserSprite.rotation = position.angle;
    laserSprite.scale.set(0.3);

    let tag: Tag;
    switch (laserOrigin) {
      case (LaserOrigin.PLAYER):
        tag = Tag.LASER_PLAYER;
        break;
      case (LaserOrigin.ENEMY):
        tag = Tag.LASER_ENEMY
        break;
    }

    laserSprite.addTag(tag);

    scene.stage.addChild(laserSprite);
    this._addComponentToStage(scene, new Laser(new LaserState(scene, position, tag, spriteName)));
  }

  spawnEnemy(scene: ECS.Scene, position: Position, color: EnemyColor, variant: EnemyVariant) {
    const spriteName = `enemy-${++this._enemyCounter}`;

    const enemyTexture = PIXI.Texture.from(`enemy-${color}-${variant}`);
    const enemySprite = new ECS.Sprite(spriteName, enemyTexture);

    enemySprite.anchor.set(0.5);
    enemySprite.position.set(position.x, position.y);
    enemySprite.addTag(Tag.ENEMY);

    scene.stage.addChild(enemySprite);
    this._addComponentToStage(scene, new Enemy(new EnemyState(scene, position, Tag.ENEMY, color, variant, spriteName)));
  }

  spawnMeteorite(scene: ECS.Scene, position: Position, color: MeteoriteColor, size: MeteoriteSize) {
    const spriteName = `meteorite-${++this._meteoriteCounter}`;

    const meteoriteTexture = PIXI.Texture.from(`meteorite-${color}`);
    const meteoriteSprite = new ECS.Sprite(spriteName, meteoriteTexture);

    meteoriteSprite.anchor.set(0.5);
    meteoriteSprite.position.set(position.x, position.y);

    switch (size) {
      case MeteoriteSize.SMALL:
        meteoriteSprite.scale.set(0.5);
        break;
      case MeteoriteSize.LARGE:
        meteoriteSprite.scale.set(1.5);
        break
      default:
        break;
    }

    meteoriteSprite.addTag(Tag.METEORITE);

    scene.stage.addChild(meteoriteSprite);
    this._addComponentToStage(scene, new Meteorite(new MeteoriteState(scene, position, Tag.ENEMY, color, size, spriteName)));
  }

  spawnCollectable(scene: ECS.Scene, position: Position, type: CollectableType) {
    const spriteName = `collectable-${++this._collectableCounter}`;

    let collectableTexture: PIXI.Texture;
    switch (type) {
      case CollectableType.LIFE:
        collectableTexture = PIXI.Texture.from('collectable-life');
        break;
      case CollectableType.LASER:
        collectableTexture = PIXI.Texture.from('collectable-laser');
        break;
      case CollectableType.SHIELD:
        collectableTexture = PIXI.Texture.from('collectable-shield');
        break;
      default:
        break;
    }

    const collectableSprite = new ECS.Sprite(spriteName, collectableTexture);
    collectableSprite.scale.set(0.15);
    collectableSprite.anchor.set(0.5);
    collectableSprite.position.set(position.x, position.y);
    collectableSprite.addTag(Tag.COLLECTABLE);

    scene.stage.addChild(collectableSprite);
    this._addComponentToStage(scene, new Collectable(new CollectableState(scene, position, Tag.COLLECTABLE, type, spriteName)));
  }

  spawnExplosion(scene: ECS.Scene, position: Position, scale?: number) {
    const spriteName = 'explosion';

    const explosionSprite = new ECS.AnimatedSprite('explosion', this._createExplosionTextures());
    explosionSprite.anchor.set(0.5);
    explosionSprite.position.set(position.x, position.y);
    explosionSprite.animationSpeed = 0.5;
    explosionSprite.loop = false;
    explosionSprite.onComplete = () => {
      if (explosionSprite.parent) {
        explosionSprite.parent.removeChild(explosionSprite);
      }
    };

    if (scale) {
      explosionSprite.scale.set(scale);
    }

    scene.stage.addChild(explosionSprite);

    explosionSprite.play();
  }

  private _createExplosionTextures(): PIXI.Texture[] {
    let textures: PIXI.Texture[] = [];
    let spritesheet = PIXI.BaseTexture.from('explosion');
    for (let i = 0; i < 12; i++) {
      textures.push(new PIXI.Texture(spritesheet, new Rectangle(i * 192, 0, 192, 192)));
    }
    return textures;
  }

  spawnShield(scene: ECS.Scene, position: Position) {
    const spriteName = 'shield';
    const shieldTexture = PIXI.Texture.from('shield');
    const shieldSprite = new ECS.Sprite(spriteName, shieldTexture);
    shieldSprite.anchor.set(0.5);
    shieldSprite.scale.set(1.25);
    shieldSprite.position.set(position.x, position.y);
    scene.stage.addChild(shieldSprite);
  }

  addToCurrentComponents(component: ECS.Component) {
    this.currentComponents.push(component);
  }

}