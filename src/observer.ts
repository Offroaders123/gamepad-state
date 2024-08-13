import { GamepadState } from "./state.js";

export type GamepadRecordType = "connect" | "disconnect" | "input";

export interface GamepadRecordOptions {
  gamepad: Gamepad;
}

export class GamepadRecord {
  readonly type: GamepadRecordType;
  readonly gamepad: Gamepad;

  constructor(type: GamepadRecordType, options: GamepadRecordOptions) {
    this.type = type;
    this.gamepad = options.gamepad;
  }
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
      const record = new GamepadRecord("connect", { gamepad });
      this.#callback(record, this);
    };

    this.#state.ondisconnect = gamepad => {
      if (!this.#observed.has(gamepad.index)) return;
      const record = new GamepadRecord("disconnect", { gamepad });
      this.#callback(record, this);
    };

    this.#state.onstart = () => this.onstart?.();

    this.#state.onstop = () => this.onstop?.();

    this.#state.onpoll = () => this.onpoll?.();

    this.#state.oninput = gamepad => {
      if (!this.#observed.has(gamepad.index)) return;
      const record = new GamepadRecord("input", { gamepad });
      this.#callback(record, this);
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