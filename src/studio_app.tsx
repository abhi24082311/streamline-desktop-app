import StudioTray from "./components/Global/StudioTray"
import { useEffect } from "react"


function App() {
  useEffect(() => {
    document.body.style.backgroundColor = 'transparent'
    document.documentElement.style.backgroundColor = 'transparent'
  }, [])

  return <StudioTray/>
    
}

export default App
