import React, { useState } from 'react';


// TODO: Discuss should we have a central place to list all analysis
function IndexBanner() {

  const [actions, setActions] = useState([
    { name: "Index Analysis", type: "cluster"},
    { name: "Sharding Analysis", type: "cluster"},
    { name: "Oplog Analysis", type: "cluster"},
    { name: "General Cluster Health", type: "cluster"},
    { name: "Cluster Event Analysis", type: "log"},
    { name: "Query Analysis", type: "log"},
    { name: "Query Pattern Analysis", type: "log"},
    { name: "Connection Analysis", type: "log"}
  ]);

  const [actionSelected, setActionSelected] = useState(null);

  function onActionClick(event, type) {
    event.preventDefault();
    console.log("You Clicked ", type);
  }

  

  return (
    <div className="relative bg-indigo-200 p-4 sm:p-6 rounded-sm overflow-hidden mb-8">

      {/* Background illustration */}
      <div className="absolute right-0 top-0 -mt-4 mr-16 pointer-events-none hidden xl:block" aria-hidden="true">
        <svg width="319" height="198" xmlnsXlink="http://www.w3.org/1999/xlink">
          <defs>
            <path id="welcome-a" d="M64 0l64 128-64-20-64 20z" />
            <path id="welcome-e" d="M40 0l40 80-40-12.5L0 80z" />
            <path id="welcome-g" d="M40 0l40 80-40-12.5L0 80z" />
            <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="welcome-b">
              <stop stopColor="#A5B4FC" offset="0%" />
              <stop stopColor="#818CF8" offset="100%" />
            </linearGradient>
            <linearGradient x1="50%" y1="24.537%" x2="50%" y2="100%" id="welcome-c">
              <stop stopColor="#4338CA" offset="0%" />
              <stop stopColor="#6366F1" stopOpacity="0" offset="100%" />
            </linearGradient>
          </defs>
          <g fill="none" fillRule="evenodd">
            <g transform="rotate(64 36.592 105.604)">
              <mask id="welcome-d" fill="#fff">
                <use xlinkHref="#welcome-a" />
              </mask>
              <use fill="url(#welcome-b)" xlinkHref="#welcome-a" />
              <path fill="url(#welcome-c)" mask="url(#welcome-d)" d="M64-24h80v152H64z" />
            </g>
            <g transform="rotate(-51 91.324 -105.372)">
              <mask id="welcome-f" fill="#fff">
                <use xlinkHref="#welcome-e" />
              </mask>
              <use fill="url(#welcome-b)" xlinkHref="#welcome-e" />
              <path fill="url(#welcome-c)" mask="url(#welcome-f)" d="M40.333-15.147h50v95h-50z" />
            </g>
            <g transform="rotate(44 61.546 392.623)">
              <mask id="welcome-h" fill="#fff">
                <use xlinkHref="#welcome-g" />
              </mask>
              <use fill="url(#welcome-b)" xlinkHref="#welcome-g" />
              <path fill="url(#welcome-c)" mask="url(#welcome-h)" d="M40.333-15.147h50v95h-50z" />
            </g>
          </g>
        </svg>
      </div>

      {/* Content */}
      <div className="relative">
        <h1 className="text-2xl md:text-3xl text-slate-800 font-bold mb-1">Hello 👋!</h1>
        <p>Please select the analysis you want to do:</p>
      </div>
      {
        actions.map(a => <button onClick={e => onActionClick(e, a.type)} className='btn bg-indigo-500 hover:bg-indigo-600 text-white'>{a.name}</button>)
      }

      <label for="exampleFormControlInput1" class="form-label inline-block mb-2 text-gray-700">Enter Cluster Link</label>
      <input id='exampleFormControlInput1' placeholder='mongodb+srv://your-cluster-link/?rsname' className='form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-indigo-600 rounded transition ease-in-out m-0 focus:border-indigo-600 focus:bg-white focus:border-indigo-600 focus:outline-none' />
      <button className='btn bg-indigo-500 hover:bg-indigo-600 text-white'>Submit</button>

      <div className="relative bg-indigo-200 p-4 sm:p-6 rounded-sm overflow-hidden mb-8">
        <button className='btn bg-indigo-500 hover:bg-indigo-600 text-white'>Click to upload log files</button>
      </div>
    </div>
  );
}

export default IndexBanner;
