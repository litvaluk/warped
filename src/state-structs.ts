import { Random } from '../libs/aph-math';
import * as ECS from '../libs/pixi-ecs';
import { LASER_SPEED, Direction, MessageActions, PLAYER_MOVE_STEP, Position, SCENE_WIDTH, EnemyColor, EnemyVariant, STARTING_SCORE, STARTING_LIVES, STARTING_LASER_LEVEL, MeteoriteSize, MeteoriteColor, SCENE_HEIGHT, CollectableType } from './constants';

class ObservableState {

	protected scene: ECS.Scene;

	constructor(scene: ECS.Scene) {
		this.scene = scene;
	}

	public sendMessage(action: MessageActions, data?: any) {
		this.scene.sendMessage(new ECS.Message(action, null, null, data));
	}

}

class GameObjectState extends ObservableState {

	protected _position: Position;
	protected _tag?: string;
	protected _spriteName: string;

	constructor(scene: ECS.Scene, initPosition: Position, spriteName: string, tag?: string,) {
		super(scene);
		this._position = initPosition;
		if (tag) {
			this._tag = tag
		};
		this._spriteName = spriteName;
	}

	get position() {
		return this._position;
	}

	get tag() {
		return this._tag;
	}

	get spriteName() {
		return this._spriteName;
	}

}

export class PlayerState extends GameObjectState {

	private _shieldActive = false;
	private _lastDateShieldActivated: Date;
	private _laserLevel = STARTING_LASER_LEVEL;

	public get shieldActive() {
		return this._shieldActive;
	}

	public set shieldActive(value) {
		this._shieldActive = value;
	}

	public get lastDateShieldActivated(): Date {
		return this._lastDateShieldActivated;
	}
	public set lastDateShieldActivated(value: Date) {
		this._lastDateShieldActivated = value;
	}

	public get laserLevel() {
		return this._laserLevel;
	}

	public set laserLevel(value) {
		this._laserLevel = value;
	}

	move(direction: Direction, playerWidth: number, playerHeight: number) {
		switch (direction) {
			case Direction.LEFT:
				if (this._position.x - PLAYER_MOVE_STEP >= 0 + playerWidth / 2) {
					this._position.x -= PLAYER_MOVE_STEP;
				}
				break;
			case Direction.UP:
				if (this._position.y - PLAYER_MOVE_STEP >= 0 + playerHeight / 2) {
					this._position.y -= PLAYER_MOVE_STEP;
				}
				break;
			case Direction.RIGHT:
				if (this._position.x + PLAYER_MOVE_STEP <= SCENE_WIDTH - playerWidth / 2) {
					this._position.x += PLAYER_MOVE_STEP;
				}
				break;
			case Direction.DOWN:
				if (this._position.y + PLAYER_MOVE_STEP <= SCENE_HEIGHT - playerHeight / 2) {
					this._position.y += PLAYER_MOVE_STEP;
				}
				break;
			default:
				break;
		}
	}

	updateAngle(angle: number) {
		this._position.angle = angle;
	}

}

export class LaserState extends GameObjectState {

	constructor(scene: ECS.Scene, initPosition: Position, tag: string, spriteName: string) {
		super(scene, initPosition, spriteName, tag);
	}

	updatePosition(): void {
		this.position.x += Math.cos(this.position.angle - Math.PI / 2) * LASER_SPEED;
		this.position.y += Math.sin(this.position.angle - Math.PI / 2) * LASER_SPEED;
	}

	isOutOfScreen(): boolean {
		return this.position.x > SCENE_WIDTH || this.position.x < 0 || this.position.y > SCENE_HEIGHT || this.position.y < 0;
	}

}

export class EnemyState extends GameObjectState {

	private _color: EnemyColor;
	private _variant: EnemyVariant;
	private _random = new Random(Date.now());
	private _intensity: number;
	private _lastSpawnTime: Date;
	private _nextSpawnTime: Date;

	constructor(scene: ECS.Scene, initPosition: Position, tag: string, color: EnemyColor, variant: EnemyVariant, spriteName: string) {
		super(scene, initPosition, spriteName, tag);
		this._color = color;
		this._variant = variant;
	}

	get color() {
		return this._color;
	}

	get variant() {
		return this._variant;
	}

	get random(): Random {
		return this._random;
	}

	get intensity(): number {
		return this._intensity;
	}

	get lastSpawnTime(): Date {
		return this._lastSpawnTime;
	}

	get nextSpawnTime(): Date {
		return this._nextSpawnTime;
	}

	set intensity(intensity: number) {
		this._intensity = intensity;
	}

	set lastSpawnTime(lastSpawnTime: Date) {
		this._lastSpawnTime = lastSpawnTime;
	}

	set nextSpawnTime(nextSpawnTime: Date) {
		this._nextSpawnTime = nextSpawnTime;
	}

}

export class SpawnerState {

	private _random = new Random(Date.now());
	private _intensity: number;
	private _lastSpawnTime: Date;
	private _nextSpawnTime: Date;

	get random(): Random {
		return this._random;
	}

	get intensity(): number {
		return this._intensity;
	}

	get lastSpawnTime(): Date {
		return this._lastSpawnTime;
	}

	get nextSpawnTime(): Date {
		return this._nextSpawnTime;
	}

	set intensity(intensity: number) {
		this._intensity = intensity;
	}

	set lastSpawnTime(lastSpawnTime: Date) {
		this._lastSpawnTime = lastSpawnTime;
	}

	set nextSpawnTime(nextSpawnTime: Date) {
		this._nextSpawnTime = nextSpawnTime;
	}

}

export class MeteoriteState extends GameObjectState {

	private _size: MeteoriteSize;
	private _color: MeteoriteColor;

	constructor(scene: ECS.Scene, initPosition: Position, tag: string, color: MeteoriteColor, size: MeteoriteSize, spriteName: string) {
		super(scene, initPosition, spriteName, tag);
		this._size = size;
		this._color = color;
	}

	public get size(): MeteoriteSize {
		return this._size;
	}

	public set size(value: MeteoriteSize) {
		this._size = value;
	}

	public get color(): MeteoriteColor {
		return this._color;
	}

	public set color(value: MeteoriteColor) {
		this._color = value;
	}

}

export class GameStatsState {

	private _score = STARTING_SCORE;
	private _lives = STARTING_LIVES;
	private _laserLevel = STARTING_LASER_LEVEL;
	private _immortal = false;

	public get score(): number {
		return this._score;
	}

	public set score(value: number) {
		this._score = value;
	}

	public get lives(): number {
		return this._lives;
	}

	public set lives(value: number) {
		this._lives = value;
	}

	public get laserLevel(): number {
		return this._laserLevel;
	}

	public set laserLevel(value: number) {
		this._laserLevel = value;
	}

	public get immortal() {
		return this._immortal;
	}

	public set immortal(value) {
		this._immortal = value;
	}

}

export class CollectableState extends GameObjectState {

	private _type: CollectableType;

	constructor(scene: ECS.Scene, initPosition: Position, tag: string, type: CollectableType, spriteName: string) {
		super(scene, initPosition, spriteName, tag);
		this._type = type;
	}

	public get type(): CollectableType {
		return this._type;
	}

	public set type(value: CollectableType) {
		this._type = value;
	}

}