const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const palette = () => ({
  primary: css("--primary"), primary2: css("--primary-2"), bad: css("--bad"),
  grid: css("--hairline"), text: css("--muted"),
});

function barFill(color, color2) {
  return (context) => {
    const { chart } = context;
    if (!chart.chartArea) return color;
    const { top, bottom } = chart.chartArea;
    const gradient = chart.ctx.createLinearGradient(0, top, 0, bottom);
    gradient.addColorStop(0, color2);
    gradient.addColorStop(1, color);
    return gradient;
  };
}

export function attendanceBarChart(canvas, items, threshold) {
  Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
  const p = palette();
  const chart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: items.map((i) => i.subject),
      datasets: [{
        data: items.map((i) => i.percentage),
        backgroundColor: (context) => {
          const { bad, primary, primary2 } = palette();
          return items[context.dataIndex].percentage < threshold
            ? barFill(bad, bad)(context)
            : barFill(primary, primary2)(context);
        },
        borderRadius: 14,
        borderSkipped: false,
        maxBarThickness: 40,
      }],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { cornerRadius: 12, padding: 10, callbacks: { label: (c) => `${c.parsed.y}%` } } },
      scales: {
        x: { grid: { display: false }, border: { display: false }, ticks: { color: p.text } },
        y: { min: 0, max: 100, grid: { color: p.grid }, border: { display: false }, ticks: { color: p.text, callback: (v) => `${v}%` } },
      },
    },
  });
  window.addEventListener("themechange", () => {
    const next = palette();
    chart.options.scales.x.ticks.color = next.text;
    chart.options.scales.y.ticks.color = next.text;
    chart.options.scales.y.grid.color = next.grid;
    chart.update();
  });
  return chart;
}
