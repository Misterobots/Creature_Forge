
import React, { useState, useEffect } from 'react';
import { QUESTION_POOL, TODDLER_QUESTIONS } from './constants';
import { AppState, AnswerMap, CreatureData, Question } from './types';
import { Welcome } from './components/Welcome';
import { Quiz } from './components/Quiz';
import { Generating } from './components/Generating';
import { Result } from './components/Result';
import {
  generateCreatureConcept,
  generateCreatureImage
} from './services/geminiService';
import { AlertCircle, Key } from 'lucide-react';
import { useSpeech } from './hooks/useSpeech';

// Helper to get random questions
const getRandomQuestions = (pool: Question[], count: number) => {
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [creatureData, setCreatureData] = useState<CreatureData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);
  const [isToddlerMode, setIsToddlerMode] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);

  // Audio hook for cleanup
  const { cancel: cancelSpeech, speak: speakGuide } = useSpeech();

  // State for the granular progress message
  const [generationStage, setGenerationStage] = useState<string>("Initializing...");

  // Randomize questions on mount or reset
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    // Initialize with a random set of 10 questions for standard mode
    setQuestions(getRandomQuestions(QUESTION_POOL, 10));
  }, []);

  // Select questions based on mode
  const currentQuestions = isToddlerMode ? TODDLER_QUESTIONS : questions;

  useEffect(() => {
    const checkKey = async () => {
      try {
        const win = window as any;
        if (win.aistudio && win.aistudio.hasSelectedApiKey) {
          const selected = await win.aistudio.hasSelectedApiKey();
          setHasApiKey(selected);
        } else {
          setHasApiKey(!!process.env.API_KEY);
        }
      } catch (e) {
        console.error("Error checking API key:", e);
      } finally {
        setIsCheckingKey(false);
      }
    };
    checkKey();
  }, []);

  const handleConnectKey = async () => {
    try {
      const win = window as any;
      if (win.aistudio && win.aistudio.openSelectKey) {
        await win.aistudio.openSelectKey();
        setHasApiKey(true);
      }
    } catch (e) {
      console.error("Failed to select key:", e);
    }
  };

  const handleStart = () => {
    setIsToddlerMode(false);
    setAppState(AppState.QUIZ);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setError(null);
    setIsAnswering(false);
  };

  const handleToddlerStart = () => {
    setIsToddlerMode(true);
    setAppState(AppState.QUIZ);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setError(null);
    setIsAnswering(false);
    speakGuide("Hello friend! Let's make a monster!");
  };

  const handleAnswer = async (answer: string) => {
    if (isAnswering) return; // Prevent double taps

    setIsAnswering(true);

    // In toddler mode, give affirmative audio feedback
    if (isToddlerMode) {
      const compliments = ["Good job!", "Wow!", "Cool choice!", "I like that one!"];
      const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
      speakGuide(randomCompliment);
    }

    const newAnswers = { ...answers, [currentQuestionIndex]: answer };
    setAnswers(newAnswers);

    if (currentQuestionIndex < currentQuestions.length - 1) {
      // Small delay for UX feel, especially in toddler mode
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        setIsAnswering(false);
      }, isToddlerMode ? 1000 : 100);
    } else {
      cancelSpeech(); // Stop speaking when generation starts
      await processResults(newAnswers);
      setIsAnswering(false);
    }
  };

  const processResults = async (finalAnswers: AnswerMap) => {
    setAppState(AppState.GENERATING);
    setError(null);

    try {
      const answerList = Object.values(finalAnswers);

      // Step 1: Concept
      setGenerationStage(isToddlerMode ? "Thinking of a cool name..." : "Dreaming up the creature concept...");
      const concept = await generateCreatureConcept(answerList);

      // Step 2: Visuals
      setGenerationStage(isToddlerMode ? "Painting a picture..." : "Painting the creature's portrait...");
      const imageUrl = await generateCreatureImage(concept.imagePrompt);

      if (!imageUrl) {
        throw new Error("Failed to generate creature image.");
      }

      setGenerationStage(isToddlerMode ? "Almost done!" : "Finalizing 3D model...");

      setCreatureData({
        ...concept,
        imageUrl
      });

      setAppState(AppState.RESULT);
    } catch (err: any) {
      console.error(err);

      const errorMessage = err.message || (typeof err === 'string' ? err : JSON.stringify(err));

      if (
        errorMessage.includes("Requested entity was not found") ||
        errorMessage.includes("403") ||
        errorMessage.includes("PERMISSION_DENIED")
      ) {
        setHasApiKey(false);
        setError("Access denied. Please reconnect your API key to continue.");
      } else {
        setError("The forge overheated! " + errorMessage);
      }
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    cancelSpeech();
    setAppState(AppState.WELCOME);
    setCreatureData(null);
    setAnswers({});
    setIsAnswering(false);
    // Shuffle questions for a new game
    setQuestions(getRandomQuestions(QUESTION_POOL, 10));
  };

  if (isCheckingKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-slate-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans text-slate-900 selection:bg-brand-200 ${isToddlerMode ? 'bg-orange-50' : 'bg-slate-50'}`}>
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold font-display text-xl ${isToddlerMode ? 'bg-orange-500' : 'bg-gradient-to-tr from-brand-500 to-magic-500'}`}>
              F
            </div>
            <span className="font-display font-bold text-lg hidden sm:block">
              {isToddlerMode ? "Little Forgers" : "Creature Forger"}
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            Powered by Gemini
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4 w-full">
        {appState === AppState.WELCOME && (
          <div className="animate-fade-in max-w-7xl mx-auto">
            <Welcome
              onStart={handleStart}
              onToddlerStart={handleToddlerStart}
              onConnect={handleConnectKey}
              hasApiKey={hasApiKey}
            />
          </div>
        )}

        {appState === AppState.QUIZ && (
          <div className="max-w-7xl mx-auto">
            <Quiz
              currentQuestionIndex={currentQuestionIndex}
              question={currentQuestions[currentQuestionIndex]}
              totalQuestions={currentQuestions.length}
              onAnswer={handleAnswer}
              isToddlerMode={isToddlerMode}
              disabled={isAnswering}
            />
          </div>
        )}

        {appState === AppState.GENERATING && (
          <div className="max-w-7xl mx-auto">
            <Generating stage={generationStage} />
          </div>
        )}

        {appState === AppState.RESULT && creatureData && (
          <div className="animate-fade-in">
            <Result
              data={creatureData}
              onReset={handleReset}
              isToddlerMode={isToddlerMode}
            />
          </div>
        )}

        {appState === AppState.ERROR && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6 max-w-7xl mx-auto">
            <div className="p-4 bg-red-50 rounded-full">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Forging Failed</h2>
            <p className="text-slate-600 max-w-md">
              {error || "Something went wrong."}
            </p>

            {error?.includes("Access denied") ? (
              <button
                onClick={handleConnectKey}
                className="flex items-center gap-2 px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30"
              >
                <Key className="w-4 h-4" /> Connect API Key
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
