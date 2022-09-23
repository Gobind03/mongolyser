import React, { useState } from "react";
import IndexBanner from "../partials/dashboard/IndexBanner";
import IndexStatsDashboard from "../partials/dashboard/IndexStatsDashboard";
// import WelcomeBanner from "../partials/dashboard/WelcomeBanner";

const VISIBLE_UI_STATE = {
  DEFAULT: "DEFAULT",
  INDEX: "INDEX"
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


  function onActionTrigger({ value, type, path }) {
    if (value === "Index Analysis") {
      console.log("onActionTrigger:path", path);
      onIndexStats(path);
    }
  }

  return (
    <div className="flex bg-indigo-200 justify-center w-screen h-screen">
      { visibleUI === VISIBLE_UI_STATE.DEFAULT && <IndexBanner onAction={onActionTrigger} /> }
      { visibleUI === VISIBLE_UI_STATE.INDEX && (
          <IndexStatsDashboard 
            data={data}
          />
        ) 
      }
    </div>
  )
}