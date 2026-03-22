'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Terminal as TerminalIcon, Loader2 } from 'lucide-react';

const LANGUAGES = ['python', 'javascript', 'cpp', 'java', 'csharp'];

const STARTER_CODE: Record<string, string> = {
    python: '# Write your solution here\ndef solution():\n    pass',
    javascript: '// Write your solution here\nfunction solution() {\n    \n}',
    cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}',
    java: 'public class Solution {\n    public static void main(String[] args) {\n    }\n}',
    csharp: 'using System;\nclass Solution {\n    static void Main() {\n    }\n}',
};

interface CodeEditorProps {
    onCodeChange: (code: string) => void;
    onLanguageChange: (lang: string) => void;
}

export default function CodeEditor({ onCodeChange, onLanguageChange }: CodeEditorProps) {
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState(STARTER_CODE['python']);
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [outputStatus, setOutputStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleLanguageChange = (lang: string) => {
        setLanguage(lang);
        setCode(STARTER_CODE[lang]);
        onLanguageChange(lang);
        onCodeChange(STARTER_CODE[lang]);
    };

    const handleCodeChange = (value: string | undefined) => {
        const c = value ?? '';
        setCode(c);
        onCodeChange(c);
    };

    const runCode = async () => {
        setIsRunning(true);
        setOutput('Running code...');
        try {
            const res = await fetch('/api/judge0', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language })
            });
            const data = await res.json();

            if (data.error) {
                throw new Error(data.error);
            }

            const out = data.stdout || data.stderr || data.compile_output || 'No output produced.';
            setOutput(`[${data.status}] Time: ${data.time}s  Memory: ${data.memory}KB\n\n${out}`);
            setOutputStatus(data.stderr || data.compile_output ? 'error' : 'success');
        } catch (e: any) {
            setOutput(`Execution failed: ${e.message}`);
            setOutputStatus('error');
        }
        setIsRunning(false);
    };

    return (
        <div className='flex flex-col gap-0 h-full bg-black/40 rounded-3xl border border-gray-800 overflow-hidden'>
            {/* Toolbar */}
            <div className='flex items-center justify-between px-4 py-3 bg-gray-900/50 border-b border-gray-800'>
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-blue-500/10 rounded-lg">
                        <TerminalIcon size={16} className="text-blue-400" />
                    </div>
                    <select
                        value={language}
                        onChange={e => handleLanguageChange(e.target.value)}
                        className='bg-transparent text-gray-300 text-xs font-black uppercase tracking-widest outline-none cursor-pointer hover:text-white transition-colors'
                    >
                        {LANGUAGES.map(l => <option key={l} value={l} className="bg-gray-900">{l}</option>)}
                    </select>
                </div>

                <button
                    onClick={runCode}
                    disabled={isRunning}
                    className='flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)]'
                >
                    {isRunning ? (
                        <><Loader2 className="animate-spin" size={14} /> RUNNING</>
                    ) : (
                        <><Play size={14} fill="currentColor" /> RUN_CODE</>
                    )}
                </button>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 min-h-[300px] md:min-h-[400px]">

                <Editor
                    height='100%'
                    language={language === 'cpp' ? 'cpp' : language}
                    value={code}
                    onChange={handleCodeChange}
                    theme='vs-dark'
                    loading={<div className="flex items-center justify-center h-full text-gray-500 font-black text-xs uppercase tracking-widest">Loading Editor...</div>}
                    options={{
                        fontSize: 14,
                        fontFamily: 'JetBrains Mono, Menlo, monospace',
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: 'on',
                        automaticLayout: true,
                        padding: { top: 20, bottom: 20 },
                        backgroundColor: 'transparent',
                        hideCursorInOverviewRuler: true,
                        scrollbar: {
                            vertical: 'hidden',
                            horizontal: 'hidden'
                        },
                        overviewRulerBorder: false,
                        renderLineHighlight: 'none',
                        contextmenu: false,
                    }}
                />
            </div>

            {/* Mini Terminal */}
            <div className={`p-4 font-mono text-[11px] h-32 overflow-y-auto border-t transition-colors ${outputStatus === 'error' ? 'bg-red-500/5 border-red-500/20 text-red-400' :
                outputStatus === 'success' ? 'bg-green-500/5 border-green-500/20 text-green-400' :
                    'bg-black/40 border-gray-800 text-gray-500'
                }`}>
                <div className="flex items-center gap-2 mb-2 opacity-50">
                    <TerminalIcon size={12} />
                    <span className="uppercase tracking-widest font-black text-[9px]">Execution Output</span>
                </div>
                <pre className="whitespace-pre-wrap leading-relaxed">
                    {output || '// Click Run to execute your code on Judge0 engine'}
                </pre>
            </div>
        </div>
    );
}
