import { Union, Record } from "./fable_modules/fable-library-js.4.19.3/Types.js";
import { union_type, list_type, record_type, bool_type, string_type, int32_type } from "./fable_modules/fable-library-js.4.19.3/Reflection.js";
import { skip, take, singleton as singleton_1, exists, forAll, head, find, length, ofArray, append, sortBy, map, filter } from "./fable_modules/fable-library-js.4.19.3/List.js";
import { nonSeeded } from "./fable_modules/fable-library-js.4.19.3/Random.js";
import { createObj, comparePrimitives } from "./fable_modules/fable-library-js.4.19.3/Util.js";
import { Cmd_none } from "./fable_modules/Fable.Elmish.4.0.0/cmd.fs.js";
import { singleton } from "./fable_modules/fable-library-js.4.19.3/AsyncBuilder.js";
import { sleep } from "./fable_modules/fable-library-js.4.19.3/Async.js";
import { printf, toConsole } from "./fable_modules/fable-library-js.4.19.3/String.js";
import { Cmd_OfAsync_start, Cmd_OfAsyncWith_perform } from "./fable_modules/Fable.Elmish.4.0.0/cmd.fs.js";
import { createElement } from "react";
import { empty, map as map_1, append as append_1, singleton as singleton_2, delay, toList } from "./fable_modules/fable-library-js.4.19.3/Seq.js";
import { reactApi } from "./fable_modules/Feliz.2.9.0/Interop.fs.js";
import { rangeDouble } from "./fable_modules/fable-library-js.4.19.3/Range.js";
import { ProgramModule_mkProgram, ProgramModule_run } from "./fable_modules/Fable.Elmish.4.0.0/program.fs.js";
import { Program_withReactSynchronous } from "./fable_modules/Fable.Elmish.React.4.0.0/react.fs.js";

export class Card extends Record {
    constructor(id, image, selected, shake, guessed, animating, istext, popup, gameOver, shuffle) {
        super();
        this.id = (id | 0);
        this.image = image;
        this.selected = selected;
        this.shake = shake;
        this.guessed = guessed;
        this.animating = animating;
        this.istext = istext;
        this.popup = popup;
        this.gameOver = gameOver;
        this.shuffle = shuffle;
    }
}

export function Card_$reflection() {
    return record_type("Program.Card", [], Card, () => [["id", int32_type], ["image", string_type], ["selected", bool_type], ["shake", bool_type], ["guessed", bool_type], ["animating", bool_type], ["istext", bool_type], ["popup", bool_type], ["gameOver", bool_type], ["shuffle", bool_type]]);
}

export function Card_makeCard(image, id) {
    return new Card(id, image, false, false, false, false, false, false, false, false);
}

export class Game extends Record {
    constructor(cardsToGuess) {
        super();
        this.cardsToGuess = cardsToGuess;
    }
}

export function Game_$reflection() {
    return record_type("Program.Game", [], Game, () => [["cardsToGuess", list_type(Card_$reflection())]]);
}

export class State extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Initial", "InitialGuess", "GameOver"];
    }
}

export function State_$reflection() {
    return union_type("Program.State", [], State, () => [[["Item", Game_$reflection()]], [["Item1", Game_$reflection()], ["Item2", int32_type]], [["Item", Game_$reflection()]]]);
}

export class Message extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["TileClick", "DeselectAll", "ShuffleCards", "Transformed", "StopShake", "Shake", "ShowResult", "PlayAgain", "StopAnimating"];
    }
}

export function Message_$reflection() {
    return union_type("Program.Message", [], Message, () => [[["Item", Card_$reflection()]], [], [], [], [], [], [], [], []]);
}

export function shuffleCards(cards) {
    const alreadyGuessed = filter((c) => c.guessed, cards);
    const notGuessed = map((x) => (new Card(x.id, x.image, x.selected, x.shake, x.guessed, x.animating, x.istext, x.popup, x.gameOver, true)), filter((c_1) => (c_1.guessed === false), cards));
    const shuffledcards = sortBy((_arg) => nonSeeded().Next0(), notGuessed, {
        Compare: comparePrimitives,
    });
    return append(alreadyGuessed, shuffledcards);
}

