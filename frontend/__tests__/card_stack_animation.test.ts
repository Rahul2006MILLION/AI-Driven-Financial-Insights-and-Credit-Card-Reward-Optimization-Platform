import { test, describe } from "node:test";
import assert from "node:assert";

/**
 * Deterministic stack metric calculation mirroring frontend/components/CardFanCollection.tsx
 */
function computeStackMetric(
  cardIndex: number,
  currentIndex: number,
  totalCards: number,
  isMobile: boolean = false
) {
  if (totalCards <= 1) {
    return {
      x: 0,
      y: -10,
      rotate: 0,
      scale: 1.02,
      zIndex: 50,
      opacity: 1,
      prominent: true,
    };
  }

  let d: number;
  if (totalCards === 2) {
    d = cardIndex === currentIndex ? 0 : 1;
  } else {
    let rawDiff = cardIndex - currentIndex;
    if (rawDiff > totalCards / 2) rawDiff -= totalCards;
    else if (rawDiff < -totalCards / 2) rawDiff += totalCards;
    d = rawDiff;
  }

  if (d === 0) {
    return {
      x: 0,
      y: -10,
      rotate: 0,
      scale: 1.02,
      zIndex: 50,
      opacity: 1,
      prominent: true,
    };
  }

  if (d === -1) {
    return {
      x: isMobile ? -48 : -72,
      y: 12,
      rotate: -12,
      scale: 0.94,
      zIndex: 40,
      opacity: 0.88,
      prominent: true,
    };
  }

  if (d === 1) {
    return {
      x: isMobile ? 48 : 72,
      y: 12,
      rotate: 12,
      scale: 0.94,
      zIndex: 40,
      opacity: 0.88,
      prominent: true,
    };
  }

  if (d === -2) {
    return {
      x: isMobile ? -84 : -130,
      y: 26,
      rotate: -18,
      scale: 0.88,
      zIndex: 30,
      opacity: 0.65,
      prominent: true,
    };
  }

  if (d === 2) {
    return {
      x: isMobile ? 84 : 130,
      y: 26,
      rotate: 18,
      scale: 0.88,
      zIndex: 30,
      opacity: 0.65,
      prominent: true,
    };
  }

  const sign = d < 0 ? -1 : 1;
  return {
    x: sign * (isMobile ? 105 : 155),
    y: 38,
    rotate: sign * 20,
    scale: 0.82,
    zIndex: Math.max(10, 20 - Math.abs(d)),
    opacity: 0,
    prominent: false,
  };
}

