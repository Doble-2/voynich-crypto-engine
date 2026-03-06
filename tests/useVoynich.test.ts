import { renderHook, act } from '@testing-library/react';
import { useVoynich } from '../src/hooks/useVoynich';

// Mock de TextEncoder y TextDecoder ya que JS DOM podría no tenerlos,
// pero Node 20 y Jest con la configuración correcta sí suelen tenerlos
// Si no están, React Testing Library que corre sobre jsdom a veces lanza error
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder as any;
}

describe('useVoynich Hook', () => {
  const payload = 'SECRET_DATA_KEY';
  const seed = 'test-seed-123';
  const falseSeed = 'wrong-seed';

  it('debe encriptar el payload inicial al montar el hook', () => {
    const { result } = renderHook(() => useVoynich({ payload, seed }));

    expect(result.current.encryptedText).toBeTruthy();
    expect(typeof result.current.encryptedText).toBe('string');
    // El texto ofuscado debe ser largo y distinto al texto plano
    expect(result.current.encryptedText).not.toContain(payload); 
    expect(result.current.isDecrypted).toBe(false);
    expect(result.current.decryptedText).toBe('');
    expect(result.current.error).toBe('');
  });

  it('debe descifrar correctamente con la semilla correcta', () => {
    const { result } = renderHook(() => useVoynich({ payload, seed }));

    act(() => {
      result.current.decrypt(seed);
    });

    expect(result.current.isDecrypted).toBe(true);
    expect(result.current.decryptedText).toBe(payload);
    expect(result.current.error).toBe('');
  });

  it('debe fallar y mostrar error si se provee una semilla incorrecta', () => {
    const { result } = renderHook(() => useVoynich({ payload, seed }));

    act(() => {
      result.current.decrypt(falseSeed);
    });

    expect(result.current.isDecrypted).toBe(false);
    expect(result.current.decryptedText).toBe('');
    expect(result.current.error).toContain('Semilla incorrecta');
  });
});
