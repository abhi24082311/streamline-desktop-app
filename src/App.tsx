import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import ControlLayout from './layouts/ControlLayout'
import AuthButton from './components/Global/AuthButton'
import Widget from './components/Global/Widget'
import { useEffect } from 'react'

const client = new QueryClient()

function App() {
  useEffect(() => {
    document.body.style.backgroundColor = 'transparent'
    document.documentElement.style.backgroundColor = 'transparent'
  }, [])

  return (
    <QueryClientProvider client={client}>
      <ControlLayout>
        <AuthButton />
        <Widget />
      </ControlLayout>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
