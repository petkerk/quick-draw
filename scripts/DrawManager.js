import { MODULE_ID } from "./Settings.js";

class Stroke {
  constructor(opts) {
    this.color = opts.color;
    this.alpha = opts.alpha ?? 0.85;
    this.width = opts.width;
    this.fadeDelay = opts.fadeDelay;
    this.fadeOutMs = opts.fadeOutMs;
    this.userId = opts.userId;
    this.points = [];
    this.gfx = new PIXI.Graphics();
    this.gfx.alpha = this.alpha;
    this._fadeTimer = null;
    this._fadingOut = false;
  }

  addPoint(x, y) {
    this.points.push({ x, y });
    this._redraw();
  }

  _redraw() {
    this.gfx.clear();
    this.gfx.lineStyle(this.width, this.color, 1, 0.5);
    if (this.points.length < 2) return;
    this.gfx.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      this.gfx.lineTo(this.points[i].x, this.points[i].y);
    }
  }

  scheduleFade(onComplete) {
    this._fadeTimer = setTimeout(() => {
      this._fadingOut = true;
      const start = Date.now();
      const animate = () => {
        const elapsed = Date.now() - start;
        const p = 1 - (elapsed / this.fadeOutMs);
        if (p <= 0) {
          this.gfx.destroy();
          if (onComplete) onComplete(this);
        } else {
          this.gfx.alpha = p * this.alpha;
          requestAnimationFrame(animate);
        }
      };
      animate();
    }, this.fadeDelay);
  }
}

export class DrawManager {
  constructor() {
    this._layer = null;
    this._strokes = [];
    this._current = null;
    this._active = false;
    this._onEmit = null;
    this._lastPos = { x: 0, y: 0 };
  }

  init() {
    this._layer = new PIXI.Container();
    canvas.stage.addChild(this._layer);
    this._bindEvents();
  }

  _bindEvents() {
    this._onPointerMove = (e) => {
      const t = canvas.stage.worldTransform;
      this._lastPos = {
        x: (e.data.global.x - t.tx) / t.a,
        y: (e.data.global.y - t.ty) / t.d
      };
      if (this._current) this._extendStroke(this._lastPos.x, this._lastPos.y);
    };
    canvas.stage.on("pointermove", this._onPointerMove);
  }

  activate() { this._active = true; }
  deactivate() { this._active = false; this.stopDrawing(); }

  startDrawing() {
    if (!this._active || this._current) return;
    const toolbar = game.modules.get(MODULE_ID).toolbar;
    const opts = {
      color: toolbar.getColorHex(),
      width: toolbar.getWidth(),
      fadeDelay: game.settings.get(MODULE_ID, "fadeDuration") * 1000,
      fadeOutMs: game.settings.get(MODULE_ID, "fadeOutMs"),
      userId: game.user.id
    };
    this._startStroke(this._lastPos.x, this._lastPos.y, opts);
  }

  stopDrawing() {
    if (this._current) this._finishCurrentStroke();
  }

  _startStroke(x, y, opts) {
    const stroke = new Stroke(opts);
    this._layer.addChild(stroke.gfx);
    this._strokes.push(stroke);
    this._current = stroke;
    stroke.addPoint(x, y);
    this._emit("start", { x, y, opts, strokeId: stroke._id = foundry.utils.randomID() });
  }

  _extendStroke(x, y) {
    this._current.addPoint(x, y);
    this._emit("point", { x, y, strokeId: this._current._id });
  }

  _finishCurrentStroke() {
    const stroke = this._current;
    this._current = null;
    this._emit("end", { strokeId: stroke._id });
    stroke.scheduleFade((s) => {
      this._strokes = this._strokes.filter(x => x !== s);
    });
  }

  setEmitter(fn) { this._onEmit = fn; }
  _emit(type, data) { if (this._onEmit) this._onEmit({ type, ...data }); }

  // Удаленные мазки (от других игроков)
  remoteStart({ x, y, opts, strokeId }) {
    const stroke = new Stroke(opts);
    stroke._id = strokeId;
    this._layer.addChild(stroke.gfx);
    this._strokes.push(stroke);
    stroke.addPoint(x, y);
  }
  remotePoint({ x, y, strokeId }) {
    const s = this._strokes.find(s => s._id === strokeId);
    if (s) s.addPoint(x, y);
  }
  remoteEnd({ strokeId }) {
    const s = this._strokes.find(s => s._id === strokeId);
    if (s) s.scheduleFade((str) => this._strokes = this._strokes.filter(x => x !== str));
  }
}