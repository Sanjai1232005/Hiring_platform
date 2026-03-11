import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import { Play, Send, ChevronLeft, ChevronRight, Clock, CheckCircle2, XCircle } from 'lucide-react';
import API from '../../apiConfig';
import Button from '../../components/ui/Button';

const JUDGE0_URL = 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_KEY = '1b7e563300msh3a6a8fa89c5812bp17fcd1jsn302890a8dc8a';
const JUDGE0_HOST = 'judge0-ce.p.rapidapi.com';

const languages = [
  { name: 'JavaScript', id: 63, editorLanguage: 'javascript', starter: '// JS\n' },
  { name: 'Python 3', id: 71, editorLanguage: 'python', starter: '# Python\n' },
];

const CodeEditor = () => {
  const { jobId, userId } = useParams();
  const { state } = useLocation();
  const endTime = state?.endTime;

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [language, setLanguage] = useState(languages[0]);
  const [results, setResults] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!endTime) return;
    const timer = setInterval(() => {
      const diff = Math.floor((new Date(endTime) - new Date()) / 1000);
      if (diff <= 0) { clearInterval(timer); handleSubmit(true); }
      setTimeLeft(diff);
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  useEffect(() => {
    const fetchQuestions = async () => {
      const res = await axios.get(API + '/questions/' + jobId);
      const formatted = res.data.map((q) => ({
        ...q,
        testCases: q.testCases || q.testcases || [],
      }));
      setQuestions(formatted);
      setLoading(false);
    };
    fetchQuestions();
  }, [jobId]);

  const currentQ = questions[currentIndex];

  const runCode = async () => {
    setResults([]);
    setRunning(true);
    const code = answers[currentQ._id] || language.starter;
    const output = [];
    for (const tc of currentQ.testCases) {
      const res = await axios.post(
        JUDGE0_URL + '/submissions?wait=true',
        { source_code: code, language_id: language.id, stdin: tc.input },
        { headers: { 'x-rapidapi-key': JUDGE0_KEY, 'x-rapidapi-host': JUDGE0_HOST } }
      );
      const actual = res.data.stdout?.trim() || res.data.stderr || res.data.compile_output || '';
      output.push({ input: tc.input, expected: tc.output, actual, passed: actual === tc.output });
    }
    setResults(output);
    setRunning(false);
  };

  const handleSubmit = async (auto = false) => {
    const payload = {
      userId, jobId, questionId: currentQ._id,
      code: answers[currentQ._id] || language.starter,
      languageId: language.id,
    };
    await axios.post(API + '/questions/submit', payload);
    await axios.post(API + '/students/', { userId, jobId });
    if (!auto) alert('Test submitted!');
  };

  const formatTime = (s) => {
    if (s == null) return '--:--';
    const m = Math.floor(s / 60);
    return m + ':' + String(s % 60).padStart(2, '0');
  };

  if (loading) return (
    <div className="h-screen bg-surface flex items-center justify-center text-text-muted">Loading...</div>
  );
  if (!currentQ) return (
    <div className="h-screen bg-surface flex items-center justify-center text-text-muted">No questions</div>
  );

  return (
    <div className="flex h-screen bg-surface text-text-primary">
      {/* LEFT: Question */}
      <div className="w-1/2 border-r border-border flex flex-col">
        {/* Question nav */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-100">
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="p-1 rounded hover:bg-surface-200 disabled:opacity-30 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium">
              Q{currentIndex + 1} <span className="text-text-muted">/ {questions.length}</span>
            </span>
            <button onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
              disabled={currentIndex === questions.length - 1}
              className="p-1 rounded hover:bg-surface-200 disabled:opacity-30 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className={'flex items-center gap-1.5 text-sm font-mono font-bold ' + (timeLeft <= 60 ? 'text-red-400' : timeLeft <= 300 ? 'text-yellow-400' : 'text-text-secondary')}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Question body */}
        <div className="flex-1 overflow-y-auto p-6">
          <h2 className="text-xl font-bold mb-4">{currentQ.title}</h2>
          <p className="text-text-secondary leading-relaxed mb-6">{currentQ.description}</p>

          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Test Cases</h3>
          <div className="space-y-2">
            {currentQ.testCases.map((tc, i) => (
              <div key={i} className="bg-surface-200 rounded-lg p-3 text-sm font-mono">
                <div className="flex gap-4">
                  <div>
                    <span className="text-text-muted text-xs">Input</span>
                    <pre className="text-text-primary mt-0.5">{tc.input}</pre>
                  </div>
                  <div>
                    <span className="text-text-muted text-xs">Output</span>
                    <pre className="text-text-primary mt-0.5">{tc.output}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Editor + Output */}
      <div className="w-1/2 flex flex-col">
        {/* Editor toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface-100">
          <select
            value={language.name}
            onChange={(e) => setLanguage(languages.find(l => l.name === e.target.value))}
            className="bg-surface-200 border border-border rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-primary/50"
          >
            {languages.map(l => <option key={l.id}>{l.name}</option>)}
          </select>

          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={runCode} loading={running} icon={Play}>
              Run
            </Button>
            <Button variant="accent" size="sm" onClick={() => handleSubmit(false)} icon={Send}>
              Submit
            </Button>
          </div>
        </div>

        {/* Monaco */}
        <div className="flex-1">
          <Editor
            theme="vs-dark"
            language={language.editorLanguage}
            value={answers[currentQ._id] || language.starter}
            onChange={(v) => setAnswers({ ...answers, [currentQ._id]: v })}
            options={{ fontSize: 14, minimap: { enabled: false }, padding: { top: 12 } }}
          />
        </div>

        {/* Output */}
        <div className="h-[28%] border-t border-border bg-[#0d0d0d] overflow-y-auto p-4">
          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Output</h4>
          {results.length === 0 ? (
            <p className="text-text-muted text-sm">Run code to see results</p>
          ) : (
            <div className="space-y-2">
              {results.map((r, i) => (
                <div key={i} className={'flex items-start gap-2 text-sm ' + (r.passed ? 'text-green-400' : 'text-red-400')}>
                  {r.passed ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <XCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                  <div>
                    <span className="font-medium">Test {i + 1}: {r.passed ? 'Passed' : 'Failed'}</span>
                    {!r.passed && (
                      <div className="font-mono text-xs mt-1 text-text-muted">
                        Expected: {r.expected} | Got: {r.actual}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
