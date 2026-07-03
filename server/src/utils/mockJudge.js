// TODO: Replace with real Judge0 API integration
// Mock judge service returns dummy results for code execution

async function executeCode(code, language, testCases) {
  const results = (testCases || []).map((tc) => ({
    input: tc.input,
    expectedOutput: tc.expectedOutput,
    actualOutput: tc.expectedOutput,
    passed: true,
    executionTime: Math.random() * 500 + 100,
  }));

  return {
    status: 'completed',
    results,
    allPassed: true,
    totalTests: results.length,
    passedTests: results.length,
  };
}

module.exports = { executeCode };
