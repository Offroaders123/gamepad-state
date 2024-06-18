import { GamepadState } from "./src/index.js";

const state = new GamepadState(0);
console.log(state);

state.addEventListener("connected", event => {
  console.log(event);
});

state.addEventListener("disconnected", event => {
  console.log(event);
});

state.addEventListener("startpolling", event => {
  console.log(event);
});

state.addEventListener("stoppolling", event => {
  console.log(event);
});