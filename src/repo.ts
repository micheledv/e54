import { readFileSync, writeFileSync } from 'fs'
import { parse, stringify } from 'yaml'
import { QuoteDTO } from './dto'

export type PersistedRecord<T> = { id: number } & T

export interface Repo {
  get(id: number): Promise<PersistedRecord<Quote> | undefined>
  getAll(): Promise<Array<PersistedRecord<Quote>>>
  select(
    predicate: (quote: PersistedRecord<Quote>) => boolean
  ): Promise<Array<PersistedRecord<Quote>>>
  add(quote: Quote): Promise<PersistedRecord<Quote>>
  delete(id: number): Promise<PersistedRecord<Quote> | undefined>
  update(
    id: number,
    quote: Quote,
    editor: string
  ): Promise<PersistedRecord<Quote> | undefined>
  silkUpdate(
    id: number,
    quote: Quote
  ): Promise<PersistedRecord<Quote> | undefined>
}

export class LocalRepo implements Repo {
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
    return new LocalRepo(filepath, records)
  }

  async save() {
    const allQuotes = await this.getAll()
    const serializedData = stringify(allQuotes.map(QuoteDTO.fromDomain))
    writeFileSync(this.filepath, serializedData)
  }

  async get(id: number) {
    return this.indexedData.get(id)
  }

  async getAll() {
    return Array.from(this.indexedData.values())
  }

  async select(predicate: (quote: PersistedRecord<Quote>) => boolean) {
    const allQuotes = await this.getAll()
    return allQuotes.filter(predicate)
  }

  async add(quote: Quote) {
    const record = { id: this.nextId, ...quote }
    this.indexedData.set(record.id, record)
    this.nextId++
    await this.save()
    return record
  }

  async delete(id: number) {
    const record = this.indexedData.get(id)
    this.indexedData.delete(id)
    await this.save()
    return record
  }

  async update(id: number, quote: Quote, editor: string) {
    const record = this.indexedData.get(id)
    if (record) {
      const lastUpdated = { by: editor, at: new Date() }
      this.indexedData.set(id, { ...record, ...quote, lastUpdated })
      await this.save()
    }
    return this.indexedData.get(id)
  }

  async silkUpdate(id: number, quote: Quote) {
    const record = this.indexedData.get(id)
    if (record) {
      this.indexedData.set(id, { ...record, ...quote })
      await this.save()
    }
    return this.indexedData.get(id)
  }
}
