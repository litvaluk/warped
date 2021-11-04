import * as ECS from '../libs/pixi-ecs';
import { Actions } from './actions';
import { Direction, Tags } from './constants';
import { getAngleRad } from './helper';
import { PlayerState } from './state-structs';

export class PlayerController extends ECS.Component<PlayerState> {
  
  private keyInputCmp: ECS.KeyInputComponent;

  onInit() {
		super.onInit();
		this.keyInputCmp = this.scene.findGlobalComponentByName<ECS.KeyInputComponent>(ECS.KeyInputComponent.name);
    this.scene.stage.interactive = true;
    this.scene.stage.on('pointermove', this.updateAngle);
    this.subscribe(ECS.PointerMessages.POINTER_DOWN);
	}
  
  onUpdate() {
    if (this.keyInputCmp.isKeyPressed(ECS.Keys.KEY_A)) {
			// this.keyInputCmp.handleKey(ECS.Keys.KEY_A);
      this.scene.addGlobalComponentAndRun(Actions.move(this.scene, this.props, Direction.LEFT));
		} else if (this.keyInputCmp.isKeyPressed(ECS.Keys.KEY_S)) {
			// this.keyInputCmp.handleKey(ECS.Keys.KEY_S);
      this.scene.addGlobalComponentAndRun(Actions.move(this.scene, this.props, Direction.DOWN));
      console.log('s');
		} else if (this.keyInputCmp.isKeyPressed(ECS.Keys.KEY_W)) {
			// this.keyInputCmp.handleKey(ECS.Keys.KEY_W);
      this.scene.addGlobalComponentAndRun(Actions.move(this.scene, this.props, Direction.UP));
      console.log('w');
		} else if (this.keyInputCmp.isKeyPressed(ECS.Keys.KEY_D)) {
			// this.keyInputCmp.handleKey(ECS.Keys.KEY_D);
      this.scene.addGlobalComponentAndRun(Actions.move(this.scene, this.props, Direction.RIGHT));
      console.log('d');
		} else if (this.keyInputCmp.isKeyPressed(ECS.Keys.KEY_SPACE)) {
			this.keyInputCmp.handleKey(ECS.Keys.KEY_SPACE);
      this.scene.addGlobalComponentAndRun(Actions.shoot(this.scene, this.props));
      console.log('d');
		}
  }

  onMessage(msg: ECS.Message) {
    if (msg.action === ECS.PointerMessages.POINTER_DOWN) {
      this.scene.stage.addComponentAndRun(Actions.shoot(this.scene, this.props));
    }
  }

  updateAngle(e: { data: { global: any; }; }) {
    let pos = e.data.global;
    const playerSprite = this.scene.findObjectByTag(Tags.PLAYER);
    let angle = getAngleRad(playerSprite.x, playerSprite.y, pos.x, pos.y);
    this.scene.addGlobalComponentAndRun(Actions.updatePlayerAngle(this.scene, this.props, angle));
    console.log('angle = ' + angle);
  }
  
}