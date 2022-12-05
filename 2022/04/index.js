#!/usr/bin/env node

import fs from 'fs'

const getBoundaries = sectorString => sectorString.split('-').map(boundary => parseInt(boundary))

const isOverlapping = (first, second) => {
  const [firstFrom, firstTo] = getBoundaries(first)
  const [secondFrom, secondTo] = getBoundaries(second)
  return (firstFrom <= secondTo && firstTo >= secondFrom) || (secondFrom <= firstTo && secondTo >= firstFrom)
}

const isFullyOverlapping = (first, second) => {
  const [firstFrom, firstTo] = getBoundaries(first)
  const [secondFrom, secondTo] = getBoundaries(second)
  return (firstFrom <= secondFrom && firstTo >= secondTo) || (secondFrom <= firstFrom && secondTo >= firstTo)
}

const calculateOverlap = method =>
  rows.reduce((carry, row) => {
    if (row.length === 0) { // skip empty line
      return carry
    }
    const [first, second] = row.split(',')
    return carry + method(first, second)
  }, 0)

const data = fs.readFileSync('./data.txt').toString()
const rows = data.split('\n')

const oneFullyContainsTheOtherCount = calculateOverlap(isFullyOverlapping)
const oneContainsTheOtherCount = calculateOverlap(isOverlapping)
console.log(`There are ${oneContainsTheOtherCount} overlapping assignments, ${oneFullyContainsTheOtherCount} of them overlap fully`)
