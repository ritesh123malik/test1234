'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Loader2, Sparkles, ChevronLeft, Volume2, MicOff, AlertCircle, CheckCircle2, Code } from 'lucide-react';
import EvaluationDashboard from '@/components/interviewer/EvaluationDashboard';
import SpeechReport from '@/components/interviewer/SpeechReport';
import dynamic from 'next/dynamic';

const CodeEditor = dynamic(() => import('@/components/interviewer/CodeEditor'), {
    ssr: false,
    loading: () => <div className="h-[500px] bg-gray-900/50 rounded-3xl border border-gray-800 animate-pulse flex items-center justify-center font-black text-xs text-gray-700 uppercase tracking-widest">Waking up Monaco...</div>
});

export default function InterviewRoom() {
    const { sessionId } = useParams();
    const router = useRouter();

    // States
    const [question, setQuestion] = useState('Initializing interview...');
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [evaluation, setEvaluation] = useState<any>(null);
    const [allEvals, setAllEvals] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEnded, setIsEnded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [audioDuration, setAudioDuration] = useState(0);
    const [speechMetrics, setSpeechMetrics] = useState<any>(null);

    // Code Editor States
    const [codeSnippet, setCodeSnippet] = useState('');
    const [codeLanguage, setCodeLanguage] = useState('python');
    const [showEditor, setShowEditor] = useState(false);
    const [interviewType, setInterviewType] = useState<string>('');

    // Refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number>();
    const audioContextRef = useRef<AudioContext>();
    const analyserRef = useRef<AnalyserNode>();
    const recordingStartRef = useRef<number>(0);

    const startStreaming = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Setup Visualizer
            const audioCtx = new AudioContext();
            const analyser = audioCtx.createAnalyser();
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 256;

            audioContextRef.current = audioCtx;
            analyserRef.current = analyser;

            // Setup MediaRecorder
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = handleStopRecording;

            recordingStartRef.current = Date.now();
            mediaRecorder.start();
            setIsRecording(true);
            setError(null);
            drawVisualizer();
        } catch (err) {
            console.error('Mic access denied:', err);
            setError('Microphone access denied. Please check permissions.');
        }
    };

    const stopStreaming = () => {
        const duration = (Date.now() - recordingStartRef.current) / 1000;
        setAudioDuration(duration);
        mediaRecorderRef.current?.stop();
        setIsRecording(false);

        // Stop tracks
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
    };

    const handleStopRecording = async () => {
        setIsLoading(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        try {
            // 1. Transcribe
            const formData = new FormData();
            formData.append('audio', audioBlob);

            const transRes = await fetch('/api/interviewer', {
                method: 'PUT',
                body: formData,
            });
            const { transcript, error: transError } = await transRes.json();
            if (transError) throw new Error(transError);
            setTranscript(transcript);

            // 2. Evaluate
            const evalRes = await fetch('/api/interviewer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'respond',
                    sessionId,
                    questionText: question,
                    answerText: transcript,
                    codeSnippet: showEditor ? codeSnippet : undefined,
                    codeLanguage: showEditor ? codeLanguage : undefined,
                    interviewType: interviewType || 'DSA',
                    audioDurationSeconds: audioDuration
                }),
            });
            const { evaluation, error: evalError } = await evalRes.json();
            if (evalError) throw new Error(evalError);

            setEvaluation(evaluation);
            setSpeechMetrics(evaluation.speechMetrics || null);
            setAllEvals(prev => [...prev, evaluation]);
            setQuestion(evaluation.follow_up_question);
            setIsLoading(false);
        } catch (err: any) {
            console.error('Pipeline failed:', err);
            setError(err.message || 'Something went wrong. Please try again.');
            setIsLoading(false);
        }
    };

    const endInterview = async () => {
        setIsLoading(true);
        try {
            await fetch('/api/interviewer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'end', sessionId }),
            });
            setIsEnded(true);
        } catch (err) {
            console.error('Failed to end interview:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const drawVisualizer = () => {
        if (!canvasRef.current || !analyserRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const analyser = analyserRef.current;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animationFrameRef.current = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const sliceWidth = (canvas.width * 1.0) / bufferLength;
            let x = 0;

            ctx.beginPath();
            ctx.moveTo(0, canvas.height / 2);

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = (v * canvas.height) / 2;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);

                x += sliceWidth;
            }

            ctx.strokeStyle = '#3B82F6';
            ctx.lineWidth = 2;
            ctx.stroke();
        };

        draw();
    };

    // Initial Fetch: Start session (if sessionID exists but no question)
    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            try {
                // Fetch session info from Supabase to get interviewType
                const res = await fetch(`/api/interviewer`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'start_info', sessionId }) // We'll need to handle this or just fetch from generic session table
                });
                // Since 'start_info' isn't implemented yet, let's assume we can get it from the URL or state
                // For now, let's default to DSA if not found
                const type = 'DSA'; // Mocking discovery
                setInterviewType(type);
                setShowEditor(type === 'DSA' || type === 'System Design');

                setQuestion("Great! I'm your interviewer. Let's begin. Can you explain your understanding of the problem space you're most comfortable with?");
            } catch (err) {
                console.error("Init failed", err);
            }
            setIsLoading(false);
        };
        init();
    }, [sessionId]);

    return (
        <div className='min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 font-sans'>
            {/* Navbar */}
            <nav className="border-b border-gray-900 bg-black/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
                <button
                    onClick={() => router.push('/interviewer')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                >
                    <ChevronLeft size={16} />
                    Exit Session
                </button>
                <div className="flex items-center gap-4">
                    {!isEnded && (
                        <button
                            onClick={endInterview}
                            className="text-[10px] uppercase tracking-widest font-black text-red-500 hover:text-red-400 px-3 py-1 border border-red-500/30 rounded-lg transition-colors"
                        >
                            End Interview
                        </button>
                    )}
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] uppercase tracking-widest font-black text-gray-500">Live Session</span>
                    </div>
                    <div className="h-4 w-[1px] bg-gray-800" />
                    <span className="text-xs font-mono text-gray-400 tracking-tighter">ID: {sessionId?.slice(0, 8)}</span>
                </div>
            </nav>

            <div className='max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 p-6 lg:p-12'>
                {isEnded ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 bg-gray-900/40 rounded-3xl p-12 border border-gray-800 text-center space-y-8"
                    >
                        <div className="space-y-4">
                            <div className="mx-auto w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                                <CheckCircle2 size={40} />
                            </div>
                            <h2 className="text-4xl font-black">Interview Completed</h2>
                            <p className="text-gray-400 max-w-md mx-auto">Great job! Your interview session has been analyzed. You can find your detailed score breakdown below.</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {['Correctness', 'Depth', 'Clarity', 'Structure'].map(label => {
                                const key = label.toLowerCase();
                                const avg = Math.round(allEvals.reduce((acc, e) => acc + e.score_breakdown[key], 0) / (allEvals.length || 1));
                                return (
                                    <div key={label} className="bg-black/40 p-4 rounded-2xl border border-gray-800">
                                        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">{label}</p>
                                        <p className="text-2xl font-black text-blue-400">{avg * 10}%</p>
                                    </div>
                                )
                            })}
                        </div>

                        <button
                            onClick={() => router.push('/interviewer')}
                            className="px-8 py-4 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Return to Hub
                        </button>
                    </motion.div>
                ) : (
                    /* Left: Interview Area */
                    <div className='flex-1 space-y-8'>

                        {/* Question Display */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className='bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 lg:p-12 border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group'
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Sparkles size={100} />
                            </div>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-500/10 rounded-xl">
                                    <Sparkles className="text-blue-400" size={24} />
                                </div>
                                <span className='text-blue-400 text-xs font-black uppercase tracking-[0.2em]'>Current Question</span>
                            </div>

                            <AnimatePresence mode="wait">
                                {isLoading ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-4"
                                    >
                                        <div className="h-8 bg-gray-800 animate-pulse rounded-lg w-3/4" />
                                        <div className="h-8 bg-gray-800 animate-pulse rounded-lg w-1/2" />
                                    </motion.div>
                                ) : (
                                    <motion.p
                                        key="question"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className='text-xl md:text-3xl font-bold leading-tight tracking-tight'
                                    >
                                        {question}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Controls Area */}
                        <div className='space-y-4'>
                            <div className="relative">
                                <canvas
                                    ref={canvasRef}
                                    className="w-full h-24 bg-gray-950/50 rounded-2xl border border-gray-900"
                                    width={800}
                                    height={100}
                                />
                                {!isRecording && !isLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-[10px] uppercase tracking-widest font-black pointer-events-none">
                                        WAVEFORM READY • READY TO CAPTURE
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={isRecording ? stopStreaming : startStreaming}
                                    disabled={isLoading}
                                    className={`flex-1 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 ${isRecording
                                        ? 'bg-red-500/10 border border-red-500/50 text-red-500 hover:bg-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_30px_rgba(37,99,235,0.3)]'
                                        }`}
                                >
                                    {isLoading ? (
                                        <><Loader2 className="animate-spin" size={20} /> ANALYZING...</>
                                    ) : isRecording ? (
                                        <><Square size={20} fill="currentColor" /> STOP_STREAM</>
                                    ) : (
                                        <><Mic size={20} /> START_ANSWER</>
                                    )}
                                </button>

                                <button
                                    className="p-6 bg-gray-900 border border-gray-800 rounded-2xl text-gray-500 hover:text-white transition-colors"
                                >
                                    <Volume2 size={24} />
                                </button>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm font-medium"
                                >
                                    <AlertCircle size={18} />
                                    {error}
                                </motion.div>
                            )}
                        </div>

                        {/* Editor Toggle (for Behavioral/HR) and Editor View */}
                        {(interviewType === 'Behavioral' || interviewType === 'HR') && (
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setShowEditor(!showEditor)}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    <Code size={14} />
                                    {showEditor ? 'HIDE_CODE_EDITOR' : 'SHOW_CODE_EDITOR'}
                                </button>
                            </div>
                        )}

                        {showEditor && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-8 border-t border-gray-800 pt-8"
                            >
                                <CodeEditor
                                    onCodeChange={setCodeSnippet}
                                    onLanguageChange={setCodeLanguage}
                                />
                            </motion.div>
                        )}

                        {/* Transcript Area */}
                        {transcript && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className='bg-gray-900/40 rounded-3xl p-6 border border-gray-800'
                            >
                                <p className='text-gray-500 text-[10px] uppercase font-black tracking-widest mb-3 flex items-center gap-2'>
                                    <MicOff size={12} />
                                    Input Captured_
                                </p>
                                <p className='text-gray-300 text-sm leading-relaxed'>
                                    "{transcript}"
                                </p>
                            </motion.div>
                        )}
                    </div>
                )}
                {/* Right: Live Feedback */}
                <div className="lg:w-[400px] space-y-6">
                    <EvaluationDashboard evaluation={evaluation} allEvals={allEvals} />
                    {speechMetrics && <SpeechReport metrics={speechMetrics} />}
                </div>
            </div>
        </div>
    );
}
