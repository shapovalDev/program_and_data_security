import { useState } from "react";
import { decrypt, encrypt } from "./helpers";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";
import { labels } from "./constants";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [stringToEncrypt, setStringToEncrypt] = useState("");
  const [stringToDecrypt, setStringToDecrypt] = useState("");
  const [encryptedData, setEncryptedData] = useState();

  const onChangeHandler = (e, isEncrypt) => {
    isEncrypt
      ? setStringToEncrypt(e.target.value)
      : setStringToDecrypt(e.target.value);
  };
  const onClickHandler = (text, isEncrypt) => {
    if (isEncrypt) {
      const data = encrypt(text);
      setEncryptedData(data);
    } else {
      decrypt(text);
    }
  };

  return (
    <div className="App">
      <h1>Lab 1</h1>
      <div>
        <h2>Encrypt message</h2>
        <input
          value={stringToEncrypt}
          onChange={(e) => onChangeHandler(e, true)}
        />
        <button onClick={() => onClickHandler(stringToEncrypt, true)}>
          Encrypt
        </button>
        <h2>Decrypt message</h2>
        <input
          value={stringToDecrypt}
          onChange={(e) => onChangeHandler(e, false)}
        />
        <button onClick={() => onClickHandler(stringToDecrypt, false)}>
          Decrypt
        </button>
      </div>
      {encryptedData && (
        <Line
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: "top",
              },
              title: {
                display: false,
              },
            },
          }}
          data={{
            labels: labels,
            datasets: [
              {
                label: "Entropy chart",
                data: encryptedData.entropyRounds,
                borderColor: "rgb(255, 99, 132)",
                backgroundColor: "rgba(255, 99, 132, 0.5)",
              },
            ],
          }}
        />
      )}
    </div>
  );
}

export default App;
