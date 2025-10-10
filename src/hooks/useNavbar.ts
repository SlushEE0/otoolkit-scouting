"use client";

import { useSyncExternalStore } from "react";

let navbarState = {
  isDisabled: false,
  renderMinimal: false,
  defaultExpanded: true,
  mobileNavbarSide: "left",
  expanded: true
};

const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return navbarState;
}

const setIsDisabled = (value: boolean) => {
  navbarState = { ...navbarState, isDisabled: value };
  emitChange();
};

const doMinimalRendering = (value: boolean) => {
  navbarState = { ...navbarState, renderMinimal: value };
  emitChange();
};

const setDefaultExpanded = (value: boolean) => {
  navbarState = { ...navbarState, defaultExpanded: value };
  emitChange();
};

const setMobileNavbarSide = (value: "left" | "right") => {
  navbarState = { ...navbarState, mobileNavbarSide: value };
  emitChange();
};

const setExpanded = (value: boolean) => {
  navbarState = { ...navbarState, expanded: value };
  emitChange();
};

export function useNavbar() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    ...state,
    setIsDisabled,
    doMinimalRendering,
    setDefaultExpanded,
    setMobileNavbarSide,
    setExpanded
  } as const;
}
