import * as ECS from '../libs/pixi-ecs';
import { Direction, LaserColor, Tags } from './constants';
import { Factory } from './factory';
import { getAngleRad } from './helper';
import { PlayerState } from './state-structs';

export class Player extends ECS.Component<PlayerState> {

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
    } else if (this._keyInputCmp.isKeyPressed(ECS.Keys.KEY_R)) {
      Factory.getInstance().clearStage(this.scene);
      Factory.getInstance().loadGameStage(this.scene);
    }
  }

  private _updateAngle(angle: number) {
    this.props.updateAngle(angle);
    let playerSprite = this.scene.findObjectByTag(Tags.PLAYER);
    if (playerSprite) {
      playerSprite.rotation = angle;
    }
  }

  private _move(direction: Direction) {
    let playerSprite = this.scene.findObjectByTag(Tags.PLAYER);
    if (playerSprite) {
      this.props.move(direction, playerSprite.getBounds().width, playerSprite.getBounds().height);
      playerSprite.position.set(this.props.position.x, this.props.position.y);
    }
  }

  private _shoot() {
    Factory.getInstance().spawnLaser(this.scene, LaserColor.BLUE);
  }

  onRemove(): void {
    let playerSprite = this.scene.findObjectByName(this.props.spriteName);
    if (playerSprite) {
      playerSprite.parent.removeChild(playerSprite);
    }
  }

}