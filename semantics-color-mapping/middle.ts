// =======================
// comment
// =======================

// keyword / import
import { EventEmitter } from "events";

// namespace
namespace Cyber {
  // class
  export class NeonClass {
    // property
    color: string = "pink";

    // method
    glow(): string {
      return this.color.toUpperCase();
    }
  }

  // interface
  export interface NeonInterface {
    intensity: number;
    mode: string;
  }

  // type
  export type NeonType = {
    enabled: boolean;
  };

  // typeParameter
  export function useNeon<T>(value: T): T {
    return value;
  }

  // enum
  export enum NeonEnum {
    Pink = "pink",
    Cyan = "cyan",
  }
}

// decorator
function NeonDecorator(target: any) {
  return target;
}

// struct (not available in TypeScript, so class is used as a substitute)
class StructLike {
  x: number = 0;
  y: number = 0;
}

// event (not available in TS, so EventEmitter is used as a substitute)
class NeonEvent {
  private listeners: Array<() => void> = [];

  addListener(listener: () => void) {
    this.listeners.push(listener);
  }

  emit() {
    this.listeners.forEach((l) => l());
  }
}

// macro
const MACRO_VALUE = 42;

// label
loopLabel: for (let i = 0; i < 1; i++) {
  break loopLabel;
}

// regexp
const neonReg = /neon-(pink|cyan)/gi;

// number
const neonNumber = 123.45;

// operator
const neonResult = neonNumber + 10;

// string
const neonString = "CYBER PINK";

// variable / parameter / function
function neonFunction(param: string): string {
  const localVar = param + "!";
  return localVar;
}

// readonly / static / abstract / async / deprecated
abstract class AbstractNeon {
  static staticValue = 100;
  readonly readOnlyValue = 50;

  abstract abstractMethod(): void;

  async asyncMethod() {
    return "async";
  }

  /** @deprecated */
  deprecatedMethod() {
    return "deprecated";
  }
}

// =======================
// main function
// =======================
function main() {
  const instance = new Cyber.NeonClass();
  const glow = instance.glow();

  const event = new NeonEvent();
  event.addListener(() => console.log("event fired"));
  event.emit();

  console.log(glow);
  console.log(neonFunction("hello"));
  console.log(Cyber.NeonEnum.Pink);
  console.log(neonString);
  console.log(neonNumber);
  console.log(neonReg.test("neon-pink") ? "match" : "no match");
}

main();