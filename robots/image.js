const readline = require('readline-sync')
const { apiKey, engineId } = require('../credentials/google-cs.json')
const { google } = require('googleapis')
const state = require('./state')

const customSearch = google.customsearch('v1')

async function robot() {
  const content = state.load()
  await getImagesForSentences(content)

  askWhatImageToChoose(content)
  state.save(content)

  function askWhatImageToChoose(content) {
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

    content.selectedImage = images[selectedImageIndex]
    console.log('Selected image: ', images[selectedImageIndex])
  }

  async function getImagesForSentences(content) {
    const maxRelevanceIndex = 0

    for (let index = 0; index < content.sentences.length; index++) {
      const query = `${content.searchTerm} ${content.sentences[index].keywords[maxRelevanceIndex]}`
      console.log('> [image]: Finding image links for query: ' + query)
      try {
        const images = await fetchGoogleAndReturnImagesLinks({
          apiKey,
          engineId,
          query,
        })
        content.sentences[index].images = images
      } catch (e) {
        console.log('[Erro]: ' + e + ' continuing...')
        continue
      }
    }
  }

  async function fetchGoogleAndReturnImagesLinks(options) {
    const response = await customSearch.cse.list({
      auth: options.apiKey,
      cx: options.engineId,
      q: options.query,
      searchType: 'image',
      num: 1,
    })

    const imagesUrl = response.data.items.map((item) => {
      return item.link
    })

    return imagesUrl
  }
}

module.exports = robot
