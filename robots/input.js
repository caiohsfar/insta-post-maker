const readline = require('readline-sync')
const scrapper = new (require('./scrapper'))()
const state = require('./state')

async function robot() {
  const content = {
    maximunSentences: 7,
  }

  content.searchTerm = askAndReturnSearchTerm()

  content.subTopic = await askAndReturnSubtopic(content.searchTerm)

  content.sourceText = await getTextFromWikipedia(
    content.searchTerm,
    content.subTopic
  )
  await scrapper.driver.quit()
  state.save(content)

  console.dir(content, { depht: false })

  async function getTextFromWikipedia(topic, subtopic) {
    return await scrapper.getParagraph(topic, subtopic)
  }

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
