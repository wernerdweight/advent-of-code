#!/usr/bin/env node

import fs from 'fs'

const SMALL_DIR_LIMIT = 100_000
const TOTAL_SPACE = 70_000_000
const REQUIRED_SPACE = 30_000_000

const CONTEXT = {
  LS: 'ls',
  CD: 'cd'
}

const fileSystemMap = {
  '/': {
    _parent: null,
    _size: 0
  }
}
fileSystemMap['/']._parent = fileSystemMap

const fileSystemList = [
  fileSystemMap['/']
]

const isCommand = row => row.match(/^\$/)

const updateContext = (commandRow, pointer) => {
  const args = commandRow.replace(/^\$\s+/, '').split(' ')
  if (args.length > 2) {
    throw new Error('too many arguments')
  }
  if (args.length === 2) {
    const [command, path] = args
    if (command !== CONTEXT.CD) {
      throw new Error('unexpected command')
    }
    if (path === '..') {
      return pointer._parent
    }
    return pointer[path]
  }
  if (args.length === 1 && args[0] === CONTEXT.LS) {
    return pointer
  }
  throw new Error('invalid command')
}

const propagateSize = (size, pointer) => {
  pointer._size += size
  if (pointer._parent) {
    propagateSize(size, pointer._parent)
  }
}

const processListingRow = (row, pointer) => {
  const [size, name] = row.split(' ')
  if (size === 'dir') {
    pointer[name] = {
      _parent: pointer,
      _size: 0
    }
    fileSystemList.push(pointer[name])
    return
  }
  const intSize = parseInt(size)
  pointer[name] = intSize
  propagateSize(intSize, pointer)
}

const data = fs.readFileSync('./data.txt').toString().trim()
const rows = data.split('\n')

let pointer = fileSystemMap

// build file system tree
rows.forEach(row => {
  if (row.length === 0) {
    return
  }
  if (isCommand(row)) {
    pointer = updateContext(row, pointer)
    return
  }
  processListingRow(row, pointer)
})

console.log(`Number of directories: ${Object.keys(fileSystemList).length}`)

// go through the list to sum all smaller (<= 100000) dir sizes
const smallerDirectoriesKeys = fileSystemList.filter(item => item._size <= SMALL_DIR_LIMIT)
console.log(`Number of smaller directories: ${smallerDirectoriesKeys.length}`)

const sizeSum = smallerDirectoriesKeys.reduce((carry, item) => carry + item._size, 0)
console.log(`Total sum of smaller directory sizes is ${sizeSum}`)

const spaceToFeeUp = REQUIRED_SPACE - (TOTAL_SPACE - fileSystemMap['/']._size)
console.log(`Ok, let's find ${spaceToFeeUp} bytes to free`)

const smallestFolderToDelete = fileSystemList.filter(dir => dir._size >= spaceToFeeUp).reduce((carry, dir) => carry._size > dir._size ? dir : carry, {_size: TOTAL_SPACE})
console.log(`The size of the directory to delete is ${smallestFolderToDelete._size}`)
