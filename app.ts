import { GamepadState } from "./src/index.js";

const state = new GamepadState(0);
console.log(state);

state.addEventListener("connected", event => {
  console.log(event);
});

state.addEventListener("disconnected", event => {
  console.log(event);
});

// import { StateUpdateEvent, StateThing } from "./src/state-thing.js";

// const thing = new StateThing();
// thing.onupdate = event => console.log(event);
// console.log(thing);

// thing.update("hiua");