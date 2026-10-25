const COLORS = { primary: "#2f5bea", bad: "#e5484d", grid: "#eef0f5", text: "#6b7385" };

export function attendanceBarChart(canvas, items, threshold) {
  Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
  Chart.defaults.color = COLORS.text;
  return new Chart(canvas, {
    type: "bar",
    data: {
      labels: items.map((i) => i.subject),
      datasets: [{
        data: items.map((i) => i.percentage),
        backgroundColor: items.map((i) => (i.percentage < threshold ? COLORS.bad : COLORS.primary)),
        borderRadius: 10,
        borderSkipped: false,
        maxBarThickness: 40,
      }],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `${c.parsed.y}%` } } },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: { min: 0, max: 100, grid: { color: COLORS.grid }, border: { display: false }, ticks: { callback: (v) => `${v}%` } },
      },
    },
  });
}
