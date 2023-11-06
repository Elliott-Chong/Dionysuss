"use client";
import React from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";

const CopyButton = () => {
  return (
    <Button
      onClick={() => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Copied URL to clipboard");
      }}
    >
      Copy URL
    </Button>
  );
};

export default CopyButton;
