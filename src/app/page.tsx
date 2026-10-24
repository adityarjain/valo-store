import { StoreContextProvider } from '@/context/StoreContext';
import { StoreViewerApp } from '@/components/StoreViewerApp';

export default function Home() {
  return (
    <StoreContextProvider>
      <StoreViewerApp />
    </StoreContextProvider>
  );
}