export function init() {
    const cards = ofArray([Card_makeCard("dog.png", 1), Card_makeCard("bird.png", 1), Card_makeCard("cat.png", 1), Card_makeCard("butterfly.png", 1), Card_makeCard("apple.png", 2), Card_makeCard("ananas.png", 2), Card_makeCard("strawberry.png", 2), Card_makeCard("orange.png", 2), Card_makeCard("sun.png", 3), Card_makeCard("rainbow.png", 3), Card_makeCard("cloud.png", 3), Card_makeCard("storm.png", 3), Card_makeCard("bike.png", 4), Card_makeCard("airplane.png", 4), Card_makeCard("car.png", 4), Card_makeCard("boat.png", 4)]);
    const shuffledcards = shuffleCards(cards);
    return [new State(0, [new Game(map((x) => (new Card(x.id, x.image, x.selected, x.shake, x.guessed, x.animating, x.istext, x.popup, x.gameOver, false)), shuffledcards))]), Cmd_none()];
}

export function selectCard(card, cards) {
    return map((x) => {
        if (x.image === card.image) {
            return new Card(x.id, x.image, true, x.shake, x.guessed, x.animating, x.istext, x.popup, x.gameOver, x.shuffle);
        }
        else {
            return x;
        }
    }, cards);
}

export function countSelected(cards) {
    return length(filter((x) => x.selected, cards));
}

export function shakeCards(cards) {
    return map((x) => {
        if (x.selected) {
            return new Card(x.id, x.image, x.selected, true, x.guessed, x.animating, x.istext, x.popup, x.gameOver, x.shuffle);
        }
        else {
            return x;
        }
    }, cards);
}

export function deselectCards(cards) {
    return map((x) => (new Card(x.id, x.image, false, x.shake, x.guessed, x.animating, x.istext, x.popup, x.gameOver, x.shuffle)), cards);
}

export function markGuessedCards(cards) {
    const selectedId = find((c) => c.selected, cards).id | 0;
    return map((c_2) => {
        if (c_2.id === selectedId) {
            return new Card(c_2.id, c_2.image, c_2.selected, c_2.shake, true, c_2.animating, c_2.istext, c_2.popup, c_2.gameOver, c_2.shuffle);
        }
        else {
            return c_2;
        }
    }, cards);
}

export function checkMatchingCards(cards) {
    const selectedCards = filter((c) => c.selected, cards);
    const firstId = head(selectedCards).id | 0;
    return forAll((c_1) => (c_1.id === firstId), selectedCards);
}

export function reorderCards(selectedid, cards) {
    const stayFirst = filter((c) => {
        if (c.guessed === true) {
            return c.id !== selectedid;
        }
        else {
            return false;
        }
    }, cards);
    const matchedCards = filter((c_1) => (c_1.id === selectedid), cards);
    const otherCards = filter((c_2) => {
        if (c_2.id !== selectedid) {
            return c_2.guessed === false;
        }
        else {
            return false;
        }
    }, cards);
    return append(stayFirst, append(matchedCards, otherCards));
}

export function transformCards(cards) {
    return map((x) => (x.guessed ? (new Card(x.id, x.image, x.selected, x.shake, x.guessed, x.animating, true, x.popup, x.gameOver, x.shuffle)) : x), cards);
}

export function stopShaking(cards) {
    return map((x) => (x.shake ? (new Card(x.id, x.image, x.selected, false, x.guessed, x.animating, x.istext, false, x.gameOver, x.shuffle)) : (new Card(x.id, x.image, x.selected, x.shake, x.guessed, x.animating, x.istext, false, x.gameOver, x.shuffle))), cards);
}

export function setAnimating(cards) {
    return map((x) => (new Card(x.id, x.image, x.selected, x.shake, x.guessed, true, x.istext, x.popup, x.gameOver, x.shuffle)), cards);
}

