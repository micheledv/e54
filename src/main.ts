import TelegramBot, { Message } from 'node-telegram-bot-api'
import { LocalRepo } from './repo'
import { SmartAddCollector } from './smartadd'
import dotenv from 'dotenv'
import { Config } from './config'
import {
  BotServiceBinding,
  bindWithPrefix,
  runBindings,
} from './bot_service_binding'
import {
  QuoteByIdBotService,
  QuoteByRegExpBotService,
  QuoteInfoBotService,
  RandomQuoteBotService,
  SmartAddBotService,
} from './bot_service'

dotenv.config()

const config = Config.loadFromEnv()
const bot = new TelegramBot(config.telegramBotToken, { polling: true })
const repo = LocalRepo.load('quotes.yaml')
const smartAddService = new SmartAddCollector(20)

const handler = (bindings: BotServiceBinding[]) => {
  return async (message: Message) => {
    console.log(message)

    const anyBindingMatched = await runBindings(bindings, message)
    if (anyBindingMatched) return

    smartAddService.trackMessage(message)
  }
}

bot.on(
  'text',
  handler([
    bindWithPrefix('!qi', new QuoteInfoBotService(bot, repo)),
    bindWithPrefix('!qn', new QuoteByIdBotService(bot, repo)),
    bindWithPrefix('!qr', new QuoteByRegExpBotService(bot, repo)),
    bindWithPrefix('!q', new RandomQuoteBotService(bot, repo)),
    bindWithPrefix('!sa', new SmartAddBotService(bot, repo, smartAddService)),
  ])
)
