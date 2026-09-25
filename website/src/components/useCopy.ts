import { useCallback, useEffect, useRef, useState } from 'react';

export type CopyState = 'idle' | 'copied' | 'error';

/**
 * The install block's copy behaviour, shared by the closing sections: write to
 * the clipboard; if that is unavailable (insecure origin, denied permission)
 * select the text so it can be copied by hand and report that instead.
 * `reset` changes whenever the copied text changes, clearing a stale status.
 */
export function useCopy(text: string, nodeId: string) {
  const [state, setState] = useState<CopyState>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const request = useRef(0);

  useEffect(() => {
    setState('idle');
    return () => {
      // A command change or unmount invalidates an in-flight clipboard write.
      // Its confirmation must not appear on the newly selected destination.
      request.current += 1;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [text]);

  const copy = useCallback(async () => {
    const currentRequest = ++request.current;
    if (timer.current) clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(text);
      if (currentRequest !== request.current) return;
      setState('copied');
      timer.current = setTimeout(() => setState('idle'), 1800);
    } catch {
      if (currentRequest !== request.current) return;
      const node = document.getElementById(nodeId);
      if (node) {
        const range = document.createRange();
        range.selectNodeContents(node);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      setState('error');
    }
  }, [text, nodeId]);

  return { state, copy };
}
