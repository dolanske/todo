#!/usr/bin/env node

import chalk from "chalk"
import rl from "readline"
import { Low, JSONFile } from "lowdb"
import { join } from "path"

import { duration, logErr, logWarn, isNil } from "./util.js"

// Setup

const file = join(".", "db.json")
const adapter = new JSONFile(file)
const db = new Low(adapter)

await db.read()

// Init data in case it's empty
db.data ||= { todos: [] }

async function pushToDB(todo) {
  db.data.todos.push(todo)
  await db.write()
}

function prompt(question) {
  const r = rl.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  })
  return new Promise((resolve, error) => {
    r.question(question, (answer) => {
      r.close()
      resolve(answer)
    })
  })
}

/**
 *
 * Defaults
 *
 */

const usage = function () {
  const usageText = `
  todo helps you manage your todo tasks.

  usage:
    todo <command>

    commands can be:

    new       <track>     used to create a new todo, if track parameter is set to true, tracking begins immediately
    get       <index>     used to retrieve your todos
    del       <index>     used to delete todo at provided index
    complete  <index>     used to mark a todo as complete
    track     <index>     used to track how long it took to complete task
    help                  used to print the usage guide
  `

  console.log(usageText)
}

/**
 *
 * Application
 *
 */

const args = process.argv
const cmd = args[2]
const param = args[3]

switch (cmd) {
  case "new": {
    newTodo(param ? true : false)
    break
  }
  case "get": {
    getTodo(param)
    break
  }
  case "done": {
    doneTodo(param)
    break
  }
  case "track": {
    trackTodo(param)
    break
  }
  case "help": {
    usage()
    break
  }
  case "del": {
    delTodo(param)
    break
  }
  case "clear": {
    clearTodo()
    break
  }
  default: {
    logErr("Invalid Command Passed")
    usage()
  }
}

async function delTodo(index) {
  if (db.data.todos[index]) {
    db.data.todos.splice(index, 1)
  }

  await db.write()
}

async function clearTodo() {
  db.data.todos = []

  await db.write()
}

function newTodo(shouldTrack = false) {
  const q = chalk.blue("Type in your todo\n")
  prompt(q).then((todo) => {
    pushToDB({
      title: todo,
      start_date: shouldTrack ? Date.now() : null,
      complete_date: null,
      duration: null,
      tracking: shouldTrack,
      complete: false,
    })
  })
}

function getTodo(index) {
  if (index) {
    // Return at index
    if (db.data.todos[index - 1]) {
      const todo = db.data.todos[index - 1]
      const output = `
        ${chalk.bgMagenta.black("Selected todo:")}

        ${index}. ${todo.title} [${isDone(todo.complete)}]

        ${formatDuration(todo)}
      `
      console.log(output)
    } else {
      console.log("No to-do at this index.")
    }
  } else {
    // Return all

    const data = db.data.todos

    if (!data || data.length === 0) {
      console.log("No to-dos available")
      return
    }

    const items = data
      .map((todo, index) => {
        return `
          ${index + 1}. ${todo.title} [${isDone(todo.complete)}]
          
          ${formatDuration(todo)}
          `
      })
      .join("\n")

    let output = `
    ${chalk.bgMagenta.black("All todos:")}

    ${items}`

    console.log(output)
  }
}

async function doneTodo(index) {
  if (isNil(index)) {
    logErr("Must provide todo index")
    return
  }

  index -= 1

  const item = db.data.todos[index]
  const now = Date.now()

  Object.assign(item, {
    complete: true,
    complete_date: now,
    ...(item.tracking && { duration: now - item.start_date }),
  })

  db.data.todos[index] = item

  console.log()

  await db.write()
}

async function trackTodo(index) {
  index -= 1

  if (isNil(index)) {
    logErr("Must provide todo index")
    return
  }

  if (!db.data.todos[index]) {
    logErr(`No todo found at index ${index}`)
    return
  }

  const todo = db.data.todos[index]

  if (todo.tracking) {
    logErr("Todo is already tracked")
    return
  }

  Object.assign(todo, {
    tracking: true,
    start_date: Date.now(),
  })

  db.data.todos[index] = todo

  await db.write()
}

/**
 *
 * Formatting
 *
 */

function formatDuration(item) {
  if (item.tracking) {
    if (item.duration) {
      // Item is complete
      return "Completed in: " + chalk.green(duration(item.duration))
    }

    // Item is tracked, display time
    return "In progress: " + chalk.blue(duration(Date.now() - item.start_date))
  }

  return chalk.inverse("Not tracked")
}

/**
 *
 * @param {Boolean} status
 * @returns Checkmark if todo is completed or cross if not
 */

function isDone(status) {
  if (status) {
    return chalk.green("Done")
  }
  return chalk.blue("In progress")
}
