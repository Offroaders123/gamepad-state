export class GamepadState implements Disposable {
  private polling: boolean = false;
  private readonly controller = new AbortController();
  private readonly connected: Set<number> = new Set();
  private timestamps: Record<number, number> = {};

  constructor() {
    const { signal } = this.controller;

    window.addEventListener("gamepadconnected", event => {
      this.connect(event.gamepad);

      if (!this.polling) {
        this.start();
      }
    }, { signal });

    window.addEventListener("gamepaddisconnected", event => {
      this.disconnect(event.gamepad);

      if (this.connected.size === 0 && this.polling) {
        this.stop();
      }
    }, { signal });
  }

  private connect(gamepad: Gamepad): void {
    this.connected.add(gamepad.index);
    this.onconnect?.(gamepad);
  }

  onconnect: ((gamepad: Gamepad) => void) | null = null;

  private disconnect(gamepad: Gamepad): void {
    this.connected.delete(gamepad.index);
    this.ondisconnect?.(gamepad);
  }

  ondisconnect: ((gamepad: Gamepad) => void) | null = null;

  private start(): void {
    this.polling = true;
    this.onstart?.();
    this.poll();
  }

  onstart: (() => void) | null = null;

  private stop(): void {
    this.polling = false;
  }

  onstop: (() => void) | null = null;

  private async poll(): Promise<void> {
    if (!this.polling) {
      this.onstop?.();
      return;
    }

    for (const current of navigator.getGamepads()) {
      if (current === null) continue;

      const previous = this.timestamps[current.index];
      if (previous === current.timestamp) continue;

      this.input(current);
    }

    const frame: Promise<void> = new Promise(resolve => requestAnimationFrame(() => resolve()));
    this.onpoll?.(frame);
    await frame;

    return this.poll();
  }

  onpoll: ((frame: Promise<void>) => void) | null = null;

  private input(gamepad: Gamepad): void {
    this.timestamps[gamepad.index] = gamepad.timestamp;
    this.oninput?.(gamepad);
  }

  oninput: ((gamepad: Gamepad) => void) | null = null;

  dispose(): void {
    this.stop();
    this.controller.abort();
    this.timestamps = {};
  }

  [Symbol.dispose](): void {
    this.dispose();
  }
}