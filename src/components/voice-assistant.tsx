import { Select } from "@base-ui/react/select";
import { Check, ChevronDown, Mic, Send } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";

import {
  INITIAL_GREETING,
  isLikelyEcho,
  parseRealtimeEvent,
  type TranscriptEntry,
} from "@/lib/realtime";
import {
  DEFAULT_REALTIME_MODEL,
  isRealtimeModel,
  REALTIME_MODELS,
  type RealtimeModel,
} from "@/lib/realtime-models";

type Phase = "idle" | "connecting" | "listening" | "thinking" | "speaking" | "error";

const IDLE_TIMEOUT_MS = 90_000;
const SESSION_TIMEOUT_MS = 5 * 60_000;

function statusLabel(phase: Phase, textOnly: boolean) {
  if (phase === "connecting") return "Connecting";
  if (phase === "thinking") return "Thinking";
  if (phase === "speaking") return "Speaking";
  if (phase === "error") return "Unavailable";
  return textOnly ? "Type a question" : "Listening";
}

export function VoiceAssistant() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [assistantDraft, setAssistantDraft] = useState("");
  const [question, setQuestion] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [textOnly, setTextOnly] = useState(false);
  const [model, setModel] = useState<RealtimeModel>(DEFAULT_REALTIME_MODEL);

  const peerRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<RTCDataChannel | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const assistantDraftRef = useRef("");
  const lastAssistantTextRef = useRef("");
  const responseActiveRef = useRef(false);
  const audioPlayingRef = useRef(false);
  const speechStartedDuringAssistantRef = useRef(false);
  const fetchAbortRef = useRef<AbortController | null>(null);
  const idleTimerRef = useRef<number | null>(null);
  const sessionTimerRef = useRef<number | null>(null);
  const startGenerationRef = useRef(0);

  const clearTimers = useCallback(() => {
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    if (sessionTimerRef.current) window.clearTimeout(sessionTimerRef.current);
    idleTimerRef.current = null;
    sessionTimerRef.current = null;
  }, []);

  const releaseConnection = useCallback(() => {
    clearTimers();
    fetchAbortRef.current?.abort();
    channelRef.current?.close();
    peerRef.current?.close();
    for (const track of streamRef.current?.getTracks() ?? []) track.stop();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.srcObject = null;
    }
    fetchAbortRef.current = null;
    channelRef.current = null;
    peerRef.current = null;
    streamRef.current = null;
    assistantDraftRef.current = "";
    lastAssistantTextRef.current = "";
    responseActiveRef.current = false;
    audioPlayingRef.current = false;
    speechStartedDuringAssistantRef.current = false;
    setAssistantDraft("");
  }, [clearTimers]);

  const stopConversation = useCallback(() => {
    startGenerationRef.current += 1;
    if (channelRef.current?.readyState === "open") {
      channelRef.current.send(JSON.stringify({ type: "response.cancel" }));
      channelRef.current.send(JSON.stringify({ type: "output_audio_buffer.clear" }));
    }
    releaseConnection();
    setPhase("idle");
    setTranscript([]);
    setQuestion("");
    setError("");
    setNotice("");
    setTextOnly(false);
  }, [releaseConnection]);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = window.setTimeout(stopConversation, IDLE_TIMEOUT_MS);
  }, [stopConversation]);

  const appendTranscript = useCallback((entry: TranscriptEntry) => {
    setTranscript((current) => [...current, entry].slice(-6));
  }, []);

  const send = useCallback((event: unknown) => {
    if (channelRef.current?.readyState !== "open") return false;
    channelRef.current.send(JSON.stringify(event));
    return true;
  }, []);

  const interruptAssistant = useCallback(() => {
    if (responseActiveRef.current) send({ type: "response.cancel" });
    if (audioPlayingRef.current) send({ type: "output_audio_buffer.clear" });
    responseActiveRef.current = false;
    audioPlayingRef.current = false;
  }, [send]);

  const handleServerEvent = useCallback(
    (raw: string) => {
      resetIdleTimer();
      for (const event of parseRealtimeEvent(raw)) {
        if (event.type === "speech-started") {
          const assistantBusy = responseActiveRef.current || audioPlayingRef.current;
          speechStartedDuringAssistantRef.current = assistantBusy;
          if (!assistantBusy) setPhase("listening");
        }
        if (event.type === "response-started") {
          responseActiveRef.current = true;
          setPhase("thinking");
        }
        if (event.type === "assistant-delta") {
          assistantDraftRef.current += event.text;
          setAssistantDraft(assistantDraftRef.current);
          setPhase("speaking");
        }
        if (event.type === "assistant-done") {
          const text = event.text.trim() || assistantDraftRef.current.trim();
          if (text) {
            lastAssistantTextRef.current = text;
            appendTranscript({ role: "assistant", text });
          }
          assistantDraftRef.current = "";
          setAssistantDraft("");
        }
        if (event.type === "audio-started") {
          audioPlayingRef.current = true;
          setPhase("speaking");
        }
        if (event.type === "audio-stopped") {
          audioPlayingRef.current = false;
          if (!responseActiveRef.current) setPhase("listening");
        }
        if (event.type === "user-done" && event.text.trim()) {
          const text = event.text.trim();
          const assistantSpeech = `${lastAssistantTextRef.current} ${assistantDraftRef.current}`;
          const isEcho =
            speechStartedDuringAssistantRef.current &&
            isLikelyEcho(text, assistantSpeech);
          speechStartedDuringAssistantRef.current = false;
          if (isEcho) continue;
          interruptAssistant();
          appendTranscript({ role: "user", text });
          if (send({ type: "response.create" })) responseActiveRef.current = true;
          setPhase("thinking");
        }
        if (event.type === "response-done") {
          responseActiveRef.current = false;
          if (!audioPlayingRef.current) setPhase("listening");
        }
        if (event.type === "end-conversation") window.setTimeout(stopConversation, 900);
        if (event.type === "error") {
          setError("AI assistant hit a temporary error. Try again.");
          setPhase("error");
        }
      }
    },
    [appendTranscript, interruptAssistant, resetIdleTimer, send, stopConversation],
  );

  const startConversation = useCallback(
    async (selectedModel = model) => {
      const startGeneration = ++startGenerationRef.current;
      releaseConnection();
      setPhase("connecting");
      setTranscript([]);
      setQuestion("");
      setError("");
      setNotice("");
      setTextOnly(false);

      try {
        if (!("RTCPeerConnection" in window))
          throw new Error("WebRTC is not supported by this browser.");

        let stream: MediaStream | null = null;
        try {
          if (!navigator.mediaDevices?.getUserMedia)
            throw new DOMException("Microphone unavailable", "NotSupportedError");
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              autoGainControl: true,
              echoCancellation: true,
              noiseSuppression: true,
            },
          });
          if (startGeneration !== startGenerationRef.current) {
            for (const track of stream.getTracks()) track.stop();
            return;
          }
        } catch (microphoneError) {
          if (startGeneration !== startGenerationRef.current) return;
          const blocked =
            microphoneError instanceof DOMException &&
            ["NotAllowedError", "NotFoundError", "NotSupportedError"].includes(
              microphoneError.name,
            );
          if (!blocked) throw microphoneError;
          setTextOnly(true);
          setNotice("Microphone unavailable. Type a question instead.");
        }

        const peer = new RTCPeerConnection();
        const channel = peer.createDataChannel("oai-events");
        peerRef.current = peer;
        channelRef.current = channel;
        streamRef.current = stream;

        peer.ontrack = ({ streams }) => {
          if (audioRef.current && streams[0]) audioRef.current.srcObject = streams[0];
        };

        const microphoneTrack = stream?.getAudioTracks()[0];
        if (stream && microphoneTrack) peer.addTrack(microphoneTrack, stream);
        else peer.addTransceiver("audio", { direction: "recvonly" });

        channel.addEventListener("message", ({ data }) => {
          if (startGeneration === startGenerationRef.current && typeof data === "string")
            handleServerEvent(data);
        });

        channel.addEventListener("open", () => {
          if (startGeneration !== startGenerationRef.current) return;
          channel.send(
            JSON.stringify({
              type: "response.create",
              response: {
                instructions: `Say exactly: "${INITIAL_GREETING}" Say nothing else. Do not change any word or punctuation.`,
                output_modalities: ["audio"],
              },
            }),
          );
          responseActiveRef.current = true;
          setPhase("thinking");
          resetIdleTimer();
          sessionTimerRef.current = window.setTimeout(
            stopConversation,
            SESSION_TIMEOUT_MS,
          );
        });

        channel.addEventListener("close", () => {
          if (peerRef.current === peer) stopConversation();
        });

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        if (startGeneration !== startGenerationRef.current) return;

        const sessionUrl = import.meta.env.DEV
          ? `/api/realtime/session?model=${encodeURIComponent(selectedModel)}`
          : "/api/realtime/session";
        const fetchController = new AbortController();
        fetchAbortRef.current = fetchController;
        const response = await fetch(sessionUrl, {
          method: "POST",
          headers: { "Content-Type": "application/sdp" },
          body: offer.sdp,
          signal: fetchController.signal,
        });

        if (startGeneration !== startGenerationRef.current) return;

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            message?: string;
          } | null;
          throw new Error(body?.message ?? "AI assistant could not start.");
        }

        const answer = await response.text();
        if (startGeneration !== startGenerationRef.current) return;
        if (fetchAbortRef.current === fetchController) fetchAbortRef.current = null;
        await peer.setRemoteDescription({ type: "answer", sdp: answer });
      } catch (connectionError) {
        if (startGeneration !== startGenerationRef.current) return;
        releaseConnection();
        setError(
          connectionError instanceof Error
            ? connectionError.message
            : "AI assistant could not start.",
        );
        setPhase("error");
      }
    },
    [handleServerEvent, model, releaseConnection, resetIdleTimer, stopConversation],
  );

  const askQuestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = question.trim();
    if (!text) return;
    interruptAssistant();
    const accepted = send({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text }],
      },
    });
    if (!accepted) return;
    appendTranscript({ role: "user", text });
    setQuestion("");
    setPhase("thinking");
    resetIdleTimer();
    if (send({ type: "response.create" })) responseActiveRef.current = true;
  };

  useEffect(() => releaseConnection, [releaseConnection]);

  useEffect(() => {
    const transcriptPanel = transcriptRef.current;
    if (!transcriptPanel) return;
    const frame = window.requestAnimationFrame(() => {
      transcriptPanel.scrollTo({
        top: transcriptPanel.scrollHeight,
        behavior: "smooth",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  });

  const active = phase !== "idle";
  const connected = channelRef.current?.readyState === "open";
  const selectedModelInfo = REALTIME_MODELS.find((option) => option.id === model);

  return (
    <div className={`voice-guide${active ? " is-active" : ""}`}>
      <audio ref={audioRef} autoPlay className="sr-only">
        <track kind="captions" />
      </audio>

      {!active ? (
        <div className="voice-invite">
          <span className="voice-invite-copy">
            <span className="voice-invite-title">
              <strong>Ask about Anthony</strong>
              <small className="voice-experimental">Experimental</small>
            </span>
            <small>Realtime AI voice · microphone optional</small>
          </span>
          <svg className="voice-arrow" viewBox="0 0 84 52" aria-hidden="true">
            <path d="M4 40C20 8 49 1 78 9" />
            <path d="M68 0 78 9 65 12" />
          </svg>
          <button
            type="button"
            className="voice-trigger"
            onClick={() => void startConversation()}
            aria-label="Start AI conversation about Anthony"
          >
            <Mic aria-hidden="true" />
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            className="voice-scrim"
            onClick={stopConversation}
            aria-label="End voice conversation"
          />
          <section className="voice-panel" role="dialog" aria-labelledby="voice-title">
            <header className="voice-panel-header">
              <div className="voice-panel-identity">
                <span className={`voice-status-dot is-${phase}`} />
                <div>
                  <h2 id="voice-title">Anthony AI assistant</h2>
                  <p>{statusLabel(phase, textOnly)}</p>
                </div>
              </div>
              <div className="voice-panel-actions">
                {import.meta.env.DEV ? (
                  <div className="voice-model-picker">
                    <Select.Root<RealtimeModel>
                      value={model}
                      onValueChange={(selectedModel) => {
                        if (!isRealtimeModel(selectedModel)) return;
                        setModel(selectedModel);
                        void startConversation(selectedModel);
                      }}
                    >
                      <Select.Trigger
                        className="voice-model-trigger"
                        aria-label="Realtime model"
                      >
                        <span className="voice-model-name">{model}</span>
                        <span className="voice-model-summary">
                          <span>{selectedModelInfo?.quality}</span>
                          <span>{selectedModelInfo?.cost}</span>
                        </span>
                        <Select.Icon className="voice-model-chevron">
                          <ChevronDown aria-hidden="true" />
                        </Select.Icon>
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Positioner
                          className="voice-model-positioner"
                          sideOffset={8}
                          align="end"
                          alignItemWithTrigger={false}
                        >
                          <Select.Popup className="voice-model-popup">
                            {REALTIME_MODELS.map((option) => (
                              <Select.Item
                                className="voice-model-option"
                                value={option.id}
                                key={option.id}
                              >
                                <span className="voice-model-check-slot">
                                  <Select.ItemIndicator className="voice-model-check">
                                    <Check aria-hidden="true" />
                                  </Select.ItemIndicator>
                                </span>
                                <span className="voice-model-option-name">
                                  {option.id}
                                </span>
                                <span className="voice-model-option-meta">
                                  <span>{option.quality} quality</span>
                                  <span>{option.cost} cost</span>
                                </span>
                              </Select.Item>
                            ))}
                          </Select.Popup>
                        </Select.Positioner>
                      </Select.Portal>
                    </Select.Root>
                  </div>
                ) : null}
                <button
                  type="button"
                  className="voice-end-button"
                  onClick={stopConversation}
                >
                  End conversation
                </button>
              </div>
            </header>

            <div
              ref={transcriptRef}
              className="voice-transcript"
              aria-live="polite"
              aria-relevant="additions text"
            >
              {transcript.length === 0 &&
              !assistantDraft &&
              !error &&
              (phase === "connecting" || phase === "listening") ? (
                <p className="voice-placeholder">
                  {phase === "connecting"
                    ? "Opening a secure voice session…"
                    : "Ask about Anthony's work, projects, or experience."}
                </p>
              ) : null}
              {transcript.map((entry) => (
                <div
                  className={`voice-message is-${entry.role}`}
                  key={`${entry.role}:${entry.text}`}
                >
                  <span>{entry.role === "user" ? "You" : "Assistant"}</span>
                  <p>{entry.text}</p>
                </div>
              ))}
              {assistantDraft ? (
                <div className="voice-message is-assistant is-streaming">
                  <span>Assistant</span>
                  <p>{assistantDraft}</p>
                </div>
              ) : null}
              {phase === "thinking" && !assistantDraft && !error ? (
                <div
                  className="voice-thinking"
                  role="status"
                  aria-label="Assistant is thinking"
                >
                  <i />
                  <i />
                  <i />
                </div>
              ) : null}
              {notice ? <p className="voice-notice">{notice}</p> : null}
              {error ? <p className="voice-error">{error}</p> : null}
            </div>

            {phase === "error" ? (
              <div className="voice-error-actions">
                <button type="button" onClick={() => void startConversation()}>
                  Try again
                </button>
                <button type="button" onClick={stopConversation}>
                  Close
                </button>
              </div>
            ) : (
              <form className="voice-question" onSubmit={askQuestion}>
                <label htmlFor="voice-question">Type instead</label>
                <div>
                  <input
                    id="voice-question"
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    placeholder={
                      phase === "connecting" ? "Connecting…" : "Ask a question"
                    }
                    maxLength={500}
                    disabled={!connected}
                  />
                  <button
                    type="submit"
                    disabled={!connected || !question.trim()}
                    aria-label="Send question"
                  >
                    <Send aria-hidden="true" />
                  </button>
                </div>
              </form>
            )}
          </section>
        </>
      )}
    </div>
  );
}
