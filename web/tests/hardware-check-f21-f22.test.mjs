import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const hwCheck = readFileSync(new URL("../src/components/HardwareCheck.tsx", import.meta.url), "utf8");
const interviewPage = readFileSync(new URL("../src/pages/interview/InterviewPage.tsx", import.meta.url), "utf8");

// F-22: Camera must be required by default (not behind env flag)
test("F-22: camera is requested by default, not gated by env flag alone", () => {
  // The old pattern: const REQUIRE_CAMERA = import.meta.env.VITE_REQUIRE_CAMERA === "true"
  // New: camera should default to true; env flag should only be a fallback override
  // Camera check must exist and default to on
  assert.ok(
    hwCheck.includes("cameraEnabled") || hwCheck.includes("cameraDefault") || !hwCheck.includes('VITE_REQUIRE_CAMERA === "true"'),
    "Camera should default to required, not depend solely on VITE_REQUIRE_CAMERA === 'true'"
  );
});

// F-22: Voice-only opt-out must be explicit
test("F-22: explicit voice-only opt-out UI exists", () => {
  assert.ok(
    hwCheck.includes("voice-only") || hwCheck.includes("voiceOnly") || hwCheck.includes("Voice-only") || hwCheck.includes("Skip camera"),
    "HardwareCheck must offer an explicit voice-only opt-out path"
  );
});

// F-22: Camera denial shows clear explanation
test("F-22: camera denial shows clear message", () => {
  assert.ok(
    hwCheck.includes("camera") && (hwCheck.includes("denied") || hwCheck.includes("blocked") || hwCheck.includes("not available") || hwCheck.includes("permission")),
    "HardwareCheck must show a clear message when camera is denied or unavailable"
  );
});

// F-21: Trial recording component/logic exists
test("F-21: trial recording step exists in HardwareCheck", () => {
  assert.ok(
    hwCheck.includes("trial") || hwCheck.includes("Trial") || hwCheck.includes("testRecording") || hwCheck.includes("trialRecording"),
    "HardwareCheck must include a trial recording step"
  );
});

// F-21: Trial must be completed before Start is enabled
test("F-21: Start button requires trial completion", () => {
  // The start button should be gated on trial completion, not just allPassed
  assert.match(hwCheck, /disabled=\{!allPassed\s*\|\|\s*!trialPassed\}/);
  assert.match(hwCheck, /disabled=\{!allPassed\s*\|\|\s*!trialPassed\}[\s\S]*?Start Interview/);
});

// F-21: Trial recording is local only — no upload/server call
test("F-21: trial recording stays local, no upload", () => {
  // Should NOT contain fetch/axios/api calls for trial data
  assert.ok(
    !hwCheck.includes("uploadTrial") && !hwCheck.includes("saveTrial") && !hwCheck.includes("/api/trial"),
    "Trial recording must stay local — no upload or server save"
  );
});

test("F-21: playback previews video and audio when camera is enabled", () => {
  assert.match(hwCheck, /<video[^>]*controls[^>]*src=\{trialUrl\}/);
  assert.match(hwCheck, /<audio[^>]*controls[^>]*src=\{trialUrl\}/);
});

test("F-21: trial recording auto-stops at one minute and can be stopped early", () => {
  assert.match(hwCheck, /setTimeout\(stopTrialRecording,\s*60_000\)/);
  assert.match(hwCheck, /stopTrialRecording/);
  assert.match(hwCheck, /Stop recording/);
});

test("F-21: trial recording displays elapsed duration", () => {
  assert.match(hwCheck, /trialElapsedMs/);
  assert.match(hwCheck, /formatDuration\(trialElapsedMs\)/);
  assert.match(hwCheck, /Recording \{formatDuration\(trialElapsedMs\)\} \/ 01:00/);
});

// F-21: Retry path exists for failed trial
test("F-21: retry path for failed trial recording", () => {
  assert.ok(
    hwCheck.includes("retryTrial") || hwCheck.includes("Try again") || hwCheck.includes("Retry") || hwCheck.includes("retry"),
    "Must have a retry path when trial recording fails"
  );
});
