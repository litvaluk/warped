import * as ECS from '../libs/pixi-ecs';
import { Direction, Tags } from './constants';
import { Factory } from './factory';
import { getAngleRad } from './helper';
import { PlayerState } from './state-structs';

export class PlayerController extends ECS.Component<PlayerState> {

  private _keyInputCmp: ECS.KeyInputComponent;

  onInit() {
    super.onInit();
    this._keyInputCmp = this.scene.findGlobalComponentByName<ECS.KeyInputComponent>(ECS.KeyInputComponent.name);
    this.subscribe(ECS.PointerMessages.POINTER_DOWN);
    this.subscribe(ECS.PointerMessages.POINTER_OVER);
  }

  onUpdate() {
    this._handleKeyboardInput();
  }

  onMessage(msg: ECS.Message) {
    if (msg.action === ECS.PointerMessages.POINTER_DOWN) {
      this._shoot();
    } else if (msg.action === ECS.PointerMessages.POINTER_OVER) {
      let pos = msg.data.mousePos;
      let angle = getAngleRad(this.props.position.x, this.props.position.y, pos.posX, pos.posY);
      this._updateAngle(angle);
    }
  }

  private _handleKeyboardInput() {
    if (this._keyInputCmp.isKeyPressed(ECS.Keys.KEY_A)) {
      this._move(Direction.LEFT);
    } else if (this._keyInputCmp.isKeyPressed(ECS.Keys.KEY_S)) {
      this._move(Direction.DOWN);
    } else if (this._keyInputCmp.isKeyPressed(ECS.Keys.KEY_W)) {
      this._move(Direction.UP);
    } else if (this._keyInputCmp.isKeyPressed(ECS.Keys.KEY_D)) {
      this._move(Direction.RIGHT);
    }
  }

  private _updateAngle(angle: number) {
    this.props.updateAngle(angle);
    this.scene.findObjectByTag(Tags.PLAYER).rotation = angle;
  }

  private _move(direction: Direction) {
    const playerSprite = this.scene.findObjectByTag(Tags.PLAYER);
    this.props.move(direction);
    playerSprite.position.set(this.props.position.x, this.props.position.y);
  }

  private _shoot() {
    Factory.getInstance().spawnLaser(this.scene);
  }

}