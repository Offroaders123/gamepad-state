// import { GamepadState } from "./src/index.js";

// const state = new GamepadState();
// console.log(state);

import { StateUpdateEvent, StateThing } from "./src/state-thing.js";

const thing = new StateThing();
thing.onupdate = event => console.log(event);
console.log(thing);

thing.update("hiua");