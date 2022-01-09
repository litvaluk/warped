import * as ECS from '../../libs/pixi-ecs';
import { Direction, LaserColor, LASER_COOLDOWN, MessageActions, PLAYER_IMMORTALITY_DURATION, PLAYER_IMMORTALITY_FLASHES, PLAYER_SPEED, Point, SCENE_HEIGHT, SCENE_WIDTH, SHIELD_DURATION, Tag } from '../constants';
import { MenuFactory } from '../factories/menuFactory';
import { GameFactory } from '../factories/gameFactory';
import { GameStatsComponent } from './gameStats';
import { getAngleRad } from '../helper';
import { CollidableComponent } from './collidable';

export class PlayerComponent extends CollidableComponent {

  shieldActive: boolean;
  lastDateShieldActivated: Date;
  laserLevel: number;
  lastDateShot: Date;

  private _keyInputCmp: ECS.KeyInputComponent;
  private _leftMouseButtonPressed;

  constructor(laserLevel: number) {
    super();
    this.shieldActive = false;
    this.laserLevel = laserLevel;
    this._leftMouseButtonPressed = false;
  }

  onInit() {
    super.onInit();
    this.name = 'player';
    this._keyInputCmp = this.scene.findGlobalComponentByName<ECS.KeyInputComponent>(ECS.KeyInputComponent.name);
    this.subscribe(ECS.PointerMessages.POINTER_DOWN);
    this.subscribe(ECS.PointerMessages.POINTER_RELEASE);
    this.subscribe(ECS.PointerMessages.POINTER_OVER);
    this.subscribe(MessageActions.SHIELD_ON);
    this.subscribe(MessageActions.INCREASE_LASER_LEVEL);
  }

  onUpdate() {
    if (this._leftMouseButtonPressed) {
      this._shoot();
    }
    this._handleKeyboardInput();
    this._updateShield();
    this._checkCollisions();
  }

  onMessage(msg: ECS.Message) {
    if (msg.action === ECS.PointerMessages.POINTER_DOWN) {
      this._leftMouseButtonPressed = true;
    } else if (msg.action === ECS.PointerMessages.POINTER_RELEASE) {
      this._leftMouseButtonPressed = false;
    } else if (msg.action === ECS.PointerMessages.POINTER_OVER) {
      let angle = getAngleRad(this.owner.x, this.owner.y, msg.data.mousePos.posX, msg.data.mousePos.posY);
      this._updateAngle(angle);
    } else if (msg.action === MessageActions.SHIELD_ON) {
      this._enableShield();
    } else if (msg.action === MessageActions.INCREASE_LASER_LEVEL) {
      if (this.laserLevel < 3) {
        this.laserLevel += 1;
      }
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
    } else if (this._keyInputCmp.isKeyPressed(ECS.Keys.KEY_ESCAPE)) {
      this.scene.callWithDelay(0, () => {
        this.scene.clearScene();
        MenuFactory.getInstance().loadMenuStage(this.scene);
      });
    }
  }

  private _updateShield() {
    if (this.shieldActive) {
      let shieldSprite = this.scene.findObjectByName('shield');
      if (shieldSprite) {
        shieldSprite.position.set(this.owner.x, this.owner.y);
        if (new Date().getTime() - this.lastDateShieldActivated.getTime() > 1000 * SHIELD_DURATION) {
          shieldSprite.parent.removeChild(shieldSprite);
          this.shieldActive = false;
          this.sendMessage(MessageActions.SHIELD_OFF);
        }
      }
    }
  }

  private _updateAngle(angle: number) {
    this.owner.rotation = angle;
  }

  private _move(direction: Direction) {
    switch (direction) {
      case Direction.LEFT:
        if (this.owner.x - PLAYER_SPEED >= 0 + this.owner.width / 2) {
          this.owner.x -= PLAYER_SPEED;
        }
        break;
      case Direction.UP:
        if (this.owner.y - PLAYER_SPEED >= 0 + this.owner.height / 2) {
          this.owner.y -= PLAYER_SPEED;
        }
        break;
      case Direction.RIGHT:
        if (this.owner.x + PLAYER_SPEED <= SCENE_WIDTH - this.owner.width / 2) {
          this.owner.x += PLAYER_SPEED;
        }
        break;
      case Direction.DOWN:
        if (this.owner.y + PLAYER_SPEED <= SCENE_HEIGHT - this.owner.height / 2) {
          this.owner.y += PLAYER_SPEED;
        }
        break;
      default:
        break;
    }
  }

