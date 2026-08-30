import { MusicHomeShelf } from '../types/music';
import { listHomeShelves } from '../runtime/musicClient';

const USE_MOCK_DATA = true; // Set to false when API server is running

class MusicService {
  async getHomeShelves(cursor?: string, pageSize?: number): Promise<MusicHomeShelf[]> {
    if (USE_MOCK_DATA) {
      return this.getMockHomeShelves();
    }

    return listHomeShelves(cursor, pageSize);
  }

  private getMockHomeShelves(): MusicHomeShelf[] {
    return [
      {
        id: 'shelf-1',
        tenantId: '100001',
        slug: 'personalized-for-you',
        title: 'Made for You',
        shelfType: 'personalized',
        items: [
          {
            id: 'item-1',
            itemType: 'track',
            itemId: 'track-1',
            position: 0,
            reasonCode: 'based_on_listening',
            track: {
              id: 'track-1',
              tenantId: '100001',
              artistId: 'artist-1',
              artistName: 'The SDK Workers',
              albumId: 'album-1',
              albumTitle: 'Digital Dreams',
              slug: 'digital-dreams',
              title: 'Digital Dreams',
              durationSeconds: 245,
              status: 'published',
              tags: ['electronic', 'ambient'],
            },
          },
          {
            id: 'item-2',
            itemType: 'track',
            itemId: 'track-2',
            position: 1,
            reasonCode: 'based_on_listening',
            track: {
              id: 'track-2',
              tenantId: '100001',
              artistId: 'artist-2',
              artistName: 'Code Beats',
              albumId: 'album-2',
              albumTitle: 'Algorithm Rhythms',
              slug: 'algorithm-rhythms',
              title: 'Algorithm Rhythms',
              durationSeconds: 198,
              status: 'published',
              tags: ['hip-hop', 'tech'],
            },
          },
          {
            id: 'item-3',
            itemType: 'track',
            itemId: 'track-3',
            position: 2,
            reasonCode: 'based_on_listening',
            track: {
              id: 'track-3',
              tenantId: '100001',
              artistId: 'artist-3',
              artistName: 'Binary Band',
              albumId: 'album-3',
              albumTitle: 'Pixel Perfect',
              slug: 'pixel-perfect',
              title: 'Pixel Perfect',
              durationSeconds: 312,
              status: 'published',
              tags: ['rock', 'digital'],
            },
          },
        ],
      },
      {
        id: 'shelf-2',
        tenantId: '100001',
        slug: 'new-releases',
        title: 'New Releases',
        shelfType: 'new_release',
        items: [
          {
            id: 'item-4',
            itemType: 'album',
            itemId: 'album-4',
            position: 0,
            playlist: {
              id: 'playlist-1',
              tenantId: '100001',
              slug: 'summer-vibes',
              title: 'Summer Vibes 2026',
              description: 'The hottest tracks for summer',
              trackIds: ['track-4', 'track-5', 'track-6'],
            },
          },
          {
            id: 'item-5',
            itemType: 'album',
            itemId: 'album-5',
            position: 1,
            playlist: {
              id: 'playlist-2',
              tenantId: '100001',
              slug: 'chill-coding',
              title: 'Chill Coding Sessions',
              description: 'Perfect background music for coding',
              trackIds: ['track-7', 'track-8', 'track-9', 'track-10'],
            },
          },
        ],
      },
      {
        id: 'shelf-3',
        tenantId: '100001',
        slug: 'ai-generated',
        title: 'AI Generated Hits',
        shelfType: 'ai_generation',
        items: [
          {
            id: 'item-6',
            itemType: 'track',
            itemId: 'track-11',
            position: 0,
            reasonCode: 'trending_ai',
            track: {
              id: 'track-11',
              tenantId: '100001',
              artistId: 'ai-artist-1',
              artistName: 'AI Composer',
              slug: 'neural-symphony',
              title: 'Neural Symphony',
              durationSeconds: 278,
              status: 'published',
              tags: ['ai-generated', 'classical', 'electronic'],
            },
          },
          {
            id: 'item-7',
            itemType: 'track',
            itemId: 'track-12',
            position: 1,
            reasonCode: 'trending_ai',
            track: {
              id: 'track-12',
              tenantId: '100001',
              artistId: 'ai-artist-2',
              artistName: 'Deep Learning Beats',
              slug: 'gradient-descent-groove',
              title: 'Gradient Descent Groove',
              durationSeconds: 224,
              status: 'published',
              tags: ['ai-generated', 'dance', 'tech'],
            },
          },
        ],
      },
      {
        id: 'shelf-4',
        tenantId: '100001',
        slug: 'top-charts',
        title: 'Top Charts',
        shelfType: 'chart',
        items: [
          {
            id: 'item-8',
            itemType: 'track',
            itemId: 'track-13',
            position: 0,
            track: {
              id: 'track-13',
              tenantId: '100001',
              artistId: 'artist-4',
              artistName: 'Cloud Nine',
              albumId: 'album-6',
              albumTitle: 'Sky High',
              slug: 'cloud-walker',
              title: 'Cloud Walker',
              durationSeconds: 195,
              status: 'published',
              tags: ['pop', 'uplifting'],
            },
          },
          {
            id: 'item-9',
            itemType: 'track',
            itemId: 'track-14',
            position: 1,
            track: {
              id: 'track-14',
              tenantId: '100001',
              artistId: 'artist-5',
              artistName: 'Midnight Coder',
              slug: 'debugging-dreams',
              title: 'Debugging Dreams',
              durationSeconds: 267,
              status: 'published',
              tags: ['lo-fi', 'chill'],
            },
          },
          {
            id: 'item-10',
            itemType: 'track',
            itemId: 'track-15',
            position: 2,
            track: {
              id: 'track-15',
              tenantId: '100001',
              artistId: 'artist-6',
              artistName: 'Stack Overflow',
              slug: 'recursive-melody',
              title: 'Recursive Melody',
              durationSeconds: 301,
              status: 'published',
              tags: ['experimental', 'electronic'],
            },
          },
        ],
      },
    ];
  }
}

export const musicService = new MusicService();
