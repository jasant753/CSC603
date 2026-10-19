
'use client';

import { useState } from 'react';

export default function DashboardPage() {
  const [story, setStory] = useState(
    'You awaken in a mysterious forest. The air is cold, ' +
    'and a narrow path leads deeper into the trees.'
  );

  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(false);

  
  async function submitAction() {
    if (!action.trim() || loading) return;

    setLoading(true);

    try {
      const response = await fetch(
        'http://localhost:8080/api/game/action',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: action
          })
        }
      );

      if (!response.ok) {
        throw new Error('Backend request failed');
      }

      const data = await response.json();

      setStory(data.narration);
      setAction('');

    } catch (error) {
      console.error(error);
      setStory('Unable to connect to the game server.');

    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-logo">
          GenAI Adventure
        </div>
      </nav>

      <div className="main">
        <div className="user-card">
          <h2>Your Adventure</h2>

          <p>{story}</p>

          <div className="player-input">
            <input
              type="text"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="What would you like to do?"
              disabled={loading}
            />

            <button
              onClick={submitAction}
              disabled={loading}
            >
              {loading ? 'Thinking...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
