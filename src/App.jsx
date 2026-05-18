import { useState } from "react";
import "./App.css";

function generateCombinations(items, size) {
  const result = [];

  function backtrack(start, combo) {
    if (combo.length === size) {
      result.push([...combo]);
      return;
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
  const [events, setEvents] = useState([
    { id: 1, name: "Event 1", prediction: "Option A", odd: 1.8 },
    { id: 2, name: "Event 2", prediction: "Option B", odd: 2.1 },
  ]);

  const [stake, setStake] = useState(10);
  const [calculatedCombinations, setCalculatedCombinations] = useState([]);

  const addEvent = () => {
    setEvents([
      ...events,
      {
        id: Date.now(),
        name: "",
        prediction: "",
        odd: 1,
      },
    ]);
  };

  const updateEvent = (id, field, value) => {
    setEvents(
      events.map((event) =>
        event.id === id
          ? {
              ...event,
              [field]: field === "odd" ? Number(value) : value,
            }
          : event
      )
    );
  };

  const removeEvent = (id) => {
    setEvents(events.filter((event) => event.id !== id));
  };

  const calculateAllCombinations = () => {
    const validEvents = events.filter(
      (event) => event.name && event.prediction && Number(event.odd) > 1
    );

    const allCombinations = [];

    for (let size = 1; size <= validEvents.length; size++) {
      allCombinations.push(...generateCombinations(validEvents, size));
    }

    const results = allCombinations.map((combo) => {
      const totalOdd = combo.reduce((acc, event) => acc * Number(event.odd), 1);
      const potentialReturn = stake * totalOdd;
      const netProfit = potentialReturn - stake;
      const returnPercentage = (netProfit / stake) * 100;

      return {
        combo,
        totalOdd,
        potentialReturn,
        netProfit,
        returnPercentage,
        maxLoss: stake,
      };
    });

    setCalculatedCombinations(results);
  };

  const validEvents = events.filter(
    (event) => event.name && event.prediction && Number(event.odd) > 1
  );

  return (
    <div className="app">
      <div className="container">
        <header>
          <h1>Odds Risk Calculator</h1>
          <p>
            Calculator for singles, doubles, triples and every possible
            combination.
          </p>
        </header>

        <section className="card">
          <h2>Settings</h2>

          <div className="settingsGrid">
            <div>
              <label>Amount Per Combination</label>
              <input
                type="number"
                value={stake}
                min="1"
                onChange={(e) => setStake(Number(e.target.value))}
              />
            </div>

            <div className="calculateBox">
              <button className="calculateBtn" onClick={calculateAllCombinations}>
                Calculate
              </button>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="sectionHeader">
            <h2>Events</h2>
            <button onClick={addEvent}>+ Add Event</button>
          </div>

          <div className="eventList">
            {events.map((event) => (
              <div className="eventRow" key={event.id}>
                <input
                  placeholder="Event name"
                  value={event.name}
                  onChange={(e) =>
                    updateEvent(event.id, "name", e.target.value)
                  }
                />

                <input
                  placeholder="Prediction"
                  value={event.prediction}
                  onChange={(e) =>
                    updateEvent(event.id, "prediction", e.target.value)
                  }
                />

                <input
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="Odd"
                  value={event.odd}
                  onChange={(e) =>
                    updateEvent(event.id, "odd", e.target.value)
                  }
                />

                <button
                  className="deleteBtn"
                  onClick={() => removeEvent(event.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h2>Summary</h2>

          <div className="summaryGrid">
            <div>
              <span>Valid Events</span>
              <strong>{validEvents.length}</strong>
            </div>

            <div>
              <span>Total Combinations</span>
              <strong>{calculatedCombinations.length}</strong>
            </div>

            <div>
              <span>Amount Per Combination</span>
              <strong>{stake.toFixed(2)} €</strong>
            </div>

            <div>
              <span>Total Maximum Loss</span>
              <strong>
                {(stake * calculatedCombinations.length).toFixed(2)} €
              </strong>
            </div>
          </div>
        </section>

        <section className="card">
          <h2>Generated Combinations</h2>

          {calculatedCombinations.length === 0 ? (
            <p className="empty">
              Add your events, then click Calculate.
            </p>
          ) : (
            <div className="tableWrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Type</th>
                    <th>Combination</th>
                    <th>Total Odd</th>
                    <th>Return</th>
                    <th>Net Profit</th>
                    <th>Return %</th>
                    <th>Max Loss</th>
                  </tr>
                </thead>

                <tbody>
                  {calculatedCombinations.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>

                      <td>
                        {item.combo.length === 1
                          ? "Single"
                          : `${item.combo.length} Events`}
                      </td>

                      <td>
                        {item.combo.map((event) => (
                          <div key={event.id} className="comboItem">
                            <strong>{event.name}</strong> - {event.prediction}{" "}
                            ({event.odd})
                          </div>
                        ))}
                      </td>

                      <td>{item.totalOdd.toFixed(2)}</td>
                      <td>{item.potentialReturn.toFixed(2)} €</td>
                      <td>{item.netProfit.toFixed(2)} €</td>
                      <td>{item.returnPercentage.toFixed(2)}%</td>
                      <td>{item.maxLoss.toFixed(2)} €</td>
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