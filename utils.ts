@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Outfit", sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  --color-bg: #050505;
  --color-accent: #00f2ff;
  --color-accent-dim: rgba(0, 242, 255, 0.1);
  --color-surface: rgba(15, 15, 20, 0.7);
  --color-border: rgba(255, 255, 255, 0.08);
}

@layer base {
  body {
    @apply bg-bg text-white font-sans antialiased;
    background-image: 
      radial-gradient(circle at 10% 20%, rgba(112, 0, 255, 0.03) 0%, transparent 40%),
      radial-gradient(circle at 90% 80%, rgba(0, 242, 255, 0.03) 0%, transparent 40%);
    background-attachment: fixed;
  }
}

/* Premium Grain Overlay - Subtly reduced */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.02'/%3E%3C/svg%3E");
  opacity: 0.3;
  mix-blend-mode: overlay;
}

::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 10px;
}
