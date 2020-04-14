// getSubtopicsFromWikipedia(searchTerm)
const chrome = require('selenium-webdriver/chrome')
const { Builder, By, until } = require('selenium-webdriver')

class Scrapper {
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
    return await this.driver.wait(until.elementLocated(By.id(id)))
  }

  async getSubtopicsFromWikipedia(searchTerm) {
    console.log(
      `> [Scrapper]: Getting subtopics for term "${searchTerm}" on Wikipedia...`
    )

    try {
      const url = `https://pt.wikipedia.org/wiki/${searchTerm}`
      await this.driver.get(url)
      // TODO: GET INDICE


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
    } finally {
      await this.driver.quit()
    }
  }
}

module.exports = Scrapper
