/* eslint-disable */

import * as PIXI from 'pixi.js';
// import gsap from 'gsap';
import gridShader from './gridShader.glsl';
import distortionFilter from './distortionShader.glsl';
import Grid from './Grid';

window.PIXI = PIXI;
export default class Scene {
  constructor(container, images) {
    this.canvasContainer = container;

    this.app = new PIXI.Application({
      backgroundColor: 0x000000,
      resizeTo: window,
    });

    this.imagesArray = images;

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.loader = new PIXI.Loader();

    this.root = new PIXI.Container();
    this.app.stage.addChild(this.root);

    this.canvasContainer.appendChild(this.app.view);
    this.pointerDownTarget = 0;
    this.pointerStart = new PIXI.Point();
    this.pointerDiffStart = new PIXI.Point();
    this.diffX = 0;
    this.diffY = 0;

    this.preload();
  }

  destroyListener = () => {
    this.app.stage.removeAllListeners();
    this.canvasContainer.removeEventListener('mousemove', this.pointerMove);
  };

  preload = () => {
    this.imagesArray.forEach(item => {
      this.loader.add(item, item);
    });

    this.loader.load().onComplete.add(() => {
      this.setup();
      this.render();
    });
  };

  calculateSizeImage = (wWidth, wHeight, { orig }, cover) => {
    const { height: targetH, width: targetW } = orig;
    const rw = wWidth / targetW;
    const rh = wHeight / targetH;
    let r;
    if (cover) {
      r = rw > rh ? rw : rh;
    } else {
      r = rw < rh ? rw : rh;
    }
    return {
      left: (wWidth - targetW * r) >> 1,
      top: (wHeight - targetH * r) >> 1,
      width: targetW * r,
      height: targetH * r,
      scale: r,
      uvRate: {
        x: (targetW * r) / wWidth,
        y: (targetH * r) / wHeight,
      },
    };
  };

  setup = () => {
    this.root.width = window.innerWidth;
    this.root.height = window.innerHeight;

    const background = new PIXI.Sprite();
    background.width = this.width;
    background.height = this.height;

    this.gridFilter = new PIXI.Filter(null, gridShader, {});
    background.filters = [this.gridFilter];

    this.distortionFilter = new PIXI.Filter(null, distortionFilter, {
      uResolution: {
        x: this.width,
        y: this.height,
      },
      uPointerDown: this.pointerDownTarget,
      uPointerDiff: new PIXI.Point(),
    });

    this.app.stage.filters = [this.distortionFilter];

    this.root.addChild(background);

    this.app.stage.interactive = true;

    this.gridSize = 50;
    this.gridMin = 3;
    this.imagePadding = 20;

    this.initGrid();
    this.initRectsAndImages();

    this.canvasContainer.addEventListener('pointerdown', this.onPointerDown);
    this.canvasContainer.addEventListener('pointerup', this.onPointerUp);
    this.canvasContainer.addEventListener('pointerupoutside', this.onPointerUp);
    this.canvasContainer.addEventListener('mousemove', this.pointerMove);
  };

  onPointerDown = e => {
    const { layerX, layerY } = e;
    this.pointerDownTarget = 1;
    this.pointerStart.set(layerX, layerY);
    this.pointerDiffStart = this.distortionFilter.uniforms.uPointerDiff.clone();
  };

  onPointerUp = () => {
    this.pointerDownTarget = 0;
  };

  pointerMove = e => {
    const { layerX, layerY } = e;
    if (this.pointerDownTarget) {
      this.diffX = this.pointerDiffStart.x + (layerX - this.pointerStart.x);
      this.diffY = this.pointerDiffStart.y + (layerY - this.pointerStart.y);
    }
  };

  initGrid = () => {
    this.gridColumnsCount = Math.ceil(this.width / this.gridSize);

    this.gridRowsCount = Math.ceil(this.height / this.gridSize);
    this.gridColumns = this.gridColumnsCount * 6;
    this.gridRows = this.gridRowsCount * 6;
    this.grid = new Grid(
      this.gridSize,
      this.gridColumns,
      this.gridRows,
      this.gridMin
    );
    this.widthRest = Math.ceil(
      this.gridColumnsCount * this.gridSize - this.width
    );
    this.heightRest = Math.ceil(
      this.gridRowsCount * this.gridSize - this.height
    );
    this.centerX =
      (this.gridColumns * this.gridSize) / 2 -
      (this.gridColumnsCount * this.gridSize) / 2;
    this.centerY =
      (this.gridRows * this.gridSize) / 2 -
      (this.gridRowsCount * this.gridSize) / 2;
    this.rects = this.grid.generateRects();
  };

  initRectsAndImages = () => {
    const graphics = new PIXI.Graphics();
    graphics.beginFill(0xaa22cc);

    this.rects.forEach(rect => {
      graphics.drawRect(
        rect.x * this.gridSize,
        rect.y * this.gridSize,
        rect.w * this.gridSize - this.imagePadding,
        rect.h * this.gridSize - this.imagePadding
      );
    });
    graphics.endFill();
    this.root.addChild(graphics);
  };

  render = () => {
    this.app.ticker.add(() => {
      this.distortionFilter.uniforms.uPointerDown +=
        (this.pointerDownTarget - this.distortionFilter.uniforms.uPointerDown) *
        0.075;
      this.distortionFilter.uniforms.uPointerDiff.x +=
        (this.diffX - this.distortionFilter.uniforms.uPointerDiff.x) * 0.2;
      this.distortionFilter.uniforms.uPointerDiff.y +=
        (this.diffY - this.distortionFilter.uniforms.uPointerDiff.y) * 0.2;
      this.root.x =
        this.distortionFilter.uniforms.uPointerDiff.x - this.centerX;
      this.root.y =
        this.distortionFilter.uniforms.uPointerDiff.y - this.centerY;
    });
  };
}
