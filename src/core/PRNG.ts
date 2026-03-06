export class PRNG {
  private state: number;

  constructor(seed: number | string) {
    if (typeof seed === 'string') {
      this.state = this.hashString(seed);
    } else {
      this.state = seed;
    }
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
    }
    return hash;
  }

  public next(): number {
    let t = this.state += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  public nextByte(): number {
    return Math.floor(this.next() * 256);
  }

  public nextFloat(): number {
    return this.next();
  }
}
