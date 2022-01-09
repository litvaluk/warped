import * as ECS from '../../libs/pixi-ecs';
import * as PIXI from 'pixi.js';
import { SCENE_HEIGHT, SCENE_WIDTH, SCORE_TEXT_OFFSET_X, SCORE_TEXT_OFFSET_Y, TEXT_STYLE_TITLE, TEXT_STYLE_MENU_ITEM, TEXT_STYLE_MENU_ITEM_HOVER, HOW_TO_PLAY_TEXT, TEXT_STYLE_HOW_TO_PLAY_TITLE, TEXT_STYLE_HOW_TO_PLAY_TEXT } from '../constants';
import { GameFactory } from './gameFactory';

export class MenuFactory {

  private static _instance: MenuFactory;

  public static getInstance(): MenuFactory {
    if (!MenuFactory._instance) {
      MenuFactory._instance = new MenuFactory();
    }
    return MenuFactory._instance;
  }

  loadMenuStage(scene: ECS.Scene) {
    this._createBackground(scene);
    this._createTitle(scene);
    this._createMenuItems(scene);
  }

  loadHowToPlayStage(scene: ECS.Scene) {
    this._createBackground(scene);
    this._createHowToPlayTitle(scene);
    this._createHowToPlayText(scene);
    this._createHowToPlayControls(scene);
    this._createBackToMenu(scene);
  }

  loadGameOverStage(scene: ECS.Scene, score: number) {
    this._createBackground(scene);
    this._createGameOverTitle(scene);
    this._createGameOverScoreText(scene, score);
    this._createGameOverStartAgain(scene);
    this._createBackToMenu(scene);
  }

  private _createBackground(scene: ECS.Scene) {
    new ECS.Builder(scene)
      .asTilingSprite(PIXI.Texture.from('background'), SCENE_WIDTH, SCENE_HEIGHT)
      .withName('background')
      .withParent(scene.stage)
      .build();
  }

  private _createTitle(scene: ECS.Scene) {
    const name = 'title';
    new ECS.Builder(scene)
      .asText('Warped', TEXT_STYLE_TITLE)
      .anchor(0.5)
      .localPos(SCENE_WIDTH / 2, SCENE_HEIGHT / 6)
      .withName(name)
      .withParent(scene.stage)
      .build();
  }

  private _createMenuItems(scene: ECS.Scene) {
    const offset = 75;

    const startGameName = 'start-game';
    const startGame: ECS.Text = new ECS.Builder(scene)
      .asText('Start Game', TEXT_STYLE_MENU_ITEM)
      .anchor(0.5)
      .localPos(SCENE_WIDTH / 2, SCENE_HEIGHT / 2.2)
      .withName(startGameName)
      .withParent(scene.stage)
      .build();
    startGame.interactive = true;
    startGame.buttonMode = true;
    startGame.on('mouseover', () => { startGame.style = TEXT_STYLE_MENU_ITEM_HOVER });
    startGame.on('mouseout', () => { startGame.style = TEXT_STYLE_MENU_ITEM });
    startGame.on('click', () => {
      scene.callWithDelay(0, () => {
        scene.clearScene();
        GameFactory.getInstance().loadGameStage(scene);
      });
    });

    const howToPlayName = 'how-to-play';
    const howToPlay: ECS.Text = new ECS.Builder(scene)
      .asText('How To Play', TEXT_STYLE_MENU_ITEM)
      .anchor(0.5)
      .localPos(SCENE_WIDTH / 2, SCENE_HEIGHT / 2.2 + startGame.getBounds().height / 2 + offset)
      .withName(howToPlayName)
      .withParent(scene.stage)
      .build();
    howToPlay.interactive = true;
    howToPlay.buttonMode = true;
    howToPlay.on('mouseover', () => { howToPlay.style = TEXT_STYLE_MENU_ITEM_HOVER });
    howToPlay.on('mouseout', () => { howToPlay.style = TEXT_STYLE_MENU_ITEM });
    howToPlay.on('click', () => {
      scene.callWithDelay(0, () => {
        scene.clearScene();
        this.loadHowToPlayStage(scene);
      });
    });
  }

  private _createGameOverTitle(scene: ECS.Scene) {
    const name = 'game-over-title';

    new ECS.Builder(scene)
      .asText('Game Over!', TEXT_STYLE_TITLE)
      .anchor(0.5)
      .localPos(SCENE_WIDTH / 2, SCENE_HEIGHT / 3)
      .withName(name)
      .withParent(scene.stage)
      .build();
  }

  private _createGameOverScoreText(scene: ECS.Scene, score: number) {
    const name = 'game-over-score';
    new ECS.Builder(scene)
      .asText(`Score: ${score}`, TEXT_STYLE_MENU_ITEM)
      .anchor(0.5)
      .localPos(SCENE_WIDTH / 2, SCENE_HEIGHT / 2)
      .withName(name)
      .withParent(scene.stage)
      .build();
  }

  private _createBackToMenu(scene: ECS.Scene) {
    const name = 'back-to-menu';
    const backToMenu: ECS.Text = new ECS.Builder(scene)
      .asText('Back to menu', TEXT_STYLE_MENU_ITEM)
      .withName(name)
      .withParent(scene.stage)
      .build();

    backToMenu.position.set(0 + SCORE_TEXT_OFFSET_X, SCENE_HEIGHT + SCORE_TEXT_OFFSET_Y - backToMenu.height);
    backToMenu.interactive = true;
    backToMenu.buttonMode = true;
    backToMenu.on('mouseover', () => { backToMenu.style = TEXT_STYLE_MENU_ITEM_HOVER });
    backToMenu.on('mouseout', () => { backToMenu.style = TEXT_STYLE_MENU_ITEM });
    backToMenu.on('click', () => {
      scene.callWithDelay(0, () => {
        scene.clearScene();
        this.loadMenuStage(scene);
      });
    });
  }

