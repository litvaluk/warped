import * as ECS from '../libs/pixi-ecs';
import { SCENE_HEIGHT, SCENE_RESOLUTION, SCENE_WIDTH } from './constants';
import { GameLoader } from './game-loader';

class Warped {

	engine: ECS.Engine;

	constructor() {
		this.engine = new ECS.Engine();
		let canvas = (document.getElementById('gameCanvas') as HTMLCanvasElement);

		// init the game loop
		this.engine.init(canvas, {
			resizeToScreen: true,
			width: SCENE_WIDTH,
			height: SCENE_HEIGHT,
			resolution: SCENE_RESOLUTION,
			flagsSearchEnabled: false, // searching by flags feature
			statesSearchEnabled: false, // searching by states feature
			tagsSearchEnabled: true, // searching by tags feature
			namesSearchEnabled: true, // searching by names feature
			notifyAttributeChanges: false, // will send message if attributes change
			notifyStateChanges: false, // will send message if states change
			notifyFlagChanges: false, // will send message if flags change
			notifyTagChanges: false, // will send message if tags change
			debugEnabled: false // debugging window
		});

		new GameLoader().loadGame(this.engine);
	}

}

// this will create a new instance as soon as this file is loaded
export default new Warped();