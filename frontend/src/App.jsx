function App() {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-tr from-slate-900 to-fuchsia-900 text-cyan-200 font-mono">
      {/* I section */}
      <div className="com outline-sky-500 basis-7/12 flex">
        <div className="com outline-orange-300 basis-1/2 flex flex-col items-center justify-around">
          <div className="com outline-green-300 basis-5/6 flex items-center justify-center">
            {" Bulb here "}
          </div>
          <button
            type="button"
            className="com outline-green-300 basis-1/6 ring ring-blue-300 hover:ring-blue-400 max-h-8 w-44"
          >
            {" on/off "}
          </button>
        </div>
        <div className="com outline-orange-300 basis-1/2 flex items-center justify-center">
          {" logs here "}
        </div>
      </div>
      {/* II section */}
      <div className="com outline-sky-500 basis-4/12 flex justify-around">
        <div className="com outline-orange-300 flex items-center justify-center basis-5/12">
          {" Color picker "}
        </div>
        <div className="com outline-orange-300 flex items-center justify-center basis-5/12">
          {" Temp picker picker "}
        </div>
        <div className="com outline-orange-300 flex items-center justify-center basis-1/12">
          {" Bright picker "}
        </div>
      </div>
      {/* III section */}
      <div className="com outline-sky-500 basis-1/12 flex flex-col items-center justify-center gap-2">
        <button
          type="button"
          className="com outline-orange-300 items-center ring ring-blue-300 hover:ring-blue-400 w-44"
        >
          {" pick interface "}
        </button>
      </div>
    </div>
  );
}

export default App;
