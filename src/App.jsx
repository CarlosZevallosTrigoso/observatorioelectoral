import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Papa from 'papaparse';

// ============================================================
// CONFIGURACIÓN: Reemplaza esta URL con la de tu Google Sheet
// ============================================================
// Pasos:
// 1. Sube la plantilla a Google Sheets
// 2. Ve a Archivo > Compartir > Publicar en la web
// 3. Selecciona la hoja y formato "CSV"
// 4. Copia la URL y pégala aquí
// ============================================================
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/TU_ID_AQUI/pub?output=csv';

// Colores de encuestadoras
const pollsterColors = {
  'DATUM': '#3b82f6',
  'CPI': '#ef4444',
  'IPSOS': '#22c55e',
  'IEP': '#a855f7',
};

// Colores de candidatos
const candidateColors = {
  'Rafael López Aliaga': '#1e40af',
  'Keiko Fujimori': '#ea580c',
  'Carlos Álvarez': '#0891b2',
  'Alfonso López Chau': '#65a30d',
  'César Acuña': '#ca8a04',
  'Mario Vizcarra': '#db2777',
  'Yonhy Lescano': '#7c3aed',
  'George Forsyth': '#0d9488',
  'José Luna Gálvez': '#e11d48',
  'Ricardo Belmont': '#4f46e5',
  'Roberto Sánchez': '#059669',
  'Vladimir Cerrón': '#dc2626',
};

// Partidos políticos
const parties = {
  'Rafael López Aliaga': 'Renovación Popular',
  'Keiko Fujimori': 'Fuerza Popular',
  'Carlos Álvarez': 'Perú País para Todos',
  'Alfonso López Chau': 'Ahora Nación',
  'César Acuña': 'Alianza para el Progreso',
  'Mario Vizcarra': 'Perú Primero',
  'Yonhy Lescano': 'Cooperación Popular',
  'George Forsyth': 'Somos Perú',
  'José Luna Gálvez': 'Podemos Perú',
  'Ricardo Belmont': 'Partido Cívico Obras',
  'Roberto Sánchez': 'Juntos por el Perú',
  'Vladimir Cerrón': 'Perú Libre',
};

// Función para asignar color a nuevos candidatos
function getCandidateColor(candidate) {
  if (candidateColors[candidate]) return candidateColors[candidate];
  // Generar color basado en hash del nombre
  let hash = 0;
  for (let i = 0; i < candidate.length; i++) {
    hash = candidate.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 60%, 45%)`;
}

// Hook para cargar datos desde Google Sheets
function useGoogleSheetData(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('No se pudo conectar con Google Sheets');
      }
      
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const processed = {};
          
          results.data.forEach(row => {
            const pollster = row.Encuestadora?.trim();
            const period = row.Periodo?.trim();
            const candidate = row.Candidato?.trim();
            const value = parseFloat(row.Valor);
            
            if (!pollster || !period || !candidate || isNaN(value)) return;
            
            if (!processed[pollster]) {
              processed[pollster] = {
                name: pollster,
                color: pollsterColors[pollster] || '#888888',
                periods: [],
                data: {}
              };
            }
            
            if (!processed[pollster].periods.includes(period)) {
              processed[pollster].periods.push(period);
            }
            
            if (!processed[pollster].data[candidate]) {
              processed[pollster].data[candidate] = [];
            }
            
            const periodIndex = processed[pollster].periods.indexOf(period);
            processed[pollster].data[candidate][periodIndex] = value;
          });
          
          setData(processed);
          setLastUpdated(new Date());
          setLoading(false);
        },
        error: (err) => {
          setError(err.message);
          setLoading(false);
        }
      });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  return { data, loading, error, lastUpdated, refetch: fetchData };
}

// Selector de encuestadora
const PollsterSelector = ({ pollsters, selected, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {pollsters.map(key => (
      <button
        key={key}
        onClick={() => onChange(key)}
        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
          selected === key
            ? 'text-white shadow-lg scale-105'
            : 'bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-stone-200'
        }`}
        style={selected === key ? { backgroundColor: pollsterColors[key] || '#666' } : {}}
      >
        {key}
      </button>
    ))}
  </div>
);

