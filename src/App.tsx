import { useState } from 'react';
import { Boxes } from 'lucide-react';
import { useAssessment } from './hooks/useAssessment';
import { Home } from './components/Home';
import { Wizard } from './components/Wizard';
import { Results } from './components/Results';

type View = 'home' | 'wizard' | 'results';

export default function App() {
  const [view, setView] = useState<View>('home');
  const { assessment, setMeta, setAnswer, addConsumerTeam, renameConsumerTeam, removeConsumerTeam, replace, reset } =
    useAssessment();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="no-print bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2">
          <Boxes className="w-6 h-6 text-brand-600" />
          <button onClick={() => setView('home')} className="font-semibold text-lg text-slate-900">
            Verificador XaaS
          </button>
          <span className="ml-auto text-xs text-slate-400">¿Es realmente As-a-Service?</span>
        </div>
      </header>

      <main className="flex-1 w-full">
        {view === 'home' && (
          <Home
            assessment={assessment}
            setMeta={setMeta}
            addConsumerTeam={addConsumerTeam}
            renameConsumerTeam={renameConsumerTeam}
            removeConsumerTeam={removeConsumerTeam}
            replace={replace}
            reset={reset}
            onStart={() => setView('wizard')}
            onViewResults={() => setView('results')}
          />
        )}
        {view === 'wizard' && (
          <Wizard
            assessment={assessment}
            setAnswer={setAnswer}
            onBack={() => setView('home')}
            onFinish={() => setView('results')}
          />
        )}
        {view === 'results' && (
          <Results
            assessment={assessment}
            onEdit={() => setView('wizard')}
            onHome={() => setView('home')}
          />
        )}
      </main>
    </div>
  );
}
