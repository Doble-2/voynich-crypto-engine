import { useState, useMemo, useCallback } from 'react';
import { VoynichEngine } from '../core/VoynichEngine';
import { DummyLayer } from '../layers/DummyLayer';
import { EntropyInjectorLayer } from '../layers/EntropyInjectorLayer';
import { CurrierADialect } from '../formatters/CurrierADialect';

export interface UseVoynichConfig {
  /** Texto plano a ofuscar inicialmente */
  payload: string;
  /** Semilla real generadora del texto ofuscado */
  seed: string;
  /** Ratio de ruido inyectado (0 a 0.99) */
  noiseRatio?: number;
  /** Diccionario de frecuencias personalizadas para el alfabeto */
  customFreqs?: Record<string, number>;
}

const buildEngine = (seedStr: string, noiseRatio: number, customFreqs?: UseVoynichConfig['customFreqs']) => {
  const numSeed = seedStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const engine = new VoynichEngine({ seed: numSeed });
  engine.use(new DummyLayer());
  engine.use(new EntropyInjectorLayer({ seed: seedStr, noiseRatio }));
  engine.setFormatter(new CurrierADialect(customFreqs));
  
  return engine;
};

/**
 * Hook para integrar @doble2/voynich-crypto en entornos React/Next.js.
 */
export const useVoynich = ({ payload, seed, noiseRatio = 0.5, customFreqs }: UseVoynichConfig) => {
  const [decryptedText, setDecryptedText] = useState<string>('');
  const [isDecrypted, setIsDecrypted] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const encryptedText = useMemo(() => {
    try {
      const engine = buildEngine(seed, noiseRatio, customFreqs);
      const encoder = new TextEncoder();
      return engine.encode(encoder.encode(payload));
    } catch (err: any) {
      console.error("Error inicializando VoynichEngine:", err);
      return "Error de encriptación interna.";
    }
  }, [payload, seed, noiseRatio, customFreqs]);

  const decrypt = useCallback((attemptedSeed: string) => {
    setError('');
    
    try {
      const engine = buildEngine(attemptedSeed, noiseRatio, customFreqs);
      const decoder = new TextDecoder();
      
      const recoveredBuffer = engine.decode(encryptedText);
      const recoveredString = decoder.decode(recoveredBuffer);

      if (recoveredString === payload) {
        setDecryptedText(recoveredString);
        setIsDecrypted(true);
      } else {
        throw new Error('Semilla incorrecta: La entropía generó un resultado corrupto.');
      }
    } catch (err: any) {
      setIsDecrypted(false);
      setDecryptedText('');
      setError(err.message || 'Error al decodificar. Verifica tu semilla.');
    }
  }, [encryptedText, payload, noiseRatio, customFreqs]);

  return {
    encryptedText,
    decryptedText,
    isDecrypted,
    error,
    decrypt
  };
};
