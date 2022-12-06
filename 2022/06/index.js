#!/usr/bin/env node

import fs from 'fs'

const PACKET_MARKER_LENGTH = 4
const MESSAGE_MARKER_LENGTH = 14

const getMarkerEnd = (data, markerLength) => {
  for (let index = 0; index < data.length; index++) {
    const slidingWindow = data.slice(index, index + markerLength)
    const chars = slidingWindow.split('')
    if (new Set(chars).size === markerLength) {
      return index + markerLength
    }
  }
  throw new Error('No marker found')
}

const data = fs.readFileSync('./data.txt').toString().trim()

const packetMarkerEnd = getMarkerEnd(data, PACKET_MARKER_LENGTH)
const messageMarkerEnd = getMarkerEnd(data, MESSAGE_MARKER_LENGTH)

console.log(`The first start-of-packet marker ends at ${packetMarkerEnd}`)
console.log(`The first start-of-message marker ends at ${messageMarkerEnd}`)
