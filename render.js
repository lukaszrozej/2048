import { SIZE, empty, merged } from './game-logic.js'

const $score = document.querySelector('.score')
const $tiles = document.querySelector('.tiles')
const $squares = document.querySelector('.squares')
const boardSize = 60
const tileSize = 0.21 * boardSize
const offset = (boardSize - 4 * tileSize) / 5
const fontSize = 0.51 * tileSize

document.querySelector('header').style.width = `${boardSize}vmin`
$tiles.style.width = `${boardSize}vmin`
$tiles.style.height = `${boardSize}vmin`
$squares.style.width = `${boardSize}vmin`
$squares.style.height = `${boardSize}vmin`

const dist = y => `${offset + y * (tileSize + offset)}vmin`

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
    : [tile.id]

const ids = state =>
  state.rows.flatMap(row =>
    row.flatMap(tileIds)
  )

const tileStyles = {
  2: { background: '#eee4da', color: '#776e65', size: 1.0 },
  4: { background: '#ede0c8', color: '#776e65', size: 1.0 },
  8: { background: '#f2b179', color: '#f9f6f2', size: 1.0 },
  16: { background: '#f59563', color: '#f9f6f2', size: 1.0 },
  32: { background: '#f67c5f', color: '#f9f6f2', size: 1.0 },
  64: { background: '#f65e3b', color: '#f9f6f2', size: 1.0 },
  128: { background: '#edcf72', color: '#f9f6f2', size: 0.82 },
  256: { background: '#edcc61', color: '#f9f6f2', size: 0.82 },
  512: { background: '#edc850', color: '#f9f6f2', size: 0.82 },
  1024: { background: '#edc53f', color: '#f9f6f2', size: 0.64 },
  2048: { background: '#edc22e', color: '#f9f6f2', size: 0.64 },
  big: { background: '#3c3a32', color: '#f9f6f2', size: 0.55 }
}

const tileStyle = tile =>
  tile.value in tileStyles
    ? tileStyles[tile.value]
    : tileStyles.big

// const createTile = (tile, x, y) => {
//   const $tile = document.createElement('div')
//   setPosition($tile, x, y)
//   $tile.style.width = `${tileSize}vmin`
//   $tile.style.height = `${tileSize}vmin`
//   $tile.id = tile.id
//   $tile.classList.add('tile')

//   const $tileInner = document.createElement('div')
//   const { background, color, size } = tileStyle(tile)
//   $tileInner.style.width = `${tileSize}vmin`
//   $tileInner.style.height = `${tileSize}vmin`
//   $tileInner.style.background = background
//   $tileInner.style.color = color
//   $tileInner.style.fontSize = `${size * fontSize}vmin`
//   $tileInner.textContent = tile.value
//   $tileInner.classList.add('tile-inner')

//   $tile.appendChild($tileInner)
//   $tiles.appendChild($tile)
// }

const createTile = (tile, x, y, type) => {
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
  $tile.classList.add(type)
  $tiles.appendChild($tile)
}

const renderTile = (tile, x, y) => {
  if (empty(tile)) return

  const $tile = document.getElementById(tile.id)
  if ($tile) {
    $tile.classList.remove('new')
    $tile.classList.remove('merged')
    setPosition($tile, x, y)
    return
  }

  const type = tile.mergedFrom.length > 0 ? 'merged' : 'new'
  createTile(tile, x, y, type)
  tile
    .mergedFrom
    .forEach(id => setPosition(document.getElementById(`${id}`), x, y))
}

const renderScore = score => {
  $score.textContent = score
}

const render = state => {
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
