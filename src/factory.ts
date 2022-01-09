import * as ECS from '../libs/pixi-ecs';
import * as PIXI from 'pixi.js';
import * as PIXISound from '@pixi/sound';
import { SCENE_HEIGHT, SCENE_WIDTH, Position, Tag, PLAYER_STARTING_X, PLAYER_STARTING_Y, EnemyColor, EnemyVariant, LaserColor, LIFE_OFFSET_X, LIFE_OFFSET_Y, UI_Z_INDEX, STARTING_SCORE, TEXT_STYLE_SCORE, SCORE_TEXT_OFFSET_X, SCORE_TEXT_OFFSET_Y, MeteoriteColor, MeteoriteSize, CollectableType, LaserOrigin, TEXT_STYLE_TITLE, TEXT_STYLE_MENU_ITEM, TEXT_STYLE_MENU_ITEM_HOVER, HOW_TO_PLAY_TEXT, TEXT_STYLE_HOW_TO_PLAY_TITLE, TEXT_STYLE_HOW_TO_PLAY_TEXT, PLAY_SOUND, VOLUME } from './constants';
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

  loadHowToPlayStage(scene: ECS.Scene) {
    this._createBackground(scene);
    this._createHowToPlayTitle(scene);
    this._createHowToPlayText(scene);
    this._createHowToPlayControls(scene);
    this._createBackToMenu(scene);
  }

  createPlayer(scene: ECS.Scene) {
    new ECS.Builder(scene)
      .asSprite(PIXI.Texture.from('player'))
      .anchor(0.5)
      .scale(0.8)
      .localPos(PLAYER_STARTING_X, PLAYER_STARTING_Y)
      .withName('player')
      .withTag(Tag.PLAYER)
      .withComponent(new Player(new PlayerState(scene, { x: PLAYER_STARTING_X, y: PLAYER_STARTING_Y, angle: 0 }, 'player')))
      .withParent(scene.stage)
      .build();
  }

  private _createBackground(scene: ECS.Scene) {
    new ECS.Builder(scene)
      .asTilingSprite(PIXI.Texture.from('background'), SCENE_WIDTH, SCENE_HEIGHT)
      .withName('background')
      .withParent(scene.stage)
      .build();
  }

  private _createEnemySpawner(scene: ECS.Scene) {
    scene.stage.addComponent(new EnemySpawner(new SpawnerState));
  }

  private _createMeteoriteSpawner(scene: ECS.Scene) {
    scene.stage.addComponent(new MeteoriteSpawner(new SpawnerState));
  }

  private _createGameStats(scene: ECS.Scene) {
    scene.stage.addComponent(new GameStats(new GameStatsState));
  }

  private _createPlayerLives(scene: ECS.Scene) {
    this.createLifeSprite(scene, 1);
    this.createLifeSprite(scene, 2);
    this.createLifeSprite(scene, 3);
  }

  private _createScoreText(scene: ECS.Scene) {
    const name = 'score-text';
    const score = new ECS.Builder(scene)
      .asText(`${STARTING_SCORE}`, TEXT_STYLE_SCORE)
      .withName(name)
      .withParent(scene.stage)
      .build();

    score.position.set(0 + SCORE_TEXT_OFFSET_X, SCENE_HEIGHT + SCORE_TEXT_OFFSET_Y - score.height);
    score.zIndex = UI_Z_INDEX;
  }

  private _createTitle(scene: ECS.Scene) {
    const name = 'title';
    new ECS.Builder(scene)
      .asText('Warped', TEXT_STYLE_TITLE)
      .anchor(0.5)
      .localPos(SCENE_WIDTH / 2, SCENE_HEIGHT / 6)
      .withName(name)
      .withParent(scene.stage)
      .build();
  }

  private _createMenuItems(scene: ECS.Scene) {
    const offset = 75;

    const startGameName = 'start-game';
    const startGame: ECS.Text = new ECS.Builder(scene)
      .asText('Start Game', TEXT_STYLE_MENU_ITEM)
      .anchor(0.5)
      .localPos(SCENE_WIDTH / 2, SCENE_HEIGHT / 2.2)
      .withName(startGameName)
      .withParent(scene.stage)
      .build();
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

    const howToPlayName = 'how-to-play';
    const howToPlay: ECS.Text = new ECS.Builder(scene)
      .asText('How To Play', TEXT_STYLE_MENU_ITEM)
      .anchor(0.5)
      .localPos(SCENE_WIDTH / 2, SCENE_HEIGHT / 2.2 + startGame.getBounds().height / 2 + offset)
      .withName(howToPlayName)
      .withParent(scene.stage)
      .build();
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
  }

  private _createGameOverTitle(scene: ECS.Scene) {
    const name = 'game-over-title';

    new ECS.Builder(scene)
      .asText('Game Over!', TEXT_STYLE_TITLE)
      .anchor(0.5)
      .localPos(SCENE_WIDTH / 2, SCENE_HEIGHT / 3)
      .withName(name)
      .withParent(scene.stage)
      .build();
  }

  private _createGameOverScoreText(scene: ECS.Scene, score: number) {
    const name = 'game-over-score';
    new ECS.Builder(scene)
      .asText(`Score: ${score}`, TEXT_STYLE_MENU_ITEM)
      .anchor(0.5)
      .localPos(SCENE_WIDTH / 2, SCENE_HEIGHT / 2)
      .withName(name)
      .withParent(scene.stage)
      .build();
  }

  private _createBackToMenu(scene: ECS.Scene) {
    const name = 'back-to-menu';
    const backToMenu: ECS.Text = new ECS.Builder(scene)
      .asText('Back to menu', TEXT_STYLE_MENU_ITEM)
      .withName(name)
      .withParent(scene.stage)
      .build();

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
  }

  private _createGameOverStartAgain(scene: ECS.Scene) {
    const name = 'game-over-start-again';
    const startAgain: ECS.Text = new ECS.Builder(scene)
      .asText('Start again', TEXT_STYLE_MENU_ITEM)
      .anchor(1, 0)
      .withName(name)
      .withParent(scene.stage)
      .build();

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
  }

  private _createHowToPlayTitle(scene: ECS.Scene) {
    const name = 'how-to-play-title';
    new ECS.Builder(scene)
      .asText('How To Play', TEXT_STYLE_HOW_TO_PLAY_TITLE)
      .anchor(0.5)
      .localPos(SCENE_WIDTH / 2, SCENE_HEIGHT / 8)
      .withName(name)
      .withParent(scene.stage)
      .build();
  }

  private _createHowToPlayText(scene: ECS.Scene) {
    const name = 'how-to-play-text';
    new ECS.Builder(scene)
      .asText(HOW_TO_PLAY_TEXT, TEXT_STYLE_HOW_TO_PLAY_TEXT)
      .anchor(0.5)
      .localPos(SCENE_WIDTH / 2, SCENE_HEIGHT / 2.5)
      .withName(name)
      .withParent(scene.stage)
      .build();
  }

  private _createHowToPlayControls(scene: ECS.Scene) {
    const leftClickName = 'left-click';
    const leftClick: ECS.Sprite = new ECS.Builder(scene)
      .asSprite(PIXI.Texture.from('left-click'))
      .anchor(0.5)
      .scale(0.4)
      .localPos(500, 750)
      .withName(leftClickName)
      .withParent(scene.stage)
      .build();

    const leftClickTextName = 'left-click-text';
    const leftClickText: ECS.Text = new ECS.Builder(scene)
      .asText('Shoot', TEXT_STYLE_HOW_TO_PLAY_TEXT)
      .anchor(0.5)
      .localPos(leftClick.position.x + leftClick.width + 60, leftClick.position.y)
      .withName(leftClickTextName)
      .withParent(scene.stage)
      .build();

    const sKeyName = 's-key';
    const sKey: ECS.Sprite = new ECS.Builder(scene)
      .asSprite(PIXI.Texture.from('key'))
      .anchor(0.5)
      .scale(0.3)
      .localPos(leftClickText.x + 750, leftClick.y + 30)
      .withName(sKeyName)
      .withParent(scene.stage)
      .build();

    const wKeyName = 'w-key';
    const wKey: ECS.Sprite = new ECS.Builder(scene)
      .asSprite(PIXI.Texture.from('key'))
      .anchor(0.5)
      .scale(0.3)
      .localPos(sKey.x, sKey.y - sKey.height - 20)
      .withName(wKeyName)
      .withParent(scene.stage)
      .build();

    const aKeyName = 'a-key';
    const aKey: ECS.Sprite = new ECS.Builder(scene)
      .asSprite(PIXI.Texture.from('key'))
      .anchor(0.5)
      .scale(0.3)
      .localPos(sKey.x - sKey.width - 20, sKey.y)
      .withName(aKeyName)
      .withParent(scene.stage)
      .build();

    const dKeyName = 'd-key';
    const dKey: ECS.Sprite = new ECS.Builder(scene)
      .asSprite(PIXI.Texture.from('key'))
      .anchor(0.5)
      .scale(0.3)
      .localPos(sKey.x + sKey.width + 20, sKey.y)
      .withName(dKeyName)
      .withParent(scene.stage)
      .build();

    this._createKeySymbol(scene, 'W', wKey.position.x, wKey.position.y);
    this._createKeySymbol(scene, 'A', aKey.position.x, aKey.position.y);
    this._createKeySymbol(scene, 'S', sKey.position.x, sKey.position.y);
    this._createKeySymbol(scene, 'D', dKey.position.x, dKey.position.y);

    const keysTextName = 'keys-text';
    new ECS.Builder(scene)
      .asText('Move', TEXT_STYLE_HOW_TO_PLAY_TEXT)
      .anchor(0.5)
      .localPos(sKey.x - sKey.width - 120, leftClickText.y)
      .withName(keysTextName)
      .withParent(scene.stage)
      .build();
  }



  createLifeSprite(scene: ECS.Scene, order: number) {
    const name = `life-${order}`;
    const heart: ECS.Sprite = new ECS.Builder(scene)
      .asSprite(PIXI.Texture.from('heart'))
      .anchor(0.5)
      .scale(0.4)
      .withName(name)
      .withParent(scene.stage)
      .build();

    const x = SCENE_WIDTH + LIFE_OFFSET_X - heart.width / 2 - (order - 1) * heart.width;
    const y = SCENE_HEIGHT + LIFE_OFFSET_Y - heart.height / 2;
    heart.position.set(x, y);

    heart.zIndex = UI_Z_INDEX;
  }

  spawnLaser(scene: ECS.Scene, color: LaserColor, position: Position, laserOrigin: LaserOrigin, playSound: boolean = true) {
    const name = `laser-${++this._laserCounter}`;
    let tag: Tag;
    switch (laserOrigin) {
      case (LaserOrigin.PLAYER):
        tag = Tag.LASER_PLAYER;
        break;
      case (LaserOrigin.ENEMY):
        tag = Tag.LASER_ENEMY
        break;
    }

    const laser: ECS.Sprite = new ECS.Builder(scene)
      .asSprite(PIXI.Texture.from(`laser-${color}`))
      .anchor(0.5)
      .scale(0.25)
      .localPos(position.x, position.y)
      .withName(name)
      .withTag(tag)
      .withComponent(new Laser(new LaserState(scene, position, tag, name)))
      .withParent(scene.stage)
      .build();

    laser.rotation = position.angle;

    if (PLAY_SOUND && playSound) {
      PIXISound.sound.play('laser-sfx', { volume: VOLUME * 0.2 });
    }
  }

  spawnEnemy(scene: ECS.Scene, color: EnemyColor, variant: EnemyVariant) {
    const name = `enemy-${++this._enemyCounter}`;
    const enemy: ECS.Sprite = new ECS.Builder(scene)
      .asSprite(PIXI.Texture.from(`enemy-${color}-${variant}`))
      .anchor(0.5)
      .scale(0.7)
      .withName(name)
      .withTag(Tag.ENEMY)
      .withParent(scene.stage)
      .build();

    const position = this._getRandomSpawnPoint(enemy);
    enemy.position.set(position.x, position.y);
    enemy.addComponent(new Enemy(new EnemyState(scene, position, Tag.ENEMY, color, variant, name)));
  }

  spawnMeteorite(scene: ECS.Scene, color: MeteoriteColor, size: MeteoriteSize, position?: Position) {
    const name = `meteorite-${++this._meteoriteCounter}`;
    const meteorite: ECS.Sprite = new ECS.Builder(scene)
      .asSprite(PIXI.Texture.from(`meteorite-${color}`))
      .anchor(0.5)
      .scale(this._getMeteoriteScaleFromSize(size))
      .withName(name)
      .withTag(Tag.METEORITE)
      .withParent(scene.stage)
      .build();

    if (!position) {
      position = this._getRandomSpawnPoint(meteorite);
    }

    meteorite.position.set(position.x, position.y);
    meteorite.rotation = position.angle;
    meteorite.addComponent(new Meteorite(new MeteoriteState(scene, position, Tag.ENEMY, color, size, name)))
  }

  spawnCollectable(scene: ECS.Scene, position: Position, type: CollectableType) {
    const name = `collectable-${++this._collectableCounter}`;
    const collectableTexture: PIXI.Texture = this._getCollectableTexture(type);

    new ECS.Builder(scene)
      .asSprite(collectableTexture)
      .anchor(0.5)
      .scale(0.15)
      .localPos(position.x, position.y)
      .withName(name)
      .withTag(Tag.COLLECTABLE)
      .withComponent(new Collectable(new CollectableState(scene, position, Tag.COLLECTABLE, type, name)))
      .withParent(scene.stage)
      .build();
  }

  spawnExplosion(scene: ECS.Scene, position: Position, scale?: number, playSound: boolean = true) {
    const name = 'explosion';
    const explosion: ECS.AnimatedSprite = new ECS.Builder(scene)
      .asAnimatedSprite(this._createExplosionTextures())
      .anchor(0.5)
      .scale(scale ? scale : 1)
      .localPos(position.x, position.y)
      .withName(name)
      .withParent(scene.stage)
      .build();

    explosion.animationSpeed = 0.5;
    explosion.loop = false;
    explosion.onComplete = () => {
      if (explosion.parent) {
        explosion.parent.removeChild(explosion);
      }
    };

    explosion.play();

    if (PLAY_SOUND && playSound) {
      PIXISound.sound.play('explosion-sfx', { volume: VOLUME });
    }
  }

  spawnShield(scene: ECS.Scene, position: Position) {
    const name = 'shield';
    new ECS.Builder(scene)
      .asSprite(PIXI.Texture.from('shield'))
      .anchor(0.5)
      .scale(1)
      .localPos(position.x, position.y)
      .withName(name)
      .withParent(scene.stage)
      .build();
  }

  private _getMeteoriteScaleFromSize(size: MeteoriteSize) {
    switch (size) {
      case MeteoriteSize.SMALL:
        return 0.5
      case MeteoriteSize.LARGE:
        return 1.5;
      default:
        return 1;
    }
  }

  private _getCollectableTexture(type: CollectableType): PIXI.Texture {
    switch (type) {
      case CollectableType.LIFE:
        return PIXI.Texture.from('collectable-life');
      case CollectableType.LASER:
        return PIXI.Texture.from('collectable-laser');
      case CollectableType.SHIELD:
        return PIXI.Texture.from('collectable-shield');
      default:
        return null;
    }
  }

  private _createExplosionTextures(): PIXI.Texture[] {
    let textures: PIXI.Texture[] = [];
    let spritesheet = PIXI.BaseTexture.from('explosion');
    for (let i = 0; i < 12; i++) {
      textures.push(new PIXI.Texture(spritesheet, new Rectangle(i * 192, 0, 192, 192)));
    }
    return textures;
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

  private _createKeySymbol(scene: ECS.Scene, symbol: string, x: number, y: number) {
    let symbolText = new ECS.Text(`${symbol.toLowerCase()}-key-text`, symbol);
    symbolText.style = TEXT_STYLE_HOW_TO_PLAY_TEXT;
    symbolText.anchor.set(0.5);
    symbolText.position.set(x, y + 6);
    scene.stage.addChild(symbolText);
  }

}