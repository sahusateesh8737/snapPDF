module.exports = {
  ci: {
    collect: {
      startServerCommand: "pnpm --filter web start",
      url: ["http://localhost:3000/"],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.8 }],
        "categories:accessibility": ["warn", { minScore: 0.9 }],
        "bootup-time": ["error", { maxNumericValue: 1000 }], // Script Evaluation Time
        "interactive": ["warn", { maxNumericValue: 3500 }], // Time to Interactive
        "first-contentful-paint": ["warn", { maxNumericValue: 2000 }],
        "cumulative-layout-shift": ["warn", { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
