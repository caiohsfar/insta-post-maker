const readline = require('readline-sync')

function robot() {
  const content = {
    maximunSentences: 7,
  }

  content.searchTerm = askAndReturnSearchTerm()
  content.prefix = askAndReturnPrefix()
  console.dir(content, { depht: false })

  function askAndReturnSearchTerm() {
    return readline.question('Digite um termo do Wikipedia: ')
  }
  function askAndReturnPrefix() {
    const prefixes = ['Quem é', 'O que é', 'A história de', 'Outro']
    const selectedPrefixIndex = readline.keyInSelect(
      prefixes,
      'Escolha uma opção: '
    )
    if (selectedPrefixIndex === 3)
      return readline.question('Digite uma opção diferente: ')

    return prefixes[selectedPrefixIndex]
  }
}

module.exports = robot
