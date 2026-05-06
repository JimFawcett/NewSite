# Notes: Speech-to-Text from Microphone Input

---

## 2026-05-05 — Can Claude Code write voice-to-text programs?

### Prompt
> Can Claude Code write programs that use voice to text conversion from mic input? List languages that have supporting libraries.

### Response

Yes, Claude Code can write voice-to-text programs using mic input. Here are the main languages with solid library support:

#### Python
- **SpeechRecognition** — wraps Google, Sphinx, Whisper, Azure, etc.
- **OpenAI Whisper** — local, high-accuracy, offline capable
- **Vosk** — lightweight, offline, many languages
- **PyAudio** / **sounddevice** — mic capture
- **Azure Cognitive Services SDK** / **Google Cloud Speech SDK**

#### JavaScript / Node.js
- **Web Speech API** — browser-native, no install needed (Chrome/Edge)
- **@google-cloud/speech** — Node SDK for Google Cloud Speech-to-Text
- **whisper.node** / **openai** npm package — Whisper via API or local

#### C#
- **System.Speech** — built into .NET (Windows only, offline)
- **Microsoft.CognitiveServices.Speech** — Azure SDK, cross-platform
- **NAudio** — mic capture

#### C++ / Rust
- **Vosk-API** — C++ bindings, offline, embeddable
- **whisper.cpp** — Whisper port in C++, no dependencies
- **coqui-stt** — C API bindings available

#### Go
- **portaudio-go** + Google/Azure cloud SDKs
- Whisper via **go-whisper** wrappers

---

**Most practical starting point:** Python with `SpeechRecognition` + `PyAudio` for quick results, or Python + `openai-whisper` for high accuracy offline transcription.

---

## 2026-05-05 — Can Claude Code be prompted from voice inputs via microphone?

### Prompt
> Can Claude Code be prompted from voice inputs via microphone?

### Response

Claude Code has no built-in microphone support, but there are practical ways to achieve it:

#### Works Today (No Code Required)

- **Windows Speech Recognition** / **Windows Dictation** (Win+H) — speak into any text field including the Claude Code terminal or IDE input
- **macOS Dictation** — same idea, system-level, works anywhere you type

#### Custom Wrapper Script

You could write a small Python script that:
1. Captures mic audio (PyAudio / sounddevice)
2. Transcribes it (Whisper or SpeechRecognition)
3. Pipes the text to the Claude Code CLI via `subprocess`

```python
# sketch of the idea
transcript = whisper_transcribe(record_mic())
subprocess.run(["claude", "-p", transcript])
```

This would let you speak a prompt and have Claude Code respond in the terminal.

#### IDE Voice Extensions

If you use VS Code with the Claude Code extension, voice-to-text VS Code extensions (e.g., **Voice Typing**) can dictate into the chat input box directly.

---

**Bottom line:** Native voice input isn't a Claude Code feature, but OS dictation requires zero setup and works right now. A Python wrapper is the cleanest programmable solution if you want hands-free automation.

---

## 2026-05-05 — Voice-activated note taker: wake word → transcribe → sleep word → save

### Prompt
> Summarize, without implementing, a program that listens for a microphone wake word. When that event happens it transcribes the following voice output into a time-date stamped note in a specified file until it receives a sleep word.

### Response

#### Behavior

The program runs continuously in the background with three states:

1. **Listening** — monitors mic audio for a wake word (e.g., "hey notes")
2. **Recording** — transcribes everything spoken into a growing buffer
3. **Saving** — on sleep word (e.g., "done" or "save note"), writes the buffer as a timestamped entry to a target file, then returns to Listening

#### Components

**Wake/Sleep Word Detection**
- Lightweight keyword spotter (e.g., Porcupine, Vosk KWS, or simple Whisper polling) runs at low CPU cost during idle state
- Triggers mode switch without sending audio to a full transcription engine

**Audio Capture**
- Continuous mic stream via PyAudio or sounddevice
- Circular buffer discards audio during Listening state; retains it during Recording state

**Transcription Engine**
- Full transcription kicks in only after wake word — either local (Whisper) or cloud (Google/Azure)
- Accumulates text chunks in memory until sleep word is detected in the transcript

**Note Writing**
- On sleep word: strips the sleep word from the transcript, prepends a `YYYY-MM-DD HH:MM:SS` timestamp and a blank-line separator, appends to the target file
- Target file path is a startup argument or config value

#### State Machine (simplified)

```
IDLE → [wake word detected] → RECORDING → [sleep word detected] → SAVE → IDLE
                                         → [timeout / silence]  → DISCARD → IDLE
```

#### Key Design Decisions to Make

| Decision | Options |
|---|---|
| Wake word engine | Porcupine (accurate, licensed) vs. Vosk KWS (free, offline) |
| Transcription | Whisper local (private, slower) vs. cloud API (fast, sends audio out) |
| Sleep word detection | Match in transcript text vs. separate keyword spotter |
| Silence timeout | Discard or save partial note after N seconds of silence |
| Output format | Plain text, Markdown, JSON |

**Python is the natural fit — all needed libraries exist and compose cleanly.**

---
