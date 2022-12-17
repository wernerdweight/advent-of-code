#!/usr/bin/env node

import fs from 'fs'

const START = 'S'.charCodeAt(0)
const END = 'E'.charCodeAt(0)

const FROM_BELOW = 0
const FROM_ABOVE = 1
const FROM_LEFT = 2
const FROM_RIGHT = 3

let totalCounter = 0
let solutionCounter = 0
let bestSolution = Infinity
let highestPosition = 'a'
let highestDepth = 0
let startTime = new Date()
let uniqueVisited = {}

const replaceLimits = charCode => charCode === START ? 'a'.charCodeAt(0) : (charCode === END ? 'z'.charCodeAt(0) : charCode)

const canGoUp = ([row, col], visited) => row > 0 && !visited.includes(`${row - 1}:${col}`) && (replaceLimits(grid[row - 1][col]) - replaceLimits(grid[row][col]) <= 1)
const canGoDown = ([row, col], visited) => row < grid.length - 1 && !visited.includes(`${row + 1}:${col}`) && (replaceLimits(grid[row + 1][col]) - replaceLimits(grid[row][col]) <= 1)
const canGoLeft = ([row, col], visited) => col > 0 && !visited.includes(`${row}:${col - 1}`) && (replaceLimits(grid[row][col - 1]) - replaceLimits(grid[row][col]) <= 1)
const canGoRight = ([row, col], visited) => col < grid[0].length - 1 && !visited.includes(`${row}:${col + 1}`) && (replaceLimits(grid[row][col + 1]) - replaceLimits(grid[row][col]) <= 1)

const solve = (grid, coords, fromDirection, visited) => {
  const paths = {
    up: Infinity,
    down: Infinity,
    left: Infinity,
    right: Infinity
  }
  const [row, col] = coords
  visited.push(`${row}:${col}`)
  uniqueVisited[`${row}:${col}`] = true
  highestPosition = highestPosition.charCodeAt(0) < replaceLimits(grid[row][col]) ? String.fromCharCode(replaceLimits(grid[row][col])) : highestPosition
  highestDepth = highestDepth < visited.length ? visited.length : highestDepth

  if (visited.length > bestSolution) {
    console.log(`Already visited more nodes (${visited.length}) than the current best solution, terminating branch...`)
    return Infinity
  }

  // print currently researched branch (every 100,000th)
  totalCounter++
  if (totalCounter % 100_000 === 0) {
    console.clear()
    for (let indexR = 0; indexR < grid.length; indexR++) {
      let chars = ''
      for (let indexC = 0; indexC < grid[0].length; indexC++) {
        let colorStart = ''
        let colorEnd = ''
        if (Object.keys(uniqueVisited).includes(`${indexR}:${indexC}`)) {
          colorStart = '\x1b[35m'
          colorEnd = '\x1b[0m'
        }
        chars += (indexR === startCoords[0] && indexC === startCoords[1]
          ? '\x1b[33m→\x1b[0m'
          : (indexR === endCoords[0] && indexC === endCoords[1]
            ? '\x1b[33m╳\x1b[0m'
            : `${colorStart}${visited.includes(`${indexR}:${indexC}`) ? '▮' : '▯'}${colorEnd}`))
      }
      console.log(chars)
    }
    console.log(` ${Math.abs(new Date() - startTime) / 1_000} s | Visited ${totalCounter} nodes, ${Object.keys(uniqueVisited).length} unique | highest so far is ${highestPosition} | depth: highest ${highestDepth}, current ${visited.length} | ${solutionCounter} solutions so far | best solution in ${bestSolution} steps`)
  }

  if (grid[row][col] === END) {
    // reached 'E'
    console.log(`found E, visited ${visited.length} nodes`)
    solutionCounter++
    bestSolution = bestSolution < visited.length ? bestSolution : visited.length
    return 0
  }

  let priority = {
    right: -Infinity,
    up: -Infinity,
    down: -Infinity,
    left: -Infinity
  }

  if (fromDirection !== FROM_RIGHT && canGoRight(coords, visited)) {
    priority.right = replaceLimits(grid[row][col + 1]) - replaceLimits(grid[row][col])
  }
  if (fromDirection !== FROM_ABOVE && canGoUp(coords, visited)) {
    priority.up = replaceLimits(grid[row - 1][col]) - replaceLimits(grid[row][col])
  }
  if (fromDirection !== FROM_BELOW && canGoDown(coords, visited)) {
    priority.down = replaceLimits(grid[row + 1][col]) - replaceLimits(grid[row][col])
  }
  if (fromDirection !== FROM_LEFT && canGoLeft(coords, visited)) {
    priority.left = replaceLimits(grid[row][col - 1]) - replaceLimits(grid[row][col])
  }

  // prioritise direction which increases the current height
  const orderedOperations = Object.keys(priority).filter(key => priority[key] !== -Infinity).sort((keyA, keyB) => priority[keyA] < priority[keyB] ? 1 : -1)
  orderedOperations.forEach(direction => {
    if (direction === 'right') {
      paths.right = 1 + solve(grid, [row, col + 1], FROM_LEFT, [...visited])
    }
    if (direction === 'up') {
      paths.up = 1 + solve(grid, [row - 1, col], FROM_BELOW, [...visited])
    }
    if (direction === 'down') {
      paths.down = 1 + solve(grid, [row + 1, col], FROM_ABOVE, [...visited])
    }
    if (direction === 'left') {
      paths.left = 1 + solve(grid, [row, col - 1], FROM_RIGHT, [...visited])
    }
  })
  // return shortest path, discard others
  return Math.min(...Object.values(paths))
}

const data = fs.readFileSync('./data.txt').toString().trim()
const rows = data.split('\n')

let startCoords, endCoords
const grid = []

rows.forEach((row, rowIndex) => {
  if (row.length === 0) {
    return
  }
  const gridRow = row.split('').map((char, index) => {
    const code = char.charCodeAt(0)
    if (code === START) {
      startCoords = [rowIndex, index]
    }
    if (code === END) {
      endCoords = [rowIndex, index]
    }
    return code
  })
  grid.push(gridRow)
})

const steps = solve(grid, startCoords, null, [])
console.clear()

console.log(`Visited ${totalCounter} nodes`)
console.log(`The shortest path is ${steps} steps long`)
