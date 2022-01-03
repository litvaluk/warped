import { Random } from '../libs/aph-math';
import * as ECS from '../libs/pixi-ecs';
import { LASER_SPEED, Direction, MessageActions, PLAYER_MOVE_STEP, Position, SCENE_WIDTH, EnemyColor, EnemyVariant, STARTING_SCORE, STARTING_LIVES, STARTING_LASER_LEVEL } from './constants';

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

	constructor(scene: ECS.Scene, initPosition: Position, tag?: string) {
		super(scene);
		this._position = initPosition;
		if (tag) {
			this._tag = tag
		};
	}

	get position() {
		return this._position;
	}

	get tag() {
		return this._tag;
	}

}

export class PlayerState extends GameObjectState {

	move(direction: Direction) {
		switch (direction) {
			case Direction.LEFT:
				this._position.x -= PLAYER_MOVE_STEP;
				break;
			case Direction.UP:
				this._position.y -= PLAYER_MOVE_STEP;
				break;
			case Direction.RIGHT:
				this._position.x += PLAYER_MOVE_STEP;
				break;
			case Direction.DOWN:
				this._position.y += PLAYER_MOVE_STEP;
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

	private _spriteName: string;

	constructor(scene: ECS.Scene, initPosition: Position, tag: string, spriteName: string) {
		super(scene, initPosition, tag);
		this._spriteName = spriteName;
	}

	get spriteName() {
		return this._spriteName;
	}

	updatePosition(): void {
		this.position.x += Math.cos(this.position.angle - Math.PI / 2) * LASER_SPEED;
		this.position.y += Math.sin(this.position.angle - Math.PI / 2) * LASER_SPEED;
	}

	isOutOfScreen(): boolean {
		return this.position.x > SCENE_WIDTH || this.position.x < 0 || this.position.y > SCENE_WIDTH || this.position.y < 0;
	}

}

export class EnemyState extends GameObjectState {

	private _color: EnemyColor;
	private _variant: EnemyVariant;
	private _spriteName: string;

	constructor(scene: ECS.Scene, initPosition: Position, tag: string, color: EnemyColor, variant: EnemyVariant, spriteName: string) {
		super(scene, initPosition, tag);
		this._color = color;
		this._variant = variant;
		this._spriteName = spriteName;
	}

	get color() {
		return this._color;
	}

	get variant() {
		return this._variant;
	}

	get spriteName(): string {
		return this._spriteName;
	}

}

export class EnemySpawnerState {

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

export class GameStatsState {

	private _score = STARTING_SCORE;
	private _lives = STARTING_LIVES;
	private _laserLevel = STARTING_LASER_LEVEL;

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

}