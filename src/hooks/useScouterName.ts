"use client";
import { useState, useEffect } from "react";

export const SCOUTER_NAME_KEY = "scouter_name";

export function useScouterName() {
  const [name, setNameState] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(SCOUTER_NAME_KEY) ?? "";
    setNameState(stored);
  }, []);

  function setName(value: string) {
    localStorage.setItem(SCOUTER_NAME_KEY, value);
    setNameState(value);
  }

  return { name, setName };
}
