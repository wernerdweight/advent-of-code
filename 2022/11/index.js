#!/usr/bin/env node

import fs from 'fs'

const DEFAULT_ROUNDS = 20
const ROUNDS = 10_000

const getMonkey = config => {
  const [id, items, operation, test, trueAction, falseAction] = config.split('\n')
  return {
    id: parseInt(id.replace(/^Monkey\s+(\d).*$/, '$1')),
    items: items.replace(/^\s+Starting\s+items:\s+((\d+(,\s)?)*).*$/g, '$1').replace(/\s+/g, '').split(',').map(item => parseInt(item)),
    operation: old => eval(operation.replace(/^\s+Operation:\s+new\s+=\s+(.*)$/, '$1')), // do not try this at home
    test: parseInt(test.replace(/^\s+Test:\sdivisible\s+by\s+(\d+).*$/, '$1')),
    trueAction: parseInt(trueAction.replace(/^\s+If\strue:\s+throw\s+to\s+monkey\s+(\d+).*$/, '$1')),
    falseAction: parseInt(falseAction.replace(/^\s+If\sfalse:\s+throw\s+to\s+monkey\s+(\d+).*$/, '$1')),
    inspectedItems: 0
  }
}

const simulateRound = (monkeys, divideByThree, monkeyCommonModulo) => {
  monkeys.forEach(monkey => {
    //console.log(`  Monkey ${monkey.id}:`)
    while (monkey.items.length > 0) {
      let currentItem = monkey.items.shift()
      if (!divideByThree) {
        currentItem %= monkeyCommonModulo
      }
      monkey.inspectedItems++
      //console.log(`    Monkey inspects an item with a worry level of ${currentItem}`)
      const worryLevel = Math.floor(monkey.operation(currentItem))
      //console.log(`      Worry level increases to ${worryLevel}`)
      const newWorryLevel = divideByThree ? Math.floor(worryLevel / 3) : worryLevel
      //console.log(`      Worry level is divided by 3 to ${newWorryLevel}`)
      const targetMonkey = newWorryLevel % monkey.test === 0 ? monkey.trueAction : monkey.falseAction
      //console.log(`      Item with Worry level ${newWorryLevel} is thrown to monkey ${targetMonkey}`)
      monkeys[targetMonkey].items.push(newWorryLevel)
    }
  })
}

const data = fs.readFileSync('./data.txt').toString().trim()
const monkeyConfig = data.split('\n\n')
const monkeys = monkeyConfig.reduce((carry, monkeyConfig) => {
  carry.push(getMonkey(monkeyConfig))
  return carry
}, [])

const monkeyCommonModulo = monkeys.reduce((carry, monkey) => carry * monkey.test, 1)

for (let index = 0; index < ROUNDS; index++) {
  console.log(`Round ${index}:`)
  simulateRound(monkeys, ROUNDS === DEFAULT_ROUNDS, monkeyCommonModulo)
}
const sortedMonkeys = monkeys.sort((monkeyA, monkeyB) => monkeyA.inspectedItems < monkeyB.inspectedItems ? 1 : -1)
const monkeyBusinessLevel = sortedMonkeys[0].inspectedItems * sortedMonkeys[1].inspectedItems

console.log(`The monkey business level is ${monkeyBusinessLevel}`)
