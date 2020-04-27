// getSubtopicsFromWikipedia(searchTerm)
const chrome = require('selenium-webdriver/chrome')
const { Builder, By, until } = require('selenium-webdriver')

function scrapper() {
  WAIT_TIMEOUT = 20000
  WIKIPEDIA_URL = 'https://pt.wikipedia.org/wiki/'

  const serviceBuilder = new chrome.ServiceBuilder(
    './webdriver/chromedriver.exe'
  ).loggingTo("./webdriver/chromedriver.log")


  const driver = new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options().headless())
    .setChromeService(serviceBuilder)
    .build()

  async function getElementByXpath(xPath) {
    return await driver.wait(
      until.elementLocated(By.xpath(xPath)),
      WAIT_TIMEOUT
    )
  }

  async function getParagraphFromWikipedia(topic, subtopic) {
    if (topic === undefined || subtopic === undefined) return process.exit(0)
    try {
      console.log(
        `> [Scrapper]: Getting text for term "${topic}" and topic "${subtopic}" on Wikipedia...`
      )

      await driver.get(WIKIPEDIA_URL + topic)

      const spanId = subtopic.replace(/ /g, '_')
      const xPath = `//*[@id='${spanId}']/../following-sibling::p`

      const paragraphElement = await getElementByXpath(xPath)
      const sourceText = await paragraphElement.getText()

      return sourceText
    } catch (e) {
      console.error('> [Erro]: ' + e)
      process.exit(1)
    }
  }

  async function getSubtopicsFromWikipedia(searchTerm) {
    // TODO: HANDLE ERRORS
    console.log(
      `> [Scrapper]: Getting subtopics for term "${searchTerm}" on Wikipedia...`
    )

    try {
      await driver.get(
        `https://pt.wikipedia.org/w/index.php?title=${searchTerm}&action=edit`
      )

      const sourceText = await driver
        .findElement(By.id('wpTextbox1'))
        .getText()

      const splitedText = sourceText.split('\n')

      const subtopics = splitedText
        .filter((value) => value.includes('==='))
        .map((value) => value.replace(/===/g, '').trim())

      return subtopics
    } catch (e) {
      console.error('> [Erro]: ' + e)
      process.exit(1)
    }
  }

  async function quitDriver() {
    (await driver).quit()
  }

  return {
    getSubtopicsFromWikipedia,
    getParagraphFromWikipedia,
    quitDriver
  }
}

module.exports = scrapper
