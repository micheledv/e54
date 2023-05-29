type Quote = {
  chat: string
  created: {
    at?: Date
    by: string
  }
  lastUpdated?: {
    at: Date
    by?: string
  }
  content: string
}
