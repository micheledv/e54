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
