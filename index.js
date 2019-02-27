const readline = require('readline-sync')

function start() {
  const content = {}

  content.searchTerm = askAndReturnSearchTerm()
  content.prefix = askAndReturnPrefix()

  function askAndReturnSearchTerm() {
    return readline.question('Type a wikipedia search term:')
  }

  function askAndReturnPrefix() {
    const prefixes = ['who is', 'What is', 'The history of']
    const SelectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose one option:')
    const selectedPrefixText = prefixes[SelectedPrefixIndex]

    return selectedPrefixText
  }

  console.log(content)
}

start()