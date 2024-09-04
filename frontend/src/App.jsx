import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom'
import Signup from "./pages/Signup"

const App = () => {
  return (
    <Router>
      <div className='App'>
        <Routes>
          <Route path='/register' element={<Signup/>}/>
        </Routes>
      </div>
    </Router>
  )
}

export default App
