import { GamepadObserver } from "./src/index.js";

const display0 = document.querySelector<HTMLInputElement>("#display0")!;
const display1 = document.querySelector<HTMLInputElement>("#display1")!;
const display2 = document.querySelector<HTMLInputElement>("#display2")!;
const display3 = document.querySelector<HTMLInputElement>("#display3")!;

const observer = new GamepadObserver((entry, observer) => {
  switch (entry.type) {
    case "input": {
      console.log(observer, entry);
      switch (entry.gamepad.index) {
        case 0: display0.valueAsNumber += 1; break;
        case 1: display1.valueAsNumber += 1; break;
        case 2: display2.valueAsNumber += 1; break;
        case 3: display3.valueAsNumber += 1; break;
      }
      return;
    }
    default: {
      console.log(entry.type.toUpperCase(), entry.gamepad.id, observer);
      return;
    }
  }
});

for (const id of [0, 1, 2, 3] as const) {
  observer.observe(id);
}