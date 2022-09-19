import React, { useState } from "react";
import IndexBanner from "../partials/dashboard/IndexBanner";
// import WelcomeBanner from "../partials/dashboard/WelcomeBanner";

const VISIBLE_UI_STATE = {
  DEFAULT: "DEFAULT",
  INDEX: "INDEX"
}


export default (props) => {

  const [visibleUI, setVisibleUI] = useState(VISIBLE_UI_STATE.DEFAULT);

  async function onIndexStats(path) {
    try {

      console.log("paath", path);

      const data = await window.engineAPI.indexStats(path);
      console.log(data)
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
    </div>
  )
}