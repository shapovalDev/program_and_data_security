import axios from "axios";
import { useState } from "react";

import "./App.css";

function App() {
  const [file, setFile] = useState("");
  const [fetchedData, setFetchedData] = useState(null);

  return (
    <div className="App">
      <h1>Lab 3</h1>
      <div>
        <input
          type="file"
          name="file"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button
          onClick={async (e) => {
            console.log(`here`);
            e.preventDefault();
            const formData = new FormData();
            formData.append("file", file);
            const res = await axios.post(
              "http://localhost:8081/upload",
              formData,
              {
                headers: { "Content-Type": "multipart/form-data" },
              }
            );
            console.log(res.data);
            setFetchedData(res.data);
          }}
        >
          Upload
        </button>
      </div>
      {fetchedData && (
        <div
          style={{
            width: "80vw",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            marginTop: 40,
          }}
        >
          <div>
            <h3>Initial bits</h3>
            <p>2 bits: {fetchedData.initialLastBits[0]}</p>
            <p>4 bits: {fetchedData.initialLastBits[1]}</p>
            <p>8 bits: {fetchedData.initialLastBits[2]}</p>
          </div>
          <div>
            <h3>Iterations</h3>
            <p>for 2 bits: {fetchedData.iterations[0]}</p>
            <p>for 4 bits: {fetchedData.iterations[1]}</p>
            <p>for 8 bits: {fetchedData.iterations[2]}</p>
          </div>
          <div>
            <h3>Final bits</h3>
            <p>for 2 bits: {fetchedData.finalBits[0]}</p>
            <p>for 4 bits: {fetchedData.finalBits[1]}</p>
            <p>for 8 bits: {fetchedData.finalBits[2]}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
