import { useState } from "react";
import "./App.css";

function cartesianCombinations(matches) {
  const results = [];

  function backtrack(index, current) {
    if (current.length > 0) {
      results.push([...current]);
    }

    for (let i = index; i < matches.length; i++) {
      for (const option of matches[i].options) {
        current.push({
          matchName: matches[i].name,
          optionName: option.name,
          odd: Number(option.odd),
        });

        backtrack(i + 1, current);
        current.pop();
      }
    }
  }

  backtrack(0, []);
  return results;
}

function App() {
  const [matchName, setMatchName] = useState("");
  const [matches, setMatches] = useState([]);
  const [stake, setStake] = useState(10);
  const [results, setResults] = useState([]);

  const addMatch = () => {
    if (!matchName.trim()) {
      alert("Vendos emrin e ndeshjes.");
      return;
    }

    setMatches([
      ...matches,
      {
        id: Date.now(),
        name: matchName,
        options: [],
      },
    ]);

    setMatchName("");
    setResults([]);
  };

  const removeMatch = (matchId) => {
    setMatches(matches.filter((match) => match.id !== matchId));
    setResults([]);
  };

  const addOption = (matchId) => {
    setMatches(
      matches.map((match) =>
        match.id === matchId
          ? {
              ...match,
              options: [
                ...match.options,
                {
                  id: Date.now(),
                  name: "",
                  odd: "",
                },
              ],
            }
          : match
      )
    );
    setResults([]);
  };

  const updateOption = (matchId, optionId, field, value) => {
    setMatches(
      matches.map((match) =>
        match.id === matchId
          ? {
              ...match,
              options: match.options.map((option) =>
                option.id === optionId
                  ? {
                      ...option,
                      [field]: value,
                    }
                  : option
              ),
            }
          : match
      )
    );
  };

  const removeOption = (matchId, optionId) => {
    setMatches(
      matches.map((match) =>
        match.id === matchId
          ? {
              ...match,
              options: match.options.filter((option) => option.id !== optionId),
            }
          : match
      )
    );
    setResults([]);
  };

  const calculate = () => {
    const cleanMatches = matches
      .map((match) => ({
        ...match,
        options: match.options.filter(
          (option) => option.name.trim() && Number(option.odd) > 1
        ),
      }))
      .filter((match) => match.options.length > 0);

    if (cleanMatches.length === 0) {
      alert("Shto të paktën një ndeshje me opsione të vlefshme.");
      return;
    }

    const combos = cartesianCombinations(cleanMatches);

    const calculated = combos.map((combo) => {
      const totalOdd = combo.reduce((acc, item) => acc * item.odd, 1);
      const potentialReturn = Number(stake) * totalOdd;
      const netProfit = potentialReturn - Number(stake);
      const returnPercentage = (netProfit / Number(stake)) * 100;

      return {
        combo,
        type: combo.length === 1 ? "Njeshe" : `${combo.length}-she`,
        totalOdd,
        stake: Number(stake),
        potentialReturn,
        netProfit,
        maxLoss: Number(stake),
        returnPercentage,
      };
    });

    calculated.sort((a, b) => b.potentialReturn - a.potentialReturn);
    setResults(calculated);
  };

  const totalMaxLoss = results.length * Number(stake);
  const maxProfit =
    results.length > 0 ? Math.max(...results.map((r) => r.netProfit)) : 0;
  const maxReturn =
    results.length > 0 ? Math.max(...results.map((r) => r.potentialReturn)) : 0;

  return (
    <div className="app">
      <div className="container">
        <header>
          <h1>
            Ersia<span>Dashuria</span>
          </h1>
          <p>Simulator kombinimesh me shumë opsione për çdo event</p>
        </header>

        <section className="panel">
          <h2>Settings</h2>

          <div className="topGrid">
            <div>
              <label>Shuma për kombinim</label>
              <input
                type="number"
                min="1"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
              />
            </div>

            <div>
              <label>Emri i ndeshjes</label>
              <input
                value={matchName}
                onChange={(e) => setMatchName(e.target.value)}
                placeholder="p.sh. Match 1"
              />
            </div>

            <button onClick={addMatch}>+ Shto Ndeshje</button>
          </div>
        </section>

        <section className="matches">
          {matches.length === 0 ? (
            <div className="empty">
              <h3>Nuk ka ndeshje ende</h3>
              <p>Shto një ndeshje dhe pastaj vendos opsionet e saj.</p>
            </div>
          ) : (
            matches.map((match, index) => (
              <div className="matchCard" key={match.id}>
                <div className="matchHeader">
                  <h3>
                    {index + 1}. {match.name}
                  </h3>

                  <div>
                    <button onClick={() => addOption(match.id)}>
                      + Opsion
                    </button>

                    <button
                      className="danger"
                      onClick={() => removeMatch(match.id)}
                    >
                      Hiq
                    </button>
                  </div>
                </div>

                {match.options.length === 0 ? (
                  <p className="hint">Shto opsione për këtë ndeshje.</p>
                ) : (
                  match.options.map((option) => (
                    <div className="optionRow" key={option.id}>
                      <input
                        value={option.name}
                        placeholder="Opsioni p.sh. 1, X, 2, Over 2.5"
                        onChange={(e) =>
                          updateOption(
                            match.id,
                            option.id,
                            "name",
                            e.target.value
                          )
                        }
                      />

                      <input
                        type="number"
                        step="0.01"
                        value={option.odd}
                        placeholder="Koef."
                        onChange={(e) =>
                          updateOption(
                            match.id,
                            option.id,
                            "odd",
                            e.target.value
                          )
                        }
                      />

                      <button
                        className="danger"
                        onClick={() => removeOption(match.id, option.id)}
                      >
                        X
                      </button>
                    </div>
                  ))
                )}
              </div>
            ))
          )}
        </section>

        <button className="calculateBtn" onClick={calculate}>
          Kalkulo të gjitha kombinimet
        </button>

        <section className="summary">
          <div>
            <span>Ndeshje</span>
            <strong>{matches.length}</strong>
          </div>

          <div>
            <span>Kombinime</span>
            <strong>{results.length}</strong>
          </div>

          <div>
            <span>Risk maksimal total</span>
            <strong>{totalMaxLoss.toFixed(2)}</strong>
          </div>

          <div>
            <span>Fitim maksimal</span>
            <strong>{maxProfit.toFixed(2)}</strong>
          </div>

          <div>
            <span>Kthim maksimal</span>
            <strong>{maxReturn.toFixed(2)}</strong>
          </div>
        </section>

        <section className="panel">
          <h2>Rezultatet</h2>

          {results.length === 0 ? (
            <p className="hint">Kliko kalkulo për të parë kombinimet.</p>
          ) : (
            <div className="tableWrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Lloji</th>
                    <th>Kombinimi</th>
                    <th>Koef. total</th>
                    <th>Shuma</th>
                    <th>Kthimi</th>
                    <th>Fitimi</th>
                    <th>Risk</th>
                    <th>%</th>
                  </tr>
                </thead>

                <tbody>
                  {results.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.type}</td>
                      <td>
                        {item.combo.map((c, i) => (
                          <div className="comboItem" key={i}>
                            <strong>{c.matchName}</strong>: {c.optionName} (
                            {c.odd})
                          </div>
                        ))}
                      </td>
                      <td>{item.totalOdd.toFixed(2)}</td>
                      <td>{item.stake.toFixed(2)}</td>
                      <td>{item.potentialReturn.toFixed(2)}</td>
                      <td>{item.netProfit.toFixed(2)}</td>
                      <td>{item.maxLoss.toFixed(2)}</td>
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