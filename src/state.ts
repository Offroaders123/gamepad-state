export class GamepadState implements Disposable {
  #polling: boolean = false;
  readonly #controller = new AbortController();
  readonly #connected = new Set<number>();
  readonly #timestamps = new Map<number, number>();

  constructor() {
    const { signal } = this.#controller;

    queueMicrotask(() => {
      for (const gamepad of navigator.getGamepads()) {
        if (gamepad === null) continue;
        this.#connect(gamepad);
      }
    });

    window.addEventListener("gamepadconnected", event => {
      this.#connect(event.gamepad);
    }, { signal });

    window.addEventListener("gamepaddisconnected", event => {
      this.#disconnect(event.gamepad);
    }, { signal });
  }

  #connect(gamepad: Gamepad): void {
    this.#connected.add(gamepad.index);
    this.onconnect?.(gamepad);

    if (!this.#polling) {
      this.#start();
    }
  }

  onconnect: ((gamepad: Gamepad) => void) | null = null;

  #disconnect(gamepad: Gamepad): void {
    this.#connected.delete(gamepad.index);
    this.ondisconnect?.(gamepad);

    if (this.#connected.size === 0 && this.#polling) {
      this.#stop();
    }
  }

  ondisconnect: ((gamepad: Gamepad) => void) | null = null;

  #start(): void {
    this.#polling = true;
    this.onstart?.();
    this.#poll();
  }

  onstart: (() => void) | null = null;

  #stop(): void {
    this.#polling = false;
  }

  onstop: (() => void) | null = null;

  async #poll(): Promise<void> {
    if (!this.#polling) {
      this.onstop?.();
      return;
    }

    for (const current of navigator.getGamepads()) {
      if (current === null) continue;

      const previous: number | undefined = this.#timestamps.get(current.index);
      if (previous === current.timestamp) continue;

      this.#input(current);
    }

    this.onpoll?.();
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

    return this.#poll();
  }

  onpoll: (() => void) | null = null;

  #input(gamepad: Gamepad): void {
    this.#timestamps.set(gamepad.index, gamepad.timestamp);
    this.oninput?.(gamepad);
  }

  oninput: ((gamepad: Gamepad) => void) | null = null;

  dispose(): void {
    this.#stop();
    this.#controller.abort();
    this.#timestamps.clear();
  }

  [Symbol.dispose](): void {
    this.dispose();
  }
}