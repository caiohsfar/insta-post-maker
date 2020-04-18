const readline = require('readline-sync')
const scrapper = new (require('./scrapper'))()
const state = require('./state')

async function robot() {
  const content = {}

  content.searchTerm = askAndReturnSearchTerm()

  content.subTopic = await askAndReturnSubtopic(content.searchTerm)

  await scrapper.driver.quit()

  state.save(content)

  //console.dir(content, { depht: false })

  function askAndReturnSearchTerm() {
    return readline.question('> [Input]: Digite um termo do Wikipedia: ')
  }
  async function askAndReturnSubtopic(searchTerm) {
    const subtopics = await scrapper.getSubtopicsFromWikipedia(searchTerm)

    const selectedPrefixIndex = readline.keyInSelect(
      subtopics,
      '> [Input]: Escolha um tópico: '
    )

    return subtopics[selectedPrefixIndex]
  }
}

module.exports = robot
