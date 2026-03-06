import { VoynichEngine } from '../src/core/VoynichEngine';
import { DummyLayer } from '../src/layers/DummyLayer';
import { EntropyInjectorLayer } from '../src/layers/EntropyInjectorLayer';
import { CurrierADialect } from '../src/formatters/CurrierADialect';
import { TextEncoder, TextDecoder } from 'util';

describe('VoynichEngine (End-to-End)', () => {
  it('debe encriptar y desencriptar un texto plano y mantener invariabilidad de los datos', () => {
    // 1. Instancia el VoynichEngine completo
    const engine = new VoynichEngine({ seed: 9999 });

    // 2. Añade las capas en orden
    engine.use(new DummyLayer());
    engine.use(new EntropyInjectorLayer({ seed: 'ultra-secret-key', noiseRatio: 0.7 }));
    
    // 3. Define el Formatter
    engine.setFormatter(new CurrierADialect());

    // Payload de prueba
    const plainText = "Proyecto Voynich 2026 - Secret CTF Payload";
    const textEncoder = new TextEncoder();
    const textDecoder = new TextDecoder();
    
    const originalBuffer = textEncoder.encode(plainText);

    // 4. Encriptación E2E
    const voynichText = engine.encode(originalBuffer);
    
    // Verificamos que se haya generado un texto ofuscado sustancial
    expect(typeof voynichText).toBe('string');
    expect(voynichText.length).toBeGreaterThan(plainText.length);
    expect(voynichText).not.toContain('Proyecto'); // Asegurar ofuscación visible

    // 5. Decodificación E2E
    const recoveredBuffer = engine.decode(voynichText);
    const recoveredText = textDecoder.decode(recoveredBuffer);

    // 6. Invariabilidad E2E comprobada
    expect(recoveredText).toBe(plainText);
    // jest/jsdom a veces confunde instancias cruzadas de Uint8Array (NodeJS vs JSDOM), convertimos ambos a Array normal para comparar deep equality de bytes
    expect(Array.from(recoveredBuffer)).toEqual(Array.from(originalBuffer));
  });

  it('debe lanzar un error si no se establece un Formatter', () => {
    const engine = new VoynichEngine({ seed: 123 });
    const buffer = new Uint8Array([1, 2, 3]);

    expect(() => engine.encode(buffer)).toThrow(/Formatter es requerido/);
    expect(() => engine.decode('texto')).toThrow(/Formatter es requerido/);
  });
});
