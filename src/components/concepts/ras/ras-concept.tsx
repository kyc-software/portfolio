import {
  Bell,
  Boxes,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronDown,
  Clock3,
  FileText,
  LayoutGrid,
  MapPin,
  MoreHorizontal,
  Package,
  Search,
  Settings,
  Truck,
  User,
  UserRound,
  UsersRound,
  Wine,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select";
import { filters, missions, navigation, stats } from "./data";
import "./ras-concept.css";

const navIcons = [
  LayoutGrid,
  BriefcaseBusiness,
  UserRound,
  CalendarDays,
  Clock3,
  Building2,
];
const missionIcons = {
  package: Package,
  truck: Truck,
  box: Boxes,
  document: FileText,
  glass: Wine,
};
const statIcons = {
  briefcase: BriefcaseBusiness,
  users: UsersRound,
  user: User,
  clock: Clock3,
};

export function RasConcept() {
  const [section, setSection] = useState("Missions");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>(filters[0]);
  const [selected, setSelected] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [newMissionOpen, setNewMissionOpen] = useState(false);

  const visibleMissions = useMemo(
    () =>
      missions.filter(
        (mission) =>
          (filter === filters[0] || mission.status === filter) &&
          `${mission.mission} ${mission.client} ${mission.place}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [filter, query],
  );

  const announce = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2200);
  };

  return (
    <div className="ras-app">
      <aside className="ras-sidebar">
        <div className="ras-logo" role="img" aria-label="RAS Intérim 24/7">
          <span>RAS</span>
          <small>Intérim 24/7</small>
        </div>
        <nav aria-label="Mission management sections">
          {navigation.map((item, index) => {
            const Icon = navIcons[index];
            return (
              <button
                key={item}
                type="button"
                className={section === item ? "is-active" : ""}
                onClick={() => setSection(item)}
              >
                {Icon ? <Icon aria-hidden="true" /> : null}
                {item}
              </button>
            );
          })}
        </nav>
        <button
          type="button"
          className="ras-settings"
          onClick={() => announce("Settings opened")}
        >
          <Settings aria-hidden="true" /> Settings
        </button>
      </aside>

      <main className="ras-main">
        <header className="ras-header">
          <div className="ras-title">
            <h1>Mission management</h1>
            <span>Concept</span>
          </div>
          <div className="ras-header-actions">
            <label className="ras-search">
              <Search aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search missions…"
              />
            </label>
            <button
              type="button"
              className="ras-notifications"
              onClick={() => announce("Notifications opened")}
            >
              <Bell aria-hidden="true" />
              <i />
            </button>
            <button
              type="button"
              className="ras-agency"
              onClick={() => announce("Agency switcher opened")}
            >
              <span>AL</span> Lyon agency <ChevronDown />
            </button>
          </div>
        </header>

        <div className="ras-content">
          <section className="ras-stats" aria-label="Mission summary">
            {stats.map((stat) => {
              const Icon = statIcons[stat.icon];
              return (
                <article key={stat.label}>
                  <span>
                    <Icon aria-hidden="true" />
                  </span>
                  <div>
                    <p>{stat.label}</p>
                    <strong>{stat.value}</strong>
                    <small>{stat.detail}</small>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="ras-panel">
            <header>
              <h2>Assignments</h2>
              <div>
                <SelectField
                  value={filter}
                  onValueChange={setFilter}
                  options={filters}
                  ariaLabel="Filter missions"
                  className="ras-select-trigger"
                  contentClassName="ras-select-popup"
                />
                <Button
                  type="button"
                  size="lg"
                  className="ras-primary"
                  onClick={() => setNewMissionOpen(true)}
                >
                  + New mission
                </Button>
              </div>
            </header>

            <div className="ras-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        aria-label="Select all visible missions"
                        checked={
                          visibleMissions.length > 0 &&
                          visibleMissions.every((mission) =>
                            selected.includes(mission.mission + mission.client),
                          )
                        }
                        onChange={(event) =>
                          setSelected(
                            event.target.checked
                              ? visibleMissions.map(
                                  (mission) => mission.mission + mission.client,
                                )
                              : [],
                          )
                        }
                      />
                    </th>
                    <th>Mission</th>
                    <th>Client</th>
                    <th>Location</th>
                    <th>Schedule</th>
                    <th>Applicants</th>
                    <th>Assignment</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {visibleMissions.map((mission) => {
                    const key = mission.mission + mission.client;
                    const Icon = missionIcons[mission.type];
                    return (
                      <tr
                        key={`${key}-${mission.day}`}
                        className={selected.includes(key) ? "is-selected" : ""}
                      >
                        <td>
                          <input
                            type="checkbox"
                            aria-label={`Select ${mission.mission} at ${mission.client}`}
                            checked={selected.includes(key)}
                            onChange={() =>
                              setSelected((current) =>
                                current.includes(key)
                                  ? current.filter((item) => item !== key)
                                  : [...current, key],
                              )
                            }
                          />
                        </td>
                        <td>
                          <div className="ras-mission-cell">
                            <span className="ras-mission-icon">
                              <Icon aria-hidden="true" />
                            </span>
                            <strong>{mission.mission}</strong>
                          </div>
                        </td>
                        <td>{mission.client}</td>
                        <td>
                          <MapPin /> {mission.place}
                        </td>
                        <td>
                          <CalendarDays />
                          <span>
                            {mission.day}
                            <small>{mission.hours}</small>
                          </span>
                        </td>
                        <td>{mission.candidates}</td>
                        <td>
                          <span
                            className={`ras-avatar${mission.initials === "–" ? " is-empty" : ""}`}
                          >
                            {mission.initials}
                          </span>
                          {mission.assignee}
                        </td>
                        <td>
                          <em
                            className={
                              mission.status === "Confirmed" ? "is-confirmed" : "is-open"
                            }
                          >
                            {mission.status}
                          </em>
                        </td>
                        <td>
                          <button
                            type="button"
                            aria-label={`${mission.mission} actions`}
                            onClick={() => announce(`${mission.mission} actions opened`)}
                          >
                            <MoreHorizontal />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {visibleMissions.length === 0 ? (
                <p className="ras-empty">No matching missions</p>
              ) : null}
            </div>
          </section>
        </div>
      </main>

      {newMissionOpen ? (
        <div className="ras-modal-backdrop">
          <button
            type="button"
            className="ras-modal-dismiss"
            onClick={() => setNewMissionOpen(false)}
            aria-label="Close new mission dialog"
          />
          <section
            className="ras-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ras-new-mission-title"
          >
            <header>
              <div>
                <small>Mission draft</small>
                <h2 id="ras-new-mission-title">Create new mission</h2>
              </div>
              <button
                type="button"
                onClick={() => setNewMissionOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </header>
            <div className="ras-form-grid">
              <label>
                Mission title
                <input defaultValue="Order picker" />
              </label>
              <label>
                Client
                <input defaultValue="TransLogix" />
              </label>
              <label>
                Location
                <input defaultValue="Lyon (69)" />
              </label>
              <label>
                Shift
                <input type="time" defaultValue="07:00" />
              </label>
            </div>
            <footer>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setNewMissionOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="ras-primary"
                onClick={() => {
                  setNewMissionOpen(false);
                  announce("Mission draft saved");
                }}
              >
                Save draft
              </Button>
            </footer>
          </section>
        </div>
      ) : null}
      {notice ? (
        <div className="ras-toast" role="status">
          {notice}
        </div>
      ) : null}
    </div>
  );
}
