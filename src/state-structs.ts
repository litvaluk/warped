import * as ECS from '../libs/pixi-ecs';
import { LASER_SPEED, Direction, Messages, PLAYER_MOVE_STEP, Position, SCENE_WIDTH } from './constants';

class ObservableState {

	protected scene: ECS.Scene;

	constructor(scene: ECS.Scene) {
		this.scene = scene;
	}

	public sendMessage(type: Messages, data?: any) {
		this.scene.sendMessage(new ECS.Message(type, null, null, data));
	}

}

export class PlayerState extends ObservableState {

	private _position: Position;

	constructor(scene: ECS.Scene, initPosition: Position) {
		super(scene);
		this._position = initPosition;
	}

	get position() {
		return this._position;
	}

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

export class LaserState extends ObservableState {

	private _position: Position;
	private _tag: string;

	constructor(scene: ECS.Scene, initPosition: Position, tag: string) {
		super(scene);
		this._position = initPosition;
		this._tag = tag;
	}

	get position() {
		return this._position;
	}

	get tag() {
		return this._tag;
	}

	updatePosition() {
		this.position.x += Math.cos(this.position.angle - Math.PI / 2) * LASER_SPEED;
		this.position.y += Math.sin(this.position.angle - Math.PI / 2) * LASER_SPEED;
	}

	isOutOfScreen(): boolean {
		return this.position.x > SCENE_WIDTH || this.position.x < 0 || this.position.y > SCENE_WIDTH || this.position.y < 0;
	}

}