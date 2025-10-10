"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Eye, EyeOff } from "lucide-react";

export default function PasswordBlock(props: any) {
  const [passwordVisible, SETpasswordVisible] = useState(false);

  const attr = {
    ...props,
    type: passwordVisible ? "text" : "password"
  };

  return (
    <div className="flex items-center space-x-2">
      <Input {...attr} />
      <Button
        type="button"
        className="p-0 aspect-square"
        variant={"outline"}
        onClick={() => SETpasswordVisible(!passwordVisible)}>
        {passwordVisible ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
