import { Random } from '../../../libs/aph-math';
import * as ECS from '../../../libs/pixi-ecs';

export abstract class AbstractSpawnerComponent extends ECS.Component {

  protected random = new Random(Date.now());
  protected intensity: number;
  protected lastSpawnDate: Date;
  protected nextSpawnDate: Date;

  constructor(intensity: number) {
    super();
    this.intensity = intensity;
    this.nextSpawnDate = this.calculateNextSpawnTime();
  }

  protected calculateNextSpawnTime(): Date {
    let idealInterval = 60000 / this.intensity;
    let actualInterval = this.random.normal(idealInterval * 0.5, idealInterval * 1.5);
    let date = new Date();
    date.setMilliseconds(date.getMilliseconds() + actualInterval);
    return date;
  }

  onUpdate(): void {
    if (this.nextSpawnDate < new Date()) {
      this.lastSpawnDate = this.nextSpawnDate;
      this.nextSpawnDate = this.calculateNextSpawnTime();
      this.onSpawn();
    }
  }

  abstract onSpawn(): void;

}