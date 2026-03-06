import { IFormatter } from '../core/interfaces';

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

  constructor(customFreqs?: Record<string, number>) {
    this.initializeHuffman(customFreqs || DEFAULT_FREQS);
  }

  private initializeHuffman(freqs: Record<string, number>): void {
    const nodes = Object.entries(freqs).map(([char, weight]) => new HuffmanNode(weight, char));
    
    while(nodes.length > 1) {
      nodes.sort((a, b) => a.weight - b.weight);
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
    for (let i = 0; i < buffer.length; i++) {
        bits += buffer[i].toString(2).padStart(8, '0');
    }

    let rawString = "";
    let ptr = 0;
    let node = this.treeRoot;

    while (ptr < bits.length) {
      node = bits[ptr] === '0' ? node.left! : node.right!;
      if (node.char !== undefined) {
        rawString += node.char;
        node = this.treeRoot;
      }
      ptr++;
    }

    while (node !== this.treeRoot) {
      node = node.left!;
      if (node.char !== undefined) {
        rawString += node.char;
        break;
      }
    }

    const wordLengths = [5, 3, 6, 4, 7, 3, 8, 4, 5, 6, 7, 4, 3, 5];
    let formattedResult = "";
    let p = 0;
    let wordIdx = 0;
    let wordsInLine = 0;

    while (p < rawString.length) {
      const wLen = wordLengths[wordIdx % wordLengths.length];
      const word = rawString.slice(p, p + wLen);
      
      if (formattedResult.length > 0) {
        if (wordsInLine >= 12 && wordLengths[(wordIdx + 1) % wordLengths.length] % 2 === 0) {
          formattedResult += "\n";
          wordsInLine = 0;
        } else {
          formattedResult += " ";
        }
      }
      
      formattedResult += word;
      p += wLen;
      wordIdx++;
      wordsInLine++;
    }

    return formattedResult; 
  }

  public decode(text: string): Uint8Array {
    let bits = "";
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const b = this.charToBits.get(char);
      if (b !== undefined) {
         bits += b;
      }
    }

    const byteCount = Math.floor(bits.length / 8);
    const buffer = new Uint8Array(byteCount);
    for (let i = 0; i < byteCount; i++) {
      buffer[i] = parseInt(bits.substring(i * 8, i * 8 + 8), 2);
    }

    return buffer;
  }
}
