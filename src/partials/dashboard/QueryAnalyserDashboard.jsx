import React from "react";
import DataTable from "react-data-table-component";

const columns = [
  {
    name: "Timestamp",
    selector: (row) => row.timestamp,
    maxWidth: "200px",
    reorder: true,
  },
  {
    name: "Duration",
    selector: (row) => row.Duration,
    maxWidth: "200px",
    reorder: true,
  },
  {
    name: "Operation",
    selector: (row) => row["Op Type"],
    maxWidth: "200px",
    reorder: true,
  },
  {
    name: "Namespace",
    selector: (row) => row.Namespace,
    maxWidth: "200px",
    reorder: true,
  },
  {
    name: "Sort Stage",
    selector: (row) => row.Sort,
    maxWidth: "200px",
    reorder: true,
  },
  {
    name: "Lookup Stage",
    selector: (row) => row.Lookup,
    maxWidth: "200px",
    reorder: true,
  },
  {
    name: "Blocking",
    selector: (row) => row.Blocking,
    maxWidth: "200px",
    reorder: true,
  },
  {
    name: "Query Targeting",
    selector: (row) => row.QTR,
    maxWidth: "200px",
    reorder: true,
  },
  {
    name: "Plan Summary",
    selector: (row) => row["Plan Summary"],
    maxWidth: "200px",
    reorder: true,
  },
  {
    name: "Query Pattern",
    selector: (row) => row["Filter"],
    maxWidth: "200px",
    reorder: true,
  },
];

export default (props) => {
  return (
    <div className="col-span-full bg-white shadow-lg rounded-sm border border-slate-200 m-10">
      <DataTable
        title="Query Details"
        data={
          props.data.data.initialData.map((v) => {
            const ret = {};
            for (const property in v) {
              ret[property] = String(v[property]);
            }

            return ret;
          }) || []
        }
        columns={columns}
        pagination
      />
    </div>
  );
};
