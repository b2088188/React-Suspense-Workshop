// Simple Data-fetching
// http://localhost:3000/isolated/exercise/01.js

import React, {Suspense} from 'react'
import {
  PokemonDataView,
  fetchPokemon,
  PokemonErrorBoundary,
  PokemonInfoFallback,
} from '../pokemon'
import {createResource} from 'utils'

// fetchPokemon(pokemonName).then(handleSuccess, handleFailure)

const resource = createResource(fetchPokemon('pikachu'))

function PokemonInfo() {
  const pokemon = resource.read()
  return (
    <div>
      <div className='pokemon-info__img-wrapper'>
        <img src={pokemon.image} alt={pokemon.name} />
      </div>
      <PokemonDataView pokemon={pokemon} />
    </div>
  )
}

function App() {
  return (
    <div className='pokemon-info-app'>
      <div className='pokemon-info'>
        <Suspense fallback={<PokemonInfoFallback />}>
          <PokemonErrorBoundary>
            <PokemonInfo />
          </PokemonErrorBoundary>
        </Suspense>
      </div>
    </div>
  )
}

export default App
