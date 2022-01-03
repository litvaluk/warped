import * as PIXI from 'pixi.js';

export const SCENE_WIDTH = 1920;
export const SCENE_HEIGHT = 1080;
export const SCENE_RESOLUTION = 1;

export const PLAYER_STARTING_X = 1 / 2 * SCENE_WIDTH;
export const PLAYER_STARTING_Y = 3 / 4 * SCENE_HEIGHT;
export const PLAYER_MOVE_STEP = 7;

export const STARTING_SCORE = 0;
export const STARTING_LIVES = 3;
export const STARTING_LASER_LEVEL = 1;

export const SCORE_FOR_ENEMY_SMALL = 5;
export const SCORE_FOR_ENEMY_MEDIUM = 10;
export const SCORE_FOR_ENEMY_LARGE = 20;
export const SCORE_FOR_ENEMY_HUGE = 50;

export const SCORE_FOR_METEOR_SMALL = 1;
export const SCORE_FOR_METEOR_MEDIUM = 2;
export const SCORE_FOR_METEOR_LARGE = 3;

export const LASER_SPEED = 10;
export const LASER_OFFSET = 66;

export const METEORITE_SPEED = 3;
export const METEORITE_SHATTER_ANGLE_CHANGE = Math.PI / 6;

export const ENEMY_SPAWNER_STARTING_INTESITY = 20;
export const METEORITE_SPAWNER_STARTING_INTESITY = 20;
export const COLLECTABLE_SPAWNER_STARTING_INTESITY = 10;

export const LIFE_OFFSET_X = -20;
export const LIFE_OFFSET_Y = -10;
export const SCORE_TEXT_OFFSET_X = 20;
export const SCORE_TEXT_OFFSET_Y = -20;

export const UI_Z_INDEX = 999;

export const TEXT_STYLE_SCORE = new PIXI.TextStyle({
  fontFamily: 'Aldrich',
  fontSize: 48,
  fill: '#fff'
});

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
  ENEMY = 'enemy',
  METEORITE = 'meteorite',
  COLLECTABLE = 'collectable'
}

export enum MessageActions {
  ADD_LIFE = 'add-life',
  REMOVE_LIFE = 'remove-life',
  ADD_SCORE = 'add-score'
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

export enum MeteoriteColor {
  WHITE = 'white',
  GRAY = 'gray'
}

export enum MeteoriteSize {
  SMALL = '1',
  MEDIUM = '2',
  LARGE = '3'
}

export enum LaserColor {
  BLUE = 'blue',
  RED = 'red',
  PURPLE = 'purple',
  GREEN = 'green',
  ORANGE = 'orange',
  YELLOW = 'yellow'
}

export enum CollectableType {
  LIFE = 'life',
  LASER = 'laser',
  SHIELD = 'shield'
}