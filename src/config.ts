export class Config {
  constructor(public readonly telegramBotToken: string) {}

  static loadFromEnv() {
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN
    if (!telegramBotToken) {
      throw new Error('TELEGRAM_BOT_TOKEN is not set')
    }

    return new Config(telegramBotToken)
  }
}
