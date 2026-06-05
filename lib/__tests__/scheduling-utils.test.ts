import test from "node:test";
import assert from "node:assert/strict";
import { buildSlots, hasRequiredBookingFields } from "@/lib/scheduling-utils";

test("buildSlots slices into 30 minute slots and respects capacity", () => {
  const slots = buildSlots(
    [{ startTime: "09:00", endTime: "10:00", capacity: 1 }],
    [{ startTime: "09:00", endTime: "09:30" }],
  );

  assert.equal(slots.length, 2);
  assert.equal(slots[0]?.available, false);
  assert.equal(slots[1]?.available, true);
});

test("hasRequiredBookingFields requires category and DoD fields", () => {
  assert.equal(
    hasRequiredBookingFields({ category: "Code Review", currentProgress: "X", expectedOutcome: "Y" }),
    true,
  );
  assert.equal(hasRequiredBookingFields({ category: "Code Review", currentProgress: "X" }), false);
});
