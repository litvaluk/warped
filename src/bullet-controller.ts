import * as ECS from '../libs/pixi-ecs';
import { Actions } from './actions';
import { BulletState } from './state-structs';

export class BulletController extends ECS.Component<BulletState> {
  
  onUpdate() {
    this.props.updatePosition();
    this.scene.stage.addComponentAndRun(Actions.updateBulletLocation(this.scene, this.props));
  }

}