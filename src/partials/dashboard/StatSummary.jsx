import React from "react";
import DisplayNameMappers from "../../misc/DisplayNameMappers"

export default function StatSummary(props) {
  const { dataList, name } = props;
  const availableSummaries = Object.keys(DisplayNameMappers);
  return (
    <div className="col-span-full bg-white shadow-lg rounded-sm border border-slate-200 m-10">
      <header className="px-5 py-4 border-b border-slate-100">
        <h2 className="font-semibold text-indigo-800">{name}</h2>
      </header>
      <div className="flex items-start justify-around flex-wrap">
        {Object.keys(dataList).map((s) => {
          if (availableSummaries.indexOf(s) < 0) {
            return null;
          }
          return (
            <div
              key={DisplayNameMappers[s]}
              className="border border-slate-200 w-1/5 bg-white rounded overflow-hidden shadow-lg m-5"
            >
              <div className="px-6 py-4">
                <div className="text-m mb-2">{DisplayNameMappers[s]}</div>
                <p className="text-2xl font-bold leading-7 text-indigo-900">
                  {dataList[s]}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
