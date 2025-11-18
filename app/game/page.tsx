"use client";

import { useEffect, useRef, useState } from "react";

type Choice = {
  label: string;
  next?: string;
};

type Scene = {
  text: string;
  choices?: Choice[];
  ending?: boolean;
};

const scenesData = require("@/app/data/scenes.json");
const scenes = scenesData as Record<string, Scene>;

export default function Game() {
  const START_ID = "ch1_s1";
  const STORAGE_KEY = "nightfile_progress";

  // typing config
  const TYPING_SPEED_MS = 50;
  const BUTTON_ENTRANCE_MS = 40000;

  const [currentId, setCurrentId] = useState<string>(START_ID);
  const scene = scenes[currentId];

  // typing states (used for both normal scenes and ending text)
  const [visibleText, setVisibleText] = useState<string>("");
  const [typingDone, setTypingDone] = useState<boolean>(false);
  const typingIntervalRef = useRef<number | null>(null);

  // ---------- mount: check sessionStorage (recent navigation) first, then localStorage ----------
  useEffect(() => {
    try {
      const sNext = sessionStorage.getItem("nightfile_next");
      if (sNext && scenes[sNext]) {
        sessionStorage.removeItem("nightfile_next");
        // If the scene is an ending, do NOT persist it to localStorage (so refresh after ending starts fresh)
        if (scenes[sNext].ending) {
          localStorage.removeItem(STORAGE_KEY);
          setCurrentId(sNext);
        } else {
          // persist non-ending in localStorage like before
          localStorage.setItem(STORAGE_KEY, sNext);
          setCurrentId(sNext);
        }
        return;
      }

      // fallback: use persisted progress from localStorage (exactly like your original)
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && scenes[saved]) {
        setCurrentId(saved);
      } else {
        setCurrentId(START_ID);
      }
    } catch (e) {
      setCurrentId(START_ID);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- typing animation ----------
  useEffect(() => {
    if (!scene) return;

    // reset
    setVisibleText("");
    setTypingDone(false);
    if (typingIntervalRef.current) {
      window.clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    const full = scene.text ?? "";

    // respect reduced motion
    const prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || full.length === 0) {
      setVisibleText(full);
      setTypingDone(true);
      return;
    }

    let i = 0;
    typingIntervalRef.current = window.setInterval(() => {
      i++;
      setVisibleText(full.slice(0, i));
      if (i >= full.length) {
        if (typingIntervalRef.current) {
          window.clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
        setTypingDone(true);
      }
    }, TYPING_SPEED_MS);

    return () => {
      if (typingIntervalRef.current) {
        window.clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, scene?.text]);

  // ---------- choose: store and reload ----------
  const chooseAndReload = (next?: string) => {
    if (!next || !scenes[next]) return;

    try {
      // store the next scene into sessionStorage so the reload can read it and land exactly there
      sessionStorage.setItem("nightfile_next", next);

      // persist non-ending to localStorage (so regular resume still works)
      if (!scenes[next].ending) {
        localStorage.setItem(STORAGE_KEY, next);
      } else {
        // do not persist endings; clear storage so refresh after ending starts anew
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      // ignore storage errors
    }

    window.location.assign(window.location.pathname);
  };

  const getChapterLabel = (id: string) => {
    const m = id.match(/^ch(\d+)/i);
    if (m && m[1]) {
      return `Chapter ${parseInt(m[1], 10)}`;
    }

    const fallback = id.replace(/_/g, " ");
    return fallback;
  };

  // ---------- fallback "scene not found" ----------
  if (!scene) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center text-red-500 text-3xl">
        Scene not found. Start over.
      </main>
    );
  }

  // ---------- ENDING SCREEN ----------
  if (scene.ending) {
    return (
      <main className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-4xl font-black text-cyan-600 mb-6 tracking-wider">
          CASE CLOSED
        </h1>

        <p className="text-base leading-relaxed text-gray-300 max-w-2xl whitespace-pre-line mb-6">
          <span>{visibleText}</span>
          {!typingDone && (
            <span className="inline-block ml-1 animate-blink">█</span>
          )}
        </p>

        <div className="w-full max-w-2xl mx-auto">
          <button
            onClick={() => {
              try {
                localStorage.removeItem(STORAGE_KEY);
              } catch (e) {}
              setCurrentId(START_ID);
            }}
            className={
              "w-full px-6 py-2 bg-linear-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 rounded-2xl font-bold text-sm shadow-2xl transition transform " +
              (typingDone
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-6 scale-98 pointer-events-none")
            }
            style={{
              transitionProperty: "opacity, transform",
              transitionDuration: `${BUTTON_ENTRANCE_MS}ms`,
              transitionTimingFunction: "cubic-bezier(.2,.9,.2,1)",
            }}
          >
            Start New Case
          </button>
        </div>
      </main>
    );
  }

  // ---------- NORMAL SCENE ----------
  return (
    <main className="min-h-screen bg-black text-gray-100 flex flex-col">
      <div className="p-6 border-b border-cyan-900/30 text-center">
        <h1 className="text-3xl font-bold text-cyan-500">THE NIGHT FILE</h1>
        <p className="text-sm text-gray-500 mt-1">
          {getChapterLabel(currentId)}
        </p>
      </div>

      <div className="flex-1 p-6 pb-20 overflow-y-auto">
        <div className="bg-gray-950/80 border border-cyan-900/30 rounded-2xl p-2">
          <p
            className="text-base leading-relaxed text-gray-200 whitespace-pre-line font-medium"
            aria-live="polite"
          >
            <span>{visibleText}</span>
            {!typingDone && (
              <span className="inline-block ml-1 animate-blink">█</span>
            )}
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 text-gray-300 left-0 right-0 p-6 bg-linear-to-t from-black">
        <div className="space-y-5 max-w-2xl mx-auto pb-12">
          {scene.choices?.map((c, i) => {
            const btnVisible = typingDone;

            const baseClasses =
              "w-full py-4 bg-cyan-800 rounded-2xl font-bold text-sm shadow-2xl transition transform hover:scale-[1.02] " +
              (btnVisible
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-6 scale-98 pointer-events-none");

            return (
              <button
                key={i}
                onClick={() => chooseAndReload(c.next)}
                className={baseClasses}
                style={{
                  transitionProperty: "opacity, transform",
                  transitionDuration: `${BUTTON_ENTRANCE_MS}ms`,
                  transitionTimingFunction: "cubic-bezier(.2,.9,.2,1)",
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .animate-blink {
          animation: blink 1s steps(2, start) infinite;
          opacity: 1;
        }
        @keyframes blink {
          to {
            visibility: hidden;
          }
        }
      `}</style>
    </main>
  );
}
