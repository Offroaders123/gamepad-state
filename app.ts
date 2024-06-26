import { GamepadState } from "./src/index.js";

const state = new GamepadState(1);
console.log(state);

state.addEventListener("connected", function(event) {
  console.log(this, event);
});

state.addEventListener("disconnected", function(event) {
  console.log(this, event);
});

state.addEventListener("input", function(event) {
  console.log(this, event);
});

state.addEventListener("start", function(event) {
  console.log(this, event);
});

state.addEventListener("stop", function(event) {
  console.log(this, event);
});