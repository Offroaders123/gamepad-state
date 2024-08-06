import { GamepadState } from "./state.js";

export type GamepadRecordType = "connect" | "disconnect" | "input";

export interface GamepadRecord {
  readonly type: GamepadRecordType;
  readonly gamepad: Gamepad;
}

export type GamepadObserverCallback = (records: GamepadRecord[], observer: GamepadObserver) => void;

function debouncePool(callback: GamepadObserverCallback, observer: GamepadObserver): (record: GamepadRecord) => void {
  let pool: GamepadRecord[] = [];
  let id: number | null = null;

  return record => {
    if (id !== null) {
      pool.push(record);
      console.log(`Added to pool`, record.type, record.gamepad);
      return;
    }

    id = requestAnimationFrame(() => {
      callback(pool, observer);
      pool = [];
      id = null;
    });
  };
}

export class GamepadObserver {
  private state = new GamepadState();
  private observed: Set<number> = new Set();

  constructor(callback: GamepadObserverCallback) {
    this.callback = debouncePool(callback, this);

    this.state.onconnect = gamepad => {
      if (!this.observed.has(gamepad.index)) return;
      this.callback({ type: "connect", gamepad });
    }

    this.state.ondisconnect = gamepad => {
      if (!this.observed.has(gamepad.index)) return;
      this.callback({ type: "disconnect", gamepad });
    }

    this.state.onstart = () => this.onstart?.();

    this.state.onstop = () => this.onstop?.();

    this.state.oninput = gamepad => {
      if (!this.observed.has(gamepad.index)) return;
      this.callback({ type: "input", gamepad });
    }
  }

  callback: ReturnType<typeof debouncePool>;

  onstart: typeof this.state.onstart = null;
  onstop: typeof this.state.onstop = null;

  observe(index: number): void {
    this.observed.add(index);
  }

  unobserve(index: number): void {
    this.observed.delete(index);
  }

  disconnect(): void {
    this.state.dispose();
  }
}