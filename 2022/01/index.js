#!/usr/bin/env node

import fs from 'fs'

const data = fs.readFileSync('./data.txt').toString()
const rows = data.split('\n')
const parts = []
let index = 0
rows.forEach(row => {
  if (row.length === 0) {
    index++
    return
  }
  if (typeof parts[index] === 'undefined') {
    parts[index] = []
  }
  parts[index].push(parseInt(row))
})
const totals = parts.map(part => part.reduce((carry, entry) => carry + entry, 0))
const max = totals.reduce((carry, entry) => entry > carry ? entry : carry, 0)
console.log(`Max is ${max}`)

const topThree = totals.sort((a, b) => a > b ? -1 : 1).slice(0, 3)
const topThreeSum = topThree.reduce((carry, entry) => carry + entry, 0)
console.log(`Top three elves carry ${topThreeSum}`)
