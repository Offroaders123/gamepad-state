export interface GamepadStateEventMap {
  "connected": GamepadStateEvent;
  "disconnected": GamepadStateEvent;
}

export class GamepadStateEvent extends Event {
  constructor(type: "connected" | "disconnected", public gamepad: Gamepad) {
    super(type);
  }
}

export class GamepadState extends EventTarget {
  readonly index: number;

  constructor(index: number) {
    super();

    if (typeof index !== "number") {
      throw new TypeError("Expected a number as a gamepad index");
    }

    this.index = index;

    window.addEventListener("gamepadconnected", event => {
      if (event.gamepad.index !== this.index) return;
      this.dispatchEvent(new GamepadStateEvent("connected", event.gamepad));
    });

    window.addEventListener("gamepaddisconnected", event => {
      if (event.gamepad.index !== this.index) return;
      this.dispatchEvent(new GamepadStateEvent("disconnected", event.gamepad));
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