import { Union } from "./fable_modules/fable-library-js.4.19.3/Types.js";
import { string_type, char_type, union_type } from "./fable_modules/fable-library-js.4.19.3/Reflection.js";
import { op_Addition, op_Division, equals, op_Multiply, op_Subtraction, toInt64, compare } from "./fable_modules/fable-library-js.4.19.3/BigInt.js";
import { parse } from "./fable_modules/fable-library-js.4.19.3/Long.js";
import { int64ToString } from "./fable_modules/fable-library-js.4.19.3/Util.js";
import { createElement } from "react";
import { ofArray } from "./fable_modules/fable-library-js.4.19.3/List.js";
import { reactApi } from "./fable_modules/Feliz.2.9.0/Interop.fs.js";
import { ProgramModule_mkSimple, ProgramModule_run } from "./fable_modules/Fable.Elmish.4.0.0/program.fs.js";
import { Program_withReactSynchronous } from "./fable_modules/Fable.Elmish.React.4.0.0/react.fs.js";

export class Operacija extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Add", "Sub", "Mul", "Div"];
    }
}

export function Operacija_$reflection() {
    return union_type("Program.Operacija", [], Operacija, () => [[], [], [], []]);
}

export class Poruka extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Broj", "Jednako", "Clear", "Operator"];
    }
}

export function Poruka_$reflection() {
    return union_type("Program.Poruka", [], Poruka, () => [[["Item", char_type]], [], [], [["Item", Operacija_$reflection()]]]);
}

export class State extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["UnosimPrviBroj", "UnioOperator", "UnioDrugiBroj"];
    }
}

export function State_$reflection() {
    return union_type("Program.State", [], State, () => [[["Item", string_type]], [["Item1", string_type], ["Item2", Operacija_$reflection()]], [["Item1", string_type], ["Item2", Operacija_$reflection()], ["Item3", string_type]]]);
}

export function init() {
    return new State(0, [""]);
}

export function calculate(broj1, broj2, op) {
    switch (op.tag) {
        case 1:
            if (broj1 === "NaN") {
                return new State(0, ["NaN"]);
            }
            else if ((broj1.length > 10) && (compare(toInt64(parse(broj1, 511, false, 64)), 0n) > 0)) {
                return new State(0, [broj1]);
            }
            else if ((broj1.length > 11) && (compare(toInt64(parse(broj1, 511, false, 64)), 0n) < 0)) {
                return new State(0, [broj1]);
            }
            else {
                return new State(0, [int64ToString(toInt64(op_Subtraction(toInt64(parse(broj1, 511, false, 64)), toInt64(parse(broj2, 511, false, 64)))))]);
            }
        case 2:
            if (broj1 === "NaN") {
                return new State(0, ["NaN"]);
            }
            else if ((broj1.length > 10) && (compare(toInt64(parse(broj1, 511, false, 64)), 0n) > 0)) {
                return new State(0, [broj1]);
            }
            else if ((broj1.length > 11) && (compare(toInt64(parse(broj1, 511, false, 64)), 0n) < 0)) {
                return new State(0, [broj1]);
            }
            else {
                return new State(0, [int64ToString(toInt64(op_Multiply(toInt64(parse(broj1, 511, false, 64)), toInt64(parse(broj2, 511, false, 64)))))]);
            }
        case 3:
            if (equals(toInt64(parse(broj2, 511, false, 64)), 0n)) {
                return new State(0, ["NaN"]);
            }
            else if (broj1 === "NaN") {
                return new State(0, ["NaN"]);
            }
            else if ((broj1.length > 10) && (compare(toInt64(parse(broj1, 511, false, 64)), 0n) > 0)) {
                return new State(0, [broj1]);
            }
            else if ((broj1.length > 11) && (compare(toInt64(parse(broj1, 511, false, 64)), 0n) < 0)) {
                return new State(0, [broj1]);
            }
            else {
                return new State(0, [int64ToString(toInt64(op_Division(toInt64(parse(broj1, 511, false, 64)), toInt64(parse(broj2, 511, false, 64)))))]);
            }
        default:
            if (broj1 === "NaN") {
                return new State(0, ["NaN"]);
            }
            else if ((broj1.length > 10) && (compare(toInt64(parse(broj1, 511, false, 64)), 0n) > 0)) {
                return new State(0, [broj1]);
            }
            else if ((broj1.length > 11) && (compare(toInt64(parse(broj1, 511, false, 64)), 0n) < 0)) {
                return new State(0, [broj1]);
            }
            else {
                return new State(0, [int64ToString(toInt64(op_Addition(toInt64(parse(broj1, 511, false, 64)), toInt64(parse(broj2, 511, false, 64)))))]);
            }
    }
}

