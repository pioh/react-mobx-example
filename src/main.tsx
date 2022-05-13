import { autorun, reaction } from "mobx";
import { render } from "preact";
import { Header, headerStore } from "./header";
import { Table, tableStore } from "./table";

headerStore.fetch();
reaction(
  () => tableStore.sql,
  (sql) => tableStore.fetch(sql),
  { delay: 10 }
);

render(
  <>
    <Header />
    <Table />
  </>,
  document.body
);
