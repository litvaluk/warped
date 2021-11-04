export const SCENE_WIDTH = 1920;
export const SCENE_HEIGHT = 1080;
export const SCENE_RESOLUTION = 1;

export const PLAYER_STARTING_X = SCENE_WIDTH/2;
export const PLAYER_STARTING_Y = SCENE_HEIGHT/2;
export const PLAYER_MOVE_STEP = 7;

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