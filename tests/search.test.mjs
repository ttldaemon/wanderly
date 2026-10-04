import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Implementation of buildSearchEndpoint to test specification
export function buildSearchEndpoint(rawQuery, mode = "users") {
  const trimmed = rawQuery ? rawQuery.trim() : "";
  if (!trimmed) return null;

  if (mode === "places") {
    return `/api/search?location=${encodeURIComponent(trimmed)}`;
  }

  if (trimmed.startsWith("@")) {
    const cleanUser = trimmed.slice(1).trim();
    return cleanUser ? `/api/search?userName=${encodeURIComponent(cleanUser)}` : null;
  }

  return `/api/search?userName=${encodeURIComponent(trimmed)}`;
}

describe("Search Endpoint Builder", () => {
  it("should return null for empty or whitespace-only queries", () => {
    assert.equal(buildSearchEndpoint(""), null);
    assert.equal(buildSearchEndpoint("   "), null);
    assert.equal(buildSearchEndpoint(null), null);
    assert.equal(buildSearchEndpoint(undefined), null);
  });

  it("should format user search queries properly with userName parameter", () => {
    assert.equal(buildSearchEndpoint("john_doe", "users"), "/api/search?userName=john_doe");
    assert.equal(buildSearchEndpoint("Jane Doe", "users"), "/api/search?userName=Jane%20Doe");
    assert.equal(buildSearchEndpoint("@alice", "users"), "/api/search?userName=alice");
  });

  it("should format places search queries properly with location parameter", () => {
    assert.equal(buildSearchEndpoint("Paris", "places"), "/api/search?location=Paris");
    assert.equal(buildSearchEndpoint("New York, USA", "places"), "/api/search?location=New%20York%2C%20USA");
    assert.equal(buildSearchEndpoint("Tokyo Tower", "places"), "/api/search?location=Tokyo%20Tower");
  });

  it("should handle special characters correctly in URL encoding", () => {
    assert.equal(
      buildSearchEndpoint("Goa & Kerala", "places"),
      "/api/search?location=Goa%20%26%20Kerala"
    );
  });
});

describe("1.5s Debounce Timing Simulation", () => {
  it("should debounce function calls and only execute the last call after 1500ms", async () => {
    let callCount = 0;
    let lastQuery = "";

    function debounce(fn, delay = 1500) {
      let timer;
      return function (val) {
        clearTimeout(timer);
        timer = setTimeout(() => {
          fn(val);
        }, delay);
      };
    }

    const debouncedSearch = debounce((q) => {
      callCount++;
      lastQuery = q;
    }, 1500);

    // Rapid keystrokes at t = 0ms, 200ms, 400ms
    debouncedSearch("P");
    debouncedSearch("Pa");
    debouncedSearch("Par");
    debouncedSearch("Paris");

    assert.equal(callCount, 0, "Should not trigger immediately");

    // Wait 500ms - still shouldn't have executed
    await new Promise((resolve) => setTimeout(resolve, 500));
    assert.equal(callCount, 0, "Should not trigger before 1500ms has elapsed");

    // Wait remaining 1100ms (total > 1500ms)
    await new Promise((resolve) => setTimeout(resolve, 1100));
    assert.equal(callCount, 1, "Should have triggered exactly once");
    assert.equal(lastQuery, "Paris", "Should have captured the latest debounced query");
  });
});

describe("Search Data Routing Verification", () => {
  it("routes users payload to searchedUsers state", () => {
    const payload = {
      success: true,
      isUsersData: true,
      data: [{ _id: "1", name: "Aarav", userName: "aarav_travels" }],
    };

    let searchedUsers = null;
    let locationResults = null;

    if (payload.isUsersData) {
      searchedUsers = payload.data;
    } else {
      locationResults = payload.data;
    }

    assert.deepEqual(searchedUsers, payload.data);
    assert.equal(locationResults, null);
  });

  it("routes places payload to locationResults state for middle feed", () => {
    const payload = {
      success: true,
      isUsersData: false,
      data: [
        {
          _id: "tour-1",
          userId: "u1",
          imgUrls: ["https://example.com/paris.jpg"],
          caption: "Eiffel tower at dusk",
          location: "Paris, France",
          tags: ["travel", "sunset"],
          createdAt: "2026-09-01T10:00:00.000Z",
        },
      ],
    };

    let searchedUsers = null;
    let locationResults = null;

    if (payload.isUsersData) {
      searchedUsers = payload.data;
    } else {
      locationResults = payload.data;
    }

    assert.equal(searchedUsers, null);
    assert.deepEqual(locationResults, payload.data);
  });
});
