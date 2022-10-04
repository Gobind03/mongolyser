import React, { useState } from "react";
import IndexBanner from "../partials/dashboard/IndexBanner";
import ResultLayout from "../partials/Layout/ResultLayout";
import CONSTANTS from "../misc/Constants";


export default (props) => {
  const {DEFAULT, INDEX, QUERY_ANALYSIS } = CONSTANTS;
  const [visibleUI, setVisibleUI] = useState(DEFAULT);
  const [data, setData] = useState({});
  
  async function onIndexStats(path) {
    // Validation for path
    if (!path) {
      alert("Please enter the MongoDB URL to scan");
      return;
    }

    try {
      const data = await window.engineAPI.indexStats(path);
      setData(data);
      setVisibleUI(INDEX);
    } catch (error) {
      console.error(error);
    }
  }

  async function onFilePicker(event) {
    const file = event?.target?.files[0];
    const path = file?.path;
    try {
      if (!file) {
        alert("Please select a log file to get started");
        setData({});
        return;
      }
      setVisibleUI(DEFAULT);
      setData({ filePath: path });
    } catch (error) {
      alert("Error: Interal Engine Error");
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
      setData(data);
      setVisibleUI(QUERY_ANALYSIS);
    } catch (error) {
      console.error(error);
    }
  }

  function onActionTrigger({ value, payload, path, type }) {
    console.log("onActionTrigger:path", path);
    switch (value) {
      case "Index Analysis":
        onIndexStats(path);
        break;
      case "File Picker":
        onFilePicker(payload);
        break;
      case "Query Analysis":
        onQueryAnalysis(path);
        break;
      default:
        break;
    }
  }

  function onBackAction() {
    setVisibleUI(DEFAULT);
  }

  return (
    <>
      {visibleUI === DEFAULT ? (
        <div className="flex bg-indigo-200 justify-center w-screen min-h-screen">
          <IndexBanner
            data={data}
            onAction={onActionTrigger}
            backAction={onBackAction}
          />
        </div>
      ) : (
        <ResultLayout data={data} backAction={onBackAction} displayComponent={visibleUI}/>
      )}
    </>
  );
};
