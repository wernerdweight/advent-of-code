#!/usr/bin/env node

import fs from 'fs'

const rangeFrom = (char, length) => [...Array(length).keys()].map(key => String.fromCharCode(char.charCodeAt(0) + key))
const PRIORITY_MAP =[...rangeFrom('a', 26), ...rangeFrom('A', 26)]

const resolvePriority = (char) => PRIORITY_MAP.indexOf(char) + 1

const getUniqueChars = string => [...new Set(Array.from(string))]

const getMatchingReqExp = chars => new RegExp(chars.join('|'), 'g')

const data = fs.readFileSync('./data.txt').toString()
const rows = data.split('\n')

const sumOfPriorities = rows.reduce((carry, row) => {
  if (row.length === 0) { // skip empty line
    return carry
  }
  const length = row.length
  const compartmentA = row.slice(0, length / 2)
  const compartmentB = row.slice(length / 2)
  const uniqueCharsA = getUniqueChars(compartmentA)
  const matchingRegExp = getMatchingReqExp(uniqueCharsA)
  const inBothCompartments = compartmentB.match(matchingRegExp)[0]
  return carry + resolvePriority(inBothCompartments)
}, 0)
console.log(`The sum of priorities is ${sumOfPriorities}`)

const groups = []
while (rows.length > 0) {
  if (rows[0].length === 0) { // skip empty line
    break
  }
  groups.push(rows.splice(0, 3))
}
const sumOfBadgePriorities = groups.reduce((carry, group) => {
  const [rucksackA, rucksackB, rucksackC] = group
  const uniqueCharsA = getUniqueChars(rucksackA)
  const uniqueCharsB = getUniqueChars(rucksackB).join()
  const uniqueCharsC = getUniqueChars(rucksackC).join()
  const matchingRegExpAB = getMatchingReqExp(uniqueCharsA)
  const inAB = uniqueCharsB.match(matchingRegExpAB)
  const matchinRegExpABC = getMatchingReqExp(inAB)
  const inABC = uniqueCharsC.match(matchinRegExpABC)
  if (inABC.length > 1) {
    throw new Error ('multiple same items in all rucksacks')
  }
  const inAllRucksacks = inABC[0]
  return carry + resolvePriority(inAllRucksacks)
}, 0)
console.log(`The sum of badge priorities is ${sumOfBadgePriorities}`)
