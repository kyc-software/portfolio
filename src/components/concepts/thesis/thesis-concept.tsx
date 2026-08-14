import {
  BatteryCharging,
  Bluetooth,
  Check,
  Circle,
  Hand,
  MessageSquareText,
  RotateCcw,
  Thermometer,
  Wifi,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  calibrationSteps,
  connection,
  handNodes,
  jointRows,
  sensorValues,
  translations,
} from "./data";
import "./thesis-concept.css";

function HandMonitor({ side }: { side: "left" | "right" }) {
  const nodes = handNodes[side];

  return (
    <div className="ths-hand-monitor">
      <strong>{side} hand</strong>
      <svg
        viewBox="0 0 100 100"
        role="img"
        aria-label={`${side} glove joint visualization`}
      >
        {nodes.slice(1).map((node, index) => {
          const previous =
            nodes[Math.max(0, index - (index % 4 === 0 ? 0 : 1))] ?? nodes[0];
          return (
            <line
              key={`${node[0]}-${node[1]}`}
              x1={previous[0]}
              y1={previous[1]}
              x2={node[0]}
              y2={node[1]}
            />
          );
        })}
        {nodes.map((node) => (
          <circle key={`${node[0]}-${node[1]}`} cx={node[0]} cy={node[1]} r="2.5" />
        ))}
      </svg>
    </div>
  );
}

