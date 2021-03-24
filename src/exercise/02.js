// Render as you fetch
// http://localhost:3000/isolated/exercise/02.js

import React, {useState, useEffect, useReducer, Suspense} from 'react'
import {
  fetchPokemon,
  PokemonInfoFallback,
  PokemonForm,
  PokemonDataView,
  PokemonErrorBoundary,
} from '../pokemon'
import {createResource} from 'utils'

function PokemonInfo({pokemonResource}) {
  const pokemon = pokemonResource.read()

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
  const [pokemonName, setPokemonName] = useState('')
  const [pokemonResource, setPokemonResource] = useState(null)

  useEffect(() => {
    if (!pokemonName) return setPokemonResource(null)
    setPokemonResource(createResource(fetchPokemon(pokemonName)))
  }, [pokemonName])

  function handleReset() {
    setPokemonName('')
  }

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  return (
    <div className='pokemon-info-app'>
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className='pokemon-info'>
        {pokemonResource ? (
          <Suspense fallback={<PokemonInfoFallback />}>
            <PokemonErrorBoundary
              onReset={handleReset}
              resetKeys={[pokemonName]}
            >
              <PokemonInfo pokemonResource={pokemonResource} />
            </PokemonErrorBoundary>
          </Suspense>
        ) : (
          'Submit a pokemon'
        )}
      </div>
    </div>
  )
}

export default App
