// scripts/Toolbar.js
// Floating mini-panel: color picker, preset swatches, width slider, mode indicator.

import { MODULE_ID } from "./Settings.js";

const PRESET_COLORS = [
  "#e74c3c", // red
  "#e67e22", // orange
  "#f1c40f", // yellow
  "#2ecc71", // green
  "#3498db", // blue
  "#9b59b6", // purple
  "#ecf0f1", // white
  "#2c3e50", // dark
];

const WIDTH_PRESETS = [2, 4, 8, 16];

export class Toolbar {
  constructor() {
    this._el      = null;
    this._color   = "#e74c3c";  // will be overridden in init()
    this._width   = 4;
    this._visible = false;
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  init() {
    // Start with player color if setting says so
    if (game.settings.get(MODULE_ID, "usePlayerColor")) {
      this._color = game.user.color?.css ?? "#e74c3c";
    }

    this._build();
  }

  destroy() {
    this._el?.remove();
    this._el = null;
  }

  // ── Public getters ─────────────────────────────────────────────────────────

  /** Returns hex number e.g. 0xff0000 */
  getColorHex() {
    return parseInt(this._color.replace("#", ""), 16);
  }

  getColorCSS() { return this._color; }
  getWidth()    { return this._width;  }

  // ── Visibility ─────────────────────────────────────────────────────────────

  show() {
    if (!this._el) return;
    this._el.classList.add("qd-visible");
    this._visible = true;
  }

  hide() {
    if (!this._el) return;
    this._el.classList.remove("qd-visible");
    this._visible = false;
  }

  isVisible() { return this._visible; }

  // ── Build DOM ──────────────────────────────────────────────────────────────

  _build() {
    const el = document.createElement("div");
    el.id = "quick-draw-toolbar";
    el.classList.add("quick-draw-toolbar");
    el.innerHTML = this._template();
    document.body.appendChild(el);
    this._el = el;

    this._applyColor(this._color);
    this._applyWidth(this._width);
    this._bindUI();
    this._makeDraggable();
  }

  _template() {
    const swatches = PRESET_COLORS.map(c =>
      `<button class="qd-swatch" data-color="${c}" style="background:${c}" title="${c}"></button>`
    ).join("");

    const widthBtns = WIDTH_PRESETS.map(w =>
      `<button class="qd-width-btn" data-width="${w}" title="${w}px">
        <span style="width:${w}px;height:${w}px;border-radius:50%;background:currentColor;display:block;"></span>
      </button>`
    ).join("");

    return `
      <div class="qd-handle" title="Drag to move">✏️ Quick Draw</div>
      <div class="qd-section qd-section--swatches">
        ${swatches}
        <input type="color" class="qd-color-input" value="${this._color}" title="Custom color">
      </div>
      <div class="qd-divider"></div>
      <div class="qd-section qd-section--widths">
        ${widthBtns}
      </div>
      <div class="qd-divider"></div>
      <div class="qd-section qd-section--meta">
        <span class="qd-status">🟢 Drawing</span>
        <span class="qd-fade-label">⏱ <span class="qd-fade-val">${game.settings.get(MODULE_ID, "fadeDuration")}s</span></span>
      </div>
    `;
  }

  _bindUI() {
    // Swatches
    this._el.querySelectorAll(".qd-swatch").forEach(btn => {
      btn.addEventListener("click", () => this._applyColor(btn.dataset.color));
    });

    // Custom color picker
    const input = this._el.querySelector(".qd-color-input");
    input.addEventListener("input",  () => this._applyColor(input.value));
    input.addEventListener("change", () => this._applyColor(input.value));

    // Width buttons
    this._el.querySelectorAll(".qd-width-btn").forEach(btn => {
      btn.addEventListener("click", () => this._applyWidth(Number(btn.dataset.width)));
    });

    // Prevent toolbar clicks from propagating to canvas (would start drawing)
    this._el.addEventListener("pointerdown", e => e.stopPropagation());
    this._el.addEventListener("mousedown",   e => e.stopPropagation());
  }

  _applyColor(css) {
    // Normalise to 6-digit hex
    if (!css.startsWith("#")) css = "#" + css;
    this._color = css;

    // Highlight active swatch
    this._el?.querySelectorAll(".qd-swatch").forEach(btn => {
      btn.classList.toggle("qd-active", btn.dataset.color === css);
    });

    // Update color input
    const input = this._el?.querySelector(".qd-color-input");
    if (input) input.value = css;

    // Update status dot color
    const status = this._el?.querySelector(".qd-status");
    if (status) status.style.color = css;
  }

  _applyWidth(w) {
    this._width = w;
    this._el?.querySelectorAll(".qd-width-btn").forEach(btn => {
      btn.classList.toggle("qd-active", Number(btn.dataset.width) === w);
    });
  }

  // ── Draggable ──────────────────────────────────────────────────────────────

  _makeDraggable() {
    const handle = this._el.querySelector(".qd-handle");
    let dragging = false, ox = 0, oy = 0;

    handle.addEventListener("mousedown", (e) => {
      dragging = true;
      const rect = this._el.getBoundingClientRect();
      ox = e.clientX - rect.left;
      oy = e.clientY - rect.top;
      e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      this._el.style.left = (e.clientX - ox) + "px";
      this._el.style.top  = (e.clientY - oy) + "px";
      this._el.style.right = "auto";
      this._el.style.bottom = "auto";
    });

    document.addEventListener("mouseup", () => { dragging = false; });
  }
}
