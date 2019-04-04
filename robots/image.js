const google = require('googleapis').google
const customSearch = google.customsearch('v1')
const googleSearchCredentials = require('../credentials/google-search.json')

const state = require('./state')

async function fetchImagesFromAllSentences(content) {
  for (const sentence of content.sentences) {
    const query = `${content.searchTerm} ${sentence.keywords[0]}`
    sentence.images = await fetchGoogleAndReturnImageLinks(query)
    sentence.googleSearchQuery = query
  }
}

async function fetchGoogleAndReturnImageLinks(query) {
  const response = await customSearch.cse.list({
    auth: googleSearchCredentials.ApiKey,
    cx: googleSearchCredentials.SearchEngineId,
    q: query,
    searchType: 'image',
    //imgSize: 'huge',
    num: 2
  })

  const imagesUrl = response.data.items.map(item => { return item.link })
  return imagesUrl
}

async function robot() {
  const content = state.load()
  
  await fetchImagesFromAllSentences(content)
  state.save(content)

}

module.exports = robot