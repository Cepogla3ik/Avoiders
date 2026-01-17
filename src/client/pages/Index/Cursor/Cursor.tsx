import { useEffect, useRef } from "react";
import styles from "./Cursor.module.scss";

export default function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const position = useRef<{ x: number, y: number }>({ x: -1000, y: -1000 });
  
  useEffect(() => {
    const mouseMove = (e: MouseEvent) => {
      position.current.x = e.clientX;
      position.current.y = e.clientY;
  
      if (cursorRef.current) cursorRef.current.style.transform = `translate3d(${position.current.x}px, ${position.current.y}px, 0)`;
    };

    window.addEventListener("mousemove", mouseMove);
    return () => window.removeEventListener("mousemove", mouseMove);
  }, []);

  return <div className={styles["cursor"]} ref={cursorRef}></div>;
}