const state = require('./state')
const stopword = require('stopword')

const scrapper = new (require('./scrapper'))()
const sentenceBoundaryDetection = require('sbd')
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1')
const { IamAuthenticator } = require('ibm-watson/auth')

const { apikey, url } = require('../credentials/watson-nlu.json')

const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
  version: '2019-07-12',
  authenticator: new IamAuthenticator({
    apikey,
  }),
  url,
})

async function robot() {
  const content = state.load()

  content.sourceText = await getTextFromWikipedia(
    content.searchTerm,
    content.subTopic
  )

  content.sanitizedText = sanitizeText(content.sourceText)

  breakTextInSentences(content)
  await fetchKeywordsOfAllSentences(content)
  state.save(content)

  console.dir(content, { depth: true })

  await scrapper.driver.quit()

  function getTagsByKeywords(keywords) {
    let tags = []
    keywords.map((keyword) => {
      const keywordInArray = keyword.split(' ')
      const keywordWithoutStopwords = stopword.removeStopwords(
        keywordInArray,
        stopword.ptbr
      )
      tags = [...tags, ...keywordWithoutStopwords]
    })
    return tags
  }
  async function getTextFromWikipedia(topic, subtopic) {
    return await scrapper.getParagraphFromWikipedia(topic, subtopic)
  }

  function breakTextInSentences(content) {
    content.sentences = []

    const sentences = sentenceBoundaryDetection.sentences(content.sanitizedText)

    sentences.forEach((sentence) => {
      content.sentences.push({
        text: sentence,
        keywords: [],
        images: [],
      })
    })
  }

  async function fetchKeywordsOfAllSentences(content) {
    console.log('> [text-robot] Starting to fetch keywords from Watson')
    let tags = []

    for (const sentence of content.sentences) {
      console.log(`> [text-robot] Sentence: "${sentence.text}"`)

      sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text)

      tags = [...tags, ...getTagsByKeywords(sentence.keywords)]

      console.log(`> [text-robot] Keywords: ${sentence.keywords.join(', ')}\n`)
    }

    content.tags = tags
  }

  async function fetchWatsonAndReturnKeywords(sentence) {
    const analyzeParams = {
      text: sentence,
      features: {
        keywords: {},
      },
    }
    try {
      const analysisResults = await naturalLanguageUnderstanding.analyze(
        analyzeParams
      )

      const keywords = analysisResults.result.keywords.map((keyword) => {
        return keyword.text
      })
      return keywords
    } catch (e) {
      console.error('> [Erro]: ' + e)
      process.exit(1)
    }
  }

  function sanitizeText(sourceText) {
    //TODO: LIMPAR TEXTO
    return sourceText.replace(/\[\d+\]/g, '')
  }
}

module.exports = robot