// Navegación
const NavTab = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-stone-800 text-amber-400' 
        : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800/50'
    }`}
  >
    {children}
  </button>
);

// Selector de candidatos
const CandidateSelector = ({ candidates, selected, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {candidates.map(candidate => (
      <button
        key={candidate}
        onClick={() => {
          if (selected.includes(candidate)) {
            onChange(selected.filter(c => c !== candidate));
          } else {
            onChange([...selected, candidate]);
          }
        }}
        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
          selected.includes(candidate)
            ? 'text-white'
            : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
        }`}
        style={selected.includes(candidate) ? { backgroundColor: getCandidateColor(candidate) } : {}}
      >
        {candidate.split(' ')[0]} {candidate.split(' ').slice(-1)[0]}
      </button>
    ))}
  </div>
);

// Vista de Ranking
const RankingView = ({ pollData, pollster }) => {
  const rankingData = useMemo(() => {
    if (!pollData || !pollData[pollster]) return [];
    
    const data = pollData[pollster];
    
    return Object.entries(data.data)
      .map(([candidate, values]) => {
        const validValues = values.filter(v => v != null);
        const lastValue = validValues.length > 0 ? validValues[validValues.length - 1] : null;
        const prevValue = validValues.length > 1 ? validValues[validValues.length - 2] : null;
        const trend = lastValue != null && prevValue != null ? lastValue - prevValue : 0;
        
        return {
          candidate,
          party: parties[candidate] || '',
          value: lastValue,
          trend,
          color: getCandidateColor(candidate)
        };
      })
      .filter(item => item.value != null)
      .sort((a, b) => b.value - a.value);
  }, [pollData, pollster]);

  if (rankingData.length === 0) return <div className="text-stone-500">Sin datos disponibles</div>;

  const maxValue = Math.max(...rankingData.map(d => d.value));
  const lastPeriod = pollData[pollster].periods[pollData[pollster].periods.length - 1];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-stone-200">Ranking de candidatos</h3>
          <p className="text-sm text-stone-500">Según {pollster} · {lastPeriod}</p>
        </div>
      </div>

      <div className="space-y-2">
        {rankingData.map((item, index) => (
          <div
            key={item.candidate}
            className="relative bg-stone-900/50 rounded-xl p-4 overflow-hidden transition-all duration-300 hover:bg-stone-900/70"
          >
            <div 
              className="absolute inset-y-0 left-0 opacity-15 transition-all duration-500"
              style={{ 
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color
              }}
            />
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span 
                  className="w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                >
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <div className="text-stone-100 font-semibold truncate">{item.candidate}</div>
                  <div className="text-stone-500 text-sm truncate">{item.party}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-5 flex-shrink-0">
                {item.trend !== 0 && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    item.trend > 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    <span className="text-lg">{item.trend > 0 ? '↑' : '↓'}</span>
                    <span>{Math.abs(item.trend).toFixed(1)}</span>
                  </div>
                )}
                <div 
                  className="text-2xl font-bold min-w-[70px] text-right"
                  style={{ color: item.color }}
                >
                  {item.value.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Vista de Evolución
const EvolutionView = ({ pollData, pollster, selectedCandidates }) => {
  const data = pollData?.[pollster];
  
  const chartData = useMemo(() => {
    if (!data) return [];
    
    return data.periods.map((period, idx) => {
      const point = { name: period };
      selectedCandidates.forEach(candidate => {
        if (data.data[candidate]) {
          point[candidate] = data.data[candidate][idx];
        }
      });
      return point;
    });
  }, [data, selectedCandidates]);

  if (!data) return <div className="text-stone-500">Sin datos disponibles</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-stone-200">Evolución temporal</h3>
        <p className="text-sm text-stone-500">Según {data.name} · {data.periods[0]} – {data.periods[data.periods.length - 1]}</p>
      </div>
      
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} domain={[0, 'auto']} tickFormatter={(v) => `${v}%`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1c1917', border: '1px solid #44403c', borderRadius: '8px', color: '#e7e5e4' }}
              formatter={(value) => value != null ? [`${value}%`, ''] : ['-', '']}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} formatter={(v) => <span style={{ color: '#d6d3d1', fontSize: '12px' }}>{v}</span>} />
            {selectedCandidates.map(candidate => (
              <Line
                key={candidate}
                type="monotone"
                dataKey={candidate}
                stroke={getCandidateColor(candidate)}
                strokeWidth={2.5}
                dot={{ r: 5, fill: getCandidateColor(candidate) }}
                activeDot={{ r: 7 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Vista de Comparación
const ComparisonView = ({ pollData, selectedCandidates }) => {
  const comparisonData = useMemo(() => {
    if (!pollData) return [];
    
    return selectedCandidates.map(candidate => {
      const row = { candidate };
      Object.entries(pollData).forEach(([key, pollster]) => {
        const values = pollster.data[candidate]?.filter(v => v != null);
        row[key] = values?.length > 0 ? values[values.length - 1] : null;
      });
      return row;
    }).sort((a, b) => {
      const avgA = Object.keys(pollData).map(k => a[k]).filter(v => v != null);
      const avgB = Object.keys(pollData).map(k => b[k]).filter(v => v != null);
      const sumA = avgA.length > 0 ? avgA.reduce((x, y) => x + y, 0) / avgA.length : 0;
      const sumB = avgB.length > 0 ? avgB.reduce((x, y) => x + y, 0) / avgB.length : 0;
      return sumB - sumA;
    });
  }, [pollData, selectedCandidates]);

  if (!pollData) return <div className="text-stone-500">Sin datos disponibles</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-stone-200">Comparación entre encuestadoras</h3>
        <p className="text-sm text-stone-500">Últimos datos disponibles de cada fuente</p>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={comparisonData} layout="vertical" margin={{ top: 20, right: 30, left: 120, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
            <XAxis type="number" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} domain={[0, 16]} tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="candidate" stroke="#9ca3af" tick={{ fill: '#d6d3d1', fontSize: 11 }} width={115} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1c1917', border: '1px solid #44403c', borderRadius: '8px', color: '#e7e5e4' }}
              formatter={(value, name) => value != null ? [`${value}%`, name] : ['-', name]}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} formatter={(v) => <span style={{ color: '#d6d3d1' }}>{v}</span>} />
            {Object.keys(pollData).map(key => (
              <Bar key={key} dataKey={key} fill={pollsterColors[key] || '#666'} radius={[0, 4, 4, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto rounded-lg border border-stone-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-900">
              <th className="text-left py-3 px-4 text-stone-400 font-medium">Candidato</th>
              {Object.entries(pollData).map(([key, p]) => (
                <th key={key} className="text-center py-3 px-4 font-semibold" style={{ color: p.color }}>{p.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((row, i) => (
              <tr key={row.candidate} className={`border-t border-stone-800 ${i % 2 === 0 ? 'bg-stone-900/30' : ''}`}>
                <td className="py-3 px-4 text-stone-200 font-medium">{row.candidate}</td>
                {Object.keys(pollData).map(k => (
                  <td key={k} className="text-center py-3 px-4 text-stone-300">
                    {row[k] != null ? `${row[k]}%` : '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Estado de carga
const LoadingState = () => (
  <div className="min-h-screen bg-stone-950 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-stone-400">Cargando datos de encuestas...</p>
    </div>
  </div>
);

// Estado de error
const ErrorState = ({ error, onRetry }) => (
  <div className="min-h-screen bg-stone-950 flex items-center justify-center">
    <div className="text-center max-w-md mx-auto px-6">
      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">⚠️</span>
      </div>
      <h2 className="text-xl font-semibold text-stone-200 mb-2">Error al cargar datos</h2>
      <p className="text-stone-500 mb-4">{error}</p>
      <p className="text-stone-600 text-sm mb-6">
        Verifica que la URL del Google Sheet esté configurada correctamente y que la hoja esté publicada en la web.
      </p>
      <button 
        onClick={onRetry}
        className="px-6 py-2 bg-amber-500 text-stone-900 rounded-lg font-medium hover:bg-amber-400 transition-colors"
      >
        Reintentar
      </button>
    </div>
  </div>
);

// Componente principal
export default function App() {
  const { data: pollData, loading, error, lastUpdated, refetch } = useGoogleSheetData(GOOGLE_SHEET_CSV_URL);
  
  const [selectedPollster, setSelectedPollster] = useState(null);
  const [activeTab, setActiveTab] = useState('ranking');
  const [selectedCandidates, setSelectedCandidates] = useState([]);

  // Inicializar estado cuando carguen los datos
  useEffect(() => {
    if (pollData) {
      const pollsters = Object.keys(pollData);
      if (pollsters.length > 0 && !selectedPollster) {
        setSelectedPollster(pollsters[0]);
      }
      
      if (selectedCandidates.length === 0) {
        const allCandidates = new Set();
        Object.values(pollData).forEach(p => {
          Object.keys(p.data).forEach(c => allCandidates.add(c));
        });
        setSelectedCandidates(Array.from(allCandidates).slice(0, 5));
      }
    }
  }, [pollData]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!pollData) return <ErrorState error="No se pudieron cargar los datos" onRetry={refetch} />;

  const pollsters = Object.keys(pollData);
  const currentPollsterData = pollData[selectedPollster];
  const availableCandidates = currentPollsterData ? Object.keys(currentPollsterData.data) : [];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      {/* Header */}
      <header className="border-b border-stone-800 bg-stone-950/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-amber-500 rounded-full" />
              <div>
                <h1 className="text-xl font-bold tracking-tight">Observatorio Electoral</h1>
                <p className="text-stone-500 text-sm">Perú 2026</p>
              </div>
            </div>
            
            <PollsterSelector pollsters={pollsters} selected={selectedPollster} onChange={setSelectedPollster} />
          </div>
          
          <nav className="flex gap-1 bg-stone-900/50 p-1 rounded-lg w-fit">
            <NavTab active={activeTab === 'ranking'} onClick={() => setActiveTab('ranking')}>Ranking</NavTab>
            <NavTab active={activeTab === 'evolution'} onClick={() => setActiveTab('evolution')}>Evolución</NavTab>
            <NavTab active={activeTab === 'comparison'} onClick={() => setActiveTab('comparison')}>Comparar</NavTab>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {(activeTab === 'evolution' || activeTab === 'comparison') && (
          <div className="mb-6 p-4 bg-stone-900/30 rounded-xl border border-stone-800">
            <div className="text-sm text-stone-400 mb-3">Candidatos a comparar:</div>
            <CandidateSelector 
              candidates={availableCandidates}
              selected={selectedCandidates} 
              onChange={setSelectedCandidates}
            />
          </div>
        )}

        <div className="bg-stone-900/30 rounded-2xl border border-stone-800 p-4 sm:p-6">
          {activeTab === 'ranking' && <RankingView pollData={pollData} pollster={selectedPollster} />}
          {activeTab === 'evolution' && <EvolutionView pollData={pollData} pollster={selectedPollster} selectedCandidates={selectedCandidates} />}
          {activeTab === 'comparison' && <ComparisonView pollData={pollData} selectedCandidates={selectedCandidates} />}
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-stone-800">
          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center mb-4">
            {pollsters.map(key => (
              <div key={key} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pollsterColors[key] || '#666' }} />
                <span className={selectedPollster === key ? 'text-stone-200 font-medium' : 'text-stone-500'}>{key}</span>
                <span className="text-stone-600">({pollData[key].periods.length})</span>
              </div>
            ))}
          </div>
          {lastUpdated && (
            <p className="text-center text-xs text-stone-600 mb-2">
              Datos actualizados: {lastUpdated.toLocaleString('es-PE')}
            </p>
          )}
          <p className="text-center text-xs text-stone-600">
            Datos de encuestas públicas · No representa proyección oficial
          </p>
        </footer>
      </main>
    </div>
  );
}
