
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function CharacterCreation() {
  const [name, setName] = useState('');
  const [characterClass, setCharacterClass] = useState('');
  const [backstory, setBackstory] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      name,
      characterClass,
      backstory,
    });
    router.push(`/game?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-2xl">Create Your Hero</CardTitle>
            <CardDescription>
              Define your character to begin your epic adventure.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Elora, The Brave"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="class">Class</Label>
              <Select onValueChange={setCharacterClass} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Warrior">Warrior</SelectItem>
                  <SelectItem value="Mage">Mage</SelectItem>
                  <SelectItem value="Rogue">Rogue</SelectItem>
                  <SelectItem value="Archer">Archer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="backstory">Backstory</Label>
              <Textarea
                id="backstory"
                placeholder="Born in a small village, destined for great things..."
                value={backstory}
                onChange={(e) => setBackstory(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Begin Adventure
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
