function App() {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-tr from-slate-900 to-fuchsia-900 text-cyan-200 font-mono">
      <div className="com outline-sky-500 basis-1/2 flex">
        <div className="com outline-orange-300 basis-2/3 flex items-center justify-center">
          {" Bulb here "}
        </div>
        <div className="com outline-orange-300 basis-1/3 flex items-center justify-center">
          {" Button here "}
        </div>
      </div>

      <div className="com outline-sky-500 basis-1/3 flex ">
        <div className="com outline-orange-300 flex items-center justify-center basis-5/12">
          {" Color picker "}
        </div>
        <div className="com outline-orange-300 flex items-center justify-center basis-5/12">
          {" Temp picker picker "}
        </div>
        <div className="com outline-orange-300 flex items-center justify-center basis-2/12">
          {" Bright picker "}
        </div>
      </div>

      <div className="com outline-sky-500 basis-1/6 flex flex-col items-center justify-center gap-2">
        <button
          type="button"
          className="com outline-orange-300 items-center ring ring-blue-300 hover:ring-blue-400 w-44"
        >
          {" pick interface "}
        </button>
        <button
          type="button"
          className="com outline-orange-300 items-center ring ring-blue-300 hover:ring-blue-400 w-44"
        >
          {" logs "}
        </button>
      </div>
    </div>
  );
}

export default App;
