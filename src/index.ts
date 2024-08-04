export type GamepadObserverType = "connect" | "disconnect" | "input";

export interface GamepadRecord {
  type: GamepadObserverType;
  gamepad: Gamepad;
}

export type GamepadObserverCallback = (records: GamepadRecord[], observer: GamepadObserver) => void;

export class GamepadObserver extends EventTarget {
  private running: boolean = false;
  private controller = new AbortController();
  private observed: Set<number> = new Set();
  private gamepads: Record<number, Gamepad> = {};

  constructor(private readonly callback: GamepadObserverCallback) {
    super();

    const { signal } = this.controller;

    window.addEventListener("gamepadconnected", event => {
      if (!this.observed.has(event.gamepad.index)) return;
      if (this.running === false) {
        this.start();
      }
      const { gamepad } = event;
      this.callback([{ type: "connect", gamepad }], this);
    }, { signal });

    window.addEventListener("gamepaddisconnected", event => {
      if (!this.observed.has(event.gamepad.index)) return;
      const { gamepad } = event;
      this.callback([{ type: "disconnect", gamepad }], this);
      if (this.running === true) {
        this.stop();
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
    this.stop();
    this.controller.abort();
    this.observed.clear();
    this.gamepads = {};
  }

  private start(): void {
    this.running = true;
    this.dispatchEvent(new Event("start"));
    this.poll();
  }

  private stop(): void {
    this.running = false;
    this.dispatchEvent(new Event("stop"));
  }

  private async poll(): Promise<void> {
    if (this.running === false) return;
    await new Promise<number>(requestAnimationFrame);

    for (const gamepad of navigator.getGamepads()) {
      if (gamepad === null || !this.observed.has(gamepad.index)) continue;

      const previousGamepad = this.gamepads[gamepad.index];
      if (previousGamepad?.timestamp === gamepad.timestamp) continue;

      this.gamepads[gamepad.index] = gamepad;
      this.callback([{ type: "input", gamepad }], this);
    }

    await this.poll();
  }
}