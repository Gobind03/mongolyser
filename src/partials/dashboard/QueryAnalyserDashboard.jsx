import React, { useState } from "react";
import DataTable from 'react-data-table-component';


const displaySummaryNames = {
  nCOLLSCAN: "Total Collection Scans",
  nSlowOps: "Total Slow Ops",
  nFind: "Total Find Ops",
  nGetMore: "Total GetMore Ops",
  nAggregate: "Total Aggregate Ops",
  nInsert: "Total Insert Ops",
  nUpdate: "Total Update Ops",
  nCount: "Total Count Ops",
  slowestOp: "Slowest Op"
}

const columns = [
  {
    name: "Timestamp",
    selector: row => row.timestamp,
    maxWidth: "200px",
    reorder: true
  },
  {
    name: "Duration",
    selector: row => row.Duration,
    maxWidth: "200px",
    reorder: true
  },
  {
    name: "Operation",
    selector: row => row["Op Type"],
    maxWidth: "200px",
    reorder: true
  },
  {
    name: "Namespace",
    selector: row => row.Namespace,
    maxWidth: "200px",
    reorder: true
  },
  {
    name: "Sort Stage",
    selector: row => row.Sort,
    maxWidth: "200px",
    reorder: true
  },
  {
    name: "Lookup Stage",
    selector: row => row.Lookup,
    maxWidth: "200px",
    reorder: true
  },
  {
    name: "Blocking",
    selector: row => row.Blocking,
    maxWidth: "200px",
    reorder: true
  },
  {
    name: "Query Targeting",
    selector: row => row.QTR,
    maxWidth: "200px",
    reorder: true
  },
  {
    name: "Plan Summary",
    selector: row => row["Plan Summary"],
    maxWidth: "200px",
    reorder: true
  },
  {
    name: "Query Pattern",
    selector: row => row["Filter"],
    maxWidth: "200px",
    reorder: true
  }
]

export default (props) => {
  const availableQuerySummary = Object.keys(displaySummaryNames);

  return (
    <div className="w-screen max-w-5xl mb-10">
      <div className="col-span-full bg-white shadow-lg rounded-sm border border-slate-200 m-10">
        <header className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-indigo-800">Query Analysis Summary</h2>
        </header>
        <div className="flex items-start justify-around">
          {
            Object.keys(props.data.data.summary).map(k => {

              if (!availableQuerySummary.includes(k)) {
                return null;
              }

              return (
                <div key={displaySummaryNames[k]} className="border border-slate-200 w-1/4 bg-white rounded overflow-hidden shadow-lg m-5">
                  <div class="px-6 py-4">
                    <div class="text-m mb-2">{displaySummaryNames[k]}</div>
                    <p class="text-2xl font-bold leading-7 text-indigo-900">
                      {props.data.data.summary[k]}
                    </p>
                  </div>
                </div>
              )
            })
          }
        </div>
      </div>

      {/* Table section */}
      <DataTable 
        title="Query Details"
        data={props.data.data.initialData.map(v => {
          const ret = {};
          for(const property in v) {
            ret[property] = String(v[property])
          }

          return ret;
        }) || []}
        columns={columns}
        pagination
        // expandableRows
        // expandableRowsComponent={({ data }) => {
        //   return (
        //     <pre>
        //       <code>
        //         {data.Log}
        //       </code>
        //     </pre>

        //   )
        // }}
      />
    </div>
  )
}