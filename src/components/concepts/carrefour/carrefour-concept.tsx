import {
  Bell,
  Boxes,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Download,
  Filter,
  LayoutDashboard,
  MapPinned,
  Megaphone,
  MoreHorizontal,
  PackageSearch,
  Plus,
  Search,
  ShieldCheck,
  Store,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select";
import {
  approvals,
  calendarRows,
  campaigns,
  coverage,
  franceDots,
  products,
  stats,
} from "./data";
import "./carrefour-concept.css";

function MiniChart({ data, label }: { data: number[]; label: string }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...data);
  const points = data.map((value, index) => ({
    x: (index / (data.length - 1)) * 100,
    y: 38 - (value / max) * 32,
    value,
  }));
  const path = points
    .map((point, index) => `${index ? "L" : "M"}${point.x},${point.y}`)
    .join(" ");

  return (
    <div
      className="cf-mini-chart"
      onPointerMove={(event) => {
        const ratio = event.nativeEvent.offsetX / event.currentTarget.clientWidth;
        setActive(Math.round(ratio * (data.length - 1)));
      }}
      onPointerLeave={() => setActive(null)}
    >
      <svg viewBox="0 0 100 42" role="img" aria-label={`${label} trend`}>
        <path d={`${path} L100,42 L0,42 Z`} className="cf-chart-area" />
        <path d={path} className="cf-chart-line" />
        {active === null ? null : (
          <circle cx={points[active]?.x} cy={points[active]?.y} r="2.7" />
        )}
      </svg>
      {active === null ? null : (
        <span className="cf-chart-tip" style={{ left: `${points[active]?.x}%` }}>
          Week {active + 1}: {points[active]?.value}
        </span>
      )}
    </div>
  );
}

