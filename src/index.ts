export type GamepadObserverType = "connect" | "disconnect" | "input";

export interface GamepadRecord {
  type: GamepadObserverType;
  gamepad: Gamepad;
}

export type GamepadObserverCallback = (records: GamepadRecord[], observer: GamepadObserver) => void;

export class GamepadObserver {
  private running: boolean = false;
  private observed: Set<number> = new Set();
  private gamepads: Record<number, Gamepad> = {};
  private controller = new AbortController();

  constructor(private readonly callback: GamepadObserverCallback) {
    const { signal } = this.controller;

    window.addEventListener("gamepadconnected", event => {
      if (this.observed.has(event.gamepad.index)) {
        const { gamepad } = event;
        this.callback([{ type: "connect", gamepad }], this);
      }
    }, { signal });

    window.addEventListener("gamepaddisconnected", event => {
      if (this.observed.has(event.gamepad.index)) {
        const { gamepad } = event;
        this.callback([{ type: "disconnect", gamepad }], this);
      }
    }, { signal });

    this.start();
  }

  observe(index: number): void {
    this.observed.add(index);
  }

  unobserve(index: number): void {
    this.observed.delete(index);
  }

  disconnect(): void {
    this.stop();
    this.observed.clear();
    this.gamepads = {};
    this.controller.abort();
  }

  private start(): void {
    this.running = true;
    this.poll();
  }

  private stop(): void {
    this.running = false;
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