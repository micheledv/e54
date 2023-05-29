import TelegramBot, { Message } from 'node-telegram-bot-api'
import { Repo } from './repo'
import { formatQuote, formatQuoteInfo, formatSmartAdd } from './formatting'
import { SmartAddService } from './smartadd'
import { pickRandom } from './utils'
import dotenv from 'dotenv'
import { Config } from './config'

dotenv.config()

const config = Config.loadFromEnv()
const bot = new TelegramBot(config.telegramBotToken, { polling: true })
const repo = Repo.load('quotes.yaml')
const smartAddService = new SmartAddService(20)

const paramsForCommand = (text: string, command: string) => {
  const index = text.indexOf(command)
  if (index === -1) return null
  return text.slice(index + command.length + 1).trim()
}

const handleQuotes = (message: Message) => {
  const { text } = message
  if (!text) return

  let params

  params = paramsForCommand(text, '!qi')
  if (params != null) {
    const now = new Date()
    const id = Number(params)
    if (Number.isNaN(id)) {
      bot.sendMessage(message.chat.id, 'Invalid quote id').catch(console.error)
    } else {
      const record = repo.get(id)
      if (record) {
        bot
          .sendMessage(message.chat.id, formatQuoteInfo(record, now))
          .catch(console.error)
      } else {
        bot
          .sendMessage(message.chat.id, `Quote #${params} not found`)
          .catch(console.error)
      }
    }
    return
  }

  params = paramsForCommand(text, '!qn')
  if (params != null) {
    const id = Number(params)
    if (Number.isNaN(id)) {
      bot.sendMessage(message.chat.id, 'Invalid quote id').catch(console.error)
    } else {
      const record = repo.get(id)
      if (record) {
        bot
          .sendMessage(message.chat.id, formatQuote(record))
          .catch(console.error)
      } else {
        bot
          .sendMessage(message.chat.id, `Quote #${params} not found`)
          .catch(console.error)
      }
    }
    return
  }

  params = paramsForCommand(text, '!qr')
  if (params != null) {
    const regexp = new RegExp(params)
    const matchingRecords = repo.select(record => regexp.test(record.content))
    const record = pickRandom(matchingRecords)
    bot.sendMessage(message.chat.id, formatQuote(record)).catch(console.error)
    return
  }

  params = paramsForCommand(text, '!q')
  if (params != null) {
    const record = pickRandom(repo.getAll())
    bot.sendMessage(message.chat.id, formatQuote(record)).catch(console.error)
    return
  }

  params = paramsForCommand(text, '!sa')
  if (params != null) {
    const content = smartAddService.assembleQuoteContent(message)
    if (!content) return

    const quote = {
      chat: message.chat.title as string,
      created: {
        by: message.from?.username as string,
        at: new Date(),
      },
      content,
    }
    const record = repo.add(quote)
    bot
      .sendMessage(message.chat.id, formatSmartAdd(record))
      .catch(console.error)

    return
  }

  smartAddService.trackMessage(message)

  console.log(message)
}

bot.on('text', handleQuotes)
