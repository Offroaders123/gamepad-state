export type GamepadRecordType = "connect" | "disconnect" | "input";

export interface GamepadRecord {
  readonly type: GamepadRecordType;
  readonly gamepad: Gamepad;
}

export type GamepadObserverCallback = (records: GamepadRecord[], observer: GamepadObserver) => void;

export class GamepadObserver {
  private running: boolean = false;
  private controller = new AbortController();
  private observed: Set<number> = new Set();
  private connected: Set<number> = new Set();
  private gamepads: Record<number, Gamepad> = {};

  constructor(private readonly callback: GamepadObserverCallback) {
    const { signal } = this.controller;

    window.addEventListener("gamepadconnected", event => {
      if (!this.connected.has(event.gamepad.index)) {
        this.connected.add(event.gamepad.index);
      }
      if (!this.observed.has(event.gamepad.index)) return;
      if (this.running === false) {
        this.start();
      }
      const { gamepad } = event;
      this.callback([{ type: "connect", gamepad }], this);
    }, { signal });

    window.addEventListener("gamepaddisconnected", event => {
      this.connected.delete(event.gamepad.index);
      if (!this.observed.has(event.gamepad.index)) return;
      const { gamepad } = event;
      this.callback([{ type: "disconnect", gamepad }], this);
      if (this.connected.size > 0 && this.running === true) {
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
    this.onstart?.();
    this.poll();
  }

  onstart?: () => void;

  private stop(): void {
    this.running = false;
    this.onstop?.();
  }

  onstop?: () => void;

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