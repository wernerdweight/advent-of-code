#!/usr/bin/env node

import fs from 'fs'

const MINUTES = 30

let totalSimulations = 0
let totalBranches = 0
let best = 0
let start = new Date()
let disqualifiedBranches = 0

const logLine = (currentValveId, minutes, toOpen, pressure, totalReleased) => {
  console.log(`${(new Date() - start) / 1_000}s | ${currentValveId}: ${minutes} m, ${toOpen} to open, total released ${totalReleased} | Simulations: #${totalSimulations}/${totalBranches} (${disqualifiedBranches} DQF) | best so far: ${best}`)
}

const solve = (currentValveId, minutes, pressure, toOpen, cameFrom, cameFrom2, totalReleased, stack, opened) => {
  totalReleased += pressure
  if (totalBranches % 1_000_000 === 0) {
    logLine(currentValveId, minutes, toOpen, pressure, totalReleased)
  }
  if (minutes === 0 || toOpen === 0) {
    const newBest = totalReleased + (toOpen === 0 ? minutes * pressure : 0)
    if (newBest > best) {
      //console.log(`minutes: ${minutes}, totalReleased: ${totalReleased}, newBest: ${newBest}, pressure: ${pressure}, toOpen: ${toOpen}`)
      //console.log(stack)
      best = newBest
    }
    return pressure + pressure * minutes
  }

  if (best > totalReleased + (minutes * mostToDoInAMinute)) {
    // this branch can't be better than the current best
    disqualifiedBranches++
    return 0
  }

  const valve = valveIndex[currentValveId]
  let withOpen = 0
  let withGoToNext = []

  // open
  if (!opened.includes(currentValveId) && valve.flowRate > 0) {
    totalBranches++
    withOpen = solve(valve.id, minutes - 1, pressure + valve.flowRate, toOpen - 1, cameFrom, null, totalReleased , [...stack, currentValveId], [...opened, currentValveId])
    totalSimulations++
  }

  // go to next valve(s
  if (valve.leadsTo.length > 0) {
    valve.leadsTo.sort((a, b) => {
      const aStacked = stack.includes(a)
      const bStacked = stack.includes(b)
      if ((aStacked && bStacked) || (!aStacked && !bStacked)) {
        return valveIndex[b].flowRate < valveIndex[a].flowRate ? -1 : 1
      }
      return bStacked ? -1 : 1
    }).forEach(nextValveId => {
      if (nextValveId !== cameFrom || currentValveId !== cameFrom2) { // don't go back and forth
        totalBranches++
        withGoToNext.push(solve(nextValveId, minutes - 1, pressure, toOpen, currentValveId, cameFrom, totalReleased, [...stack, nextValveId], opened))
        totalSimulations++
      }
    })
  }

  if (minutes === MINUTES - 1) {
    logLine(currentValveId, minutes, toOpen, pressure, totalReleased)
    console.log(stack)
  }
  return pressure + Math.max(withOpen, ...withGoToNext)
}

const data = fs.readFileSync('./data.txt').toString().trim()
const rows = data.split('\n')

const valves = rows.filter(row => row.length > 0).map(row => {
  const [_, id, flowRate, leadsTo] = row.match(/^Valve\s+(\S+)\s+has\s+flow\s+rate=(\d+);\s+tunnels?\s+leads?\s+to\s+valves?\s+(.*)$/)
  return {
    id,
    flowRate: parseInt(flowRate),
    leadsTo: leadsTo.split(', '),
    opened: false
  }
})

const valveIndex = {}
valves.forEach(valve => {
  valveIndex[valve.id] = {...valve}
})

const mostToDoInAMinute = valves.reduce((sum, valve) => sum + valve.flowRate, 0)

const toOpen = valves.filter(valve => valve.flowRate > 0).length
const mostPresureIn30Mins = solve(valves[0].id, MINUTES - 1, 0, toOpen, null, null, 0, [], [])

console.log(`Most pressure to release in ${MINUTES} mins is ${mostPresureIn30Mins}`)
