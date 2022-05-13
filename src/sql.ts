export interface SqlResponse<T> {
  data: T[];
  meta: { name: string; type: string }[];
  rows: number;
  rows_before_limit_at_least: number;
  error: string;
}

export async function sql<T>(request: string): Promise<SqlResponse<T>> {
  return fetch(
    "https://clickhouse.robot.nirhub.ru/?query=" +
      encodeURIComponent(request + " format JSON"),
    { headers: [["Authorization", "Basic " + btoa("pioh:Monach2734&")]] }
  )
    .then((response) => {
      if (
        !/application\/json/.test(response.headers.get("content-type") || "")
      ) {
        return response.text().then((text) => ({
          data: [],
          error: text,
          meta: [],
          rows: 0,
          rows_before_limit_at_least: 0,
        }));
      }
      return response.json();
    })
    .then((data) => {
      return {
        data: data?.data || [],
        rows: data?.rows || 0,
        rows_before_limit_at_least:
          data?.rows_before_limit_at_least || data?.rows || 0,
        meta: data?.meta || [],
        error: "",
      };
    })
    .catch((e) => ({
      data: [],
      error: e.message,
      meta: [],
      rows: 0,
      rows_before_limit_at_least: 0,
    }));
}
