"use client"

import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

interface ThreeJSOptions {
  rotationSpeed: number
  resolution: number
  distortion: number
  audioReactivity: number
  audioSensitivity: number
}

export function setupThreeJS(container: HTMLElement, options: ThreeJSOptions) {
  let scene: THREE.Scene
  let camera: THREE.PerspectiveCamera
  let renderer: THREE.WebGLRenderer
  let controls: OrbitControls
  let anomalyObject: THREE.Group
  let satelliteGlobes: THREE.Group[] = []
  const satelliteCount = 4
  const clock = new THREE.Clock()

  // Anomaly interaction state
  let isDraggingAnomaly = false
  const anomalyVelocity = new THREE.Vector2(0, 0)
  const anomalyTargetPosition = new THREE.Vector3(0, 0, 0)
  const defaultCameraPosition = new THREE.Vector3(0, 0, 10)
  const zoomedCameraPosition = new THREE.Vector3(0, 0, 7)

  // Initialize Three.js scene
  function init() {
    // Create scene
    scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x0a0e17, 0.05)

    // Create camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.copy(defaultCameraPosition)

    // Create renderer
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
      stencil: false,
      depth: true,
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    // Create controls
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.1
    controls.rotateSpeed = 0.5
    controls.zoomSpeed = 0.7
    controls.panSpeed = 0.8
    controls.minDistance = 3
    controls.maxDistance = 30
    controls.enableZoom = false

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
    directionalLight.position.set(1, 1, 1)
    scene.add(directionalLight)

    const pointLight1 = new THREE.PointLight(0xff4e42, 1, 10)
    pointLight1.position.set(2, 2, 2)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0xc2362f, 1, 10)
    pointLight2.position.set(-2, -2, -2)
    scene.add(pointLight2)

    // Create anomaly object
    createAnomalyObject()

    // Create satellite globes
    createSatelliteGlobes()

    // Create background particles
    createBackgroundParticles()

    // Handle window resize
    window.addEventListener("resize", onWindowResize)

    // Setup anomaly dragging
    setupAnomalyDragging()

    // Start animation loop
    animate()
  }

  // Create anomaly object
  function createAnomalyObject() {
    if (anomalyObject) {
      scene.remove(anomalyObject)
    }

    anomalyObject = new THREE.Group()
    // Apply the 15% reduction from config
    const radius = 0.784 * 0.85 // Further reduced by 15%

    // Create outer wireframe sphere
    const outerGeometry = new THREE.IcosahedronGeometry(radius, Math.max(1, Math.floor(options.resolution / 8)))

    const outerMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0xff4e42) },
        audioLevel: { value: 0 },
        distortion: { value: options.distortion },
      },
      vertexShader: `
        uniform float time;
        uniform float audioLevel;
        uniform float distortion;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        // Simplex noise functions
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        
        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          
          i = mod289(i);
          vec4 p = permute(permute(permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          
          vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          
          vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
        }
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          
          float slowTime = time * 0.3;
          vec3 pos = position;
          
          float noise = snoise(vec3(position.x * 0.5, position.y * 0.5, position.z * 0.5 + slowTime));
          pos += normal * noise * 0.2 * distortion * (1.0 + audioLevel);
          
          vPosition = pos;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        uniform float audioLevel;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vec3 viewDirection = normalize(cameraPosition - vPosition);
          float fresnel = 1.0 - max(0.0, dot(viewDirection, vNormal));
          fresnel = pow(fresnel, 2.0 + audioLevel * 2.0);
          
          float pulse = 0.8 + 0.2 * sin(time * 2.0);
          
          vec3 finalColor = color * fresnel * pulse * (1.0 + audioLevel * 0.8);
          
          float alpha = fresnel * (0.7 - audioLevel * 0.3);
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      wireframe: true,
      transparent: true,
    })

    const outerSphere = new THREE.Mesh(outerGeometry, outerMaterial)
    anomalyObject.add(outerSphere)

    // Create glow sphere
    const glowGeometry = new THREE.SphereGeometry(radius * 1.2, 32, 32)
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0xff4e42) },
        audioLevel: { value: 0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform float audioLevel;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position * (1.0 + audioLevel * 0.2);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform vec3 color;
        uniform float time;
        uniform float audioLevel;
        
        void main() {
          vec3 viewDirection = normalize(cameraPosition - vPosition);
          float fresnel = 1.0 - max(0.0, dot(viewDirection, vNormal));
          fresnel = pow(fresnel, 3.0 + audioLevel * 3.0);
          
          float pulse = 0.5 + 0.5 * sin(time * 2.0);
          float audioFactor = 1.0 + audioLevel * 3.0;
          
          vec3 finalColor = color * fresnel * (0.8 + 0.2 * pulse) * audioFactor;
          
          float alpha = fresnel * (0.3 * audioFactor) * (1.0 - audioLevel * 0.2);
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial)
    anomalyObject.add(glowSphere)

    scene.add(anomalyObject)
  }

  // Create satellite globes that orbit around the main anomaly
  function createSatelliteGlobes() {
    // Remove any existing satellite globes
    satelliteGlobes.forEach((globe) => {
      scene.remove(globe)
    })
    satelliteGlobes = []

    // Create new satellite globes
    for (let i = 0; i < satelliteCount; i++) {
      const satelliteGroup = new THREE.Group()
      const satelliteRadius = 0.4 * 0.85 // Also reduced by 15%

      // Position satellites in a circle around the main anomaly
      const angle = (i / satelliteCount) * Math.PI * 2
      const distance = 3 // Distance from center (closer to main orb)
      satelliteGroup.position.x = Math.cos(angle) * distance
      satelliteGroup.position.y = Math.sin(angle) * distance

      // Create outer wireframe sphere for satellite
      const outerGeometry = new THREE.IcosahedronGeometry(
        satelliteRadius,
        Math.max(1, Math.floor(options.resolution / 10)),
      )

      const outerMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color: { value: new THREE.Color(0xff4e42) },
          audioLevel: { value: 0 },
          distortion: { value: options.distortion * 0.8 },
          satelliteIndex: { value: i },
        },
        vertexShader: `
          uniform float time;
          uniform float audioLevel;
          uniform float distortion;
          uniform float satelliteIndex;
          varying vec3 vNormal;
          varying vec3 vPosition;
          
          // Simplex noise functions
          vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
          vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
          vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
          vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
          
          float snoise(vec3 v) {
            const vec2 C = vec2(1.0/6.0, 1.0/3.0);
            const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
            
            vec3 i  = floor(v + dot(v, C.yyy));
            vec3 x0 = v - i + dot(i, C.xxx);
            
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min(g.xyz, l.zxy);
            vec3 i2 = max(g.xyz, l.zxy);
            
            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy;
            vec3 x3 = x0 - D.yyy;
            
            i = mod289(i);
            vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                  
            float n_ = 0.142857142857;
            vec3 ns = n_ * D.wyz - D.xzx;
            
            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
            
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_);
            
            vec4 x = x_ *ns.x + ns.yyyy;
            vec4 y = y_ *ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);
            
            vec4 b0 = vec4(x.xy, y.xy);
            vec4 b1 = vec4(x.zw, y.zw);
            
            vec4 s0 = floor(b0)*2.0 + 1.0;
            vec4 s1 = floor(b1)*2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));
            
            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
            
            vec3 p0 = vec3(a0.xy, h.x);
            vec3 p1 = vec3(a0.zw, h.y);
            vec3 p2 = vec3(a1.xy, h.z);
            vec3 p3 = vec3(a1.zw, h.w);
            
            vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
            p0 *= norm.x;
            p1 *= norm.y;
            p2 *= norm.z;
            p3 *= norm.w;
            
            vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
            m = m * m;
            return 42.0 * dot(m*m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
          }
          
          void main() {
            vNormal = normalize(normalMatrix * normal);
            
            float slowTime = time * 0.3 + satelliteIndex * 1.5;
            vec3 pos = position;
            
            float noise = snoise(vec3(position.x * 0.5, position.y * 0.5, position.z * 0.5 + slowTime));
            pos += normal * noise * 0.2 * distortion * (1.0 + audioLevel);
            
            vPosition = pos;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform vec3 color;
          uniform float audioLevel;
          uniform float satelliteIndex;
          varying vec3 vNormal;
          varying vec3 vPosition;
          
          void main() {
            vec3 viewDirection = normalize(cameraPosition - vPosition);
            float fresnel = 1.0 - max(0.0, dot(viewDirection, vNormal));
            fresnel = pow(fresnel, 2.0 + audioLevel * 2.0);
            
            float pulse = 0.8 + 0.2 * sin(time * 2.0 + satelliteIndex);
            
            // Slightly different color for each satellite
            vec3 baseColor = color;
            if (satelliteIndex == 0.0) {
              baseColor = vec3(1.0, 0.5, 0.4); // More orange
            } else if (satelliteIndex == 1.0) {
              baseColor = vec3(1.0, 0.3, 0.3); // More red
            } else if (satelliteIndex == 2.0) {
              baseColor = vec3(0.9, 0.4, 0.5); // More pink
            } else {
              baseColor = vec3(1.0, 0.6, 0.3); // More amber
            }
            
            vec3 finalColor = baseColor * fresnel * pulse * (1.0 + audioLevel * 0.8);
            
            float alpha = fresnel * (0.7 - audioLevel * 0.3);
            
            gl_FragColor = vec4(finalColor, alpha);
          }
        `,
        wireframe: true,
        transparent: true,
      })

      const outerSphere = new THREE.Mesh(outerGeometry, outerMaterial)
      satelliteGroup.add(outerSphere)

      // Create glow sphere for satellite
      const glowGeometry = new THREE.SphereGeometry(satelliteRadius * 1.2, 24, 24)
      const glowMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color: { value: new THREE.Color(0xff4e42) },
          audioLevel: { value: 0 },
          satelliteIndex: { value: i },
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;
          uniform float audioLevel;
          
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position * (1.0 + audioLevel * 0.2);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;
          uniform vec3 color;
          uniform float time;
          uniform float audioLevel;
          uniform float satelliteIndex;
          
          void main() {
            vec3 viewDirection = normalize(cameraPosition - vPosition);
            float fresnel = 1.0 - max(0.0, dot(viewDirection, vNormal));
            fresnel = pow(fresnel, 3.0 + audioLevel * 3.0);
            
            float pulse = 0.5 + 0.5 * sin(time * 2.0 + satelliteIndex * 0.5);
            float audioFactor = 1.0 + audioLevel * 3.0;
            
            // Slightly different color for each satellite
            vec3 baseColor = color;
            if (satelliteIndex == 0.0) {
              baseColor = vec3(1.0, 0.5, 0.4); // More orange
            } else if (satelliteIndex == 1.0) {
              baseColor = vec3(1.0, 0.3, 0.3); // More red
            } else if (satelliteIndex == 2.0) {
              baseColor = vec3(0.9, 0.4, 0.5); // More pink
            } else {
              baseColor = vec3(1.0, 0.6, 0.3); // More amber
            }
            
            vec3 finalColor = baseColor * fresnel * (0.8 + 0.2 * pulse) * audioFactor;
            
            float alpha = fresnel * (0.3 * audioFactor) * (1.0 - audioLevel * 0.2);
            
            gl_FragColor = vec4(finalColor, alpha);
          }
        `,
        transparent: true,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })

      const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial)
      satelliteGroup.add(glowSphere)

      // Add to scene and store reference
      scene.add(satelliteGroup)
      satelliteGlobes.push(satelliteGroup)
    }
  }

  // Create background particles
  function createBackgroundParticles() {
    const particlesGeometry = new THREE.BufferGeometry()
    // Reduce particle count from 3000 to 1500
    const particleCount = 1500

    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)

    const color1 = new THREE.Color(0xff4e42)
    const color2 = new THREE.Color(0xc2362f)
    const color3 = new THREE.Color(0xffb3ab)

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100

      let color
      const colorChoice = Math.random()
      if (colorChoice < 0.33) {
        color = color1
      } else if (colorChoice < 0.66) {
        color = color2
      } else {
        color = color3
      }

      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b

      sizes[i] = 0.05
    }

    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    particlesGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1))

    const particlesMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        uniform float time;
        
        void main() {
          vColor = color;
          
          vec3 pos = position;
          pos.x += sin(time * 0.1 + position.z * 0.2) * 0.05;
          pos.y += cos(time * 0.1 + position.x * 0.2) * 0.05;
          pos.z += sin(time * 0.1 + position.y * 0.2) * 0.05;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          float r = distance(gl_PointCoord, vec2(0.5, 0.5));
          if (r > 0.5) discard;
          
          float glow = 1.0 - (r * 2.0);
          glow = pow(glow, 2.0);
          
          gl_FragColor = vec4(vColor, glow);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    })

    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particles)
  }

  // Setup anomaly dragging
  function setupAnomalyDragging() {
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    let isDragging = false
    const dragStartPosition = new THREE.Vector2()
    const maxDragDistance = 3

    container.addEventListener("mousedown", (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObject(anomalyObject, true)

      if (intersects.length > 0) {
        controls.enabled = false
        isDragging = true
        isDraggingAnomaly = true
        dragStartPosition.x = mouse.x
        dragStartPosition.y = mouse.y

        // Add terminal message
        const terminalContent = document.getElementById("terminal-content")
        if (terminalContent) {
          const newLine = document.createElement("div")
          newLine.className = "terminal-line command-line"
          newLine.textContent = "ANOMALY INTERACTION DETECTED. PHYSICS SIMULATION ACTIVE."
          terminalContent.appendChild(newLine)
          terminalContent.scrollTop = terminalContent.scrollHeight
        }

        // Show notification
        const notification = document.getElementById("notification")
        if (notification) {
          notification.textContent = "ANOMALY INTERACTION DETECTED"
          notification.style.opacity = "1"
          setTimeout(() => {
            notification.style.opacity = "0"
          }, 3000)
        }
      }
    })

    container.addEventListener("mousemove", (event) => {
      if (!isDragging) return

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      // Fix the drag direction to match mouse movement
      const deltaX = (mouse.x - dragStartPosition.x) * 5
      const deltaY = (mouse.y - dragStartPosition.y) * 5

      anomalyTargetPosition.x += deltaX
      anomalyTargetPosition.y += deltaY

      const distance = Math.sqrt(
        anomalyTargetPosition.x * anomalyTargetPosition.x + anomalyTargetPosition.y * anomalyTargetPosition.y,
      )

      if (distance > maxDragDistance) {
        const scale = maxDragDistance / distance
        anomalyTargetPosition.x *= scale
        anomalyTargetPosition.y *= scale
      }

      anomalyVelocity.x = deltaX * 2
      anomalyVelocity.y = deltaY * 2

      dragStartPosition.x = mouse.x
      dragStartPosition.y = mouse.y
    })

    container.addEventListener("mouseup", () => {
      if (isDragging) {
        controls.enabled = true
        isDragging = false
        isDraggingAnomaly = false

        // Add terminal message
        const terminalContent = document.getElementById("terminal-content")
        if (terminalContent) {
          const newLine = document.createElement("div")
          newLine.className = "terminal-line command-line"
          newLine.textContent = `INERTIAPLUGIN.TRACK('#ANOMALY', {THROWRESISTANCE: 0.45, VELOCITY: {X: ${anomalyVelocity.x.toFixed(2)}, Y: ${anomalyVelocity.y.toFixed(2)}}});`
          terminalContent.appendChild(newLine)
          terminalContent.scrollTop = terminalContent.scrollHeight
        }
      }
    })

    container.addEventListener("mouseleave", () => {
      if (isDragging) {
        controls.enabled = true
        isDragging = false
        isDraggingAnomaly = false
      }
    })
  }

  // Update anomaly position
  function updateAnomalyPosition() {
    if (!isDraggingAnomaly) {
      anomalyVelocity.x *= 0.95
      anomalyVelocity.y *= 0.95

      anomalyTargetPosition.x += anomalyVelocity.x * 0.1
      anomalyTargetPosition.y += anomalyVelocity.y * 0.1

      const springStrength = 0.1
      anomalyVelocity.x -= anomalyTargetPosition.x * springStrength
      anomalyVelocity.y -= anomalyTargetPosition.y * springStrength

      if (Math.abs(anomalyTargetPosition.x) < 0.05 && Math.abs(anomalyTargetPosition.y) < 0.05) {
        anomalyTargetPosition.set(0, 0, 0)
        anomalyVelocity.set(0, 0)
      }

      const bounceThreshold = 3
      const bounceDamping = 0.8

      if (Math.abs(anomalyTargetPosition.x) > bounceThreshold) {
        anomalyVelocity.x = -anomalyVelocity.x * bounceDamping
        anomalyTargetPosition.x = Math.sign(anomalyTargetPosition.x) * bounceThreshold

        if (Math.abs(anomalyVelocity.x) > 0.1) {
          // Add terminal message
          const terminalContent = document.getElementById("terminal-content")
          if (terminalContent) {
            const newLine = document.createElement("div")
            newLine.className = "terminal-line"
            newLine.textContent =
              "ANOMALY BOUNDARY COLLISION DETECTED. ENERGY TRANSFER: " +
              (Math.abs(anomalyVelocity.x) * 100).toFixed(0) +
              " UNITS"
            terminalContent.appendChild(newLine)
            terminalContent.scrollTop = terminalContent.scrollHeight
          }
        }
      }

      if (Math.abs(anomalyTargetPosition.y) > bounceThreshold) {
        anomalyVelocity.y = -anomalyVelocity.y * bounceDamping
        anomalyTargetPosition.y = Math.sign(anomalyTargetPosition.y) * bounceThreshold

        if (Math.abs(anomalyVelocity.y) > 0.1) {
          // Add terminal message
          const terminalContent = document.getElementById("terminal-content")
          if (terminalContent) {
            const newLine = document.createElement("div")
            newLine.className = "terminal-line"
            newLine.textContent =
              "ANOMALY BOUNDARY COLLISION DETECTED. ENERGY TRANSFER: " +
              (Math.abs(anomalyVelocity.y) * 100).toFixed(0) +
              " UNITS"
            terminalContent.appendChild(newLine)
            terminalContent.scrollTop = terminalContent.scrollHeight
          }
        }
      }
    }

    anomalyObject.position.x += (anomalyTargetPosition.x - anomalyObject.position.x) * 0.2
    anomalyObject.position.y += (anomalyTargetPosition.y - anomalyObject.position.y) * 0.2

    if (!isDraggingAnomaly) {
      anomalyObject.rotation.x += anomalyVelocity.y * 0.01
      anomalyObject.rotation.y += anomalyVelocity.x * 0.01
    }
  }

  // Update satellite globe positions
  function updateSatellitePositions(time: number) {
    const baseSpeed = options.rotationSpeed * 0.05 // Changed from 0.1 to 0.05
    const audioLevel = document.querySelector(".circular-visualizer")?.getAttribute("data-audio-level")
    const audioFactor = audioLevel ? 1 + Number.parseFloat(audioLevel) * options.audioReactivity * 0.5 : 1 // Added * 0.5

    satelliteGlobes.forEach((globe, index) => {
      // Calculate orbit position
      const orbitSpeed = baseSpeed * (1 + index * 0.2) * audioFactor
      const orbitRadius = 3 + index * 0.3 // Changed from 5 + index * 0.5
      const angle = time * orbitSpeed + (index * Math.PI) / 2

      // Update position
      globe.position.x = Math.cos(angle) * orbitRadius
      globe.position.z = Math.sin(angle) * orbitRadius

      // Add some vertical movement
      globe.position.y = Math.sin(time * 0.5 + index) * 0.5

      // Rotate the globe itself
      globe.rotation.x += 0.0005 * orbitSpeed // Changed from 0.001
      globe.rotation.y += 0.00075 * orbitSpeed // Changed from 0.0015

      // Update shader uniforms
      globe.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
          child.material.uniforms.time.value = time

          if (audioLevel) {
            child.material.uniforms.audioLevel.value = Number.parseFloat(audioLevel)
          }
        }
      })
    })
  }

  // Handle window resize
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  // Animation loop
  let animationFrameId: number

  function animate() {
    animationFrameId = requestAnimationFrame(animate)

    controls.update()

    const time = clock.getElapsedTime()
    let audioLevel = 0

    // Get audio level from analyzer if available
    const audioAnalyser = document.querySelector(".circular-visualizer")?.getAttribute("data-audio-level")
    if (audioAnalyser) {
      audioLevel = Number.parseFloat(audioAnalyser) || 0
    }

    // Update anomaly position
    updateAnomalyPosition()

    // Update satellite globe positions
    updateSatellitePositions(time)

    // Update shader uniforms
    anomalyObject.children.forEach((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
        child.material.uniforms.time.value = time
        child.material.uniforms.audioLevel.value = audioLevel

        if (child.material.uniforms.distortion) {
          child.material.uniforms.distortion.value = options.distortion
        }
      }
    })

    // Update satellite globe uniforms
    satelliteGlobes.forEach((globe, index) => {
      globe.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
          child.material.uniforms.time.value = time
          child.material.uniforms.audioLevel.value = audioLevel

          if (child.material.uniforms.distortion) {
            child.material.uniforms.distortion.value = options.distortion * 0.8
          }
        }
      })
    })

    // Update particle uniforms
    scene.children.forEach((child) => {
      if (child instanceof THREE.Points && child.material instanceof THREE.ShaderMaterial) {
        child.material.uniforms.time.value = time
      }
    })

    // Apply rotation based on slider value
    const rotationSpeed = options.rotationSpeed * 0.25 // Changed from 0.5 to 0.25
    const audioRotationFactor = 1 + audioLevel * options.audioReactivity * 0.3 // Reduced from 0.5 to 0.3

    anomalyObject.rotation.y += 0.001 * rotationSpeed * audioRotationFactor // Changed from 0.002
    anomalyObject.rotation.z += 0.0005 * rotationSpeed * audioRotationFactor // Changed from 0.001

    renderer.render(scene, camera)
  }

  // Initialize
  init()

  // Add context loss/restore handlers
  const canvas = renderer.domElement

  canvas.addEventListener(
    "webglcontextlost",
    (event) => {
      event.preventDefault()
      console.warn("WebGL context lost, stopping animation.")
      // Stop animation loop
      cancelAnimationFrame(animationFrameId)
    },
    false,
  )

  canvas.addEventListener(
    "webglcontextrestored",
    () => {
      console.info("WebGL context restored, re-initializing.")
      // Re-initialize and restart animation
      init()
      animate()
    },
    false,
  )

  // Return methods for external control
  return {
    updateOptions: (newOptions: Partial<ThreeJSOptions>) => {
      Object.assign(options, newOptions)

      // Update anomaly if resolution or distortion changed
      if (newOptions.resolution !== undefined || newOptions.distortion !== undefined) {
        createAnomalyObject()
      }
    },

    zoomCamera: (zoomIn: boolean) => {
      const targetPosition = zoomIn ? zoomedCameraPosition : defaultCameraPosition

      // Animate camera position
      const startPosition = camera.position.clone()
      const duration = 1.5
      const startTime = clock.getElapsedTime()

      function updateCameraPosition() {
        const currentTime = clock.getElapsedTime()
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Ease function (power2.inOut)
        const easeProgress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress

        camera.position.x = startPosition.x + (targetPosition.x - startPosition.x) * easeProgress
        camera.position.y = startPosition.y + (targetPosition.y - startPosition.y) * easeProgress
        camera.position.z = startPosition.z + (targetPosition.z - startPosition.z) * easeProgress

        camera.lookAt(0, 0, 0)

        if (progress < 1) {
          requestAnimationFrame(updateCameraPosition)
        }
      }

      updateCameraPosition()
    },

    // Add cleanup method for proper resource disposal
    cleanup: () => {
      // Cancel animation frame
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }

      // Remove event listeners
      window.removeEventListener("resize", onWindowResize)

      // Dispose of all geometries and materials
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) {
            object.geometry.dispose()
          }

          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose())
            } else {
              object.material.dispose()
            }
          }
        }
      })

      // Dispose of renderer
      renderer.forceContextLoss()
      renderer.dispose()

      // Clear the container
      if (container) {
        container.innerHTML = ""
      }
    },
  }
}
