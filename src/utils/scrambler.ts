interface ScramblerRun {
    start?: number
    end: number
    qtd?: number
  }
  
  export default class Scrambler {
    #isPrime(num: number) {
      for (let i = 2; i < num; i++) {
        if (num % i === 0) return false;
      }
      return num > 2;
    }
  
    run(data: string) {
      const p = this.scramble({
        end: data.length / 2
      })
  
      const response = this.swap(data, p[1], p[0])
      return response
    }
  
    scramble({ start = 0, end, qtd }: ScramblerRun) {
      const primes = [];
      for (let i = start; i <= end; i++) {
        if (this.#isPrime(i)) {
          primes.push(i);
        }
      }
  
      if (!qtd) return primes
  
      if (primes.length < qtd) {
        throw new Error('Não há primos suficientes no intervalo especificado.');
      }
  
      const finalList = []
      for (let i = primes.length - 1; finalList.length < qtd; i--) {
        finalList.unshift(primes[i])
      }
  
      return finalList;
    }
  
    swap(str: string, x: number, y: number) {
      if (y >= x) {
        throw new Error('O valor de y deve ser menor que x.');
      }
  
      let result = '';
      for (let i = 0; i < str.length; i += x) {
        // Extrair o segmento atual de x caracteres
        let segment = str.substring(i, Math.min(i + x, str.length));
  
        if (segment.length === x) {
          // Trocar a y-ésima letra pela x-ésima e vice-versa
          let swappedSegment = segment.substring(0, y - 1) +
            segment.charAt(x - 1) +
            segment.substring(y, x - 1) +
            segment.charAt(y - 1) +
            segment.substring(x);
          result += swappedSegment;
        } else {
          // Se o segmento for menor que x, simplesmente adicionar ao resultado
          result += segment;
        }
      }
  
      return result;
    }
  }