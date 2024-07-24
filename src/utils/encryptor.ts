export abstract class BaseEncryptor<T> {
    protected key: Buffer;
    protected iv: Buffer;
    constructor (password: string, protected secret: string) {
        const { key, iv } = this.getKeys(password);
        this.key = key;
        if (iv) this.iv = iv;
    }

    abstract getKeys(password: string): { key: Buffer, iv?: Buffer }
    
    // abstract getIV?(data: Buffer): { iv: Buffer }

    abstract encrypt(data: T): string

    abstract decrypt<E = T>(data: string): E | T | undefined

    abstract assign(data: T): string | undefined
}

interface decrypted<T> {
    signature: string
    data: T & {
        exp?: number
    }
  }
  
export default class EncryptEngine<T extends object> {
    private exp?: Date
    private rules: Map<string, BaseEncryptor<any>>
    constructor() {
      this.rules = new Map()
    }
  
    async addRule(name: string, rule: BaseEncryptor<any>) {
      if (this.rules.has(name)) throw new Error('Rule name alread exists.')
  
      this.rules.set(name, rule)
  
      return true
    }
  
    async removeRule(name: string) {
      if (!this.rules.has(name)) throw new Error('Rule name not exists.')
  
      return this.rules.delete(name)
    }
  
    async getRule(name: string): Promise<BaseEncryptor<any>> {
      if (!this.rules.has(name)) throw new Error('Rule name not exists.')
  
      return this.rules.get(name)!
    }
  
    async encrypt(data: object): Promise<string> {
      let response
  
      for (const [name, rule] of Array.from(this.rules)) {
        response = rule.encrypt(response || JSON.stringify({...data, exp: this.exp?.getTime()}))
      }
  
      return response as string
    }
  
    async decrypt(data: string): Promise<decrypted<T>> {
      let response = data
  
      for (const [name, rule] of Array.from(this.rules).reverse()) {
        response = rule.decrypt<T>(response)
      }
  
      return {
        data: JSON.parse(response),
        signature: '1'
      }
    }
  
    async addExpDate(date: Date) {
      this.exp = date
    }
}