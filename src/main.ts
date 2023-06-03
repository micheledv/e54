import TelegramBot, { Message } from 'node-telegram-bot-api'
import { Repo } from './repo'
import { SmartAddService } from './smartadd'
import dotenv from 'dotenv'
import { Config } from './config'
import {
  BotServiceBinding,
  bindWithPrefix,
  runBindings,
} from './botServiceBinding'
import * as botService from './botService'

dotenv.config()

const config = Config.loadFromEnv()
const bot = new TelegramBot(config.telegramBotToken, { polling: true })
const repo = Repo.load('quotes.yaml')
const smartAddService = new SmartAddService(20)

const handler = (bindings: BotServiceBinding[]) => {
  return (message: Message) => {
    console.log(message)

    const anyBindingMatched = runBindings(bindings, message)
    if (anyBindingMatched) return

    smartAddService.trackMessage(message)
  }
}

bot.on(
  'text',
  handler([
    bindWithPrefix('!qi', new botService.QuoteInfo(bot, repo)),
    bindWithPrefix('!qn', new botService.QuoteById(bot, repo)),
    bindWithPrefix('!qr', new botService.QuoteByRegExp(bot, repo)),
    bindWithPrefix('!q', new botService.RandomQuote(bot, repo)),
    bindWithPrefix('!sa', new botService.SmartAdd(bot, repo, smartAddService)),
  ])
)
