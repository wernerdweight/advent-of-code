#!/usr/bin/env node

import fs from 'fs'

const isVisible = (row, column, value) => {
  if (row === 0 || column === 0 || row === treeGridRows - 1 || column === treeGridCols - 1) {
    // outer trees
    return true
  }
  let visibleNorth = true, visibleSouth = true, visibleWest = true, visibleEast = true
  // north
  for (let index = 0; index < row; index++) {
    if (treeGrid[index][column] >= value) {
      visibleNorth = false
      break
    }
  }
  // south
  for (let index = row + 1; index < treeGridRows; index++) {
    if (treeGrid[index][column] >= value) {
      visibleSouth = false
      break
    }
  }
  // west
  for (let index = 0; index < column; index++) {
    if (treeGrid[row][index] >= value) {
      visibleWest = false
      break
    }
  }
  // east
  for (let index = column + 1; index < treeGridCols; index++) {
    if (treeGrid[row][index] >= value) {
      visibleEast = false
      break
    }
  }
  return visibleNorth || visibleSouth || visibleWest || visibleEast
}

const getScenicScore = (row, column, value) => {
  let scoreNorth = 0, scoreSouth = 0, scoreWest = 0, scoreEast = 0
  // north
  for (let index = row - 1; index >= 0; index--) {
    scoreNorth++
    if (treeGrid[index][column] >= value) {
      break
    }
  }
  // south
  for (let index = row + 1; index < treeGridRows; index++) {
    scoreSouth++
    if (treeGrid[index][column] >= value) {
      break
    }
  }
  // west
  for (let index = column - 1; index >= 0; index--) {
    scoreWest++
    if (treeGrid[row][index] >= value) {
      break
    }
  }
  // east
  for (let index = column + 1; index < treeGridCols; index++) {
    scoreEast++
    if (treeGrid[row][index] >= value) {
      break
    }
  }
  return scoreNorth * scoreSouth * scoreWest * scoreEast
}

const data = fs.readFileSync('./data.txt').toString().trim()
const rows = data.split('\n')

const treeGrid = []

rows.forEach(row => {
  if (row.length === 0) {
    return
  }
  const trees = row.split('').map(height => parseInt(height))
  treeGrid.push(trees)
})

const treeGridRows = treeGrid.length
const treeGridCols = treeGrid[0].length
let visibleCount = 0

treeGrid.forEach((rowValue, row) => {
  rowValue.forEach((value, col) => {
    if (isVisible(row, col, value)) {
      visibleCount++
    }
  })
})

console.log(`Number of visible trees is: ${visibleCount}`)

let topScenicScore = 0
let coords = '0:0'
treeGrid.forEach((rowValue, row) => {
  rowValue.forEach((value, col) => {
    const score = getScenicScore(row, col, value)
    if (score > topScenicScore) {
      topScenicScore = score
      coords = `${row}:${col}`
    }
  })
})

console.log(`Highest scenic score is: ${topScenicScore} at ${coords}`)
