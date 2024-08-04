let running: boolean = false;
const gamepadIndices: Set<number> = new Set();
const observers: GamepadObserver[] = [];

window.addEventListener("gamepadconnected", event => {
  gamepadIndices.add(event.gamepad.index);
});

window.addEventListener("gamepaddisconnected", event => {
  gamepadIndices.delete(event.gamepad.index);
});

function start(): void {
  running = true;
  poll();
}

function stop(): void {
  running = false;
}

async function poll(): Promise<void> {
  if (running === false) return;
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

  for (const gamepad of getGamepads()) {
    const instances: GamepadObserver[] = observers.filter(observer => observer.index === gamepad.index);

    for (const instance of instances) {
      if (instance.gamepad?.timestamp === gamepad.timestamp) break;
      instance.gamepad = gamepad;
      instance.dispatchEvent(new GamepadEvent("input", { gamepad }));
    }
  }

  await poll();
}

function getGamepads(): Gamepad[] {
  return navigator
    .getGamepads()
    .filter(gamepad => gamepad !== null);
}

export type GamepadObserverCallback = (entries: GamepadObserverEntry[], observer: GamepadObserver) => void;

export interface GamepadObserverEntry {
  type: GamepadObserverEntryType;
  index: number;
  gamepad: Gamepad;
}

export class GamepadObserver {
  #indices: number[] = [];

  constructor(callback: GamepadObserverCallback) {
    callback([], this);
  }

  disconnect(): void {}

  observe(index: number): void {
    if (typeof index !== "number") {
      throw new TypeError("Expected a number as a gamepad index");
    }

    this.#indices.push(index);
  }

  unobserve(index: number): void {
    if (typeof index !== "number") {
      throw new TypeError("Expected a number as a gamepad index");
    }
  }
}

export type GamepadObserverEntryType = "connected" | "disconnected" | "input" | "start" | "stop";