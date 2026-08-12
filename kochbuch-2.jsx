import React, { useState, useEffect, useCallback } from "react";
import { ChefHat, Plus, Minus, Trash2, Search, X, Clock, ArrowLeft, Users, Flame } from "lucide-react";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,500&family=Public+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
`;

const SEED_RECIPES = [
  {
    id: "seed-1",
    name: "Kartoffelsalat",
    time: 40,
    baseServings: 4,
    ingredients: [
      { id: "i1", name: "festkochende Kartoffeln", amount: 1, unit: "kg" },
      { id: "i2", name: "Gemüsebrühe", amount: 250, unit: "ml" },
      { id: "i3", name: "Essig", amount: 3, unit: "EL" },
      { id: "i4", name: "Senf", amount: 1, unit: "EL" },
      { id: "i5", name: "Speiseöl", amount: 6, unit: "EL" },
      { id: "i6", name: "Zwiebeln", amount: 2, unit: "Stück" },
      { id: "i7", name: "Salz", amount: 1, unit: "TL" },
      { id: "i8", name: "Pfeffer", amount: 0.5, unit: "TL" },
    ],
    steps: [
      "Kartoffeln waschen und in der Schale ca. 20 Minuten kochen.",
      "Kartoffeln pellen, noch warm in Scheiben schneiden.",
      "Zwiebeln fein würfeln und mit heißer Brühe über die Kartoffeln geben.",
      "Essig, Senf, Öl, Salz und Pfeffer einrühren und alles vermengen.",
      "Mindestens 30 Minuten ziehen lassen, vor dem Servieren abschmecken.",
    ],
  },
  {
    id: "seed-2",
    name: "Rinder-Gulasch",
    time: 150,
    baseServings: 4,
    ingredients: [
      { id: "i1", name: "Rindfleisch, Gulaschstücke", amount: 800, unit: "g" },
      { id: "i2", name: "Zwiebeln", amount: 3, unit: "Stück" },
      { id: "i3", name: "Paprikaschoten", amount: 2, unit: "Stück" },
      { id: "i4", name: "Tomatenmark", amount: 2, unit: "EL" },
      { id: "i5", name: "Paprikapulver edelsüß", amount: 2, unit: "EL" },
      { id: "i6", name: "Rinderbrühe", amount: 500, unit: "ml" },
      { id: "i7", name: "Knoblauchzehen", amount: 2, unit: "Stück" },
      { id: "i8", name: "Speiseöl", amount: 3, unit: "EL" },
    ],
    steps: [
      "Fleisch portionsweise scharf anbraten und herausnehmen.",
      "Zwiebeln im Bratfett glasig dünsten, Tomatenmark und Paprikapulver kurz mitrösten.",
      "Fleisch zurückgeben, mit Brühe ablöschen.",
      "Knoblauch und Paprikaschoten zugeben, zugedeckt ca. 2 Stunden schmoren.",
      "Abschmecken und mit Brot oder Knödeln servieren.",
    ],
  },
  {
    id: "seed-3",
    name: "Pfannkuchen",
    time: 25,
    baseServings: 4,
    ingredients: [
      { id: "i1", name: "Mehl", amount: 250, unit: "g" },
      { id: "i2", name: "Milch", amount: 500, unit: "ml" },
      { id: "i3", name: "Eier", amount: 3, unit: "Stück" },
      { id: "i4", name: "Salz", amount: 0.25, unit: "TL" },
      { id: "i5", name: "Butter zum Braten", amount: 2, unit: "EL" },
    ],
    steps: [
      "Mehl, Milch, Eier und Salz zu einem glatten Teig verrühren.",
      "Teig 10 Minuten ruhen lassen.",
      "Butter in einer Pfanne erhitzen, dünn Teig eingießen und von beiden Seiten goldbraun backen.",
    ],
  },
];

function formatAmount(n) {
  if (!isFinite(n)) return "0";
  const rounded = Math.round(n * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  return rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function scaleFactor(current, base) {
  if (!base) return 1;
  return current / base;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function Kochbuch() {
  const [recipes, setRecipes] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("list"); // list | detail | add
  const [activeId, setActiveId] = useState(null);
  const [servings, setServings] = useState({});
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  // load
  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("recipes", false);
        if (res && res.value) {
          const parsed = JSON.parse(res.value);
          setRecipes(parsed);
        } else {
          setRecipes(SEED_RECIPES);
          await window.storage.set("recipes", JSON.stringify(SEED_RECIPES), false);
        }
      } catch (e) {
        setRecipes(SEED_RECIPES);
        try {
          await window.storage.set("recipes", JSON.stringify(SEED_RECIPES), false);
        } catch (_) {}
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const persist = useCallback(async (next) => {
    try {
      const result = await window.storage.set("recipes", JSON.stringify(next), false);
      if (!result) setError("Speichern fehlgeschlagen.");
      else setError("");
    } catch (e) {
      setError("Speichern fehlgeschlagen.");
    }
  }, []);

  const active = recipes.find((r) => r.id === activeId) || null;
  const currentServings = active ? servings[active.id] ?? active.baseServings : 1;
  const factor = active ? scaleFactor(currentServings, active.baseServings) : 1;

  function openRecipe(id) {
    setActiveId(id);
    setView("detail");
  }

  function setServingsFor(id, val) {
    setServings((s) => ({ ...s, [id]: Math.max(1, val) }));
  }

  function deleteRecipe(id) {
    const next = recipes.filter((r) => r.id !== id);
    setRecipes(next);
    persist(next);
    setView("list");
  }

  function addRecipe(recipe) {
    const next = [...recipes, recipe];
    setRecipes(next);
    persist(next);
    setView("list");
  }

  const filtered = recipes.filter((r) =>
    r.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ background: "#211F1C", minHeight: "100vh", color: "#F2EDE4", fontFamily: "'Public Sans', sans-serif" }}>
      <style>{FONTS}</style>
      <style>{`
        .disp { font-family: 'Fraunces', serif; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        ::selection { background: #D2601A; color: #211F1C; }
        button:focus-visible, input:focus-visible { outline: 2px solid #8CA86E; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
      `}</style>

      {!loaded ? (
        <div style={{ padding: 24, opacity: 0.6 }}>Lade Rezepte…</div>
      ) : view === "list" ? (
        <ListView
          recipes={filtered}
          query={query}
          setQuery={setQuery}
          onOpen={openRecipe}
          onAdd={() => setView("add")}
          error={error}
        />
      ) : view === "detail" && active ? (
        <DetailView
          recipe={active}
          servings={currentServings}
          factor={factor}
          onServings={(v) => setServingsFor(active.id, v)}
          onBack={() => setView("list")}
          onDelete={() => deleteRecipe(active.id)}
        />
      ) : view === "add" ? (
        <AddView onSave={addRecipe} onCancel={() => setView("list")} />
      ) : null}
    </div>
  );
}

function ListView({ recipes, query, setQuery, onOpen, onAdd, error }) {
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 18px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <ChefHat size={26} color="#D2601A" />
        <h1 className="disp" style={{ fontSize: 30, fontWeight: 700, margin: 0 }}>Kochbuch</h1>
      </div>
      <p style={{ color: "#A79C8C", margin: "4px 0 20px", fontSize: 14 }}>
        {recipes.length} {recipes.length === 1 ? "Rezept" : "Rezepte"} · Portionen live berechnen
      </p>

      <div style={{ position: "relative", marginBottom: 18 }}>
        <Search size={16} color="#A79C8C" style={{ position: "absolute", left: 14, top: 13 }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rezept suchen…"
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: "#2B2823",
            border: "1px solid #47423A",
            borderRadius: 10,
            padding: "12px 14px 12px 38px",
            color: "#F2EDE4",
            fontSize: 15,
          }}
        />
      </div>

      {error && (
        <div style={{ background: "#3a2420", border: "1px solid #D2601A", borderRadius: 8, padding: 10, marginBottom: 14, fontSize: 13, color: "#F2C9A8" }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {recipes.length === 0 && (
          <div style={{ color: "#A79C8C", fontSize: 14, padding: "24px 0", textAlign: "center" }}>
            Kein Rezept gefunden. Leg eins an.
          </div>
        )}
        {recipes.map((r) => (
          <button
            key={r.id}
            onClick={() => onOpen(r.id)}
            style={{
              textAlign: "left",
              background: "#2B2823",
              border: "1px solid #47423A",
              borderRadius: 12,
              padding: "16px 16px",
              cursor: "pointer",
              color: "#F2EDE4",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div className="disp" style={{ fontSize: 19, fontWeight: 600 }}>{r.name}</div>
              <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 12.5, color: "#A79C8C" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={13} /> {r.time} Min.
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Users size={13} /> {r.baseServings} Portionen
                </span>
              </div>
            </div>
            <span className="mono" style={{ color: "#8CA86E", fontSize: 13 }}>{r.ingredients.length} Zutaten</span>
          </button>
        ))}
      </div>

      <button
        onClick={onAdd}
        style={{
          position: "fixed",
          bottom: 24,
          right: "50%",
          transform: "translateX(320px)",
          maxWidth: 640,
          background: "#D2601A",
          color: "#211F1C",
          border: "none",
          borderRadius: 999,
          width: 54,
          height: 54,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 20px rgba(210,96,26,0.4)",
          cursor: "pointer",
        }}
        aria-label="Neues Rezept"
      >
        <Plus size={24} />
      </button>
      {/* fallback fixed button position for narrow screens */}
      <style>{`
        @media (max-width: 700px) {
          button[aria-label="Neues Rezept"] { right: 20px !important; transform: none !important; }
        }
      `}</style>
    </div>
  );
}

function DetailView({ recipe, servings, factor, onServings, onBack, onDelete }) {
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 18px 60px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <button onClick={onBack} style={backBtn}>
          <ArrowLeft size={16} /> Zurück
        </button>
        <button onClick={onDelete} style={{ ...backBtn, color: "#D2601A" }}>
          <Trash2 size={16} /> Löschen
        </button>
      </div>

      <h1 className="disp" style={{ fontSize: 30, fontWeight: 700, margin: "0 0 6px" }}>{recipe.name}</h1>
      <div style={{ display: "flex", gap: 16, color: "#A79C8C", fontSize: 13, marginBottom: 22 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={14} /> {recipe.time} Minuten</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Flame size={14} /> {recipe.ingredients.length} Zutaten</span>
      </div>

      {/* Signature element: portion dial */}
      <div style={{
        background: "#2B2823",
        border: "1px solid #47423A",
        borderRadius: 16,
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24,
      }}>
        <div>
          <div style={{ fontSize: 12, color: "#A79C8C", letterSpacing: 0.5, textTransform: "uppercase" }}>Portionen</div>
          <div className="mono" style={{ fontSize: 34, fontWeight: 600, color: "#F2EDE4", lineHeight: 1.1 }}>{servings}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <DialButton onClick={() => onServings(servings - 1)} icon={<Minus size={20} />} />
          <DialButton onClick={() => onServings(servings + 1)} icon={<Plus size={20} />} accent />
        </div>
      </div>

      <h2 className="disp" style={{ fontSize: 19, fontWeight: 600, margin: "0 0 10px" }}>Zutaten</h2>
      <div style={{ marginBottom: 26 }}>
        {recipe.ingredients.map((ing) => (
          <div key={ing.id} style={{
            display: "flex", justifyContent: "space-between", alignItems: "baseline",
            padding: "9px 0", borderBottom: "1px solid #3A362F",
          }}>
            <span style={{ fontSize: 15 }}>{ing.name}</span>
            <span className="mono" style={{ fontSize: 14, color: "#8CA86E", whiteSpace: "nowrap", marginLeft: 12 }}>
              {formatAmount(ing.amount * factor)} {ing.unit}
            </span>
          </div>
        ))}
      </div>

      <h2 className="disp" style={{ fontSize: 19, fontWeight: 600, margin: "0 0 10px" }}>Zubereitung</h2>
      <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {recipe.steps.map((step, i) => (
          <li key={i} style={{ display: "flex", gap: 14, marginBottom: 16 }}>
            <span className="mono" style={{
              flexShrink: 0, width: 26, height: 26, borderRadius: "50%",
              background: "#3A362F", color: "#D2601A", fontSize: 13,
              display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600,
            }}>{i + 1}</span>
            <span style={{ fontSize: 14.5, lineHeight: 1.55, paddingTop: 2 }}>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

const backBtn = {
  background: "none",
  border: "none",
  color: "#A79C8C",
  fontSize: 14,
  display: "flex",
  alignItems: "center",
  gap: 6,
  cursor: "pointer",
  padding: "6px 4px",
};

function DialButton({ onClick, icon, accent }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        border: accent ? "none" : "1px solid #47423A",
        background: accent ? "#D2601A" : "transparent",
        color: accent ? "#211F1C" : "#F2EDE4",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      {icon}
    </button>
  );
}

function AddView({ onSave, onCancel }) {
  const [name, setName] = useState("");
  const [time, setTime] = useState(30);
  const [baseServings, setBaseServings] = useState(4);
  const [ingredients, setIngredients] = useState([{ id: uid(), name: "", amount: "", unit: "g" }]);
  const [steps, setSteps] = useState([""]);

  function updateIng(id, field, val) {
    setIngredients((list) => list.map((i) => (i.id === id ? { ...i, [field]: val } : i)));
  }
  function removeIng(id) {
    setIngredients((list) => list.filter((i) => i.id !== id));
  }
  function updateStep(idx, val) {
    setSteps((list) => list.map((s, i) => (i === idx ? val : s)));
  }
  function removeStep(idx) {
    setSteps((list) => list.filter((_, i) => i !== idx));
  }

  function canSave() {
    return name.trim() && ingredients.some((i) => i.name.trim() && i.amount !== "") && steps.some((s) => s.trim());
  }

  function handleSave() {
    const recipe = {
      id: uid(),
      name: name.trim(),
      time: Number(time) || 0,
      baseServings: Math.max(1, Number(baseServings) || 1),
      ingredients: ingredients
        .filter((i) => i.name.trim() && i.amount !== "")
        .map((i) => ({ id: i.id, name: i.name.trim(), amount: Number(i.amount), unit: i.unit })),
      steps: steps.filter((s) => s.trim()).map((s) => s.trim()),
    };
    onSave(recipe);
  }

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    background: "#2B2823",
    border: "1px solid #47423A",
    borderRadius: 8,
    padding: "10px 12px",
    color: "#F2EDE4",
    fontSize: 14.5,
  };
  const label = { fontSize: 12, color: "#A79C8C", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, display: "block" };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 18px 60px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <button onClick={onCancel} style={backBtn}><X size={16} /> Abbrechen</button>
      </div>
      <h1 className="disp" style={{ fontSize: 26, fontWeight: 700, margin: "0 0 20px" }}>Neues Rezept</h1>

      <label style={label}>Name</label>
      <input style={{ ...inputStyle, marginBottom: 14 }} value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Linsensuppe" />

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <label style={label}>Zeit (Min.)</label>
          <input style={inputStyle} type="number" min="0" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={label}>Grundportionen</label>
          <input style={inputStyle} type="number" min="1" value={baseServings} onChange={(e) => setBaseServings(e.target.value)} />
        </div>
      </div>

      <label style={label}>Zutaten</label>
      {ingredients.map((ing) => (
        <div key={ing.id} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input style={{ ...inputStyle, flex: 3 }} placeholder="Zutat" value={ing.name} onChange={(e) => updateIng(ing.id, "name", e.target.value)} />
          <input style={{ ...inputStyle, flex: 1 }} placeholder="Menge" type="number" value={ing.amount} onChange={(e) => updateIng(ing.id, "amount", e.target.value)} />
          <select style={{ ...inputStyle, flex: 1 }} value={ing.unit} onChange={(e) => updateIng(ing.id, "unit", e.target.value)}>
            {["g", "kg", "ml", "l", "EL", "TL", "Stück", "Prise"].map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
          <button onClick={() => removeIng(ing.id)} style={{ background: "none", border: "none", color: "#A79C8C", cursor: "pointer" }}><X size={18} /></button>
        </div>
      ))}
      <button
        onClick={() => setIngredients((l) => [...l, { id: uid(), name: "", amount: "", unit: "g" }])}
        style={{ ...backBtn, color: "#8CA86E", marginBottom: 20 }}
      >
        <Plus size={14} /> Zutat hinzufügen
      </button>

      <label style={label}>Zubereitung</label>
      {steps.map((step, idx) => (
        <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <span className="mono" style={{ width: 24, paddingTop: 10, color: "#D2601A", fontSize: 13 }}>{idx + 1}</span>
          <textarea
            style={{ ...inputStyle, flex: 1, resize: "vertical", minHeight: 44 }}
            placeholder={`Schritt ${idx + 1}`}
            value={step}
            onChange={(e) => updateStep(idx, e.target.value)}
          />
          <button onClick={() => removeStep(idx)} style={{ background: "none", border: "none", color: "#A79C8C", cursor: "pointer" }}><X size={18} /></button>
        </div>
      ))}
      <button onClick={() => setSteps((l) => [...l, ""])} style={{ ...backBtn, color: "#8CA86E", marginBottom: 26 }}>
        <Plus size={14} /> Schritt hinzufügen
      </button>

      <button
        onClick={handleSave}
        disabled={!canSave()}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: 10,
          border: "none",
          background: canSave() ? "#D2601A" : "#47423A",
          color: canSave() ? "#211F1C" : "#8A8477",
          fontWeight: 600,
          fontSize: 15,
          cursor: canSave() ? "pointer" : "not-allowed",
        }}
      >
        Rezept speichern
      </button>
    </div>
  );
}
