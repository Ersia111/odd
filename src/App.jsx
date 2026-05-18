import { useState } from "react";
import "./App.css";

function generateCombinations(items) {
  const result = [];

  function backtrack(start, combo) {
    if (combo.length > 0) {
      result.push([...combo]);
    }

    for (let i = start; i < items.length; i++) {
      combo.push(items[i]);
      backtrack(i + 1, combo);
      combo.pop();
    }
  }

  backtrack(0, []);
  return result;
}

function App() {
  const [eventName, setEventName] = useState("");
  const [prediction, setPrediction] = useState("");
  const [odd, setOdd] = useState("");
  const [stake, setStake] = useState("");

  const [events, setEvents] = useState([]);
  const [results, setResults] = useState([]);

  const addEvent = () => {
    if (!eventName || !prediction || Number(odd) <= 1 || Number(stake) <= 0) {
      alert("Plotëso të gjitha fushat saktë.");
      return;
    }

    const newEvent = {
      id: Date.now(),
      name: eventName,
      prediction,
      odd: Number(odd),
      stake: Number(stake),
    };

    setEvents([...events, newEvent]);
    setEventName("");
    setPrediction("");
    setOdd("");
    setStake("");
  };

  const removeEvent = (id) => {
    setEvents(events.filter((event) => event.id !== id));
    setResults([]);
  };

  const calculateResults = () => {
    if (events.length === 0) {
      alert("Shto të paktën një event.");
      return;
    }

    const allCombinations = generateCombinations(events);

    const calculated = allCombinations.map((combo) => {
      const totalOdd = combo.reduce((acc, item) => acc * item.odd, 1);
      const totalStake = combo.reduce((acc, item) => acc + item.stake, 0);
      const averageStake = totalStake / combo.length;

      const potentialReturn = averageStake * totalOdd;
      const netProfit = potentialReturn - averageStake;
      const maxLoss = averageStake;
      const returnPercentage = (netProfit / averageStake) * 100;

      return {
        combo,
        type: combo.length === 1 ? "Njeshe" : `${combo.length}-she`,
        totalOdd,
        stake: averageStake,
        potentialReturn,
        netProfit,
        maxLoss,
        returnPercentage,
      };
    });

    calculated.sort((a, b) => b.potentialReturn - a.potentialReturn);

    setResults(calculated);
  };

  const totalMaxLoss = results.reduce((acc, item) => acc + item.maxLoss, 0);
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
            BET<span>CALC</span>
          </h1>
          <p>Kalkulator i simulimit të koeficientëve dhe riskut</p>
        </header>

        <section className="section">
          <div className="titleLine">
            <h2>Shto Event</h2>
          </div>

          <div className="formGrid">
            <div>
              <label>Emri i Eventit</label>
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
                placeholder="p.sh. 1X2, 1, X, Over 2.5..."
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
              <label>Shuma për Eventin (€)</label>
              <input
                type="number"
                step="0.01"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                placeholder="p.sh. 50"
              />
            </div>

            <button className="addBtn" onClick={addEvent}>
              + Shto
            </button>
          </div>
        </section>

        <section className="section">
          <div className="titleLine">
            <h2>Eventet e Shtuara</h2>
          </div>

          {events.length === 0 ? (
            <div className="empty">
              <div className="icon">🎯</div>
              <p>Nuk ka evente të shtuara ende.</p>
              <span>Shto eventet tua sipër.</span>
            </div>
          ) : (
            <div className="eventList">
              {events.map((event, index) => (
                <div className="eventCard" key={event.id}>
                  <div>
                    <strong>
                      {index + 1}. {event.name}
                    </strong>
                    <p>{event.prediction}</p>
                  </div>

                  <div className="eventNumbers">
                    <span>Odd: {event.odd}</span>
                    <span>{event.stake.toFixed(2)} €</span>
                  </div>

                  <button onClick={() => removeEvent(event.id)}>Hiq</button>
                </div>
              ))}
            </div>
          )}
        </section>

        <button className="calculateBtn" onClick={calculateResults}>
           Kalkulo Riskun & Fitimin
        </button>

        <section className="summary">
          <div>
            <span>Evente</span>
            <strong>{events.length}</strong>
          </div>

          <div>
            <span>Kombinime Totale</span>
            <strong>{results.length}</strong>
          </div>

          <div>
            <span>Rreziku Maksimal Total</span>
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
            <h2>Të Gjitha Kombinimet e Mundshme</h2>
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
                        {item.combo.map((event) => (
                          <div className="comboItem" key={event.id}>
                            <strong>{event.name}</strong> - {event.prediction}{" "}
                            ({event.odd})
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