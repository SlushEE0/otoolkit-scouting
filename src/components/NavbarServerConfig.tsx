"use client";
import { useEffect } from "react";
import { useNavbar } from "@/hooks/useNavbar";

type Props = {
  setDefaultShown?: boolean;
  setRenderOnlyHome?: boolean;
};

export function NavbarServerConfig({ ...props }: Props) {
  const navbar = useNavbar();
  useEffect(() => {
    props.setDefaultShown != undefined
      ? navbar.setDefaultShown(props.setDefaultShown)
      : null;
    props.setRenderOnlyHome != undefined
      ? navbar.setRenderOnlyHome(props.setRenderOnlyHome)
      : null;
  }, []);
  return null;
}
