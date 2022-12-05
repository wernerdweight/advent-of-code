#!/usr/bin/env node

import fs from 'fs'

//      [H]         [D]     [P]
//  [W] [B]         [C] [Z] [D]
//  [T] [J]     [T] [J] [D] [J]
//  [H] [Z]     [H] [H] [W] [S]     [M]
//  [P] [F] [R] [P] [Z] [F] [W]     [F]
//  [J] [V] [T] [N] [F] [G] [Z] [S] [S]
//  [C] [R] [P] [S] [V] [M] [V] [D] [Z]
//  [F] [G] [H] [Z] [N] [P] [M] [N] [D]
//   1   2   3   4   5   6   7   8   9

const getStacks = () => [
  ['W', 'T', 'H', 'P', 'J', 'C', 'F'],
  ['H', 'B', 'J', 'Z', 'F', 'V', 'R', 'G'],
  ['R', 'T', 'P', 'H'],
  ['T', 'H', 'P', 'N', 'S', 'Z'],
  ['D', 'C', 'J', 'H', 'Z', 'F', 'V', 'N'],
  ['Z', 'D', 'W', 'F', 'G', 'M', 'P'],
  ['P', 'D', 'J', 'S', 'W', 'Z', 'V', 'M'],
  ['S', 'D', 'N'],
  ['M', 'F', 'S', 'Z', 'D']
]

const parseInstruction = instruction => instruction.replace(/move (\d+) from (\d+) to (\d+)/, '$1-$2-$3').split('-').map(item => parseInt(item))

const data = fs.readFileSync('./data.txt').toString()
const rows = data.split('\n')
let stacks = getStacks()

rows.forEach(instruction => {
  if (instruction.length === 0) {
    return
  }
  const [quantity, source, destination] = parseInstruction(instruction)
  for (let index = 0; index < quantity; index++) {
    stacks[destination - 1].unshift(stacks[source - 1].shift())
  }
})

const topCrates = stacks.reduce((carry, stack) => carry + stack[0], '')
console.log(`CraneMover 9000: The following crates are on the top ${topCrates}`)

stacks = getStacks()

rows.forEach(instruction => {
  if (instruction.length === 0) {
    return
  }
  const [quantity, source, destination] = parseInstruction(instruction)
  stacks[destination - 1].unshift(...stacks[source - 1].splice(0, quantity))
})

const topCrates9001 = stacks.reduce((carry, stack) => carry + stack[0], '')
console.log(`CraneMover 9001: The following crates are on the top ${topCrates9001}`)
