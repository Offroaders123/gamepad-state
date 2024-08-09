import { GamepadState } from "./state.js";

export type GamepadRecordType = "connect" | "disconnect" | "input";

export interface GamepadRecord {
  readonly type: GamepadRecordType;
  readonly gamepad: Gamepad;
}

export type GamepadObserverCallback = (records: GamepadRecord[], observer: GamepadObserver) => void;

export class GamepadObserver {
  private state = new GamepadState();
  private pool: GamepadRecord[] = [];
  private observed: Set<number> = new Set();

  constructor(private readonly callback: GamepadObserverCallback) {

    this.state.onconnect = gamepad => {
      if (!this.observed.has(gamepad.index)) return;
      this.pool.push({ type: "connect", gamepad });
    };

    this.state.ondisconnect = gamepad => {
      if (!this.observed.has(gamepad.index)) return;
      this.pool.push({ type: "disconnect", gamepad });
    };

    this.state.onstart = () => this.onstart?.();

    this.state.onstop = () => this.onstop?.();

    this.state.onpoll = async frame => {
      this.onpoll?.(frame);
      if (this.pool.length === 0) return;
      await frame;

      this.callback(this.pool, this);
      this.pool = [];
    };

    this.state.oninput = gamepad => {
      if (!this.observed.has(gamepad.index)) return;
      this.pool.push({ type: "input", gamepad });
    };
  }

  onstart: typeof this.state.onstart = null;
  onstop: typeof this.state.onstop = null;
  onpoll: typeof this.state.onpoll = null;

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