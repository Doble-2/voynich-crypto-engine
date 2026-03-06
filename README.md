<div align="center">

# 📜 Voynich Crypto Engine (`@doble2/voynich-crypto`)

**A deterministic steganographic engine based on binary entropy injection and natural dialect simulation using reverse Huffman trees.**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Jest Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg?style=for-the-badge)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

## 🧠 Architecture and Deterministic Cryptography

**Voynich Crypto** processes information strictly at the binary level (`Uint8Array`), applying a **Pipeline / Builder** pattern to mutate byte sequences before assigning them any textual formatting. This allows data to be hidden inside organic-looking language structures.

### Key Components

1. **Deterministic RNG & Entropy (PRNG / EntropyInjectorLayer):** Initialize with a seed to power a predictable Mulberry32 generator. It mathematically interpolates pseudo-random byte "noise" within the original payload buffer, heavily diluting the footprint of the real information.
2. **Linguistic Formatter (CurrierADialect):** Consumes the binary entropy and runs a **reverse fractal compression via Huffman trees**. It assigns pseudo-characters using pre-established probabilities (based on the EVA alphabet: `e`, `o`, `y`, `s`...), naturally breaking them into structurally sound word lengths without adding detectable patterns.
3. **Lossless Reverse Decoding:** By utilizing strictly prefix-free tree maps, decoding operates at full $O(N)$ efficiency. It parses valid dialect strings while safely ignoring cosmetic spacing or formatting. The parser then navigates backwards through the deterministically injected noise layer to perfectly isolate the exact bytes of the original payload.

---

## 🚀 Installation

```bash
npm install @doble2/voynich-crypto
```

---

## 🛠️ Basic Usage (Node.js / Vanilla TS)

The engine exposes a fluent builder API, akin to setting up routing middlewares. You can easily switch combinations of layers to achieve your desired level of obfuscation.

```typescript
import { 
  VoynichEngine, 
  EntropyInjectorLayer, 
  DummyLayer, 
  CurrierADialect 
} from '@doble2/voynich-crypto';

// 1. Initialize the Engine with a master seed
const engine = new VoynichEngine({ seed: 12345 });

// 2. Chain the transformation layers
engine
  .use(new DummyLayer())
  .use(new EntropyInjectorLayer({ 
    seed: 'secret-auth-key', 
    noiseRatio: 0.1 // Percentage of "garbage" bytes to organically pad the payload
  }));

// 3. Define the Formatter. 
// Optional: provide custom probabilities where higher values equal more frequent character occurrences.
/* const freqs = { 'e': 100, 'o': 90, 'y': 80, ... }; */
engine.setFormatter(new CurrierADialect(/* freqs */));

// 4. Encode Your Payload
const plainText = "Classified XYZ payload";
const bufferOriginal = new TextEncoder().encode(plainText);

const ciphertext = engine.encode(bufferOriginal);
console.log(ciphertext); 
// Output: "oych chtyq ohsh ooyye hyqo..."

// 5. Decode Back to Original Size
const decodificado = new TextDecoder().decode(engine.decode(ciphertext));
console.log(decodificado === plainText); // Outputs: true
```

---

## ⚛️ React / Next.js Integration

The library includes a typed `useVoynich` hook providing an out-of-the-box solution for client-side state management, perfect for CTF platforms or encoded challenges.

### The `useVoynich` Hook

```tsx
import { useVoynich } from '@doble2/voynich-crypto';

export default function App() {
  const { 
    encryptedText,   // Read-only deterministic ciphertext 
    decryptedText,   // Will populate when the correct seed unlocks it
    isDecrypted,     // Boolean flag 
    error,           // Exposes internal matching corruption states
    decrypt          // Callback to trigger decryption attempts
  } = useVoynich({ 
    payload: "FLAG{STEGANOGRAPHY_SOLVED}",
    seed: "12345", // The correct answer hash/seed the end-user must figure out
    noiseRatio: 0.5 
  });

  return (
    <div>
      <p>Ciphertext: {encryptedText}</p>
      
      <button onClick={() => decrypt("12345")}>
         Attempt Unlock
      </button>

      {isDecrypted && <p>Congratulations! Output: {decryptedText}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

---

## 🧩 Extensibility (Build Your Own Custom Layers)

The system is fully decoupled. You can implement the `IVoynichLayer` interface to pipe custom binary scrambling algorithms directly into the core engine logic before it formats into text.

```typescript
import { IVoynichLayer } from '@doble2/voynich-crypto';

export class CustomXORLayer implements IVoynichLayer {
  private key: number;

  constructor(key: number) { this.key = key; }

  public encode(buffer: Uint8Array): Uint8Array {
    return buffer.map(byte => byte ^ this.key);
  }

  public decode(buffer: Uint8Array): Uint8Array {
    return buffer.map(byte => byte ^ this.key); // XOR operation is mathematically reversible
  }
}
```
<div align="center">
  <sub>Built with mathematical discipline and SOLID architecture by <b>@doble2</b></sub>
</div>
# voynich-crypto-engine
