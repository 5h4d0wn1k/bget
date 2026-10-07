import styles from "./home.module.css";

/**
 * THE CONSTELLATION — the network of people rendered as a single luminous node.
 * A liquid-glass panel whose satellites (the disciplines) are tethered to the
 * hub by pulsing gradient paths with flowing dashes. Pure CSS animation,
 * decorative: hidden from assistive tech, killed by prefers-reduced-motion.
 */

interface Satellite {
  x: number;
  y: number;
  gold?: boolean;
  label: string;
  dy: number; // label offset (+below / -above)
}

const SATELLITES: Satellite[] = [
  { x: 128, y: 100, label: "SCIENCE", dy: 24 },
  { x: 512, y: 96, gold: true, label: "ENGINEERING", dy: 24 },
  { x: 572, y: 254, gold: true, label: "MEDICINE", dy: -18 },
  { x: 250, y: 320, label: "MAKING", dy: -18 },
  { x: 438, y: 308, label: "MINDS", dy: -18 },
];

const CENTER = { x: 320, y: 200 };

/** Gentle bezier from a satellite to the hub. */
function lineToHub(s: Satellite): string {
  const dx = s.x < CENTER.x ? CENTER.x - s.x : s.x - CENTER.x;
  const c1x = s.x + (s.x < CENTER.x ? 1 : -1) * Math.min(dx * 0.5, 90);
  const c1y = s.y + (s.y < CENTER.y ? 1 : -1) * 42;
  return `M ${s.x} ${s.y} C ${c1x} ${c1y}, ${CENTER.x - 34} ${CENTER.y - 30}, ${CENTER.x} ${CENTER.y}`;
}

export default function Constellation() {
  return (
    <div className={styles.node} aria-hidden="true">
      <div className={styles.nodeGlow} />
      <svg className={styles.nodeSvg} viewBox="0 0 640 400" focusable="false">
        <defs>
          <linearGradient id="bgetLine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="10%" stopColor="#a78b71" />
            <stop offset="90%" stopColor="#c9b8a0" />
            <stop offset="100%" stopColor="#e8b84b" />
          </linearGradient>
        </defs>

        {/* faint orbital rings */}
        <ellipse className={styles.nodeRing} cx={CENTER.x} cy={CENTER.y} rx="176" ry="96" />
        <ellipse className={styles.nodeRing} cx={CENTER.x} cy={CENTER.y} rx="124" ry="58" />

        {/* pulsing connections — solid + dashed flow overlay */}
        {SATELLITES.map((s, i) => {
          const d = lineToHub(s);
          return (
            <g key={s.label}>
              <path
                className={styles.nodeLine}
                d={d}
                style={{ animationDelay: `${i * 0.55}s` }}
              />
              <path className={styles.nodeDash} d={d} transform="translate(3 2)" />
            </g>
          );
        })}

        {/* satellite nodes */}
        {SATELLITES.map((s) => (
          <g key={`${s.label}-node`}>
            <circle
              className={s.gold ? styles.nodeSatGold : styles.nodeSat}
              cx={s.x}
              cy={s.y}
              r="5.5"
            />
            <text className={styles.nodeLabel} x={s.x} y={s.y + s.dy}>
              {s.label}
            </text>
          </g>
        ))}

        {/* the hub — radiant core with breathing halos */}
        <circle className={styles.nodeCoreHalo} cx={CENTER.x} cy={CENTER.y} r="15" />
        <circle className={`${styles.nodeCoreHalo} ${styles.nodeCoreHalo2}`} cx={CENTER.x} cy={CENTER.y} r="24" />
        <circle className={styles.nodeCore} cx={CENTER.x} cy={CENTER.y} r="9" />
        <circle className={styles.nodeSatGold} cx={CENTER.x} cy={CENTER.y} r="3.2" />
      </svg>
    </div>
  );
}