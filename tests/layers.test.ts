import { EntropyInjectorLayer } from '../src/layers/EntropyInjectorLayer';
import { DummyLayer } from '../src/layers/DummyLayer';

describe('Capas (Layers)', () => {

  describe('EntropyInjectorLayer', () => {
    it('debe inyectar ruido (aumentar el tamaño del buffer) y poder revertirlo exactamente', () => {
      const layer = new EntropyInjectorLayer({ seed: 'test-seed', noiseRatio: 0.5 });
      const originalBuffer = new Uint8Array([10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
      
      const encodedBuffer = layer.encode(originalBuffer, 0); // engineSeed se ignora aquí
      
      // Con noiseRatio 0.5, es casi seguro que el buffer resultante será más grande
      expect(encodedBuffer.length).toBeGreaterThan(originalBuffer.length);

      const decodedBuffer = layer.decode(encodedBuffer, 0);
      
      // Reconstrucción estricta byte a byte
      expect(decodedBuffer).toEqual(originalBuffer);
    });

    it('debe lanzar error si el noiseRatio está fuera de límites', () => {
      expect(() => new EntropyInjectorLayer({ seed: 'seed', noiseRatio: 1.5 })).toThrow();
      expect(() => new EntropyInjectorLayer({ seed: 'seed', noiseRatio: -0.1 })).toThrow();
    });
  });

  describe('DummyLayer', () => {
    it('debe invertir los bytes en encode y restaurarlos en decode', () => {
      const layer = new DummyLayer();
      const originalBuffer = new Uint8Array([1, 2, 3]);
      
      const encodedBuffer = layer.encode(originalBuffer, 0);
      expect(encodedBuffer).toEqual(new Uint8Array([3, 2, 1]));

      const decodedBuffer = layer.decode(encodedBuffer, 0);
      expect(decodedBuffer).toEqual(originalBuffer);
    });
  });

});
