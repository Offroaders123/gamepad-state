// https://stackoverflow.com/questions/21566615/is-there-a-way-to-implement-eventtarget-with-plain-js
// https://dev.to/marcogrcr/type-safe-eventtarget-subclasses-in-typescript-1nkf

export interface StateEventMap {
  "update": StateUpdateEvent;
}

export class StateUpdateEvent extends Event {
  constructor(public value: string) {
    super("update");
  }
}

export class StateThing extends EventTarget {
  onupdate: ((event: StateUpdateEvent) => void) | null = null;

  override addEventListener<K extends keyof StateEventMap>(type: K, listener: (this: StateThing, event: StateEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  override addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  override addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {
    super.addEventListener(type, listener, options);
  }

  override removeEventListener<K extends keyof StateEventMap>(type: K, listener: (this: StateThing, event: StateEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  override removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  override removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void {
    super.removeEventListener(type, listener, options);
  }

  constructor() {
    super();

    this.addEventListener("update", event => {
      this.onupdate?.(event);
    });
  }

  update(value: string): void {
    this.dispatchEvent(new StateUpdateEvent(value));
  }
}