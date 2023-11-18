import { useState } from "react";
import { LogMessage } from "./utils";

export default function useLogs() {
  const [logMsgs, setLogMsgs] = useState([LogMessage("App started...")]);

  function log(msg) {
    setLogMsgs((prev) => [...prev, LogMessage(msg)]);
  }

  function clearLogs() {
    setLogMsgs([LogMessage("Logs cleared!")]);
  }

  return [logMsgs, log, clearLogs];
}
