import TelegramBot, { Message } from 'node-telegram-bot-api'
import { formatQuote, formatQuoteInfo, formatSmartAdd } from './formatting'
import { LocalRepo } from './repo'
import { pickRandom } from './utils'
import { SmartAddCollector } from './smartadd'

export interface BotService {
  handle(message: Message, context: string): Promise<void>
}

export class QuoteInfoBotService implements BotService {
  constructor(
    private readonly bot: TelegramBot,
    private readonly repo: LocalRepo
  ) {}

  async handle(message: Message, context: string) {
    const now = new Date()
    const id = Number(context)

    if (Number.isNaN(id)) {
      this.bot
        .sendMessage(message.chat.id, 'Invalid quote id')
        .catch(console.error)
    } else {
      const record = await this.repo.get(id)
      if (record) {
        await this.bot.sendMessage(
          message.chat.id,
          formatQuoteInfo(record, now)
        )
      } else {
        await this.bot.sendMessage(
          message.chat.id,
          `Quote #${context} not found`
        )
      }
    }
  }
}

export class QuoteByIdBotService implements BotService {
  constructor(
    private readonly bot: TelegramBot,
    private readonly repo: LocalRepo
  ) {}

  async handle(message: Message, context: string) {
    const id = Number(context)
    if (Number.isNaN(id)) {
      await this.bot.sendMessage(message.chat.id, 'Invalid quote id')
    } else {
      const record = await this.repo.get(id)
      if (record) {
        await this.bot.sendMessage(message.chat.id, formatQuote(record))
      } else {
        await this.bot.sendMessage(
          message.chat.id,
          `Quote #${context} not found`
        )
      }
    }
  }
}

export class QuoteByRegExpBotService implements BotService {
  constructor(
    private readonly bot: TelegramBot,
    private readonly repo: LocalRepo
  ) {}

  async handle(message: Message, context: string) {
    const regexp = new RegExp(context, 'i')
    const matchingRecords = await this.repo.select(record =>
      regexp.test(record.content)
    )
    const record = pickRandom(matchingRecords)
    await this.bot.sendMessage(message.chat.id, formatQuote(record))
  }
}

export class RandomQuoteBotService implements BotService {
  constructor(
    private readonly bot: TelegramBot,
    private readonly repo: LocalRepo
  ) {}

  async handle(message: Message, context: string) {
    const record = pickRandom(await this.repo.getAll())
    await this.bot.sendMessage(message.chat.id, formatQuote(record))
  }
}

export class SmartAddBotService implements BotService {
  constructor(
    private readonly bot: TelegramBot,
    private readonly repo: LocalRepo,
    private readonly smartAddService: SmartAddCollector
  ) {}

  async handle(message: Message, context: string) {
    const content = this.smartAddService.assembleQuoteContent(message)
    if (!content) {
      await this.bot.sendMessage(message.chat.id, 'No quote to add')
      return
    }

    const quote = {
      chat: message.chat.title as string,
      created: {
        by: message.from?.username as string,
        at: new Date(),
      },
      content,
    }
    const record = await this.repo.add(quote)
    await this.bot.sendMessage(message.chat.id, formatSmartAdd(record))
  }
}
