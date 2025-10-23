import { User } from "../../db/schema/user";

// xor-obfuscate.ts
const KEY = "fuba_secret_key_2024";

const enc = new TextEncoder();
const dec = new TextDecoder();
const keyBytes = enc.encode(KEY);

function xorBytes(data: Uint8Array, key: Uint8Array): Uint8Array {
  const out = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    out[i] = data[i] ^ key[i % key.length];
  }
  return out;
}

// Cross-runtime Base64 (Node/Bun/Browser)
function toBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let binary = "";
  for (let i = 0; i < bytes.length; i++)
    binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(b64, "base64"));
  }
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

// ----- String in/out -----
export function obfuscateString(data: string): string {
  const dataBytes = enc.encode(data);
  const xored = xorBytes(dataBytes, keyBytes);
  return toBase64(xored);
}

export function deobfuscateString(b64: string): string {
  const obf = fromBase64(b64);
  const plainBytes = xorBytes(obf, keyBytes);
  return dec.decode(plainBytes);
}

export function obfuscate(data: Partial<User>): string {
  const asString = typeof data === "string" ? data : JSON.stringify(data);
  return obfuscateString(asString);
}

export function deobfuscateToObject<T = unknown>(b64: string): T {
  const json = deobfuscateString(b64);
  return JSON.parse(json) as T;
}

console.log(
  obfuscate({
    fuba: "3148237128",
    inventory: { teste: 20, covro: 1238127376123 },
  }),
);
