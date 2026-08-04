import { Collapsible } from "@base-ui/react/collapsible";
import { Popover } from "@base-ui/react/popover";
import { Select } from "@base-ui/react/select";
import { Check, ChevronDown, Info, LoaderCircle, Mic, Send } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";

import { isVoiceFiller } from "@/lib/assistant-copy";
import {
  assistantRateLimitMessage,
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
type TranscriptItem = TranscriptEntry & { id: number };
type FreeQuestion = { key: string; question: string };
type AssistantInitialization =
  | { allowed: false; retryAfter: number }
  | {
      allowed: true;
      remaining: number;
      greeting: { answer: string; audioUrl: string | null } | null;
    };

type TurnDecision =
  | {
      kind: "cached";
      match: "exact" | "semantic";
      answer: string;
      audioUrl: string | null;
      endConversation?: boolean;
      remaining: number;
    }
  | { kind: "realtime"; remaining: number }
  | { kind: "rate_limited"; retryAfter: number }
  | { kind: "limited"; remaining: 0 };

const IDLE_TIMEOUT_MS = 90_000;
const SESSION_TIMEOUT_MS = 5 * 60_000;
const QUOTA_MESSAGE =
  "This visitor has used this week's AI answer allowance. Cached questions remain available.";

let preparedQuestionsRequest: Promise<FreeQuestion[]> | null = null;

function fetchPreparedQuestions() {
  preparedQuestionsRequest ??= fetch("/api/assistant/faqs").then(async (response) => {
    if (!response.ok) throw new Error("FAQ listing failed");
    const result = (await response.json()) as { questions?: FreeQuestion[] };
    return result.questions ?? [];
  });
  return preparedQuestionsRequest.catch((error) => {
    preparedQuestionsRequest = null;
    throw error;
  });
}

function statusLabel(phase: Phase, textOnly: boolean) {
  if (phase === "connecting") return "Connecting";
  if (phase === "thinking") return "Thinking";
  if (phase === "speaking") return "Speaking";
  if (phase === "error") return "Unavailable";
  return textOnly ? "Type a question" : "Listening";
}

function activityLabel(phase: Phase) {
  if (phase === "connecting") return "Initializing conversation";
  if (phase === "thinking") return "Thinking";
  return null;
}

function FreeQuestionPicker({
  disabled,
  onSelect,
  userTurnCount,
}: {
  disabled: boolean;
  onSelect: (question: string) => void;
  userTurnCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [questions, setQuestions] = useState<FreeQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const autoOpenedRef = useRef(false);
  const previousUserTurnCountRef = useRef(userTurnCount);

  const loadQuestions = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setLoadError(false);
    try {
      setQuestions(await fetchPreparedQuestions());
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    if (disabled) {
      autoOpenedRef.current = false;
      setOpen(false);
      return;
    }
    if (autoOpenedRef.current) return;
    autoOpenedRef.current = true;
    setOpen(true);
    if (questions === null) void loadQuestions();
  }, [disabled, loadQuestions, questions]);

  useEffect(() => {
    if (userTurnCount > previousUserTurnCountRef.current) setOpen(false);
    previousUserTurnCountRef.current = userTurnCount;
  }, [userTurnCount]);

  return (
    <Collapsible.Root
      className="voice-free-questions"
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen && questions === null && !loading) void loadQuestions();
      }}
    >
      <Collapsible.Trigger className="voice-free-questions-trigger">
        <span>
          {userTurnCount === 0
            ? "Start with a prepared question"
            : "Browse prepared questions"}
        </span>
        <ChevronDown aria-hidden="true" />
      </Collapsible.Trigger>
      <Collapsible.Panel className="voice-free-questions-panel">
        {loading ? (
          <span className="voice-free-questions-loading">
            <LoaderCircle aria-hidden="true" /> Loading questions
          </span>
        ) : loadError ? (
          <button
            type="button"
            className="voice-free-questions-retry"
            onClick={() => void loadQuestions()}
          >
            Could not load questions. Try again
          </button>
        ) : questions?.length ? (
          <ul>
            {questions.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  className="voice-free-question-button"
                  disabled={disabled}
                  onClick={() => {
                    setOpen(false);
                    onSelect(item.question);
                  }}
                >
                  {item.question}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <span className="voice-free-questions-empty">
            No prepared questions available right now.
          </span>
        )}
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}

