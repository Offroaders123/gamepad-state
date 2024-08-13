import { GamepadState } from "./state.js";

import type { GamepadIndex } from "./state.js";

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
  readonly #observed: Set<GamepadIndex> = new Set();
  readonly #callback: GamepadObserverCallback;

  constructor(callback: GamepadObserverCallback) {
    this.#callback = callback;

    this.#state.onconnect = gamepad => {
      if (!this.#observed.has(gamepad.index as GamepadIndex)) return;
      const record = new GamepadRecord("connect", { gamepad });
      this.#callback(record, this);
    };

    this.#state.ondisconnect = gamepad => {
      if (!this.#observed.has(gamepad.index as GamepadIndex)) return;
      const record = new GamepadRecord("disconnect", { gamepad });
      this.#callback(record, this);
    };

    this.#state.onstart = () => this.onstart?.();

    this.#state.onstop = () => this.onstop?.();

    this.#state.onpoll = frame => this.onpoll?.(frame);

    this.#state.oninput = gamepad => {
      if (!this.#observed.has(gamepad.index as GamepadIndex)) return;
      const record = new GamepadRecord("input", { gamepad });
      this.#callback(record, this);
    };
  }

  onstart: typeof GamepadState.prototype.onstart = null;
  onstop: typeof GamepadState.prototype.onstop = null;
  onpoll: typeof GamepadState.prototype.onpoll = null;

  observe(index: GamepadIndex): void {
    this.#observed.add(index);
  }

  unobserve(index: GamepadIndex): void {
    this.#observed.delete(index);
  }

  disconnect(): void {
    this.#state.dispose();
  }
}