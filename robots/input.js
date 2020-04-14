const readline = require('readline-sync')
const Scrapper = require('./scrapper')
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

  console.dir(content, { depht: false })

  async function getTextFromWikipedia(topic, subtopic) {
    return await new Scrapper().getParagraph(topic, subtopic)
  }

  function askAndReturnSearchTerm() {
    return readline.question('> [Input]: Digite um termo do Wikipedia: ')
  }
  async function askAndReturnSubtopic(searchTerm) {
    //Scrapper Get topics
    //Put these in a array
    //Show to user
    const scrapper = new Scrapper()
    const subtopics = await scrapper.getSubtopicsFromWikipedia(searchTerm)
    //const prefixes = ['Quem é', 'O que é', 'A história de', 'Outro']

    const selectedPrefixIndex = readline.keyInSelect(
      subtopics,
      '> [Input]: Escolha um tópico: '
    )

    return subtopics[selectedPrefixIndex]
  }
}

module.exports = robot
