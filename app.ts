import { GamepadState } from "./src/index.js";

const state = new GamepadState(0);
console.log(state);

state.addEventListener("connected", function(event) {
  console.log(this, event);
});

state.addEventListener("disconnected", function(event) {
  console.log(this, event);
});

state.addEventListener("startpolling", function(event) {
  console.log(this, event);
});

state.addEventListener("stoppolling", function(event) {
  console.log(this, event);
});