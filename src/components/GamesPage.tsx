
import React from 'react';
import PokemonCardGame from './PokemonCardGame';

const GamesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <PokemonCardGame />
      </div>
    </div>
  );
};

export default GamesPage;
