import { IFormatter } from '../core/interfaces';
import { PRNG } from '../core/PRNG';

class HuffmanNode {
  char?: string;
  weight: number;
  left?: HuffmanNode;
  right?: HuffmanNode;

  constructor(weight: number, char?: string, left?: HuffmanNode, right?: HuffmanNode) {
    this.weight = weight;
    this.char = char;
    this.left = left;
    this.right = right;
  }
}

// Default frequencies based on the European Voynich Alphabet (EVA).
// Character spacing is strictly cosmetic and generated dynamically during formatting.
const DEFAULT_FREQS: Record<string, number> = {
  'o': 100, 'e': 90, 'c': 80, 'h': 70, 'd': 60,
  'y': 60, 'q': 50, 's': 50, 'a': 45, 'i': 40, 'n': 40,
  'r': 30, 't': 30, 'l': 20, 'p': 15, 'k': 10, 'm': 10,
  'f': 5, 'g': 5, 'u': 5, 'v': 2, 'x': 2, 'z': 1
};

/**
 * Linguistic formatter simulating the Currier A dialect of the Voynich Manuscript.
 * Uses a reverse Huffman tree to ensure natural frequency distribution
 * of output characters, resulting in strings with a human-language appearance.
 */
export class CurrierADialect implements IFormatter {
  private treeRoot!: HuffmanNode;
  private charToBits = new Map<string, string>();

  constructor(customFreqs?: Record<string, number>, seed: number = 1912) {
    const baseFreqs = customFreqs || DEFAULT_FREQS;
    const dynamicVocab = this.generateZipfVocabulary(baseFreqs, seed);
    this.initializeHuffman(dynamicVocab);
  }

  private generateZipfVocabulary(baseFreqs: Record<string, number>, seed: number): Record<string, number> {
    const prng = new PRNG(seed);
    
    const charPool: string[] = [];
    const sortedEntries = Object.entries(baseFreqs).sort((a, b) => a[0].localeCompare(b[0]));
    for (const [char, weight] of sortedEntries) {
        for (let i = 0; i < weight; i++) {
            charPool.push(char);
        }
    }

    const vocabFreqs: Record<string, number> = {};
    const VOCAB_SIZE = 4096; // 4096 words = 12 bits of entropy per word (high compression)
    const MAX_ZIPF_FREQ = 1000000;

    for (let rank = 1; rank <= VOCAB_SIZE; rank++) {
        let length = 0;
        if (rank <= 50) {
             length = 1 + Math.floor(prng.nextFloat() * 2); // Rank 1-50: 1 or 2 chars (e.g. 'y', 'qo')
        } else if (rank <= 500) {
             length = 2 + Math.floor(prng.nextFloat() * 2); // Rank 50-500: 2 or 3 chars
        } else {
             length = 3 + Math.floor(prng.nextFloat() * 3); // Rank > 500: 3 to 5 chars max
        }

        let word = "";
        let attempts = 0;
        
        do {
            word = "";
            for (let i = 0; i < length; i++) {
                const randIdx = Math.floor(prng.nextFloat() * charPool.length);
                word += charPool[randIdx];
            }
            attempts++;
        } while (vocabFreqs[word] !== undefined && attempts < 100);

        // Zipf's Law: Freq = Max / Rank
        const frequency = Math.floor(MAX_ZIPF_FREQ / rank);
        vocabFreqs[word] = frequency;
    }

    return vocabFreqs;
  }

  private initializeHuffman(freqs: Record<string, number>): void {
    const nodes = Object.entries(freqs).map(([char, weight]) => new HuffmanNode(weight, char));
    
    while(nodes.length > 1) {
      nodes.sort((a, b) => {
         if (a.weight !== b.weight) return a.weight - b.weight;
         const charA = a.char || "";
         const charB = b.char || "";
         return charA.localeCompare(charB);
      });
      const left = nodes.shift()!;
      const right = nodes.shift()!;
      nodes.push(new HuffmanNode(left.weight + right.weight, undefined, left, right));
    }
    
    this.treeRoot = nodes[0];
    this.buildMap(this.treeRoot, "");
  }

  private buildMap(node: HuffmanNode, prefix: string): void {
    if (node.char !== undefined) {
      this.charToBits.set(node.char, prefix);
    } else {
      if (node.left) this.buildMap(node.left, prefix + "0");
      if (node.right) this.buildMap(node.right, prefix + "1");
    }
  }

  public encode(buffer: Uint8Array): string {
    let bits = "";
    
    // Prefix the payload with a 32-bit exact length to avoid Huffman padding null-bytes
    const lenBuffer = new Uint8Array([
        (buffer.length >>> 24) & 255,
        (buffer.length >>> 16) & 255,
        (buffer.length >>> 8) & 255,
        buffer.length & 255
    ]);
    
    for (let i = 0; i < 4; i++) {
        bits += lenBuffer[i].toString(2).padStart(8, '0');
    }

    // Append standard payload
    for (let i = 0; i < buffer.length; i++) {
        bits += buffer[i].toString(2).padStart(8, '0');
    }

    const words: string[] = [];
    let ptr = 0;
    let node = this.treeRoot;

    while (ptr < bits.length) {
      node = bits[ptr] === '0' ? node.left! : node.right!;
      if (node.char !== undefined) {
        words.push(node.char);
        node = this.treeRoot;
      }
      ptr++;
    }

    while (node !== this.treeRoot) {
      node = node.left!;
      if (node.char !== undefined) {
        words.push(node.char);
        break;
      }
    }

    const wordsPerLine = [12, 14, 11, 15, 10, 13, 14, 12, 9];
    const formattedResult: string[] = [];
    let wCount = 0;
    let lineIdx = 0;

    for (let i = 0; i < words.length; i++) {
       formattedResult.push(words[i]);
       wCount++;
       if (wCount >= wordsPerLine[lineIdx % wordsPerLine.length]) {
           if (i < words.length - 1) formattedResult.push("\n");
           wCount = 0;
           lineIdx++;
       } else if (i < words.length - 1) {
           formattedResult.push(" ");
       }
    }

    return formattedResult.join(""); 
  }

  public decode(text: string): Uint8Array {
    let bits = "";
    
    // Divide usando espacios y saltos de linea como separadores naturales.
    const tokens = text.trim().split(/\s+/);
    
    for (const token of tokens) {
      const b = this.charToBits.get(token);
      if (b !== undefined) {
         bits += b;
      }
    }

    const totalBytes = Math.floor(bits.length / 8);
    if (totalBytes < 4) return new Uint8Array(0);

    let exactLength = 0;
    for (let i = 0; i < 4; i++) {
        exactLength = (exactLength << 8) | parseInt(bits.substring(i * 8, i * 8 + 8), 2);
    }
    
    // Safety check in case of malicious or corrupted text making length huge
    exactLength = Math.min(exactLength, totalBytes - 4);

    const buffer = new Uint8Array(exactLength);
    for (let i = 0; i < exactLength; i++) {
      buffer[i] = parseInt(bits.substring((i + 4) * 8, (i + 4) * 8 + 8), 2);
    }

    return buffer;
  }
}
