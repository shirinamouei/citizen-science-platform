"use client";

import { useState } from "react";
import { useMedicationCatalog } from "@/lib/medication-catalog";
import styles from "./MedicationAutocomplete.module.css";

export function MedicationAutocomplete({
  id,
  name,
  label = "Medication",
  hint = "Start typing to see matches",
  placeholder = "e.g. Sertraline (Zoloft)",
  required,
}: {
  id?: string;
  name: string;
  label?: string;
  hint?: string;
  placeholder?: string;
  required?: boolean;
}) {
  const catalog = useMedicationCatalog();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const query = value.trim().toLowerCase();
  const matches = query === "" ? [] : catalog.filter((m) => m.toLowerCase().includes(query)).slice(0, 6);

  function choose(option: string) {
    setValue(option);
    setOpen(false);
  }

  return (
    <div className={styles.field}>
      <label htmlFor={id}>
        {label} <span className={styles.hint}>{hint}</span>
      </label>
      <input
        id={id}
        type="text"
        name={name}
        autoComplete="off"
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
          setHighlight(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 100)}
        onKeyDown={(e) => {
          if (!open || matches.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, matches.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            choose(matches[highlight]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {open && matches.length > 0 && (
        <ul className={styles.list}>
          {matches.map((option, i) => (
            <li
              key={option}
              className={`${styles.item} ${i === highlight ? styles.itemActive : ""}`}
              onMouseDown={() => choose(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
