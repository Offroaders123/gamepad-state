export type GamepadObserverType = "connect" | "disconnect" | "input";

export interface GamepadObserverEntry {
  type: GamepadObserverType;
  gamepad: Gamepad;
}

export type GamepadObserverCallback = (entry: GamepadObserverEntry, observer: GamepadObserver) => void;

export class GamepadObserver {
  private observed: Set<number> = new Set();
  private controller = new AbortController();

  constructor(callback: GamepadObserverCallback) {
    const { signal } = this.controller;

    window.addEventListener("gamepadconnected", event => {
      if (this.observed.has(event.gamepad.index)) {
        const { gamepad } = event;
        callback({ type: "connect", gamepad }, this);
      }
    }, { signal });

    window.addEventListener("gamepaddisconnected", event => {
      if (this.observed.has(event.gamepad.index)) {
        const { gamepad } = event;
        callback({ type: "disconnect", gamepad }, this);
      }
    }, { signal });
  }

  observe(index: number): void {
    this.observed.add(index);
  }

  unobserve(index: number): void {
    this.observed.delete(index);
  }

  disconnect(): void {
    this.observed.clear();
    this.controller.abort();
  }

  private async poll(): Promise<void> {
    await new Promise<number>(requestAnimationFrame);

    for (const gamepad of navigator.getGamepads()) {
      if (gamepad === null || !this.observed.has(gamepad.index)) continue;
    }

    await this.poll();
  }
}

const observer = new GamepadObserver((entry, observer) => {

});