export function showCards(cards) {
    const Id = find((x) => (x.guessed === false), cards).id | 0;
    const markGuessed = map((x_1) => ((x_1.id === Id) ? (new Card(x_1.id, x_1.image, x_1.selected, x_1.shake, true, x_1.animating, x_1.istext, x_1.popup, x_1.gameOver, x_1.shuffle)) : x_1), cards);
    return reorderCards(Id, markGuessed);
}

export function oneAwayorNot(cards) {
    const selectCard_1 = filter((x) => x.selected, cards);
    const selectId = map((x_1) => x_1.id, selectCard_1);
    const check = exists((x_2) => (length(filter((y) => (y === x_2.id), selectId)) === 3), selectCard_1);
    if (check) {
        return map((x_3) => (new Card(x_3.id, x_3.image, x_3.selected, x_3.shake, x_3.guessed, x_3.animating, x_3.istext, true, x_3.gameOver, x_3.shuffle)), cards);
    }
    else {
        return cards;
    }
}

export function stopAnimating(cards) {
    return map((x) => (new Card(x.id, x.image, x.selected, x.shake, x.guessed, false, x.istext, x.popup, x.gameOver, false)), cards);
}

export function update(msg, state) {
    switch (state.tag) {
        case 1: {
            const gm_1 = state.fields[0];
            const cnt = state.fields[1] | 0;
            switch (msg.tag) {
                case 5: {
                    const Cards = shakeCards(gm_1.cardsToGuess);
                    const newCards_4 = (cnt !== 3) ? deselectCards(oneAwayorNot(Cards)) : deselectCards(Cards);
                    const waitsec_3 = () => singleton.Delay(() => singleton.Bind(sleep(1500), () => {
                        toConsole(printf("Delayed unshaking"));
                        return singleton.Zero();
                    }));
                    const cmdfoo_1 = () => (new Message(4, []));
                    if ((cnt + 1) !== 4) {
                        return [new State(1, [new Game(newCards_4), cnt + 1]), Cmd_OfAsyncWith_perform((x_4) => {
                            Cmd_OfAsync_start(x_4);
                        }, waitsec_3, undefined, cmdfoo_1)];
                    }
                    else {
                        const cmdfoo_2 = () => (new Message(6, []));
                        return [new State(2, [new Game(setAnimating(newCards_4))]), Cmd_OfAsyncWith_perform((x_5) => {
                            Cmd_OfAsync_start(x_5);
                        }, waitsec_3, undefined, cmdfoo_2)];
                    }
                }
                case 3: {
                    const newCards_5 = deselectCards(transformCards(gm_1.cardsToGuess));
                    const waitsec_4 = () => singleton.Delay(() => singleton.Bind(sleep(1000), () => {
                        toConsole(printf("Delayed switching cards!"));
                        return singleton.Zero();
                    }));
                    return [new State(1, [new Game(newCards_5), cnt]), Cmd_OfAsyncWith_perform((x_6) => {
                        Cmd_OfAsync_start(x_6);
                    }, waitsec_4, undefined, () => (new Message(8, [])))];
                }
                case 1: {
                    const newCards_6 = deselectCards(gm_1.cardsToGuess);
                    return [new State(1, [new Game(newCards_6), cnt]), Cmd_none()];
                }
                case 4: {
                    const newCards_7 = stopShaking(gm_1.cardsToGuess);
                    return [new State(1, [new Game(newCards_7), cnt]), singleton_1((dispatch) => {
                        dispatch(new Message(8, []));
                    })];
                }
                case 8: {
                    const newCards_8 = stopAnimating(gm_1.cardsToGuess);
                    return [new State(1, [new Game(newCards_8), cnt]), Cmd_none()];
                }
                case 2: {
                    const newCards_9 = setAnimating(shuffleCards(gm_1.cardsToGuess));
                    const waitsec_5 = () => singleton.Delay(() => singleton.Bind(sleep(1000), () => {
                        toConsole(printf("Delayed shuffling"));
                        return singleton.Zero();
                    }));
                    return [new State(1, [new Game(newCards_9), cnt]), Cmd_OfAsyncWith_perform((x_7) => {
                        Cmd_OfAsync_start(x_7);
                    }, waitsec_5, undefined, () => (new Message(8, [])))];
                }
                case 0: {
                    const card_1 = msg.fields[0];
                    const newCards_10 = selectCard(card_1, gm_1.cardsToGuess);
                    if (countSelected(newCards_10) < 4) {
                        return [new State(1, [new Game(newCards_10), cnt]), Cmd_none()];
                    }
                    else {
                        const isMatch_1 = checkMatchingCards(newCards_10);
                        if (isMatch_1) {
                            const selectedId_1 = find((x_8) => x_8.selected, newCards_10).id | 0;
                            const updatedCards_1 = setAnimating(reorderCards(selectedId_1, markGuessedCards(newCards_10)));
                            const waitsec_6 = () => singleton.Delay(() => singleton.Bind(sleep(1000), () => {
                                toConsole(printf("Delayed switching cards!"));
                                return singleton.Zero();
                            }));
                            const cmdfoo_3 = () => (new Message(3, []));
                            return [new State(1, [new Game(updatedCards_1), cnt]), Cmd_OfAsyncWith_perform((x_9) => {
                                Cmd_OfAsync_start(x_9);
                            }, waitsec_6, undefined, cmdfoo_3)];
                        }
                        else {
                            const waitsec_7 = () => singleton.Delay(() => singleton.Bind(sleep(1500), () => {
                                toConsole(printf("Delayed shaking"));
                                return singleton.Zero();
                            }));
                            const cmdfoo_4 = () => (new Message(5, []));
                            return [new State(1, [new Game(setAnimating(newCards_10)), cnt]), Cmd_OfAsyncWith_perform((x_10) => {
                                Cmd_OfAsync_start(x_10);
                            }, waitsec_7, undefined, cmdfoo_4)];
                        }
                    }
                }
                case 7:
                    return init();
                default:
                    return [state, Cmd_none()];
            }
        }
        case 2: {
            const gm_2 = state.fields[0];
            switch (msg.tag) {
                case 6: {
                    const newCards_11 = showCards(stopShaking(gm_2.cardsToGuess));
                    const waitsec_8 = () => singleton.Delay(() => singleton.Bind(sleep(1000), () => {
                        toConsole(printf("Delayed text!"));
                        return singleton.Zero();
                    }));
                    const cmdfoo_5 = () => (new Message(3, []));
                    return [new State(2, [new Game(newCards_11)]), Cmd_OfAsyncWith_perform((x_11) => {
                        Cmd_OfAsync_start(x_11);
                    }, waitsec_8, undefined, cmdfoo_5)];
                }
                case 3: {
                    const newCards_12 = deselectCards(setAnimating(transformCards(gm_2.cardsToGuess)));
                    const waitsec_9 = () => singleton.Delay(() => singleton.Bind(sleep(1000), () => {
                        toConsole(printf("Delayed show!"));
                        return singleton.Zero();
                    }));
                    if (forAll((x_12) => x_12.istext, newCards_12)) {
                        return [new State(2, [new Game(map((x_13) => (new Card(x_13.id, x_13.image, x_13.selected, x_13.shake, x_13.guessed, x_13.animating, x_13.istext, x_13.popup, true, x_13.shuffle)), newCards_12))]), Cmd_OfAsyncWith_perform((x_14) => {
                            Cmd_OfAsync_start(x_14);
                        }, waitsec_9, undefined, () => (new Message(8, [])))];
                    }
                    else {
                        return [new State(2, [new Game(newCards_12)]), Cmd_OfAsyncWith_perform((x_15) => {
                            Cmd_OfAsync_start(x_15);
                        }, waitsec_9, undefined, () => (new Message(6, [])))];
                    }
                }
                case 8: {
                    const newCards_13 = stopAnimating(gm_2.cardsToGuess);
                    return [new State(2, [new Game(newCards_13)]), Cmd_none()];
                }
                case 7:
                    return init();
                default:
                    return [state, Cmd_none()];
            }
        }
        default: {
            const gm = state.fields[0];
            switch (msg.tag) {
                case 0: {
                    const card = msg.fields[0];
                    const newCards = selectCard(card, gm.cardsToGuess);
                    if (countSelected(newCards) < 4) {
                        return [new State(0, [new Game(newCards)]), Cmd_none()];
                    }
                    else {
                        const isMatch = checkMatchingCards(newCards);
                        if (isMatch) {
                            const selectedId = find((x) => x.selected, newCards).id | 0;
                            const updatedCards = setAnimating(reorderCards(selectedId, markGuessedCards(newCards)));
                            const waitsec = () => singleton.Delay(() => singleton.Bind(sleep(1000), () => {
                                toConsole(printf("Delayed switching cards!"));
                                return singleton.Zero();
                            }));
                            const cmdfoo = () => (new Message(3, []));
                            return [new State(1, [new Game(updatedCards), 0]), Cmd_OfAsyncWith_perform((x_1) => {
                                Cmd_OfAsync_start(x_1);
                            }, waitsec, undefined, cmdfoo)];
                        }
                        else {
                            const waitsec_1 = () => singleton.Delay(() => singleton.Bind(sleep(1500), () => {
                                toConsole(printf("Delayed shaking"));
                                return singleton.Zero();
                            }));
                            return [new State(1, [new Game(setAnimating(newCards)), 0]), Cmd_OfAsyncWith_perform((x_2) => {
                                Cmd_OfAsync_start(x_2);
                            }, waitsec_1, undefined, () => (new Message(5, [])))];
                        }
                    }
                }
                case 1: {
                    const newCards_1 = deselectCards(gm.cardsToGuess);
                    return [new State(0, [new Game(newCards_1)]), Cmd_none()];
                }
                case 2: {
                    const newCards_2 = setAnimating(shuffleCards(gm.cardsToGuess));
                    const waitsec_2 = () => singleton.Delay(() => singleton.Bind(sleep(1000), () => {
                        toConsole(printf("Delayed shuffling"));
                        return singleton.Zero();
                    }));
                    return [new State(0, [new Game(newCards_2)]), Cmd_OfAsyncWith_perform((x_3) => {
                        Cmd_OfAsync_start(x_3);
                    }, waitsec_2, undefined, () => (new Message(8, [])))];
                }
                case 8: {
                    const newCards_3 = stopAnimating(gm.cardsToGuess);
                    return [new State(0, [new Game(newCards_3)]), Cmd_none()];
                }
                case 7:
                    return init();
                default:
                    return [state, Cmd_none()];
            }
        }
    }
}

