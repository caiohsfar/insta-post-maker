const readline = require('readline-sync')
const { apiKey, engineId } = require('../credentials/google-cs.json')
const { google } = require('googleapis')
const state = require('./state')

const customSearch = google.customsearch('v1')

async function robot() {
  const content = state.load()
  await getImagesForSentences(content)

  await askWhatImageToChoose(content)
  state.save(content)

  async function askWhatImageToChoose(content) {
    const images = content.sentences
      .filter((sentence) => {
        return sentence.images.length > 0
      })
      .map((sentence) => {
        return sentence.images[0]
      })

    const selectedImageIndex = readline.keyInSelect(
      images,
      '> [Input]: Qual imagem você escolhe?'
    )
    const imageUrl = images[selectedImageIndex]
    content.selectedImage = imageUrl
    if (selectedImageIndex === -1) return process.exit(0)
    console.log('Selected image index: ', selectedImageIndex)
  }

  async function getImagesForSentences(content) {
    const maxRelevanceIndex = 0
    for (
      let sentenceIndex = 0;
      sentenceIndex < content.sentences.length;
      sentenceIndex++
    ) {
      let query
      if (sentenceIndex === 0) {
        query = `${content.searchTerm}`
      } else {
        const keyword =
          content.sentences[sentenceIndex].keywords[maxRelevanceIndex]
        query = `${content.searchTerm} ${content.subTopic} ${keyword}`
      }

      console.log('> [image]: Finding image links for query: ' + query)
      const images = await fetchGoogleAndReturnImagesLinks({
        apiKey,
        engineId,
        query,
      })
      content.sentences[sentenceIndex].images = images
    }
  }

  async function fetchGoogleAndReturnImagesLinks(options) {
    try {
      const response = await customSearch.cse.list({
        auth: options.apiKey,
        cx: options.engineId,
        q: options.query,
        imgSize: "huge",
        searchType: 'image',
        num: 1,
      })

      const imagesUrl = response.data.items.map((item) => {
        return item.link
      })
      return imagesUrl
    } catch (e) {
      console.log(`[Erro]: ${e}. Continuing...`)
    }
  }
}

module.exports = robot
