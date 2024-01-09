import { EventSourcePolyfill } from "event-source-polyfill";

const endpoint = "/respond/respond";
const apiUrl = `${process.env.REACT_APP_API_URL}${endpoint}`;

export const fetchResponse = (
  question: string,
  dialogueId: string | null,
  onChunkReceived: (chunk: string) => void,
  onStreamClosed: () => void
) => {
  if (!apiUrl) {
    throw new Error("REACT_APP_API_URL environment variable not set");
  }

  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No authentication token found.");
  }

  const urlWithParams = `${apiUrl}?question=${encodeURIComponent(
    question
  )}&dialogueId=${dialogueId || ""}`;

  const eventSource = new EventSourcePolyfill(urlWithParams, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // @ts-ignore
  eventSource.onmessage = (ev: MessageEvent) => {
    onChunkReceived(ev.data);
  };

  // @ts-ignore
  eventSource.onerror = (ev: Event) => {
    console.error("EventSource failed:", ev);
    eventSource.close();
    onStreamClosed();
  };

  return () => {
    eventSource.close();
  };
};
