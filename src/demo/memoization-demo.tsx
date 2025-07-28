/**
 * 🧙‍♂️ Dumbledore's Pensieve - React Memoization Demo
 *
 * "I use the Pensieve. One simply siphons the excess thoughts from one's mind,
 * pours them into the basin, and examines them at one's leisure."
 * - Albus Dumbledore
 *
 * This magical React component showcases the power of memoization through
 * the dark art of Horcrux memory extraction. Just as Tom Riddle split his soul
 * into seven fragments, we split our computations into cached pieces.
 *
 * The first extraction takes magical effort (2-5 seconds),
 * but all future recalls are instant - drawn from the Pensieve’s cache.
 *
 * ⚡ Created by Dawid Ryłko with a little help from AI
 * 📚 Based on data from harrypotter.fandom.com/wiki/Horcrux
 *
 * "After all, to the well-organised mind, death is but the next great adventure."
 * And to the well-organised code, performance is but a cached memory.
 */
import React, { useState, useCallback, useRef } from 'react';

enum LogType {
  Processing,
  Cached,
  Result,
  Separator,
  Error,
}

type LogEntry = {
  id: number;
  message: string;
  type: LogType;
  timestamp: number;
  isFinished: boolean;
};

// Data source: https://harrypotter.fandom.com/wiki/Horcrux
const HORCRUX_DATA = new Map<string, string[]>([
  [
    `T. M. Riddle's Diary`,
    [
      `Created with the murder of Myrtle Warren by the Serpent of Slytherin`,
      `Second-floor girls' lavatory, Hogwarts Castle`,
      `June 1943`,
    ],
  ],
  [
    `Marvolo Gaunt's Ring`,
    [
      `Created with the murder of Tom Riddle Senior with Morfin Gaunt's wand`,
      `Riddle House, Little Hangleton`,
      `c. August 1943`,
    ],
  ],
  [`Slytherin's Locket`, [`Created with the murder of a Muggle tramp`, `c. 1946 or later, but before 1979`]],
  [`Hufflepuff's Cup`, [`Created with the murder of Hepzibah Smith`, `Hepzibah Smith's home`, `c. 1946 or later`]],
  [`Ravenclaw's Diadem`, [`Created with the murder of an Albanian peasant`, `Albania`, `c. 1946 or later`]],
  [`Nagini`, [`Created with the murder of Bertha Jorkins`, `Albania`, `Summer 1994`]],
  [`Harry Potter`, [`Created with the murder of Lily J. Potter`, `Godric's Hollow, West Country`, `31 October 1981`]],
]);

const WELCOME_MESSAGE = `🔮 Welcome to the Pensieve. Select a Horcrux to view its memories...`;

