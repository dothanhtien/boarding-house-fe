"use client";

import { useReducer } from "react";
import type { CellDraft, CellErrors } from "./utils";

type ReadingDraftsState = {
  drafts: Record<string, CellDraft>;
  errors: Record<string, CellErrors>;
};

type ReadingDraftsAction =
  | { type: "change"; key: string; field: keyof CellDraft; value: string }
  | { type: "setCellErrors"; key: string; errors: CellErrors }
  | { type: "mergeErrors"; errors: Record<string, CellErrors> }
  | { type: "replaceErrors"; errors: Record<string, CellErrors> }
  | { type: "reset" };

const EMPTY_DRAFT: CellDraft = { currentValue: "", previousValue: "" };

const initialState: ReadingDraftsState = { drafts: {}, errors: {} };

const omit = <T>(record: Record<string, T>, keys: string[]) => {
  const next = { ...record };
  keys.forEach((key) => delete next[key]);
  return next;
};

function reducer(
  state: ReadingDraftsState,
  action: ReadingDraftsAction,
): ReadingDraftsState {
  switch (action.type) {
    case "change":
      return {
        drafts: {
          ...state.drafts,
          [action.key]: {
            ...(state.drafts[action.key] ?? EMPTY_DRAFT),
            [action.field]: action.value,
          },
        },
        errors: omit(state.errors, [action.key]),
      };
    case "setCellErrors":
      return {
        ...state,
        errors: {
          ...omit(state.errors, [action.key]),
          [action.key]: action.errors,
        },
      };
    case "mergeErrors":
      return { ...state, errors: { ...state.errors, ...action.errors } };
    case "replaceErrors":
      return { ...state, errors: action.errors };
    case "reset":
      return initialState;
  }
}

export const isDraftFilled = (draft: CellDraft | undefined) =>
  !!draft &&
  (draft.currentValue.trim() !== "" || draft.previousValue.trim() !== "");

export function useReadingDrafts() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return {
    drafts: state.drafts,
    errors: state.errors,
    changeCell: (key: string, field: keyof CellDraft, value: string) =>
      dispatch({ type: "change", key, field, value }),
    setCellErrors: (key: string, errors: CellErrors) =>
      dispatch({ type: "setCellErrors", key, errors }),
    mergeErrors: (errors: Record<string, CellErrors>) =>
      dispatch({ type: "mergeErrors", errors }),
    replaceErrors: (errors: Record<string, CellErrors>) =>
      dispatch({ type: "replaceErrors", errors }),
    reset: () => dispatch({ type: "reset" }),
  };
}
