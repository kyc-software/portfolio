import {
  BellRing,
  ChevronDown,
  Crosshair,
  Layers3,
  LocateFixed,
  LockKeyhole,
  MoreHorizontal,
  Plane,
  RadioTower,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Volume2,
  Wifi,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useMemo, useState } from "react";

import { altitude, communications, layers, timeline, tracks } from "./data";
import "./thales-concept.css";

const waveBars = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"];

function AltitudeChart() {
  const [active, setActive] = useState<number | null>(null);
  const points = altitude.map((value, index) => ({
    x: 8 + (index / (altitude.length - 1)) * 88,
    y: 65 - ((value - 150) / 220) * 48,
    value,
  }));
  const path = points
    .map((point, index) => `${index ? "L" : "M"}${point.x},${point.y}`)
    .join(" ");

  return (
    <div
      className="th-chart"
      onPointerMove={(event) => {
        const ratio = event.nativeEvent.offsetX / event.currentTarget.clientWidth;
        setActive(
          Math.max(0, Math.min(altitude.length - 1, Math.round(ratio * altitude.length))),
        );
      }}
      onPointerLeave={() => setActive(null)}
    >
      <svg viewBox="0 0 100 74" role="img" aria-label="Track altitude profile">
        {[20, 35, 50, 65].map((y) => (
          <line key={y} x1="8" x2="96" y1={y} y2={y} />
        ))}
        <path d={path} />
        {active === null ? null : (
          <circle cx={points[active]?.x} cy={points[active]?.y} r="2.2" />
        )}
      </svg>
      {active === null ? null : (
        <span style={{ left: `${points[active]?.x}%` }}>FL{points[active]?.value}</span>
      )}
    </div>
  );
}

