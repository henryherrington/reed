import { prisma } from "./prisma";

const ADJECTIVES = [
  "quiet", "amber", "bright", "calm", "clever", "cozy", "dusty", "eager",
  "faint", "gentle", "hazy", "idle", "jolly", "keen", "lively", "misty",
  "noble", "olive", "plain", "quick", "rusty", "sunny", "tidy", "vivid",
];

const NOUNS = [
  "fox", "reed", "owl", "elm", "wren", "fern", "moss", "lark",
  "pine", "dove", "oak", "hare", "gull", "yew", "teal", "vole",
];

function randomUsername() {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const n = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${a}-${n}-${num}`;
}

export async function ensureUsername(userId: string): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const candidate = randomUsername();
    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { username: candidate },
      });
      return updated.username as string;
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "P2002") continue; // username taken, try another
      throw err;
    }
  }
  const fallback = `reader-${userId.slice(0, 6)}`;
  const updated = await prisma.user.update({ where: { id: userId }, data: { username: fallback } });
  return updated.username as string;
}
