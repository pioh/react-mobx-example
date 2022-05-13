import { makeAutoObservable, observable } from "mobx";
import { observer } from "mobx-react-lite";
import { sql } from "./sql";
import { tableStore } from "./table";

export const headerStore = makeAutoObservable({
  message: "",
  names: [] as string[],
  active: "",
  loadTable: "",

  async fetch() {
    this.message = "загрузка списка таблиц";
    this.names = [];

    let res = await sql<{ name: string }>("show tables");
    if (res.error) {
      this.message = res.error;
    } else {
      this.message = "";
      this.names = res.data.map((o) => o.name);
      this.active = this.names[0] || "";
      this.loadTable = this.active;
    }
  },
  activate(table: string) {
    this.loadTable = table;
    tableStore.loadPage = 1;
  },
});

export const Header = observer(() => (
  <header>
    <ul class="nav nav-pills">
      {headerStore.message
        ? headerStore.message
        : headerStore.names.map((name) => (
            <li class="nav-item">
              <button
                key={name}
                class={
                  "nav-link " + (name == headerStore.active ? "active" : "")
                }
                onClick={() => headerStore.activate(name)}
              >
                {name}
              </button>
            </li>
          ))}
    </ul>
  </header>
));
