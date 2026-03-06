"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVoynich } from "../hooks/useVoynich";

export interface VoynichBlockProps {
  payload: string;
  seed: string;
  noiseRatio?: number;
}

export const VoynichBlock: React.FC<VoynichBlockProps> = ({
  payload,
  seed,
  noiseRatio = 0.5,
}) => {
  const { encryptedText, decryptedText, isDecrypted, error, decrypt } =
    useVoynich({ payload, seed, noiseRatio });
  const [attemptedSeed, setAttemptedSeed] = useState("");

  const handleDecrypt = (e: React.FormEvent) => {
    e.preventDefault();
    if (attemptedSeed.trim() !== "") {
      decrypt(attemptedSeed.trim());
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-[#f4f1ea] border border-[#d6cbb4] shadow-lg rounded-sm font-sans text-[#3b352a]">
      <h2 className="text-2xl font-serif mb-4 pb-2 border-b border-[#d6cbb4] flex justify-between items-center">
        <span>Manuscrito Interactivo</span>
        {isDecrypted && (
          <span className="text-sm bg-green-200 text-green-800 px-2 py-1 rounded">
            Verificado
          </span>
        )}
      </h2>

      {/* Contenedor del texto (Ofuscado o Decodificado) */}
      <div className="relative min-h-[150px] p-4 bg-[#e8e3d3] rounded shadow-inner mb-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {!isDecrypted ? (
            <motion.div
              key="encrypted"
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)", y: -10 }}
              transition={{ duration: 0.6 }}
              className="font-mono text-sm leading-relaxed text-[#7a705c] break-words whitespace-pre-wrap italic"
            >
              {encryptedText}
            </motion.div>
          ) : (
            <motion.div
              key="decrypted"
              initial={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="font-mono text-lg leading-relaxed text-[#1a1814] break-words font-semibold"
            >
              {decryptedText}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controles de descifrado */}
      {!isDecrypted ? (
        <form onSubmit={handleDecrypt} className="space-y-4">
          <div>
            <label
              htmlFor="seed"
              className="block text-sm font-semibold mb-1 text-[#5c5545]"
            >
              Ingrese la Semilla de Desencriptación:
            </label>
            <div className="flex gap-2">
              <input
                id="seed"
                type="text"
                value={attemptedSeed}
                onChange={(e) => setAttemptedSeed(e.target.value)}
                className="flex-1 px-4 py-2 border border-[#d6cbb4] bg-white rounded focus:outline-none focus:ring-2 focus:ring-[#8c8269] text-gray-800"
                placeholder="Ej. mi-palabra-secreta..."
              />
              <button
                type="submit"
                className="px-6 py-2 bg-[#5c5545] text-[#f4f1ea] rounded hover:bg-[#3b352a] transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#5c5545] font-semibold"
              >
                Descifrar
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-600 text-sm font-medium mt-2"
              >
                ⚠️ {error}
              </motion.p>
            )}
          </AnimatePresence>
        </form>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center p-4 bg-[#d0e0d0] text-[#2c402c] rounded border border-[#a0c0a0]"
        >
          <p className="font-semibold">¡Sincronización de Entropía Exitosa!</p>
          <p className="text-sm mt-1">
            El payload ha sido restaurado desde el dialecto original.
          </p>
        </motion.div>
      )}
    </div>
  );
};
