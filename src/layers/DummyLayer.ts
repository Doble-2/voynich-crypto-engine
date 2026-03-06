import { IVoynichLayer } from '../core/interfaces';

export class DummyLayer implements IVoynichLayer {
  public encode(buffer: Uint8Array, seed: number): Uint8Array {
    const result = new Uint8Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
        result[i] = buffer[buffer.length - 1 - i];
    }
    return result;
  }

  public decode(buffer: Uint8Array, seed: number): Uint8Array {
    const result = new Uint8Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
        result[i] = buffer[buffer.length - 1 - i];
    }
    return result;
  }
}
