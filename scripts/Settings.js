export const MODULE_ID = "quick-draw";

export function registerSettings() {
  game.settings.register(MODULE_ID, "activationKey", {
    name: game.i18n.localize("QUICKDRAW.SettingsActivationKeyName"),
    hint: game.i18n.localize("QUICKDRAW.SettingsActivationKeyHint"),
    scope: "client",
    config: true,
    type: String,
    default: "KeyQ"
  });

  game.settings.register(MODULE_ID, "activationMode", {
    name: game.i18n.localize("QUICKDRAW.SettingsActivationModeName"),
    hint: game.i18n.localize("QUICKDRAW.SettingsActivationModeHint"),
    scope: "client",
    config: true,
    type: String,
    default: "hold",
    choices: { hold: "Hold key", toggle: "Toggle on/off" }
  });

  game.settings.register(MODULE_ID, "drawingKey", {
    name: game.i18n.localize("QUICKDRAW.SettingsDrawingKeyName"),
    hint: game.i18n.localize("QUICKDRAW.SettingsDrawingKeyHint"),
    scope: "client",
    config: true,
    type: String,
    default: "AltLeft"
  });

  game.settings.register(MODULE_ID, "fadeDuration", {
    name: game.i18n.localize("QUICKDRAW.SettingsFadeDurationName"),
    scope: "client",
    config: true,
    type: Number,
    default: 3,
    range: { min: 1, max: 60, step: 1 }
  });

  game.settings.register(MODULE_ID, "fadeOutMs", {
    name: game.i18n.localize("QUICKDRAW.SettingsFadeOutMsName"),
    scope: "client",
    config: true,
    type: Number,
    default: 800,
    range: { min: 100, max: 3000, step: 100 }
  });

  game.settings.register(MODULE_ID, "usePlayerColor", {
    name: game.i18n.localize("QUICKDRAW.SettingsUsePlayerColorName"),
    scope: "client",
    config: true,
    type: Boolean,
    default: true
  });
}

export function isAllowed() {
  return true;
}