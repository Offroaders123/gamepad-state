import { GamepadState } from "./src/index.js";

const running = document.querySelector<HTMLInputElement>("#running")!;

for (const id of [0, 1, 2]) {

const state = new GamepadState(id);
console.log(state);

state.addEventListener("connected", function(event) {
  console.log(this, event.gamepad.id);
});

state.addEventListener("disconnected", function(event) {
  console.log(this, event.gamepad.id);
});

state.addEventListener("input", function(event) {
  console.log(this, event);
});

state.addEventListener("start", function(event) {
  // console.log(this, event);
  running.checked = true;
});

state.addEventListener("stop", function(event) {
  // console.log(this, event);
  running.checked = false;
});

}