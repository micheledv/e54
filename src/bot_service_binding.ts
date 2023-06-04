import { Message } from 'node-telegram-bot-api'
import { BotService } from './bot_service'

export type BotServiceBinding = (message: Message) => Promise<boolean>

export const bindWithPrefix = (
  prefix: string,
  service: BotService
): BotServiceBinding => {
  return async (message: Message) => {
    const { text } = message
    if (!text) return false
    if (!text.startsWith(prefix)) return false

    const context = text.slice(prefix.length + 1).trim()
    await service.handle(message, context)

    return true
  }
}

export const runBindings = async (
  bindings: BotServiceBinding[],
  message: Message
) => {
  for (const binding of bindings) {
    if (await binding(message)) return true
  }
  return false
}
