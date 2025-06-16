require('@testing-library/jest-dom');

// Mock window.matchMedia for jsdom
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = function (query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: function () {},
      removeListener: function () {},
      addEventListener: function () {},
      removeEventListener: function () {},
      dispatchEvent: function () { return false; }
    };
  };
}

// Simple fetch mock for tests
if (typeof global.fetch === 'undefined') {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          totalOnOrder: 0,
          unscheduledCount: 0,
          remainingBuildUnscheduled: 0,
          remainingBuildScheduled: 0,
          remainingBuildInProcess: 0,
          remainingBuildQueue: 0,
          utilizationPct: 0,
        }),
    })
  );
}