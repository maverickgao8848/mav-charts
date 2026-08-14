export type AccessibleColumn<Row> = {
  key: string;
  label: string;
  value: (row: Row) => string | number;
};

export type AccessibleDataTableProps<Row> = {
  caption: string;
  rows: readonly Row[];
  columns: readonly AccessibleColumn<Row>[];
};

export function AccessibleDataTable<Row>({ caption, rows, columns }: AccessibleDataTableProps<Row>) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>{columns.map((column) => <th key={column.key} scope="col">{column.label}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((column, columnIndex) => {
              const Tag = columnIndex === 0 ? "th" : "td";
              return <Tag key={column.key} {...(columnIndex === 0 ? { scope: "row" } : {})}>{column.value(row)}</Tag>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