export function render(state, dispatch) {
    let elems_4;
    let patternInput;
    switch (state.tag) {
        case 1: {
            const count = state.fields[1] | 0;
            const cards_1 = state.fields[0];
            patternInput = [cards_1.cardsToGuess, count];
            break;
        }
        case 2: {
            const cards_2 = state.fields[0];
            patternInput = [cards_2.cardsToGuess, 4];
            break;
        }
        default: {
            const cards = state.fields[0];
            patternInput = [cards.cardsToGuess, 0];
        }
    }
    const game = patternInput[0];
    const cnt = patternInput[1] | 0;
    const renderRow = (cards_3) => {
        let elems_1;
        return createElement("div", createObj(ofArray([["className", "row"], (elems_1 = toList(delay(() => (forAll((x) => x.istext, cards_3) ? singleton_2(createElement("div", createObj(toList(delay(() => append_1(singleton_2(["className", "text-container"]), delay(() => {
            let elems;
            const id = head(cards_3).id | 0;
            return singleton_2((elems = [createElement("div", createObj(toList(delay(() => append_1(singleton_2(["className", "text"]), delay(() => {
                const text = (id === 1) ? "Animals:\n dog, cat, bird, butterfly" : ((id === 2) ? "Fruits: \n pineapple, apple, strawberry, orange" : ((id === 3) ? "Sky:\n clouds, storm, sun, rainbow" : "Transportation:\n motorcycle, car, boat, airplane"));
                return append_1(singleton_2(["style", {
                    whiteSpace: "pre-wrap",
                }]), delay(() => singleton_2(["children", text])));
            }))))))], ["children", reactApi.Children.toArray(Array.from(elems))]));
        }))))))) : map_1((card) => createElement("img", {
            src: `/public/${card.image}`,
            alt: "Card",
            className: card.selected ? "children selected" : (card.shake ? "card shake" : (card.shuffle ? "card shuffle" : "children")),
            onClick: (_arg) => {
                if (card.animating === false) {
                    dispatch(new Message(0, [card]));
                }
            },
        }), cards_3)))), ["children", reactApi.Children.toArray(Array.from(elems_1))])])));
    };
    const row1 = take(4, game);
    const row2 = take(4, skip(4, game));
    const row3 = take(4, skip(8, game));
    const row4 = take(4, skip(12, game));
    return createElement("div", createObj(ofArray([["className", "main"], (elems_4 = toList(delay(() => append_1(singleton_2(renderRow(row1)), delay(() => append_1(singleton_2(renderRow(row2)), delay(() => append_1(singleton_2(renderRow(row3)), delay(() => append_1(singleton_2(renderRow(row4)), delay(() => {
        let elems_2;
        return append_1(singleton_2(createElement("div", createObj(ofArray([["className", "btn-container"], (elems_2 = [createElement("button", {
            children: "Shuffle",
            className: "btn",
            onClick: (_arg_1) => {
                if (forAll((x_1) => (x_1.animating === false), game)) {
                    dispatch(new Message(2, []));
                }
            },
        }), createElement("button", {
            className: "btn",
            children: "Deselect All",
            onClick: (_arg_2) => {
                if (forAll((x_2) => (x_2.animating === false), game)) {
                    dispatch(new Message(1, []));
                }
            },
        }), createElement("button", {
            className: "btn",
            children: "Play again",
            onClick: (_arg_3) => {
                if (forAll((x_3) => (x_3.animating === false), game)) {
                    dispatch(new Message(7, []));
                }
            },
        })], ["children", reactApi.Children.toArray(Array.from(elems_2))])])))), delay(() => append_1(singleton_2(createElement("div", {
            children: "Remaining attempts: ",
            className: "trys",
        })), delay(() => {
            let elems_3;
            return append_1(singleton_2(createElement("div", createObj(singleton_1((elems_3 = toList(delay(() => map_1((i) => createElement("div", {
                className: (i > cnt) ? "dots notused" : "dots used",
            }), rangeDouble(1, 1, 4)))), ["children", reactApi.Children.toArray(Array.from(elems_3))]))))), delay(() => append_1((cnt === 4) ? singleton_2(createElement("div", {
                children: " Game Over :( ",
                className: "gameover-cnt",
            })) : empty(), delay(() => append_1(forAll((x_4) => ((x_4.guessed && !x_4.animating) && !x_4.gameOver), game) ? singleton_2(createElement("div", {
                children: "Well done! :) ",
                className: "done-cnt",
            })) : empty(), delay(() => append_1(forAll((x_5) => x_5.popup, game) ? singleton_2(createElement("div", {
                className: "popup",
                children: "One away!",
            })) : empty(), delay(() => singleton_2(createElement("div", {
                children: "Group photos that share a common thread.",
                className: "msg",
            }))))))))));
        }))));
    })))))))))), ["children", reactApi.Children.toArray(Array.from(elems_4))])])));
}

ProgramModule_run(Program_withReactSynchronous("app", ProgramModule_mkProgram(init, update, render)));

