import * as crypto from 'node:crypto'
import { Buffer } from 'node:buffer';
import Scrambler from '../../utils/scrambler';
import { BaseEncryptor } from '../../utils/encryptor';

const alg = 'aes-128-cbc';

interface config {
  password: string
  secret: string
}

export default class AES128<T = any> extends BaseEncryptor<T> {
  #scrambler = new Scrambler()
  constructor(password: string, secret: string) {
    super(password, secret)
  }

  static construct<Y>(config: config) {
    return new AES128<Y>(config.password, config.secret);
  }

  getKeys(password: string) {
    const hash = crypto.createHash('sha256').update(password).digest();
    const key = Buffer.from(hash.subarray(0, 16));
    return {key};
  }

  getIV(data: Buffer) {
    const hash = crypto.createHash('sha256').update(data).digest();
    return Buffer.from(hash.subarray(0, 16));
  }

  #getSignature(data: Buffer) {
    const hmac = crypto.createHmac('sha256', this.secret);
    return hmac.update(data).digest();
  }

  compareSignature(data: Buffer, hash: Buffer) {
    const hmac = crypto.createHmac('sha256', this.secret);
    const signature = hmac.update(data).digest();
    return crypto.timingSafeEqual(hash, signature);
  }

  encrypt(data: T): string {
    const dataBuffer = Buffer.from(JSON.stringify(data), 'utf8');
    const iv = this.getIV(dataBuffer);
    const cipher = crypto.createCipheriv(alg, this.key, iv);
    const encryptedData = Buffer.concat([cipher.update(dataBuffer), cipher.final()]);
    const signature = this.#getSignature(encryptedData).toString('hex');
    const payload = Buffer.concat([iv, encryptedData]).toString('hex');
    const scrambled = this.#scrambler.run(payload);
    return `${scrambled}.${signature}`;
  }

  decrypt(data: string): T | undefined {
    const [scrambled, signature] = data.split('.');
    const payload = this.#scrambler.run(scrambled);
    const dataBuffer = Buffer.from(payload, 'hex');
    const iv = Buffer.from(dataBuffer.subarray(0, 16)); // Extrair IV
    const encryptedData = Buffer.from(dataBuffer.subarray(16)); // Copiar dados criptografados
    const signBuffer = Buffer.from(signature, 'hex');

    // Verificar a assinatura
    const compareSignature = this.compareSignature(encryptedData, signBuffer);
    if (!compareSignature) {
      throw new Error('Invalid signature. Data may have been tampered with.');
    }

    const decipher = crypto.createDecipheriv(alg, this.key, iv);
    const decryptedData = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
    return JSON.parse(decryptedData.toString('utf8'));
  }

  assign(data: T): string | undefined {
    return data as string;
  }
}
