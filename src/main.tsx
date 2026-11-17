import { Component, StrictMode, type ErrorInfo, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

interface ErrorBoundaryState {
  error: Error | null
}

class AppErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application render failed.', error, errorInfo)
  }

  render() {
    if (this.state.error) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[#090d16] p-6 text-slate-100">
          <section className="w-full max-w-2xl rounded-xl border border-rose-500/40 bg-slate-900 p-6 shadow-2xl">
            <h1 className="text-xl font-semibold text-rose-300">
              The application could not render
            </h1>
            <p className="mt-3 text-sm text-slate-300">
              A runtime error occurred while displaying the application.
            </p>
            <pre className="mt-4 overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-rose-200">
              {this.state.error.message}
            </pre>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Reload application
            </button>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
)
