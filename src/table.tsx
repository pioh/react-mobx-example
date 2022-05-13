import { autorun, makeAutoObservable, observable, reaction } from "mobx";
import { observer } from "mobx-react-lite";
import { JSXInternal } from "preact/src/jsx";
import { headerStore } from "./header";
import { sql, SqlResponse } from "./sql";

class TableStore {
  constructor() {
    makeAutoObservable(this);
  }
  page = 1;
  loadPage = 1;
  size = 20;
  loading = false;
  message = "";
  data: SqlResponse<any> | null = null;

  edited = new Map<string, string>();

  get sql() {
    return `select * from ${headerStore.loadTable} limit ${this.size} offset ${
      (this.loadPage - 1) * this.size
    }`;
  }

  async fetch(request: string) {
    if (!headerStore.active) return;
    this.message = "";
    this.loading = true;

    let res = await sql<any>(request);
    this.loading = false;
    if (res.error) {
      this.message = res.error;
    } else {
      this.message = "";
      this.data = res;
      this.page = this.loadPage;
      headerStore.active = headerStore.loadTable;
    }
  }

  get cols(): string[] {
    if (!this.data) return [];
    return this.data.meta.map((m) => m.name);
  }
  get rows(): any[] {
    if (!this.data?.data) return [];
    return this.data.data;
  }

  get pageCount() {
    if (!this.data?.rows_before_limit_at_least) return 1;
    return Math.ceil(this.data.rows_before_limit_at_least / this.size);
  }

  editContent(
    e: JSXInternal.TargetedEvent<HTMLTableCellElement, Event>,
    id: string
  ) {
    this.edited.set(id, e.currentTarget.textContent || "");
  }
}

export const tableStore = new TableStore();

export const Table = observer(() => (
  <div class={"tableContainer " + (tableStore.loading ? "loading" : "")}>
    <header>
      <Pagination />
      <h3>{tableStore.message ? tableStore.message : null}</h3>
    </header>
    <h4>
      {" "}
      {1 + (tableStore.page - 1) * tableStore.size} -{" "}
      {tableStore.page * tableStore.size} /{" "}
      {tableStore.data?.rows_before_limit_at_least}
    </h4>
    {tableStore.cols.length === 0 ? null : (
      <table class="table table-bordered border-primary">
        <thead>
          <th>#</th>
          {tableStore.cols.map((col) => (
            <th key={col}>{col}</th>
          ))}
        </thead>
        <tbody>
          {tableStore.rows.map((row, i) => (
            <tr key={i}>
              <td>{i + 1 + (tableStore.page - 1) * tableStore.size}</td>
              {tableStore.cols.map((col, j) => (
                <Cell
                  i={i}
                  j={j}
                  col={col}
                  row={row}
                  key={col}
                  id={`${headerStore.active}:${tableStore.page}:${i}:${j}`}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
));

const Cell = observer(
  (props: { i: number; j: number; col: string; row: any; id: string }) => (
    <td
      contentEditable
      key={props.col}
      onInput={(e) => tableStore.editContent(e, props.id)}
      dangerouslySetInnerHTML={{
        __html: tableStore.edited.get(props.id) || props.row[props.col],
      }}
    ></td>
  )
);

const Pagination = observer(() => (
  <nav aria-label="...">
    <ul class="pagination">
      <li class="page-item" onClick={() => tableStore.loadPage--}>
        <a class="page-link" href="#" aria-label="Previous">
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>
      {Array(tableStore.pageCount)
        .slice(0, 20)
        .fill(0)
        .map((o, i) => (
          <li
            class={`page-item ${i + 1 == tableStore.page ? "active" : ""}`}
            key={i}
            onClick={() => (tableStore.loadPage = i + 1)}
          >
            <a class="page-link" href="#">
              {i + 1}
            </a>
          </li>
        ))}

      <li class="page-item" onClick={() => tableStore.loadPage++}>
        <a class="page-link" href="#" aria-label="Next">
          <span aria-hidden="true">&raquo;</span>
        </a>
      </li>
    </ul>
  </nav>
));
