'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';

const GOAL = 1000;

export default function Home() {
  const [contributors, setContributors] = useState([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [eventId, setEventId] = useState('');
  const [isSetupMode, setIsSetupMode] = useState(true);
  const [loading, setLoading] = useState(false);

  const FIREBASE_DB = 'https://birthday-fund-default.firebaseio.com';

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('event');
    
    if (id) {
      setEventId(id);
      setIsSetupMode(false);
      loadContributions(id);
    } else {
      const savedId = localStorage.getItem('eventId');
      if (savedId) {
        setEventId(savedId);
        setIsSetupMode(false);
        loadContributions(savedId);
      }
    }
  }, []);

  const loadContributions = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`${FIREBASE_DB}/events/${id}.json`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.contributions) {
          const contribArray = Object.values(data.contributions).filter(c => c);
          setContributors(contribArray);
          return;
        }
      }
    } catch (error) {
      console.log('Firebase unavailable');
    }

    const saved = localStorage.getItem(`contributors_${id}`);
    if (saved) {
      setContributors(JSON.parse(saved));
    }
    setLoading(false);
  };

  const handleCreateEvent = (e) => {
    e.preventDefault();
    const newId = Math.random().toString(36).substring(2, 9);
    setEventId(newId);
    localStorage.setItem('eventId', newId);
    setIsSetupMode(false);
    window.history.replaceState({}, '', `?event=${newId}`);
  };

  const saveContributor = async (newContributor) => {
    setLoading(true);

    try {
      await fetch(`${FIREBASE_DB}/events/${eventId}/contributions/${newContributor.id}.json`, {
        method: 'PUT',
        body: JSON.stringify(newContributor),
      });
      loadContributions(eventId);
      return;
    } catch (error) {
      console.log('Using local storage');
    }

    const updated = [...contributors, newContributor];
    setContributors(updated);
    localStorage.setItem(`contributors_${eventId}`, JSON.stringify(updated));
    setLoading(false);
  };

  const handleAddContributor = (e) => {
    e?.preventDefault();
    
    if (name.trim() && amount && parseFloat(amount) > 0) {
      const newContributor = {
        id: Date.now(),
        name: name.trim(),
        amount: parseFloat(amount),
      };

      saveContributor(newContributor);
      setName('');
      setAmount('');
    }
  };

  const handleRemove = async (id) => {
    setLoading(true);
    
    try {
      await fetch(`${FIREBASE_DB}/events/${eventId}/contributions/${id}.json`, {
        method: 'DELETE',
      });
      loadContributions(eventId);
      return;
    } catch (error) {
      console.log('Using local storage');
    }

    const updated = contributors.filter(c => c.id !== id);
    setContributors(updated);
    localStorage.setItem(`contributors_${eventId}`, JSON.stringify(updated));
    setLoading(false);
  };

  const total = contributors.reduce((sum, c) => sum + c.amount, 0);
  const percentage = Math.min((total / GOAL) * 100, 100);
  const isGoalReached = total >= GOAL;

  if (isSetupMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-6 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <span className="text-6xl block mb-4">💵</span>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-rose-600 mb-2">
              Birthday Money
            </h1>
            <p className="text-amber-700 mb-2">Josh's 11th Birthday Party 🎉</p>
            <p className="text-sm text-amber-600 font-serif">Track who's bringing cash for Josh's birthday!</p>
          </div>

          <form onSubmit={handleCreateEvent} className="bg-white rounded-2xl p-8 shadow-lg border-2 border-amber-100">
            <h2 className="text-xl font-bold text-amber-900 mb-4">Get Started</h2>
            <p className="text-amber-700 text-sm mb-6">
              Click below to create a unique link. Share it with family and watch the money come in!
            </p>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg transition-all text-lg"
            >
              Create Event
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-6 md:p-12">
      {isGoalReached && (
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
              style={{
                left: Math.random() * 100 + '%',
                top: -10,
                animation: `fall ${2 + Math.random()}s linear forwards`,
                animationDelay: `${Math.random()}s`,
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>

      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-100 to-rose-100 rounded-full blur-3xl opacity-30 -z-10 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-orange-100 to-amber-100 rounded-full blur-3xl opacity-30 -z-10 pointer-events-none"></div>

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-5xl">💵</span>
            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-orange-600 to-rose-600">
              Birthday Money
            </h1>
          </div>

          <div className="bg-gradient-to-br from-sky-100 to-blue-100 rounded-2xl p-8 border-3 border-sky-300 mb-8 shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-4xl">🎂</span>
              <h2 className="text-3xl font-black text-sky-900">Josh's Birthday!</h2>
            </div>
            <p className="text-lg text-sky-800 font-serif mb-4">
              Josh is turning <span className="font-bold text-2xl">11</span>!
            </p>
            <p className="text-xl text-sky-900 font-bold mb-3 leading-relaxed">
              Please let us know how much cash you'll bring for his special day! 💵
            </p>
            <p className="text-sky-800 italic">
              We'll track all the cash contributions here so everyone knows what's being brought.
            </p>
          </div>

          <div className={`rounded-2xl p-8 border-2 mb-8 shadow-xl transition-all ${
            isGoalReached
              ? 'bg-gradient-to-r from-yellow-100 to-green-100 border-yellow-400'
              : 'bg-gradient-to-r from-amber-100 to-rose-100 border-amber-200'
          }`}>
            <p className={`text-lg font-semibold mb-2 ${isGoalReached ? 'text-yellow-700' : 'text-amber-700'}`}>
              {isGoalReached ? '🎉 TARGET REACHED! 🎉' : 'Cash Target: $' + GOAL}
            </p>

            <div className="mb-4">
              <div className="w-full bg-white rounded-full h-4 border-2 border-amber-200 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isGoalReached
                      ? 'bg-gradient-to-r from-yellow-400 to-green-400'
                      : 'bg-gradient-to-r from-amber-400 to-orange-400'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm font-semibold">
                <span className="text-amber-700">${total.toFixed(2)}</span>
                <span className={isGoalReached ? 'text-green-700' : 'text-amber-700'}>
                  {Math.round(percentage)}%
                </span>
              </div>
            </div>

            <p className={`text-sm ${isGoalReached ? 'text-green-700' : 'text-amber-700'}`}>
              {isGoalReached 
                ? `🎊 ${contributors.length} people bringing cash!`
                : `${GOAL - total > 0 ? '$' + (GOAL - total).toFixed(2) : 'Target reached!'} to go`
              }
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border-2 border-amber-200 mb-8 shadow-md">
            <p className="text-amber-700 text-sm font-semibold mb-2">Share this link:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={typeof window !== 'undefined' ? window.location.href : ''}
                readOnly
                className="flex-1 px-3 py-2 bg-amber-50 rounded-lg border-2 border-amber-200 text-sm font-mono text-amber-900 focus:outline-none"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied!');
                }}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition-all"
              >
                Copy
              </button>
            </div>
            <p className="text-amber-600 text-xs mt-2">💡 Refresh the page to see new contributions</p>
          </div>
        </div>

        <form onSubmit={handleAddContributor} className="bg-white rounded-2xl p-8 shadow-lg border-2 border-amber-100 mb-8">
          <h2 className="text-2xl font-bold text-amber-900 mb-6 flex items-center gap-2">
            <Plus className="w-6 h-6" /> Add Your Cash
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-orange-500 focus:outline-none text-base"
              required
            />
            <input
              type="number"
              placeholder="How much cash will you bring? ($)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
              className="px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-orange-500 focus:outline-none text-base"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Add'}
            </button>
          </div>
        </form>

        {contributors.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-amber-900 mb-4">🏆 Leaderboard</h2>
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 border-2 border-yellow-200 shadow-lg">
              <div className="space-y-2">
                {[...contributors]
                  .sort((a, b) => b.amount - a.amount)
                  .map((contributor, idx) => {
                    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '  ';
                    return (
                      <div key={contributor.id} className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-amber-50 transition-all">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-2xl w-6">{medal}</span>
                          <span className="font-bold text-amber-900">{idx + 1}.</span>
                          <span className="font-semibold text-amber-900">{contributor.name}</span>
                        </div>
                        <span className="text-lg font-black text-orange-600">${contributor.amount.toFixed(2)}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold text-amber-900 mb-4">💵 Cash Tracker</h2>

          {contributors.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-amber-200">
              <span className="text-6xl block mb-4">💵</span>
              <p className="text-amber-700 text-lg font-semibold">No cash contributions yet!</p>
              <p className="text-amber-600">Share this link with family and friends to see who's bringing cash for Josh!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contributors.map((contributor, idx) => (
                <div
                  key={contributor.id}
                  className="bg-white rounded-xl p-4 border-l-4 border-gradient-to-b from-amber-400 to-orange-400 shadow-md hover:shadow-lg transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-orange-300 flex items-center justify-center font-bold text-amber-900 text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-amber-900 text-lg">{contributor.name}</p>
                      <p className="text-orange-600 font-semibold">${contributor.amount.toFixed(2)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(contributor.id)}
                    disabled={loading}
                    className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 disabled:opacity-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
