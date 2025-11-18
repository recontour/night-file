// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Game from "./game/page";
import MobileMessage from "./components/MobileMessage";

export default function Home() {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkWidth();
    window.addEventListener("resize", checkWidth);

    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  return isMobile ? <Game /> : <MobileMessage />;
}
