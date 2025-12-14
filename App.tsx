import React from 'react';
import GameEngine from './components/GameEngine';

const App: React.FC = () => {
  return (
    <div className="w-screen h-screen bg-black overflow-hidden flex items-center justify-center">
      <GameEngine />
    </div>
  );
};

export default App;