// comment
import { EventEmitter } from "events"; // keyword / import

namespace N { // namespace
  export class C { // class
    p: string = "pink"; // property / string
    m(): string { return this.p.toUpperCase(); } // method / operator
  }

  export interface I { x: number; y: number; } // interface / number
  export type T = { ok: boolean }; // type
  export function U<K>(v: K): K { return v; } // typeParameter / function / parameter
  export enum E { A = "a", B = "b" } // enum / enumMember
}

function D(target: any) {} // decorator

class S { x = 0; y = 0; } // struct-like

class Ev { // event-like
  private ls: Array<() => void> = [];
  add(f: () => void) { this.ls.push(f); }
  fire() { this.ls.forEach(f => f()); }
}

const MACRO = 42; // macro

loop: for (let i = 0; i < 1; i++) break loop; // label / variable / operator

const reg = /neon-(pink|cyan)/; // regexp
const num = 123; // number
const str = "CYBER PINK"; // string

function fn(a: string) { const b = a + "!"; return b; } // function / parameter / variable

abstract class A { // abstract
  static s = 1; // static
  readonly r = 2; // readonly
  abstract abs(): void;
  async run() { return "async"; } // async
  /** @deprecated */ old() { return "x"; } // deprecated
}

function main() {
  const c = new N.C();
  const g = c.m();
  const e = new Ev();
  e.add(() => console.log("fire"));
  e.fire();

  console.log(g, fn("hi"), N.E.A, str, num, reg.test("neon-pink"));
}

main();