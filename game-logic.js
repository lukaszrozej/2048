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
const merged = tile => !tile.empty && tile.mergedFrom.length > 0
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
  Math.random() < 0.9
    ? { value: 2, id: id++, mergedFrom: [] }
    : { value: 4, id: id++, mergedFrom: [] }

const rndPick = array => array[Math.floor(Math.random() * array.length)]
// const rndPick = array => array[0]

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

const removeMergedIdsFromTile = tile => ({
  ...tile, ...{ mergedFrom: [] }
})

const removeMergedIds = rows =>
  rows.map(row =>
    row.map(removeMergedIdsFromTile)
  )

const equal = (tile1, tile2) =>
  (tile1.empty && tile2.empty) || (tile1.id === tile2.id)

const nothingMoved = (rows1, rows2) =>
  indices(SIZE).every(y =>
    indices(SIZE).every(x =>
      equal(rows1[y][x], rows2[y][x])
    )
  )

const mergeable = (tile1, tile2) =>
  !tile1.empty &&
  !tile2.empty &&
  tile1.value === tile2.value

const nothingToMergeInRow = row =>
  indices(SIZE - 1).every(i => !mergeable(row[i], row[i + 1]))

const nothingToMerge = rows =>
  rows.every(nothingToMergeInRow) &&
  transpose(rows).every(nothingToMergeInRow)

const has2048 = rows =>
  rows.some(row =>
    row.some(tile => !tile.empty && tile.value === 2048)
  )

const swipe = move => state => {
  if (state.won && !state.keepGoing) return state

  const clearedRows = removeMergedIds(state.rows)
  const movedRows = move(clearedRows)
  if (nothingMoved(state.rows, movedRows)) return state

  const positions = emptyPositions(movedRows)
  const rows = addTile(movedRows, rndTile(), rndPick(positions))
  const score = state.score + scoreFromMergedTiles(rows)
  const gameOver = emptyPositions(rows).length === 0 && nothingToMerge(rows)
  const won = state.won || has2048(rows)
  return {
    rows,
    gameOver,
    score,
    won,
    keepGoing: state.keepGoing
  }
}

const rows = indices(SIZE).map(() => indices(SIZE).map(emptyTile))
rows[0][0] = { value: 2, id: id++, mergedFrom: [] }

const initialState = {
  rows,
  gameOver: false,
  score: 0,
  won: false,
  keepGoing: false
}

const newGame = () => initialState

const keepGoing = state => ({ ...state, ...{ keepGoing: true } })

const nextState = (state, action) => action(state)

export { initialState, nextState, newGame, keepGoing, swipe, left, right, up, down, SIZE, not, empty, merged }
