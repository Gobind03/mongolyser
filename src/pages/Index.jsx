import React, { useState } from "react";
import IndexBanner from "../partials/dashboard/IndexBanner";
import IndexStatsDashboard from "../partials/dashboard/IndexStatsDashboard";
import QueryAnalyserDashboard from "../partials/dashboard/QueryAnalyserDashboard";

// import WelcomeBanner from "../partials/dashboard/WelcomeBanner";

const VISIBLE_UI_STATE = {
  DEFAULT: "DEFAULT",
  INDEX: "INDEX",
  QUERY_ANALYSIS: "QUERY_ANALYSIS"
}

export default (props) => {

  const [visibleUI, setVisibleUI] = useState(VISIBLE_UI_STATE.DEFAULT);
  const [data, setData] = useState({});

  async function onIndexStats(path) {

    // Validation for path
    if (!path) {
      alert("Please enter the MongoDB URL to scan");
      return;
    }

    try {
      const data = await window.engineAPI.indexStats(path);
      console.log(data);
      setData(data);
      setVisibleUI(VISIBLE_UI_STATE.INDEX);
    } catch (error) {
      console.error(error);
    }
  }

  async function onFilePicker() {
    try {
      const data = await window.engineAPI.logFilePicker();
      if (data.status !== 200) {
        alert("Please select a log file to get started");
        return;
      }

      setVisibleUI(VISIBLE_UI_STATE.DEFAULT);
      setData({ filePath: data.data.filePath })
    } catch (error) {
      alert("Error: Interal Engine Error")
      console.error(error);
    }
  }

  async function onQueryAnalysis(path) {
    if (!path) {
      alert("Please select a log file to get started");
      return;
    }

    try {
      const data = await window.engineAPI.queryAnalysis(path);
      console.log(data);
      setData(data);
      setVisibleUI(VISIBLE_UI_STATE.QUERY_ANALYSIS);
    } catch (error) {
      console.error(error);
    }
  }

  function onActionTrigger({ value, type, path }) {
    console.log("onActionTrigger:path", path);
    switch (value) {
      case "Index Analysis":
        onIndexStats(path);
        break;
      case "File Picker":
        onFilePicker();
        break;
      case "Query Analysis":
        onQueryAnalysis(path);
        break;
      default:
        break;
    }
  }

  function onBackAction() {
    setVisibleUI(VISIBLE_UI_STATE.DEFAULT);
  }

  return (
      <div className="flex bg-indigo-200 justify-center w-screen min-h-screen">
        { visibleUI === VISIBLE_UI_STATE.DEFAULT && (
            <IndexBanner 
              data={data}
              onAction={onActionTrigger}
              backAction={onBackAction} />
          ) 
        }
        { visibleUI === VISIBLE_UI_STATE.INDEX && (
            <IndexStatsDashboard 
              data={data}
              backAction={onBackAction}
            />
          ) 
        }
        { visibleUI === VISIBLE_UI_STATE.QUERY_ANALYSIS && (
            <QueryAnalyserDashboard 
              data={data}
              backAction={onBackAction}
            />
          ) 
        }
      </div>
  )
}