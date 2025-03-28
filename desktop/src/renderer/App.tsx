import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import icon from '../../assets/icon.svg';
import './App.css';

function Hello() {
  const [sender, setSender] = useState<string>('');

  return (
    <div>
      <input
        type="text"
        value={sender}
        onChange={(e) => setSender(e.target.value)}
      />
      <button
        type="button"
        onClick={() => window.electron.ipcRenderer.greet(sender)}
      >
        Greet
      </button>
      <div className="Hello">
        <img width="200" alt="icon" src={icon} />
      </div>
      <h1>electron-react-asdasd</h1>
      <div className="Hello">
        <a
          href="https://electron-react-boilerplate.js.org/"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="books">
              📚
            </span>
            Read our docs
          </button>
        </a>
        <a
          href="https://github.com/sponsors/electron-react-boilerplate"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="folded hands">
              🙏
            </span>
            Donate
          </button>
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
