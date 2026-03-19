/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calculator, 
  Zap, 
  FunctionSquare as FunctionIcon, 
  Trophy, 
  Bell, 
  LayoutDashboard, 
  BookOpen, 
  User, 
  ChevronRight, 
  CheckCircle2, 
  RotateCcw, 
  Info, 
  Play, 
  Download, 
  Share2, 
  History, 
  MapPin,
  Star,
  Award,
  BookMarked,
  BrainCircuit,
  Timer,
  LogOut,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './hooks/useAuth';
import { useProfile } from './hooks/useProfile';
import { useExercises } from './hooks/useExercises';
import { useSettings } from './hooks/useSettings';
import { LoginPage } from './components/LoginPage';
import type { Page, Badge, HistoryItem, WeeklyActivity } from './types';
import { generateQuestionsForLevel, getLevelName, getLevelDescription, type Question } from './data/questionGenerator';

// --- Icon Resolver ---

const ICON_MAP: Record<string, React.FC<{ size?: number }>> = {
  Zap, Trophy, Star, BookMarked, Award, Timer, Calculator, BrainCircuit,
};

const resolveIcon = (iconName: string, size = 24): React.ReactNode => {
  const IconComponent = ICON_MAP[iconName];
  if (IconComponent) return <IconComponent size={size} />;
  return <Star size={size} />;
};

// --- Helper Functions ---

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);

const calculateMultiGcd = (nums: number[]) => nums.reduce((acc, n) => gcd(acc, n));
const calculateMultiLcm = (nums: number[]) => nums.reduce((acc, n) => lcm(acc, n));

// --- Components ---

const Navbar = ({ currentPage, setPage, level, xp }: { currentPage: Page, setPage: (p: Page) => void, level: number, xp: number }) => (
  <nav className="fixed top-0 z-50 w-full bg-gradient-to-b from-[#1B0739] to-[#150330] shadow-[0_20px_40px_rgba(0,0,0,0.4)] border-b border-outline-variant/10">
    <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
      <div className="text-2xl font-headline font-bold text-primary tracking-tighter cursor-pointer" onClick={() => setPage('home')}>
        Kinetic Math
      </div>
      <div className="hidden md:flex items-center gap-8 font-headline">
        <button 
          onClick={() => setPage('home')}
          className={`transition-colors duration-300 ${currentPage === 'home' || currentPage === 'mmc-mdc' || currentPage === 'power-root' ? 'text-tertiary border-b-2 border-tertiary pb-1' : 'text-on-background opacity-70 hover:text-tertiary'}`}
        >
          Ferramentas
        </button>
        <button 
          onClick={() => setPage('exercises')}
          className={`transition-colors duration-300 ${currentPage === 'exercises' ? 'text-tertiary border-b-2 border-tertiary pb-1' : 'text-on-background opacity-70 hover:text-tertiary'}`}
        >
          Exercícios
        </button>
        <button 
          onClick={() => setPage('profile')}
          className={`transition-colors duration-300 ${currentPage === 'profile' ? 'text-tertiary border-b-2 border-tertiary pb-1' : 'text-on-background opacity-70 hover:text-tertiary'}`}
        >
          Perfil
        </button>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-full border border-outline-variant/15">
          <Award className="text-primary" size={18} />
          <span className="font-label text-xs font-bold uppercase tracking-wider text-primary">Nível {level}</span>
        </div>
        <button className="text-on-background opacity-70 hover:text-tertiary transition-colors">
          <Bell size={20} />
        </button>
      </div>
    </div>
  </nav>
);

