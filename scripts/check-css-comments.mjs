import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const skip = new Set(['node_modules', '.next', '.git', '.vercel', '.claude', 'public'])

function sheets(dir) {
  const found = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) found.push(...sheets(full))
    else if (entry.name.endsWith('.css')) found.push(full)
  }
  return found
}

function comments(text) {
  const found = []
  let i = 0
  let quote = null
  while (i < text.length) {
    const char = text[i]
    if (quote) {
      if (char === '\\') i += 2
      else {
        if (char === quote) quote = null
        i += 1
      }
      continue
    }
    if (char === '"' || char === "'") {
      quote = char
      i += 1
      continue
    }
    if (char === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2)
      found.push(text.slice(0, i).split('\n').length)
      i = end === -1 ? text.length : end + 2
      continue
    }
    i += 1
  }
  return found
}

let failed = false
for (const file of sheets(root)) {
  for (const line of comments(fs.readFileSync(file, 'utf8'))) {
    console.error(`${path.relative(root, file)}:${line}  No comments in this repo. See CLAUDE.md.`)
    failed = true
  }
}

process.exit(failed ? 1 : 0)
