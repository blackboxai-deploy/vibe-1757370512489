'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HistoryEntry {
  type: 'user' | 'story';
  text: string;
}

export default function Game() {
  const [character, setCharacter] = useState<any>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(true);
  const [imagePrompt, setImagePrompt] = useState('A new adventure begins');
  const router = useRouter();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedCharacter = localStorage.getItem('character');
    if (storedCharacter) {
      const parsedCharacter = JSON.parse(storedCharacter);
      setCharacter(parsedCharacter);
      fetchInitialStory(parsedCharacter);
    } else {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [history]);

  const fetchInitialStory = async (char: any) => {
    setLoading(true);
    const initialHistory: HistoryEntry[] = [
      { type: 'story', text: `Your adventure begins. You are ${char.name}, a ${char.class}. ${char.backstory}` },
    ];
    const response = await fetch('/api/game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        character: char,
        history: initialHistory,
        action: 'Start the adventure.',
      }),
    });
    const data = await response.json();
    setHistory([...initialHistory, { type: 'story', text: data.story }]);
    setImagePrompt(data.imagePrompt);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!action.trim() || loading) return;

    const newHistory: HistoryEntry[] = [...history, { type: 'user', text: action }];
    setHistory(newHistory);
    setAction('');
    setLoading(true);

    const response = await fetch('/api/game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        character,
        history: newHistory,
        action,
      }),
    });
    const data = await response.json();

    setHistory([...newHistory, { type: 'story', text: data.story }]);
    setImagePrompt(data.imagePrompt);
    setLoading(false);
  };

  if (!character) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
<div className="min-h-screen bg-gray-900 text-white flex flex-col md:flex-row p-4 gap-4">
<Card className="w-full md:w-1/3 h-full bg-gray-800 border-gray-700 flex flex-col">
<CardContent className="p-4 flex-grow flex flex-col">
<h2 className="text-2xl font-bold mb-4">Scene</h2>
            <div className="aspect-w-16 aspect-h-9 w-full bg-gray-700 rounded-lg overflow-hidden mb-4">
              <img
                src={`https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/068e19c0-3291-4723-b487-7adf701cd53f.png}`}
                alt={imagePrompt}
                className="w-full h-full object-cover"
              />
            </div>
<h3 className="text-xl font-bold">{character.name}</h3>
<p className="text-gray-400">{character.class}</p>
</CardContent>
</Card>

<div className="w-full md:w-2/3 h-full flex flex-col">
<ScrollArea className="flex-grow bg-gray-800 border-gray-700 rounded-lg p-4 mb-4 h-96 md:h-[calc(100vh-12rem)]" ref={scrollAreaRef}>
              {history.map((entry, index) => (
<div key={index} className={`mb-4 ${entry.type === 'user' ? 'text-right' : 'text-left'}`}>
                  <p className={`p-3 rounded-lg ${entry.type === 'user' ? 'bg-blue-600 inline-block' : 'bg-gray-700'}`}>
                    {entry.text}
</p>
</div>
              ))}
              {loading && (
<div className="text-center">
<p>Generating next scene...</p>
</div>
              )}
</ScrollArea>

<form onSubmit={handleSubmit} className="flex gap-2">
<Input
                type="text"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="What do you do next?"
                disabled={loading}
                className="flex-grow bg-gray-700 border-gray-600 text-white"
              />
<Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                Send
</Button>
</form>
</div>
</div>
  );
}
