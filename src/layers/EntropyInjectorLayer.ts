import { IVoynichLayer } from '../core/interfaces';
import { PRNG } from '../core/PRNG';

export interface EntropyInjectorConfig {
  seed: string;
  noiseRatio: number;
}

export class EntropyInjectorLayer implements IVoynichLayer {
  private config: EntropyInjectorConfig;

  constructor(config: EntropyInjectorConfig) {
    if (config.noiseRatio < 0 || config.noiseRatio >= 1) {
      throw new Error('EntropyInjectorLayer: noiseRatio debe estar entre 0 (0%) y 0.99 (99%).');
    }
    this.config = config;
  }

  public encode(buffer: Uint8Array, engineSeed: number): Uint8Array {
    const prng = new PRNG(this.config.seed);
    const result: number[] = [];

    for (let i = 0; i < buffer.length; i++) {
        while (prng.nextFloat() < this.config.noiseRatio) {
            result.push(prng.nextByte());
        }
        result.push(buffer[i]);
    }

    return new Uint8Array(result);
  }

  public decode(buffer: Uint8Array, engineSeed: number): Uint8Array {
    const prng = new PRNG(this.config.seed);
    const result: number[] = [];

    let i = 0;
    while (i < buffer.length) {
        if (prng.nextFloat() < this.config.noiseRatio) {
            prng.nextByte();
            i++;
        } else {
            result.push(buffer[i]);
            i++;
        }
    }

    return new Uint8Array(result);
  }
}
