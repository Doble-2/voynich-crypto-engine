import { PRNG } from '../src/core/PRNG';

describe('PRNG (Pseudo-Random Number Generator)', () => {
  it('debe generar exactamente la misma secuencia de números para la misma semilla', () => {
    const seed = 'voynich-seed-2026';
    const prng1 = new PRNG(seed);
    const prng2 = new PRNG(seed);

    for (let i = 0; i < 100; i++) {
      expect(prng1.nextFloat()).toBe(prng2.nextFloat());
      expect(prng1.nextByte()).toBe(prng2.nextByte());
    }
  });

  it('debe generar secuencias divergentes para semillas diferentes', () => {
    const prng1 = new PRNG('seed-A');
    const prng2 = new PRNG('seed-B');

    const seq1 = Array.from({ length: 10 }, () => prng1.nextByte());
    const seq2 = Array.from({ length: 10 }, () => prng2.nextByte());

    expect(seq1).not.toEqual(seq2);
  });
});
