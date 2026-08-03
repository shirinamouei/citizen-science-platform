"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/home.module.css";

interface Step {
  title: string;
  description: string;
}

const PHASE_DURATION = 5000;

export default function WalkthroughAnimation({
  steps,
  todayLabel,
  priorDates,
}: {
  steps: Step[];
  todayLabel: string;
  priorDates: string[];
}) {
  const [{ activeIndex, playTokens }, setPhase] = useState<{ activeIndex: number; playTokens: number[] }>(() => ({
    activeIndex: 0,
    playTokens: steps.map((_, i) => (i === 0 ? 1 : 0)),
  }));
  const [paused, setPaused] = useState(false);
  const reducedMotionRef = useRef(false);

  const goToPhase = (index: number) => {
    setPhase((prev) => ({
      activeIndex: index,
      playTokens: prev.playTokens.map((token, i) => (i === index ? token + 1 : token)),
    }));
  };

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (paused || reducedMotionRef.current) return;
    const id = setInterval(() => {
      goToPhase((activeIndex + 1) % steps.length);
    }, PHASE_DURATION);
    return () => clearInterval(id);
  }, [paused, activeIndex, steps.length]);

  const handleDotEnter = (index: number) => {
    setPaused(true);
    goToPhase(index);
  };
  const handleDotLeave = () => setPaused(false);

  return (
    <div
      className={styles.walkthrough}
      aria-label="Animated walkthrough: log a dose, upload it securely, anonymize it, and it joins the dataset"
    >
      <div className={styles.walkthroughStage} aria-hidden="true">
        {/* Phase 1: write a journal entry */}
        <div className={`${styles.phase} ${activeIndex === 0 ? styles.phaseActive : ""}`}>
          <div className={styles.journalCard} key={`journal-${playTokens[0]}`}>
            <div className={styles.journalDate}>
              <span className={`${styles.typeLine} ${styles.typeDate}`}>{todayLabel}</span>
            </div>
            <div className={styles.journalBody}>
              <span className={`${styles.typeLine} ${styles.typeLine1}`}>Day 12 of taper — 37.5mg dose today.</span>
              <span className={`${styles.typeLine} ${styles.typeLine2}`}>Mild dizziness this morning, better now.</span>
              <span className={`${styles.typeLine} ${styles.typeLine3}`}>
                Sleep and appetite both back to normal.
                <span className={styles.cursor}></span>
              </span>
            </div>
          </div>
        </div>

        {/* Phase 2: securely uploaded */}
        <div className={`${styles.phase} ${activeIndex === 1 ? styles.phaseActive : ""}`}>
          <div key={`upload-${playTokens[1]}`} style={{ display: "contents" }}>
            <div className={styles.journalCardMini}>
              <div className={styles.journalDate}>{todayLabel}</div>
              <div className={styles.journalSnippet}>Day 12 of taper — 37.5mg dose today. Mild dizziness this morning...</div>
            </div>
            <div className={`btn btn-primary ${styles.mockUploadBtn}`}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                <path d="M12 3v9m0-9l-3.5 3.5M12 3l3.5 3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 15v3a2 2 0 002 2h10a2 2 0 002-2v-3" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Upload Data
            </div>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill}></div>
            </div>
          </div>
        </div>

        {/* Phase 3: anonymized */}
        <div className={`${styles.phase} ${activeIndex === 2 ? styles.phaseActive : ""}`}>
          <div key={`anon-${playTokens[2]}`} style={{ display: "contents" }}>
            <div className={styles.checkBadge}>
              <svg viewBox="0 0 24 24" width="42" height="42" fill="none">
                <path d="M6 12.5l4 4 8-9" stroke="#1a7f4a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className={styles.anonLabel}>No identifying information included</div>
          </div>
        </div>

        {/* Phase 4: joins the dataset */}
        <div className={`${styles.phase} ${activeIndex === 3 ? styles.phaseActive : ""}`}>
          <div className={styles.datasetList} key={`dataset-${playTokens[3]}`}>
            <div className={`${styles.datasetRow} ${styles.datasetRowNew}`}>
              <span className={styles.datasetDot}></span>
              {todayLabel} · Anonymous contributor
            </div>
            <div className={`${styles.datasetRow} ${styles.datasetRowOld}`}>{priorDates[0]} · Anonymous contributor</div>
            <div className={`${styles.datasetRow} ${styles.datasetRowOld}`}>{priorDates[1]} · Anonymous contributor</div>
            <div className={`${styles.datasetRow} ${styles.datasetRowOld}`}>{priorDates[2]} · Anonymous contributor</div>
          </div>
        </div>
      </div>

      <div className={styles.walkthroughCaption}>
        {steps.map((step, index) => (
          <div
            key={step.title}
            className={`${styles.captionItem} ${index === activeIndex ? styles.captionItemActive : ""}`}
          >
            <h3>
              <span className={styles.captionStepNum}>{index + 1}</span>
              {step.title}
            </h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>

      <div className={styles.captionDots}>
        {steps.map((step, index) => (
          <button
            key={step.title}
            type="button"
            className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ""}`}
            aria-label={`Show step ${index + 1}: ${step.title}`}
            onMouseEnter={() => handleDotEnter(index)}
            onMouseLeave={handleDotLeave}
            onFocus={() => handleDotEnter(index)}
            onBlur={handleDotLeave}
          ></button>
        ))}
      </div>
    </div>
  );
}
