/* Music Studio Global Styles */
export const globalStyles = `
/* Dark warm theme for music studio */
.musicStudioPage {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%);
  color: #f2efe8;
  font-family: 'Inter', system-ui, sans-serif;
}

/* Glass morphism panels */
.glassPanel {
  background: rgba(15, 15, 25, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(242, 239, 232, 0.08);
  border-radius: 16px;
}

/* Control pad styles */
.controlPad {
  background: rgba(20, 20, 35, 0.8);
  border: 1px solid rgba(242, 239, 232, 0.1);
  border-radius: 20px;
  padding: 24px;
}

/* Volume slider */
.volumeSlider {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: rgba(242, 239, 232, 0.15);
  border-radius: 2px;
  outline: none;
}
.volumeSlider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #f2efe8;
  cursor: pointer;
}
.volumeSlider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #f2efe8;
  cursor: pointer;
  border: none;
}

/* Suno embed container */
.sunoEmbedContainer {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(242, 239, 232, 0.1);
  background: #0a0a0f;
}

/* Waveform placeholder */
.waveformBar {
  display: inline-block;
  width: 3px;
  background: #f2efe8;
  border-radius: 2px;
  animation: waveAnim 0.8s ease-in-out infinite alternate;
}
@keyframes waveAnim {
  from { height: 8px; opacity: 0.4; }
  to { height: 24px; opacity: 1; }
}

/* Genre tag */
.genreTag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(242, 239, 232, 0.15); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(242, 239, 232, 0.25); }
`;
