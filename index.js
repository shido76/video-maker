const readline = require('readline-sync')
const robots = {
  text: require('./robots/text')
}

function askAndReturnSearchTerm() {
  return readline.question('Type a wikipedia search term: ')
}

function askAndReturnPrefix() {
  const prefixes = ['who is', 'What is', 'The history of']
  const SelectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose one option:')
  const selectedPrefixText = prefixes[SelectedPrefixIndex]

  return selectedPrefixText
}

async function start() {
  const content = {}

  content.searchTerm = askAndReturnSearchTerm()
  content.prefix = askAndReturnPrefix()

  await robots.text(content)

  console.log(content)
}

start()