export const stats = [
  {
    label: "Active promotions",
    value: "1,245",
    change: "+6.3%",
    trend: [3, 4, 3, 5, 11, 5, 7, 13, 11, 14, 13, 16],
  },
  {
    label: "Scheduled",
    value: "680",
    change: "+4.8%",
    trend: [13, 5, 3, 8, 15, 13, 8, 10, 15, 16, 14, 15],
  },
  {
    label: "Approved value",
    value: "€82.6M",
    change: "+11.2%",
    trend: [4, 7, 12, 8, 22, 14, 31, 17, 10, 27, 18, 24],
  },
  {
    label: "Incremental sales",
    value: "€126.4M",
    change: "+9.7%",
    trend: [9, 7, 4, 5, 10, 14, 8, 7, 14, 20, 13, 22],
  },
];

export const campaigns = [
  {
    name: "Spring wine fair",
    dates: "May 8 – May 25",
    stores: "1,120",
    status: "Active",
    tone: "red",
  },
  {
    name: "2+1 on selected products",
    dates: "May 10 – May 23",
    stores: "980",
    status: "Active",
    tone: "red",
  },
  {
    name: "Regional products",
    dates: "May 15 – May 28",
    stores: "1,450",
    status: "Scheduled",
    tone: "blue",
  },
  {
    name: "Baby promotion",
    dates: "May 20 – Jun 2",
    stores: "530",
    status: "Scheduled",
    tone: "blue",
  },
  {
    name: "Breakfast special",
    dates: "May 22 – Jun 4",
    stores: "750",
    status: "Pending",
    tone: "amber",
  },
] as const;

export const calendarRows = [
  { name: "Spring wine fair", stores: "1,120 stores", start: 0, span: 7, tone: "red" },
  {
    name: "2+1 on selected products",
    stores: "980 stores",
    start: 0,
    span: 7,
    tone: "red",
  },
  {
    name: "Regional products",
    stores: "1,450 stores",
    start: 0.3,
    span: 6.7,
    tone: "blue",
  },
  { name: "Baby promotion", stores: "530 stores", start: 0.3, span: 6.7, tone: "amber" },
] as const;

export const products = [
  {
    product: "Nutella spread 750g",
    sku: "3017620422003",
    category: "Grocery",
    regular: "€5.29",
    promo: "€3.99",
    discount: "−24%",
    stores: "1,120",
    status: "Active",
    owner: "Promo team",
  },
  {
    product: "Coca-Cola Original 1.5L",
    sku: "5449000148636",
    category: "Drinks",
    regular: "€1.89",
    promo: "€1.29",
    discount: "−32%",
    stores: "980",
    status: "Active",
    owner: "Promo team",
  },
  {
    product: "Président Camembert 250g",
    sku: "3228020113216",
    category: "Fresh",
    regular: "€2.35",
    promo: "€1.79",
    discount: "−24%",
    stores: "1,450",
    status: "Scheduled",
    owner: "Category manager",
  },
  {
    product: "Kellogg’s Corn Flakes 750g",
    sku: "5053827212345",
    category: "Breakfast",
    regular: "€3.49",
    promo: "€2.49",
    discount: "−29%",
    stores: "530",
    status: "Scheduled",
    owner: "Promo team",
  },
  {
    product: "Semi-skimmed milk 1L",
    sku: "3263850123457",
    category: "Dairy",
    regular: "€1.15",
    promo: "€0.95",
    discount: "−17%",
    stores: "750",
    status: "Pending",
    owner: "Category manager",
  },
] as const;

export const approvals = [
  { name: "Barbecue special", detail: "1,230 stores", value: "€5.2M", tone: "red" },
  { name: "20% off red fruits", detail: "890 stores", value: "€1.8M", tone: "green" },
  { name: "Back to school", detail: "2,100 stores", value: "€12.6M", tone: "amber" },
  { name: "Hygiene & beauty", detail: "1,540 stores", value: "€3.7M", tone: "purple" },
] as const;

export const coverage = [
  { label: "Full coverage", value: "9,842", percent: "69.1%", color: "#159947" },
  { label: "Partial coverage", value: "2,745", percent: "19.3%", color: "#2864dc" },
  { label: "No promotion", value: "1,681", percent: "11.8%", color: "#9ca8b8" },
] as const;

export const franceDots = Array.from({ length: 78 }, (_, index) => ({
  left: 20 + ((index * 37) % 64),
  top: 16 + ((index * 53) % 68),
  size: 2 + (index % 3),
}));
