import * as ECS from '../libs/pixi-ecs';
import * as PIXI from 'pixi.js';
import { SCENE_HEIGHT, SCENE_WIDTH, Position, Tag, PLAYER_STARTING_X, PLAYER_STARTING_Y, EnemyColor, EnemyVariant, LaserColor, LIFE_OFFSET_X, LIFE_OFFSET_Y, UI_Z_INDEX, STARTING_SCORE, TEXT_STYLE_SCORE, SCORE_TEXT_OFFSET_X, SCORE_TEXT_OFFSET_Y, MeteoriteColor, MeteoriteSize, CollectableType, LaserOrigin, TEXT_STYLE_TITLE, TEXT_STYLE_MENU_ITEM, TEXT_STYLE_MENU_ITEM_HOVER, HOW_TO_PLAY_TEXT, TEXT_STYLE_HOW_TO_PLAY_TITLE, TEXT_STYLE_HOW_TO_PLAY_TEXT } from './constants';
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
    this.loadGlobalComponents(scene);
    this._createBackground(scene);
    this.createPlayer(scene);
    this._createEnemySpawner(scene);
    this._createMeteoriteSpawner(scene);
    this._createGameStats(scene);
    this._createPlayerLives(scene);
    this._createScoreText(scene);
  }

  loadGameOverStage(scene: ECS.Scene, score: number) {
    this._createBackground(scene);
    this._createGameOverTitle(scene);
    this._createGameOverScoreText(scene, score);
    this._createGameOverStartAgain(scene);
    this._createBackToMenu(scene);
  }

  loadMenuStage(scene: ECS.Scene) {
    this._createBackground(scene);
    this._createTitle(scene);
    this._createMenuItems(scene);
  }

  loadHighScoresStage(scene: ECS.Scene) {
    // todo
  }

  loadHowToPlayStage(scene: ECS.Scene) {
    this._createBackground(scene);
    this._createHowToPlayTitle(scene);
    this._createHowToPlayText(scene);
    this._createHowToPlayControls(scene);
    this._createBackToMenu(scene);
  }

  createPlayer(scene: ECS.Scene) {
    const spriteName = 'player';

    const playerTexture = PIXI.Texture.from('player').clone();
    const playerSprite = new ECS.Sprite(spriteName, playerTexture);

    playerSprite.anchor.set(0.5);
    playerSprite.scale.set(0.8);
    playerSprite.position.x = PLAYER_STARTING_X;
    playerSprite.position.y = PLAYER_STARTING_Y;
    playerSprite.addTag(Tag.PLAYER);

    scene.stage.addChild(playerSprite);
    let playerComponent = new Player(new PlayerState(scene, { x: PLAYER_STARTING_X, y: PLAYER_STARTING_Y, angle: 0 }, 'player'));
    playerComponent.name = 'player';
    scene.stage.addComponent(playerComponent);
  }

  private _createBackground(scene: ECS.Scene) {
    const backgroundTexture = PIXI.Texture.from('background').clone();
    const background = new ECS.TilingSprite('background', backgroundTexture, SCENE_WIDTH, SCENE_HEIGHT);
    scene.stage.addChild(background);
  }

  private _createEnemySpawner(scene: ECS.Scene) {
    scene.stage.addComponent(new EnemySpawner(new SpawnerState));
  }

  private _createMeteoriteSpawner(scene: ECS.Scene) {
    scene.stage.addComponent(new MeteoriteSpawner(new SpawnerState));
  }

  private _createGameStats(scene: ECS.Scene) {
    let gameStatsComponent = new GameStats(new GameStatsState);
    gameStatsComponent.name = 'game-stats';
    scene.stage.addComponent(gameStatsComponent);
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

  private _createTitle(scene: ECS.Scene) {
    let text = new ECS.Text('title', 'Warped');
    text.style = TEXT_STYLE_TITLE;
    text.anchor.set(0.5);
    text.position.set(SCENE_WIDTH / 2, SCENE_HEIGHT / 6);
    scene.stage.addChild(text);
  }

  private _createMenuItems(scene: ECS.Scene) {
    const offset = 75;

    let startGame = new ECS.Text('start-game', 'Start Game');
    startGame.style = TEXT_STYLE_MENU_ITEM;
    startGame.anchor.set(0.5);
    startGame.position.set(SCENE_WIDTH / 2, SCENE_HEIGHT / 2.5);
    startGame.interactive = true;
    startGame.buttonMode = true;
    startGame.on('mouseover', () => { startGame.style = TEXT_STYLE_MENU_ITEM_HOVER });
    startGame.on('mouseout', () => { startGame.style = TEXT_STYLE_MENU_ITEM });
    startGame.on('click', () => {
      scene.callWithDelay(0, () => {
        scene.clearScene();
        this.loadGameStage(scene);
      });
    });
    scene.stage.addChild(startGame);

    let highScores = new ECS.Text('high-scores', 'High Scores');
    highScores.style = TEXT_STYLE_MENU_ITEM;
    highScores.anchor.set(0.5);
    highScores.position.set(SCENE_WIDTH / 2, SCENE_HEIGHT / 2.5 + startGame.getBounds().height / 2 + offset);
    highScores.interactive = true;
    highScores.buttonMode = true;
    highScores.on('mouseover', () => { highScores.style = TEXT_STYLE_MENU_ITEM_HOVER });
    highScores.on('mouseout', () => { highScores.style = TEXT_STYLE_MENU_ITEM });
    scene.stage.addChild(highScores);

    let howToPlay = new ECS.Text('how-to-play', 'How To Play');
    howToPlay.style = TEXT_STYLE_MENU_ITEM;
    howToPlay.anchor.set(0.5);
    howToPlay.position.set(SCENE_WIDTH / 2, SCENE_HEIGHT / 2.5 + startGame.getBounds().height / 2 + offset + highScores.getBounds().height / 2 + offset);
    howToPlay.interactive = true;
    howToPlay.buttonMode = true;
    howToPlay.on('mouseover', () => { howToPlay.style = TEXT_STYLE_MENU_ITEM_HOVER });
    howToPlay.on('mouseout', () => { howToPlay.style = TEXT_STYLE_MENU_ITEM });
    howToPlay.on('click', () => {
      scene.callWithDelay(0, () => {
        scene.clearScene();
        this.loadHowToPlayStage(scene);
      });
    });
    scene.stage.addChild(howToPlay);
  }

  private _createGameOverTitle(scene: ECS.Scene) {
    let gameOverTitle = new ECS.Text('game-over-title', 'Game Over!');
    gameOverTitle.style = TEXT_STYLE_TITLE;
    gameOverTitle.anchor.set(0.5);
    gameOverTitle.position.set(SCENE_WIDTH / 2, SCENE_HEIGHT / 3);
    scene.stage.addChild(gameOverTitle);
  }

  private _createGameOverScoreText(scene: ECS.Scene, score: number) {
    let scoreText = new ECS.Text('game-over-score', `Score: ${score}`);
    scoreText.style = TEXT_STYLE_MENU_ITEM;
    scoreText.anchor.set(0.5);
    scoreText.position.set(SCENE_WIDTH / 2, SCENE_HEIGHT / 2);
    scene.stage.addChild(scoreText);
  }

  private _createBackToMenu(scene: ECS.Scene) {
    let backToMenu = new ECS.Text('back-to-menu', 'Back to menu');
    backToMenu.style = TEXT_STYLE_MENU_ITEM;
    backToMenu.position.set(0 + SCORE_TEXT_OFFSET_X, SCENE_HEIGHT + SCORE_TEXT_OFFSET_Y - backToMenu.height);
    backToMenu.interactive = true;
    backToMenu.buttonMode = true;
    backToMenu.on('mouseover', () => { backToMenu.style = TEXT_STYLE_MENU_ITEM_HOVER });
    backToMenu.on('mouseout', () => { backToMenu.style = TEXT_STYLE_MENU_ITEM });
    backToMenu.on('click', () => {
      scene.callWithDelay(0, () => {
        scene.clearScene();
        this.loadMenuStage(scene);
      });
    });
    scene.stage.addChild(backToMenu);
  }

  private _createGameOverStartAgain(scene: ECS.Scene) {
    let startAgain = new ECS.Text('game-over-start-again', 'Start again');
    startAgain.style = TEXT_STYLE_MENU_ITEM;
    startAgain.anchor.set(1, 0);
    startAgain.position.set(SCENE_WIDTH - SCORE_TEXT_OFFSET_X, SCENE_HEIGHT + SCORE_TEXT_OFFSET_Y - startAgain.height);
    startAgain.interactive = true;
    startAgain.buttonMode = true;
    startAgain.on('mouseover', () => { startAgain.style = TEXT_STYLE_MENU_ITEM_HOVER });
    startAgain.on('mouseout', () => { startAgain.style = TEXT_STYLE_MENU_ITEM });
    startAgain.on('click', () => {
      scene.callWithDelay(0, () => {
        scene.clearScene();
        Factory.getInstance().loadGameStage(scene);
      });
    });
    scene.stage.addChild(startAgain);
  }

  private _createHowToPlayTitle(scene: ECS.Scene) {
    let gameOverTitle = new ECS.Text('how-to-play-title', 'How To Play');
    gameOverTitle.style = TEXT_STYLE_HOW_TO_PLAY_TITLE;
    gameOverTitle.anchor.set(0.5);
    gameOverTitle.position.set(SCENE_WIDTH / 2, SCENE_HEIGHT / 8);
    scene.stage.addChild(gameOverTitle);
  }

  private _createHowToPlayText(scene: ECS.Scene) {
    let gameOverTitle = new ECS.Text('how-to-play-text', HOW_TO_PLAY_TEXT);
    gameOverTitle.style = TEXT_STYLE_HOW_TO_PLAY_TEXT;
    gameOverTitle.anchor.set(0.5);
    gameOverTitle.position.set(SCENE_WIDTH / 2, SCENE_HEIGHT / 2.5);
    scene.stage.addChild(gameOverTitle);
  }

  private _createHowToPlayControls(scene: ECS.Scene) {
    const leftClick = new ECS.Sprite(`left-click`, PIXI.Texture.from('left-click').clone());
    leftClick.anchor.set(0.5);
    leftClick.scale.set(0.4);
    leftClick.position.set(500, 750);

    let leftClickText = new ECS.Text('left-click-text', 'Shoot');
    leftClickText.style = TEXT_STYLE_HOW_TO_PLAY_TEXT;
    leftClickText.anchor.set(0.5);
    leftClickText.position.set(leftClick.position.x + leftClick.width + 60, leftClick.position.y);

    scene.stage.addChild(leftClick);
    scene.stage.addChild(leftClickText);

    const keyTexture = PIXI.Texture.from('key').clone();
    const w = new ECS.Sprite(`w-key`, keyTexture);
    const a = new ECS.Sprite(`a-key`, keyTexture);
    const s = new ECS.Sprite(`s-key`, keyTexture);
    const d = new ECS.Sprite(`d-key`, keyTexture);

    w.anchor.set(0.5);
    a.anchor.set(0.5);
    s.anchor.set(0.5);
    d.anchor.set(0.5);

    w.scale.set(0.3);
    a.scale.set(0.3);
    s.scale.set(0.3);
    d.scale.set(0.3);

    s.position.set(leftClickText.x + 750, leftClick.y + 30);
    w.position.set(s.x, s.y - s.height - 20);
    a.position.set(s.x - s.width - 20, s.y);
    d.position.set(s.x + s.width + 20, s.y);

    scene.stage.addChild(w);
    scene.stage.addChild(a);
    scene.stage.addChild(s);
    scene.stage.addChild(d);

    this._createKeySymbol(scene, 'W', w.position.x, w.position.y);
    this._createKeySymbol(scene, 'A', a.position.x, a.position.y);
    this._createKeySymbol(scene, 'S', s.position.x, s.position.y);
    this._createKeySymbol(scene, 'D', d.position.x, d.position.y);

    let keysText = new ECS.Text('keys-text', 'Move');
    keysText.style = TEXT_STYLE_HOW_TO_PLAY_TEXT;
    keysText.anchor.set(0.5);
    keysText.position.set(s.x - s.width - 120, leftClickText.y);

    scene.stage.addChild(keysText);
  }

  private _createKeySymbol(scene: ECS.Scene, symbol: string, x: number, y: number) {
    let symbolText = new ECS.Text(`${symbol.toLowerCase()}-key-text`, symbol);
    symbolText.style = TEXT_STYLE_HOW_TO_PLAY_TEXT;
    symbolText.anchor.set(0.5);
    symbolText.position.set(x, y + 6);
    scene.stage.addChild(symbolText);
  }

  createLifeSprite(order: number): ECS.Sprite {
    const heartSprite = new ECS.Sprite(`life-${order}`, PIXI.Texture.from('heart').clone());
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

    const laserTexture = PIXI.Texture.from(`laser-${color}`).clone();
    const laserSprite = new ECS.Sprite(spriteName, laserTexture);

    laserSprite.anchor.set(0.5);
    laserSprite.position.set(position.x, position.y)
    laserSprite.rotation = position.angle;
    laserSprite.scale.set(0.25);

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
    scene.stage.addComponent(new Laser(new LaserState(scene, position, tag, spriteName)));
  }

  spawnEnemy(scene: ECS.Scene, color: EnemyColor, variant: EnemyVariant) {
    const spriteName = `enemy-${++this._enemyCounter}`;

    const enemyTexture = PIXI.Texture.from(`enemy-${color}-${variant}`).clone();
    const enemySprite = new ECS.Sprite(spriteName, enemyTexture);

    enemySprite.anchor.set(0.5);
    enemySprite.scale.set(0.7);

    const position = this._getRandomSpawnPoint(enemySprite);
    enemySprite.position.set(position.x, position.y);

    enemySprite.addTag(Tag.ENEMY);

    scene.stage.addChild(enemySprite);
    scene.stage.addComponent(new Enemy(new EnemyState(scene, position, Tag.ENEMY, color, variant, spriteName)));
  }

  spawnMeteorite(scene: ECS.Scene, color: MeteoriteColor, size: MeteoriteSize, position?: Position) {
    const spriteName = `meteorite-${++this._meteoriteCounter}`;

    const meteoriteTexture = PIXI.Texture.from(`meteorite-${color}`).clone();
    const meteoriteSprite = new ECS.Sprite(spriteName, meteoriteTexture);

    meteoriteSprite.anchor.set(0.5);

    switch (size) {
      case MeteoriteSize.SMALL:
        meteoriteSprite.scale.set(0.5);
        break;
      case MeteoriteSize.LARGE:
        meteoriteSprite.scale.set(1.5);
        break
      default:
        meteoriteSprite.scale.set(1);
        break;
    }

    meteoriteSprite.addTag(Tag.METEORITE);
    if (!position) {
      position = this._getRandomSpawnPoint(meteoriteSprite);
    }
    meteoriteSprite.position.set(position.x, position.y);
    meteoriteSprite.rotation = position.angle;

    scene.stage.addChild(meteoriteSprite);
    scene.stage.addComponent(new Meteorite(new MeteoriteState(scene, position, Tag.ENEMY, color, size, spriteName)));
  }

  spawnCollectable(scene: ECS.Scene, position: Position, type: CollectableType) {
    const spriteName = `collectable-${++this._collectableCounter}`;

    let collectableTexture: PIXI.Texture;
    switch (type) {
      case CollectableType.LIFE:
        collectableTexture = PIXI.Texture.from('collectable-life').clone();
        break;
      case CollectableType.LASER:
        collectableTexture = PIXI.Texture.from('collectable-laser').clone();
        break;
      case CollectableType.SHIELD:
        collectableTexture = PIXI.Texture.from('collectable-shield').clone();
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
    scene.stage.addComponent(new Collectable(new CollectableState(scene, position, Tag.COLLECTABLE, type, spriteName)));
  }

  spawnExplosion(scene: ECS.Scene, position: Position, scale?: number) {
    const spriteName = 'explosion';

    const explosionSprite = new ECS.AnimatedSprite(spriteName, this._createExplosionTextures());
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
    const shieldTexture = PIXI.Texture.from('shield').clone();
    const shieldSprite = new ECS.Sprite(spriteName, shieldTexture);
    shieldSprite.anchor.set(0.5);
    shieldSprite.scale.set(1);
    shieldSprite.position.set(position.x, position.y);
    scene.stage.addChild(shieldSprite);
  }

  private _getRandomSpawnPoint(container: ECS.Container): Position {
    const a = SCENE_WIDTH + container.width;
    const b = SCENE_HEIGHT + container.height;
    const perimeter = 2 * a + 2 * b;
    const rand = Math.random() * perimeter;

    let x: number;
    let y: number;
    let angle: number;

    const angleMax = 0.8;
    const angleMin = 0.2;

    if (rand < a) {
      // top
      x = rand;
      y = -container.height / 2;
      angle = (Math.random() * Math.PI * (angleMax - angleMin)) + ((0.5 + angleMin) * Math.PI);
    } else if (rand < a + b) {
      // right
      x = SCENE_WIDTH + container.width / 2;
      y = rand - a;
      angle = (Math.random() * Math.PI * (angleMax - angleMin)) + ((1 + angleMin) * Math.PI);
    } else if (rand < 2 * a + b) {
      // bottom
      x = rand - a - b;
      y = SCENE_HEIGHT + container.height / 2;
      angle = (Math.random() * Math.PI * (angleMax - angleMin)) + ((1.5 + angleMin) * Math.PI);
    } else {
      // left
      x = -container.width / 2;
      y = rand - 2 * a - b;
      angle = (Math.random() * Math.PI * (angleMax - angleMin)) + ((-0.5 + angleMin) * Math.PI);
    }

    return { x: x, y: y, angle: angle };
  }

}