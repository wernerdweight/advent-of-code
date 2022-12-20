#!/usr/bin/env node

import fs from 'fs'

const ROCKS = [
  // ####
  () => [[0,0], [0,1], [0,2], [0, 3]],

  // .#.
  // ###
  // .#.
  () => [[0,1], [1,0], [1,1], [1,2], [2,1]],

  // ..#
  // ..#
  // ###
  () => [[0,0], [0,1], [0,2], [1,2], [2,2]],

  // #
  // #
  // #
  // #
  () => [[0,0], [1,0], [2,0], [3,0]],

  // ##
  // ##
  () => [[0,0], [0,1], [1,0], [1,1]]
]
const JET_LEFT = '<'
const JET_RIGHT = '>'
const PAD_LEFT = 2
const PAD_BOTTOM = 3 + 1
//const ITERATIONS = 10 // test from the assignment
const ITERATIONS = 2022

const canGoLeft = rock => {
  const leftMost = rock.reduce((leftMost, element) => element[1] < leftMost[1] ? element : leftMost, [0, Infinity])
  //return leftMost[1] > 0 && leftMost[0] > chamberHorizon[leftMost[1] - 1]
  return leftMost[1] > 0 && rock.filter(element => element[0] <= chamberHorizon[element[1] - 1]).length === 0
}
const canGoRight = rock => {
  const rightMost = rock.reduce((rightMost, element) => element[1] > rightMost[1] ? element : rightMost, [0, -Infinity])
  //return rightMost[1] < chamberWidth - 1 && rightMost[0] > chamberHorizon[rightMost[1] + 1]
  return rightMost[1] < chamberWidth - 1 && rock.filter(element => element[0] <= chamberHorizon[element[1] + 1]).length === 0
}
const canGoDown = rock => rock.filter(element => element[0] - 1 <= chamberHorizon[element[1]]).length === 0

const fall = iteration => {
  let currentRock = ROCKS[iteration % ROCKS.length]()
  currentRock = currentRock.map(element => [element[0] + Math.max(...chamberHorizon) + PAD_BOTTOM, element[1] + PAD_LEFT])
  console.log(`Rock ${iteration}: falls from ${JSON.stringify(currentRock)}`)
  while (true) {
    const currentJet = jetDirections[currentJetIndex++ % jetDirectionsCount]
    console.log(`Rock ${iteration}: jet ${currentJet}`)
    if (currentJet === JET_LEFT && canGoLeft(currentRock)) {
      currentRock = currentRock.map(element => [element[0], element[1] - 1])
    }
    if (currentJet === JET_RIGHT && canGoRight(currentRock)) {
      currentRock = currentRock.map(element => [element[0], element[1] + 1])
    }
    if (!canGoDown(currentRock)) {
      currentRock.forEach(element => {
        chamberHorizon[element[1]] = Math.max(chamberHorizon[element[1]], element[0])
      })
      console.log(`Rock ${iteration}: done chamberHorizon is ${JSON.stringify(chamberHorizon)}`)
      break
    }
    currentRock = currentRock.map(element => [element[0] - 1, element[1]])
  }
}

const data = fs.readFileSync('./data.txt').toString().trim()
const jetDirections = data.split('\n')[0].split('')
const jetDirectionsCount = jetDirections.length

const chamberHorizon = [0, 0, 0, 0, 0, 0, 0]
const chamberWidth = chamberHorizon.length

let currentJetIndex = 0
for (let iteration = 0; iteration < ITERATIONS; iteration++) {
  fall(iteration)
}

console.log(`The tower of rocks is ${Math.max(...chamberHorizon)} units tall`)
