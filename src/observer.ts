import { GamepadState } from "./state.js";

export type GamepadRecordType = "connect" | "disconnect" | "input";

export interface GamepadRecord {
  readonly type: GamepadRecordType;
  readonly gamepad: Gamepad;
}

export type GamepadObserverCallback = (records: GamepadRecord[], observer: GamepadObserver) => void;

export class GamepadObserver {
  private state = new GamepadState();
  private connected: Set<number> = new Set();
  private observed: Set<number> = new Set();

  constructor(private readonly callback: GamepadObserverCallback) {
    this.state.onconnect = gamepad => {
      if (!this.observed.has(gamepad.index)) return;
      this.connected.add(gamepad.index);
      this.callback([{ type: "connect", gamepad }], this);
    };

    this.state.ondisconnect = gamepad => {
      if (!this.observed.has(gamepad.index)) return;
      this.connected.delete(gamepad.index);
      this.callback([{ type: "disconnect", gamepad }], this);
    };

    this.state.onstart = () => this.onstart?.();

    this.state.onstop = () => this.onstop?.();

    this.state.onpoll = frame => this.onpoll?.(frame);

    this.state.oninput = gamepads => {
      if (!gamepads.every(gamepad => this.observed.has(gamepad.index) && this.connected.has(gamepad.index))) return;
      this.callback(gamepads.map(gamepad => ({ type: "input", gamepad })), this);
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