  private _createGameOverStartAgain(scene: ECS.Scene) {
    const name = 'game-over-start-again';
    const startAgain: ECS.Text = new ECS.Builder(scene)
      .asText('Start again', TEXT_STYLE_MENU_ITEM)
      .anchor(1, 0)
      .withName(name)
      .withParent(scene.stage)
      .build();

    startAgain.position.set(SCENE_WIDTH - SCORE_TEXT_OFFSET_X, SCENE_HEIGHT + SCORE_TEXT_OFFSET_Y - startAgain.height);
    startAgain.interactive = true;
    startAgain.buttonMode = true;
    startAgain.on('mouseover', () => { startAgain.style = TEXT_STYLE_MENU_ITEM_HOVER });
    startAgain.on('mouseout', () => { startAgain.style = TEXT_STYLE_MENU_ITEM });
    startAgain.on('click', () => {
      scene.callWithDelay(0, () => {
        scene.clearScene();
        GameFactory.getInstance().loadGameStage(scene);
      });
    });
  }

  private _createHowToPlayTitle(scene: ECS.Scene) {
    const name = 'how-to-play-title';
    new ECS.Builder(scene)
      .asText('How To Play', TEXT_STYLE_HOW_TO_PLAY_TITLE)
      .anchor(0.5)
      .localPos(SCENE_WIDTH / 2, SCENE_HEIGHT / 8)
      .withName(name)
      .withParent(scene.stage)
      .build();
  }

  private _createHowToPlayText(scene: ECS.Scene) {
    const name = 'how-to-play-text';
    new ECS.Builder(scene)
      .asText(HOW_TO_PLAY_TEXT, TEXT_STYLE_HOW_TO_PLAY_TEXT)
      .anchor(0.5)
      .localPos(SCENE_WIDTH / 2, SCENE_HEIGHT / 2.5)
      .withName(name)
      .withParent(scene.stage)
      .build();
  }

  private _createHowToPlayControls(scene: ECS.Scene) {
    const leftClickName = 'left-click';
    const leftClick: ECS.Sprite = new ECS.Builder(scene)
      .asSprite(PIXI.Texture.from('left-click'))
      .anchor(0.5)
      .scale(0.4)
      .localPos(500, 750)
      .withName(leftClickName)
      .withParent(scene.stage)
      .build();

    const leftClickTextName = 'left-click-text';
    const leftClickText: ECS.Text = new ECS.Builder(scene)
      .asText('Shoot', TEXT_STYLE_HOW_TO_PLAY_TEXT)
      .anchor(0.5)
      .localPos(leftClick.position.x + leftClick.width + 60, leftClick.position.y)
      .withName(leftClickTextName)
      .withParent(scene.stage)
      .build();

    const sKeyName = 's-key';
    const sKey: ECS.Sprite = new ECS.Builder(scene)
      .asSprite(PIXI.Texture.from('key'))
      .anchor(0.5)
      .scale(0.3)
      .localPos(leftClickText.x + 750, leftClick.y + 30)
      .withName(sKeyName)
      .withParent(scene.stage)
      .build();

    const wKeyName = 'w-key';
    const wKey: ECS.Sprite = new ECS.Builder(scene)
      .asSprite(PIXI.Texture.from('key'))
      .anchor(0.5)
      .scale(0.3)
      .localPos(sKey.x, sKey.y - sKey.height - 20)
      .withName(wKeyName)
      .withParent(scene.stage)
      .build();

    const aKeyName = 'a-key';
    const aKey: ECS.Sprite = new ECS.Builder(scene)
      .asSprite(PIXI.Texture.from('key'))
      .anchor(0.5)
      .scale(0.3)
      .localPos(sKey.x - sKey.width - 20, sKey.y)
      .withName(aKeyName)
      .withParent(scene.stage)
      .build();

    const dKeyName = 'd-key';
    const dKey: ECS.Sprite = new ECS.Builder(scene)
      .asSprite(PIXI.Texture.from('key'))
      .anchor(0.5)
      .scale(0.3)
      .localPos(sKey.x + sKey.width + 20, sKey.y)
      .withName(dKeyName)
      .withParent(scene.stage)
      .build();

    this._createKeySymbol(scene, 'W', wKey.position.x, wKey.position.y);
    this._createKeySymbol(scene, 'A', aKey.position.x, aKey.position.y);
    this._createKeySymbol(scene, 'S', sKey.position.x, sKey.position.y);
    this._createKeySymbol(scene, 'D', dKey.position.x, dKey.position.y);

    const keysTextName = 'keys-text';
    new ECS.Builder(scene)
      .asText('Move', TEXT_STYLE_HOW_TO_PLAY_TEXT)
      .anchor(0.5)
      .localPos(sKey.x - sKey.width - 120, leftClickText.y)
      .withName(keysTextName)
      .withParent(scene.stage)
      .build();
  }

  private _createKeySymbol(scene: ECS.Scene, symbol: string, x: number, y: number) {
    let symbolText = new ECS.Text(`${symbol.toLowerCase()}-key-text`, symbol);
    symbolText.style = TEXT_STYLE_HOW_TO_PLAY_TEXT;
    symbolText.anchor.set(0.5);
    symbolText.position.set(x, y + 6);
    scene.stage.addChild(symbolText);
  }

}