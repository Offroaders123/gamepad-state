import { GamepadState } from "./src/index.js";

const running = document.querySelector<HTMLInputElement>("#running")!;
const display0 = document.querySelector<HTMLInputElement>("#display0")!;
const display1 = document.querySelector<HTMLInputElement>("#display1")!;
const display2 = document.querySelector<HTMLInputElement>("#display2")!;
const display3 = document.querySelector<HTMLInputElement>("#display3")!;

for (const id of [0, 1, 2, 3] as const) {

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
  switch (id) {
    case 0: display0.valueAsNumber += 1; break;
    case 1: display1.valueAsNumber += 1; break;
    case 2: display2.valueAsNumber += 1; break;
    case 3: display3.valueAsNumber += 1; break;
  }
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