export function ThesisConcept() {
  const photoRef = useRef<HTMLDivElement>(null);
  const [selectedHand, setSelectedHand] = useState<"left" | "right">("right");
  const [calibrating, setCalibrating] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(5);
  const [translationIndex, setTranslationIndex] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!calibrating) return;
    if (completedSteps >= calibrationSteps.length) {
      setCalibrating(false);
      setNotice("Calibration complete");
      return;
    }
    const timer = window.setTimeout(() => setCompletedSteps((value) => value + 1), 650);
    return () => window.clearTimeout(timer);
  }, [calibrating, completedSteps]);

  const announce = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2200);
  };

  return (
    <div className="ths-app">
      <header className="ths-header">
        <div className="ths-brand">
          <strong>Visual communication</strong>
          <span>Real-time sign-language translation</span>
        </div>
        <div className="ths-meta">
          <span>University of Kent</span>
          <i />
          <span>MSc thesis · 2018</span>
          <em>Concept</em>
        </div>
      </header>

      <main className="ths-workspace">
        <section
          ref={photoRef}
          className="ths-photo"
          aria-label="Photograph of haptic gloves demonstrating sign language"
          onPointerMove={(event) => {
            const bounds = event.currentTarget.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width - 0.5;
            const y = (event.clientY - bounds.top) / bounds.height - 0.5;
            event.currentTarget.style.setProperty("--ths-x", `${x * 10}px`);
            event.currentTarget.style.setProperty("--ths-y", `${y * 8}px`);
            event.currentTarget.style.setProperty("--ths-rx", `${y * -1.6}deg`);
            event.currentTarget.style.setProperty("--ths-ry", `${x * 2}deg`);
            event.currentTarget.style.setProperty("--ths-light-x", `${50 + x * 22}%`);
            event.currentTarget.style.setProperty("--ths-light-y", `${45 + y * 18}%`);
          }}
          onPointerLeave={(event) => {
            for (const property of ["--ths-x", "--ths-y", "--ths-rx", "--ths-ry"]) {
              event.currentTarget.style.removeProperty(property);
            }
          }}
        >
          <div className="ths-photo-plane" />
          <div className="ths-photo-light" />
          <div className="ths-depth-label">
            <span>Move pointer</span>
            <small>Parallax glove study</small>
          </div>
        </section>

        <section className="ths-console">
          <header>
            <h1>Glove calibration & monitor</h1>
            <span>
              <Wifi /> Live
            </span>
          </header>
          <div className="ths-console-top">
            <section className="ths-connection">
              <h2>Connection</h2>
              <dl>
                {connection.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd className={label === "Status" ? "is-connected" : ""}>
                      {label === "Status" ? <i /> : null}
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="ths-live">
              <h2>Select glove</h2>
              <div className="ths-hand-toggle">
                {(["left", "right"] as const).map((hand) => (
                  <button
                    type="button"
                    key={hand}
                    className={selectedHand === hand ? "is-active" : ""}
                    onClick={() => setSelectedHand(hand)}
                  >
                    <Hand /> {hand} hand
                  </button>
                ))}
              </div>
              <h2>Live visualization</h2>
              <div className="ths-hand-grid">
                <HandMonitor side="left" />
                <HandMonitor side="right" />
              </div>
            </section>

            <section className="ths-calibration">
              <h2>Calibration</h2>
              <Button
                type="button"
                className="ths-primary"
                onClick={() => {
                  setCompletedSteps(0);
                  setCalibrating(true);
                }}
              >
                Start calibration
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setCalibrating(false);
                  setCompletedSteps(0);
                  announce("Rest pose reset");
                }}
              >
                <RotateCcw /> Reset pose capture
              </Button>
              <p>Calibration steps</p>
              <ol>
                {calibrationSteps.map((step, index) => (
                  <li
                    key={step}
                    className={
                      index < completedSteps
                        ? "is-complete"
                        : index === completedSteps && calibrating
                          ? "is-current"
                          : ""
                    }
                  >
                    <span>
                      {index + 1}. {step}
                    </span>
                    {index < completedSteps ? <Check /> : <Circle />}
                  </li>
                ))}
              </ol>
              <Button
                type="button"
                variant="secondary"
                disabled={completedSteps < calibrationSteps.length}
                onClick={() => announce("Calibration saved")}
              >
                Save calibration
              </Button>
            </section>
          </div>

          <section className="ths-tracking">
            <h2>
              Finger tracking <span>(joint angles °)</span>
            </h2>
            <div className="ths-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Joint</th>
                    <th>Thumb</th>
                    <th>Index</th>
                    <th>Middle</th>
                    <th>Ring</th>
                    <th>Pinky</th>
                  </tr>
                </thead>
                <tbody>
                  {jointRows.map((row) => (
                    <tr key={row.joint}>
                      <th>{row.joint}</th>
                      {row[selectedHand].map((value, index) => (
                        <td
                          key={`${row.joint}-${["thumb", "index", "middle", "ring", "pinky"][index]}`}
                        >
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="ths-sensors">
            <h2>Raw sensor values</h2>
            <div>
              {sensorValues.map((sensor) => (
                <span key={sensor.channel}>
                  <small>{sensor.channel}</small>
                  <i>
                    <b style={{ height: `${(sensor.value / 540) * 100}%` }} />
                  </i>
                  <em>{sensor.value}</em>
                </span>
              ))}
            </div>
          </section>

          <section className="ths-translation">
            <MessageSquareText />
            <div>
              <small>Recognized translation</small>
              <strong>{translations[translationIndex]}</strong>
            </div>
            <button
              type="button"
              onClick={() =>
                setTranslationIndex((index) => (index + 1) % translations.length)
              }
            >
              Next sample
            </button>
          </section>

          <aside className="ths-status">
            <h2>System status</h2>
            <div>
              <BatteryCharging />
              <span>Battery left</span>
              <strong>92%</strong>
            </div>
            <div>
              <BatteryCharging />
              <span>Battery right</span>
              <strong>89%</strong>
            </div>
            <div>
              <Thermometer />
              <span>Temperature</span>
              <strong>32.4 °C</strong>
            </div>
            <div>
              <Bluetooth />
              <span>Uptime</span>
              <strong>01:23:47</strong>
            </div>
          </aside>
        </section>
      </main>
      {notice ? (
        <div className="ths-toast" role="status">
          {notice}
        </div>
      ) : null}
    </div>
  );
}
