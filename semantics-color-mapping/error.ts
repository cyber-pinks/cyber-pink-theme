
import { EventEmitter } from "events";

namespace N { 
  export class C { 
    p = "pink"; 
    m() { return this.p.toUpperCase(); } 
  } 
  export interface I { a: number; b: number; } 
  export type T = { ok: boolean }; 
  export function U<K>(v: K) { return v; } 
  export enum E { A = "a", B = "b" } 
}

function D(t: any) {} 
class S { x = 0; y = 0; }
class Ev { 
  private ls: (() => void)[] = []; 
  add(f: () => void) { this.ls.push(f); } 
  fire() { this.ls.forEach(f => f()); } 
}

const MACRO = 42; 
loop: for (let i = 0; i < 1; i++) break loop;
const reg = /neon-(pink|cyan)/, num = 123, str = "CYBER PINK";
function fn(a: string) { const b = a + "!"; return b; }

abstract class A { 
  static s = 1; 
  readonly r = 2; 
  abstract abs(): void; 
  async run() { return "async"; } 
  /** @deprecated */ 
  old() { return "x"; } 
}


// =================================================================
// 🎨 test
// =================================================================


const errorColorCheck = {
  BREAK messege = !!! 🤯 
  const duplicateName = 1;
  const duplicateName = 2; 
};


function warningColorCheck() {
  return "";
  

  const unreachableVariable = ""; 
  console.log(unreachableVariable);
}


class ErrorClass extends A {
}