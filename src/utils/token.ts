import * as crypto from 'node:crypto'
import EncryptEngine from './encryptor'
import AES256 from '../secure/keys/AES256.enc'

enum dateTypes {
  ms='ms',
  sec='sec',
  min='min',
  h='h',
  d='d',
  sem='sem',
  m='m',
  y='y'
}

const conversionDT = {
  ms: 1,
  sec: 1000,
  min: 60000,
  h: 3.6e+6,
  d: 8.64e+7,
  sem: 6.048e+8,
  m: 2.628e+9,
  y: 3.154e+10
}

interface config {
  password: string
  secret: string
  expiration?: `${number}${dateTypes}`
}

interface UserData {
  name: string
  email: string
  username?: string
}

export default class TokenHelper {
  #worker = new EncryptEngine<UserData>()
  #expiration?: `${number}${dateTypes}`
  constructor(config: config) {
    this.#worker.addRule('AES256', new AES256(config.password, config.secret))
    this.#expiration = config.expiration
  }

  async generate(userData: UserData): Promise<string> {
    const subjective = await this.subjective(userData)
    if (this.#expiration) {
        const now = Date.now()
        const [time, datetime] = this.#expiration.replace(/(\d+)(\D+)/g, '$1::$2').split('::');
        const exp = now + (Number(time) * conversionDT[datetime as dateTypes])
        this.#worker.addExpDate(new Date(exp))
    }
    return this.#worker.encrypt({
      ...userData,
      sub: subjective
    })
  }

  async test(token: string) {
    const { data } = await this.#worker.decrypt(token)
    const now = new Date()
    if (data.exp && data.exp < now.getTime()) {
        throw new Error('Token expirated')
    }
    return data
  }

  private async subjective(data: UserData) {
     const unixTime = Math.floor(new Date().getTime() / 100)
    const hmac = crypto.createHmac('ripemd160', Object.keys(data).join(':'))
    const sub = hmac.update(JSON.stringify({...data, ts: unixTime}), 'utf8').digest('hex');
    return sub;
  }

  async decrypt(token: string) {
    const { data } = await this.#worker.decrypt(token)
    return data
  }
}