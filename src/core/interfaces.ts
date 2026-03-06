/**
 * Configuración principal para inicializar el motor Voynich.
 */
export interface EngineConfig {
  /** Semilla inicial para garantizar el determinismo en el PRNG y los algoritmos */
  seed: number;
}

/**
 * Interfaz que deben implementar todas las capas (Layers) de transformación.
 * Las operaciones ocurren estrictamente sobre arreglos de bytes (Uint8Array).
 */
export interface IVoynichLayer {
  /**
   * Transforma el buffer original.
   * @param buffer - Buffer de entrada
   * @param seed - Semilla para operaciones deterministas
   * @returns Buffer transformado
   */
  encode(buffer: Uint8Array, seed: number): Uint8Array;

  /**
   * Revierte la transformación aplicada en `encode`.
   * @param buffer - Buffer ofuscado
   * @param seed - Semilla para operaciones deterministas
   * @returns Buffer original
   */
  decode(buffer: Uint8Array, seed: number): Uint8Array;
}

/**
 * Interfaz para el formateador final (AST Lingüístico).
 */
export interface IFormatter {
  encode(buffer: Uint8Array): string;
  decode(text: string): Uint8Array;
}
