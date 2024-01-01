import { BrowserRouter } from "react-router-dom";
import { Router } from "routes/Router";

const App = (): JSX.Element => (
  <BrowserRouter>
    <main>
      <Router />
    </main>
  </BrowserRouter>
);

export default App;
