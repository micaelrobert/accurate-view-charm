import { describe, expect, it } from "vitest";
import { missingRsvpMessage, rsvpSchema } from "@/lib/rsvp-schema";

const valid = {
  id: "8f14e45f-ceea-4e7a-9f6b-1c2d3e4f5a6b",
  name: "Maria Silva",
  signature: "data:image/png;base64,iVBORw0KGgo=",
};

describe("confirmação de presença", () => {
  it("não permite confirmar sem nome", () => {
    expect(missingRsvpMessage("   ", true)).not.toBeNull();
    expect(rsvpSchema.safeParse({ ...valid, name: " " }).success).toBe(false);
  });

  it("não permite confirmar sem assinatura", () => {
    expect(missingRsvpMessage("Maria Silva", false)).not.toBeNull();
    expect(rsvpSchema.safeParse({ ...valid, signature: "" }).success).toBe(false);
  });

  it("aceita nome e assinatura preenchidos", () => {
    expect(missingRsvpMessage("Maria Silva", true)).toBeNull();
    expect(rsvpSchema.safeParse(valid).success).toBe(true);
  });
});
