import moment from 'moment'
import { PersistedRecord } from './repo'

export const formatTime = (now: Date, date: Date) => {
  const relativeTime = moment(date).from(moment(now))
  const absoluteTime = moment(date).format('DD/MM/YYYY HH:mm')
  return `${relativeTime} (${absoluteTime})`
}

export const formatQuote = (quote: PersistedRecord<Quote>) => {
  return `Quote #${quote.id}: ${quote.content}`
}

export const formatQuoteInfo = (quote: PersistedRecord<Quote>, now: Date) => {
  const chunks = [`Quote #${quote.id} was added by ${quote.created.by}`]
  if (quote.created.at) {
    chunks.push(formatTime(now, quote.created.at))
  }
  if (quote.lastUpdated) {
    chunks.push(`and last updated`)
    if (quote.lastUpdated.by) {
      chunks.push(`by ${quote.lastUpdated.by}`)
    }
    chunks.push(formatTime(now, quote.lastUpdated.at))
  }
  chunks.push(`on ${quote.chat}`)
  return chunks.join(' ')
}

export const formatSmartAdd = (quote: PersistedRecord<Quote>) => {
  return `SmartAdd #${quote.id}: ${quote.content}`
}
