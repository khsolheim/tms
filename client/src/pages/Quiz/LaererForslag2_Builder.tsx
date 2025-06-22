import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  DocumentTextIcon,
  PhotoIcon,
  PlayIcon,
  ArrowLeftIcon,
  TrashIcon,
  EyeIcon,
  ClipboardDocumentCheckIcon,
  Cog6ToothIcon,
  SparklesIcon,
  BookOpenIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

interface Question {
  id: string;
  type: 'multiple' | 'true-false' | 'text' | 'image';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  points: number;
  image?: string;
}

interface QuizTemplate {
  id: string;
  navn: string;
  beskrivelse: string;
  kategori: string;
  antallSporsmal: number;
  estimertTid: string;
  vanskelighetsgrad: number;
}

export default function LaererForslag2_Builder() {
  const [currentQuiz, setCurrentQuiz] = useState({
    tittel: '',
    beskrivelse: '',
    kategori: 'Trafikk',
    tidsgrense: 30,
    blandSporsmal: true
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [previewMode, setPreviewMode] = useState(false);

  const [templates] = useState<QuizTemplate[]>([
    {
      id: '1',
      navn: 'Trafikkregler Grunnleggende',
      beskrivelse: 'Grunnleggende trafikkregler og skiltlære',
      kategori: 'Trafikk',
      antallSporsmal: 20,
      estimertTid: '15 min',
      vanskelighetsgrad: 3
    },
    {
      id: '2', 
      navn: 'Førstehjelpstrening',
      beskrivelse: 'Livredning og førstehjelp i trafikken',
      kategori: 'Sikkerhet',
      antallSporsmal: 15,
      estimertTid: '12 min',
      vanskelighetsgrad: 4
    },
    {
      id: '3',
      navn: 'Parkering og Manøvrering',
      beskrivelse: 'Praktiske kjøreferdigheter og parkering',
      kategori: 'Kjøring',
      antallSporsmal: 25,
      estimertTid: '20 min',
      vanskelighetsgrad: 5
    }
  ]);

  const addQuestion = (type: Question['type']) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type,
      question: '',
      options: type === 'multiple' ? ['', '', '', ''] : undefined,
      correctAnswer: type === 'multiple' ? 0 : '',
      points: 1
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setCurrentQuiz({
        ...currentQuiz,
        tittel: template.navn,
        beskrivelse: template.beskrivelse,
        kategori: template.kategori
      });
      // Simuler lasting av spørsmål fra template
      const mockQuestions: Question[] = Array.from({ length: 5 }, (_, i) => ({
        id: (i + 1).toString(),
        type: 'multiple',
        question: `Eksempel spørsmål ${i + 1} fra ${template.navn}`,
        options: ['Alternativ A', 'Alternativ B', 'Alternativ C', 'Alternativ D'],
        correctAnswer: 0,
        points: 1
      }));
      setQuestions(mockQuestions);
    }
  };

  const renderQuestionEditor = (question: Question) => (
    <div key={question.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
            question.type === 'multiple' ? 'bg-blue-500' :
            question.type === 'true-false' ? 'bg-green-500' :
            question.type === 'text' ? 'bg-purple-500' :
            'bg-orange-500'
          }`}>
            {question.type === 'multiple' ? 'M' :
             question.type === 'true-false' ? 'T/F' :
             question.type === 'text' ? 'T' : 'I'}
          </div>
          <span className="text-sm text-gray-600 capitalize">{question.type.replace('-', '/')}</span>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={question.points}
            onChange={(e) => updateQuestion(question.id, { points: parseInt(e.target.value) || 1 })}
            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
            min="1"
            placeholder="Poeng"
          />
          <button
            onClick={() => deleteQuestion(question.id)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Spørsmål</label>
          <textarea
            value={question.question}
            onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
            placeholder="Skriv ditt spørsmål her..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none"
            rows={3}
          />
        </div>

        {question.type === 'multiple' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Svaralternativer</label>
            <div className="space-y-2">
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={`correct-${question.id}`}
                    checked={question.correctAnswer === index}
                    onChange={() => updateQuestion(question.id, { correctAnswer: index })}
                    className="text-blue-500"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(question.options || [])];
                      newOptions[index] = e.target.value;
                      updateQuestion(question.id, { options: newOptions });
                    }}
                    placeholder={`Alternativ ${String.fromCharCode(65 + index)}`}
                    className="flex-1 p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {question.type === 'true-false' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Riktig svar</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`tf-${question.id}`}
                  checked={question.correctAnswer === 'true'}
                  onChange={() => updateQuestion(question.id, { correctAnswer: 'true' })}
                  className="mr-2"
                />
                Sant
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`tf-${question.id}`}
                  checked={question.correctAnswer === 'false'}
                  onChange={() => updateQuestion(question.id, { correctAnswer: 'false' })}
                  className="mr-2"
                />
                Usant
              </label>
            </div>
          </div>
        )}

        {question.type === 'text' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Riktig svar</label>
            <input
              type="text"
              value={question.correctAnswer}
              onChange={(e) => updateQuestion(question.id, { correctAnswer: e.target.value })}
              placeholder="Skriv det riktige svaret..."
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Forklaring (valgfritt)</label>
          <textarea
            value={question.explanation || ''}
            onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })}
            placeholder="Forklar hvorfor dette er riktig svar..."
            className="w-full p-2 border border-gray-300 rounded-lg resize-none"
            rows={2}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/quiz" className="p-2 hover:bg-white/50 rounded-lg transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Quiz Builder
              </h1>
              <p className="text-gray-600 mt-1">Lag interaktive quizer med drag-and-drop</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <EyeIcon className="w-4 h-4" />
              <span>{previewMode ? 'Rediger' : 'Forhåndsvis'}</span>
            </button>
            <button className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
              <ClipboardDocumentCheckIcon className="w-4 h-4" />
              <span>Publiser</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Templates & Tools */}
          <div className="space-y-6">
            {/* Templates */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <BookOpenIcon className="w-5 h-5 text-blue-500 mr-2" />
                Maler
              </h2>
              <div className="space-y-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg cursor-pointer hover:shadow-md transition-all duration-300"
                    onClick={() => loadTemplate(template.id)}
                  >
                    <div className="font-semibold text-gray-800 text-sm">{template.navn}</div>
                    <div className="text-xs text-gray-600 mt-1">{template.beskrivelse}</div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {template.kategori}
                      </span>
                      <span className="text-xs text-gray-500">{template.antallSporsmal} spørsmål</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Question Types */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <PlusIcon className="w-5 h-5 text-green-500 mr-2" />
                Legg til spørsmål
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => addQuestion('multiple')}
                  className="w-full p-3 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-lg hover:shadow-md transition-all duration-300 text-left"
                >
                  <div className="font-semibold">Flervalg</div>
                  <div className="text-xs opacity-80">4 svaralternativer</div>
                </button>
                <button
                  onClick={() => addQuestion('true-false')}
                  className="w-full p-3 bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-lg hover:shadow-md transition-all duration-300 text-left"
                >
                  <div className="font-semibold">Sant/Usant</div>
                  <div className="text-xs opacity-80">To alternativer</div>
                </button>
                <button
                  onClick={() => addQuestion('text')}
                  className="w-full p-3 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-lg hover:shadow-md transition-all duration-300 text-left"
                >
                  <div className="font-semibold">Tekstsvar</div>
                  <div className="text-xs opacity-80">Åpent svar</div>
                </button>
                <button
                  onClick={() => addQuestion('image')}
                  className="w-full p-3 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 rounded-lg hover:shadow-md transition-all duration-300 text-left"
                >
                  <div className="font-semibold">Bildespørsmål</div>
                  <div className="text-xs opacity-80">Med bilde</div>
                </button>
              </div>
            </div>

            {/* AI Assistant */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl shadow-lg p-6 border border-purple-200">
              <h2 className="text-lg font-bold text-purple-800 mb-4 flex items-center">
                <SparklesIcon className="w-5 h-5 text-purple-600 mr-2" />
                AI Assistent
              </h2>
              <div className="space-y-3">
                <button className="w-full p-2 bg-white/50 text-purple-800 rounded-lg hover:bg-white/70 transition-colors text-sm">
                  Generer spørsmål
                </button>
                <button className="w-full p-2 bg-white/50 text-purple-800 rounded-lg hover:bg-white/70 transition-colors text-sm">
                  Forbedre spørsmål
                </button>
                <button className="w-full p-2 bg-white/50 text-purple-800 rounded-lg hover:bg-white/70 transition-colors text-sm">
                  Sjekk vanskelighetsgrad
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Quiz Settings */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Cog6ToothIcon className="w-6 h-6 text-gray-600 mr-2" />
                Quiz Innstillinger
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Tittel</label>
                  <input
                    type="text"
                    value={currentQuiz.tittel}
                    onChange={(e) => setCurrentQuiz({ ...currentQuiz, tittel: e.target.value })}
                    placeholder="Skriv quiz-tittelen..."
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                  <select
                    value={currentQuiz.kategori}
                    onChange={(e) => setCurrentQuiz({ ...currentQuiz, kategori: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="Trafikk">Trafikk</option>
                    <option value="Sikkerhet">Sikkerhet</option>
                    <option value="Kjøring">Kjøring</option>
                    <option value="Motorvei">Motorvei</option>
                    <option value="Parkering">Parkering</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Beskrivelse</label>
                  <textarea
                    value={currentQuiz.beskrivelse}
                    onChange={(e) => setCurrentQuiz({ ...currentQuiz, beskrivelse: e.target.value })}
                    placeholder="Beskriv hva quizen handler om..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tidsgrense (minutter)</label>
                  <input
                    type="number"
                    value={currentQuiz.tidsgrense}
                    onChange={(e) => setCurrentQuiz({ ...currentQuiz, tidsgrense: parseInt(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    min="1"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="shuffle"
                    checked={currentQuiz.blandSporsmal}
                    onChange={(e) => setCurrentQuiz({ ...currentQuiz, blandSporsmal: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="shuffle" className="text-sm text-gray-700">Bland spørsmålsrekkefølge</label>
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <PencilIcon className="w-6 h-6 text-blue-500 mr-2" />
                  Spørsmål ({questions.length})
                </h2>
                {questions.length > 0 && (
                  <div className="text-sm text-gray-600">
                    Total poeng: {questions.reduce((sum, q) => sum + q.points, 0)}
                  </div>
                )}
              </div>

              {questions.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-12 border border-white/20 text-center">
                  <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Ingen spørsmål ennå</h3>
                  <p className="text-gray-500 mb-6">Velg en mal fra venstre sidebar eller legg til spørsmål manuelt</p>
                  <button
                    onClick={() => addQuestion('multiple')}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Legg til første spørsmål
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {questions.map(renderQuestionEditor)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 