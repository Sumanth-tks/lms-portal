'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { Play, RotateCcw } from 'lucide-react';

const TEMPLATES: Record<string, string> = {
  python: '# Python Playground\n\ndef hello():\n    return "Hello, World!"\n\nprint(hello())',
  sql: '-- SQL Playground\n\nSELECT * FROM users\nWHERE role = \'INTERN\'\nORDER BY created_at DESC\nLIMIT 10;',
};

export default function PlaygroundPage() {
  const [language, setLanguage] = useState<'python' | 'sql'>('python');
  const [code, setCode] = useState(TEMPLATES.python);
  const [output, setOutput] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  async function handleRun() {
    setRunning(true);
    setOutput(null);
    try {
      const res = await api.post('/github/execute', { language, code });
      const data = res.data.data;
      setOutput(
        `Status: ${data.status}\nTests: ${data.passedTests}/${data.totalTests} passed\n\n` +
        (data.results?.length
          ? data.results.map((r: { input: string; actualOutput: string; passed: boolean }) =>
              `Input: ${r.input}\nOutput: ${r.actualOutput}\n${r.passed ? 'PASS' : 'FAIL'}`
            ).join('\n---\n')
          : '(No test cases — code executed successfully)')
      );
    } catch {
      setOutput('Execution error');
    } finally {
      setRunning(false);
    }
  }

  function handleReset() {
    setCode(TEMPLATES[language]);
    setOutput(null);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Code Playground</h1>
          <p className="mt-1 text-sm text-gray-500">Write and run Python or SQL code</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => {
              const lang = e.target.value as 'python' | 'sql';
              setLanguage(lang);
              setCode(TEMPLATES[lang]);
              setOutput(null);
            }}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
          >
            <option value="python">Python</option>
            <option value="sql">SQL</option>
          </select>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
          <button
            onClick={handleRun}
            disabled={running || !code.trim()}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            <Play className="h-4 w-4" /> {running ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Editor */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <span className="text-sm font-medium text-gray-600">
              {language === 'python' ? 'main.py' : 'query.sql'}
            </span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
              {language.toUpperCase()}
            </span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="h-[500px] w-full resize-none border-none bg-gray-950 px-4 py-3 font-mono text-sm text-green-400 outline-none"
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center border-b border-gray-200 px-4 py-3">
            <span className="text-sm font-medium text-gray-600">Output</span>
          </div>
          <div className="h-[500px] overflow-auto bg-gray-950 px-4 py-3">
            {output ? (
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-300">{output}</pre>
            ) : (
              <p className="font-mono text-sm text-gray-600">Click Run to execute your code...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
