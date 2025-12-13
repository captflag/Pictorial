import React, { useEffect, useState, useRef } from 'react';
import { generateComprehensiveVisuals, editEducationalImage, analyzeImage, upscaleImage } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { ImageAnalysisResult, ImageAnalysisElement } from '../types';
import { RefreshCw, Download, Maximize2, Palette, Settings2, Edit2, Check, X, LayoutGrid, Loader2, ImageIcon, Play, Info, Scaling, ArrowRight, Eye, MousePointerClick, List, Book } from 'lucide-react';

interface VisualViewProps {
  prompt: string;
  topic: string;
  activeClass?: string;
  activeSubject?: string | null;
  chapters?: string[];
  onTopicClick?: (topic: string) => void;
}

const ART_STYLES = [
  "3D Render",
  "Watercolor",
  "Line Art",
  "Photorealistic",
  "Cyberpunk",
  "Blueprint"
];

export const VisualView: React.FC<VisualViewProps> = ({ prompt, topic, activeClass, activeSubject, chapters = [], onTopicClick }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [variations, setVariations] = useState<string[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<ImageAnalysisResult | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  
  const [style, setStyle] = useState('3D Render');
  const [isEditing, setIsEditing] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [selectedHotspot, setSelectedHotspot] = useState<ImageAnalysisElement | null>(null);
  const generatedRef = useRef(false);

  const [activeTab, setActiveTab] = useState<'insights' | 'curriculum'>('insights');

  const fetchContent = async () => {
    setLoading(true);
    setVariations([]);
    setImageUrl(null);
    setVideoUrl(null);
    setNotes([]);
    setAnalysis(null);
    setSelectedHotspot(null);
    
    try {
      const content = await generateComprehensiveVisuals(topic, prompt);
      if (content.images.length > 0) {
        setVariations(content.images);
        setImageUrl(content.images[0]);
        // Trigger analysis
        setAnalyzing(true);
        analyzeImage(content.images[0]).then((res) => {
          setAnalysis(res);
          setAnalyzing(false);
        });
      }
      if (content.videoUrl) setVideoUrl(content.videoUrl);
      setNotes(content.notes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEditImage = async () => {
    if (!imageUrl || !editPrompt.trim()) return;
    setLoading(true);
    try {
      const result = await editEducationalImage(imageUrl, editPrompt);
      if (result) {
        setVariations(prev => [...prev, result]);
        setImageUrl(result);
        setIsEditing(false);
        setEditPrompt('');
        setAnalysis(null);
        setAnalyzing(true);
        analyzeImage(result).then((res) => {
          setAnalysis(res);
          setAnalyzing(false);
        });
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleUpscaleImage = async () => {
    if (!imageUrl) return;
    setLoading(true);
    try {
      const result = await upscaleImage(imageUrl);
      if (result) {
        setVariations(prev => [...prev, result]);
        setImageUrl(result);
        setAnalysis(null);
        setAnalyzing(true);
        analyzeImage(result).then((res) => {
           setAnalysis(res);
           setAnalyzing(false);
        });
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
    if (prompt && !generatedRef.current) {
      fetchContent();
      generatedRef.current = true;
    }
  }, [prompt]);

  useEffect(() => {
     generatedRef.current = false;
     setVariations([]);
     setImageUrl(null);
     setVideoUrl(null);
  }, [topic]);

  const handleWheel = (e: React.WheelEvent) => {
    if (!imageUrl) return;
    e.preventDefault();
    const newScale = Math.min(Math.max(scale - e.deltaY * 0.001, 1), 5);
    setScale(newScale);
    if (newScale === 1) setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag if not clicking a hotspot
    if ((e.target as HTMLElement).closest('.hotspot')) return;

    if (scale > 1) {
      setIsDragging(true);
      setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
    }
  };

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Floating Control Bar */}
      <div className="glass-panel p-2 rounded-2xl flex items-center justify-between gap-4 sticky top-28 z-20 bg-white shadow-lg shadow-slate-200/50">
        <div className="flex items-center gap-4 px-2">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-bold uppercase tracking-wider">
            <Settings2 size={16} /> <span className="hidden sm:inline">Studio</span>
          </div>
          <div className="h-4 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <Palette size={16} className="text-brand-600" />
            <select 
              value={style} 
              onChange={(e) => setStyle(e.target.value)}
              className="bg-transparent text-slate-700 text-sm font-medium outline-none cursor-pointer hover:text-brand-600"
            >
              {ART_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <button 
           onClick={fetchContent}
           disabled={loading}
           className="px-5 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all shadow-md flex items-center gap-2"
         >
           <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
           {loading ? 'Rendering...' : 'Regenerate'}
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Canvas Area */}
        <div className="glass-card p-1 rounded-3xl overflow-hidden relative group h-[450px] shadow-2xl shadow-slate-200 bg-slate-100 border-slate-200">
           {loading ? (
             <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50">
               <LoadingSpinner message="Composing visual masterpiece..." />
             </div>
           ) : imageUrl ? (
             <div 
               className="w-full h-full flex items-center justify-center bg-slate-200 rounded-2xl overflow-hidden relative"
               onWheel={handleWheel}
               onMouseDown={handleMouseDown}
               onMouseMove={handleMouseMove}
               onMouseUp={() => setIsDragging(false)}
               onMouseLeave={() => setIsDragging(false)}
             >
                {/* Image Container with Transforms */}
                <div 
                  className="relative transition-transform duration-200 ease-out origin-center"
                  style={{ 
                     transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                     aspectRatio: '16/9',
                     height: '100%',
                     width: 'auto'
                  }}
                >
                   <img 
                     src={imageUrl} 
                     alt="Main Visual"
                     className="w-full h-full object-cover pointer-events-none select-none"
                   />
                   
                   {/* Hotspots Overlay */}
                   {analysis?.elements?.map((el, i) => (
                     <div
                       key={i}
                       className="hotspot absolute border-2 border-dashed border-white/50 hover:border-brand-400 hover:bg-brand-500/20 cursor-pointer transition-all rounded-lg group/hotspot"
                       style={{
                         top: `${el.box_2d[0] * 100}%`,
                         left: `${el.box_2d[1] * 100}%`,
                         height: `${(el.box_2d[2] - el.box_2d[0]) * 100}%`,
                         width: `${(el.box_2d[3] - el.box_2d[1]) * 100}%`,
                       }}
                       onClick={(e) => {
                         e.stopPropagation();
                         setSelectedHotspot(el);
                       }}
                     >
                       {/* Pulsing indicator center */}
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 opacity-0 group-hover/hotspot:opacity-100 transition-opacity">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75 animate-ping"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-brand-500"></span>
                       </div>
                       
                       {/* Tooltip Label */}
                       <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/hotspot:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          {el.label}
                       </div>
                     </div>
                   ))}
                </div>
               
               {/* Analysis Info Popover (Bottom) */}
               {selectedHotspot && (
                 <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-brand-200 shadow-xl animate-in slide-in-from-bottom-2 z-10">
                   <div className="flex justify-between items-start mb-1">
                      <h4 className="text-brand-600 font-bold text-lg">{selectedHotspot.label}</h4>
                      <button onClick={() => setSelectedHotspot(null)} className="p-1 hover:bg-slate-100 rounded-full text-slate-500"><X size={16}/></button>
                   </div>
                   <p className="text-slate-600 text-sm leading-relaxed">{selectedHotspot.description}</p>
                 </div>
               )}

               {/* Default Hotspot Hint */}
               {analysis && !selectedHotspot && (
                 <div className="absolute top-4 left-4 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium text-slate-700 pointer-events-none animate-pulse shadow-sm">
                   <MousePointerClick size={14} className="text-brand-600" /> Click highlighted areas
                 </div>
               )}

               {/* Floating Actions Overlay */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 p-2 bg-white/90 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 z-20 shadow-lg border border-slate-200">
                  <button onClick={handleUpscaleImage} className="p-2 text-slate-700 hover:text-brand-600 transition-colors" title="Upscale 4K"><Scaling size={18} /></button>
                  <button onClick={() => setIsEditing(true)} className="p-2 text-slate-700 hover:text-brand-600 transition-colors" title="AI Edit"><Edit2 size={18} /></button>
                  <button onClick={() => { setScale(1); setPosition({x:0, y:0}); setSelectedHotspot(null); }} className="p-2 text-slate-700 hover:text-brand-600 transition-colors" title="Reset View"><Maximize2 size={18} /></button>
                  <button onClick={() => { const link = document.createElement('a'); link.href = imageUrl; link.download = 'pictorial_export.png'; link.click(); }} className="p-2 text-slate-700 hover:text-brand-600 transition-colors" title="Download"><Download size={18} /></button>
               </div>
               
               {isEditing && (
                 <div className="absolute top-4 left-4 right-4 glass-panel p-3 rounded-2xl flex gap-2 animate-in slide-in-from-top-2 z-30 bg-white shadow-xl border-slate-200">
                    <input
                      type="text"
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      placeholder="Describe your edit..."
                      className="flex-1 bg-transparent border-none text-sm focus:ring-0 placeholder-slate-400 text-slate-900"
                      autoFocus
                    />
                    <button onClick={handleEditImage} className="p-2 bg-brand-600 text-white rounded-lg"><Check size={16}/></button>
                    <button onClick={() => setIsEditing(false)} className="p-2 bg-slate-100 text-slate-500 rounded-lg"><X size={16}/></button>
                 </div>
               )}
             </div>
           ) : (
             <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
               <ImageIcon size={64} opacity={0.2} />
             </div>
           )}
        </div>

        {/* Media & Context Column */}
        <div className="flex flex-col gap-6 h-[450px]">
          
          {/* Top Half: Video / Dynamic Visual */}
          <div className="flex-1 bg-slate-100 rounded-3xl overflow-hidden relative shadow-inner border border-slate-200">
             {videoUrl ? (
               <video src={videoUrl} controls className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                 {loading ? <Loader2 className="animate-spin text-brand-500" /> : <Play size={32} className="opacity-50" />}
                 <span className="text-xs font-bold uppercase tracking-widest mt-2">{loading ? "Rendering Video..." : "Video Placeholder"}</span>
               </div>
             )}
          </div>

          {/* Bottom Half: Context / Curriculum Tabs */}
          <div className="flex-1 glass-panel p-0 rounded-3xl overflow-hidden flex flex-col bg-white border-slate-200">
             
             {/* Tab Headers */}
             <div className="flex border-b border-slate-100">
                <button 
                  onClick={() => setActiveTab('insights')}
                  className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'insights' ? 'bg-slate-50 text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Info size={14} /> Insights
                </button>
                <button 
                  onClick={() => setActiveTab('curriculum')}
                  className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'curriculum' ? 'bg-slate-50 text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <List size={14} /> Curriculum
                </button>
             </div>

             {/* Tab Content */}
             <div className="flex-1 overflow-y-auto custom-scrollbar p-5 relative">
                {activeTab === 'insights' ? (
                  <ul className="space-y-3">
                    {notes.map((note, i) => (
                      <li key={i} className="text-sm text-slate-600 flex gap-3 items-start">
                        <ArrowRight size={14} className="text-brand-500 mt-1 shrink-0" /> {note}
                      </li>
                    ))}
                    
                    {/* Analysis Loading State */}
                    {analyzing && (
                        <li className="p-3 rounded-xl text-sm text-slate-500 border border-slate-100 mt-2 flex items-center gap-2 animate-pulse">
                          <Loader2 size={14} className="animate-spin text-brand-500"/> Analyzing image structure...
                        </li>
                    )}

                    {/* Analysis Result */}
                    {analysis && (
                      <li className="p-3 bg-brand-50 rounded-xl text-sm text-slate-700 border border-brand-100 mt-2">
                          <span className="font-bold text-brand-600 block mb-1 text-xs uppercase flex items-center gap-2">
                            <Eye size={12}/> AI Analysis
                          </span>
                          {analysis.overallAnalysis}
                          <div className="mt-3 flex flex-wrap gap-2">
                            {analysis.elements.map((el, i) => (
                              <span key={i} className="px-2 py-1 rounded bg-white text-[10px] border border-slate-200 text-slate-500 shadow-sm">
                                {el.label}
                              </span>
                            ))}
                          </div>
                      </li>
                    )}
                  </ul>
                ) : (
                  <div className="space-y-2">
                    {activeSubject && chapters.length > 0 ? (
                      <>
                        <div className="text-xs font-bold text-slate-400 uppercase mb-2 flex justify-between">
                          <span>{activeSubject} (Class {activeClass})</span>
                          <span>{chapters.length} Topics</span>
                        </div>
                        {chapters.map((ch, i) => (
                          <button
                            key={i}
                            onClick={() => onTopicClick && onTopicClick(ch)}
                            className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-brand-200 transition-all flex gap-3 group"
                          >
                             <span className="text-xs font-mono text-slate-400 mt-1 group-hover:text-brand-500">{(i+1).toString().padStart(2, '0')}</span>
                             <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 line-clamp-1">{ch}</span>
                          </button>
                        ))}
                      </>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
                        <Book size={24} className="mb-2 opacity-50" />
                        <p className="text-xs text-center">Select a subject from the top menu to see visual topics.</p>
                      </div>
                    )}
                  </div>
                )}
             </div>
          </div>
        </div>

      </div>

      {/* Gallery Strip */}
      {variations.length > 0 && (
        <div className="glass-panel p-4 rounded-3xl bg-white border-slate-200">
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {variations.map((v, idx) => (
              <button
                key={idx}
                onClick={() => { setImageUrl(v); setScale(1); setAnalysis(null); setAnalyzing(true); analyzeImage(v).then(res => {setAnalysis(res); setAnalyzing(false)}) }}
                className={`relative shrink-0 w-24 h-24 rounded-2xl overflow-hidden transition-all duration-300 ${
                  imageUrl === v ? 'ring-2 ring-brand-500 scale-105 shadow-lg' : 'opacity-70 hover:opacity-100 hover:scale-105'
                }`}
              >
                <img src={v} alt={`Var ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};