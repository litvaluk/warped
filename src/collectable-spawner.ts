import * as ECS from '../libs/pixi-ecs';
import { CollectableType, COLLECTABLE_SPAWNER_STARTING_INTESITY, Position, SCENE_HEIGHT, SCENE_WIDTH } from './constants';
import { Factory } from './factory';
import { SpawnerState } from './state-structs';

export class CollectableSpawner extends ECS.Component<SpawnerState> {

  onInit(): void {
    this.props.intensity = COLLECTABLE_SPAWNER_STARTING_INTESITY;
    this.props.nextSpawnTime = this._calculateNextSpawnTime();
  }

  onUpdate(): void {
    if (new Date() > this.props.nextSpawnTime) {
      Factory.getInstance().spawnCollectable(this.scene, this._getRandomPosition(), this._getRandomType());
      console.log(`collectable spawned`)
      this.props.lastSpawnTime = this.props.nextSpawnTime;
      this.props.nextSpawnTime = this._calculateNextSpawnTime();
    }
  }

  private _calculateNextSpawnTime(): Date {
    let idealInterval = 60000 / this.props.intensity;
    let actualInterval = this.props.random.normal(idealInterval * 0.5, idealInterval * 1.5);
    let date = new Date();
    date.setMilliseconds(date.getMilliseconds() + actualInterval);
    console.log(`next collectable spawn interval: ${actualInterval}ms`);
    return date;
  }

  private _getRandomPosition(): Position {
    let randomX = Math.floor(Math.random() * SCENE_WIDTH);
    let randomY = Math.floor(Math.random() * SCENE_HEIGHT);
    let randomAngle = Math.random() * 2 * Math.PI;
    return { x: randomX, y: randomY, angle: randomAngle };
  }

  private _getRandomType(): CollectableType {
    let types = [CollectableType.LIFE, CollectableType.LASER, CollectableType.SHIELD];
    return types[Math.floor(Math.random() * types.length)]
  }

}