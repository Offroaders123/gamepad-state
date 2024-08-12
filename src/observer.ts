import { GamepadState } from "./state.js";

export type GamepadRecordType = "connect" | "disconnect" | "input";

export interface GamepadRecord {
  readonly type: GamepadRecordType;
  readonly gamepad: Gamepad;
}

export type GamepadObserverCallback = (record: GamepadRecord, observer: GamepadObserver) => void;

export class GamepadObserver {
  readonly #state = new GamepadState();
  readonly #observed: Set<number> = new Set();
  readonly #callback: GamepadObserverCallback;

  constructor(callback: GamepadObserverCallback) {
    this.#callback = callback;

    this.#state.onconnect = gamepad => {
      if (!this.#observed.has(gamepad.index)) return;
      this.#callback({ type: "connect", gamepad }, this);
    };

    this.#state.ondisconnect = gamepad => {
      if (!this.#observed.has(gamepad.index)) return;
      this.#callback({ type: "disconnect", gamepad }, this);
    };

    this.#state.onstart = () => this.onstart?.();

    this.#state.onstop = () => this.onstop?.();

    this.#state.onpoll = frame => this.onpoll?.(frame);

    this.#state.oninput = gamepad => {
      if (!this.#observed.has(gamepad.index)) return;
      this.#callback({ type: "input", gamepad }, this);
    };
  }

  onstart: typeof GamepadState.prototype.onstart = null;
  onstop: typeof GamepadState.prototype.onstop = null;
  onpoll: typeof GamepadState.prototype.onpoll = null;

  observe(index: number): void {
    this.#observed.add(index);
  }

  unobserve(index: number): void {
    this.#observed.delete(index);
  }

  disconnect(): void {
    this.#state.dispose();
  }
}