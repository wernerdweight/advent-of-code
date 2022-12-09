#!/usr/bin/env node

import fs from 'fs'

const simulate = knots => {

  const getCoordToChange = direction => ['R', 'L'].includes(direction) ? 1 : 0

  const getMovement = direction => ['R', 'U'].includes(direction) ? 1 : -1

  const isTailTooFarFromHead = (head, tail) => Math.max(Math.abs(head[0] - tail[0]), Math.abs(head[1] - tail[1])) > 1

  const areTailAndHeadInLine = (head, tail) => {
    if (head[0] === tail[0]) {
      return 1 // horizontally aligned, change col
    }
    if (head[1] === tail[1]) {
      return 0 // vertically aligned, change row
    }
    return null // not aligned
  }

  const moveTailTowardsHead = (head, tail) => {
    const inLine = areTailAndHeadInLine(head, tail)
    if (null !== inLine) {
      // move in line
      tail[inLine] += head[inLine] > tail[inLine] ? 1 : -1
      return
    }
    // move diagonally
    tail[0] += head[0] > tail[0] ? 1 : -1
    tail[1] += head[1] > tail[1] ? 1 : -1
  }

  const knotPositions = []
  for (let index = 0; index < knots; index++) {
    knotPositions.push([0, 0])
  }

  return rows.reduce((carry, row) => {
    if (row.length === 0) {
      return carry
    }
    const [direction, distance] = row.split(' ')
    const coordToChange = getCoordToChange(direction)
    const movement = getMovement(direction)
    for (let index = 0; index < distance; index++) {
      for (let knotIndex = 0; knotIndex < knots - 1; knotIndex++) {
        if (knotIndex === 0) {
          // only move head, other knots will move depending on this first move
          knotPositions[knotIndex][coordToChange] += movement
        }
        if (isTailTooFarFromHead(knotPositions[knotIndex], knotPositions[knotIndex + 1])) {
          moveTailTowardsHead(knotPositions[knotIndex], knotPositions[knotIndex + 1])
          if (knotIndex === knots - 2) {
            carry[knotPositions[knotIndex + 1].join(':')] = true
          }
          continue
        }
        break
      }
    }
    return carry
  }, {'0:0': true})
}

const data = fs.readFileSync('./data.txt').toString().trim()
const rows = data.split('\n')

const twoKnotRope = simulate(2)
console.log(`The tail of the two-knot rope visited ${Object.keys(twoKnotRope).length} positions`)

const tenKnotRope = simulate(10)
console.log(`The tail of the ten-knot rope visited ${Object.keys(tenKnotRope).length} positions`)
