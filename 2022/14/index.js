#!/usr/bin/env node

import fs from 'fs'
import sleep from 'sleep'

const SAND = 'o'
const ROCK = '#'
const AIR = '.'
const SOURCE = '+'
const SOURCE_POSITION = [0, 500]

const createGrid = (paths, boundaries) => {
  const grid = []
  for (let row = 0; row <= boundaries[2] + 2; row++) {
    grid[row] = []
    for (let col = 0; col <= Math.max(boundaries[3], SOURCE_POSITION[1] + (boundaries[2] + 2)); col++) {
      grid[row][col] = row === boundaries[2] + 2 ? ROCK : AIR
    }
  }
  grid[SOURCE_POSITION[0]][SOURCE_POSITION[1]] = SOURCE
  paths.forEach(path => {
    for (let index = 0; index < path.length - 1; index++) {
      const start = path[index]
      const end = path[index + 1]
      if (start[0] === end[0]) {  // horizontal
        while (start[1] !== end[1]) {
          grid[start[0]][start[1]] = ROCK
          start[1] += end[1] > start[1] ? 1 : -1
        }
        grid[start[0]][start[1]] = ROCK
        continue
      }
      // vertical
      while (start[0] !== end[0]){
        grid[start[0]][start[1]] = ROCK
        start[0] += end[0] > start[0] ? 1 : -1
      }
      grid[start[0]][start[1]] = ROCK
    }
  })
  return grid
}

const drawImage = (grid, from, to) => {
  console.clear()
  const output = grid.reduce((output, row) => output + row.slice(from, to + 1).join('') + '\n', '')
  console.log(output)
  sleep.msleep(200)
}

const sandNotOutOfBounds = (grid, boundary, position) => {
  const unitPosition = position || [...SOURCE_POSITION]
  if (unitPosition[0] + 1 > boundary) {
    return false
  }
  while (grid[unitPosition[0] + 1][unitPosition[1]] === AIR) {
    unitPosition[0]++
    if (unitPosition[0] + 1 > boundary) {
      return false
    }
  }
  if (grid[unitPosition[0] + 1][unitPosition[1] - 1] === AIR) {
    return sandNotOutOfBounds(grid, boundary, [unitPosition[0] + 1, unitPosition[1] - 1])
  }
  if (grid[unitPosition[0] + 1][unitPosition[1] + 1] === AIR) {
    return sandNotOutOfBounds(grid, boundary, [unitPosition[0] + 1, unitPosition[1] + 1])
  }
  if (unitPosition[0] === SOURCE_POSITION[0] && unitPosition[1] === SOURCE_POSITION[1] && grid[unitPosition[0]][unitPosition[1]] === SAND) {
    return false
  }
  grid[unitPosition[0]][unitPosition[1]] = SAND
  return true
}

const data = fs.readFileSync('./data.txt').toString().trim()
const rows = data.split('\n')
const paths = rows.map(row => row.split(' -> ').map(item => item.split(',').map(item => parseInt(item)).reverse()))
const boundaries = paths.reduce((carry, path) => {
  return path.reduce((pathCarry, corner) => {
    return [
      0,
      pathCarry[1] > corner[1] ? corner[1] : pathCarry[1],
      pathCarry[2] < corner[0] ? corner[0] : pathCarry[2],
      pathCarry[3] < corner[1] ? corner[1] : pathCarry[3]
    ]
  }, carry)
}, [Infinity, Infinity, 0, 0])

const grid = createGrid(paths, boundaries)
let counter = 0
while (sandNotOutOfBounds(grid, boundaries[2] + 2)) {
  //drawImage(grid, Math.min(boundaries[1], SOURCE_POSITION[1] - (boundaries[2] + 2)), Math.max(boundaries[3], SOURCE_POSITION[1] + (boundaries[2] + 2)))
  counter++
}

console.log(`${counter} units of sand come to rest before the sand stops flowing`)
