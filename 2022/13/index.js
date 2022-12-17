#!/usr/bin/env node

import fs from 'fs'

const isLeftSmaller = (left, right) => {
  const isLeftNumber = Number.isInteger(left)
  const isRightNumber = Number.isInteger(right)
  if (isLeftNumber && isRightNumber) {
    if (left === right) {
      return null
    }
    return left < right
  }
  if (isLeftNumber) {
    left = [left]
  }
  if (isRightNumber) {
    right = [right]
  }
  for (let index = 0; index < Math.max(left.length, right.length); index++) {
    if (typeof left[index] === 'undefined') {
      return true
    }
    if (typeof right[index] === 'undefined') {
      return false
    }
    const result = isLeftSmaller(left[index], right[index])
    if (result !== null) {
      return result
    }
  }
  return null
}

const isInCorrectOrder = pair => {
  const [left, right] = pair.split('\n').map(item => eval(item))
  return isLeftSmaller(left, right)
}

const data = fs.readFileSync('./data.txt').toString().trim()
const pairs = data.split('\n\n')
const sumOfIndices = pairs.reduce((sum, pair, index) => isInCorrectOrder(pair) ? sum + index + 1 : sum, 0)

console.log(`Sum of correct pair indices is ${sumOfIndices}`)

const packets = data.split('\n').filter(row => row.length > 0)
packets.push('[[2]]', '[[6]]')
const sortedPackets = packets.sort((a, b) => isLeftSmaller(eval(a), eval(b)) ? -1 : 1)
const dividerPositions = [
  sortedPackets.indexOf('[[2]]'),
  sortedPackets.indexOf('[[6]]')
]
console.log(`Decoder key is ${(dividerPositions[0] + 1) * (dividerPositions[1] + 1)}`)
