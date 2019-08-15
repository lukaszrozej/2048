import { SIZE, empty, merged } from './game-logic.js'

const $tiles = document.querySelector('.tiles')
const $squares = document.querySelector('.squares')
const tileSize = 20
const fontSize = 0.51 * tileSize

const dist = y => `${y * tileSize}vmin`

const setPosition = ($element, x, y) => {
  $element.style.top = dist(y)
  $element.style.left = dist(x)
}

for (let x = 0; x < SIZE; x++) {
  for (let y = 0; y < SIZE; y++) {
    const $square = document.createElement('div')
    setPosition($square, x, y)
    $square.style.width = `${tileSize}vmin`
    $square.style.height = `${tileSize}vmin`
    $square.classList.add('square')
    $squares.appendChild($square)
  }
}

const tileIds = tile =>
  merged(tile)
    ? tile.mergedFrom.concat(tile.id)
    : []

const ids = state =>
  state.rows.flatMap(row =>
    row.flatMap(tileIds)
  )

const tileStyles = {
  2: { background: '#eee4da', color: '#776e65', size: 1.0 },
  4: { background: '#ede0c8', color: '#776e65', size: 1.0 },
  8: { background: '#f2b179', color: '#f9f6f2', size: 1.0 },
  16: { background: '#f59563', color: '#f9f6f2', size: 1.0 },
  32: { background: '#f59563', color: '#f67c5f', size: 1.0 },
  64: { background: '#f59563', color: '#f65e3b', size: 1.0 },
  128: { background: '#f59563', color: '#edcf72', size: 0.82 },
  256: { background: '#f59563', color: '#edcc61', size: 0.82 },
  512: { background: '#f59563', color: '#edc850', size: 0.82 },
  1024: { background: '#f59563', color: '#edc53f', size: 0.64 },
  2048: { background: '#f59563', color: '#edc22e', size: 0.64 },
  big: { background: '#3c3a32', color: '#f9f6f2', size: 0.55 }
}

const tileStyle = tile =>
  tile.value in tileStyles
    ? tileStyles[tile.value]
    : tileStyles.big

const createTile = (tile, x, y) => {
  const $tile = document.createElement('div')
  setPosition($tile, x, y)
  const { background, color, size } = tileStyle(tile)
  $tile.style.width = `${tileSize}vmin`
  $tile.style.height = `${tileSize}vmin`
  $tile.style.background = background
  $tile.style.color = color
  $tile.style.fontSize = `${size * fontSize}vmin`
  $tile.textContent = tile.value
  $tile.id = tile.id
  $tile.classList.add('tile')
  $tiles.appendChild($tile)
}

const renderTile = (tile, x, y) => {
  if (empty(tile)) return

  const $tile = document.getElementById(tile.id)
  if ($tile) return setPosition($tile, x, y)

  createTile(tile, x, y)
  console.log(document.querySelectorAll('.tile'))
  console.log(tile.mergedFrom)
  tile
    .mergedFrom
    .forEach(id => setPosition(document.getElementById(`${id}`), x, y))
}

const renderScore = () => {

}

const render = state => {
  // console.log(state)
  // console.log(document.querySelectorAll('.tile'))
  document.querySelectorAll('.tile').forEach($tile => {
    if (!ids(state).includes(parseInt($tile.id))) $tile.remove()
  })

  state.rows.forEach((row, y) =>
    row.forEach((tile, x) =>
      renderTile(tile, x, y)
    )
  )

  renderScore(state.score)
}

export { render }