export function CarrefourConcept() {
  const navigation = [
    ["Campaigns", LayoutDashboard],
    ["Products", PackageSearch],
    ["Stores", Store],
    ["Approvals", ShieldCheck],
  ] as const;
  const [section, setSection] = useState("Campaigns");
  const [country, setCountry] = useState("All countries");
  const [period, setPeriod] = useState<"Week" | "Month">("Week");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [selected, setSelected] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          (category === "All categories" || product.category === category) &&
          `${product.product} ${product.sku}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [category, query],
  );

  const announce = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2200);
  };

  return (
    <div className="cf-app">
      <aside className="cf-sidebar">
        <div className="cf-logo" role="img" aria-label="Carrefour">
          <span>C</span>
          <strong>Carrefour</strong>
        </div>
        <nav aria-label="Promotion sections">
          {navigation.map(([label, Icon]) => (
            <button
              key={label as string}
              type="button"
              className={section === label ? "is-active" : ""}
              onClick={() => setSection(label)}
            >
              <Icon aria-hidden="true" />
              {label}
            </button>
          ))}
        </nav>
        <button
          type="button"
          className="cf-help"
          onClick={() => announce("Help centre opened")}
        >
          <CircleHelp aria-hidden="true" /> Help & support
        </button>
      </aside>

      <main className="cf-main">
        <header className="cf-header">
          <div>
            <h1>Promotion hub</h1>
            <span className="cf-concept-badge">Concept</span>
          </div>
          <div className="cf-header-actions">
            <SelectField
              value={country}
              onValueChange={setCountry}
              options={["All countries", "France", "Belgium", "Spain"]}
              ariaLabel="Country"
              className="cf-select-trigger cf-country-select"
              contentClassName="cf-select-popup"
            />
            <button
              type="button"
              className="cf-date"
              onClick={() => announce("Date picker opened")}
            >
              <CalendarDays aria-hidden="true" /> May 12 – May 18, 2025
            </button>
            <button
              type="button"
              className="cf-icon-button"
              onClick={() => announce("7 notifications")}
            >
              <Bell aria-hidden="true" />
              <span>7</span>
            </button>
            <Button
              type="button"
              size="lg"
              className="cf-primary"
              onClick={() => announce("New promotion draft opened")}
            >
              <Plus data-icon="inline-start" /> New promotion{" "}
              <ChevronDown data-icon="inline-end" />
            </Button>
          </div>
        </header>

        <div className="cf-content">
          <section className="cf-stats" aria-label="Promotion summary">
            {stats.map((stat) => (
              <article key={stat.label}>
                <div>
                  <p>{stat.label}</p>
                  <strong>{stat.value}</strong>
                  <small>
                    vs last week <b>↑ {stat.change}</b>
                  </small>
                </div>
                <MiniChart data={stat.trend} label={stat.label} />
              </article>
            ))}
            <article className="cf-coverage-stat">
              <div>
                <p>Store coverage</p>
                <strong>
                  12,587 <small>/ 14,268</small>
                </strong>
                <small>88.2% of stores</small>
              </div>
              <span
                className="cf-donut"
                role="img"
                aria-label="88.2 percent store coverage"
              />
            </article>
          </section>

          <section className="cf-dashboard-grid">
            <article className="cf-panel cf-calendar-panel">
              <header>
                <h2>Promotion calendar</h2>
                <div className="cf-segmented">
                  {(["Week", "Month"] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={period === item ? "is-current" : ""}
                      onClick={() => setPeriod(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <strong>May 12 – May 18, 2025</strong>
              </header>
              <div className="cf-days">
                {[
                  "Mon 12",
                  "Tue 13",
                  "Wed 14",
                  "Thu 15",
                  "Fri 16",
                  "Sat 17",
                  "Sun 18",
                ].map((day) => (
                  <span key={day} className={day === "Wed 14" ? "is-today" : ""}>
                    {day}
                  </span>
                ))}
              </div>
              <div className="cf-calendar-rows">
                {calendarRows.map((row) => (
                  <button
                    key={row.name}
                    type="button"
                    className={`cf-calendar-item is-${row.tone}`}
                    style={{
                      marginLeft: `${row.start * 13.8}%`,
                      width: `${row.span * 13.8}%`,
                    }}
                    onClick={() => announce(`${row.name} selected`)}
                  >
                    <span>{row.name}</span>
                    <small>{row.stores}</small>
                  </button>
                ))}
              </div>
              <footer>
                <span>
                  <i className="is-red" /> Active (2)
                </span>
                <span>
                  <i className="is-blue" /> Scheduled (2)
                </span>
                <span>
                  <i className="is-amber" /> Pending (1)
                </span>
                <button type="button" onClick={() => setSection("Campaigns")}>
                  View all campaigns
                </button>
              </footer>
            </article>

            <article className="cf-panel cf-campaigns">
              <header>
                <h2>Campaigns</h2>
                <button type="button" onClick={() => announce("Campaign list opened")}>
                  View all
                </button>
              </header>
              <div>
                {campaigns.map((campaign) => (
                  <button
                    type="button"
                    key={campaign.name}
                    onClick={() => announce(`${campaign.name} selected`)}
                  >
                    <span className={`cf-campaign-icon is-${campaign.tone}`}>
                      <Megaphone />
                    </span>
                    <span>
                      <strong>{campaign.name}</strong>
                      <small>
                        {campaign.dates} · {campaign.stores} stores
                      </small>
                    </span>
                    <em className={`is-${campaign.tone}`}>{campaign.status}</em>
                  </button>
                ))}
              </div>
            </article>

            <article className="cf-panel cf-map-panel">
              <header>
                <h2>Store coverage</h2>
                <button type="button" onClick={() => announce("Full map opened")}>
                  View full map
                </button>
              </header>
              <div
                className="cf-map"
                role="img"
                aria-label="Illustrative store coverage map of France"
              >
                <span className="cf-france">FRANCE</span>
                {franceDots.map((dot, index) => (
                  <i
                    className="cf-map-dot"
                    key={`${dot.left}-${dot.top}`}
                    style={{
                      left: `${dot.left}%`,
                      top: `${dot.top}%`,
                      width: dot.size,
                      height: dot.size,
                    }}
                    title={`Covered store cluster ${index + 1}`}
                  />
                ))}
                <MapPinned aria-hidden="true" />
              </div>
              <footer>
                {coverage.map((item) => (
                  <div key={item.label}>
                    <span>
                      <i style={{ background: item.color }} />
                      {item.label}
                    </span>
                    <strong>{item.value}</strong>
                    <small>{item.percent}</small>
                  </div>
                ))}
              </footer>
            </article>

            <article className="cf-panel cf-products">
              <header>
                <h2>
                  Product promotions <span>{products.length}</span>
                </h2>
                <div className="cf-table-tools">
                  <label>
                    <Search />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search product or SKU"
                    />
                  </label>
                  <SelectField
                    value={category}
                    onValueChange={setCategory}
                    options={[
                      "All categories",
                      ...Array.from(new Set(products.map((product) => product.category))),
                    ]}
                    ariaLabel="Product category"
                    className="cf-select-trigger"
                    contentClassName="cf-select-popup"
                  />
                  <button type="button" onClick={() => announce("Filters applied")}>
                    <Filter /> Filters
                  </button>
                  <button type="button" onClick={() => announce("CSV export prepared")}>
                    <Download /> Export
                  </button>
                </div>
              </header>
              <div className="cf-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th aria-label="Select" />
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Category</th>
                      <th>Regular</th>
                      <th>Promotional</th>
                      <th>Discount</th>
                      <th>Stores</th>
                      <th>Status</th>
                      <th>Owner</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr
                        key={product.sku}
                        className={selected.includes(product.sku) ? "is-selected" : ""}
                      >
                        <td>
                          <input
                            type="checkbox"
                            checked={selected.includes(product.sku)}
                            onChange={() =>
                              setSelected((current) =>
                                current.includes(product.sku)
                                  ? current.filter((sku) => sku !== product.sku)
                                  : [...current, product.sku],
                              )
                            }
                            aria-label={`Select ${product.product}`}
                          />
                        </td>
                        <td>
                          <span className="cf-product-icon">
                            <Boxes />
                          </span>
                          {product.product}
                        </td>
                        <td>{product.sku}</td>
                        <td>{product.category}</td>
                        <td>{product.regular}</td>
                        <td className="cf-red-text">{product.promo}</td>
                        <td className="cf-red-text">{product.discount}</td>
                        <td>{product.stores}</td>
                        <td>
                          <em className={`is-${product.status.toLowerCase()}`}>
                            {product.status}
                          </em>
                        </td>
                        <td>{product.owner}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => announce(`${product.product} menu opened`)}
                            aria-label={`${product.product} actions`}
                          >
                            <MoreHorizontal />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredProducts.length === 0 ? (
                  <p className="cf-empty">No matching promotions</p>
                ) : null}
              </div>
            </article>

            <article className="cf-panel cf-approvals">
              <header>
                <h2>
                  Approval queue <span>{approvals.length}</span>
                </h2>
                <button type="button" onClick={() => announce("Approval queue opened")}>
                  View all
                </button>
              </header>
              <div>
                {approvals.map((approval) => (
                  <div key={approval.name}>
                    <span className={`cf-approval-icon is-${approval.tone}`}>
                      <CheckCircle2 />
                    </span>
                    <span>
                      <strong>{approval.name}</strong>
                      <small>{approval.detail}</small>
                    </span>
                    <small>{approval.value}</small>
                    <button
                      type="button"
                      onClick={() => announce(`${approval.name} review opened`)}
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </div>
      </main>
      {notice ? (
        <div className="cf-toast" role="status">
          {notice}
        </div>
      ) : null}
    </div>
  );
}
