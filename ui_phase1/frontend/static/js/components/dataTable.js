import { api } from "../core/api.js";
import { escapeHtml, loadingBox, stateBox, toast } from "../core/ui.js";

export class DataTable {
  constructor({ root, endpoint, columns, emptyText = "No records found.", pageSize = 10 }) {
    Object.assign(this, { root, endpoint, columns, emptyText });
    this.state = { page: 1, per_page: pageSize, q: "", sort: "", order: "asc" };
    this.filters = {};
    this.root.innerHTML = `
      <div class="toolbar">
        <input type="search" class="input" placeholder="Search by name or roll number" aria-label="Search" data-role="search">
        <div class="toolbar" style="padding:0" data-role="filters"></div>
      </div>
      <div class="table-wrap" data-role="body"></div>
      <div class="pager" data-role="pager"></div>`;
    this.body = root.querySelector("[data-role=body]");
    this.pager = root.querySelector("[data-role=pager]");
    let timer;
    root.querySelector("[data-role=search]").addEventListener("input", (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => this.update({ q: e.target.value.trim(), page: 1 }), 300);
    });
    this.load();
  }

  addFilter({ name, label, options }) {
    const select = document.createElement("select");
    select.className = "input";
    select.setAttribute("aria-label", label);
    select.innerHTML = `<option value="">${escapeHtml(label)}</option>` +
      options.map(([value, text]) => `<option value="${escapeHtml(value)}">${escapeHtml(text)}</option>`).join("");
    select.addEventListener("change", () => { this.filters[name] = select.value; this.update({ page: 1 }); });
    this.root.querySelector("[data-role=filters]").append(select);
  }

  update(patch) { Object.assign(this.state, patch); this.load(); }

  async load() {
    this.body.innerHTML = loadingBox();
    try {
      const { items, total } = await api.get(this.endpoint, { ...this.state, ...this.filters });
      this.render(items, total);
    } catch (err) {
      this.body.innerHTML = stateBox("fa-circle-xmark", "Could not load data.");
      toast(err.message, "error");
    }
  }

  render(items, total) {
    if (!items.length) {
      this.body.innerHTML = stateBox("fa-folder-open", this.emptyText);
      this.pager.innerHTML = "";
      return;
    }
    const head = this.columns.map((c) => {
      const aria = c.sortable
        ? ` data-sort="${c.key}" aria-sort="${this.state.sort === c.key ? (this.state.order === "asc" ? "ascending" : "descending") : "none"}"`
        : "";
      return `<th scope="col"${aria}>${escapeHtml(c.label)}</th>`;
    }).join("");
    const rows = items.map((row) =>
      `<tr>${this.columns.map((c) => `<td>${c.render ? c.render(row) : escapeHtml(row[c.key])}</td>`).join("")}</tr>`).join("");
    this.body.innerHTML = `<table class="table"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
    this.body.querySelectorAll("th[data-sort]").forEach((th) => th.addEventListener("click", () => {
      const key = th.dataset.sort;
      this.update({ sort: key, order: this.state.sort === key && this.state.order === "asc" ? "desc" : "asc" });
    }));

    const pages = Math.max(1, Math.ceil(total / this.state.per_page));
    this.pager.innerHTML = `<span class="muted small">${total} records</span>
      <div style="display:flex;gap:8px;align-items:center">
        <button class="btn btn-tonal btn-sm" data-step="-1" ${this.state.page <= 1 ? "disabled" : ""}>Previous</button>
        <span class="small muted">${this.state.page} / ${pages}</span>
        <button class="btn btn-tonal btn-sm" data-step="1" ${this.state.page >= pages ? "disabled" : ""}>Next</button>
      </div>`;
    this.pager.querySelectorAll("[data-step]").forEach((b) =>
      b.addEventListener("click", () => this.update({ page: this.state.page + Number(b.dataset.step) })));
  }
}
