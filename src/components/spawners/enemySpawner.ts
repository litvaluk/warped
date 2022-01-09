import { DIFFICULTY_INCREASE_INTERVAL, DIFFICULTY_INCREASE_MULTIPLIER, EnemyColor, EnemyVariant } from '../../constants';
import { GameFactory } from '../../factories/gameFactory';
import { AbstractSpawnerComponent } from './abstractSpawner';

export class EnemySpawnerComponent extends AbstractSpawnerComponent {

  private _lastDifficultyIncreaseDate: Date;

  constructor(intensity: number) {
    super(intensity);
    this._lastDifficultyIncreaseDate = new Date();
  }

  onUpdate(): void {
    super.onUpdate();
    const now = new Date();
    if (now.getTime() > this._lastDifficultyIncreaseDate.getTime() + 1000 * DIFFICULTY_INCREASE_INTERVAL) {
      this._lastDifficultyIncreaseDate = now;
      this.intensity *= DIFFICULTY_INCREASE_MULTIPLIER;
    }
  }

  onSpawn(): void {
    GameFactory.getInstance().spawnEnemy(this.scene, this._getRandomColor(), this._getRandomVariant());
  }

  private _getRandomColor(): EnemyColor {
    let colors = [EnemyColor.RED, EnemyColor.PURPLE, EnemyColor.GREEN, EnemyColor.ORANGE, EnemyColor.YELLOW];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private _getRandomVariant(): EnemyVariant {
    let variants = [EnemyVariant.SMALL, EnemyVariant.MEDIUM, EnemyVariant.LARGE, EnemyVariant.HUGE];
    return variants[Math.floor(Math.random() * variants.length)];
  }

}