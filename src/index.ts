export interface GamepadStateEventMap {
  "connected": GamepadEvent;
  "disconnected": GamepadEvent;
  "startpolling": Event;
  "stoppolling": Event;
}

export class GamepadState extends EventTarget {
  private static get gamepads(): Gamepad[] {
    return navigator
      .getGamepads()
      .filter((gamepad): gamepad is Gamepad => gamepad !== null);
  }

  private static async poller(): Promise<void> {
    if (this.polling === false) return;

    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    console.log(this.gamepads);

    await this.poller();
  }

  private static polling: boolean = false;

  readonly index: number;

  constructor(index: number) {
    super();

    if (typeof index !== "number") {
      throw new TypeError("Expected a number as a gamepad index");
    }

    this.index = index;

    window.addEventListener("gamepadconnected", event => {
      if (!GamepadState.polling) {
        GamepadState.polling = true;
        this.dispatchEvent(new Event("startpolling"));
        GamepadState.poller();
      }
      console.log(GamepadState.gamepads);

      if (event.gamepad.index !== this.index) return;
      const { gamepad } = event;
      this.dispatchEvent(new GamepadEvent("connected", { gamepad }));
    });

    window.addEventListener("gamepaddisconnected", event => {
      if (GamepadState.gamepads.length === 0) {
        GamepadState.polling = false;
        this.dispatchEvent(new Event("stoppolling"));
      }
      console.log(GamepadState.gamepads);

      if (event.gamepad.index !== this.index) return;
      const { gamepad } = event;
      this.dispatchEvent(new GamepadEvent("disconnected", { gamepad }));
    });
  }

  override addEventListener<K extends keyof GamepadStateEventMap>(type: K, listener: (this: GamepadState, event: GamepadStateEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  override addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  override addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {
    super.addEventListener(type, listener, options);
  }

  override removeEventListener<K extends keyof GamepadStateEventMap>(type: K, listener: (this: GamepadState, event: GamepadStateEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  override removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  override removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void {
    super.removeEventListener(type, listener, options);
  }
}