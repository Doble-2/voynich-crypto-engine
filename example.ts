import { VoynichEngine } from './src/core/VoynichEngine';
import { DummyLayer } from './src/layers/DummyLayer';
import { EntropyInjectorLayer } from './src/layers/EntropyInjectorLayer';
import { CurrierADialect } from './src/formatters/CurrierADialect';

// 1. Configurar el motor
const engine = new VoynichEngine({ seed: 12345 });
engine.use(new DummyLayer());
// Si queremos minimizar el tamaño, reducimos el ruido a 0
engine.use(new EntropyInjectorLayer({ seed: 'clave-secreta', noiseRatio: 0 }));

// Para reducir el tamaño del texto, necesitamos que cada carácter contenga MÁS bits.
// Esto se logra usando un alfabeto MÁS GRANDE (más letras) y distribuciones algo más planas.
const customFrequencies = {
  'e': 100, 'o': 90, 'a': 80, 'i': 70, 'u': 60, 'y': 50, 
  's': 40, 't': 40, 'r': 30, 'n': 30, 'd': 20, 'l': 20, 
  'c': 20, 'm': 15, 'p': 15, 'q': 10, 'h': 10, 'k': 5, 
  'v': 5, 'f': 5, 'b': 5, 'z': 2, 'x': 2, 'w': 1, 'j': 1
};

engine.setFormatter(new CurrierADialect());

// 2. Definir el mensaje
const mensajeOriginal = `
¡Hola, mundo! Este es un mensaje secreto que vamos a ofuscar usando el Manuscrito Voynich.
`;
console.log("==========================================");
console.log("🔓 MENSAJE ORIGINAL:", mensajeOriginal);
console.log("==========================================\n");

// 3. Encriptar
const bufferIn = new TextEncoder().encode(mensajeOriginal);
const manuscrito = engine.encode(bufferIn);

console.log("📜 MANUSCRITO VOYNICH GENERADO:\n");
console.log(manuscrito);
console.log("\n==========================================\n");

// 4. Desencriptar
const bufferOut = engine.decode(manuscrito);
const mensajeRecuperado = new TextDecoder().decode(bufferOut);

console.log("🔍 MENSAJE DESCIFRADO:", mensajeRecuperado);
console.log("✨ ¿ES EXACTO?:", mensajeOriginal === mensajeRecuperado ? "SÍ ✅" : "NO ❌");
console.log("==========================================");
