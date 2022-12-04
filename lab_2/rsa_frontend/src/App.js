import logo from "./logo.svg";
import { useEffect, useState } from "react";
import { getPublicKey } from "./helpers";
import { Form } from "./components/Form";

function App() {
  const [publicKey, setPublicKey] = useState();
  useEffect(() => {
    const func = async () => {
      setPublicKey(await getPublicKey());
    };
    func();
  }, []);

  return (
    <div className="App">
      <h1 style={{ textAlign: "center", color: "white" }}>RSA </h1>
      {publicKey ? <Form publicKey={publicKey} /> : <h1>Loading...</h1>}
    </div>
  );
}

export default App;
