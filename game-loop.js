/* global rxjs */

import { render } from './render.js'
import { initialState, nextState, newGame, swipe, left, right, up, down } from './game-logic.js'

const { fromEvent, merge } = rxjs
const { filter, map, scan, startWith } = rxjs.operators

const keyMapping = {
  37: swipe(left),
  38: swipe(up),
  39: swipe(right),
  40: swipe(down)
}

const keyboardActions = fromEvent(document, 'keydown').pipe(
  filter(e => e.keyCode in keyMapping),
  map(e => keyMapping[e.keyCode])
)

const $newGameBtn = document.querySelector('.new-game')
const newGameAcions = fromEvent($newGameBtn, 'click').pipe(
  map(() => newGame)
)

const actions = merge(keyboardActions, newGameAcions)

const gameStates = actions.pipe(
  scan(nextState, initialState),
  startWith(initialState)
)

gameStates.forEach(render)
