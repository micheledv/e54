import { Message } from 'node-telegram-bot-api'
import { RollingBuffer } from './utils'

export class SmartAddCollector {
  private readonly contexts = new Map<string, SmartAddContext>()

  constructor(private readonly bufferCapacity: number) {}

  private getContext(chat?: string) {
    if (!chat) return

    let context
    if (this.contexts.has(chat)) {
      context = this.contexts.get(chat)
    } else {
      context = new SmartAddContext(new RollingBuffer(this.bufferCapacity))
      this.contexts.set(chat, context)
    }

    return context
  }

  trackMessage(message: Message) {
    this.getContext(message.chat.title)?.trackMessage(message)
  }

  assembleQuoteContent(message: Message) {
    return this.getContext(message.chat.title)?.assembleQuoteContent(
      message.from?.username ?? message.from?.first_name
    )
  }
}

class SmartAddContext {
  private lastForwarder?: string

  constructor(private readonly forwardsBuffer: RollingBuffer<Message>) {}

  trackMessage(message: Message) {
    if (!message.forward_from) return

    const forwarder = message.from?.username ?? message.from?.first_name
    if (!forwarder) return

    if (forwarder !== this.lastForwarder) {
      this.lastForwarder = forwarder
      this.forwardsBuffer.flush()
    }

    this.forwardsBuffer.append(message)
  }

  assembleQuoteContent(author?: string) {
    if (!author || author !== this.lastForwarder) return

    const messages = this.forwardsBuffer.flush()
    return messages
      .map(message => `<@${message.from?.username}> ${message.text}`)
      .join(' ')
  }
}
