// scripts/SocketHandler.js
// Registers the module socket and routes messages to DrawManager.

import { MODULE_ID } from "./Settings.js";

const SOCKET_NAME = `module.${MODULE_ID}`;

export class SocketHandler {
  /**
   * @param {DrawManager} drawManager
   */
  constructor(drawManager) {
    this._dm = drawManager;
    this._registered = false;
  }

  init() {
    // Wire DrawManager → socket
    this._dm.setEmitter((data) => this._send(data));

    // Listen for incoming messages
    game.socket.on(SOCKET_NAME, (data) => this._receive(data));
    this._registered = true;
  }

  destroy() {
    if (this._registered) {
      game.socket.off(SOCKET_NAME);
      this._registered = false;
    }
  }

  // ── Outbound ───────────────────────────────────────────────────────────────

  _send(data) {
    // Broadcast to all OTHER clients (Foundry socket.emit broadcasts to everyone
    // including self if not filtered, so we tag the sender)
    game.socket.emit(SOCKET_NAME, { ...data, senderId: game.user.id });
  }

  // ── Inbound ────────────────────────────────────────────────────────────────

  _receive(data) {
    // Ignore our own echoed messages
    if (data.senderId === game.user.id) return;

    switch (data.type) {
      case "start": this._dm.remoteStart(data); break;
      case "point": this._dm.remotePoint(data); break;
      case "end":   this._dm.remoteEnd(data);   break;
    }
  }
}
