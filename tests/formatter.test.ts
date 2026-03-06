import { CurrierADialect } from '../src/formatters/CurrierADialect';

describe('CurrierADialect Formatter', () => {
  let formatter: CurrierADialect;

  beforeEach(() => {
    formatter = new CurrierADialect();
  });

  it('debe mapear un byte a una palabra de Voynich y viceversa', () => {
    const originalBuffer = new Uint8Array([0, 127, 255]);
    
    const encodedText = formatter.encode(originalBuffer);
    expect(typeof encodedText).toBe('string');
    expect(encodedText.length).toBeGreaterThan(0);

    const decodedBuffer = formatter.decode(encodedText);
    expect(decodedBuffer).toEqual(originalBuffer);
  });

  it('debe intercalar saltos de línea para textos largos y decodificarlos sin problema', () => {
    // 100 bytes generarán suficientes caracteres para pasar los puntos de quiebre de saltos de línea.
    const originalBuffer = new Uint8Array(100).fill(42);
    
    const encodedText = formatter.encode(originalBuffer);
    expect(encodedText).toContain('\n');
    
    const decodedBuffer = formatter.decode(encodedText);
    expect(decodedBuffer).toEqual(originalBuffer);
  });

  it('debe omitir transparentemente la basura inyectada que no pertenezca al alfabeto', () => {
    const originalBuffer = new Uint8Array([1, 2, 3]);
    const validText = formatter.encode(originalBuffer);
    
    // Inyectamos texto que no es parte del alfabeto de Voynich/Huffman que definimos o saltos de línea extra
    const corruptText = "¡BASURA_AQUÍ!" + validText + " MÁS_\nBASURA";
    
    const decodedBuffer = formatter.decode(corruptText);
    expect(decodedBuffer).toEqual(originalBuffer);
  });
});
