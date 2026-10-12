import { DokkaiItem } from '../types/content';
import dokkaiData from './db/dokkai.json';

export const DOKKAI_DATABASE: Record<string, DokkaiItem> = dokkaiData as unknown as Record<string, DokkaiItem>;
