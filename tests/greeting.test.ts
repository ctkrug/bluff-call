import { describe, expect, it } from "vitest";
import { greeting } from "../src/lib/greeting";

describe("greeting", () => {
  it("returns a non-empty string", () => {
    expect(greeting().length).toBeGreaterThan(0);
  });
});