export function VoiceAssistant() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [userDraft, setUserDraft] = useState("");
  const [assistantDraft, setAssistantDraft] = useState("");
  const [question, setQuestion] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [textOnly, setTextOnly] = useState(false);
  const [preparedReady, setPreparedReady] = useState(false);
  const [realtimeReady, setRealtimeReady] = useState(false);
  const [model, setModel] = useState<RealtimeModel>(DEFAULT_REALTIME_MODEL);
  const [questionsRemaining, setQuestionsRemaining] = useState<number | null>(null);

  const peerRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<RTCDataChannel | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cachedAudioRef = useRef<HTMLAudioElement | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const transcriptIdRef = useRef(0);
  const userDraftRef = useRef("");
  const userDraftItemRef = useRef("");
  const assistantDraftRef = useRef("");
  const lastAssistantTextRef = useRef("");
  const responseActiveRef = useRef(false);
  const audioPlayingRef = useRef(false);
  const greetingPlayingRef = useRef(false);
  const closeAfterCachedAudioRef = useRef(false);
  const speechStartedDuringAssistantRef = useRef(false);
  const turnPendingRef = useRef(false);
  const pendingQuestionRef = useRef("");
  const pendingAnswerRef = useRef("");
  const turnBlockedUntilRef = useRef(0);
  const queuedHistoryRef = useRef<Array<{ role: "user" | "assistant"; text: string }>>(
    [],
  );
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

  const releaseRealtime = useCallback(() => {
    fetchAbortRef.current?.abort();
    const channel = channelRef.current;
    const peer = peerRef.current;
    const stream = streamRef.current;
    channelRef.current = null;
    peerRef.current = null;
    streamRef.current = null;
    fetchAbortRef.current = null;
    channel?.close();
    peer?.close();
    for (const track of stream?.getTracks() ?? []) track.stop();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.srcObject = null;
    }
    userDraftRef.current = "";
    userDraftItemRef.current = "";
    assistantDraftRef.current = "";
    responseActiveRef.current = false;
    audioPlayingRef.current = Boolean(
      cachedAudioRef.current && !cachedAudioRef.current.paused,
    );
    speechStartedDuringAssistantRef.current = false;
    pendingQuestionRef.current = "";
    pendingAnswerRef.current = "";
    setRealtimeReady(false);
    setUserDraft("");
    setAssistantDraft("");
  }, []);

  const releaseConnection = useCallback(() => {
    clearTimers();
    releaseRealtime();
    if (cachedAudioRef.current) {
      cachedAudioRef.current.pause();
      cachedAudioRef.current.removeAttribute("src");
      cachedAudioRef.current.load();
    }
    audioPlayingRef.current = false;
    userDraftRef.current = "";
    userDraftItemRef.current = "";
    assistantDraftRef.current = "";
    lastAssistantTextRef.current = "";
    greetingPlayingRef.current = false;
    closeAfterCachedAudioRef.current = false;
    turnPendingRef.current = false;
    pendingQuestionRef.current = "";
    pendingAnswerRef.current = "";
    turnBlockedUntilRef.current = 0;
    queuedHistoryRef.current = [];
    setUserDraft("");
    setAssistantDraft("");
  }, [clearTimers, releaseRealtime]);

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
    setPreparedReady(false);
    setQuestionsRemaining(null);
  }, [releaseConnection]);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = window.setTimeout(stopConversation, IDLE_TIMEOUT_MS);
  }, [stopConversation]);

  const appendTranscript = useCallback((entry: Omit<TranscriptItem, "id">) => {
    transcriptIdRef.current += 1;
    setTranscript((current) => [...current, { ...entry, id: transcriptIdRef.current }]);
  }, []);

  const send = useCallback((event: unknown) => {
    if (channelRef.current?.readyState !== "open") return false;
    channelRef.current.send(JSON.stringify(event));
    return true;
  }, []);

  const sendHistoryMessage = useCallback(
    (role: "user" | "assistant", text: string) => {
      const accepted = send({
        type: "conversation.item.create",
        item: {
          type: "message",
          role,
          content: [
            role === "user"
              ? { type: "input_text", text }
              : { type: "output_text", text },
          ],
        },
      });
      if (!accepted) queuedHistoryRef.current.push({ role, text });
      return accepted;
    },
    [send],
  );

  const finishGreeting = useCallback(() => {
    if (!greetingPlayingRef.current) return;
    greetingPlayingRef.current = false;
    for (const track of streamRef.current?.getAudioTracks() ?? []) track.enabled = true;
  }, []);

  const interruptAssistant = useCallback(() => {
    if (responseActiveRef.current) send({ type: "response.cancel" });
    if (audioPlayingRef.current) send({ type: "output_audio_buffer.clear" });
    if (cachedAudioRef.current && !cachedAudioRef.current.paused) {
      cachedAudioRef.current.pause();
      cachedAudioRef.current.currentTime = 0;
    }
    closeAfterCachedAudioRef.current = false;
    responseActiveRef.current = false;
    audioPlayingRef.current = false;
    finishGreeting();
  }, [finishGreeting, send]);

  const deliverCachedAnswer = useCallback(
    async (
      answer: string,
      audioUrl: string | null,
      match: "exact" | "semantic",
      endConversation = false,
    ) => {
      lastAssistantTextRef.current = answer;
      closeAfterCachedAudioRef.current = endConversation;
      sendHistoryMessage("assistant", answer);
      appendTranscript({
        role: "assistant",
        text: answer,
        source: "faq",
        ...(match === "semantic" ? { matchedBy: "semantic" as const } : {}),
      });

      const audio = cachedAudioRef.current;
      if (!audio || !audioUrl) {
        finishGreeting();
        if (endConversation) window.setTimeout(stopConversation, 900);
        else setPhase("listening");
        return;
      }

      try {
        audio.src = audioUrl;
        audio.currentTime = 0;
        audioPlayingRef.current = true;
        setPhase("speaking");
        await audio.play();
      } catch {
        audioPlayingRef.current = false;
        finishGreeting();
        if (endConversation) window.setTimeout(stopConversation, 900);
        else setPhase("listening");
      }
    },
    [appendTranscript, finishGreeting, sendHistoryMessage, stopConversation],
  );

  const routeUserTurn = useCallback(
    async (text: string) => {
      if (turnPendingRef.current) return;
      if (Date.now() < turnBlockedUntilRef.current) return;
      turnPendingRef.current = true;
      const generation = startGenerationRef.current;
      pendingQuestionRef.current = "";
      pendingAnswerRef.current = "";
      interruptAssistant();
      appendTranscript({ role: "user", text });
      setPhase("thinking");
      resetIdleTimer();

      try {
        const response = await fetch("/api/assistant/turn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: text }),
        });
        if (generation !== startGenerationRef.current) return;
        if (!response.ok) throw new Error("Turn routing failed");

        const decision = (await response.json()) as TurnDecision;

        if (decision.kind === "rate_limited") {
          turnBlockedUntilRef.current = Date.now() + decision.retryAfter;
          appendTranscript({
            role: "assistant",
            text: assistantRateLimitMessage(decision.retryAfter),
          });
          setPhase("listening");
          return;
        }

        setQuestionsRemaining(decision.remaining);

        if (decision.kind === "limited") {
          lastAssistantTextRef.current = QUOTA_MESSAGE;
          appendTranscript({ role: "assistant", text: QUOTA_MESSAGE });
          send({
            type: "conversation.item.create",
            item: {
              type: "message",
              role: "assistant",
              content: [{ type: "output_text", text: QUOTA_MESSAGE }],
            },
          });
          setPhase("listening");
          return;
        }

        if (decision.kind === "cached") {
          await deliverCachedAnswer(
            decision.answer,
            decision.audioUrl,
            decision.match,
            decision.endConversation,
          );
          return;
        }

        pendingQuestionRef.current = text;
        if (send({ type: "response.create" })) {
          responseActiveRef.current = true;
          setPhase("thinking");
        }
      } catch {
        setNotice("AI answer routing is temporarily unavailable. Try again shortly.");
        setPhase("listening");
      } finally {
        turnPendingRef.current = false;
      }
    },
    [appendTranscript, deliverCachedAnswer, interruptAssistant, resetIdleTimer, send],
  );

  const recordCandidate = useCallback((questionText: string, answer: string) => {
    void fetch("/api/assistant/candidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: questionText, answer }),
    }).catch(() => undefined);
  }, []);

  const handleServerEvent = useCallback(
    (raw: string) => {
      resetIdleTimer();
      for (const event of parseRealtimeEvent(raw)) {
        if (event.type === "speech-started") {
          userDraftRef.current = "";
          userDraftItemRef.current = "";
          setUserDraft("");
          const assistantBusy = responseActiveRef.current || audioPlayingRef.current;
          speechStartedDuringAssistantRef.current = assistantBusy;
          if (!assistantBusy) setPhase("listening");
        }
        if (event.type === "speech-stopped" && !speechStartedDuringAssistantRef.current)
          setPhase("thinking");
        if (event.type === "user-delta") {
          if (event.itemId && event.itemId !== userDraftItemRef.current) {
            userDraftItemRef.current = event.itemId;
            userDraftRef.current = "";
          }
          userDraftRef.current += event.text;
          setUserDraft(userDraftRef.current);
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
            if (pendingQuestionRef.current) pendingAnswerRef.current = text;
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
          finishGreeting();
          if (!responseActiveRef.current) setPhase("listening");
        }
        if (event.type === "user-done") {
          const text = event.text.trim();
          if (!event.itemId || event.itemId === userDraftItemRef.current) {
            userDraftRef.current = "";
            userDraftItemRef.current = "";
            setUserDraft("");
          }
          if (!text) {
            speechStartedDuringAssistantRef.current = false;
            if (!responseActiveRef.current && !audioPlayingRef.current)
              setPhase("listening");
            continue;
          }
          if (isVoiceFiller(text)) {
            speechStartedDuringAssistantRef.current = false;
            if (!responseActiveRef.current && !audioPlayingRef.current)
              setPhase("listening");
            continue;
          }
          const assistantSpeech = `${lastAssistantTextRef.current} ${assistantDraftRef.current}`;
          const isEcho =
            speechStartedDuringAssistantRef.current &&
            isLikelyEcho(text, assistantSpeech);
          speechStartedDuringAssistantRef.current = false;
          if (isEcho) {
            setPhase(
              audioPlayingRef.current
                ? "speaking"
                : responseActiveRef.current
                  ? "thinking"
                  : "listening",
            );
            continue;
          }
          void routeUserTurn(text);
        }
        if (event.type === "response-done") {
          responseActiveRef.current = false;
          if (
            event.status === "completed" &&
            pendingQuestionRef.current &&
            pendingAnswerRef.current
          )
            recordCandidate(pendingQuestionRef.current, pendingAnswerRef.current);
          pendingQuestionRef.current = "";
          pendingAnswerRef.current = "";
          if (!audioPlayingRef.current) setPhase("listening");
        }
        if (event.type === "end-conversation") window.setTimeout(stopConversation, 900);
        if (event.type === "error") {
          setError("AI assistant hit a temporary error. Try again.");
          setPhase("error");
        }
      }
    },
    [
      appendTranscript,
      finishGreeting,
      recordCandidate,
      resetIdleTimer,
      routeUserTurn,
      stopConversation,
    ],
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
      setPreparedReady(false);

      try {
        const response = await fetch("/api/assistant/initialize");
        if (!response.ok) throw new Error("Prepared questions could not start.");
        const assistant = (await response.json()) as AssistantInitialization;
        if (!assistant.allowed) throw new Error("Assistant is busy. Try again shortly.");
        if (startGeneration !== startGenerationRef.current) return;

        setQuestionsRemaining(assistant.remaining);
        setPreparedReady(true);
        resetIdleTimer();
        sessionTimerRef.current = window.setTimeout(stopConversation, SESSION_TIMEOUT_MS);

        const greeting = assistant.greeting ?? {
          answer: INITIAL_GREETING,
          audioUrl: null,
        };
        greetingPlayingRef.current = Boolean(greeting.audioUrl);
        void deliverCachedAnswer(greeting.answer, greeting.audioUrl, "exact");
      } catch (initializationError) {
        if (startGeneration !== startGenerationRef.current) return;
        releaseConnection();
        setError(
          initializationError instanceof Error
            ? initializationError.message
            : "Prepared questions could not start.",
        );
        setPhase("error");
        return;
      }

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
        if (stream && microphoneTrack) {
          microphoneTrack.enabled = !greetingPlayingRef.current;
          peer.addTrack(microphoneTrack, stream);
        } else peer.addTransceiver("audio", { direction: "recvonly" });

        channel.addEventListener("message", ({ data }) => {
          if (startGeneration === startGenerationRef.current && typeof data === "string")
            handleServerEvent(data);
        });

        channel.addEventListener("open", () => {
          if (startGeneration !== startGenerationRef.current) return;
          setRealtimeReady(true);
          for (const entry of queuedHistoryRef.current.splice(0))
            sendHistoryMessage(entry.role, entry.text);
          if (!audioPlayingRef.current) setPhase("listening");
          resetIdleTimer();
        });

        channel.addEventListener("close", () => {
          if (peerRef.current !== peer) return;
          releaseRealtime();
          setTextOnly(true);
          setNotice("Live AI is unavailable. Prepared questions still work.");
          if (!audioPlayingRef.current) setPhase("listening");
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
      } catch {
        if (startGeneration !== startGenerationRef.current) return;
        releaseRealtime();
        setTextOnly(true);
        setNotice("Live AI is unavailable. Prepared questions still work.");
        if (!audioPlayingRef.current) setPhase("listening");
      }
    },
    [
      deliverCachedAnswer,
      handleServerEvent,
      model,
      releaseConnection,
      releaseRealtime,
      resetIdleTimer,
      sendHistoryMessage,
      stopConversation,
    ],
  );

  const submitQuestion = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      const trimmed = text.trim();
      interruptAssistant();
      sendHistoryMessage("user", trimmed);
      setQuestion("");
      void routeUserTurn(trimmed);
    },
    [interruptAssistant, routeUserTurn, sendHistoryMessage],
  );

  const askQuestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = question.trim();
    if (!text) return;
    submitQuestion(text);
  };

  useEffect(() => releaseConnection, [releaseConnection]);

  const transcriptRevision = `${transcript.length}:${userDraft.length}:${assistantDraft.length}:${phase}`;

  useEffect(() => {
    if (!transcriptRevision) return;
    const transcriptPanel = transcriptRef.current;
    if (!transcriptPanel) return;
    const frame = window.requestAnimationFrame(() => {
      transcriptPanel.scrollTo({
        top: transcriptPanel.scrollHeight,
        behavior: "smooth",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [transcriptRevision]);

  const active = phase !== "idle";
  const connected = realtimeReady;
  const selectedModelInfo = REALTIME_MODELS.find((option) => option.id === model);
  const activeActivityLabel = activityLabel(phase);
  const userTurnCount = transcript.filter((entry) => entry.role === "user").length;

  return (
    <div className={`voice-guide${active ? " is-active" : ""}`}>
      <audio ref={audioRef} autoPlay className="sr-only">
        <track kind="captions" />
      </audio>
      <audio
        ref={cachedAudioRef}
        className="sr-only"
        preload="auto"
        onEnded={() => {
          audioPlayingRef.current = false;
          finishGreeting();
          if (closeAfterCachedAudioRef.current) stopConversation();
          else setPhase("listening");
        }}
      >
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
                <Popover.Root>
                  <Popover.Trigger
                    className="voice-quota-trigger"
                    aria-label="Weekly AI answer allowance"
                  >
                    <strong>{questionsRemaining ?? "–"}</strong>
                    <span>
                      {questionsRemaining === 1 ? "question" : "questions"} left
                    </span>
                    <Info aria-hidden="true" />
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Positioner
                      className="voice-quota-positioner"
                      sideOffset={8}
                      align="end"
                    >
                      <Popover.Popup className="voice-quota-popup">
                        <Popover.Title className="voice-quota-title">
                          Experimental usage limit
                        </Popover.Title>
                        <Popover.Description className="voice-quota-description">
                          During this experimental phase, each visitor can ask up to 10
                          questions per week that need a new AI answer. This keeps costs
                          predictable. Prepared questions do not count toward this quota.
                          Ask them in your own words and, when matched, the answer shows a
                          Prepared label—or choose one from Browse prepared questions at
                          the bottom of the chat.
                        </Popover.Description>
                      </Popover.Popup>
                    </Popover.Positioner>
                  </Popover.Portal>
                </Popover.Root>
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
              phase === "listening" ? (
                <p className="voice-placeholder">
                  Ask about Anthony's work, projects, or experience.
                </p>
              ) : null}
              {transcript.map((entry) => (
                <div className={`voice-message is-${entry.role}`} key={entry.id}>
                  <span>{entry.role === "user" ? "You" : "Assistant"}</span>
                  <p>
                    {entry.text}
                    {entry.source === "faq" ? (
                      <small
                        className="voice-message-badge"
                        title="Prepared answer — no quota used"
                      >
                        Prepared
                      </small>
                    ) : null}
                    {import.meta.env.DEV && entry.matchedBy === "semantic" ? (
                      <small
                        className="voice-message-badge is-semantic"
                        title="Matched to a cached FAQ by meaning"
                      >
                        Semantic
                      </small>
                    ) : null}
                  </p>
                </div>
              ))}
              {userDraft ? (
                <div className="voice-message is-user is-streaming">
                  <span>You</span>
                  <p>{userDraft}</p>
                </div>
              ) : null}
              {assistantDraft ? (
                <div className="voice-message is-assistant is-streaming">
                  <span>Assistant</span>
                  <p>{assistantDraft}</p>
                </div>
              ) : null}
              {activeActivityLabel && !assistantDraft && !error ? (
                <div className="voice-activity-marker" role="status">
                  <LoaderCircle aria-hidden="true" />
                  <span>{activeActivityLabel}</span>
                </div>
              ) : null}
              {notice ? (
                <p
                  className={`voice-notice${
                    notice.startsWith("Live AI") ? " is-warning" : ""
                  }`}
                >
                  {notice}
                </p>
              ) : null}
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
              <div className="voice-panel-footer">
                <FreeQuestionPicker
                  disabled={!preparedReady}
                  onSelect={submitQuestion}
                  userTurnCount={userTurnCount}
                />
                <form className="voice-question" onSubmit={askQuestion}>
                  <label htmlFor="voice-question">Type instead</label>
                  <div>
                    <input
                      id="voice-question"
                      value={question}
                      onChange={(event) => setQuestion(event.target.value)}
                      placeholder={
                        !preparedReady
                          ? "Loading prepared questions…"
                          : connected
                            ? "Ask a question"
                            : "Live AI unavailable"
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
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
