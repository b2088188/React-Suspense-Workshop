// Coordinate Suspending components with SuspenseList
// http://localhost:3000/isolated/exercise/07.js

import React, {
  useState,
  lazy,
  Suspense,
  SuspenseList,
  useTransition,
} from 'react'
import '../suspense-list/style-overrides.css'
import * as cn from '../suspense-list/app.module.css'
import Spinner from '../suspense-list/spinner'
import {createResource} from '../utils'
import {fetchUser, PokemonForm, PokemonErrorBoundary} from '../pokemon'

// 💰 this delay function just allows us to make a promise take longer to resolve
// so we can easily play around with the loading time of our code.
const delay = time => promiseResult =>
  new Promise(resolve => setTimeout(() => resolve(promiseResult), time))

// 🐨 feel free to play around with the delay timings.
const NavBar = lazy(() => import('../suspense-list/nav-bar').then(delay(500)))
const LeftNav = lazy(() =>
  import('../suspense-list/left-nav').then(delay(2000)),
)
const MainContent = lazy(() =>
  import('../suspense-list/main-content').then(delay(1500)),
)
const RightNav = lazy(() =>
  import('../suspense-list/right-nav').then(delay(1000)),
)

const fallback = (
  <div className={cn.spinnerContainer}>
    <Spinner />
  </div>
)
const SUSPENSE_CONFIG = {timeoutMs: 4000}

function App() {
  const [startTransition] = useTransition(SUSPENSE_CONFIG)
  const [pokemonResource, setPokemonResource] = useState(null)

  function handleSubmit(pokemonName) {
    startTransition(() => {
      setPokemonResource(createResource(fetchUser(pokemonName)))
    })
  }

  if (!pokemonResource) {
    return (
      <div className='pokemon-info-app'>
        <div
          className={`${cn.root} totally-centered`}
          style={{height: '100vh'}}
        >
          <PokemonForm onSubmit={handleSubmit} />
        </div>
      </div>
    )
  }

  function handleReset() {
    setPokemonResource(null)
  }

  return (
    <div className='pokemon-info-app'>
      <div className={cn.root}>
        <PokemonErrorBoundary
          onReset={handleReset}
          resetKeys={[pokemonResource]}
        >
          <SuspenseList revealOrder='forwards' tail='collapsed'>
            <Suspense fallback={fallback}>
              <NavBar pokemonResource={pokemonResource} />
            </Suspense>
            <div className={cn.mainContentArea}>
              <SuspenseList revealOrder='forwards' tail='collapsed'>
                <Suspense fallback={fallback}>
                  <LeftNav />
                </Suspense>
                <Suspense fallback={fallback}>
                  <MainContent pokemonResource={pokemonResource} />
                </Suspense>
                <Suspense fallback={fallback}>
                  <RightNav pokemonResource={pokemonResource} />
                </Suspense>
              </SuspenseList>
            </div>
          </SuspenseList>
        </PokemonErrorBoundary>
      </div>
    </div>
  )
}

export default App
