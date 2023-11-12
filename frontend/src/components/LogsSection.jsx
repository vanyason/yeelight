import ScrollToBottom from "react-scroll-to-bottom";

export default function LogsSection({ parentClasses, logs }) {
  let counter = 0;
  return (
    <ScrollToBottom
      className={`${parentClasses} p-4 outline rounded outline-2 outline-gray-400 overflow-auto font-mono bg-gradient-to-b from-grey-900 to-indigo-400`}
    >
      {logs.map((log) => (
        <p key={counter++}> {log}</p>
      ))}
    </ScrollToBottom>
  );
}
