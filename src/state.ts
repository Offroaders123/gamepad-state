export class GamepadState implements Disposable {
  private polling: boolean = false;
  private controller = new AbortController();
  private connected: Set<number> = new Set();
  private gamepads: Record<number, Gamepad> = {};

  constructor() {
    const { signal } = this.controller;

    window.addEventListener("gamepadconnected", event => {
      if (!this.polling) {
        this.start();
      }

      this.connect(event.gamepad);
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
    this.onstop?.();
  }

  onstop: (() => void) | null = null;

  private async poll(): Promise<void> {
    if (!this.polling) return;

    for (const current of navigator.getGamepads()) {
      if (current === null) continue;

      const previous = this.gamepads[current.index];
      if (previous?.timestamp === current.timestamp) continue;

      this.input(current);
    }

    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

    return this.poll();
  }

  private input(gamepad: Gamepad): void {
    this.gamepads[gamepad.index] = gamepad;
    this.oninput?.(gamepad);
  }

  oninput: ((gamepad: Gamepad) => void) | null = null;

  dispose(): void {
    this.stop();
    this.controller.abort();
    this.gamepads = {};
  }

  [Symbol.dispose](): void {
    this.dispose();
  }
}