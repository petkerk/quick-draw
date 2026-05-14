import { MODULE_ID, registerSettings, isAllowed } from "./Settings.js";
import { DrawManager }   from "./DrawManager.js";
import { SocketHandler } from "./SocketHandler.js";
import { Toolbar }       from "./Toolbar.js";

let drawManager   = null;
let socketHandler = null;
let toolbar       = null;
let _keyHeld      = false;
let _toggledOn    = false;

Hooks.once("init", () => registerSettings());

Hooks.on("canvasReady", () => {
  drawManager = new DrawManager();
  drawManager.init();
  socketHandler = new SocketHandler(drawManager);
  socketHandler.init();
  toolbar = new Toolbar();
  toolbar.init();
  game.modules.get(MODULE_ID).toolbar = toolbar;

  // Слушаем клавиатуру
  document.addEventListener("keydown", _handleKeyDown);
  document.addEventListener("keyup", _handleKeyUp);
});

// Чистка при смене сцены
Hooks.on("canvasTearDown", () => {
  document.removeEventListener("keydown", _handleKeyDown);
  document.removeEventListener("keyup", _handleKeyUp);
});

function _handleKeyDown(e) {
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable) return;
  if (e.repeat) return;

  const activationKey = game.settings.get(MODULE_ID, "activationKey");
  const drawingKey = game.settings.get(MODULE_ID, "drawingKey");

  // Активация тулбара (Q)
  if (e.code === activationKey) {
    if (game.settings.get(MODULE_ID, "activationMode") === "hold") {
      _keyHeld = true;
      _activate();
    } else {
      _toggledOn = !_toggledOn;
      _toggledOn ? _activate() : _deactivate();
    }
  }

  // Начало рисования (например, Alt)
  if (e.code === drawingKey && (_keyHeld || _toggledOn)) {
    drawManager?.startDrawing();
  }
}

function _handleKeyUp(e) {
  const activationKey = game.settings.get(MODULE_ID, "activationKey");
  const drawingKey = game.settings.get(MODULE_ID, "drawingKey");

  if (e.code === drawingKey) {
    drawManager?.stopDrawing();
  }

  if (e.code === activationKey && game.settings.get(MODULE_ID, "activationMode") === "hold") {
    _keyHeld = false;
    _deactivate();
  }
}

function _activate() {
  drawManager?.activate();
  toolbar?.show();
}

function _deactivate() {
  drawManager?.deactivate();
  toolbar?.hide();
}