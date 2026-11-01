"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { DemoFrame } from "./DemoFrame";
import styles from "./Demos.module.css";

interface LayerRule {
  name: string;
  color: string;
}

const INITIAL_LAYERS: LayerRule[] = [
  { name: "reset", color: "#8c8a83" },
  { name: "framework", color: "#4a90d9" },
  { name: "components", color: "#8fb996" },
];
const UNLAYERED_COLOR = "#d97757";
const SCOPE = "[data-layer-demo]";

/** 지금 상태로 실제 CSS 를 만든다 — 어느 규칙이 이기는지는 브라우저가 계산하고, 데모는 그 결과를 읽기만 한다 */
function buildCss(layers: LayerRule[], withUnlayered: boolean, importantLayer: string | null): string {
  const order = `@layer ${layers.map((layer) => layer.name).join(", ")};`;
  const layered = layers.map(
    (layer) =>
      `@layer ${layer.name} { ${SCOPE} .target { background-color: ${layer.color}${importantLayer === layer.name ? " !important" : ""}; } }`
  );
  const unlayered = withUnlayered ? [`${SCOPE} .target { background-color: ${UNLAYERED_COLOR}; }`] : [];
  return [order, ...layered, ...unlayered].join("\n");
}

/** 화면에 보여 줄 짧은 CSS */
function describeCss(layers: LayerRule[], withUnlayered: boolean, importantLayer: string | null): string {
  const lines = [`@layer ${layers.map((layer) => layer.name).join(", ")};`, ""];
  for (const layer of layers) {
    const important = importantLayer === layer.name ? " !important" : "";
    lines.push(`@layer ${layer.name} { .button { background: ${layer.color}${important}; } }`);
  }
  if (withUnlayered) lines.push(`.button { background: ${UNLAYERED_COLOR}; } /* 레이어 밖 */`);
  return lines.join("\n");
}

function toHex(rgb: string): string {
  const [r, g, b] = rgb.match(/\d+/g)!.map(Number);
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

/** 레이어 순서·레이어 밖 규칙·!important 를 바꿔 가며 어떤 색이 이기는지 본다 */
export function CascadeLayerDemo() {
  const [layers, setLayers] = useState(INITIAL_LAYERS);
  const [withUnlayered, setWithUnlayered] = useState(false);
  const [importantLayer, setImportantLayer] = useState<string | null>(null);
  const [winnerColor, setWinnerColor] = useState("");
  const targetRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    if (targetRef.current) setWinnerColor(toHex(getComputedStyle(targetRef.current).backgroundColor));
  }, [layers, withUnlayered, importantLayer]);

  const move = (index: number, offset: -1 | 1) => {
    const next = [...layers];
    const [picked] = next.splice(index, 1);
    next.splice(index + offset, 0, picked);
    setLayers(next);
  };

  const winnerName = (() => {
    if (withUnlayered && winnerColor === UNLAYERED_COLOR) return "레이어 밖 규칙";
    return layers.find((layer) => layer.color === winnerColor)?.name ?? "";
  })();

  return (
    <DemoFrame title="@layer 순서를 바꾸면 무엇이 이길까" hint="위·아래로 순서를 바꾸고 옵션을 켜 보세요">
      <style>{buildCss(layers, withUnlayered, importantLayer)}</style>
      <div className={styles.cascadeGrid}>
        <div>
          <p className={styles.readout} style={{ marginBottom: 8 }}>
            선언 순서 — 아래로 갈수록 나중(일반 규칙에서는 나중이 이김)
          </p>
          <div className={styles.layers}>
            {layers.map((layer, index) => (
              <div key={layer.name} className={styles.layer} data-winner={winnerName === layer.name}>
                <span className={styles.swatch} style={{ background: layer.color }} />
                <span className={styles.layerName}>
                  @layer {layer.name}
                  {importantLayer === layer.name && <small>!important</small>}
                </span>
                <span className={styles.order}>
                  <button type="button" className={styles.button} disabled={index === 0} onClick={() => move(index, -1)} aria-label={`${layer.name} 위로`}>
                    ↑
                  </button>
                  <button type="button" className={styles.button} disabled={index === layers.length - 1} onClick={() => move(index, 1)} aria-label={`${layer.name} 아래로`}>
                    ↓
                  </button>
                </span>
              </div>
            ))}
          </div>
          <div className={styles.controls} style={{ marginTop: 14, marginBottom: 0 }}>
            <button type="button" className={styles.button} aria-pressed={withUnlayered} onClick={() => setWithUnlayered(!withUnlayered)}>
              레이어 밖 규칙 추가
            </button>
            <button
              type="button"
              className={styles.button}
              aria-pressed={importantLayer === layers[0].name}
              onClick={() => setImportantLayer(importantLayer ? null : layers[0].name)}
            >
              맨 앞 레이어에 !important
            </button>
          </div>
        </div>

        <div className={styles.preview} data-layer-demo>
          <button ref={targetRef} type="button" className="target" style={targetStyle} tabIndex={-1}>
            .button
          </button>
          <span className={styles.readout}>
            이긴 규칙 <strong>{winnerName}</strong>
          </span>
        </div>
      </div>
      <pre className={styles.code}>{describeCss(layers, withUnlayered, importantLayer)}</pre>
    </DemoFrame>
  );
}

const targetStyle = {
  padding: "14px 28px",
  border: 0,
  borderRadius: 10,
  color: "#111110",
  fontFamily: "var(--blog-mono)",
  fontSize: 15,
  fontWeight: 700,
  // transition 을 두면 getComputedStyle 이 바뀌는 중간 색을 돌려줘 승자를 잘못 읽는다
} as const;
