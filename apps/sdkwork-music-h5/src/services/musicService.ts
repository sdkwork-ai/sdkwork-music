import { MusicHomeShelf } from '../types/music';
import { listHomeShelves } from '../runtime/musicClient';

class MusicService {
  async getHomeShelves(cursor?: string, limit?: number): Promise<MusicHomeShelf[]> {
    return listHomeShelves(cursor, limit);
  }
}

export const musicService = new MusicService();