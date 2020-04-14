// getSubtopicsFromWikipedia(searchTerm)
const chrome = require('selenium-webdriver/chrome')
const { Builder, By, until } = require('selenium-webdriver')

class Scrapper {
  WAIT_TIMEOUT = 20000
  WIKIPEDIA_URL = 'https://pt.wikipedia.org/wiki/'

  constructor() {
    const serviceBuilder = new chrome.ServiceBuilder(
      './webdriver/chromedriver.exe'
    )

    this.driver = new Builder()
      .forBrowser('chrome')
      .setChromeOptions(new chrome.Options().headless())
      .setChromeService(serviceBuilder)
      .build()
  }

  async getElementById(id) {
    return await this.driver.wait(
      until.elementLocated(By.id(id)),
      this.WAIT_TIMEOUT
    )
  }

  async getElementByXpath(xPath) {
    return await this.driver.wait(
      until.elementLocated(By.xpath(xPath)),
      this.WAIT_TIMEOUT
    )
  }

  async getParagraph(topic, subtopic) {
    try {
      await this.driver.get(this.WIKIPEDIA_URL + topic)

      const spanId = subtopic.replace(/ /, '_')
      const xPath = `//*[@id='${spanId}']/../following-sibling::p`

      const paragraphElement = await this.getElementByXpath(xPath)
      const sourceText = await paragraphElement.getText()

      return sourceText
    } catch (e) {
      console.error('> [Erro]: ' + e)
      process.exit(1)
    } finally {
      await this.driver.quit()
    }
  }

  async getSubtopicsFromWikipedia(searchTerm) {
    // TODO: HANDLE ERRORS
    console.log(
      `> [Scrapper]: Getting subtopics for term "${searchTerm}" on Wikipedia...`
    )

    try {
      const url = this.WIKIPEDIA_URL + searchTerm
      await this.driver.get(url)

      const linkLi = await this.getElementById('ca-viewsource')
      await linkLi.findElement(By.tagName('a')).click()

      const sourceText = await this.driver
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
    } finally {
      await this.driver.quit()
    }
  }
}

module.exports = Scrapper
