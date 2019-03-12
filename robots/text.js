const sentenceBoundaryDetection = require('sbd')
const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algorithmia').ApiKey

function sanitizeContent(content) {
  const withoutBlankLinesAndMarkDown = removeBlankLinesAndMarkDown(content.sourceContentOriginal)
  const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkDown)

  content.sourceContentSanitized = withoutDatesInParentheses
}

function removeBlankLinesAndMarkDown(text) {
  const allLines = text.split('\n')
  const withoutBlankLinesAndMarkDown = allLines.filter(line => !(line.trim().length === 0 || line.trim().startsWith('=')) )

  return withoutBlankLinesAndMarkDown.join(' ')
}

function removeDatesInParentheses(text) {
  return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g, ' ')
}

function breakContentIntoSentences(content) {
  content.sentences = []

  const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
  sentences.forEach((sentence) => {
    content.sentences.push({
      text: sentence,
      keywords: [],
      images: []
    })
  })
}

async function fetchContentFromWikipedia(content) {
  const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
  const wikipediaAlgorithm = algorithmiaAuthenticated.algo("web/WikipediaParser/0.1.2?timeout=300")
  const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm)
  const wikipediaContent = wikipediaResponse.get()

  content.sourceContentOriginal = wikipediaContent.content
}

async function robot(content) {
  await fetchContentFromWikipedia(content)
  sanitizeContent(content)
  breakContentIntoSentences(content)
}

module.exports = robot