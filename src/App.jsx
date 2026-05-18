import { useState } from "react";
import "./App.css";

function generateMatchCombinations(matchGroups) {
  const results = [];

  function backtrack(index, currentCombo) {
    if (currentCombo.length > 0) {
      results.push([...currentCombo]);
    }

    for (let i = index; i < matchGroups.length; i++) {
      for (const option of matchGroups[i].options) {
        currentCombo.push({
          matchName: matchGroups[i].matchName,
          prediction: option.prediction,
          odd: option.odd,
        });

        backtrack(i + 1, currentCombo);
        currentCombo.pop();
      }
    }
  }

  backtrack(0, []);
  return results;
}

function App() {
  const [eventName, setEventName] = useState("");
  const [prediction, setPrediction] = useState("");
  const [odd, setOdd] = useState("");
  const [stake, setStake] = useState(10);

  const [events, setEvents] = useState([]);
  const [results, setResults] = useState([]);

  const addEvent = () => {
    if (!eventName.trim() || !prediction.trim() || Number(odd) <= 1) {
      alert("Plotëso ndeshjen, rezultatin dhe koeficientin saktë.");
      return;
    }

    const newEvent = {
      id: Date.now(),
      matchName: eventName.trim(),
      prediction: prediction.trim(),
      odd: Number(odd),
    };

    setEvents([...events, newEvent]);
    setEventName("");
    setPrediction("");
    setOdd("");
    setResults([]);
  };

  const removeEvent = (id) => {
    setEvents(events.filter((event) => event.id !== id));
    setResults([]);
  };

  const calculateResults = () => {
    if (events.length === 0) {
      alert("Shto të paktën një ndeshje me rezultat dhe koeficient.");
      return;
    }

    const groupedMatches = Object.values(
      events.reduce((acc, event) => {
        if (!acc[event.matchName]) {
          acc[event.matchName] = {
            matchName: event.matchName,
            options: [],
          };
        }

        acc[event.matchName].options.push({
          prediction: event.prediction,
          odd: event.odd,
        });

        return acc;
      }, {})
    );

    const allCombinations = generateMatchCombinations(groupedMatches);

    const calculated = allCombinations.map((combo) => {
      const totalOdd = combo.reduce((acc, item) => acc * item.odd, 1);
      const potentialReturn = Number(stake) * totalOdd;
      const netProfit = potentialReturn - Number(stake);
      const maxLoss = Number(stake);
      const returnPercentage = (netProfit / Number(stake)) * 100;

      return {
        combo,
        type: combo.length === 1 ? "Njeshe" : `${combo.length}-she`,
        totalOdd,
        stake: Number(stake),
        potentialReturn,
        netProfit,
        maxLoss,
        returnPercentage,
      };
    });

    calculated.sort((a, b) => b.potentialReturn - a.potentialReturn);
    setResults(calculated);
  };

  const totalMaxLoss = results.length * Number(stake);

  const maxPossibleProfit =
    results.length > 0 ? Math.max(...results.map((item) => item.netProfit)) : 0;

  const maxPossibleReturn =
    results.length > 0
      ? Math.max(...results.map((item) => item.potentialReturn))
      : 0;

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>
            ERSIA<span>DASHURIA</span>
          </h1>
          <p>Kalkulator kombinimesh, koeficientësh dhe risku</p>
        </header>

        <section className="section">
          <div className="titleLine">
            <h2>Shto Rezultat</h2>
          </div>

          <div className="formGrid">
            <div>
              <label>Ndeshja</label>
              <input
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="p.sh. Real Madrid vs Barcelona"
              />
            </div>

            <div>
              <label>Rezultati / Opsioni</label>
              <input
                value={prediction}
                onChange={(e) => setPrediction(e.target.value)}
                placeholder="p.sh. 1, X, 2, Over 2.5"
              />
            </div>

            <div>
              <label>Koeficienti</label>
              <input
                type="number"
                step="0.01"
                value={odd}
                onChange={(e) => setOdd(e.target.value)}
                placeholder="p.sh. 2.50"
              />
            </div>

            <div>
              <label>Shuma për Kombinim (€)</label>
              <input
                type="number"
                step="0.01"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                placeholder="p.sh. 10"
              />
            </div>

            <button className="addBtn" onClick={addEvent}>
              + Shto
            </button>
          </div>
        </section>

        <section className="section">
          <div className="titleLine">
            <h2>Rezultatet e Shtuara</h2>
          </div>

          {events.length === 0 ? (
            <div className="empty">
              <div className="icon">🎯</div>
              <p>Nuk ka rezultate të shtuara ende.</p>
              <span>Shto ndeshjen, rezultatin dhe koeficientin.</span>
            </div>
          ) : (
            <div className="eventList">
              {events.map((event, index) => (
                <div className="eventCard" key={event.id}>
                  <div>
                    <strong>
                      {index + 1}. {event.matchName}
                    </strong>
                    <p>{event.prediction}</p>
                  </div>

                  <div className="eventNumbers">
                    <span>Odd: {event.odd}</span>
                  </div>

                  <button onClick={() => removeEvent(event.id)}>Hiq</button>
                </div>
              ))}
            </div>
          )}
        </section>

        <button className="calculateBtn" onClick={calculateResults}>
          Kalkulo Kombinimet
        </button>

        <section className="summary">
          <div>
            <span>Rezultate</span>
            <strong>{events.length}</strong>
          </div>

          <div>
            <span>Kombinime Totale</span>
            <strong>{results.length}</strong>
          </div>

          <div>
            <span>Humbja Maksimale</span>
            <strong>{totalMaxLoss.toFixed(2)} €</strong>
          </div>

          <div>
            <span>Fitimi Maksimal</span>
            <strong>{maxPossibleProfit.toFixed(2)} €</strong>
          </div>

          <div>
            <span>Kthimi Maksimal</span>
            <strong>{maxPossibleReturn.toFixed(2)} €</strong>
          </div>
        </section>

        <section className="section">
          <div className="titleLine">
            <h2>Të Gjitha Kombinimet</h2>
          </div>

          {results.length === 0 ? (
            <p className="noResults">Kliko “Kalkulo” për të parë rezultatet.</p>
          ) : (
            <div className="tableWrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Lloji</th>
                    <th>Kombinimi</th>
                    <th>Odd Total</th>
                    <th>Shuma</th>
                    <th>Kthimi</th>
                    <th>Fitimi Neto</th>
                    <th>Risk Max</th>
                    <th>%</th>
                  </tr>
                </thead>

                <tbody>
                  {results.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.type}</td>
                      <td>
                        {item.combo.map((event, i) => (
                          <div className="comboItem" key={i}>
                            <strong>{event.matchName}</strong> -{" "}
                            {event.prediction} ({event.odd})
                          </div>
                        ))}
                      </td>
                      <td>{item.totalOdd.toFixed(2)}</td>
                      <td>{item.stake.toFixed(2)} €</td>
                      <td>{item.potentialReturn.toFixed(2)} €</td>
                      <td>{item.netProfit.toFixed(2)} €</td>
                      <td>{item.maxLoss.toFixed(2)} €</td>
                      <td>{item.returnPercentage.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;