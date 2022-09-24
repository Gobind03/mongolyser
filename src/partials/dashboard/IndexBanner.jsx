import React, { useEffect, useState } from 'react';
import Select from "react-select";

// TODO: Discuss should we have a central place to list all analysis
function IndexBanner(props) {

  const [actions, setActions] = useState([
    { value: "Index Analysis",  label: "Index Analysis", type: "cluster"},
    { value: "Sharding Analysis",  label: "Sharding Analysis", type: "cluster"},
    { value: "Oplog Analysis",  label: "Oplog Analysis", type: "cluster"},
    { value: "General Cluster Health",  label: "General Cluster Health", type: "cluster"},
    { value: "Cluster Event Analysis",  label: "Cluster Event Analysis", type: "log"},
    { value: "Query Analysis",  label: "Query Analysis", type: "log"},
    { value: "Query Pattern Analysis",  label: "Query Pattern Analysis", type: "log"},
    { value: "Connection Analysis",  label: "Connection Analysis", type: "log"}
  ]);

  const [actionSelected, setActionSelected] = useState({});
  const [connectionUrl, setConnectionUrl] = useState("");

  useEffect(() => {
    if (props.data.filePath) {
      setConnectionUrl(props.data.filePath);
    }
  }, [props.data.filePath])

  return (
    <div className="relative p-4 sm:p-6 rounded-sm overflow-hidden max-w-sm">

      {/* Background illustration */}
      <div className="absolute right-0 top-0 -mt-4 mr-16 pointer-events-none hidden xl:block" aria-hidden="true">
      </div>

      {/* Content */}
      <div className="relative">
        <h1 className="text-2xl md:text-3xl text-slate-800 font-bold mb-1">Hello 👋!</h1>
        <p>Please select the analysis you want to do:</p>
      </div>

      <Select placeholder="Select Analysis Type" value={actionSelected} options={actions} onChange={(value) => setActionSelected(value)} />

      {
        actionSelected.type === "cluster" && (
          <div className='mt-5'>
            <label for="exampleFormControlInput1" class="form-label inline-block mb-2 text-gray-700">Enter Cluster Link</label>
            <input id='exampleFormControlInput1' value={connectionUrl} onChange={e => setConnectionUrl(e.target.value)} placeholder='mongodb+srv://your-cluster-link/?rsname' className='form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-indigo-600 rounded transition ease-in-out m-0 focus:border-indigo-600 focus:bg-white focus:border-indigo-600 focus:outline-none' />
          </div>
        )
      }

      {
        actionSelected.type === "log" && (
          <>
            <div className="relative bg-indigo-200 p-4 sm:p-6 rounded-sm overflow-hidden mb-8 flex flex-col text-ellipsis">
              <button onClick={e => props.onAction({ value: "File Picker" })} className='btn bg-indigo-500 hover:bg-indigo-600 text-white'>Click to upload log files</button>
              { props.data?.filePath && (
                <pre className='border border-slate-300 mt-5 max-w-sm truncate ...'><code title={props.data?.filePath}>
                File Selected: {props.data?.filePath.split("/").pop()}</code></pre>)}
            </div>
          </>
        )
      }
      
      <button onClick={e => {
        e.preventDefault();
        props.onAction({ value: actionSelected.value, type: actionSelected.type, path: connectionUrl })
      }} className='btn bg-indigo-500 hover:bg-indigo-600 text-white mt-3'>Submit</button>
    </div>
  );
}

export default IndexBanner;
