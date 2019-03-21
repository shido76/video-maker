const sentenceBoundaryDetection = require('sbd')
const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algorithmia').ApiKey

const watsonApiKey = require('../credentials/watson-nlu').apikey
var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js')
var nlu = new NaturalLanguageUnderstandingV1({
  iam_apikey: watsonApiKey,
  version: '2018-04-05',
  url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
})

function sanitizeContent(content) {
  const withoutBlankLinesAndMarkDown = removeBlankLinesAndMarkDown(content.sourceContentOriginal)
  const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkDown)

  content.sourceContentSanitized = withoutDatesInParentheses
}

function limitMaximumSentences(content) {
  content.sentences = content.sentences.slice(0, content.maximumSentences)
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

async function fetchWatsonAndReturnKeywords(sentence) {
  return new Promise((resolve, reject) => {
    nlu.analyze({
      text: sentence,
      features: {
        keywords: {}
      }
    }, (error, response) => {
      if (error) {
        throw error
      }

      const keywords = response.keywords.map(keyword => {
        return keyword.text
      }) 

      resolve(keywords)
    })
  })
}

async function fetchKeyWordsFromAllSentences(content) {
  for (const sentence of content.sentences) {
    sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text)
  }
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
  limitMaximumSentences(content)
  await fetchKeyWordsFromAllSentences(content)
}

module.exports = robot