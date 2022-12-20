#!/usr/bin/env node

import fs from 'fs'

const MINUTES = 26

let totalSimulations = 0
let totalBranches = 0
let best = 0
let start = new Date()
let disqualifiedBranches = 0

const logLine = (currentValveId, minutes, toOpen, pressure, totalReleased) => {
  console.log(`${(new Date() - start) / 1_000}s | ${currentValveId}: ${minutes} m, ${toOpen} to open, total released ${totalReleased} | Simulations: #${totalSimulations}/${totalBranches} (${disqualifiedBranches} DQF) | best so far: ${best}`)
}

const solve = (currentValveIds, minutes, pressure, toOpen, cameFrom, cameFrom2, totalReleased, stack, opened) => {
  totalReleased += pressure
  if (totalBranches % 1_000_000 === 0) {
    logLine(currentValveIds, minutes, toOpen, pressure, totalReleased)
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

  const valves = [valveIndex[currentValveIds[0]], valveIndex[currentValveIds[1]]]
  let withOpen = []
  let withGoToNext = []

  const sortValves = () => {
    return (a, b) => {
      const aStacked = stack.includes(a)
      const bStacked = stack.includes(b)
      if ((aStacked && bStacked) || (!aStacked && !bStacked)) {
        return valveIndex[b].flowRate < valveIndex[a].flowRate ? -1 : 1
      }
      return bStacked ? -1 : 1
    }
  }

  // ME and ELEPHANT
  // open and open (unless we're both in the same room)
  if (currentValveIds[0] !== currentValveIds[1] && !opened.includes(currentValveIds[0]) && valves[0].flowRate > 0 && !opened.includes(currentValveIds[1]) && valves[1].flowRate > 0) {
    totalBranches++
    withOpen.push(solve([valves[0].id, valves[1].id], minutes - 1, pressure + valves[0].flowRate + valves[1].flowRate, toOpen - 2, [...cameFrom], [null, null], totalReleased , [...stack, currentValveIds], [...opened, ...currentValveIds]))
    totalSimulations++
  }
  // open and goto
  if (valves[1].leadsTo.length > 0 && !opened.includes(currentValveIds[0]) && valves[0].flowRate > 0) {
    valves[1].leadsTo.sort(sortValves()).forEach(nextValveId => {
      if (nextValveId !== cameFrom[1] || currentValveIds[1] !== cameFrom2[1]) { // don't go back and forth
        totalBranches++
        withGoToNext.push(solve([valves[0].id, nextValveId], minutes - 1, pressure + valves[0].flowRate, toOpen - 1, [cameFrom[0], currentValveIds[1]], [null, cameFrom[1]], totalReleased, [...stack, [currentValveIds[0], nextValveId]], [...opened, currentValveIds[0]]))
        totalSimulations++
      }
    })
  }
  // goto and open
  if (valves[0].leadsTo.length > 0 && !opened.includes(currentValveIds[1]) && valves[1].flowRate > 0) {
    valves[0].leadsTo.sort(sortValves()).forEach(nextValveId => {
      if (nextValveId !== cameFrom[0] || currentValveIds[0] !== cameFrom2[0]) { // don't go back and forth
        totalBranches++
        withGoToNext.push(solve([nextValveId, valves[1].id], minutes - 1, pressure + valves[1].flowRate, toOpen - 1, [currentValveIds[0], cameFrom[1]], [cameFrom[0], null], totalReleased, [...stack, [nextValveId, currentValveIds[1]]], [...opened, currentValveIds[1]]))
        totalSimulations++
      }
    })
  }
  // goto and goto
  if (valves[0].leadsTo.length > 0 && valves[1].leadsTo.length > 0) {
    valves[0].leadsTo.sort(sortValves()).forEach(nextValveId0 => {
      valves[1].leadsTo.sort(sortValves()).forEach(nextValveId1 => {
        if ((nextValveId0 !== cameFrom[0] || currentValveIds[0] !== cameFrom2[0]) && (nextValveId1 !== cameFrom[1] || currentValveIds[1] !== cameFrom2[1])) { // don't go back and forth
          totalBranches++
          withGoToNext.push(solve([nextValveId0, nextValveId1], minutes - 1, pressure, toOpen, [...currentValveIds], [...cameFrom], totalReleased, [...stack, [nextValveId0, nextValveId1]], [...opened]))
          totalSimulations++
        }
      })
    })
  }

  if (minutes === MINUTES - 1) {
    logLine(currentValveIds, minutes, toOpen, pressure, totalReleased)
    console.log(stack)
  }
  return pressure + Math.max(...withOpen, ...withGoToNext)
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
const mostPresureIn26Mins = solve([valves[0].id, valves[0].id], MINUTES - 1, 0, toOpen, [null, null], [null, null], 0, [], [])

console.log(`Most pressure to release in ${MINUTES} mins is ${mostPresureIn26Mins}`)
