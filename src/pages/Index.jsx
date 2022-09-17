import React, { useState } from "react";
import IndexBanner from "../partials/dashboard/IndexBanner";
// import WelcomeBanner from "../partials/dashboard/WelcomeBanner";

export default (props) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <IndexBanner />
        
      </div>
    </div>
  )
}