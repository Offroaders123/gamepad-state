export class GamepadState extends EventTarget {
  private indices = new Set<number>();

  constructor() {
    super();

    window.addEventListener("gamepadconnected", event => {
      this.add(event.gamepad);
      this.poll();
    });

    window.addEventListener("gamepaddisconnected", event => {
      this.delete(event.gamepad);
    });
  }

  private add(gamepad: Gamepad): void {
    this.indices.add(gamepad.index);
  }

  private delete(gamepad: Gamepad): void {
    this.indices.delete(gamepad.index);
  }

  private poll(): void {
    console.log("refresh");
    if (this.indices.size === 0) return;

    requestAnimationFrame(() => this.poll());
  }
}