// Cache resources
// http://localhost:3000/isolated/exercise/04.js

import React, {
  useState,
  useEffect,
  useTransition,
  Suspense,
  createContext,
  useContext,
  useCallback,
  useRef,
} from 'react'
import {
  fetchPokemon,
  PokemonInfoFallback,
  PokemonForm,
  PokemonDataView,
  PokemonErrorBoundary,
} from '../pokemon'
import {createResource} from '../utils'

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

const SUSPENSE_CONFIG = {
  timeoutMs: 4000,
  busyDelayMs: 300,
  busyMinDurationMs: 700,
}

const PokemonResourceCacheContext = createContext()

function PokemonCacheProvider({children, cacheTime = 5000}) {
  let cache = useRef({})
  let expiredTime = useRef({})

  useEffect(() => {
    const inter = setInterval(() => {
      for (let name in expiredTime.current) {
        if (Date.now() > expiredTime.current[name]) {
          delete cache.current[name]
          delete expiredTime.current[name]
        }
      }
    }, 1000)
    return () => clearTimeout(inter)
  }, [])

  function getPokemonResource(pokemonName) {
    const name = pokemonName.toLowerCase()
    expiredTime.current[name] = Date.now() + cacheTime
    if (!cache.current[name]) {
      let resource = createPokemonResource(name)
      cache.current[name] = resource
      return resource
    }
    return cache.current[name]
  }
  getPokemonResource = useCallback(getPokemonResource, [cacheTime])
  const value = {getPokemonResource}
  return (
    <PokemonResourceCacheContext.Provider value={value}>
      {children}
    </PokemonResourceCacheContext.Provider>
  )
}

function usePokemonResourceCache() {
  return useContext(PokemonResourceCacheContext)
}

function createPokemonResource(pokemonName) {
  return createResource(fetchPokemon(pokemonName))
}

function App() {
  const [pokemonName, setPokemonName] = useState('')
  const [startTransition, isPending] = useTransition(SUSPENSE_CONFIG)
  const [pokemonResource, setPokemonResource] = useState(null)
  const {getPokemonResource} = usePokemonResourceCache()
  useEffect(() => {
    if (!pokemonName) {
      setPokemonResource(null)
      return
    }
    startTransition(() => {
      setPokemonResource(getPokemonResource(pokemonName))
    })
  }, [pokemonName, startTransition, getPokemonResource])

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  function handleReset() {
    setPokemonName('')
  }

  return (
    <div className='pokemon-info-app'>
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className={`pokemon-info ${isPending ? 'pokemon-loading' : ''}`}>
        {pokemonResource ? (
          <PokemonErrorBoundary
            onReset={handleReset}
            resetKeys={[pokemonResource]}
          >
            <Suspense fallback={<PokemonInfoFallback name={pokemonName} />}>
              <PokemonInfo pokemonResource={pokemonResource} />
            </Suspense>
          </PokemonErrorBoundary>
        ) : (
          'Submit a pokemon'
        )}
      </div>
    </div>
  )
}

function AppWithProvider() {
  return (
    <PokemonCacheProvider>
      <App />
    </PokemonCacheProvider>
  )
}

export default AppWithProvider
