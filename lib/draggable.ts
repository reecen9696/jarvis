// A simplified version of the Draggable functionality
export class Draggable {
  static create(element: Element | string, options: any) {
    if (typeof element === "string") {
      element = document.querySelector(element) as Element
    }

    if (!element) return

    const el = element as HTMLElement
    const handle = options.handle
      ? ((typeof options.handle === "string" ? document.querySelector(options.handle) : options.handle) as HTMLElement)
      : el

    if (!handle) return

    let isDragging = false
    let startX = 0
    let startY = 0
    let startElX = 0
    let startElY = 0
    let velocityX = 0
    let velocityY = 0
    let lastX = 0
    let lastY = 0
    let lastTime = 0

    // Make sure the element is positioned
    const computedStyle = window.getComputedStyle(el)
    if (computedStyle.position === "static") {
      el.style.position = "absolute"
    }

    // Set initial position if not already set
    if (!el.style.left) {
      el.style.left = "0px"
    }
    if (!el.style.top) {
      el.style.top = "0px"
    }

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true
      startX = e.clientX
      startY = e.clientY
      startElX = Number.parseInt(el.style.left) || 0
      startElY = Number.parseInt(el.style.top) || 0
      lastX = e.clientX
      lastY = e.clientY
      lastTime = Date.now()

      // Bring to front
      const panels = document.querySelectorAll(".terminal-panel, .control-panel, .spectrum-analyzer, .data-panel")
      let maxZ = 10
      panels.forEach((panel) => {
        const z = Number.parseInt(window.getComputedStyle(panel).zIndex)
        if (z > maxZ) maxZ = z
      })
      el.style.zIndex = (maxZ + 1).toString()

      // Call onDragStart callback if provided
      if (options.onDragStart) {
        options.onDragStart.call(el)
      }

      document.addEventListener("mousemove", onMouseMove)
      document.addEventListener("mouseup", onMouseUp)

      e.preventDefault()
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const dx = e.clientX - startX
      const dy = e.clientY - startY

      // Calculate velocity
      const now = Date.now()
      const dt = now - lastTime
      if (dt > 0) {
        velocityX = (e.clientX - lastX) / dt
        velocityY = (e.clientY - lastY) / dt
      }
      lastX = e.clientX
      lastY = e.clientY
      lastTime = now

      // Apply bounds if specified
      let newX = startElX + dx
      let newY = startElY + dy

      if (options.bounds) {
        const bounds = typeof options.bounds === "string" ? document.querySelector(options.bounds) : options.bounds

        if (bounds) {
          const boundRect = bounds.getBoundingClientRect()
          const elRect = el.getBoundingClientRect()

          // Apply edge resistance if specified
          const edgeResistance = options.edgeResistance || 0

          if (newX < 0) {
            newX *= edgeResistance
          } else if (newX + elRect.width > boundRect.width) {
            newX = boundRect.width - elRect.width + (newX + elRect.width - boundRect.width) * edgeResistance
          }

          if (newY < 0) {
            newY *= edgeResistance
          } else if (newY + elRect.height > boundRect.height) {
            newY = boundRect.height - elRect.height + (newY + elRect.height - boundRect.height) * edgeResistance
          }
        }
      }

      el.style.left = `${newX}px`
      el.style.top = `${newY}px`
    }

    const onMouseUp = () => {
      isDragging = false
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)

      // Apply inertia if specified
      if (options.inertia) {
        const inertiaMove = () => {
          velocityX *= 0.95
          velocityY *= 0.95

          const newX = Number.parseInt(el.style.left) + velocityX * 16
          const newY = Number.parseInt(el.style.top) + velocityY * 16

          el.style.left = `${newX}px`
          el.style.top = `${newY}px`

          if (Math.abs(velocityX) > 0.01 || Math.abs(velocityY) > 0.01) {
            requestAnimationFrame(inertiaMove)
          } else if (options.onDragEnd) {
            options.onDragEnd.call(el)
          }
        }

        if (Math.abs(velocityX) > 0.05 || Math.abs(velocityY) > 0.05) {
          requestAnimationFrame(inertiaMove)
        } else if (options.onDragEnd) {
          options.onDragEnd.call(el)
        }
      } else if (options.onDragEnd) {
        options.onDragEnd.call(el)
      }
    }

    handle.addEventListener("mousedown", onMouseDown)

    // Return an object with methods to get velocity
    return {
      getVelocity: (axis: string) => {
        return axis === "x" ? velocityX : velocityY
      },
    }
  }
}
