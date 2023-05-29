import { readFileSync, writeFileSync } from 'fs'
import { parse, stringify } from 'yaml'
import { QuoteDTO } from './dto'

export type PersistedRecord<T> = { id: number } & T

export class Repo {
  indexedData: Map<number, PersistedRecord<Quote>>
  nextId: number

  constructor(private filepath: string, data: Array<PersistedRecord<Quote>>) {
    this.indexedData = data.reduce((acc, record) => {
      acc.set(record.id, record)
      return acc
    }, new Map<number, PersistedRecord<Quote>>())
    this.nextId = Math.max.apply(null, Array.from(this.indexedData.keys())) + 1
  }

  static load(filepath: string) {
    const fileContent = readFileSync(filepath, 'utf8')
    const records = parse(fileContent).map((record: any) => {
      return QuoteDTO.toDomain(record)
    })
    return new Repo(filepath, records)
  }

  save() {
    const serializedData = stringify(this.getAll().map(QuoteDTO.fromDomain))
    writeFileSync(this.filepath, serializedData)
  }

  get(id: number) {
    return this.indexedData.get(id)
  }

  getAll() {
    return Array.from(this.indexedData.values())
  }

  select(predicate: (quote: PersistedRecord<Quote>) => boolean) {
    return this.getAll().filter(predicate)
  }

  add(quote: Quote) {
    const record = { id: this.nextId, ...quote }
    this.indexedData.set(record.id, record)
    this.nextId++
    this.save()
    return record
  }

  delete(id: number) {
    const record = this.indexedData.get(id)
    this.indexedData.delete(id)
    this.save()
    return record
  }

  update(id: number, quote: Quote, editor: string) {
    const record = this.indexedData.get(id)
    if (record) {
      const lastUpdated = { by: editor, at: new Date() }
      this.indexedData.set(id, { ...record, ...quote, lastUpdated })
      this.save()
    }
    return this.indexedData.get(id)
  }

  silkUpdate(id: number, quote: Quote) {
    const record = this.indexedData.get(id)
    if (record) {
      this.indexedData.set(id, { ...record, ...quote })
      this.save()
    }
    return this.indexedData.get(id)
  }
}
