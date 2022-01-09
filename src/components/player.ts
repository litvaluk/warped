import * as ECS from '../../libs/pixi-ecs';
import { Direction, GAME_STATS_COMPONENT_NAME, LaserColor, LASER_COOLDOWN, MessageActions, PLAYER_COMPONENT_NAME, PLAYER_SPEED, Point, SCENE_HEIGHT, SCENE_WIDTH, SHIELD_DURATION, Tag } from '../constants';
import { MenuFactory } from '../factories/menuFactory';
import { GameFactory } from '../factories/gameFactory';
import { GameStatsComponent } from './gameStats';
import { CollidableComponent } from './collidable';

export class PlayerComponent extends CollidableComponent {

  shieldActive: boolean;
  lastDateShieldActivated: Date;
  laserLevel: number;
  lastDateShot: Date;

  private _keyInputComponent: ECS.KeyInputComponent;
  private _leftMouseButtonPressed;

  constructor(laserLevel: number) {
    super();
    this.shieldActive = false;
    this.laserLevel = laserLevel;
    this._leftMouseButtonPressed = false;
  }

  onInit() {
    super.onInit();
    this.name = PLAYER_COMPONENT_NAME;
    this._keyInputComponent = this.scene.findGlobalComponentByName<ECS.KeyInputComponent>(ECS.KeyInputComponent.name);
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
      this.owner.rotation = Math.atan2(msg.data.mousePos.posY - this.owner.y, msg.data.mousePos.posX - this.owner.x) + Math.PI / 2;
    } else if (msg.action === MessageActions.SHIELD_ON) {
      this._enableShield();
    } else if (msg.action === MessageActions.INCREASE_LASER_LEVEL) {
      if (this.laserLevel < 3) {
        this.laserLevel += 1;
      }
    }
  }

  private _handleKeyboardInput() {
    if (this._keyInputComponent.isKeyPressed(ECS.Keys.KEY_A)) {
      this._move(Direction.LEFT);
    } else if (this._keyInputComponent.isKeyPressed(ECS.Keys.KEY_S)) {
      this._move(Direction.DOWN);
    } else if (this._keyInputComponent.isKeyPressed(ECS.Keys.KEY_W)) {
      this._move(Direction.UP);
    } else if (this._keyInputComponent.isKeyPressed(ECS.Keys.KEY_D)) {
      this._move(Direction.RIGHT);
    } else if (this._keyInputComponent.isKeyPressed(ECS.Keys.KEY_ESCAPE)) {
      this.scene.callWithDelay(0, () => {
        this.scene.clearScene();
        MenuFactory.getInstance().loadMenuStage(this.scene);
      });
    }
  }

  private _updateShield() {
    if (this.shieldActive) {
      let shield = this.scene.findObjectByName('shield');
      if (shield) {
        shield.position.set(this.owner.x, this.owner.y);
        if (new Date().getTime() - this.lastDateShieldActivated.getTime() > 1000 * SHIELD_DURATION) {
          shield.parent.removeChild(shield);
          this.shieldActive = false;
          this.sendMessage(MessageActions.SHIELD_OFF);
        }
      }
    }
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
    }
  }

  private _shoot() {
    if (this.lastDateShot && new Date().getTime() - this.lastDateShot.getTime() < 1000 * LASER_COOLDOWN) {
      return;
    }
    switch (this.laserLevel) {
      case 1:
        GameFactory.getInstance().spawnLaser(this.scene, LaserColor.BLUE, this._getCenterLaserOriginPosition(), this.owner.rotation, Tag.LASER_PLAYER);
        break;
      case 2:
        GameFactory.getInstance().spawnLaser(this.scene, LaserColor.BLUE, this._getLeftLaserOriginPosition(), this.owner.rotation, Tag.LASER_PLAYER);
        GameFactory.getInstance().spawnLaser(this.scene, LaserColor.BLUE, this._getRightLaserOriginPosition(), this.owner.rotation, Tag.LASER_PLAYER, false);
        break;
      case 3:
        const theta = Math.PI / 6;
        GameFactory.getInstance().spawnLaser(this.scene, LaserColor.BLUE, this._getLeftLaserOriginPosition(), this.owner.rotation, Tag.LASER_PLAYER);
        GameFactory.getInstance().spawnLaser(this.scene, LaserColor.BLUE, this._getRightLaserOriginPosition(), this.owner.rotation, Tag.LASER_PLAYER, false);
        GameFactory.getInstance().spawnLaser(this.scene, LaserColor.BLUE, this._getSideLaserOriginPosition(-theta), this.owner.rotation + theta, Tag.LASER_PLAYER, false);
        GameFactory.getInstance().spawnLaser(this.scene, LaserColor.BLUE, this._getSideLaserOriginPosition(theta), this.owner.rotation - theta, Tag.LASER_PLAYER, false);
        break;
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

  private _getSideLaserOriginPosition(theta: number): Point {
    return {
      x: this.owner.x + Math.cos(this.owner.rotation - Math.PI / 2 - theta) * this.owner.getBounds().width / 1.7,
      y: this.owner.y + Math.sin(this.owner.rotation - Math.PI / 2 - theta) * this.owner.getBounds().height / 1.7
    }
  }

  private _checkCollisions() {
    let gameStatsComponent = this.scene.findGlobalComponentByName<GameStatsComponent>(GAME_STATS_COMPONENT_NAME);
    if (gameStatsComponent && gameStatsComponent.immortal) {
      return;
    }
    let lasers = this.scene.findObjectsByTag(Tag.LASER_ENEMY);
    for (let i = 0; i < lasers.length; i++) {
      if (this.collidesWith(lasers[i])) {
        this._removeLaser(lasers[i].name);
        GameFactory.getInstance().spawnExplosion(this.scene, { x: this.owner.x, y: this.owner.y });
        this.finish();
        this.sendMessage(MessageActions.REMOVE_LIFE);
        GameFactory.getInstance().spawnPlayer(this.scene);
        this.sendMessage(MessageActions.IMMORTALITY_ON);
        return;
      }
    }
  }

  private _removeLaser(spriteName: string) {
    let laser = this.scene.findObjectByName(spriteName);
    if (laser) {
      laser.parent.removeChild(laser);
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
    if (this.owner && this.owner.parent) {
      this.owner.parent.removeChild(this.owner);
    }
    let shield = this.scene.findObjectByTag(Tag.SHIELD);
    if (shield && shield.parent) {
      shield.parent.removeChild(shield);
      this.sendMessage(MessageActions.SHIELD_OFF);
    }
  }

}