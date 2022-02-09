import chalk from "chalk"

export const duration = (difference, short) => {
  difference = difference / 1000

  if (difference < 60) {
    return `${difference}${short ? "s" : " second(s)"}`
  } else if (difference >= 60 && difference < 3600) {
    return `${Math.floor(difference / 60)}${short ? "m" : " minute(s)"}`
  } else if (difference >= 3600 && difference < 86400) {
    return `${Math.floor(difference / 3600)}${short ? "h" : " hour(s)"}`
  } else if (difference >= 86400 && difference < 604800) {
    return `${Math.floor(difference / 86400)}${short ? "d" : " day(s)"}`
  } else if (difference >= 604800 && difference < 7889231) {
    return `${Math.floor(difference / 604800)}${short ? "w" : " week(s)"}`
  } else if (difference >= 7889231) {
    return `${Math.floor(difference / 2628000)}${short ? "M" : " month(s)"}`
  }
}

export const logErr = (error) => console.log(chalk.red(error))
export const logWarn = (warn) => console.log(chalk.yellow(warn))

export function isNil(val) {
  return val === undefined || val === null
}