export function ThalesConcept() {
  const [selectedId, setSelectedId] = useState("RAVEN-21");
  const [alertFilter, setAlertFilter] = useState<"All" | "Critical">("All");
  const [commsTab, setCommsTab] = useState<"Channels" | "Operators">("Channels");
  const [query, setQuery] = useState("");
  const [layerOpen, setLayerOpen] = useState(false);
  const [enabledLayers, setEnabledLayers] = useState<string[]>([
    "Airspace",
    "Flight paths",
    "Waypoints",
  ]);
  const [notice, setNotice] = useState<string | null>(null);
  const selected = tracks.find((track) => track.id === selectedId) ?? tracks[0];
  const visibleTracks = useMemo(
    () =>
      tracks.filter(
        (track) =>
          (alertFilter === "All" || track.level === alertFilter) &&
          `${track.id} ${track.message}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [alertFilter, query],
  );

  const announce = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2200);
  };

  return (
    <div className="th-app">
      <header className="th-header">
        <div className="th-brand">
          <strong>THALES</strong>
          <i />
          <span>Airspace control</span>
          <em>Concept</em>
        </div>
        <div className="th-system">
          <span>
            <ShieldCheck /> System status <b>Operational</b>
          </span>
          <span>
            <LockKeyhole /> Connection <b>Secure</b>
          </span>
          <span className="th-time">
            <Crosshair /> UTC time <b>12:45:32Z</b>
          </span>
        </div>
        <div className="th-header-actions">
          <label>
            <Search />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tracks, locations…"
            />
          </label>
          <button
            type="button"
            onClick={() => announce("System settings opened")}
            aria-label="System settings"
          >
            <Settings />
          </button>
          <button
            type="button"
            className="th-operator"
            onClick={() => announce("Operator profile opened")}
          >
            <span>AM</span>
            <small>
              Operator<b>A. Martin</b>
            </small>
            <ChevronDown />
          </button>
        </div>
      </header>

      <main className="th-workspace">
        <aside className="th-left">
          <section className="th-panel th-alerts">
            <header>
              <h2>Alerts</h2>
              <button
                type="button"
                className={alertFilter === "Critical" ? "is-filtered" : ""}
                onClick={() =>
                  setAlertFilter((current) => (current === "All" ? "Critical" : "All"))
                }
              >
                {alertFilter === "All" ? "5 unread" : "Critical only"}
              </button>
              <SlidersHorizontal />
            </header>
            <div>
              {visibleTracks.map((track) => (
                <button
                  type="button"
                  key={track.id}
                  className={`${selectedId === track.id ? "is-selected" : ""} is-${track.level.toLowerCase()}`}
                  onClick={() => setSelectedId(track.id)}
                >
                  <span>
                    <em>{track.level}</em>
                    <small>{track.time}</small>
                  </span>
                  <strong>Track {track.id}</strong>
                  <p>{track.message}</p>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="th-view-all"
              onClick={() => setAlertFilter("All")}
            >
              View all alerts <ChevronDown />
            </button>
          </section>

          <section className="th-panel th-comms">
            <header>
              <h2>
                <RadioTower /> Communications
              </h2>
              <button
                type="button"
                onClick={() => announce("Communication controls opened")}
              >
                <SlidersHorizontal />
              </button>
            </header>
            <div className="th-tabs">
              {(["Channels", "Operators"] as const).map((tab) => (
                <button
                  type="button"
                  key={tab}
                  className={commsTab === tab ? "is-current" : ""}
                  onClick={() => setCommsTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            {commsTab === "Channels" ? (
              <div className="th-channel-list">
                {communications.map((channel) => (
                  <button
                    type="button"
                    key={channel.name}
                    onClick={() => announce(`${channel.name} audio opened`)}
                  >
                    <span>
                      <strong>{channel.name}</strong>
                      <small>{channel.owner}</small>
                    </span>
                    <i>
                      {waveBars.map((key, index) => (
                        <b
                          key={key}
                          style={{ height: `${(channel.strength[index] ?? 1) * 8}%` }}
                        />
                      ))}
                    </i>
                    <em className={channel.status === "Active" ? "is-active" : ""}>
                      <Wifi />
                      {channel.status}
                    </em>
                  </button>
                ))}
              </div>
            ) : (
              <div className="th-operators">
                <span>AM</span>
                <div>
                  <strong>A. Martin</strong>
                  <small>Primary operator · Online</small>
                </div>
                <span>JL</span>
                <div>
                  <strong>J. Laurent</strong>
                  <small>Airspace coordinator</small>
                </div>
              </div>
            )}
            <footer>
              <span>3 active channels</span>
              <button
                type="button"
                onClick={() => announce("Communications panel opened")}
              >
                Open comms panel
              </button>
            </footer>
          </section>
        </aside>

        <section className="th-map" aria-label="Airspace surveillance map">
          <div className="th-coordinates">
            <span>50°N</span>
            <span>40°N</span>
            <span>30°N</span>
          </div>
          <div className="th-map-tools">
            <button
              type="button"
              onClick={() => announce("Zoomed in")}
              aria-label="Zoom in"
            >
              <ZoomIn />
            </button>
            <button
              type="button"
              onClick={() => announce("Zoomed out")}
              aria-label="Zoom out"
            >
              <ZoomOut />
            </button>
            <button
              type="button"
              onClick={() => announce("Map centered")}
              aria-label="Center map"
            >
              <LocateFixed />
            </button>
          </div>
          {tracks.map((track) => (
            <button
              type="button"
              key={track.id}
              className={`th-track${selectedId === track.id ? " is-selected" : ""}`}
              style={{ left: `${track.left}%`, top: `${track.top}%` }}
              onClick={() => setSelectedId(track.id)}
              aria-label={`Select track ${track.id}`}
            >
              <Plane style={{ rotate: `${track.rotate}deg` }} />
              <span>
                <strong>{track.id}</strong>
                <small>
                  {track.altitude} · {track.speed}
                </small>
              </span>
            </button>
          ))}
          <div className="th-range-ring is-one" />
          <div className="th-range-ring is-two" />
          <div className="th-layers">
            <button type="button" onClick={() => setLayerOpen((open) => !open)}>
              <Layers3 /> Layers <ChevronDown />
            </button>
            {layerOpen ? (
              <div>
                {layers.map((layer) => (
                  <label key={layer}>
                    <input
                      type="checkbox"
                      checked={enabledLayers.includes(layer)}
                      onChange={() =>
                        setEnabledLayers((current) =>
                          current.includes(layer)
                            ? current.filter((item) => item !== layer)
                            : [...current, layer],
                        )
                      }
                    />
                    {layer}
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <aside className="th-right">
          <section className="th-panel th-details">
            <header>
              <h2>
                <BellRing /> Track details
              </h2>
              <button
                type="button"
                onClick={() => announce("Track pinned")}
                aria-label="Pin track"
              >
                <LocateFixed />
              </button>
            </header>
            <div className="th-track-title">
              <Plane />
              <div>
                <strong>{selected.id}</strong>
                <small>
                  MIL
                  <br />
                  {selected.operator}
                </small>
              </div>
              <em className={`is-${selected.level.toLowerCase()}`}>{selected.level}</em>
            </div>
            <dl>
              <div>
                <dt>Altitude</dt>
                <dd>
                  {selected.altitude}
                  <small>{selected.feet}</small>
                </dd>
              </div>
              <div>
                <dt>Heading</dt>
                <dd>
                  {selected.heading}
                  <small>{selected.direction}</small>
                </dd>
              </div>
              <div>
                <dt>Ground speed</dt>
                <dd>
                  {selected.speed}
                  <small>{selected.metricSpeed}</small>
                </dd>
              </div>
              <div>
                <dt>Vertical rate</dt>
                <dd>
                  {selected.vertical}
                  <small>{selected.verticalState}</small>
                </dd>
              </div>
              <div>
                <dt>Squawk</dt>
                <dd>{selected.squawk}</dd>
              </div>
              <div>
                <dt>Confidence</dt>
                <dd className="th-confidence">
                  ▮ High <small>{selected.confidence}</small>
                </dd>
              </div>
              <div>
                <dt>Data source</dt>
                <dd>{selected.source}</dd>
              </div>
            </dl>
          </section>

          <section className="th-panel th-timeline">
            <header>
              <h2>
                Status timeline <small>(UTC)</small>
              </h2>
            </header>
            <ol>
              {timeline.map(([time, event], index) => (
                <li key={time} className={index < 3 ? "is-alert" : ""}>
                  <time>{time}</time>
                  <span>{event}</span>
                </li>
              ))}
            </ol>
          </section>
          <section className="th-panel th-altitude">
            <header>
              <h2>Altitude profile</h2>
            </header>
            <AltitudeChart />
            <footer>
              <span>12:35</span>
              <span>12:40</span>
              <span>12:45</span>
            </footer>
          </section>
          <section className="th-panel th-actions">
            <header>
              <h2>Actions</h2>
            </header>
            <button
              type="button"
              className="is-danger"
              onClick={() => announce(`Intercept request staged for ${selected.id}`)}
            >
              Send intercept
            </button>
            <button
              type="button"
              className="is-purple"
              onClick={() => announce(`Identification requested for ${selected.id}`)}
            >
              Request identification
            </button>
            <div>
              <button
                type="button"
                onClick={() => announce(`${selected.id} monitoring enabled`)}
              >
                Monitor
              </button>
              <button
                type="button"
                onClick={() => announce(`${selected.id} added to watchlist`)}
              >
                Add to watchlist
              </button>
            </div>
            <button
              type="button"
              className="th-more"
              onClick={() => announce("More actions opened")}
            >
              More actions <MoreHorizontal />
            </button>
          </section>
        </aside>
      </main>
      {notice ? (
        <div className="th-toast" role="status">
          <Volume2 />
          {notice}
        </div>
      ) : null}
    </div>
  );
}