describe("Interactive Credit Card Stack Animation & Geometry Suite", () => {
  const CARD_WIDTH_DESKTOP = 310;
  const CONTAINER_WIDTH_DESKTOP = 560;
  const HALF_CONTAINER_DESKTOP = CONTAINER_WIDTH_DESKTOP / 2; // 280px

  const CARD_WIDTH_MOBILE = 240;
  const CONTAINER_WIDTH_MOBILE = 340;
  const HALF_CONTAINER_MOBILE = CONTAINER_WIDTH_MOBILE / 2; // 170px

  test("1 Card Portfolio: Centered, elevated, full opacity, zero rotation", () => {
    const metric = computeStackMetric(0, 0, 1, false);
    assert.strictEqual(metric.x, 0);
    assert.strictEqual(metric.rotate, 0);
    assert.strictEqual(metric.zIndex, 50);
    assert.strictEqual(metric.opacity, 1);
    assert.strictEqual(metric.scale, 1.02);
  });

  test("2 Cards Portfolio: Active centered, partner card neatly offset at +12°", () => {
    // When card 0 is active
    const active = computeStackMetric(0, 0, 2, false);
    const partner = computeStackMetric(1, 0, 2, false);

    assert.strictEqual(active.x, 0);
    assert.strictEqual(active.rotate, 0);
    assert.strictEqual(active.zIndex, 50);

    assert.strictEqual(partner.x, 72);
    assert.strictEqual(partner.rotate, 12);
    assert.strictEqual(partner.zIndex, 40);
    assert.strictEqual(partner.opacity, 0.88);

    // When card 1 is selected
    const active1 = computeStackMetric(1, 1, 2, false);
    const partner0 = computeStackMetric(0, 1, 2, false);
    assert.strictEqual(active1.x, 0);
    assert.strictEqual(active1.rotate, 0);
    assert.strictEqual(partner0.x, 72);
  });

  test("3 Cards Portfolio: Balanced diagonal arrangement (-12°, 0°, +12°)", () => {
    const left = computeStackMetric(0, 1, 3, false);
    const center = computeStackMetric(1, 1, 3, false);
    const right = computeStackMetric(2, 1, 3, false);

    assert.strictEqual(center.x, 0);
    assert.strictEqual(center.rotate, 0);
    assert.strictEqual(center.zIndex, 50);

    assert.strictEqual(left.x, -72);
    assert.strictEqual(left.rotate, -12);
    assert.strictEqual(left.zIndex, 40);

    assert.strictEqual(right.x, 72);
    assert.strictEqual(right.rotate, 12);
    assert.strictEqual(right.zIndex, 40);
  });

  test("5 Cards Portfolio: Exactly 5 prominent cards with progressive rotation and depth", () => {
    const centerIdx = 2;
    for (let i = 0; i < 5; i++) {
      const metric = computeStackMetric(i, centerIdx, 5, false);
      assert.strictEqual(metric.prominent, true);
      assert.ok(metric.opacity > 0.5);

      if (i === centerIdx) {
        assert.strictEqual(metric.zIndex, 50);
        assert.strictEqual(metric.rotate, 0);
      } else if (i === centerIdx - 1 || i === centerIdx + 1) {
        assert.strictEqual(metric.zIndex, 40);
        assert.strictEqual(Math.abs(metric.rotate), 12);
      } else {
        assert.strictEqual(metric.zIndex, 30);
        assert.strictEqual(Math.abs(metric.rotate), 18);
      }
    }
  });

  test("10 Cards Portfolio: Limits prominent cards to 5, cleanly stows remaining in wings", () => {
    const selected = 4;
    let prominentCount = 0;
    let stowedCount = 0;

    for (let i = 0; i < 10; i++) {
      const metric = computeStackMetric(i, selected, 10, false);
      if (metric.prominent) {
        prominentCount++;
      } else {
        stowedCount++;
        assert.strictEqual(metric.opacity, 0);
        assert.ok(metric.zIndex <= 20);
      }
    }

    assert.strictEqual(prominentCount, 5, "Must display exactly 5 prominent cards in stack");
    assert.strictEqual(stowedCount, 5, "Remaining 5 cards stowed in background wings");
  });

  test("Desktop Container Boundaries: Bounding box never exceeds container width", () => {
    const testCounts = [1, 2, 3, 5, 10];
    for (const count of testCounts) {
      for (let selected = 0; selected < count; selected++) {
        for (let i = 0; i < count; i++) {
          const metric = computeStackMetric(i, selected, count, false);
          // Calculate max horizontal reach from center
          const rad = (Math.abs(metric.rotate) * Math.PI) / 180;
          const halfWidthEffective = (CARD_WIDTH_DESKTOP / 2) * Math.cos(rad) * metric.scale;
          const maxReach = Math.abs(metric.x) + halfWidthEffective;

          assert.ok(
            maxReach <= HALF_CONTAINER_DESKTOP + 15,
            `Card ${i} in ${count}-card portfolio reached ${maxReach.toFixed(1)}px, exceeding half-container ${HALF_CONTAINER_DESKTOP}px`
          );
        }
      }
    }
  });

  test("Mobile Container Boundaries: No horizontal page overflow", () => {
    const testCounts = [1, 2, 3, 5, 10];
    for (const count of testCounts) {
      for (let selected = 0; selected < count; selected++) {
        for (let i = 0; i < count; i++) {
          const metric = computeStackMetric(i, selected, count, true);
          const rad = (Math.abs(metric.rotate) * Math.PI) / 180;
          const halfWidthEffective = (CARD_WIDTH_MOBILE / 2) * Math.cos(rad) * metric.scale;
          const maxReach = Math.abs(metric.x) + halfWidthEffective;

          // Asserts max reach fits within mobile container boundaries with clipping
          assert.ok(
            maxReach <= HALF_CONTAINER_MOBILE + 35,
            `Mobile card ${i} reached ${maxReach.toFixed(1)}px, exceeding mobile container bounds`
          );
        }
      }
    }
  });
});

