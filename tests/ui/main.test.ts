import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("app bootstrap", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    window.sessionStorage.clear();
    window.localStorage.clear();
    // main.ts mounts itself as an import side effect; reset the module
    // registry so each test gets a fresh mount against its own fresh DOM.
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("mounts the desk, ledger, and action row into #app", async () => {
    await import("../../src/main");

    expect(document.querySelector(".wordmark")?.textContent).toContain("Bluff");
    expect(document.getElementById("player-card")).toBeTruthy();
    expect(document.getElementById("opponent-card")).toBeTruthy();
    expect(document.getElementById("bankroll-value")?.textContent).toBe("20");

    const actionButtons = document.querySelectorAll<HTMLButtonElement>(
      "#action-row button[data-action]",
    );
    expect(actionButtons.length).toBe(4);
    // The player always opens, so check/bet start enabled and call/fold start disabled.
    const enabled = Array.from(actionButtons)
      .filter((b) => !b.disabled)
      .map((b) => b.dataset.action);
    expect(enabled.sort()).toEqual(["bet", "check"]);

    const celebration = document.getElementById("celebration");
    expect(celebration?.getAttribute("role")).toBe("dialog");
    expect(celebration?.getAttribute("aria-modal")).toBe("true");
    expect(celebration?.getAttribute("aria-labelledby")).toBe("celebration-title");
  });

  it("advances the hand and shows the reveal panel after checking through to showdown", async () => {
    vi.useFakeTimers();
    await import("../../src/main");

    const checkButton = document.querySelector<HTMLButtonElement>('button[data-action="check"]');
    expect(checkButton).toBeTruthy();
    checkButton?.click();
    await vi.advanceTimersByTimeAsync(600);

    const foldButton = document.querySelector<HTMLButtonElement>('button[data-action="fold"]');
    if (foldButton && !foldButton.disabled) foldButton.click();

    const panel = document.getElementById("margin-panel");
    expect(panel?.classList.contains("open")).toBe(true);
    expect(document.getElementById("margin-decisions")?.children.length).toBeGreaterThan(0);
  });

  it("cancels a pending AI response when a new session starts", async () => {
    vi.useFakeTimers();
    await import("../../src/main");

    document.querySelector<HTMLButtonElement>('button[data-action="check"]')?.click();
    document.getElementById("new-session")?.click();
    await vi.advanceTimersByTimeAsync(600);

    const enabled = Array.from(document.querySelectorAll<HTMLButtonElement>("#action-row button"))
      .filter((button) => !button.disabled)
      .map((button) => button.dataset.action)
      .sort();
    expect(enabled).toEqual(["bet", "check"]);
  });

  it("starts a playable session when persisted bankroll data is corrupt", async () => {
    window.sessionStorage.setItem("bluff-call:bankroll:v1", "{broken json");

    await import("../../src/main");

    expect(document.getElementById("bankroll-value")?.textContent).toBe("20");
    const enabled = Array.from(document.querySelectorAll<HTMLButtonElement>("#action-row button"))
      .filter((button) => !button.disabled)
      .map((button) => button.dataset.action)
      .sort();
    expect(enabled).toEqual(["bet", "check"]);
  });
});
