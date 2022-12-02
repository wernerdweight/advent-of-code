#!/usr/bin/env node

import fs from 'fs'

const OPPONENT_HAND = {
  ROCK: 'A',
  PAPER: 'B',
  SCISSORS: 'C'
}

const MY_HAND = {
  ROCK: 'X',
  PAPER: 'Y',
  SCISSORS: 'Z'
}

const OUTCOME = {
  LOOSE: 'X',
  DRAW: 'Y',
  VICTORY: 'Z'
}

const SCORES = {
  VICTORY: 6,
  DRAW: 3,
  LOOSE: 0,
  [MY_HAND.ROCK]: 1,
  [MY_HAND.PAPER]: 2,
  [MY_HAND.SCISSORS]: 3,
}

const OUTCOME_SCORES = {
  [OUTCOME.LOOSE]: SCORES.LOOSE,
  [OUTCOME.DRAW]: SCORES.DRAW,
  [OUTCOME.VICTORY]: SCORES.VICTORY
}

const DECISION_MAP = {
  [OPPONENT_HAND.ROCK]: {
    [MY_HAND.ROCK]: SCORES.DRAW,
    [MY_HAND.PAPER]: SCORES.VICTORY,
    [MY_HAND.SCISSORS]: SCORES.LOOSE
  },
  [OPPONENT_HAND.PAPER]: {
    [MY_HAND.ROCK]: SCORES.LOOSE,
    [MY_HAND.PAPER]: SCORES.DRAW,
    [MY_HAND.SCISSORS]: SCORES.VICTORY
  },
  [OPPONENT_HAND.SCISSORS]: {
    [MY_HAND.ROCK]: SCORES.VICTORY,
    [MY_HAND.PAPER]: SCORES.LOOSE,
    [MY_HAND.SCISSORS]: SCORES.DRAW
  }
}

const data = fs.readFileSync('./data.txt').toString()
const rows = data.split('\n')

const scorePt1 = rows.reduce((carry, row) => {
  if (row.length === 0) { // skip empty line
    return carry
  }
  const [opponent, me] = row.split(' ')
  const outcomeScore = DECISION_MAP[opponent][me]
  const myHandScore = SCORES[me]
  return carry + myHandScore + outcomeScore
}, 0)
console.log(`The final score, if choosing hand, is ${scorePt1}`)

const scorePt2 = rows.reduce((carry, row) => {
  if (row.length === 0) { // skip empty line
    return carry
  }
  const [opponent, outcome] = row.split(' ')
  const outcomeScore = OUTCOME_SCORES[outcome]
  const decisionStem = DECISION_MAP[opponent]
  const myHand = Object.keys(decisionStem).filter(shape => decisionStem[shape] === OUTCOME_SCORES[outcome])[0]
  const myHandScore = SCORES[myHand]
  return carry + myHandScore + outcomeScore
}, 0)
console.log(`The final score, if choosing outcome, is ${scorePt2}`)
