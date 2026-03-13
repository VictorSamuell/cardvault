import SearchPage from './pages/SearchPage.tsx' 
import CollectionPage from './pages/CollectionPage.tsx'
import { useState } from "react"
import './App.css'

function App() {

  const [page, setPage] = useState("search")

  return(
    <div>
      <nav className='main-nav'>

        <button onClick={() => setPage("search")}>
            Buscar
        </button>

        <button onClick={() => setPage("collection")}>
            Coleção
        </button>


      </nav>

      {page == "search" && <SearchPage />}
      {page === "collection" && <CollectionPage />}


    </div>



  )
}

export default App
