import * as ECS from '../libs/pixi-ecs';
import { Direction, LaserColor, LaserOrigin, MessageActions, PLAYER_IMMORTALITY_DURATION, PLAYER_IMMORTALITY_FLASHES, SHIELD_DURATION, Tag } from './constants';
import { Factory } from './factory';
import { GameStats } from './game-stats';
import { getAngleRad } from './helper';
import { PlayerState } from './state-structs';

export class Player extends ECS.Component<PlayerState> {

  private _keyInputCmp: ECS.KeyInputComponent;

  onInit() {
    super.onInit();
    this._keyInputCmp = this.scene.findGlobalComponentByName<ECS.KeyInputComponent>(ECS.KeyInputComponent.name);
    this.subscribe(ECS.PointerMessages.POINTER_DOWN);
    this.subscribe(ECS.PointerMessages.POINTER_OVER);
    this.subscribe(MessageActions.SHIELD_ON);
  }

  onUpdate() {
    this._handleKeyboardInput();
    this._updateShield();
    this._checkCollisions();
  }

  onMessage(msg: ECS.Message) {
    if (msg.action === ECS.PointerMessages.POINTER_DOWN) {
      this._shoot();
    } else if (msg.action === ECS.PointerMessages.POINTER_OVER) {
      let pos = msg.data.mousePos;
      let angle = getAngleRad(this.props.position.x, this.props.position.y, pos.posX, pos.posY);
      this._updateAngle(angle);
    } else if (msg.action === MessageActions.SHIELD_ON) {
      this._enableShield();
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

  private _updateShield() {
    if (this.props.shieldActive) {
      let shieldSprite = this.scene.findObjectByName('shield');
      if (shieldSprite) {
        shieldSprite.position.set(this.props.position.x, this.props.position.y);
        if (new Date().getTime() - this.props.lastDateShieldActivated.getTime() > 1000 * SHIELD_DURATION) {
          shieldSprite.parent.removeChild(shieldSprite);
          this.props.shieldActive = false;
          this.sendMessage(MessageActions.SHIELD_OFF);
        }
      }
    }
  }

  private _updateAngle(angle: number) {
    this.props.updateAngle(angle);
    let playerSprite = this.scene.findObjectByTag(Tag.PLAYER);
    if (playerSprite) {
      playerSprite.rotation = angle;
    }
  }

  private _move(direction: Direction) {
    let playerSprite = this.scene.findObjectByTag(Tag.PLAYER);
    if (playerSprite) {
      this.props.move(direction, playerSprite.getBounds().width, playerSprite.getBounds().height);
      playerSprite.position.set(this.props.position.x, this.props.position.y);
    }
  }

  private _shoot() {
    let playerSprite = this.scene.findObjectByName(this.props.spriteName);
    if (playerSprite) {
      Factory.getInstance().spawnLaser(this.scene, LaserColor.BLUE, playerSprite as ECS.Sprite, LaserOrigin.PLAYER);
    }
  }

  private _checkCollisions() {
    let gameStatsComponent = this.scene.stage.findComponentByName('game-stats') as GameStats;
    if (gameStatsComponent && gameStatsComponent.props.immortal) {
      return;
    }
    let lasers = this.scene.findObjectsByTag(Tag.LASER_ENEMY);
    for (let i = 0; i < lasers.length; i++) {
      if (this._collidesWith(lasers[i])) {
        this._removeLaserSprite(lasers[i].name);
        Factory.getInstance().spawnExplosion(this.scene, { ...this.props.position, angle: 0 });
        this.finish();
        this.sendMessage(MessageActions.REMOVE_LIFE);
        Factory.getInstance().createPlayer(this.scene);
        this.sendMessage(MessageActions.IMMORTALITY_ON);
        return;
      }
    }
  }

  private _collidesWith(other: ECS.Container): boolean {
    let ownBounds = this.scene.findObjectByName(this.props.spriteName).getBounds();
    let otherBounds = other.getBounds();
    return ownBounds.x + ownBounds.width > otherBounds.x &&
      ownBounds.x < otherBounds.x + otherBounds.width &&
      ownBounds.y + ownBounds.height > otherBounds.y &&
      ownBounds.y < otherBounds.y + otherBounds.height;
  }

  private _removeLaserSprite(spriteName: string) {
    let laserSprite = this.scene.findObjectByName(spriteName);
    if (laserSprite) {
      laserSprite.parent.removeChild(laserSprite);
    }
  }

  private _enableShield() {
    this.props.lastDateShieldActivated = new Date()
    if (!this.props.shieldActive) {
      Factory.getInstance().spawnShield(this.scene, this.props.position);
      this.props.shieldActive = true;
    }
  }

  onRemove(): void {
    let playerSprite = this.scene.findObjectByName(this.props.spriteName);
    if (playerSprite) {
      playerSprite.parent.removeChild(playerSprite);
    }
    let shieldSprite = this.scene.findObjectByName('shield');
    if (shieldSprite) {
      shieldSprite.parent.removeChild(shieldSprite);
      this.sendMessage(MessageActions.SHIELD_OFF);
    }
  }

}