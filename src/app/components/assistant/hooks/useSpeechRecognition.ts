"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type {
  SpeechRecognitionControls,
  SpeechRecognitionConstructor,
  SpeechRecognitionLike,
  SpeechWindow,
  UseSpeechRecognitionOptions,
} from "../types";

const ERROR_MESSAGES: Record<string, string> = {
  "not-allowed": "المتصفح مش مسموحله يستخدم المايك. اسمح بالمايك من إعدادات الموقع وجرّب تاني.",
  "service-not-allowed": "المتصفح مش مسموحله يستخدم خدمة التعرف على الصوت.",
  "no-speech": "ماسمعتش حاجة، جرّب تتكلم تاني.",
  "audio-capture": "مش لاقي مايك شغال على الجهاز.",
  network: "فيه مشكلة في الاتصال، التعرف على الصوت محتاج إنترنت.",
  "language-not-supported": "المتصفح مش بيدعم التعرف على الكلام العربي.",
};

function getRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const speechWindow = window as Window & SpeechWindow;
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

const subscribe = () => () => undefined;

export function useSpeechRecognition({ lang = "ar-EG", onFinal }: UseSpeechRecognitionOptions): SpeechRecognitionControls {
  const supported = useSyncExternalStore(
    subscribe,
    () => getRecognitionConstructor() !== null,
    () => false,
  );
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onFinalRef = useRef(onFinal);

  useLayoutEffect(() => {
    onFinalRef.current = onFinal;
  }, [onFinal]);

  useEffect(() => () => recognitionRef.current?.abort(), []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    const Recognition = getRecognitionConstructor();
    if (!Recognition) {
      setError("المتصفح ده مش بيدعم الكلام بالصوت. استخدم Chrome أو Edge، أو اكتب سؤالك.");
      return;
    }
    recognitionRef.current?.abort();

    const recognition = new Recognition();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let finalText = "";

    recognition.onstart = () => {
      setListening(true);
      setInterim("");
      setError(null);
    };

    recognition.onresult = (event) => {
      let pending = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) finalText = `${finalText} ${transcript}`.trim();
        else pending += transcript;
      }
      setInterim(`${finalText} ${pending}`.trim());
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted") return;
      setError(ERROR_MESSAGES[event.error] ?? "حصلت مشكلة في المايك، جرّب تاني.");
    };

    recognition.onend = () => {
      setListening(false);
      setInterim("");
      if (recognitionRef.current === recognition) recognitionRef.current = null;
      const text = finalText.trim();
      if (text) onFinalRef.current(text);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setError("مش قادر أشغّل المايك دلوقتي، جرّب تاني.");
    }
  }, [lang]);

  const clearError = useCallback(() => setError(null), []);

  return { supported, listening, interim, error, start, stop, clearError };
}
