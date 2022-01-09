import * as ECS from '../libs/pixi-ecs';
import { DIFFICULTY_INCREASE_INTERVAL, DIFFICULTY_INCREASE_MULTIPLIER, EnemyColor, EnemyVariant, ENEMY_SPAWNER_STARTING_INTESITY } from './constants';
import { GameFactory } from './factories/gameFactory';
import { SpawnerState } from './stateStructs';

export class EnemySpawner extends ECS.Component<SpawnerState> {

  private _lastDifficultyIncreaseDate: Date;

  onInit(): void {
    this.props.intensity = ENEMY_SPAWNER_STARTING_INTESITY;
    this.props.nextSpawnTime = this._calculateNextSpawnTime();
    this._lastDifficultyIncreaseDate = new Date();
  }

  onUpdate(): void {
    const now = new Date();
    if (now > this.props.nextSpawnTime) {
      GameFactory.getInstance().spawnEnemy(this.scene, this._getRandomColor(), this._getRandomVariant());
      this.props.lastSpawnTime = this.props.nextSpawnTime;
      this.props.nextSpawnTime = this._calculateNextSpawnTime();
    }
    if (now.getTime() > this._lastDifficultyIncreaseDate.getTime() + 1000 * DIFFICULTY_INCREASE_INTERVAL) {
      this._lastDifficultyIncreaseDate = now;
      this.props.intensity *= DIFFICULTY_INCREASE_MULTIPLIER;
    }
  }

  private _calculateNextSpawnTime(): Date {
    let idealInterval = 60000 / this.props.intensity;
    let actualInterval = this.props.random.normal(idealInterval * 0.5, idealInterval * 1.5);
    let date = new Date();
    date.setMilliseconds(date.getMilliseconds() + actualInterval);
    return date;
  }

  private _getRandomColor(): EnemyColor {
    let colors = [EnemyColor.RED, EnemyColor.PURPLE, EnemyColor.GREEN, EnemyColor.ORANGE, EnemyColor.YELLOW];
    return colors[Math.floor(Math.random() * colors.length)]
  }

  private _getRandomVariant(): EnemyVariant {
    let variants = [EnemyVariant.SMALL, EnemyVariant.MEDIUM, EnemyVariant.LARGE, EnemyVariant.HUGE];
    return variants[Math.floor(Math.random() * variants.length)]
  }

}