  private _shoot() {
    if (this.lastDateShot && new Date().getTime() - this.lastDateShot.getTime() < 1000 * LASER_COOLDOWN) {
      return;
    }
    let playerSprite = this.owner
    if (playerSprite) {
      switch (this.laserLevel) {
        case 1:
          GameFactory.getInstance().spawnLaser(this.scene, LaserColor.BLUE, this._getCenterLaserOriginPosition(), this.owner.rotation, Tag.LASER_PLAYER);
          break;
        case 2:
          GameFactory.getInstance().spawnLaser(this.scene, LaserColor.BLUE, this._getLeftLaserOriginPosition(), this.owner.rotation, Tag.LASER_PLAYER);
          GameFactory.getInstance().spawnLaser(this.scene, LaserColor.BLUE, this._getRightLaserOriginPosition(), this.owner.rotation, Tag.LASER_PLAYER, false);
          break;
        case 3:
          GameFactory.getInstance().spawnLaser(this.scene, LaserColor.BLUE, this._getLeftLaserOriginPosition(), this.owner.rotation, Tag.LASER_PLAYER);
          GameFactory.getInstance().spawnLaser(this.scene, LaserColor.BLUE, this._getRightLaserOriginPosition(), this.owner.rotation, Tag.LASER_PLAYER, false);
          GameFactory.getInstance().spawnLaser(this.scene, LaserColor.BLUE, this._getLeftSideLaserOriginPosition(), this.owner.rotation, Tag.LASER_PLAYER, false);
          GameFactory.getInstance().spawnLaser(this.scene, LaserColor.BLUE, this._getRightSideLaserOriginPosition(), this.owner.rotation, Tag.LASER_PLAYER, false);
          break;
      }
    }
    this.lastDateShot = new Date();
  }

  private _getCenterLaserOriginPosition(): Point {
    return {
      x: this.owner.x + Math.cos(this.owner.rotation - Math.PI / 2) * this.owner.getBounds().width / 1.7,
      y: this.owner.y + Math.sin(this.owner.rotation - Math.PI / 2) * this.owner.getBounds().height / 1.7
    }
  }

  private _getLeftLaserOriginPosition(): Point {
    let theta = this.owner.rotation + Math.PI;
    let Ox = 15;
    let Oy = this.owner.getBounds().height / 1.7;
    return {
      x: this.owner.x + Ox * Math.cos(theta) - Oy * Math.sin(theta),
      y: this.owner.y + Ox * Math.sin(theta) + Oy * Math.cos(theta)
    }
  }

  private _getRightLaserOriginPosition(): Point {
    let theta = this.owner.rotation + Math.PI;
    let Ox = -15;
    let Oy = this.owner.getBounds().height / 1.7;
    return {
      x: this.owner.x + Ox * Math.cos(theta) - Oy * Math.sin(theta),
      y: this.owner.y + Ox * Math.sin(theta) + Oy * Math.cos(theta)
    }
  }

  private _getLeftSideLaserOriginPosition(): Point {
    let angle = Math.PI / 6;
    return {
      x: this.owner.x + Math.cos(this.owner.rotation - Math.PI / 2 - angle) * this.owner.getBounds().width / 1.7,
      y: this.owner.y + Math.sin(this.owner.rotation - Math.PI / 2 - angle) * this.owner.getBounds().height / 1.7
    }
  }

  private _getRightSideLaserOriginPosition(): Point {
    let angle = Math.PI / 6;
    return {
      x: this.owner.x + Math.cos(this.owner.rotation - Math.PI / 2 + angle) * this.owner.getBounds().width / 1.7,
      y: this.owner.y + Math.sin(this.owner.rotation - Math.PI / 2 + angle) * this.owner.getBounds().height / 1.7
    }
  }

  private _checkCollisions() {
    let gameStatsComponent = this.scene.stage.findComponentByName('game-stats') as GameStatsComponent;
    if (gameStatsComponent && gameStatsComponent.immortal) {
      return;
    }
    let lasers = this.scene.findObjectsByTag(Tag.LASER_ENEMY);
    for (let i = 0; i < lasers.length; i++) {
      if (this.collidesWith(lasers[i])) {
        this._removeLaserSprite(lasers[i].name);
        GameFactory.getInstance().spawnExplosion(this.scene, { x: this.owner.x, y: this.owner.y });
        this.finish();
        this.sendMessage(MessageActions.REMOVE_LIFE);
        GameFactory.getInstance().spawnPlayer(this.scene);
        this.sendMessage(MessageActions.IMMORTALITY_ON);
        return;
      }
    }
  }

  private _removeLaserSprite(spriteName: string) {
    let laserSprite = this.scene.findObjectByName(spriteName);
    if (laserSprite) {
      laserSprite.parent.removeChild(laserSprite);
    }
  }

  private _enableShield() {
    this.lastDateShieldActivated = new Date()
    if (!this.shieldActive) {
      GameFactory.getInstance().spawnShield(this.scene, { x: this.owner.x, y: this.owner.y });
      this.shieldActive = true;
    }
  }

  onRemove(): void {
    if (!this.scene) {
      return;
    }
    let playerSprite = this.owner;
    if (playerSprite && playerSprite.parent) {
      playerSprite.parent.removeChild(playerSprite);
    }
    let shieldSprite = this.scene.findObjectByName('shield');
    if (shieldSprite && shieldSprite.parent) {
      shieldSprite.parent.removeChild(shieldSprite);
      this.sendMessage(MessageActions.SHIELD_OFF);
    }
  }

}