export function update(msg, state) {
    let broj_2;
    switch (msg.tag) {
        case 3: {
            const op_2 = msg.fields[0];
            switch (state.tag) {
                case 1: {
                    const broj_4 = state.fields[0];
                    return new State(1, [broj_4, op_2]);
                }
                case 2:
                    return state;
                default:
                    if ((broj_2 = state.fields[0], broj_2 !== "")) {
                        const broj_3 = state.fields[0];
                        return new State(1, [broj_3, op_2]);
                    }
                    else {
                        return state;
                    }
            }
        }
        case 1:
            switch (state.tag) {
                case 1:
                    return state;
                case 2: {
                    const op_3 = state.fields[1];
                    const broj2_1 = state.fields[2];
                    const broj1_1 = state.fields[0];
                    return calculate(broj1_1, broj2_1, op_3);
                }
                default:
                    return state;
            }
        case 2:
            return init();
        default: {
            const c = msg.fields[0];
            switch (state.tag) {
                case 1: {
                    const op = state.fields[1];
                    const broj_1 = state.fields[0];
                    return new State(2, [broj_1, op, c]);
                }
                case 2: {
                    const op_1 = state.fields[1];
                    const broj2 = state.fields[2];
                    const broj1 = state.fields[0];
                    if (broj2.length === 10) {
                        return state;
                    }
                    else {
                        return new State(2, [broj1, op_1, broj2 + c]);
                    }
                }
                default: {
                    const broj = state.fields[0];
                    if ((broj.length === 10) ? true : (broj === "NaN")) {
                        return state;
                    }
                    else {
                        return new State(0, [broj + c]);
                    }
                }
            }
        }
    }
}

