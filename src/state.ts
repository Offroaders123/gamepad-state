export type Gamepads = [(Gamepad | null)?, (Gamepad | null)?, (Gamepad | null)?, (Gamepad | null)?];

export type GamepadIndex = Extract<keyof Gamepads, `${number}`> extends `${infer U extends number}` ? U : never;

export type GamepadTimestamps = { [K in GamepadIndex]?: number; };

export class GamepadState implements Disposable {
  #polling: boolean = false;
  readonly #controller = new AbortController();
  readonly #connected: Set<GamepadIndex> = new Set();
  #timestamps: GamepadTimestamps = {};

  constructor() {
    const { signal } = this.#controller;

    window.addEventListener("gamepadconnected", event => {
      this.#connect(event.gamepad);

      if (!this.#polling) {
        this.#start();
      }
    }, { signal });

    window.addEventListener("gamepaddisconnected", event => {
      this.#disconnect(event.gamepad);

      if (this.#connected.size === 0 && this.#polling) {
        this.#stop();
      }
    }, { signal });
  }

  #connect(gamepad: Gamepad): void {
    this.#connected.add(gamepad.index as GamepadIndex);
    this.onconnect?.(gamepad);
  }

  onconnect: ((gamepad: Gamepad) => void) | null = null;

  #disconnect(gamepad: Gamepad): void {
    this.#connected.delete(gamepad.index as GamepadIndex);
    this.ondisconnect?.(gamepad);
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

    for (const current of navigator.getGamepads() as Gamepads) {
      if (current === null || current === undefined) continue;

      const previous = this.#timestamps[current.index as GamepadIndex];
      if (previous === current.timestamp) continue;

      this.#input(current);
    }

    const frame: Promise<void> = new Promise(resolve => requestAnimationFrame(() => resolve()));
    this.onpoll?.(frame);
    await frame;

    return this.#poll();
  }

  onpoll: ((frame: Promise<void>) => void) | null = null;

  #input(gamepad: Gamepad): void {
    this.#timestamps[gamepad.index as GamepadIndex] = gamepad.timestamp;
    this.oninput?.(gamepad);
  }

  oninput: ((gamepad: Gamepad) => void) | null = null;

  dispose(): void {
    this.#stop();
    this.#controller.abort();
    this.#timestamps = {};
  }

  [Symbol.dispose](): void {
    this.dispose();
  }
}