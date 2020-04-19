const state = require('./state')
const Instagram = require('instagram-private-api').IgApiClient
const { username, password } = require('../credentials/instagram.json')
const {
  promises: { readFile },
} = require('fs')
const getImage = require('request-promise').get

const igClient = new Instagram()

async function robot() {
  const content = state.load()

  await loginOnInstagram()
  await postImage(content)

  function buildCaption(content) {
    const { sanitizedText, tags } = content
    const tagsFormated = tags
      .map((tag) => {
        return `#${tag}`
      })
      .join(' ')

    const caption = sanitizedText + '\n\n' + tagsFormated

    console.log(caption)
    return caption
  }

  async function loginOnInstagram() {
    try {
      console.log('> [Post robot]: Loggin in on Instagram..')
      igClient.state.generateDevice(username)
      const loggedInUser = await igClient.account.login(username, password)
      console.dir(`> [Post robot]: Loggin success! ${loggedInUser}`)
    } catch (e) {
      console.log(`> [Erro]: ${e}`)
      process.exit(1)
    }
  }

  async function postImage(content) {
    const caption = buildCaption(content)
    try {
      console.log('> [Post robot]: Posting image on Instagram...')
      const { media } = await igClient.publish.photo({
        file: await getImage({
          url: content.selectedImage, // random picture with 800x800 size
          encoding: null, // this is required, only this way a Buffer is returned
        }),
        caption,
      })
      //console.log(`> [Post robot]: Upload successfull! ${media}`)
      //console.log(media)
      console.log(`https://www.instagram.com/p/${media.code}/`)
    } catch (e) {
      console.log(`> [Erro]: ${e}`)
      process.exit(1)
    }
  }
}

module.exports = robot
