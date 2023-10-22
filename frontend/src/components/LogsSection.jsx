import ScrollToBottom from 'react-scroll-to-bottom';


export default function LogsSection(props) {
  const logs = props.logs.map(log => <p>{log}</p>);

  return (
    <ScrollToBottom {...props}>
      {logs}
    </ScrollToBottom>
  );
}
