import * as ECS from '../../libs/pixi-ecs';
import * as PIXI from 'pixi.js';
import * as PIXISound from '@pixi/sound';
import { CollectableType, EnemyColor, EnemyVariant, LaserColor, LaserOrigin, LIFE_OFFSET_X, LIFE_OFFSET_Y, MeteoriteColor, MeteoriteSize, PLAYER_STARTING_X, PLAYER_STARTING_Y, PLAY_SOUND, Position, SCENE_HEIGHT, SCENE_WIDTH, SCORE_TEXT_OFFSET_X, SCORE_TEXT_OFFSET_Y, STARTING_SCORE, Tag, TEXT_STYLE_SCORE, UI_Z_INDEX, VOLUME } from '../constants';
import { Player } from '../player';
import { CollectableState, EnemyState, GameStatsState, LaserState, MeteoriteState, PlayerState, SpawnerState } from '../stateStructs';
import { EnemySpawner } from '../enemySpawner';
import { MeteoriteSpawner } from '../meteoriteSpawner';
import { GameStats } from '../gameStats';
import { Laser } from '../laser';
import { Collectable } from '../collectable';
import { Meteorite } from '../meteorite';
import { Enemy } from '../enemy';

export class GameFactory {

  private static _instance: GameFactory;

  private _laserCounter = 0;
  private _enemyCounter = 0;
  private _meteoriteCounter = 0;
  private _collectableCounter = 0;

  public static getInstance(): GameFactory {
    if (!GameFactory._instance) {
      GameFactory._instance = new GameFactory();
    }
    return GameFactory._instance;
  }

  loadGameStage(scene: ECS.Scene) {
    scene.stage.sortableChildren = true;
    this._loadInputComponents(scene);
    this._createBackground(scene);
    this._createGameStats(scene);
    this._createPlayerLives(scene);
    this._createScoreText(scene);
    this._createEnemySpawner(scene);
    this._createMeteoriteSpawner(scene);
    this.spawnPlayer(scene);
  }

  spawnPlayer(scene: ECS.Scene) {
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

  private _loadInputComponents(scene: ECS.Scene) {
    scene.addGlobalComponentAndRun(new ECS.KeyInputComponent());
    scene.addGlobalComponentAndRun(new ECS.PointerInputComponent({
      handleClick: false,
      handlePointerDown: true,
      handlePointerOver: true,
      handlePointerRelease: true
    }));
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
      textures.push(new PIXI.Texture(spritesheet, new PIXI.Rectangle(i * 192, 0, 192, 192)));
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

}