// Maps a Firestore print_queue item to the PrintLog shape the Dashboard and
// Tracking views render. Shared so both views derive history identically —
// Tracking used to render only hardcoded mock logs while Dashboard merged
// live data, so the two pages disagreed about the same user's history.
import { PrintLog, QueueItem } from '../types';

export function queueItemToLog(item: QueueItem, id: number): PrintLog {
  return {
    id,
    name: item.name,
    date: item.createdAt ? item.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
    time: item.time || '1h 00m',
    filament: item.filament || '20g',
    // Queue items carry no cost data — the Dashboard mapping used to invent
    // '$0.50' for every live print. Show a dash instead of a made-up figure.
    cost: '—',
    status: item.status === 'completed' ? 'Success' : 'Failed',
  };
}
