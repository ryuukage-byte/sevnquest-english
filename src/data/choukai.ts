import { ChoukaiItem } from '../types/content';
import choukaiDb from './db/choukai.json';

// English listening (dialogues are spoken with the browser's English text-to-speech voice).
export const CHOUKAI_DATABASE: Record<string, ChoukaiItem> = choukaiDb as unknown as Record<string, ChoukaiItem>;
