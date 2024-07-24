import * as crypto from 'node:crypto'
import { Buffer } from 'node:buffer';
import Scrambler from '../../utils/scrambler';
import { BaseEncryptor } from '../../utils/encryptor';

const alg = 'aes-256-ctr';

interface config {
    password: string
    secret: string
  }
  

export default class AES256<T = any> extends BaseEncryptor<T> {
    #scrambler = new Scrambler() 
    constructor(password: string, secret: string) {
      super(password, secret)
    }
  
    static construct<Y>(config: config) {
      return new AES256<Y>(config.password, config.secret);
    }
  
    getKeys(password: string) {
      const hash = crypto.createHash('sha512').update(password).digest();
      const key = Buffer.from(hash.subarray(0, 32));
      const iv = crypto.randomBytes(16); // Gerar IV aleatório
      return {key, iv };
    }
  
    #getSignature(data: Buffer) {
      const hmac = crypto.createHmac('sha256', this.secret);
      const signature = Buffer.from(hmac.update(data).digest());
      const iat = Buffer.from(Math.floor(new Date().getTime() / 1000).toString())
      return Buffer.concat([iat, signature])
    }
  
    compareSignature(data: Buffer, hash: Buffer) {
      const hmac = crypto.createHmac('sha256', this.secret);
      const signature = Buffer.from(hmac.update(data).digest());
      return crypto.timingSafeEqual(hash, signature);
    }
  
    encrypt(data: T): string {
      const cipher = crypto.createCipheriv(alg, this.key, this.iv);
      const encryptedData = Buffer.concat([cipher.update(JSON.stringify(data), 'utf8'), cipher.final()]);
      const signature = this.#getSignature(encryptedData).toString('hex');
      const payload = Buffer.concat([this.iv, encryptedData]).toString('hex');
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
      const iat = parseInt(Buffer.from(signBuffer.subarray(0, 10)).toString());
      const sign = Buffer.from(signBuffer.subarray(10));
  
      const date = new Date(iat * 1000);
  
      // Verificar a assinatura
      const compareSignature = this.compareSignature(encryptedData, sign);
      if (!compareSignature) {
        throw new Error('Invalid signature. Data may have been tampered with.');
      }
  
      const decipher = crypto.createDecipheriv(alg, this.key, iv);
      const decryptedData = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
      return JSON.parse(decryptedData.toString('utf8'));
    }
  
    assign(data: T): string | undefined {
      return data as string
    }
  }