const MemoizationDemo: React.FC = () => {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([
    { id: 0, message: WELCOME_MESSAGE, type: LogType.Result, timestamp: Date.now(), isFinished: true },
  ]);
  const [loadingHorcruxes, setLoadingHorcruxes] = useState<Set<string>>(new Set());
  const [memoryCache] = useState<Map<string, string>>(new Map());
  const logContainerRef = useRef<HTMLDivElement>(null);

  const sleep = (milliseconds: number): Promise<void> => new Promise(resolve => setTimeout(resolve, milliseconds));

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, `0`);
    const minutes = date.getMinutes().toString().padStart(2, `0`);
    const seconds = date.getSeconds().toString().padStart(2, `0`);
    const milliseconds = date.getMilliseconds().toString().padStart(3, `0`);
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
  };

  const addLogEntry = useCallback((message: string, type: LogType = LogType.Result, isFinished: boolean = true) => {
    console.log(`[${formatTimestamp(Date.now())}]: ${message}`);
    setLogEntries(currentLogs => [
      ...currentLogs,
      { id: currentLogs.length, message, type, timestamp: Date.now(), isFinished },
    ]);

    setTimeout(() => {
      if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
      }
    }, 10);
  }, []);

  const markLogAsFinished = useCallback((logId: number) => {
    setLogEntries(currentLogs => currentLogs.map(log => (log.id === logId ? { ...log, isFinished: true } : log)));
  }, []);

  const extractHorcruxMemory = async (horcruxName: string): Promise<string> => {
    const processingDuration = 2000 + Math.random() * 3000;
    const currentLogId = logEntries.length;

    addLogEntry(
      `🔍 Extracting memories from ${horcruxName}... (${Math.round(processingDuration)}ms)`,
      LogType.Processing,
      false,
    );

    await sleep(processingDuration);
    markLogAsFinished(currentLogId);

    const horcruxEvents = HORCRUX_DATA.get(horcruxName) || [`No memories found for this Horcrux.`];
    return horcruxEvents.join(` 🪄 `);
  };

  const getHorcruxMemory = async (horcruxName: string): Promise<string> => {
    if (memoryCache.has(horcruxName)) {
      addLogEntry(`⚡ Retrieved from memory cache`, LogType.Cached);
      return memoryCache.get(horcruxName)!;
    }

    const memory = await extractHorcruxMemory(horcruxName);
    memoryCache.set(horcruxName, memory);
    return memory;
  };

  const viewHorcrux = async (horcruxName: string): Promise<void> => {
    if (loadingHorcruxes.has(horcruxName)) return;

    setLoadingHorcruxes(current => new Set(current).add(horcruxName));

    try {
      const memoryDetails = await getHorcruxMemory(horcruxName);
      addLogEntry(`🔮 ${horcruxName}: ${memoryDetails}`, LogType.Result);
      addLogEntry(`✨ Memory extraction complete`, LogType.Separator);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Unknown error`;
      addLogEntry(`💀 Failed to extract memory from ${horcruxName}: ${errorMessage}`, LogType.Error);
    } finally {
      setLoadingHorcruxes(current => {
        const updated = new Set(current);
        updated.delete(horcruxName);
        return updated;
      });
    }
  };

  const clearLogs = () => {
    setLogEntries([{ id: 0, message: WELCOME_MESSAGE, type: LogType.Result, timestamp: Date.now(), isFinished: true }]);
  };

  const horcruxList = Array.from(HORCRUX_DATA.keys());

  return (
    <>
      <div className="harry-potter-app-container">
        <div className="harry-potter-main-card">
          <header className="harry-potter-header">
            <h1 className="harry-potter-title">🧙‍♂️ Dumbledore&apos;s Pensieve</h1>
            <p className="harry-potter-subtitle">React Memoization Demo with Horcrux Memories</p>
            <p className="harry-potter-description">
              Extract memories from Voldemort&apos;s Horcruxes. First extraction takes time due to magical processing,
              but subsequent accesses are instant thanks to memoization!
            </p>
          </header>

          <section className="harry-potter-horcrux-section">
            <div className="harry-potter-horcrux-grid">
              {horcruxList.map(horcrux => (
                <button
                  key={horcrux}
                  onClick={() => viewHorcrux(horcrux)}
                  disabled={loadingHorcruxes.has(horcrux)}
                  className={`harry-potter-horcrux-btn ${loadingHorcruxes.has(horcrux) ? `harry-potter-loading` : ``}`}
                >
                  {horcrux}
                </button>
              ))}
            </div>
          </section>

          <section className="harry-potter-log-section">
            <div className="harry-potter-log-header">
              <h3 className="harry-potter-log-title">📜 Memory Extraction Log</h3>
              <button onClick={clearLogs} className="harry-potter-clear-btn">
                🗑️ Clear
              </button>
            </div>

            <div className="harry-potter-log-container" ref={logContainerRef}>
              {logEntries.map(entry => (
                <div key={entry.id} className={`harry-potter-log-entry harry-potter-log-${entry.type}`}>
                  <span className="harry-potter-log-time">[{formatTimestamp(entry.timestamp)}]</span>
                  <div className="harry-potter-log-content">
                    <span className="harry-potter-log-message">{entry.message}</span>
                    {!entry.isFinished && <div className="harry-potter-loading-spinner" />}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <footer className="harry-potter-footer">
            <p>
              Copyright © {new Date().getFullYear()}{' '}
              <a href="https://dawidrylko.com" target="_blank" rel="dofollow noopener noreferrer">
                Dawid Ryłko
              </a>
              . Made with 🪄 and a hint of AI.
            </p>
            <p>Data comes from harrypotter.fandom.com/wiki/Horcrux</p>
          </footer>
        </div>
      </div>

      <style>{`
        :root {
          /* Main colors */
          --harry-potter-bg-primary: #0a0a0a;
          --harry-potter-bg-secondary: #1a1a1a;
          --harry-potter-bg-card: #242424;
          --harry-potter-bg-log: #1a1a1a;

          /* Text colors */
          --harry-potter-text-primary: #ffffff;
          --harry-potter-text-secondary: #b0b0b0;
          --harry-potter-text-dim: #808080;

          /* Accent colors */
          --harry-potter-accent-primary: #5b21b6;
          --harry-potter-accent-hover: #7c3aed;
          --harry-potter-accent-gradient-start: #7c3aed;
          --harry-potter-accent-gradient-end: #a855f7;

          /* Log colors */
          --harry-potter-log-processing: #fbbf24;
          --harry-potter-log-cached: #10b981;
          --harry-potter-log-error: #ef4444;
          --harry-potter-log-separator: #8b5cf6;
          --harry-potter-log-result: #e5e5e5;

          /* Borders */
          --harry-potter-border-color: #374151;
          --harry-potter-border-subtle: #2a2a2a;

          /* Shadows */
          --harry-potter-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          --harry-potter-shadow-hover: 0 8px 30px rgba(0, 0, 0, 0.7);
        }

        .harry-potter-app-container {
          min-height: 100vh;
          background-color: var(--harry-potter-bg-primary);
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .harry-potter-main-card {
          max-width: 1200px;
          margin: 0 auto;
          background-color: var(--harry-potter-bg-card);
          border-radius: 16px;
          box-shadow: var(--harry-potter-shadow);
          overflow: hidden;
          border: 1px solid var(--harry-potter-border-subtle);
        }

        .harry-potter-header {
          background: linear-gradient(135deg, var(--harry-potter-accent-gradient-start) 0%, var(--harry-potter-accent-gradient-end) 100%);
          color: var(--harry-potter-text-primary);
          padding: 2.5rem;
          text-align: center;
        }

        .harry-potter-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .harry-potter-subtitle {
          font-size: 1.25rem;
          margin-bottom: 1rem;
          opacity: 0.95;
        }

        .harry-potter-description {
          font-size: 1rem;
          line-height: 1.6;
          opacity: 0.9;
          max-width: 600px;
          margin: 0 auto;
        }

        .harry-potter-horcrux-section {
          padding: 2.5rem;
          background-color: var(--harry-potter-bg-secondary);
          border-bottom: 1px solid var(--harry-potter-border-color);
        }

        .harry-potter-horcrux-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .harry-potter-horcrux-btn {
          padding: 1rem;
          background-color: var(--harry-potter-accent-primary);
          color: var(--harry-potter-text-primary);
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(91, 33, 182, 0.3);
        }

        .harry-potter-horcrux-btn:hover:not(.harry-potter-loading) {
          background-color: var(--harry-potter-accent-hover);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
        }

        .harry-potter-horcrux-btn.harry-potter-loading {
          background-color: var(--harry-potter-border-color);
          color: var(--harry-potter-text-secondary);
          cursor: not-allowed;
          opacity: 0.7;
        }

        .harry-potter-log-section {
          padding: 2rem;
          background-color: var(--harry-potter-bg-secondary);
        }

        .harry-potter-log-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .harry-potter-log-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--harry-potter-text-primary);
        }

        .harry-potter-clear-btn {
          padding: 0.5rem 1.25rem;
          background-color: var(--harry-potter-border-color);
          color: var(--harry-potter-text-primary);
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .harry-potter-clear-btn:hover {
          background-color: #4b5563;
          transform: translateY(-1px);
        }

        .harry-potter-log-container {
          background-color: var(--harry-potter-bg-log);
          border-radius: 8px;
          padding: 1.5rem;
          max-height: 400px;
          overflow-y: auto;
          font-family: 'SF Mono', Monaco, Consolas, monospace;
          font-size: 0.875rem;
          border: 1px solid var(--harry-potter-border-color);
          scrollbar-width: thin;
          scrollbar-color: var(--harry-potter-border-color) var(--harry-potter-bg-log);
        }

        .harry-potter-log-container::-webkit-scrollbar {
          width: 8px;
        }

        .harry-potter-log-container::-webkit-scrollbar-track {
          background: var(--harry-potter-bg-log);
        }

        .harry-potter-log-container::-webkit-scrollbar-thumb {
          background-color: var(--harry-potter-border-color);
          border-radius: 4px;
        }

        .harry-potter-log-entry {
          padding: 0.75rem 0;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          border-bottom: 1px solid var(--harry-potter-border-subtle);
          flex-wrap: wrap;
        }

        .harry-potter-log-entry:last-child {
          border-bottom: none;
        }

        .harry-potter-log-time {
          color: var(--harry-potter-text-dim);
          font-size: 0.75rem;
          flex-shrink: 0;
          min-width: 90px;
          font-variant-numeric: tabular-nums;
        }

        .harry-potter-log-content {
          flex: 1;
          display: flex;
          gap: 0.5rem;
          min-width: 0;
        }

        .harry-potter-log-message {
          flex: 1;
          line-height: 1.4;
          word-break: break-word;
        }

        .harry-potter-loading-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid var(--harry-potter-border-color);
          border-top: 2px solid var(--harry-potter-log-processing);
          border-radius: 50%;
          animation: harry-potter-spin 1s linear infinite;
          flex-shrink: 0;
        }

        @keyframes harry-potter-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .harry-potter-log-processing { color: var(--harry-potter-log-processing); }
        .harry-potter-log-cached { color: var(--harry-potter-log-cached); }
        .harry-potter-log-error { color: var(--harry-potter-log-error); }
        .harry-potter-log-separator { color: var(--harry-potter-log-separator); }
        .harry-potter-log-result { color: var(--harry-potter-log-result); }

        .harry-potter-footer {
          padding: 1.5rem;
          text-align: center;
          color: var(--harry-potter-text-dim);
          font-size: 0.875rem;
          background-color: var(--harry-potter-bg-secondary);
          border-top: 1px solid var(--harry-potter-border-subtle);
        }

        .harry-potter-footer p {
          margin: 0.25rem 0;
        }
      `}</style>
    </>
  );
};

export default MemoizationDemo;
