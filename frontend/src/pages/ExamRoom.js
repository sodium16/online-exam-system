import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function ExamRoom() {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const [exam, setExam]           = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers]     = useState({});
  const [current, setCurrent]     = useState(0);
  const [timeLeft, setTimeLeft]   = useState(0);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');
  const [started, setStarted]     = useState(false);
  const startTimeRef              = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [eRes, qRes] = await Promise.all([
          axios.get(`/api/exams/${id}`),
          axios.get(`/api/exams/${id}/questions`),
        ]);
        if (eRes.data.already_attempted) {
          navigate(`/result/${id}`, { replace: true });
          return;
        }
        setExam(eRes.data);
        setQuestions(qRes.data);
        setTimeLeft(eRes.data.duration_min * 60);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load exam.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  const submitExam = useCallback(async (auto = false) => {
    if (submitting) return;
    setSubmitting(true);
    const elapsed = startTimeRef.current
      ? Math.floor((Date.now() - startTimeRef.current) / 60000)
      : 0;
    const payload = questions.map(q => ({
      question_id:   q.question_id,
      chosen_option: answers[q.question_id] || null,
    }));
    try {
      await axios.post(`/api/exams/${id}/submit`, {
        answers: payload,
        time_taken_min: elapsed,
      });
      navigate(`/result/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed.');
      setSubmitting(false);
    }
  }, [submitting, questions, answers, id, navigate]);

  // Countdown timer
  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    if (timeLeft === 0) { submitExam(true); return; }
    const t = setInterval(() => setTimeLeft(p => {
      if (p <= 1) { clearInterval(t); submitExam(true); return 0; }
      return p - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [started, timeLeft, submitExam]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSelect = (qid, opt) => {
    setAnswers(prev => ({ ...prev, [qid]: opt }));
  };

  if (loading)  return <div className="loading">Loading exam...</div>;
  if (error)    return <div className="card" style={{ color: 'var(--red)' }}>{error}</div>;

  // Pre-exam screen
  if (!started) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="card text-center" style={{ padding: 48 }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>📝</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>{exam?.title}</h1>
          <p style={{ color: 'var(--muted)', marginBottom: 32 }}>{exam?.subject}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 32 }}>
            <div className="stat-card">
              <div className="label">Questions</div>
              <div className="value" style={{ fontSize: '1.5rem' }}>{questions.length}</div>
            </div>
            <div className="stat-card">
              <div className="label">Duration</div>
              <div className="value" style={{ fontSize: '1.5rem' }}>{exam?.duration_min}m</div>
            </div>
            <div className="stat-card">
              <div className="label">Max Marks</div>
              <div className="value" style={{ fontSize: '1.5rem' }}>{exam?.total_marks}</div>
            </div>
          </div>

          <div className="card" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', marginBottom: 24, textAlign: 'left' }}>
            <p style={{ color: 'var(--yellow)', fontSize: '0.875rem', fontWeight: 600, marginBottom: 8 }}>⚠️ Instructions</p>
            <ul style={{ color: 'var(--muted)', fontSize: '0.8rem', lineHeight: 2, paddingLeft: 16 }}>
              <li>This exam can only be attempted once.</li>
              <li>Timer starts when you click "Begin Exam".</li>
              <li>Exam auto-submits when time runs out.</li>
              <li>Do not refresh or close the tab.</li>
            </ul>
          </div>

          <button className="btn btn-primary btn-lg" onClick={() => {
            setStarted(true);
            startTimeRef.current = Date.now();
          }}>
            Begin Exam →
          </button>
        </div>
      </div>
    );
  }

  const q          = questions[current];
  const answered   = Object.keys(answers).length;
  const progress   = (answered / questions.length) * 100;
  const timerClass = timeLeft < 60 ? 'danger' : timeLeft < 300 ? 'warning' : '';

  return (
    <div>
      {/* Top bar */}
      <div className="flex justify-between items-center mb-6" style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '16px 24px', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 2 }}>{exam?.title}</div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{answered}/{questions.length} answered</div>
        </div>
        <div className={`timer ${timerClass}`}>{formatTime(timeLeft)}</div>
        <button className="btn btn-danger" onClick={() => {
          if (window.confirm('Submit exam now? This cannot be undone.')) submitExam();
        }} disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Exam'}
        </button>
      </div>

      {/* Progress */}
      <div className="progress-bar mb-6">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 24 }}>
        {/* Question */}
        <div className="exam-room">
          {q && (
            <div className="question-card">
              <div className="question-num">Question {current + 1} of {questions.length}
                <span className={`badge ${q.difficulty === 'Easy' ? 'badge-green' : q.difficulty === 'Hard' ? 'badge-red' : 'badge-yellow'}`}
                  style={{ marginLeft: 8 }}>
                  {q.difficulty}
                </span>
                <span style={{ marginLeft: 8, color: 'var(--muted)', fontSize: '0.75rem' }}>({q.marks} mark{q.marks > 1 ? 's' : ''})</span>
              </div>
              <p className="question-text">{q.question_text}</p>
              <div className="options">
                {['A','B','C','D'].map(opt => (
                  <div
                    key={opt}
                    className={`option ${answers[q.question_id] === opt ? 'selected' : ''}`}
                    onClick={() => handleSelect(q.question_id, opt)}
                  >
                    <span className="option-key">{opt}</span>
                    {q[`option_${opt.toLowerCase()}`]}
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-4">
                <button className="btn btn-secondary" onClick={() => setCurrent(c => c - 1)} disabled={current === 0}>
                  ← Previous
                </button>
                <button className="btn btn-secondary" onClick={() => setCurrent(c => c + 1)} disabled={current === questions.length - 1}>
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Question navigator */}
        <div className="card" style={{ height: 'fit-content', position: 'sticky', top: 90 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 12 }}>
            Navigator
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6 }}>
            {questions.map((q, i) => (
              <button key={i} onClick={() => setCurrent(i)} style={{
                width: 32, height: 32, borderRadius: 6, border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace',
                background: current === i
                  ? 'var(--accent)'
                  : answers[q.question_id]
                    ? 'var(--green)'
                    : 'var(--surface2)',
                color: (current === i || answers[q.question_id]) ? 'white' : 'var(--muted)',
                transition: 'all 0.1s',
              }}>
                {i + 1}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mt-4" style={{ flexWrap: 'wrap' }}>
            <div className="flex gap-2 items-center" style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--green)' }} />
              Answered
            </div>
            <div className="flex gap-2 items-center" style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--surface2)' }} />
              Not visited
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
