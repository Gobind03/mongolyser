import React, { useState } from "react";


const displayNames = {
  redundantIdx: "Redundant Indexes",
  unusedIdx: "Unused Indexes",
  totalIdx: "Total Indexes",
  totalCollections: "Total Collections"
}

function getClassesByName(data) {
  if (data.is_redundant) {
    return `mt-4 pl-4 border-l-4 border-red-300`
  }

  if (data.accesses.ops === 0) {
    return `mt-4 pl-4 border-l-4 border-amber-300`
  }

  return `mt-4`
}


export default (props) => {

  const [visibleToggles, setVisibleToggles] = useState([]);

  const data = props.data;
  const availableIdxSummaries = Object.keys(displayNames);

  if (!data) {
    return (
      <div>error: no data found!</div>
    )
  }

  function toggleIdxTable(idx) {
    if (visibleToggles.indexOf(idx) >= 0) {
      const newToggles = visibleToggles.filter(k => k !== idx);
      setVisibleToggles(newToggles);
    } else {
      setVisibleToggles([...visibleToggles, idx])
    }
  }

  return (
    <div className="w-screen mb-10">
      <div className="col-span-full bg-white shadow-lg rounded-sm border border-slate-200 m-10">
        <header className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-indigo-800">Index Stats Summary</h2>
        </header>
        <div className="flex items-start justify-around">
          {
            Object.keys(data.idx_summary).map(s => {
              if (availableIdxSummaries.indexOf(s) < 0) {
                return null;
              }
              return (
                <div key={displayNames[s]} className="border border-slate-200 w-1/4 bg-white rounded overflow-hidden shadow-lg m-5">
                  <div class="px-6 py-4">
                    <div class="text-m mb-2">{displayNames[s]}</div>
                    <p class="text-2xl font-bold leading-7 text-indigo-900">
                      {data.idx_summary[s]}
                    </p>
                  </div>
                </div>
              )
            })
          }
        </div>
      </div>
      <div className="col-span-full bg-white shadow-lg rounded-sm border border-slate-200 m-10">
        <header className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-indigo-800">Index Stats Details</h2>
        </header>
        <ul className="my-2 mx-2 mb-20">

          {
            Object.keys(data.idx_details).map((ns, idx) => {
              return (
                <li key={ns} className="flex px-2 mt-4">
                  <div className="grow border border-indigo-300 rounded px-5 text-sm py-2">
                    <div className="grow flex justify-between items-center" onClick={() => toggleIdxTable(idx)}>
                      <div className="self-center flex items-start flex-col ">
                        <a className="text-lg font-bold text-slate-800 hover:text-slate-900" href="#0">
                          {ns}
                        </a>
                        <div className="flex items-start">
                          {
                            data.idx_summary.nsRedundantIdx.includes(ns) && (
                              <span class="inline-block mt-4 bg-red-200 rounded-full px-4 py-1 text-sm font-semibold text-red-700 mr-2 mb-2">
                                Redundant Indexes
                              </span>
                            )
                          }

                          {
                            data.idx_summary.nsUnusedIdx.includes(ns) && (
                              <span class="inline-block mt-4 bg-amber-200 rounded-full px-4 py-1 text-sm font-semibold text-amber-700 mr-2 mb-2">
                                Unused Indexes
                              </span>
                            )
                          }

                          {
                            data.idx_summary.collectionWithLargeNoOfIndexes === ns && (
                              <span class="inline-block mt-4 bg-slate-200 rounded-full px-4 py-1 text-sm font-semibold text-slate-700 mr-2 mb-2">
                                Highest Indexes by count
                              </span>
                            )
                          }
                        </div>
                      </div>

                      <div className="shrink-0 self-center ml-2">
                        <a className="font-medium text-indigo-500 hover:text-indigo-600" href="#0">View Indexes<span className="hidden sm:inline"> -&gt;</span></a>
                      </div>
                      
                    </div>

                    <div className="grow">
                      {
                        visibleToggles.includes(idx) && (
                          <div className="text-slate-50 bg-slate-600 rounded mt-5 border border-slate-300 p-10 ">
                            {
                              Array.isArray(data.idx_details[ns]) && data.idx_details[ns].map(d => {
                                return (
                                  <pre className={getClassesByName(d)}>
                                    <code>
                                      { JSON.stringify(d, null, 4) }
                                    </code>
                                  </pre>
                                )
                              })
                            }
                          </div>
                        )
                      }
                    </div>
                  </div>
                </li>
              )
            })
          }
        </ul>
      </div>
    </div>
  )
}