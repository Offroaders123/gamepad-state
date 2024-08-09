export class GamepadState implements Disposable {
  private polling: boolean = false;
  private controller = new AbortController();
  private connected: Set<number> = new Set();
  private gamepads: Record<number, Gamepad> = {};

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

      if (this.connected.size > 0 && this.polling) {
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

    const refreshed: Gamepad[] = [];

    for (const current of navigator.getGamepads()) {
      if (current === null) continue;

      const previous = this.gamepads[current.index];
      if (previous?.timestamp === current.timestamp) continue;

      refreshed.push(current);
    }

    if (refreshed.length > 0) this.input(refreshed);

    const frame: Promise<void> = new Promise(resolve => requestAnimationFrame(() => resolve()));
    this.onpoll?.(frame);
    await frame;

    return this.poll();
  }

  onpoll: ((frame: Promise<void>) => void) | null = null;

  private input(gamepads: Gamepad[]): void {
    for (const gamepad of gamepads) {
      this.gamepads[gamepad.index] = gamepad;
    }
    this.oninput?.(gamepads);
  }

  oninput: ((gamepads: Gamepad[]) => void) | null = null;

  dispose(): void {
    this.stop();
    this.controller.abort();
    this.gamepads = {};
  }

  [Symbol.dispose](): void {
    this.dispose();
  }
}