import React from "react";

export default function BackBanner(props) {
  let {backAction} = props;
  return (
    <div className="flex ml-10 mt-5">
        <button onClick={backAction} className="font-bold text-indigo-800"><span className="hidden sm:inline"> &lt;- &nbsp;</span>Go Back</button>
    </div>
  );
}
