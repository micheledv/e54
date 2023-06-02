import { Message } from 'node-telegram-bot-api'
import { BotService } from './botService'

export type BotServiceBinding = (message: Message) => boolean

export const bindWithPrefix = (
  prefix: string,
  service: BotService
): BotServiceBinding => {
  return (message: Message) => {
    const { text } = message
    if (!text) return false

    const index = text.indexOf(prefix)
    if (index === -1) return false

    const context = text.slice(index + prefix.length + 1).trim()
    service.handle(message, context)

    return true
  }
}

export const runBindings = (
  bindings: BotServiceBinding[],
  message: Message
) => {
  for (const binding of bindings) {
    if (binding(message)) return true
  }
  return false
}
