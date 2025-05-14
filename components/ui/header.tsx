"use client"

import type { RefObject } from "react"

interface HeaderProps {
  timestampRef: RefObject<HTMLDivElement>
}

export function Header({ timestampRef }: HeaderProps) {
  return (
    <div className="header">
      <div className="header-item"></div>
      <div className="header-item">
        GSAP.INERTIA.WEBFLOW.TIMELINE
        <br />
        v3.13.0
      </div>
      <div className="header-item" ref={timestampRef}>
        TIME: 00:00:00
      </div>
    </div>
  )
}
