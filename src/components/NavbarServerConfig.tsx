"use client";
import { useEffect } from "react";
import { useNavbar } from "@/hooks/useNavbar";

type Props = {
  setDefaultExpanded?: boolean;
  doMinimalRendering?: boolean;
};

export function NavbarServerConfig({ ...props }: Props) {
  const navbar = useNavbar();
  useEffect(() => {
    if (props.setDefaultExpanded !== undefined) {
      navbar.setDefaultExpanded(props.setDefaultExpanded);
    }
    if (props.doMinimalRendering !== undefined) {
      navbar.doMinimalRendering(props.doMinimalRendering);
    }
  }, [props.setDefaultExpanded, props.doMinimalRendering]);
  return null;
}
