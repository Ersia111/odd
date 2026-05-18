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
  const [page, setPage] = useState("calculator");

  const [eventName, setEventName] = useState("");
  const [prediction, setPrediction] = useState("");
  const [odd, setOdd] = useState("");
  const [totalBudget, setTotalBudget] = useState(1000);

  const [winChance, setWinChance] = useState(30);
  const [targetProfit, setTargetProfit] = useState(1000);
  const [lossChance, setLossChance] = useState(70);
  const [expectedLoss, setExpectedLoss] = useState(200);

  const [events, setEvents] = useState([]);
  const [results, setResults] = useState([]);

  const addEvent = () => {
    if (!eventName.trim() || !prediction.trim() || Number(odd) <= 1) {
      alert("Plotëso ndeshjen, rezultatin dhe koeficientin saktë.");
      return;
    }

    setEvents([
      ...events,
      {
        id: Date.now(),
        matchName: eventName.trim(),
        prediction: prediction.trim(),
        odd: Number(odd),
      },
    ]);

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
      alert("Shto të paktën një rezultat.");
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
    const amountPerCombination =
      allCombinations.length > 0 ? Number(totalBudget) / allCombinations.length : 0;

    const calculated = allCombinations.map((combo) => {
      const totalOdd = combo.reduce((acc, item) => acc * item.odd, 1);
      const potentialReturn = amountPerCombination * totalOdd;
      const netProfit = potentialReturn - amountPerCombination;
      const returnPercentage = (netProfit / amountPerCombination) * 100;

      return {
        combo,
        type: combo.length === 1 ? "Njeshe" : `${combo.length}-she`,
        totalOdd,
        stake: amountPerCombination,
        potentialReturn,
        netProfit,
        maxLoss: amountPerCombination,
        returnPercentage,
      };
    });

    calculated.sort((a, b) => b.potentialReturn - a.potentialReturn);
    setResults(calculated);
  };

  const totalCombinations = results.length;
  const amountPerCombination =
    totalCombinations > 0 ? Number(totalBudget) / totalCombinations : 0;

  const maximumLoss = Number(totalBudget);

  const highestPossibleReturn =
    results.length > 0 ? Math.max(...results.map((item) => item.potentialReturn)) : 0;

  const highestNetProfit =
    results.length > 0 ? Math.max(...results.map((item) => item.netProfit)) : 0;

  const breakEvenPoint = Number(totalBudget);

  const expectedValue =
    (Number(winChance) / 100) * Number(targetProfit) -
    (Number(lossChance) / 100) * Number(expectedLoss);

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>
            ERSIA<span>DASHURIA</span>
          </h1>
          <p>Risk simulator & combination dashboard</p>
        </header>

        <div className="tabs">
          <button
            className={page === "calculator" ? "activeTab" : ""}
            onClick={() => setPage("calculator")}
          >
            Calculator
          </button>

          <button
            className={page === "analysis" ? "activeTab" : ""}
            onClick={() => setPage("analysis")}
          >
            Analysis Dashboard
          </button>
        </div>

        {page === "calculator" && (
          <>
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
                  <label>Total Budget (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(Number(e.target.value))}
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
                <span>Total Budget</span>
                <strong>{Number(totalBudget).toFixed(2)} €</strong>
              </div>

              <div>
                <span>Kombinime</span>
                <strong>{totalCombinations}</strong>
              </div>

              <div>
                <span>Shuma për Kombinim</span>
                <strong>{amountPerCombination.toFixed(2)} €</strong>
              </div>

              <div>
                <span>Humbja Maksimale</span>
                <strong>{maximumLoss.toFixed(2)} €</strong>
              </div>

              <div>
                <span>Fitimi Maksimal</span>
                <strong>{highestNetProfit.toFixed(2)} €</strong>
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
          </>
        )}

        {page === "analysis" && (
          <>
            <section className="section">
              <div className="titleLine">
                <h2>Analysis Dashboard</h2>
              </div>

              <div className="analysisGrid">
                <div className="analysisCard">
                  <span>Total Budget</span>
                  <strong>{Number(totalBudget).toFixed(2)} €</strong>
                </div>

                <div className="analysisCard">
                  <span>Total Combinations</span>
                  <strong>{totalCombinations}</strong>
                </div>

                <div className="analysisCard">
                  <span>Amount Per Combination</span>
                  <strong>{amountPerCombination.toFixed(2)} €</strong>
                </div>

                <div className="analysisCard dangerCard">
                  <span>Maximum Loss</span>
                  <strong>{maximumLoss.toFixed(2)} €</strong>
                </div>

                <div className="analysisCard">
                  <span>Highest Possible Return</span>
                  <strong>{highestPossibleReturn.toFixed(2)} €</strong>
                </div>

                <div className="analysisCard">
                  <span>Highest Net Profit</span>
                  <strong>{highestNetProfit.toFixed(2)} €</strong>
                </div>

                <div className="analysisCard">
                  <span>Worst Case Scenario</span>
                  <strong>-{maximumLoss.toFixed(2)} €</strong>
                </div>

                <div className="analysisCard">
                  <span>Best Case Scenario</span>
                  <strong>+{highestNetProfit.toFixed(2)} €</strong>
                </div>

                <div className="analysisCard">
                  <span>Break-even Point</span>
                  <strong>{breakEvenPoint.toFixed(2)} €</strong>
                </div>
              </div>
            </section>

            <section className="section">
              <div className="titleLine">
                <h2>Manual Probability Scenario</h2>
              </div>

              <div className="scenarioGrid">
                <div>
                  <label>Win Chance %</label>
                  <input
                    type="number"
                    value={winChance}
                    onChange={(e) => setWinChance(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label>Target Profit €</label>
                  <input
                    type="number"
                    value={targetProfit}
                    onChange={(e) => setTargetProfit(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label>Loss Chance %</label>
                  <input
                    type="number"
                    value={lossChance}
                    onChange={(e) => setLossChance(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label>Expected Loss €</label>
                  <input
                    type="number"
                    value={expectedLoss}
                    onChange={(e) => setExpectedLoss(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="scenarioResult">
                <h3>Scenario Result</h3>
                <p>
                  {winChance}% scenario: +{Number(targetProfit).toFixed(2)} €
                </p>
                <p>
                  {lossChance}% scenario: -{Number(expectedLoss).toFixed(2)} €
                </p>
                <strong>
                  Expected Value: {expectedValue.toFixed(2)} €
                </strong>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default App;