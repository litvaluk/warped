import * as ECS from '../libs/pixi-ecs';
import { EnemyColor, EnemyVariant, ENEMY_SPAWNER_STARTING_INTESITY, Position, SCENE_HEIGHT, SCENE_WIDTH } from './constants';
import { Factory } from './factory';
import { EnemySpawnerState } from './state-structs';

export class EnemySpawner extends ECS.Component<EnemySpawnerState> {

  onInit(): void {
    this.props.intensity = ENEMY_SPAWNER_STARTING_INTESITY;
    this.props.nextSpawnTime = this.calculateNextSpawnTime();
  }

  onUpdate(): void {
    if (new Date() > this.props.nextSpawnTime) {
      Factory.getInstance().spawnEnemy(this.scene, this.getRandomPosition(), this.getRandomColor(), this.getRandomVariant());
      console.log(`enemy spawned`)
      this.props.lastSpawnTime = this.props.nextSpawnTime;
      this.props.nextSpawnTime = this.calculateNextSpawnTime();
    }
  }

  private calculateNextSpawnTime(): Date {
    let idealInterval = 60000 / this.props.intensity;
    let actualInterval = this.props.random.normal(idealInterval * 0.5, idealInterval * 1.5);
    let date = new Date();
    date.setMilliseconds(date.getMilliseconds() + actualInterval);
    console.log(`next enemy spawn interval: ${actualInterval}ms`);
    return date;
  }

  private getRandomPosition(): Position {
    let randomX = Math.floor(Math.random() * SCENE_WIDTH);
    let randomY = Math.floor(Math.random() * SCENE_HEIGHT);
    return { x: randomX, y: randomY, angle: 0 };
  }

  private getRandomColor(): EnemyColor {
    let colors = [EnemyColor.RED, EnemyColor.PURPLE, EnemyColor.GREEN, EnemyColor.ORANGE, EnemyColor.YELLOW];
    return colors[Math.floor(Math.random() * colors.length)]
  }

  private getRandomVariant(): EnemyVariant {
    let variants = [EnemyVariant.SMALL, EnemyVariant.MEDIUM, EnemyVariant.LARGE, EnemyVariant.HUGE];
    return variants[Math.floor(Math.random() * variants.length)]
  }

}