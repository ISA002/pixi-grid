/* eslint-disable */

import * as PIXI from 'pixi.js';
// import gsap from 'gsap';

window.PIXI = PIXI;
export default class Scene {
  constructor(container, images) {
    this.canvasContainer = container;

    this.app = new PIXI.Application({
      backgroundColor: 0x000000,
      resizeTo: window,
    });

    this.imagesArray = images;

    this.loader = new PIXI.Loader();

    this.root = new PIXI.Container();
    this.app.stage.addChild(this.root);

    this.canvasContainer.appendChild(this.app.view);

    this.preload();
  }

  destroyListener = () => {
    this.app.stage.removeAllListeners();
    this.canvasContainer.removeEventListener(this.pointerMove);
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

    this.app.stage.interactive = true;

    this.canvasContainer.addEventListener('mousemove', this.pointerMove);
  };

  render = () => {
    this.app.ticker.add(() => {});
  };
}
