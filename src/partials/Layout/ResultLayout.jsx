import React from "react";
import StatSummary from "../dashboard/StatSummary";
import CONSTANTS from "../../misc/Constants";
import BackBanner from "./BackBanner";
import ScrollToTop from "react-scroll-to-top";
import QueryAnalyserDashboard from "../dashboard/QueryAnalyserDashboard";
import IndexStatsDashboard from "../dashboard/IndexStatsDashboard";

export default function ResultLayout(props) {
  const { data, backAction, displayComponent } = props;
  const { INDEX, QUERY_ANALYSIS } = CONSTANTS;
  return (
    <div className="w-screen max-w-full mb-10">
      <BackBanner backAction={backAction} />
      {
          displayComponent === INDEX && (
            <>
              <StatSummary dataList = {data.idx_summary} name={"Index Stats Summary"} />
              <IndexStatsDashboard data={data} />
            </>
          )
      }
      {
          displayComponent === QUERY_ANALYSIS && (
            <>
              <StatSummary dataList = {data.data.summary} name={"Query Analysis Summary"} />
              <QueryAnalyserDashboard data={data} />
            </>
          )
      }
      <ScrollToTop smooth className="scroll-mongo-to-top" />
    </div>
  );
}