const Sidebar = ({ currentPage, setPage }: { currentPage: Page, setPage: (p: Page) => void }) => (
  <aside className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-64 bg-[#1B0739]/60 backdrop-blur-xl border-r border-outline-variant/15 shadow-2xl flex flex-col gap-4 p-6 hidden lg:flex">
    <div className="mb-4">
      <h3 className="font-label text-sm uppercase tracking-widest text-tertiary font-bold">Atalhos Rápidos</h3>
      <p className="text-outline text-xs mt-1">Pratique agora</p>
    </div>
    <nav className="flex flex-col gap-2">
      <button 
        onClick={() => setPage('mmc-mdc')}
        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${currentPage === 'mmc-mdc' ? 'bg-[#371C60] text-tertiary border-l-4 border-tertiary' : 'text-outline hover:bg-[#220C42] hover:translate-x-1'}`}
      >
        <Calculator size={20} />
        <span className="font-label text-sm uppercase tracking-widest">MMC/MDC</span>
      </button>
      <button 
        onClick={() => setPage('power-root')}
        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${currentPage === 'power-root' ? 'bg-[#371C60] text-tertiary border-l-4 border-tertiary' : 'text-outline hover:bg-[#220C42] hover:translate-x-1'}`}
      >
        <Zap size={20} />
        <span className="font-label text-sm uppercase tracking-widest">Potenciação</span>
      </button>
      <button 
        onClick={() => setPage('power-root')} // Simplified for demo
        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-outline hover:bg-[#220C42] hover:translate-x-1`}
      >
        <FunctionIcon size={20} />
        <span className="font-label text-sm uppercase tracking-widest">Raiz Quadrada</span>
      </button>
    </nav>
  </aside>
);

// --- Pages ---

const HomePage: React.FC<{ setPage: (p: Page) => void }> = ({ setPage }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-12"
  >
    {/* Hero Banner */}
    <section className="relative overflow-hidden rounded-[2rem] bg-surface-container-low group">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-tertiary/10 opacity-50 group-hover:opacity-70 transition-opacity"></div>
      <div className="relative p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-2xl">
          <span className="font-label text-tertiary text-xs font-bold uppercase tracking-[0.2em] mb-4 block">Novidade</span>
          <h1 className="font-headline text-4xl md:text-6xl font-bold text-on-background leading-tight mb-6">
            Domine a Matemática com <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">Exercícios Interativos</span>
          </h1>
          <p className="text-on-surface-variant text-lg mb-8 max-w-lg">
            Pratique com desafios em tempo real e receba feedback instantâneo. Eleve seu nível matemático hoje mesmo.
          </p>
          <button 
            onClick={() => setPage('exercises')}
            className="bg-gradient-to-r from-primary to-tertiary text-surface font-bold px-8 py-4 rounded-full text-lg shadow-[0_0_30px_rgba(208,149,255,0.3)] hover:shadow-[0_0_40px_rgba(129,236,255,0.5)] transition-all hover:scale-105 active:scale-95"
          >
            Começar Treinamento
          </button>
        </div>
        <div className="w-full md:w-1/3 aspect-square glass-panel rounded-full flex items-center justify-center border border-outline-variant/20 relative">
          <BrainCircuit className="text-tertiary animate-pulse-slow" size={80} />
          <div className="absolute -top-4 -right-4 bg-surface-container-highest p-4 rounded-full border border-tertiary/30 shadow-xl">
            <Star className="text-tertiary fill-tertiary" size={24} />
          </div>
        </div>
      </div>
    </section>

    {/* Bento Grid */}
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="md:col-span-8 bg-surface-container rounded-[2rem] p-8 border border-outline-variant/10 hover:border-tertiary/30 transition-all group relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
          <Calculator size={120} />
        </div>
        <h2 className="font-headline text-2xl font-bold mb-2">Calculadoras de MMC & MDC</h2>
        <p className="text-on-surface-variant mb-8 max-w-md">Encontre múltiplos e divisores comuns instantaneamente com nossa ferramenta de alta precisão.</p>
        <div className="flex gap-4">
          <button onClick={() => setPage('mmc-mdc')} className="flex-1 bg-surface-container-highest py-4 rounded-xl font-label text-sm font-bold uppercase tracking-widest text-tertiary border border-tertiary/20 hover:bg-tertiary hover:text-surface transition-all">Abrir MMC</button>
          <button onClick={() => setPage('mmc-mdc')} className="flex-1 bg-surface-container-highest py-4 rounded-xl font-label text-sm font-bold uppercase tracking-widest text-primary border border-primary/20 hover:bg-primary hover:text-surface transition-all">Abrir MDC</button>
        </div>
      </div>

      <div className="md:col-span-4 bg-surface-container-high rounded-[2rem] p-8 border border-outline-variant/10 relative overflow-hidden">
        <h3 className="font-label text-xs font-bold uppercase tracking-widest text-outline mb-6">Conquistas Recentes</h3>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center border border-tertiary/20">
              <Trophy className="text-tertiary" size={20} />
            </div>
            <div>
              <p className="text-sm font-bold">Mestre das Raízes</p>
              <p className="text-xs text-on-surface-variant">Completou 50 desafios</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center border border-primary/20">
              <Timer className="text-primary" size={20} />
            </div>
            <div>
              <p className="text-sm font-bold">Velocidade da Luz</p>
              <p className="text-xs text-on-surface-variant">Resolveu em menos de 5s</p>
            </div>
          </div>
        </div>
        <button onClick={() => setPage('profile')} className="mt-8 w-full text-xs font-bold uppercase tracking-widest text-tertiary hover:underline">Ver todas</button>
      </div>

      <div className="md:col-span-6 bg-surface-container-low rounded-[2rem] p-8 border border-outline-variant/10 hover:border-primary/30 transition-all flex items-center justify-between group cursor-pointer" onClick={() => setPage('power-root')}>
        <div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Zap className="text-primary" size={24} />
          </div>
          <h3 className="font-headline text-xl font-bold mb-2">Potenciação</h3>
          <p className="text-sm text-on-surface-variant">Calcule expoentes complexos</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:bg-primary group-hover:text-surface transition-all">
          <ChevronRight size={24} />
        </div>
      </div>

      <div className="md:col-span-6 bg-surface-container-low rounded-[2rem] p-8 border border-outline-variant/10 hover:border-tertiary/30 transition-all flex items-center justify-between group cursor-pointer" onClick={() => setPage('power-root')}>
        <div>
          <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center mb-4">
            <FunctionIcon className="text-tertiary" size={24} />
          </div>
          <h3 className="font-headline text-xl font-bold mb-2">Raiz Quadrada</h3>
          <p className="text-sm text-on-surface-variant">Extração precisa de radicais</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:bg-tertiary group-hover:text-surface transition-all">
          <ChevronRight size={24} />
        </div>
      </div>
    </div>

    {/* Stats Bar */}
    <div className="bg-surface-container rounded-[2rem] p-10 border border-outline-variant/10 flex flex-col md:flex-row items-center justify-around gap-8">
      <div className="text-center">
        <p className="font-headline text-4xl font-bold text-tertiary">1.2k</p>
        <p className="font-label text-xs uppercase tracking-[0.2em] text-outline mt-2">Exercícios Concluídos</p>
      </div>
      <div className="h-12 w-px bg-outline-variant/20 hidden md:block"></div>
      <div className="text-center">
        <p className="font-headline text-4xl font-bold text-primary">15h</p>
        <p className="font-label text-xs uppercase tracking-[0.2em] text-outline mt-2">Tempo de Prática</p>
      </div>
      <div className="h-12 w-px bg-outline-variant/20 hidden md:block"></div>
      <div className="text-center">
        <p className="font-headline text-4xl font-bold text-on-background">98%</p>
        <p className="font-label text-xs uppercase tracking-[0.2em] text-outline mt-2">Taxa de Acerto</p>
      </div>
    </div>
  </motion.div>
);

const CalculatorMMCMDC = () => {
  const [input, setInput] = useState('12, 18, 30');
  const [result, setResult] = useState<{ mmc: number, mdc: number } | null>({ mmc: 180, mdc: 6 });

  const handleCalculate = () => {
    const nums = input.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (nums.length < 2) return;
    setResult({
      mmc: calculateMultiLcm(nums),
      mdc: calculateMultiGcd(nums)
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-12"
    >
      <header>
        <h1 className="font-headline text-5xl md:text-6xl font-bold text-on-background tracking-tight mb-4 leading-none">
          Calculadora de <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">MMC & MDC</span>
        </h1>
        <p className="text-on-surface-variant text-lg max-w-2xl">
          Determine o Mínimo Múltiplo Comum e o Máximo Divisor Comum simultaneamente com visualização detalhada da fatoração prima.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-surface-container rounded-[2rem] p-8 shadow-xl border-l-2 border-tertiary">
            <h2 className="font-headline text-xl font-bold mb-6 flex items-center gap-2">
              <Calculator className="text-tertiary" size={24} />
              Inserir Números
            </h2>
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-label text-outline uppercase tracking-wider mb-2 block">Digite os valores separados por vírgula</span>
                <div className="relative">
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full bg-surface-container-lowest border-none focus:ring-2 focus:ring-tertiary/40 rounded-xl py-4 px-6 text-xl font-headline tracking-widest text-on-background outline-none transition-all placeholder:text-outline/30" 
                    placeholder="Ex: 24, 36, 60" 
                    type="text" 
                  />
                  <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-tertiary" size={24} />
                </div>
              </label>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={handleCalculate}
                  className="flex-1 bg-gradient-to-r from-primary to-tertiary text-surface font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(129,236,255,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Zap size={20} />
                  CALCULAR
                </button>
                <button onClick={() => setInput('')} className="w-16 border border-outline/20 rounded-xl flex items-center justify-center hover:bg-surface-container-highest transition-colors">
                  <RotateCcw className="text-outline" size={24} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-high p-6 rounded-[2rem] text-center group hover:bg-surface-container-highest transition-colors cursor-default">
              <p className="font-label text-xs text-outline uppercase tracking-widest mb-1">MMC Resultante</p>
              <p className="font-headline text-4xl font-extrabold text-tertiary group-hover:scale-110 transition-transform">{result?.mmc || '—'}</p>
            </div>
            <div className="bg-surface-container-high p-6 rounded-[2rem] text-center group hover:bg-surface-container-highest transition-colors cursor-default">
              <p className="font-label text-xs text-outline uppercase tracking-widest mb-1">MDC Resultante</p>
              <p className="font-headline text-4xl font-extrabold text-primary group-hover:scale-110 transition-transform">{result?.mdc || '—'}</p>
            </div>
          </div>
        </section>

        <section className="lg:col-span-7">
          <div className="glass-panel rounded-[2rem] p-8 shadow-2xl relative overflow-hidden h-full">
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h2 className="font-headline text-2xl font-bold flex items-center gap-2">
                <LayoutDashboard className="text-primary" size={24} />
                Decomposição Simultânea
              </h2>
              <div className="flex items-center gap-2 text-xs font-label text-outline bg-surface-container-lowest/50 px-3 py-1 rounded-full">
                <Info size={14} />
                Passo a Passo
              </div>
            </div>

            <div className="relative z-10 overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-3">
                <thead className="font-label text-xs text-outline uppercase tracking-widest">
                  <tr>
                    <th className="pb-4 pl-4">Valores</th>
                    <th className="pb-4 text-center">Primo</th>
                    <th className="pb-4 pr-4 text-right">MDC?</th>
                  </tr>
                </thead>
                <tbody className="font-headline text-lg">
                  <tr className="bg-surface-container-lowest/30 rounded-xl overflow-hidden hover:bg-surface-container-highest/40 transition-colors">
                    <td className="py-4 pl-4 font-bold tracking-wider">12, 18, 30</td>
                    <td className="text-center"><span className="bg-tertiary/20 text-tertiary px-4 py-1 rounded-full font-bold">2</span></td>
                    <td className="text-right pr-4"><CheckCircle2 className="text-tertiary inline" size={20} /></td>
                  </tr>
                  <tr className="bg-surface-container-lowest/30 rounded-xl overflow-hidden hover:bg-surface-container-highest/40 transition-colors">
                    <td className="py-4 pl-4 font-bold tracking-wider">6, 9, 15</td>
                    <td className="text-center"><span className="bg-tertiary/20 text-tertiary px-4 py-1 rounded-full font-bold">2</span></td>
                    <td className="text-right pr-4 opacity-10">—</td>
                  </tr>
                  <tr className="bg-surface-container-lowest/30 rounded-xl overflow-hidden hover:bg-surface-container-highest/40 transition-colors">
                    <td className="py-4 pl-4 font-bold tracking-wider">3, 9, 15</td>
                    <td className="text-center"><span className="bg-tertiary/20 text-tertiary px-4 py-1 rounded-full font-bold">3</span></td>
                    <td className="text-right pr-4"><CheckCircle2 className="text-tertiary inline" size={20} /></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-8 p-6 bg-surface-container-highest/30 rounded-xl border-l-4 border-primary space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-tertiary/10 flex items-center justify-center shrink-0">
                  <Zap className="text-tertiary" size={16} />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-on-background">Lógica do MMC</h4>
                  <p className="text-sm text-outline leading-relaxed">Multiplicamos todos os fatores primos: <span className="text-tertiary font-bold">2² × 3² × 5 = 180</span></p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Star className="text-primary" size={16} />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-on-background">Lógica do MDC</h4>
                  <p className="text-sm text-outline leading-relaxed">Multiplicamos apenas os fatores que dividiram todos ao mesmo tempo: <span className="text-primary font-bold">2 × 3 = 6</span></p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
};

const CalculatorPowerRoot = () => {
  const [base, setBase] = useState('2');
  const [exp, setExp] = useState('3');
  const [result, setResult] = useState<number | null>(8);

  const handleCalculate = () => {
    const b = parseFloat(base);
    const e = parseFloat(exp);
    if (!isNaN(b) && !isNaN(e)) {
      setResult(Math.pow(b, e));
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-12"
    >
      <header>
        <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tight text-on-background mb-4">
          Potências e <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">Radicais</span>
        </h1>
        <p className="font-body text-lg text-on-surface-variant max-w-2xl leading-relaxed">
          Explore a energia da matemática exponencial. Calcule, simplifique e domine as leis que governam o crescimento infinito.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-7 bg-surface-container rounded-[2rem] p-8 relative overflow-hidden group border-l-2 border-tertiary/20">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-tertiary/20 flex items-center justify-center text-tertiary">
                <Zap size={20} />
              </div>
              <h2 className="font-headline text-2xl font-semibold">Calculadora de Potência</h2>
            </div>
            <div className="flex flex-col md:flex-row items-end gap-6 mb-10">
              <div className="flex-1 w-full">
                <label className="font-label text-xs uppercase tracking-tighter text-outline mb-2 block">Base (a)</label>
                <input 
                  value={base}
                  onChange={(e) => setBase(e.target.value)}
                  className="w-full bg-surface-container-lowest border-none rounded-full p-4 text-xl focus:ring-2 focus:ring-tertiary/40 placeholder:text-surface-variant font-headline" 
                  placeholder="Ex: 2" 
                  type="text" 
                />
              </div>
              <div className="flex-none w-full md:w-32">
                <label className="font-label text-xs uppercase tracking-tighter text-outline mb-2 block">Expoente (n)</label>
                <input 
                  value={exp}
                  onChange={(e) => setExp(e.target.value)}
                  className="w-full bg-surface-container-lowest border-none rounded-full p-4 text-xl focus:ring-2 focus:ring-tertiary/40 placeholder:text-surface-variant font-headline" 
                  placeholder="3" 
                  type="text" 
                />
              </div>
              <button 
                onClick={handleCalculate}
                className="bg-gradient-to-r from-primary to-tertiary text-surface px-8 py-4 rounded-full font-bold font-headline hover:shadow-[0_0_20px_rgba(129,236,255,0.4)] transition-all"
              >
                CALCULAR
              </button>
            </div>
            <div className="p-6 bg-surface-container-low rounded-full border border-outline-variant/15 flex items-center justify-between">
              <span className="font-label text-sm text-outline">Resultado sugerido:</span>
              <span className="font-headline text-3xl text-tertiary font-bold">{result !== null ? result : '—'}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-5 bg-surface-container-high/40 backdrop-blur-md rounded-[2rem] p-8 border border-outline-variant/10">
          <h3 className="font-headline text-xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="text-primary" size={20} />
            Teoria Rápida
          </h3>
          <div className="space-y-6">
            <div>
              <p className="font-label text-[10px] uppercase text-tertiary mb-1">Potenciação</p>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Representa a multiplicação de um fator por si mesmo <span className="text-on-background font-mono italic">n</span> vezes. 
                <span className="block mt-2 font-headline text-lg text-on-background">aⁿ = a · a · a...</span>
              </p>
            </div>
            <div className="h-px bg-outline-variant/10"></div>
            <div>
              <p className="font-label text-[10px] uppercase text-primary mb-1">Radiciação</p>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                É a operação inversa da potência. Encontrar qual número elevado ao índice resulta no radicando.
                <span className="block mt-2 font-headline text-lg text-on-background">ⁿ√x = r ⇔ rⁿ = x</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Flashcard Data ---
const FLASHCARDS = [
  { front: 'O que é MMC?', back: 'Mínimo Múltiplo Comum: o menor número positivo que é múltiplo de todos os números dados.' },
  { front: 'O que é MDC?', back: 'Máximo Divisor Comum: o maior número que divide todos os números dados sem deixar resto.' },
  { front: 'aⁿ × aᵐ = ?', back: 'aⁿ⁺ᵐ — Multiplica-se mantendo a base e somando os expoentes.' },
  { front: 'aⁿ ÷ aᵐ = ?', back: 'aⁿ⁻ᵐ — Divide-se mantendo a base e subtraindo os expoentes.' },
  { front: '(aⁿ)ᵐ = ?', back: 'aⁿˣᵐ — Potência de potência: mantém a base e multiplica os expoentes.' },
  { front: 'a⁰ = ?', back: '1 — Qualquer número (exceto 0) elevado a zero é igual a 1.' },
  { front: '√(a × b) = ?', back: '√a × √b — A raiz de um produto é o produto das raízes.' },
];

const LEVEL_COLORS: Record<number, { bg: string; border: string; text: string; glow: string }> = {
  1:  { bg: 'from-green-500/20 to-green-600/10', border: 'border-green-500/30', text: 'text-green-400', glow: 'shadow-green-500/20' },
  2:  { bg: 'from-green-400/20 to-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
  3:  { bg: 'from-teal-400/20 to-cyan-500/10', border: 'border-teal-500/30', text: 'text-teal-400', glow: 'shadow-teal-500/20' },
  4:  { bg: 'from-cyan-400/20 to-blue-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', glow: 'shadow-cyan-500/20' },
  5:  { bg: 'from-blue-400/20 to-indigo-500/10', border: 'border-blue-500/30', text: 'text-blue-400', glow: 'shadow-blue-500/20' },
  6:  { bg: 'from-indigo-400/20 to-violet-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400', glow: 'shadow-indigo-500/20' },
  7:  { bg: 'from-violet-400/20 to-purple-500/10', border: 'border-violet-500/30', text: 'text-violet-400', glow: 'shadow-violet-500/20' },
  8:  { bg: 'from-purple-400/20 to-fuchsia-500/10', border: 'border-purple-500/30', text: 'text-purple-400', glow: 'shadow-purple-500/20' },
  9:  { bg: 'from-fuchsia-400/20 to-pink-500/10', border: 'border-fuchsia-500/30', text: 'text-fuchsia-400', glow: 'shadow-fuchsia-500/20' },
  10: { bg: 'from-red-400/20 to-orange-500/10', border: 'border-red-500/30', text: 'text-red-400', glow: 'shadow-red-500/20' },
};

const BATCH_SIZE = 10;

const ExercisesPage: React.FC<{ addXP: (xp: number) => void, saveResult: (title: string, category: string, xpEarned: number, accuracy: number, timeSpentSeconds: number) => Promise<void>, exerciseTimer: number }> = ({ addXP, saveResult, exerciseTimer }) => {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [currentBatch, setCurrentBatch] = useState(0); // 0-4 (5 batches of 10)
  const [currentQuestion, setCurrentQuestion] = useState(0); // 0-9 within the batch
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [sessionXP, setSessionXP] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState(() => Date.now());
  const [finished, setFinished] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [showScratchPad, setShowScratchPad] = useState(false);
  const [scratchContent, setScratchContent] = useState('');
  const [timeLeft, setTimeLeft] = useState(exerciseTimer);

  useEffect(() => {
    if (selectedLevel !== null && !finished && selectedAnswer === null) {
      if (timeLeft <= 0) {
        handleAnswer(-1);
      } else {
        const timer = setTimeout(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [timeLeft, selectedLevel, finished, selectedAnswer]);

  // Generate all questions when a level is selected
  const allQuestions = useMemo<Question[]>(() => {
    if (selectedLevel === null) return [];
    return generateQuestionsForLevel(selectedLevel);
  }, [selectedLevel]);

  const TOTAL_BATCHES = allQuestions.length > 0 ? Math.ceil(allQuestions.length / BATCH_SIZE) : 5;

  // Slice to current batch of 10
  const batchQuestions = allQuestions.slice(currentBatch * BATCH_SIZE, (currentBatch + 1) * BATCH_SIZE);
  const q = batchQuestions[currentQuestion];
  const totalBatchQuestions = batchQuestions.length;
  const progressPercent = totalBatchQuestions > 0 ? ((currentQuestion + (selectedAnswer !== null ? 1 : 0)) / totalBatchQuestions) * 100 : 0;
  const globalQuestionNumber = currentBatch * BATCH_SIZE + currentQuestion + 1; // 1-50

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null || !q) return;
    setSelectedAnswer(index);
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const correct = index === q.correctIndex;
    const xpEarned = correct ? q.xpReward : 0;
    const accuracy = correct ? 100 : 0;

    if (correct) {
      setIsCorrect(true);
      setSessionXP(prev => prev + xpEarned);
      setCorrectCount(prev => prev + 1);
      addXP(xpEarned);
    } else {
      setIsCorrect(false);
    }

    saveResult(q.question, q.category, xpEarned, accuracy, timeSpent);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;
    if (currentQuestion >= totalBatchQuestions - 1) {
      setFinished(true);
      return;
    }
    setCurrentQuestion(prev => prev + 1);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setStartTime(Date.now());
    setTimeLeft(exerciseTimer);
  };

  const handleSelectLevel = (level: number) => {
    setSelectedLevel(level);
    setCurrentBatch(0);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setSessionXP(0);
    setCorrectCount(0);
    setStartTime(Date.now());
    setFinished(false);
    setTimeLeft(exerciseTimer);
  };

  const handleBackToLevels = () => {
    setSelectedLevel(null);
    setCurrentBatch(0);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setSessionXP(0);
    setCorrectCount(0);
    setFinished(false);
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setSessionXP(0);
    setCorrectCount(0);
    setStartTime(Date.now());
    setFinished(false);
    setTimeLeft(exerciseTimer);
  };

  const handleNextBatch = () => {
    if (currentBatch >= TOTAL_BATCHES - 1) return;
    setCurrentBatch(prev => prev + 1);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setSessionXP(0);
    setCorrectCount(0);
    setStartTime(Date.now());
    setFinished(false);
    setTimeLeft(exerciseTimer);
  };

  // --- Level Selector Screen ---
  if (selectedLevel === null) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
        <header>
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-on-background tracking-tight mb-4">
            Escolha seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">Nível</span>
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl">
            Níveis de 1 a 5 possuem 500 exercícios (50 sessões). Níveis de 6 a 10 possuem 50 exercícios (5 sessões). Sessões de 10.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(level => {
            const colors = LEVEL_COLORS[level];
            return (
              <motion.button
                key={level}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSelectLevel(level)}
                className={`relative overflow-hidden text-left p-6 rounded-2xl border ${colors.border} bg-gradient-to-br ${colors.bg} backdrop-blur-sm hover:shadow-xl ${colors.glow} transition-all group`}
              >
                <div className="absolute top-3 right-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Star size={40} />
                </div>
                <div className="relative z-10">
                  <div className={`font-headline text-3xl font-black ${colors.text} mb-1`}>
                    {level}
                  </div>
                  <h3 className="font-headline text-sm font-bold text-on-background mb-2">
                    {getLevelName(level)}
                  </h3>
                  <p className="text-[10px] text-on-surface-variant leading-relaxed">
                    {getLevelDescription(level)}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`font-label text-[10px] font-bold uppercase tracking-widest ${colors.text}`}>
                      {level <= 5 ? '50 sessões' : '5 sessões'} • 10 exercícios
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    );
  }

  // --- Completion Screen (batch finished) ---
  if (finished) {
    const accuracyRate = totalBatchQuestions > 0 ? Math.round((correctCount / totalBatchQuestions) * 100) : 0;
    const grade = totalBatchQuestions > 0 ? ((correctCount / totalBatchQuestions) * 10).toFixed(1) : '0.0';
    const parsedGrade = parseFloat(grade);
    const gradeColor = parsedGrade >= 9 ? 'text-green-400' : parsedGrade >= 7 ? 'text-tertiary' : parsedGrade >= 5 ? 'text-primary' : 'text-red-400';
    const colors = LEVEL_COLORS[selectedLevel];
    const isLastBatch = currentBatch >= TOTAL_BATCHES - 1;
    const batchLabel = `Sessão ${currentBatch + 1} de ${TOTAL_BATCHES}`;
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12">
        <div className="bg-surface-container rounded-[2rem] p-12 text-center border border-outline-variant/10 shadow-2xl">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-tertiary flex items-center justify-center mx-auto mb-8">
            <Trophy className="text-surface" size={48} />
          </div>
          <h2 className="font-headline text-4xl font-bold text-on-background mb-2">
            {isLastBatch ? 'Nível Completo! 🎉' : 'Sessão Completa!'}
          </h2>
          <p className={`font-label text-sm uppercase tracking-widest ${colors.text} mb-2`}>
            Nível {selectedLevel} — {getLevelName(selectedLevel)}
          </p>
          <p className="text-on-surface-variant text-sm mb-6">{batchLabel}</p>

          {/* Batch dots indicator */}
          <div className="flex justify-center flex-wrap gap-2 mb-8">
            {Array.from({ length: TOTAL_BATCHES }, (_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  i < currentBatch ? 'bg-tertiary' 
                  : i === currentBatch ? 'bg-primary scale-125 ring-2 ring-primary/30' 
                  : 'bg-surface-container-highest'
                }`}
              />
            ))}
          </div>

          <p className="text-on-surface-variant text-lg mb-8">
            Você terminou {totalBatchQuestions} questões desta sessão.
            {!isLastBatch && ` Restam ${(TOTAL_BATCHES - currentBatch - 1) * BATCH_SIZE} questões neste nível.`}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mb-10">
            <div className="bg-surface-container-high p-4 rounded-2xl flex flex-col items-center justify-center">
              <p className={`font-headline text-3xl font-bold ${gradeColor}`}>{grade.replace('.0', '')}</p>
              <p className="font-label text-[10px] uppercase text-outline tracking-widest mt-1">Nota</p>
            </div>
            <div className="bg-surface-container-high p-4 rounded-2xl flex flex-col items-center justify-center">
              <p className="font-headline text-3xl font-bold text-tertiary">{sessionXP}</p>
              <p className="font-label text-[10px] uppercase text-outline tracking-widest mt-1">XP Ganho</p>
            </div>
            <div className="bg-surface-container-high p-4 rounded-2xl flex flex-col items-center justify-center">
              <p className="font-headline text-3xl font-bold text-primary">{correctCount}/{totalBatchQuestions}</p>
              <p className="font-label text-[10px] uppercase text-outline tracking-widest mt-1">Acertos</p>
            </div>
            <div className="bg-surface-container-high p-4 rounded-2xl flex flex-col items-center justify-center">
              <p className="font-headline text-3xl font-bold text-on-background">{accuracyRate}%</p>
              <p className="font-label text-[10px] uppercase text-outline tracking-widest mt-1">Precisão</p>
            </div>
          </div>
          <div className="flex justify-center gap-4 flex-wrap">
            {!isLastBatch && (
              <button
                onClick={handleNextBatch}
                className="bg-gradient-to-r from-primary to-tertiary text-surface font-headline font-bold px-10 py-4 rounded-xl transition-transform active:scale-95 shadow-lg shadow-primary/20 hover:shadow-[0_0_30px_rgba(129,236,255,0.4)]"
              >
                Próxima Sessão →
              </button>
            )}
            <button
              onClick={handleRestart}
              className={`font-headline font-bold px-8 py-4 rounded-xl transition-all active:scale-95 ${
                isLastBatch 
                  ? 'bg-gradient-to-r from-primary to-tertiary text-surface shadow-lg shadow-primary/20 hover:shadow-[0_0_30px_rgba(129,236,255,0.4)]'
                  : 'border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <RotateCcw className="inline mr-2" size={18} />
              Repetir Sessão
            </button>
            <button
              onClick={handleBackToLevels}
              className="border border-outline-variant/20 text-on-surface-variant font-headline font-bold px-8 py-4 rounded-xl hover:bg-surface-container-high transition-all"
            >
              Escolher Outro Nível
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!q) return null;

  const levelColors = LEVEL_COLORS[selectedLevel];

  // --- Active Exercise Screen ---
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-12"
    >
      <section>
        <div className="flex justify-between items-end mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={handleBackToLevels}
                className="text-outline hover:text-on-background transition-colors font-label text-xs uppercase tracking-widest flex items-center gap-1"
              >
                ← Níveis
              </button>
              <span className={`font-label text-xs font-bold uppercase tracking-widest ${levelColors.text}`}>
                Nível {selectedLevel} — {getLevelName(selectedLevel)} • Sessão {currentBatch + 1}/{TOTAL_BATCHES}
              </span>
            </div>
            <h2 className="font-headline text-2xl font-bold">Exercícios de Matemática</h2>
          </div>
          <div className="text-right flex items-center justify-end gap-6">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <Timer size={20} className={timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-outline'} />
                <span className={`font-headline text-3xl font-bold ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-on-background'}`}>{timeLeft}s</span>
              </div>
              <span className="font-label text-[10px] uppercase tracking-widest text-outline mt-1">Tempo Restante</span>
            </div>
            <div className="h-10 w-px bg-outline-variant/30"></div>
            <div className="flex flex-col items-end">
              <span className="font-headline text-3xl font-bold text-tertiary">{sessionXP}</span>
              <span className="font-label text-[10px] uppercase tracking-widest text-outline mt-1">XP da Sessão</span>
            </div>
          </div>
        </div>
        <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-tertiary shadow-[0_0_15px_rgba(129,236,255,0.5)] transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-surface-container rounded-[2rem] p-8 border-l-4 border-tertiary shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Calculator size={80} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <span className="bg-tertiary/20 text-tertiary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter">Questão {currentQuestion + 1} de {totalBatchQuestions} (#{globalQuestionNumber}/50)</span>
                <span className="text-outline text-xs">•</span>
                <span className={`text-xs font-label uppercase ${levelColors.text}`}>Nível {q.level}</span>
              </div>
              <h3 className="font-body text-xl text-on-background mb-8 leading-relaxed">
                {q.question}
              </h3>
              
              <div className="space-y-4">
                {q.options.map((opt, i) => (
                  <button 
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={selectedAnswer !== null}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center ${
                      selectedAnswer !== null && i === q.correctIndex
                        ? 'bg-tertiary/10 border-tertiary'
                        : selectedAnswer === i && i !== q.correctIndex
                          ? 'bg-error/10 border-error'
                          : selectedAnswer !== null
                            ? 'border-outline-variant/15 opacity-50'
                            : 'border-outline-variant/15 hover:border-tertiary/40 hover:bg-surface-container-high cursor-pointer'
                    }`}
                  >
                    <span className={`font-body ${selectedAnswer !== null && i === q.correctIndex ? 'text-tertiary font-bold' : 'text-on-surface-variant'}`}>{opt}</span>
                    {selectedAnswer !== null && i === q.correctIndex && (
                      <div className="flex items-center gap-2">
                        <span className="font-label text-[10px] uppercase font-bold text-tertiary">Correto! +{q.xpReward} XP</span>
                        <CheckCircle2 className="text-tertiary" size={20} />
                      </div>
                    )}
                    {selectedAnswer === i && i !== q.correctIndex && (
                      <span className="font-label text-[10px] uppercase font-bold text-error">Incorreto</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Explanation after answering */}
              {selectedAnswer !== null && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-surface-container-highest/30 rounded-xl border-l-2 border-primary/40"
                >
                  <p className="text-sm text-on-surface-variant">
                    <span className="text-primary font-bold">Explicação: </span>{q.explanation}
                  </p>
                </motion.div>
              )}

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={handleNextQuestion}
                  disabled={selectedAnswer === null}
                  className={`bg-gradient-to-r from-primary to-tertiary text-surface font-headline font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-primary/20 ${
                    selectedAnswer === null ? 'opacity-40 cursor-not-allowed' : 'hover:shadow-[0_0_20px_rgba(129,236,255,0.4)] active:scale-95'
                  }`}
                >
                  {currentQuestion >= totalBatchQuestions - 1 ? 'Finalizar Sessão' : 'Próxima Questão'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => { setShowFlashcards(true); setFlashcardIndex(0); setFlashcardFlipped(false); }}
              className="bg-surface-container p-4 rounded-[2rem] border border-outline-variant/10 hover:bg-surface-container-high hover:border-primary/30 transition-all cursor-pointer group text-left"
            >
              <LayoutDashboard className="text-primary mb-3 group-hover:scale-110 transition-transform" size={24} />
              <h5 className="text-xs font-headline font-bold mb-1">Flashcards</h5>
              <p className="text-[10px] text-outline">Memorize as regras rápidas</p>
            </button>
            <button 
              onClick={() => setShowScratchPad(true)}
              className="bg-surface-container p-4 rounded-[2rem] border border-outline-variant/10 hover:bg-surface-container-high hover:border-tertiary/30 transition-all cursor-pointer group text-left"
            >
              <FunctionIcon className="text-tertiary mb-3 group-hover:scale-110 transition-transform" size={24} />
              <h5 className="text-xs font-headline font-bold mb-1">Rascunho</h5>
              <p className="text-[10px] text-outline">Área livre para cálculos</p>
            </button>
          </div>

          <div className="glass-panel p-6 rounded-[2rem] border-l-2 border-primary relative overflow-hidden">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <Trophy className="text-primary" size={24} />
              </div>
              <div>
                <h4 className="font-headline text-sm font-bold">Progresso da Sessão</h4>
                <p className="text-xs text-on-surface-variant">{correctCount} acertos de {currentQuestion + (selectedAnswer !== null ? 1 : 0)} respondidas</p>
              </div>
            </div>
            <div className="mt-4 flex gap-1">
              {Array.from({ length: totalBatchQuestions }, (_, i) => {
                const answered = i < currentQuestion || (i === currentQuestion && selectedAnswer !== null);
                return (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${answered ? 'bg-primary' : 'bg-surface-container-highest'}`}></div>
                );
              })}
            </div>
            {/* Batch indicator */}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] text-outline uppercase tracking-widest">Sessão {currentBatch + 1} de {TOTAL_BATCHES}</span>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: TOTAL_BATCHES }, (_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${
                    i < currentBatch ? 'bg-tertiary' 
                    : i === currentBatch ? 'bg-primary' 
                    : 'bg-surface-container-highest'
                  }`} />
                ))}
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-[2rem] border ${levelColors.border} bg-gradient-to-br ${levelColors.bg} relative overflow-hidden`}>
            <div className="flex gap-4 items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-headline text-xl font-black ${levelColors.text}`}>
                {selectedLevel}
              </div>
              <div>
                <h4 className="font-headline text-sm font-bold">{getLevelName(selectedLevel)}</h4>
                <p className="text-xs text-on-surface-variant">{getLevelDescription(selectedLevel)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flashcard Modal */}
      <AnimatePresence>
        {showFlashcards && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowFlashcards(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-surface-container rounded-[2rem] p-8 max-w-lg w-full shadow-2xl border border-outline-variant/10"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline text-xl font-bold">Flashcards</h3>
                <span className="font-label text-xs text-outline uppercase tracking-widest">{flashcardIndex + 1} / {FLASHCARDS.length}</span>
              </div>

              <button 
                onClick={() => setFlashcardFlipped(prev => !prev)} 
                className="w-full min-h-[200px] bg-surface-container-high rounded-2xl p-8 border border-outline-variant/15 hover:border-tertiary/30 transition-all cursor-pointer flex items-center justify-center text-center"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={flashcardFlipped ? 'back' : 'front'}
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -90, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {flashcardFlipped ? (
                      <p className="font-body text-on-surface-variant text-base leading-relaxed">{FLASHCARDS[flashcardIndex].back}</p>
                    ) : (
                      <p className="font-headline text-xl font-bold text-on-background">{FLASHCARDS[flashcardIndex].front}</p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </button>
              <p className="text-center text-[10px] text-outline mt-3 uppercase tracking-widest">Clique para {flashcardFlipped ? 'ver pergunta' : 'ver resposta'}</p>

              <div className="flex justify-between mt-6">
                <button 
                  onClick={() => { setFlashcardIndex(prev => Math.max(0, prev - 1)); setFlashcardFlipped(false); }}
                  disabled={flashcardIndex === 0}
                  className={`px-6 py-2 rounded-xl font-label text-sm font-bold uppercase ${flashcardIndex === 0 ? 'text-outline/40 cursor-not-allowed' : 'text-primary hover:bg-primary/10 transition-colors'}`}
                >
                  Anterior
                </button>
                <button 
                  onClick={() => setShowFlashcards(false)}
                  className="px-6 py-2 rounded-xl font-label text-sm text-outline hover:text-on-background transition-colors"
                >
                  Fechar
                </button>
                <button 
                  onClick={() => { setFlashcardIndex(prev => Math.min(FLASHCARDS.length - 1, prev + 1)); setFlashcardFlipped(false); }}
                  disabled={flashcardIndex === FLASHCARDS.length - 1}
                  className={`px-6 py-2 rounded-xl font-label text-sm font-bold uppercase ${flashcardIndex === FLASHCARDS.length - 1 ? 'text-outline/40 cursor-not-allowed' : 'text-tertiary hover:bg-tertiary/10 transition-colors'}`}
                >
                  Próximo
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scratch Pad Modal */}
      <AnimatePresence>
        {showScratchPad && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowScratchPad(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-surface-container rounded-[2rem] p-8 max-w-lg w-full shadow-2xl border border-outline-variant/10"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline text-xl font-bold flex items-center gap-2">
                  <FunctionIcon className="text-tertiary" size={20} />
                  Rascunho
                </h3>
                <button onClick={() => setScratchContent('')} className="text-outline hover:text-on-background transition-colors font-label text-xs uppercase tracking-widest">Limpar</button>
              </div>
              <textarea
                value={scratchContent}
                onChange={e => setScratchContent(e.target.value)}
                placeholder="Use este espaço para fazer cálculos, anotações, decomposições..."
                className="w-full h-64 bg-surface-container-lowest rounded-2xl p-6 text-on-background font-mono text-sm resize-none border border-outline-variant/15 focus:border-tertiary/40 focus:ring-2 focus:ring-tertiary/20 outline-none placeholder:text-outline/30 leading-relaxed"
              />
              <div className="flex justify-end mt-4">
                <button 
                  onClick={() => setShowScratchPad(false)}
                  className="bg-gradient-to-r from-primary to-tertiary text-surface font-headline font-bold px-6 py-2 rounded-xl transition-transform active:scale-95"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ProfilePage: React.FC<{ 
  level: number, xp: number, badges: Badge[], history: HistoryItem[], 
  weeklyActivity: WeeklyActivity[], profile: { display_name: string, avatar_url: string | null, location: string | null, title: string, global_ranking: number, streak_days: number, is_pro: boolean } | null,
  onSignOut: () => void,
  exerciseTimer: number,
  setExerciseTimer: (val: number) => void
}> = ({ level, xp, badges, history, weeklyActivity, profile, onSignOut, exerciseTimer, setExerciseTimer }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-12"
  >
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 p-8 rounded-[2rem] bg-surface-container border border-outline-variant/10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-tertiary/5 pointer-events-none"></div>
        <div className="relative">
          <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-primary via-tertiary to-primary animate-pulse-slow">
            <div className="w-full h-full rounded-full bg-surface-container-lowest flex items-center justify-center overflow-hidden border-4 border-surface-container">
              <img 
                className="w-full h-full object-cover" 
                src={profile?.avatar_url || 'https://picsum.photos/seed/avatar/200/200'} 
                alt="Avatar"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          {profile?.is_pro && <div className="absolute -bottom-2 -right-2 bg-tertiary text-surface px-3 py-1 rounded-full font-label font-bold text-[10px] shadow-lg">PRO</div>}
        </div>
        <div className="flex flex-col text-center md:text-left">
          <h1 className="font-headline text-4xl font-bold text-on-background mb-2">{profile?.display_name || 'Estudante'}</h1>
          <p className="font-body text-on-surface-variant flex items-center justify-center md:justify-start gap-2">
            <MapPin size={14} /> {profile?.title || 'Aprendiz'} • {profile?.location || 'Brasil'}
          </p>
          <div className="flex gap-4 mt-6">
            <div className="flex flex-col">
              <span className="font-label text-[10px] text-outline uppercase tracking-tighter">Ranking Global</span>
              <span className="font-headline text-xl text-tertiary font-bold">#{(profile?.global_ranking || 0).toLocaleString()}</span>
            </div>
            <div className="w-px h-8 bg-outline-variant/20 self-end"></div>
            <div className="flex flex-col">
              <span className="font-label text-[10px] text-outline uppercase tracking-tighter">Ofensiva</span>
              <span className="font-headline text-xl text-primary font-bold">{profile?.streak_days || 0} Dias</span>
            </div>
          </div>
          <button 
            onClick={onSignOut}
            className="mt-6 flex items-center gap-2 text-outline hover:text-red-400 transition-colors font-label text-xs uppercase tracking-widest"
          >
            <LogOut size={14} /> Sair da Conta
          </button>
        </div>
      </div>

      <div className="p-8 rounded-[2rem] bg-surface-container-high border border-outline-variant/10 flex flex-col justify-center items-center text-center relative overflow-hidden">
        <div className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4">Progresso do Nível</div>
        <div className="relative w-32 h-32 flex items-center justify-center mb-4">
          <svg className="w-full h-full -rotate-90">
            <circle className="text-surface-container-highest" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
            <circle 
              className="text-tertiary transition-all duration-1000" 
              cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" 
              strokeDasharray="364.4" 
              strokeDashoffset={364.4 * (1 - (xp % 1000) / 1000)} 
              strokeLinecap="round" strokeWidth="8"
            ></circle>
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="font-headline text-3xl font-bold">{Math.floor((xp % 1000) / 10)}%</span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="font-headline text-xl font-bold text-tertiary">{xp.toLocaleString()} XP</span>
          <span className="font-label text-[10px] text-outline uppercase tracking-widest mt-1">Faltam {1000 - (xp % 1000)} XP para o Nível {level + 1}</span>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="p-8 rounded-[2rem] bg-surface-container border border-outline-variant/10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="font-headline text-xl font-bold text-on-background">Atividade Semanal</h2>
              <p className="font-label text-xs text-on-surface-variant mt-1">Pontos de experiência ganhos por dia</p>
            </div>
            <div className="flex gap-2 items-center">
              <span className="w-3 h-3 rounded-full bg-tertiary"></span>
              <span className="font-label text-[10px] uppercase text-outline">Matemática Pura</span>
            </div>
          </div>
          <div className="h-48 w-full flex items-end justify-between gap-2 px-2">
            {weeklyActivity.map((a, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3">
                <div className={`w-full rounded-t-lg transition-all duration-500 ${a.isHighlight ? 'bg-tertiary' : 'bg-surface-container-highest hover:bg-tertiary/40'}`} style={{ height: `${a.percentage}%` }}></div>
                <span className={`font-label text-[10px] ${a.isHighlight ? 'text-tertiary font-bold' : 'text-outline'}`}>
                  {a.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 rounded-[2rem] bg-surface-container border border-outline-variant/10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-headline text-xl font-bold text-on-background">Galeria de Medalhas</h2>
            <button className="font-label text-xs text-tertiary uppercase tracking-widest hover:underline">Ver todas</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {badges.map((badge) => (
              <div key={badge.id} className={`group flex flex-col items-center p-4 rounded-xl bg-surface-container-low hover:bg-surface-container-highest transition-colors text-center ${!badge.unlocked && 'opacity-40 grayscale'}`}>
                <div className={`w-16 h-16 rounded-full p-0.5 mb-3 transition-transform ${badge.unlocked ? 'bg-gradient-to-tr from-primary to-tertiary group-hover:scale-110' : 'bg-outline-variant/30'}`}>
                  <div className="w-full h-full rounded-full bg-surface-container-highest flex items-center justify-center">
                    <span className={badge.color}>{resolveIcon(badge.icon_name)}</span>
                  </div>
                </div>
                <span className="font-label text-[10px] font-bold text-on-background uppercase tracking-tighter">{badge.name}</span>
                <span className="font-label text-[8px] text-outline uppercase">{badge.description}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 rounded-[2rem] bg-surface-container border border-outline-variant/10">
          <div className="flex mb-8 items-center gap-3">
            <Settings className="text-tertiary" size={24} />
            <h2 className="font-headline text-xl font-bold text-on-background">Configurações</h2>
          </div>
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="font-label text-xs uppercase tracking-widest text-outline flex justify-between">
                <span>Tempo por Exercício (segundos)</span>
                <span className="text-tertiary font-bold">{exerciseTimer}s</span>
              </label>
              <input 
                type="range" 
                min="10" 
                max="300" 
                step="10"
                value={exerciseTimer}
                onChange={(e) => setExerciseTimer(parseInt(e.target.value, 10))}
                className="w-full accent-tertiary"
              />
              <p className="text-xs text-on-surface-variant">Define o tempo máximo para responder a cada questão.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 rounded-[2rem] bg-surface-container-high border border-outline-variant/10 h-full">
        <div className="flex items-center gap-3 mb-8">
          <History className="text-primary" size={20} />
          <h2 className="font-headline text-xl font-bold text-on-background">Histórico</h2>
        </div>
        <div className="space-y-6">
          {history.map((item) => (
            <div key={item.id} className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-[-24px] before:w-[2px] before:bg-outline-variant/20 last:before:hidden">
              <div className={`absolute left-[-4px] top-2 w-2 h-2 rounded-full ${item.color} shadow-[0_0_8px_rgba(129,236,255,0.5)]`}></div>
              <div className="flex flex-col">
                <span className="font-label text-[10px] text-outline uppercase tracking-widest">{item.date}</span>
                <h4 className="font-body text-sm font-semibold text-on-background mt-1">{item.title}</h4>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.color === 'bg-tertiary' ? 'text-tertiary bg-tertiary/10' : item.color === 'bg-primary' ? 'text-primary bg-primary/10' : 'text-outline bg-surface-container-highest'}`}>
                    +{item.xp} XP
                  </span>
                  <span className="text-[10px] text-on-surface-variant">Acerto: {item.accuracy}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

// --- Main App Component ---

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const auth = useAuth();
  const { profile, progress, badges, weeklyActivity, addXP } = useProfile(auth.user?.id ?? null);
  const { history, saveResult } = useExercises(auth.user?.id ?? null);
  const { exerciseTimer, setExerciseTimer } = useSettings();

  const xp = progress?.total_xp ?? 0;
  const level = progress?.current_level ?? 1;

  // Show login page if not authenticated
  if (!auth.isAuthenticated) {
    return (
      <LoginPage
        onSignIn={auth.signIn}
        onSignUp={auth.signUp}
        loading={auth.loading}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar currentPage={page} setPage={setPage} level={level} xp={xp} />
      
      <div className="flex flex-1 pt-20">
        <Sidebar currentPage={page} setPage={setPage} />
        
        <main className="flex-1 lg:ml-64 px-6 md:px-12 py-10 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            {page === 'home' && <HomePage key="home" setPage={setPage} />}
            {page === 'mmc-mdc' && <CalculatorMMCMDC key="mmc-mdc" />}
            {page === 'power-root' && <CalculatorPowerRoot key="power-root" />}
            {page === 'exercises' && <ExercisesPage key="exercises" addXP={addXP} saveResult={saveResult} exerciseTimer={exerciseTimer} />}
            {page === 'profile' && <ProfilePage key="profile" level={level} xp={xp} badges={badges} history={history} weeklyActivity={weeklyActivity} profile={profile} onSignOut={auth.signOut} exerciseTimer={exerciseTimer} setExerciseTimer={setExerciseTimer} />}
          </AnimatePresence>
        </main>
      </div>

      <footer className="w-full border-t border-outline-variant/15 mt-20 bg-surface">
        <div className="max-w-7xl mx-auto px-8 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <div className="font-headline font-bold text-primary text-xl mb-2">Kinetic Math</div>
            <p className="font-body text-outline text-sm">© 2024 Kinetic Math - The Neon Mathematical Infinite</p>
          </div>
          <div className="flex gap-8">
            <a className="font-body text-outline text-sm hover:text-on-background transition-colors" href="#">Suporte</a>
            <a className="font-body text-outline text-sm hover:text-on-background transition-colors" href="#">Termos</a>
            <a className="font-body text-outline text-sm hover:text-on-background transition-colors" href="#">Privacidade</a>
            <a className="font-body text-outline text-sm hover:text-on-background transition-colors" href="#">Sobre Nós</a>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container/90 backdrop-blur-xl flex justify-around items-center py-4 px-6 z-50 border-t border-outline-variant/10">
        <button onClick={() => setPage('home')} className={`flex flex-col items-center gap-1 ${page === 'home' ? 'text-tertiary' : 'text-outline'}`}>
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-label font-bold uppercase tracking-tighter">Início</span>
        </button>
        <button onClick={() => setPage('exercises')} className={`flex flex-col items-center gap-1 ${page === 'exercises' ? 'text-tertiary' : 'text-outline'}`}>
          <BookOpen size={20} />
          <span className="text-[10px] font-label font-bold uppercase tracking-tighter">Praticar</span>
        </button>
        <button onClick={() => setPage('profile')} className={`flex flex-col items-center gap-1 ${page === 'profile' ? 'text-tertiary' : 'text-outline'}`}>
          <User size={20} />
          <span className="text-[10px] font-label font-bold uppercase tracking-tighter">Perfil</span>
        </button>
      </nav>
    </div>
  );
}
