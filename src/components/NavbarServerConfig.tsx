"use client";
import { useEffect } from "react";
import { useNavbar } from "@/hooks/useNavbar";

type UseNavbarReturnType = ReturnType<typeof useNavbar>;

type Props = Partial<{
  [K in keyof UseNavbarReturnType]: UseNavbarReturnType[K] extends (
    arg: infer P
  ) => any
    ? P
    : never;
}>;

export function NavbarServerConfig(props: Props) {
  const navbar = useNavbar();

  useEffect(() => {
    for (const k in props) {
      const key = k as keyof typeof props;
      const value = props[key];

      if (
        value !== undefined &&
        key in navbar &&
        typeof navbar[key] !== "boolean"
      ) {
        (navbar[key] as any)(value);
      }
    }
  }, [props]);
  return null;
}
