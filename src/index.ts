let running: boolean = false;
const gamepadIndices: Set<number> = new Set();
const stateInstances: GamepadState[] = [];

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
    const instances: GamepadState[] = stateInstances.filter(instance => instance.index === gamepad.index);

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

export interface GamepadStateEventMap {
  "connected": GamepadEvent;
  "disconnected": GamepadEvent;
  "input": GamepadEvent;
  "start": Event;
  "stop": Event;
}

export class GamepadState extends EventTarget {
  readonly index: number;

  gamepad: Gamepad | null = null;

  constructor(index: number) {
    super();

    if (typeof index !== "number") {
      throw new TypeError("Expected a number as a gamepad index");
    }

    this.index = index;

    stateInstances.push(this);

    window.addEventListener("gamepadconnected", event => {
      if (event.gamepad.index === this.index) {
        const { gamepad } = event;
        this.dispatchEvent(new GamepadEvent("connected", { gamepad }));
      }

      if (!running) {
        start();
        this.dispatchEvent(new Event("start"));
      }
    });

    window.addEventListener("gamepaddisconnected", event => {
      if (event.gamepad.index === this.index) {
        const { gamepad } = event;
        this.dispatchEvent(new GamepadEvent("disconnected", { gamepad }));
      }

      if (getGamepads().length === 0) {
        stop();
        this.dispatchEvent(new Event("stop"));
      }
    });
  }

  override addEventListener<K extends keyof GamepadStateEventMap>(type: K, listener: (this: GamepadState, event: GamepadStateEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  override addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  override addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {
    super.addEventListener(type, listener, options);
  }

  override dispatchEvent<K extends keyof GamepadStateEventMap>(event: GamepadStateEventMap[K]): boolean {
    return super.dispatchEvent(event);
  }

  override removeEventListener<K extends keyof GamepadStateEventMap>(type: K, listener: (this: GamepadState, event: GamepadStateEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  override removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  override removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void {
    super.removeEventListener(type, listener, options);
  }
}