import { IVoynichLayer, IFormatter, EngineConfig } from './interfaces';

export class VoynichEngine {
  private layers: IVoynichLayer[] = [];
  private formatter: IFormatter | null = null;
  private config: EngineConfig;

  constructor(config: EngineConfig) {
    this.config = config;
  }

  public use(layer: IVoynichLayer): this {
    this.layers.push(layer);
    return this;
  }

  public setFormatter(formatter: IFormatter): this {
    this.formatter = formatter;
    return this;
  }

  public encode(input: Uint8Array): string {
    if (!this.formatter) {
      throw new Error('VoynichEngine: Un Formatter es requerido para producir la salida final.');
    }

    let currentBuffer = input;
    
    for (const layer of this.layers) {
      currentBuffer = layer.encode(currentBuffer, this.config.seed);
    }

    return this.formatter.encode(currentBuffer);
  }

  public decode(input: string): Uint8Array {
    if (!this.formatter) {
      throw new Error('VoynichEngine: Un Formatter es requerido para procesar la entrada.');
    }

    let currentBuffer = this.formatter.decode(input);

    for (let i = this.layers.length - 1; i >= 0; i--) {
      currentBuffer = this.layers[i].decode(currentBuffer, this.config.seed);
    }

    return currentBuffer;
  }
}
