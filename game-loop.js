/* global rxjs */

import { render } from './render.js'
import { initialState, nextState, newGame, keepGoing, swipe, left, right, up, down } from './game-logic.js'

const { fromEvent, merge } = rxjs
const { filter, map, scan, startWith, switchMap } = rxjs.operators

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

const $keepGoingBtn = document.querySelector('.keep-going')
const keepGoingAcions = fromEvent($keepGoingBtn, 'click').pipe(
  map(() => keepGoing)
)

const touchToCoordinates = e => {
  e.preventDefault()
  return {
    x: e.changedTouches[0].clientX,
    y: e.changedTouches[0].clientY
  }
}

const $board = document.querySelector('.board')
const touchStarts = fromEvent($board, 'touchstart').pipe(
  map(touchToCoordinates)
)
const touchEnds = fromEvent($board, 'touchend').pipe(
  map(touchToCoordinates)
)
const vector = p1 => p2 => ({
  x: p2.x - p1.x,
  y: p2.y - p1.y
})

const vectors = touchStarts.pipe(
  switchMap(p1 => touchEnds.pipe(map(vector(p1))))
)

const nonZero = v => v.x !== 0 && v.y !== 0

const swipeFromVector = v =>
  Math.abs(v.x) >= Math.abs(v.y)
    ? v.x > 0
      ? swipe(right)
      : swipe(left)
    : v.y > 0
      ? swipe(down)
      : swipe(up)

const touchActions = vectors.pipe(
  filter(nonZero),
  map(swipeFromVector)
)

const actions = merge(keyboardActions, newGameAcions, keepGoingAcions, touchActions)

const gameStates = actions.pipe(
  scan(nextState, initialState),
  startWith(initialState)
)

gameStates.forEach(render)
