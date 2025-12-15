import React from "react";

const CORNER_LOGO_SRC = "/branding/recalc-logo.gif";

export default function CornerLogo() {
  return (
    <div
      aria-hidden="true"
      className="fixed bottom-4 right-4 z-50 rounded-full bg-slate-950/60 p-2 ring-1 ring-white/10 shadow-lg backdrop-blur"
    >
      <img
        src={CORNER_LOGO_SRC}
        alt=""
        width={44}
        height={44}
        className="h-11 w-11 rounded-full object-contain"
        loading="lazy"
      />
    </div>
  );
}
