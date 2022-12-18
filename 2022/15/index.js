#!/usr/bin/env node

import fs from 'fs'

const EMPTY = '.'
const SENSOR = 'S'
const BEACON = 'B'
const COVERED = '#'

const getMCDistance = (from, to) => Math.abs(from[0] - to[0]) + Math.abs(from[1] - to[1])

const normalizeX = x => x - (boundaries[0] - MARGIN)
const normalizeY = y => y - (boundaries[1] - MARGIN)

const createSingleRowGrid = (sensors, beacons, boundaries, rowIndex) => {
  const grid = []
  for (let col = normalizeY(boundaries[1] - MARGIN); col <= normalizeY(boundaries[3] + MARGIN); col++) {
    grid[col] = EMPTY
  }

  sensors.forEach(([x, y]) => {
    if (x === rowIndex) {
      grid[normalizeY(y)] = SENSOR
    }
  })
  //console.log('All sensors placed')
  beacons.forEach(([x, y]) => {
    if (x === rowIndex) {
      grid[normalizeY(y)] = BEACON
    }
  })
  //console.log('All beacons placed')

  // cover areas
  sensors.forEach((sensor, index) => {
    const closestBeacon = beacons[index]
    const distance = getMCDistance(sensor, closestBeacon)
    if (rowIndex < sensor[0] - distance || rowIndex > sensor[0] + distance) {
      //console.log(`Sensor ${index} [${sensor}]: sensor is too far from the line ${rowIndex} (distance is ${distance}); skipping...`)
      return
    }
    //console.log(`Sensor ${index} [${sensor}]: covering anything on the selected line ${rowIndex} within the distance of ${distance}...`)
    // check all positions within the distance
    for (let col = normalizeY(sensor[1]) - distance; col <= normalizeY(sensor[1]) + distance; col++) {
      if (grid[col] === EMPTY && getMCDistance([normalizeX(rowIndex), col], [normalizeX(sensor[0]), normalizeY(sensor[1])]) <= distance) {
        grid[col] = COVERED
      }
    }
  })

  return grid
}

const createGrid = (sensors, beacons, boundaries) => {
  const grid = []
  for (let row = normalizeX(boundaries[0] - MARGIN); row <= normalizeX(boundaries[2] + MARGIN); row++) {
    grid[row] = []
    for (let col = normalizeY(boundaries[1] - MARGIN); col <= normalizeY(boundaries[3] + MARGIN); col++) {
      grid[row][col] = EMPTY
    }
  }

  sensors.forEach(([x, y]) => {
    grid[normalizeX(x)][normalizeY(y)] = SENSOR
  })
  console.log('All sensors placed')
  beacons.forEach(([x, y]) => {
    grid[normalizeX(x)][normalizeY(y)] = BEACON
  })
  console.log('All beacons placed')

  // cover areas
  sensors.forEach((sensor, index) => {
    //if (sensor[0] !== 7 || sensor[1] !== 8) {
    //  // FIXME: test purposes
    //  return
    //}
    const closestBeacon = beacons[index]
    const distance = getMCDistance(sensor, closestBeacon)
    console.log(`Sensor ${index}: covering anything within the distance of ${distance}...`)
    // check all positions within the distance
    for (let row = normalizeX(sensor[0]) - distance; row <= normalizeX(sensor[0]) + distance; row++) {
      for (let col = normalizeY(sensor[1]) - distance; col <= normalizeY(sensor[1]) + distance; col++) {
        if (grid[row][col] === EMPTY && getMCDistance([row, col], [normalizeX(sensor[0]), normalizeY(sensor[1])]) <= distance) {
          grid[row][col] = COVERED
        }
      }
    }
  })

  return grid
}

const drawImage = (grid) => {
  const output = grid.reduce((output, row) => output + row.join('') + '\n', '')
  console.log(output)
}

const getCovered = row => row.reduce((count, col) => [SENSOR, COVERED].includes(col) ? count + 1 : count, 0)
const getEmpty = row => row.indexOf(EMPTY)

const data = fs.readFileSync('./data.txt').toString().trim()
const rows = data.split('\n')
const sensors = []
const beacons = []
let boundaries = [Infinity, Infinity, -Infinity, -Infinity]

rows.forEach(row => {
  if (row.length === 0) {
    return
  }
  let [_, sensorY, sensorX, beaconY, beaconX] = row.match(/^Sensor\s+at\s+x=(-?\d+),\s+y=(-?\d+):\s+closest\s+beacon\s+is\s+at\s+x=(-?\d+),\s+y=(-?\d+)$/)
  sensorX = parseInt(sensorX)
  sensorY = parseInt(sensorY)
  beaconX = parseInt(beaconX)
  beaconY = parseInt(beaconY)
  sensors.push([sensorX, sensorY])
  beacons.push([beaconX, beaconY])
  const lowestX = Math.min(sensorX, beaconX)
  const lowestY = Math.min(sensorY, beaconY)
  const highestX = Math.max(sensorX, beaconX)
  const highestY = Math.max(sensorY, beaconY)
  if (boundaries[0] > lowestX) {
    boundaries[0] = lowestX
  }
  if (boundaries[1] > lowestY) {
    boundaries[1] = lowestY
  }
  if (boundaries[2] < highestX) {
    boundaries[2] = highestX
  }
  if (boundaries[3] < highestY) {
    boundaries[3] = highestY
  }
})

//const MARGIN = Math.ceil(Math.max(Math.abs(boundaries[0] - boundaries[2]), Math.abs(boundaries[1] - boundaries[3])) / 2)

//const grid = createGrid(sensors, beacons, boundaries)
//drawImage(grid)
//const coveredPositions = getCovered(grid[normalizeX(10)])

//const grid = createSingleRowGrid(sensors, beacons, boundaries, 2_000_000)
//const coveredPositions = getCovered(grid)
//
//console.log(`There are ${coveredPositions} covered positions on line 2,000,000`)

const MARGIN = 0
boundaries = [0, 0, 4_000_000, 4_000_000]
//const grid = createGrid(sensors, beacons, narrowBoundaries)
//drawImage(grid)
for (let index = normalizeX(boundaries[0]); index <= normalizeX(boundaries[2]); index++) {
  if (index % 100 === 0) {
    console.log(`At row ${index}...`)
  }
  const grid = createSingleRowGrid(sensors, beacons, boundaries, index)
  const emptyPosition = getEmpty(grid)
  if (emptyPosition !== -1) {
    console.log(`The beacon can be at ${[index, emptyPosition]}, on frequency ${index + 4_000_000 * normalizeY(emptyPosition)}`)
    break
  }
}
