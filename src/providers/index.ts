import { StoreProvider } from '@/types/store';
import { DemoStoreProvider } from './DemoStoreProvider';
import { LiveStoreProvider } from './LiveStoreProvider';

const demoProvider = new DemoStoreProvider();
const liveProvider = new LiveStoreProvider();

const providers: Record<string, StoreProvider> = {
  demo: demoProvider,
  live: liveProvider,
};

export function getStoreProvider(id: 'demo' | 'live'): StoreProvider {
  return providers[id] || demoProvider;
}

export function getAllStoreProviders(): StoreProvider[] {
  return [demoProvider, liveProvider];
}

export { DemoStoreProvider, LiveStoreProvider, demoProvider, liveProvider };
