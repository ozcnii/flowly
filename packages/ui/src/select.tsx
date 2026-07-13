"use client";

import { Fragment, useEffect, useId, useRef, useState } from "react";
import { cx } from "./utils";

export type SelectOption = { value: string; label: string; group?: string; keywords?: string[]; meta?: string; };

export type SelectProps = {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
};

/**
 * Accessible searchable dropdown (combobox).
 * Trigger button + popover with a filter input and a listbox. Keyboard:
 * type to filter, ArrowUp/Down to move, Enter to select, Esc to close.
 */
export function Select({
  options,
  value,
  onChange,
  placeholder = "Выбрать",
  searchPlaceholder = "Поиск",
  ariaLabel,
  disabled,
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();

  const selected = options.find((o) => o.value === value);
  const q = query.trim().toLowerCase();
  const filtered = q
    ? options.filter((o) => {
        const haystack = [o.label, o.value, o.group ?? "", o.meta ?? "", ...(o.keywords ?? [])].join(" ").toLowerCase();
        return haystack.includes(q);
      })
    : options;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const idx = options.findIndex((o) => o.value === value);
    setActive(idx >= 0 ? idx : 0);
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open, options, value]);

  useEffect(() => {
    if (active >= filtered.length) setActive(Math.max(0, filtered.length - 1));
  }, [filtered.length, active]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-i="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const choose = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[active];
      if (opt) choose(opt.value);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  // group filtered preserving order for optional group headers
  let flatIndex = -1;
  const groups = new Map<string, SelectOption[]>();
  for (const opt of filtered) {
    const key = opt.group ?? "";
    const arr = groups.get(key);
    if (arr) arr.push(opt);
    else groups.set(key, [opt]);
  }

  return (
    <div className={cx("fl-select", className)} ref={rootRef}>
      <button
        type="button"
        className="fl-select__trigger"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={selected ? "" : "fl-select__placeholder"}>
          {selected ? selected.label : placeholder}
        </span>
        <svg className="fl-select__caret" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="fl-select__panel">
          <div className="fl-select__panelHead">
            <input
              ref={inputRef}
              className="fl-select__search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              aria-describedby={`${listboxId}-status`}
              autoComplete="off"
              spellCheck={false}
            />
            {query && (
              <button
                type="button"
                className="fl-select__clear"
                onClick={() => {
                  setQuery("");
                  setActive(0);
                  inputRef.current?.focus();
                }}
                aria-label="Очистить поиск"
              >
                ×
              </button>
            )}
          </div>
          <p id={`${listboxId}-status`} className="fl-select__count" role="status" aria-live="polite">
            {q ? `Найдено ${filtered.length} из ${options.length}` : `Всего ${options.length}`}
          </p>
          <ul ref={listRef} id={listboxId} className="fl-select__list" role="listbox">
            {filtered.length === 0 && <li className="fl-select__empty">Ничего не найдено</li>}
            {[...groups.entries()].map(([group, items]) => (
              <Fragment key={group || "_"}>
                {group && <li className="fl-select__group" role="presentation">{group}</li>}
                {items.map((opt) => {
                  flatIndex += 1;
                  const i = flatIndex;
                  return (
                    <li
                      key={opt.value}
                      data-i={i}
                      role="option"
                      aria-selected={opt.value === value}
                      className={cx(
                        "fl-select__option",
                        i === active && "fl-select__option--active",
                        opt.value === value && "fl-select__option--selected",
                      )}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => choose(opt.value)}
                    >
                      <span className="fl-select__optionMain">
                        <span className="fl-select__optLabel">{opt.label}</span>
                        {opt.group && <span className="fl-select__optGroup">{opt.group}</span>}
                      </span>
                      {opt.meta && <span className="fl-select__optMeta">{opt.meta}</span>}
                    </li>
                  );
                })}
              </Fragment>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
