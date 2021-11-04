export const SCENE_WIDTH = 1440;
export const SCENE_HEIGHT = 900;
export const SCENE_RESOLUTION = 1;

export const MOVE_STEP = 7;
export const BULLET_SPEED = 10;
export const BULLET_OFFSET = 66;

export enum Direction {
  LEFT = 'left',
  UP = 'up',
  RIGHT = 'right',
  DOWN = 'down'
}

export enum Tags {
  PLAYER = 'player',
  BULLET = 'bullet'
}

export enum Messages {
	MESSAGE = 'message'
}

export type Position = {
	x: number;
	y: number;
	angle: number;
}