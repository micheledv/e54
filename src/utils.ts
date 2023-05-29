export const pickRandom = <T>(array: Array<T>) => {
  const randomIndex = Math.floor(Math.random() * array.length)
  return array[randomIndex]
}

export class RollingBuffer<T> {
  private readonly capacity: number
  private readonly array: Array<T>

  constructor(capacity: number) {
    this.capacity = capacity
    this.array = []
  }

  append(value: T) {
    if (this.array.length >= this.capacity) {
      this.array.shift()
    }
    this.array.push(value)
  }

  flush() {
    const content = this.array.slice()
    this.array.length = 0
    return content
  }
}
