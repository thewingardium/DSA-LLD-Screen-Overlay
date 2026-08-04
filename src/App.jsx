import { useEffect, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import mermaid from 'mermaid'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import 'katex/dist/katex.min.css'
import './index.css'

const Mermaid = ({ chart }) => {
  const ref = useRef(null);
  
  useEffect(() => {
    mermaid.initialize({ startOnLoad: true, theme: 'dark' });
    if (ref.current && chart) {
      mermaid.render('mermaid-svg-' + Math.random().toString(36).substring(7), chart).then(({ svg }) => {
        ref.current.innerHTML = svg;
      }).catch((e) => {
        console.error('Mermaid render error:', e);
        if (ref.current) {
          ref.current.innerHTML = `<div style="color:red; font-size:12px;">Error rendering diagram</div>`;
        }
      });
    }
  }, [chart]);

  return (
    <div style={{ margin: '16px 0', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', width: '100%', boxSizing: 'border-box' }}>
      <TransformWrapper>
        <TransformComponent wrapperStyle={{ width: '100%' }} contentStyle={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div ref={ref} className="mermaid" style={{ width: '100%' }} />
        </TransformComponent>
      </TransformWrapper>
      <div style={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'center', marginTop: '8px' }}>
        Scroll to zoom. Drag to pan.
      </div>
    </div>
  );
};

function App() {
  const [state, setState] = useState({
    status: 'idle', // 'idle' | 'loading' | 'complete' | 'error' | 'missing_dep'
    response: '',
    error: '',
    isScrollMode: false,
    queueCount: 0
  });

  const [panelWidth, setPanelWidth] = useState(400);
  const isResizing = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing.current) return;
      let newWidth = window.innerWidth - e.clientX;
      if (newWidth < 300) newWidth = 300; // min width
      if (newWidth > window.innerWidth - 100) newWidth = window.innerWidth - 100; // max width
      setPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      isResizing.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    // Check if electron is available
    if (!window.electron) {
      console.warn('Running outside of electron context');
      return;
    }

    // Load initial cache
    window.electron.getCache().then((cache) => {
      if (cache && cache.lastResponse) {
        setState({
          status: 'complete',
          response: cache.lastResponse,
          error: ''
        });
      }
    });

    // Listen to IPC events
    window.electron.onAnalysisStart(() => {
      setState({ status: 'loading', response: '', error: '' });
    });

    window.electron.onAnalysisComplete((data) => {
      setState({ status: 'complete', response: data.response, error: '' });
    });

    window.electron.onAnalysisError((data) => {
      setState(prev => ({ ...prev, status: 'error', response: '', error: data.error }));
    });

    if (window.electron.onScrollMode) {
      window.electron.onScrollMode((isScrollMode) => {
        setState(prev => ({ ...prev, isScrollMode }));
      });
    }

    if (window.electron.onQueueUpdate) {
      window.electron.onQueueUpdate((queueCount) => {
        setState(prev => ({ ...prev, queueCount }));
      });
    }

    if (window.electron.onAgyMissing) {
      window.electron.onAgyMissing(() => {
        setState(prev => ({ ...prev, status: 'missing_dep' }));
      });
    }
  }, []);

  return (
    <>
    <div 
      className={`overlay-panel ${state.isScrollMode ? 'scroll-mode-active' : ''}`} 
      style={{ 
        width: panelWidth,
        ...(state.isScrollMode ? { borderLeft: '2px solid #3b82f6', boxShadow: '-10px 0 40px rgba(59, 130, 246, 0.3)' } : {})
      }}
    >
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>DSA Companion</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            {state.queueCount > 0 && <span style={{ fontSize: '0.75rem', background: '#f59e0b', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>📸 {state.queueCount} QUEUED</span>}
            {state.isScrollMode && <span style={{ fontSize: '0.75rem', background: '#3b82f6', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>SCROLL MODE</span>}
          </div>
        </div>
        <p>AI-Powered LLD & Algorithms Helper</p>
      </div>
      
      {state.status === 'idle' && (
        <div className="content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', textAlign: 'center' }}>
          <p>Press <kbd>Ctrl+Opt+A</kbd> to analyze the current screen.</p>
        </div>
      )}

      {state.status === 'error' && (
        <div className="error">
          <p><strong>Error:</strong> {state.error}</p>
        </div>
      )}

      {state.status === 'missing_dep' && (
        <div className="error" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)', color: '#fcd34d' }}>
          <h3>⚠️ agy CLI Not Found</h3>
          <p>The required AI service <code>agy</code> is missing or not in your system PATH.</p>
          <p>Please install it, ensure it's accessible globally via your terminal/command prompt, and then restart this application.</p>
        </div>
      )}

      {state.status === 'loading' && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Analyzing problem statement...</p>
        </div>
      )}

      {state.status === 'complete' && (
        <div className="content">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              code({node, inline, className, children, ...props}) {
                const match = /language-(\w+)/.exec(className || '')
                if (!inline && match && match[1] === 'mermaid') {
                  return <Mermaid chart={String(children).replace(/\n$/, '')} />
                }
                return <code className={className} {...props}>
                  {children}
                </code>
              }
            }}
          >
            {state.response}
          </ReactMarkdown>
        </div>
      )}

      <div className="shortcuts-guide">
        <div className="shortcut-row">
          <span>Toggle Visibility</span>
          <kbd>Ctrl+Opt+O</kbd>
        </div>
        <div className="shortcut-row">
          <span>Queue Screenshot</span>
          <kbd>Ctrl+Opt+C</kbd>
        </div>
        <div className="shortcut-row">
          <span>Analyze Screen / Queue</span>
          <kbd>Ctrl+Opt+A</kbd>
        </div>
        <div className="shortcut-row">
          <span>Toggle Scroll Mode</span>
          <kbd>Ctrl+Opt+S</kbd>
        </div>
        <div className="shortcut-row">
          <span>Retry Analysis</span>
          <kbd>Ctrl+Opt+R</kbd>
        </div>
      </div>
    </div>
    
    {state.isScrollMode && (
      <div
        style={{
          position: 'fixed',
          right: panelWidth - 6, // Position from the right edge
          top: 0,
          bottom: 0,
          width: '12px',
          cursor: 'ew-resize',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          pointerEvents: 'auto',
          zIndex: 10,
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)'
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          isResizing.current = true;
        }}
      />
    )}
    </>
  )
}

export default App
