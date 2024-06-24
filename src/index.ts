export interface GamepadStateEventMap {
  "connected": GamepadEvent;
  "disconnected": GamepadEvent;
  "input": GamepadEvent;
  "start": Event;
  "stop": Event;
}

export class GamepadState extends EventTarget {
  private static running: boolean = false;

  private static gamepadIndices: Set<number> = new Set();

  private static instances: GamepadState[] = [];

  static {
    window.addEventListener("gamepadconnected", event => {
      this.gamepadIndices.add(event.gamepad.index);
    });

    window.addEventListener("gamepaddisconnected", event => {
      this.gamepadIndices.delete(event.gamepad.index);
    });
  }

  private static start(): void {
    this.running = true;
    this.poll();
  }

  private static stop(): void {
    this.running = false;
  }

  private static async poll(): Promise<void> {
    if (this.running === false) return;
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

    for (const gamepad of this.getGamepads()) {
      const instances: GamepadState[] = this.instances.filter(instance => instance.index === gamepad.index);

      for (const instance of instances) {
        if (instance.gamepad?.timestamp === gamepad.timestamp) break;
        instance.gamepad = gamepad;
        instance.dispatchEvent(new GamepadEvent("input", { gamepad }));
      }
    }

    await this.poll();
  }

  private static getGamepads(): Gamepad[] {
    return navigator
      .getGamepads()
      .filter(gamepad => gamepad !== null);
  }

  readonly index: number;

  gamepad: Gamepad | null = null;

  constructor(index: number) {
    super();

    if (typeof index !== "number") {
      throw new TypeError("Expected a number as a gamepad index");
    }

    this.index = index;

    GamepadState.instances.push(this);

    window.addEventListener("gamepadconnected", event => {
      if (event.gamepad.index === this.index) {
        const { gamepad } = event;
        this.dispatchEvent(new GamepadEvent("connected", { gamepad }));
      }

      if (!GamepadState.running) {
        GamepadState.start();
        this.dispatchEvent(new Event("start"));
      }
    });

    window.addEventListener("gamepaddisconnected", event => {
      if (event.gamepad.index === this.index) {
        const { gamepad } = event;
        this.dispatchEvent(new GamepadEvent("disconnected", { gamepad }));
      }

      if (GamepadState.getGamepads().length === 0) {
        GamepadState.stop();
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