export function render(state, dispatch) {
    let children, children_2, children_4, children_6;
    let display;
    switch (state.tag) {
        case 1: {
            const op = state.fields[1];
            const broj_1 = state.fields[0];
            const broj_disp = ((broj_1.length > 10) && (compare(toInt64(parse(broj_1, 511, false, 64)), 0n) > 0)) ? "+inf" : (((broj_1.length > 11) && (compare(toInt64(parse(broj_1, 511, false, 64)), 0n) < 0)) ? "-inf" : broj_1);
            display = ((op.tag === 1) ? (broj_disp + "-") : ((op.tag === 2) ? (broj_disp + "*") : ((op.tag === 3) ? (broj_disp + "/") : (broj_disp + "+"))));
            break;
        }
        case 2: {
            const op_1 = state.fields[1];
            const broj2 = state.fields[2];
            const broj_2 = state.fields[0];
            const broj_disp_1 = ((broj_2.length > 10) && (compare(toInt64(parse(broj_2, 511, false, 64)), 0n) > 0)) ? "+inf" : (((broj_2.length > 11) && (compare(toInt64(parse(broj_2, 511, false, 64)), 0n) < 0)) ? "-inf" : broj_2);
            display = ((op_1.tag === 1) ? ((broj_disp_1 + "-") + broj2) : ((op_1.tag === 2) ? ((broj_disp_1 + "*") + broj2) : ((op_1.tag === 3) ? ((broj_disp_1 + "/") + broj2) : ((broj_disp_1 + "+") + broj2))));
            break;
        }
        default: {
            const broj = state.fields[0];
            display = (((broj.length > 10) && (compare(toInt64(parse(broj, 511, false, 64)), 0n) > 0)) ? "+inf" : (((broj.length > 11) && (compare(toInt64(parse(broj, 511, false, 64)), 0n) < 0)) ? "-inf" : broj));
        }
    }
    const children_8 = ofArray([createElement("div", {
        children: display,
        className: "btn-disp",
    }), (children = ofArray([createElement("button", {
        className: "broj-btn",
        children: "1",
        onClick: (_arg) => {
            dispatch(new Poruka(0, ["1"]));
        },
    }), createElement("button", {
        className: "broj-btn",
        children: "2",
        onClick: (_arg_1) => {
            dispatch(new Poruka(0, ["2"]));
        },
    }), createElement("button", {
        className: "broj-btn",
        children: "3",
        onClick: (_arg_2) => {
            dispatch(new Poruka(0, ["3"]));
        },
    }), createElement("button", {
        className: "op-btn",
        children: "+",
        onClick: (_arg_3) => {
            dispatch(new Poruka(3, [new Operacija(0, [])]));
        },
    })]), createElement("div", {
        children: reactApi.Children.toArray(Array.from(children)),
    })), (children_2 = ofArray([createElement("button", {
        className: "broj-btn",
        children: "4",
        onClick: (_arg_4) => {
            dispatch(new Poruka(0, ["4"]));
        },
    }), createElement("button", {
        className: "broj-btn",
        children: "5",
        onClick: (_arg_5) => {
            dispatch(new Poruka(0, ["5"]));
        },
    }), createElement("button", {
        className: "broj-btn",
        children: "6",
        onClick: (_arg_6) => {
            dispatch(new Poruka(0, ["6"]));
        },
    }), createElement("button", {
        className: "op-btn",
        children: "-",
        onClick: (_arg_7) => {
            dispatch(new Poruka(3, [new Operacija(1, [])]));
        },
    })]), createElement("div", {
        children: reactApi.Children.toArray(Array.from(children_2)),
    })), (children_4 = ofArray([createElement("button", {
        className: "broj-btn",
        children: "7",
        onClick: (_arg_8) => {
            dispatch(new Poruka(0, ["7"]));
        },
    }), createElement("button", {
        className: "broj-btn",
        children: "8",
        onClick: (_arg_9) => {
            dispatch(new Poruka(0, ["8"]));
        },
    }), createElement("button", {
        className: "broj-btn",
        children: "9",
        onClick: (_arg_10) => {
            dispatch(new Poruka(0, ["9"]));
        },
    }), createElement("button", {
        className: "op-btn",
        children: "*",
        onClick: (_arg_11) => {
            dispatch(new Poruka(3, [new Operacija(2, [])]));
        },
    })]), createElement("div", {
        children: reactApi.Children.toArray(Array.from(children_4)),
    })), (children_6 = ofArray([createElement("button", {
        className: "clr-btn",
        children: "CE",
        onClick: (_arg_12) => {
            dispatch(new Poruka(2, []));
        },
    }), createElement("button", {
        className: "broj-btn",
        children: "0",
        onClick: (_arg_13) => {
            dispatch(new Poruka(0, ["0"]));
        },
    }), createElement("button", {
        className: "eq-btn",
        children: "=",
        onClick: (_arg_14) => {
            dispatch(new Poruka(1, []));
        },
    }), createElement("button", {
        className: "op-btn",
        children: "/",
        onClick: (_arg_15) => {
            dispatch(new Poruka(3, [new Operacija(3, [])]));
        },
    })]), createElement("div", {
        children: reactApi.Children.toArray(Array.from(children_6)),
    }))]);
    return createElement("div", {
        children: reactApi.Children.toArray(Array.from(children_8)),
    });
}

ProgramModule_run(Program_withReactSynchronous("app", ProgramModule_mkSimple(init, update, render)));

