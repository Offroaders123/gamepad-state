import { GamepadObserver } from "../src/index.js";

const running = document.querySelector<HTMLInputElement>("#running")!;
const display0 = document.querySelector<HTMLInputElement>("#display0")!;
const display1 = document.querySelector<HTMLInputElement>("#display1")!;
const display2 = document.querySelector<HTMLInputElement>("#display2")!;
const display3 = document.querySelector<HTMLInputElement>("#display3")!;

const observer = new GamepadObserver((records, observer) => {
  for (const record of records) {
    switch (record.type) {
      case "input": {
        console.log(record.type.toUpperCase(), observer, record.gamepad);
        switch (record.gamepad.index) {
          case 0: display0.valueAsNumber += 1; break;
          case 1: display1.valueAsNumber += 1; break;
          case 2: display2.valueAsNumber += 1; break;
          case 3: display3.valueAsNumber += 1; break;
        }
        return;
      }
      default: {
        console.log(record.type.toUpperCase(), record.gamepad.id, observer);
        return;
      }
    }
  }
});

observer.onstart = () => {
  console.log("start".toUpperCase(), observer);
  running.checked = true;
};

observer.onstop = () => {
  console.log("stop".toUpperCase(), observer);
  running.checked = false;
};

for (const id of [0, 1, 2, 3] as const) {
  observer.observe(id);
}