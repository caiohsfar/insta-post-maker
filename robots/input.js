const readline = require('readline-sync')
const scrapper = require('./scrapper')()
const state = require('./state')

async function robot() {
  const content = {
    maximunSentences: 4,
    maximunTags: 30,
  }

  content.searchTerm = askAndReturnSearchTerm()

  content.subTopic = await askAndReturnSubtopic(content.searchTerm)

  await scrapper.quitDriver()

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
