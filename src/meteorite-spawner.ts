import * as ECS from '../libs/pixi-ecs';
import { MeteoriteColor, MeteoriteSize, METEORITE_SPAWNER_STARTING_INTESITY, Position, SCENE_HEIGHT, SCENE_WIDTH } from './constants';
import { Factory } from './factory';
import { SpawnerState } from './state-structs';

export class MeteoriteSpawner extends ECS.Component<SpawnerState> {

  onInit(): void {
    this.props.intensity = METEORITE_SPAWNER_STARTING_INTESITY;
    this.props.nextSpawnTime = this._calculateNextSpawnTime();
  }

  onUpdate(): void {
    if (new Date() > this.props.nextSpawnTime) {
      Factory.getInstance().spawnMeteorite(this.scene, this._getRandomPosition(), this._getRandomColor(), this._getRandomSize());
      console.log(`meteorite spawned`)
      this.props.lastSpawnTime = this.props.nextSpawnTime;
      this.props.nextSpawnTime = this._calculateNextSpawnTime();
    }
  }

  private _calculateNextSpawnTime(): Date {
    let idealInterval = 60000 / this.props.intensity;
    let actualInterval = this.props.random.normal(idealInterval * 0.5, idealInterval * 1.5);
    let date = new Date();
    date.setMilliseconds(date.getMilliseconds() + actualInterval);
    console.log(`next meteorite spawn interval: ${actualInterval}ms`);
    return date;
  }

  private _getRandomPosition(): Position {
    let randomX = Math.floor(Math.random() * SCENE_WIDTH);
    let randomY = Math.floor(Math.random() * SCENE_HEIGHT);
    let randomAngle = Math.random() * 2 * Math.PI;
    return { x: randomX, y: randomY, angle: randomAngle };
  }

  private _getRandomColor(): MeteoriteColor {
    let colors = [MeteoriteColor.WHITE, MeteoriteColor.GRAY];
    return colors[Math.floor(Math.random() * colors.length)]
  }

  private _getRandomSize(): MeteoriteSize {
    let sizes = [MeteoriteSize.SMALL, MeteoriteSize.MEDIUM, MeteoriteSize.LARGE];
    return sizes[Math.floor(Math.random() * sizes.length)]
  }

}