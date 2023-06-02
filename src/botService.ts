import TelegramBot, { Message } from 'node-telegram-bot-api'
import { formatQuote, formatQuoteInfo, formatSmartAdd } from './formatting'
import { Repo } from './repo'
import { pickRandom } from './utils'
import { SmartAddService } from './smartadd'

export interface BotService {
  handle(message: Message, context: string): void
}

export class QuoteInfo implements BotService {
  constructor(private readonly bot: TelegramBot, private readonly repo: Repo) {}

  handle(message: Message, context: string): void {
    const now = new Date()
    const id = Number(context)

    if (Number.isNaN(id)) {
      this.bot
        .sendMessage(message.chat.id, 'Invalid quote id')
        .catch(console.error)
    } else {
      const record = this.repo.get(id)
      if (record) {
        this.bot
          .sendMessage(message.chat.id, formatQuoteInfo(record, now))
          .catch(console.error)
      } else {
        this.bot
          .sendMessage(message.chat.id, `Quote #${context} not found`)
          .catch(console.error)
      }
    }
  }
}

export class QuoteById implements BotService {
  constructor(private readonly bot: TelegramBot, private readonly repo: Repo) {}

  handle(message: Message, context: string): void {
    const id = Number(context)
    if (Number.isNaN(id)) {
      this.bot
        .sendMessage(message.chat.id, 'Invalid quote id')
        .catch(console.error)
    } else {
      const record = this.repo.get(id)
      if (record) {
        this.bot
          .sendMessage(message.chat.id, formatQuote(record))
          .catch(console.error)
      } else {
        this.bot
          .sendMessage(message.chat.id, `Quote #${context} not found`)
          .catch(console.error)
      }
    }
  }
}

export class QuoteByRegExp implements BotService {
  constructor(private readonly bot: TelegramBot, private readonly repo: Repo) {}

  handle(message: Message, context: string): void {
    const regexp = new RegExp(context)
    const matchingRecords = this.repo.select(record =>
      regexp.test(record.content)
    )
    const record = pickRandom(matchingRecords)
    this.bot
      .sendMessage(message.chat.id, formatQuote(record))
      .catch(console.error)
  }
}

export class RandomQuote implements BotService {
  constructor(private readonly bot: TelegramBot, private readonly repo: Repo) {}

  handle(message: Message, context: string): void {
    const record = pickRandom(this.repo.getAll())
    this.bot
      .sendMessage(message.chat.id, formatQuote(record))
      .catch(console.error)
  }
}

export class SmartAdd implements BotService {
  constructor(
    private readonly bot: TelegramBot,
    private readonly repo: Repo,
    private readonly smartAddService: SmartAddService
  ) {}

  handle(message: Message, context: string): void {
    const content = this.smartAddService.assembleQuoteContent(message)
    if (!content) return

    const quote = {
      chat: message.chat.title as string,
      created: {
        by: message.from?.username as string,
        at: new Date(),
      },
      content,
    }
    const record = this.repo.add(quote)
    this.bot
      .sendMessage(message.chat.id, formatSmartAdd(record))
      .catch(console.error)
  }
}
