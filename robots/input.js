const readline = require('readline-sync')
const state = require('./state')

function askAndReturnSearchTerm() {
  return readline.question('Type a wikipedia search term: ')
}

function askAndReturnPrefix() {
  const prefixes = ['who is', 'What is', 'The history of']
  const SelectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose one option:')
  const selectedPrefixText = prefixes[SelectedPrefixIndex]

  return selectedPrefixText
}

function robot() {
  const content = {
    maximumSentences: 7
  }

  content.searchTerm = askAndReturnSearchTerm()
  content.prefix = askAndReturnPrefix()
  state.save(content)
}

module.exports = robot