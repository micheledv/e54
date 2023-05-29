import { PersistedRecord } from './repo'

export class QuoteDTO {
  static fromDomain(record: PersistedRecord<Quote>) {
    const data: any = structuredClone(record)
    if (data.created.at) {
      data.created.at = data.created.at.toISOString()
    }
    if (data.lastUpdated?.at) {
      data.lastUpdated.at = data.lastUpdated.at.toISOString()
    }
    return data
  }

  static toDomain(dto: any) {
    const data = structuredClone(dto)
    if (data.created.at) {
      data.created.at = new Date(data.created.at)
    }
    if (data.lastUpdated?.at) {
      data.lastUpdated.at = new Date(data.lastUpdated.at)
    }
    return data as PersistedRecord<Quote>
  }
}
