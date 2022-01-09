import * as ECS from '../../libs/pixi-ecs';
import * as PIXI from 'pixi.js';
import * as PIXISound from '@pixi/sound';
import { CollectableType, EnemyColor, EnemyVariant, ENEMY_SHOOTING_INTENSITY, ENEMY_SPAWNER_STARTING_INTESITY, LaserColor, LASER_SPEED, LIFE_OFFSET_X, LIFE_OFFSET_Y, MeteoriteColor, MeteoriteSize, METEORITE_SPAWNER_STARTING_INTESITY, PLAYER_STARTING_X, PLAYER_STARTING_Y, PLAY_SOUND, Point, SCORE_TEXT_OFFSET_X, SCORE_TEXT_OFFSET_Y, STARTING_LASER_LEVEL, STARTING_SCORE, Tag, TEXT_STYLE_SCORE, UI_Z_INDEX, VOLUME } from '../constants';
import { PlayerComponent } from '../components/player';
import { EnemySpawnerComponent } from '../components/spawners/enemySpawner';
import { MeteoriteSpawnerComponent } from '../components/spawners/meteoriteSpawner';
import { GameStatsComponent } from '../components/gameStats';
import { LaserComponent } from '../components/laser';
import { CollectableComponent } from '../components/collectable';
import { MeteoriteComponent } from '../components/meteorite';
import { Enemy } from '../components/enemy';

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
    const name = 'player';
    new ECS.Builder(scene)
      .asSprite(PIXI.Texture.from('player'))
      .anchor(0.5)
      .scale(0.8)
      .localPos(PLAYER_STARTING_X, PLAYER_STARTING_Y)
      .withName(name)
      .withTag(Tag.PLAYER)
      .withComponent(new PlayerComponent(STARTING_LASER_LEVEL))
      .withParent(scene.stage)
      .build();
  }

  spawnLaser(scene: ECS.Scene, color: LaserColor, position: Point, rotation: number, tag: Tag, playSound: boolean = true) {
    const name = `laser-${++this._laserCounter}`;
    const laser: ECS.Sprite = new ECS.Builder(scene)
      .asSprite(PIXI.Texture.from(`laser-${color}`))
      .anchor(0.5)
      .scale(0.25)
      .localPos(position.x, position.y)
      .withName(name)
      .withTag(tag)
      .withComponent(new LaserComponent(LASER_SPEED))
      .withParent(scene.stage)
      .build();

    laser.rotation = rotation;

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

    const positionWithRotation = this._getRandomSpawnPointWithRotation(scene, enemy);
    enemy.position.set(positionWithRotation[0].x, positionWithRotation[0].y);
    enemy.addComponent(new Enemy(color, variant, ENEMY_SHOOTING_INTENSITY));
  }

  spawnMeteorite(scene: ECS.Scene, color: MeteoriteColor, size: MeteoriteSize, positionWithRotation?: [Point, number]) {
    const name = `meteorite-${++this._meteoriteCounter}`;
    const meteorite: ECS.Sprite = new ECS.Builder(scene)
      .asSprite(PIXI.Texture.from(`meteorite-${color}`))
      .anchor(0.5)
      .scale(this._getMeteoriteScaleFromSize(size))
      .withName(name)
      .withTag(Tag.METEORITE)
      .withParent(scene.stage)
      .build();

    if (!positionWithRotation) {
      positionWithRotation = this._getRandomSpawnPointWithRotation(scene, meteorite);
    }

    meteorite.position.set(positionWithRotation[0].x, positionWithRotation[0].y);
    meteorite.rotation = positionWithRotation[1];
    meteorite.addComponent(new MeteoriteComponent(size, color));
  }

  spawnCollectable(scene: ECS.Scene, position: Point, type: CollectableType) {
    const name = `collectable-${++this._collectableCounter}`;
    const collectableTexture: PIXI.Texture = this._getCollectableTextureForType(type);
    new ECS.Builder(scene)
      .asSprite(collectableTexture)
      .anchor(0.5)
      .scale(0.15)
      .localPos(position.x, position.y)
      .withName(name)
      .withTag(Tag.COLLECTABLE)
      .withComponent(new CollectableComponent(type))
      .withParent(scene.stage)
      .build();
  }

  spawnExplosion(scene: ECS.Scene, position: Point, scale?: number, playSound: boolean = true) {
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

  spawnShield(scene: ECS.Scene, position: Point) {
    const name = 'shield';
    new ECS.Builder(scene)
      .asSprite(PIXI.Texture.from('shield'))
      .anchor(0.5)
      .scale(1)
      .localPos(position.x, position.y)
      .withName(name)
      .withTag(Tag.SHIELD)
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

    const x = scene.width + LIFE_OFFSET_X - heart.width / 2 - (order - 1) * heart.width;
    const y = scene.height + LIFE_OFFSET_Y - heart.height / 2;
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
      .asTilingSprite(PIXI.Texture.from('background'), scene.width, scene.height)
      .withName('background')
      .withParent(scene.stage)
      .build();
  }

  private _createEnemySpawner(scene: ECS.Scene) {
    scene.stage.addComponent(new EnemySpawnerComponent(ENEMY_SPAWNER_STARTING_INTESITY));
  }

  private _createMeteoriteSpawner(scene: ECS.Scene) {
    scene.stage.addComponent(new MeteoriteSpawnerComponent(METEORITE_SPAWNER_STARTING_INTESITY));
  }

  private _createGameStats(scene: ECS.Scene) {
    scene.addGlobalComponent(new GameStatsComponent());
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
      .withTag(Tag.SCORE_TEXT)
      .withParent(scene.stage)
      .build();

    score.position.set(0 + SCORE_TEXT_OFFSET_X, scene.height + SCORE_TEXT_OFFSET_Y - score.height);
    score.zIndex = UI_Z_INDEX;
  }

  private _getMeteoriteScaleFromSize(size: MeteoriteSize) {
    switch (size) {
      case MeteoriteSize.SMALL:
        return 0.5;
      case MeteoriteSize.LARGE:
        return 1.5;
      default:
        return 1;
    }
  }

  private _getCollectableTextureForType(type: CollectableType): PIXI.Texture {
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

  private _getRandomSpawnPointWithRotation(scene: ECS.Scene, container: ECS.Container): [Point, number] {
    const a = scene.width + container.width;
    const b = scene.height + container.height;
    const perimeter = 2 * a + 2 * b;
    const rand = Math.random() * perimeter;

    let x: number;
    let y: number;
    let rotation: number;

    const rotationMax = 0.8;
    const rotationMin = 0.2;

    if (rand < a) {
      // top
      x = rand;
      y = -container.height / 2;
      rotation = (Math.random() * Math.PI * (rotationMax - rotationMin)) + ((0.5 + rotationMin) * Math.PI);
    } else if (rand < a + b) {
      // right
      x = scene.width + container.width / 2;
      y = rand - a;
      rotation = (Math.random() * Math.PI * (rotationMax - rotationMin)) + ((1 + rotationMin) * Math.PI);
    } else if (rand < 2 * a + b) {
      // bottom
      x = rand - a - b;
      y = scene.height + container.height / 2;
      rotation = (Math.random() * Math.PI * (rotationMax - rotationMin)) + ((1.5 + rotationMin) * Math.PI);
    } else {
      // left
      x = -container.width / 2;
      y = rand - 2 * a - b;
      rotation = (Math.random() * Math.PI * (rotationMax - rotationMin)) + ((-0.5 + rotationMin) * Math.PI);
    }

    return [{ x: x, y: y }, rotation];
  }

}