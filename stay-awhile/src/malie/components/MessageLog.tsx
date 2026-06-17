/** Mālie — a small scroll of what has passed. Newest line first. */
interface Props {
  messages: string[];
}

export function MessageLog({ messages }: Props) {
  return (
    <aside className="m-log" aria-label="What has passed">
      {messages.map((line, i) => (
        <p key={`${i}-${line}`} className={`m-log-line${i === 0 ? ' m-log-newest' : ''}`}>
          {line}
        </p>
      ))}
    </aside>
  );
}
