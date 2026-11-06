"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { toSpeakable } from "../engine/replies";
import type { SpeechSynthesisControls, SpeechVoiceOption, UseSpeechSynthesisOptions } from "../types";

const MUTED_KEY = "proxy.assistant.muted";
const VOICE_KEY = "proxy.assistant.voice";
const RATE_KEY = "proxy.assistant.rate";
const PREFS_EVENT = "proxy-assistant-prefs";
const PREVIEW_TEXT = "أهلاً، أنا Proxy. ده صوتي، إيه رأيك؟";
const MAX_CHUNK = 180;

const memory = new Map<string, string>();

function readPref(key: string): string | null {
  try {
    return window.localStorage.getItem(key) ?? memory.get(key) ?? null;
  } catch {
    return memory.get(key) ?? null;
  }
}

function writePref(key: string, value: string) {
  memory.set(key, value);
  try {
    window.localStorage.setItem(key, value);
  } catch {}
  window.dispatchEvent(new Event(PREFS_EVENT));
}

function subscribePrefs(onChange: () => void) {
  window.addEventListener(PREFS_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(PREFS_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const readMuted = () => readPref(MUTED_KEY) === "true";
const readVoiceURI = () => readPref(VOICE_KEY);
const readRate = () => {
  const value = Number(readPref(RATE_KEY));
  return Number.isFinite(value) && value >= 0.5 && value <= 2 ? value : 1;
};

let cachedVoices: SpeechSynthesisVoice[] = [];

function subscribeVoices(onChange: () => void) {
  if (!("speechSynthesis" in window)) return () => undefined;
  const synth = window.speechSynthesis;
  const update = () => {
    cachedVoices = synth.getVoices();
    onChange();
  };
  synth.addEventListener("voiceschanged", update);
  update();
  return () => synth.removeEventListener("voiceschanged", update);
}

const getVoices = () => cachedVoices;
const emptyVoices: SpeechSynthesisVoice[] = [];
const subscribeNoop = () => () => undefined;

function voiceLang(voice: SpeechSynthesisVoice) {
  return voice.lang.replace("_", "-").toLowerCase();
}

function isNatural(voice: SpeechSynthesisVoice) {
  return /natural|neural|online|premium|enhanced/i.test(voice.name);
}

function scoreVoice(voice: SpeechSynthesisVoice, lang: string): number {
  const code = voiceLang(voice);
  const base = lang.split("-")[0].toLowerCase();
  let score = 0;
  if (code === lang.toLowerCase()) score += 30;
  else if (code.startsWith(`${base}-`) || code === base) score += 10;
  else return -1;
  if (isNatural(voice)) score += 25;
  if (/google/i.test(voice.name)) score += 12;
  if (!voice.localService) score += 3;
  return score;
}

function splitChunks(text: string): string[] {
  const sentences = text.split(/(?<=[.!؟?،,:؛\n])\s+/).filter(Boolean);
  const chunks: string[] = [];
  for (const sentence of sentences) {
    const last = chunks[chunks.length - 1];
    if (last && last.length + sentence.length + 1 <= MAX_CHUNK) chunks[chunks.length - 1] = `${last} ${sentence}`;
    else chunks.push(sentence);
  }
  return chunks;
}

export function useSpeechSynthesis({ lang = "ar-EG" }: UseSpeechSynthesisOptions = {}): SpeechSynthesisControls {
  const supported = useSyncExternalStore(
    subscribeNoop,
    () => "speechSynthesis" in window,
    () => false,
  );
  const muted = useSyncExternalStore(subscribePrefs, readMuted, () => false);
  const voiceURI = useSyncExternalStore(subscribePrefs, readVoiceURI, () => null);
  const rate = useSyncExternalStore(subscribePrefs, readRate, () => 1);
  const voices = useSyncExternalStore(subscribeVoices, getVoices, () => emptyVoices);
  const [speaking, setSpeaking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ranked = useMemo(
    () =>
      voices
        .map((voice) => ({ voice, score: scoreVoice(voice, lang) }))
        .filter((item) => item.score >= 0)
        .sort((a, b) => b.score - a.score),
    [voices, lang],
  );

  const options = useMemo<SpeechVoiceOption[]>(
    () =>
      ranked.map(({ voice }) => ({
        uri: voice.voiceURI,
        name: voice.name.replace(/^Microsoft\s+/i, "").replace(/\s*-\s*Arabic.*$/i, ""),
        lang: voice.lang,
        natural: isNatural(voice),
      })),
    [ranked],
  );

  const resolveVoice = useCallback(
    (uri?: string | null) => {
      const wanted = uri ?? readVoiceURI();
      return ranked.find(({ voice }) => voice.voiceURI === wanted)?.voice ?? ranked[0]?.voice ?? null;
    },
    [ranked],
  );

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    },
    [],
  );

  const cancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const say = useCallback(
    (text: string, uri?: string | null) => {
      if (!("speechSynthesis" in window)) return;
      const content = toSpeakable(text);
      if (!content) return;
      const synth = window.speechSynthesis;
      const voice = resolveVoice(uri);
      const chunks = splitChunks(content);
      if (timerRef.current) clearTimeout(timerRef.current);
      synth.cancel();
      timerRef.current = setTimeout(() => {
        synth.resume();
        chunks.forEach((chunk, index) => {
          const utterance = new SpeechSynthesisUtterance(chunk);
          utterance.lang = voice?.lang ?? lang;
          if (voice) utterance.voice = voice;
          utterance.rate = readRate();
          utterance.pitch = 1;
          utterance.volume = 1;
          if (index === 0) utterance.onstart = () => setSpeaking(true);
          if (index === chunks.length - 1) utterance.onend = () => setSpeaking(false);
          utterance.onerror = () => setSpeaking(false);
          synth.speak(utterance);
        });
      }, 60);
    },
    [lang, resolveVoice],
  );

  const speak = useCallback(
    (text: string) => {
      if (readMuted()) return;
      say(text);
    },
    [say],
  );

  const preview = useCallback((uri?: string) => say(PREVIEW_TEXT, uri), [say]);

  const toggleMuted = useCallback(() => {
    const next = !readMuted();
    if (next) cancel();
    writePref(MUTED_KEY, String(next));
  }, [cancel]);

  const setVoice = useCallback((uri: string) => writePref(VOICE_KEY, uri), []);
  const setRate = useCallback((value: number) => writePref(RATE_KEY, String(value)), []);

  return {
    supported,
    speaking,
    muted,
    toggleMuted,
    speak,
    cancel,
    voices: options,
    voiceURI: resolveVoice(voiceURI)?.voiceURI ?? null,
    setVoice,
    rate,
    setRate,
    preview,
  };
}
