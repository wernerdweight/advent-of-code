#!/usr/bin/env node

import fs from 'fs'

const READ_CYCLES = [20, 60, 100, 140, 180, 220]
const NO_OP = 'noop'
const CRT_WIDTH = 40

const getSignalStrengths = (rows, readCycles) => {
  let register = 1
  let cycle = 0
  let output = ''
  const strengths = {}

  const nextCycle = () => {
    output += (cycle % CRT_WIDTH >= register - 1 && cycle % CRT_WIDTH <= register + 1) ? '#' : '.'
    if (cycle % CRT_WIDTH === CRT_WIDTH - 1) {
      output += '|'
    }
    cycle++
    if (readCycles.includes(cycle)) {
      strengths[cycle] = cycle * register
    }
  }

  rows.forEach(row => {
    if (row.length === 0) {
      return
    }
    nextCycle()
    if (row !== NO_OP) {
      nextCycle()
      const value = parseInt(row.split(' ')[1])
      register += value
    }
  })

  return [output, strengths]
}

const data = fs.readFileSync('./data.txt').toString().trim()
const rows = data.split('\n')

const [output, strengths] = getSignalStrengths(rows, READ_CYCLES)
const signalStrengthsSum = Object.values(strengths).reduce((carry, strength) => carry + strength, 0)

console.log(`Sum of signal strengths is ${signalStrengthsSum}`)
console.log(`CRT output is:\n${output.split('|').join('\n')}`)
