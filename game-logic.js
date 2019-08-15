const reverse = array => array.slice().reverse()
const map = f => array => array.map(f)
const filter = predicate => array => array.filter(predicate)
const prepend = (item, array) => [item].concat(array)
const pipe = (...fs) => x => fs.reduce((y, f) => f(y), x)
const not = predicate => x => !predicate(x)
const sum = xs => xs.reduce((x, y) => x + y, 0)
const indices = n => [...Array(n).keys()]

const SIZE = 4

const column = rows => i => rows.map(row => row[i])

const transpose = rows => indices(rows[0].length).map(column(rows))

let id = 0

const empty = tile => tile.empty
const merged = tile => tile.mergedFrom
const value = tile => tile.value

const emptyTile = () => ({ empty: true })

const merge = (tile1, tile2) => ({
  value: tile1.value + tile2.value,
  mergedFrom: [tile1.id, tile2.id],
  id: id++
})

const collapse = row =>
  row.length < 2
    ? row
    : row[0].value === row[1].value
      ? prepend(
        merge(row[0], row[1]),
        collapse(row.slice(2))
      )
      : prepend(
        row[0],
        collapse(row.slice(1))
      )

const completeTo = n => row => row.concat(Array(n - row.length).fill(emptyTile()))

const moveRow = pipe(
  filter(not(empty)),
  collapse,
  completeTo(SIZE)
)

const left = map(moveRow)

const right = pipe(
  map(reverse),
  map(moveRow),
  map(reverse)
)

const up = pipe(
  transpose,
  map(moveRow),
  transpose
)

const down = pipe(
  reverse,
  transpose,
  map(moveRow),
  transpose,
  reverse
)

const emptyPositions = rows =>
  rows.flatMap((row, y) =>
    row
      .map((tile, x) => ({ empty: tile.empty, x, y }))
  )
    .filter(empty)

const rndTile = () =>
  Math.random() < 1
    ? { value: 2, id: id++, mergedFrom: [] }
    : { value: 4, id: id++, mergedFrom: [] }

// const rndPick = array => array[Math.floor(Math.random() * array.length)]
const rndPick = array => array[0]

const addTile = (rows, newTile, pos) =>
  rows.map((row, y) =>
    y !== pos.y
      ? row
      : row.map((tile, x) =>
        x !== pos.x
          ? tile
          : newTile
      )
  )

const scoreFromMergedTiles = rows => {
  const mergedVaules =
    rows.flatMap(pipe(
      filter(merged),
      map(value)
    ))
  return sum(mergedVaules)
}

const removeMergedIdsFromTile = tile =>({
  ...tile, ...{ mergedFrom: [] }
})

const removeMergedIds = rows =>
  rows.map(row =>
    row.map(removeMergedIdsFromTile)
  )

const swipe = move => state => {
  const clearedRows = removeMergedIds(state.rows)
  const movedRows = move(clearedRows)
  const positions = emptyPositions(movedRows)
  const gameOver = positions.length === 0
  const rows = addTile(movedRows, rndTile(), rndPick(positions))
  const score = state.score + scoreFromMergedTiles(rows)
  return {
    rows,
    gameOver,
    score
  }
}

const initialState = {
  rows: indices(SIZE).map(() => indices(SIZE).map(emptyTile)),
  gameOver: false,
  score: 0
}

const newGame = () => initialState

const nextState = (state, action) => action(state)

export { initialState, nextState, newGame, swipe, left, right, up, down, SIZE, not, empty, merged }
