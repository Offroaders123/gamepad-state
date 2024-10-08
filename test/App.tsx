import { createSignal, onCleanup } from "solid-js";
import { GamepadObserver } from "../src/index.js";

export default function App() {
  const [getRunning, setRunning] = createSignal<boolean>(false);
  const [getDisplay0, setDisplay0] = createSignal<number>(0);
  const [getDisplay1, setDisplay1] = createSignal<number>(0);
  const [getDisplay2, setDisplay2] = createSignal<number>(0);
  const [getDisplay3, setDisplay3] = createSignal<number>(0);

  const observer = new GamepadObserver((record, _observer) => {
    console.log(record);
    // return;

      switch (record.type) {
        case "input": {
          // console.log(record.type.toUpperCase(), record.gamepad);
          switch (record.gamepad.index) {
            case 0: setDisplay0(previous => previous + 1); break;
            case 1: setDisplay1(previous => previous + 1); break;
            case 2: setDisplay2(previous => previous + 1); break;
            case 3: setDisplay3(previous => previous + 1); break;
          }
          return;
        }
        default: {
          // console.log(record.type.toUpperCase(), record.gamepad.id);
          return;
        }
      }
  });

  observer.onstart = () => {
    console.log("start".toUpperCase());
    setRunning(true);
  };

  observer.onstop = () => {
    console.log("stop".toUpperCase());
    setRunning(false);
  };

  for (const id of [0, 1, 2, 3] as const) {
    observer.observe(id);
  }

  onCleanup(() => {
    observer.disconnect();
  });

  return (
    <>
      <label><input type="checkbox" checked={getRunning()}/>Running</label><br/>
      <label>0<input type="number" value={getDisplay0()}/></label><br/>
      <label>1<input type="number" value={getDisplay1()}/></label><br/>
      <label>2<input type="number" value={getDisplay2()}/></label><br/>
      <label>3<input type="number" value={getDisplay3()}/></label><br/>
    </>
  );
}