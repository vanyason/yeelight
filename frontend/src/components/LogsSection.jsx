import ScrollToBottom from "react-scroll-to-bottom";

export default function LogsSection(props) {
  let counter = 0;
  const logs = props.logs.map((log) => <p key={counter++}> {log}</p>);

  return <ScrollToBottom {...props}>{logs}</ScrollToBottom>;
}
