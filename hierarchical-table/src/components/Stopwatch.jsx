import React, { useState, useEffect } from 'react';
import '../App.css';

const Stopwatch = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [splits, setSplits] = useState([]);

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    } else if (!isRunning) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const start = () => {
    setIsRunning(true);
  };

  const stop = () => {
    setIsRunning(false);
  };

  const reset = () => {
    setTime(0);
    setIsRunning(false);
    setSplits([]);
  };

  const split = () => {
    setSplits((prevSplits) => [...prevSplits, time]);
  };

  const formatTime = (time) => {
    console.log(time)
    const milliseconds = Math.floor((time % 1000) / 10);
    const seconds = Math.floor((time / 1000) % 60);
    const minutes = Math.floor((time / (1000 * 60)) % 60);
    const hours = Math.floor(time / (1000 * 60 * 60));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="stopwatch">
      <h2>Stopwatch</h2>
      <div className="time-display">{formatTime(time)}</div>
      <div className="buttons">
        <button onClick={start} disabled={isRunning}>Start</button>
        <button onClick={stop} disabled={!isRunning}>Stop</button>
        <button onClick={reset}>Reset</button>
        <button onClick={split} disabled={!isRunning}>Split</button>
      </div>
      <div className="splits">
        <h3>Splits</h3>
        <ul>
          {splits.map((splitTime, index) => (
            <li key={index}>{`Split ${index + 1}: ${formatTime(splitTime)}`}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Stopwatch;
