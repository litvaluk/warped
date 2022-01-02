export const SCENE_WIDTH = 1920;
export const SCENE_HEIGHT = 1080;
export const SCENE_RESOLUTION = 1;

export const PLAYER_STARTING_X = SCENE_WIDTH / 2;
export const PLAYER_STARTING_Y = SCENE_HEIGHT / 2;
export const PLAYER_MOVE_STEP = 7;

export const LASER_SPEED = 10;
export const LASER_OFFSET = 66;

export const ENEMY_SPAWNER_STARTING_INTESITY = 10;

export type Position = {
  x: number;
  y: number;
  angle: number;
}

export enum Direction {
  LEFT = 'left',
  UP = 'up',
  RIGHT = 'right',
  DOWN = 'down'
}

export enum Tags {
  PLAYER = 'player',
  LASER = 'laser',
  ENEMY = 'enemy'
}

export enum Messages {
  MESSAGE = 'message'
}

export enum EnemyColor {
  RED = 'red',
  PURPLE = 'purple',
  GREEN = 'green',
  ORANGE = 'orange',
  YELLOW = 'yellow'
}

export enum EnemyVariant {
  SMALL = '1',
  MEDIUM = '2',
  LARGE = '3',
  HUGE = '4'
}

export enum LaserColor {
  BLUE = 'blue',
  RED = 'red',
  PURPLE = 'purple',
  GREEN = 'green',
  ORANGE = 'orange',
  YELLOW = 'yellow'
}