import { MeteoriteColor, MeteoriteSize, METEORITE_SPAWNER_STARTING_INTESITY } from '../../constants';
import { GameFactory } from '../../factories/gameFactory';
import { AbstractSpawnerComponent } from './abstractSpawner';

export class MeteoriteSpawnerComponent extends AbstractSpawnerComponent {

  onSpawn(): void {
    GameFactory.getInstance().spawnMeteorite(this.scene, this._getRandomColor(), this._getRandomSize());
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