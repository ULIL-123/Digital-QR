
import { useEffect, useRef, useCallback } from 'react';

interface ScannerOptions {
  enabled?: boolean;
  ignoreInputs?: boolean;
  minChars?: number;
  bufferTimeout?: number;
}

/**
 * useHardwareScanner
 * Optimized for Industrial HID Devices (PANDA PRJ-220, QR Scanners & RFID Readers)
 * captured as rapid keyboard events.
 */
export const useHardwareScanner = (
  onScan: (code: string) => void,
  options: ScannerOptions = {}
) => {
  const {
    enabled = true,
    ignoreInputs = true,
    minChars = 3,
    bufferTimeout = 50 // Optimized specifically for high-speed Panda PRJ-220 2D Scanners
  } = options;

  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    // Ignore modifier keys that don't contribute to the string but can mess up timing
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) {
      return;
    }

    // Don't trigger while user is intentionally typing in inputs (if requested)
    if (ignoreInputs && (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
      return;
    }

    const currentTime = Date.now();
    
    // PANDA PRJ-220 Logic: Rapid sequence detection
    // If time since last key is too long, it's likely manual typing, so reset.
    if (currentTime - lastKeyTimeRef.current > bufferTimeout) {
      bufferRef.current = ''; 
    }
    
    lastKeyTimeRef.current = currentTime;

    if (e.key === 'Enter') {
      const finalCode = bufferRef.current.trim();
      if (finalCode.length >= minChars) {
        // Successful scan from external device
        onScan(finalCode);
      }
      bufferRef.current = ''; 
    } else if (e.key.length === 1) {
      // Append characters to the buffer
      bufferRef.current += e.key;
    }
  }, [enabled, ignoreInputs, minChars, bufferTimeout, onScan]);

  useEffect(() => {
    // We use a global listener to catch hardware events even if focus is lost
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [handleKeyDown]);
};
