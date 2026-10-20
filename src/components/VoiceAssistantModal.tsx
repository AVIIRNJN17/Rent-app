import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  X,
  Sparkles,
  Radio,
  AlertCircle,
  Send,
  MessageSquare,
  HelpCircle,
  Tag,
} from 'lucide-react';
import { CatMascot } from './CatMascot';
import { ActiveTab } from '../types';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'hi';
  activeTab?: ActiveTab;
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  language,
  activeTab = 'dashboard',
  onNavigateTab,
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState<boolean>(false);
  const [volumeLevel, setVolumeLevel] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [textInput, setTextInput] = useState<string>('');
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const [selectedTabContext, setSelectedTabContext] = useState<ActiveTab>(activeTab);
  const [transcriptHistory, setTranscriptHistory] = useState<
    Array<{ sender: 'user' | 'assistant'; text: string; time: string }>
  >([]);

  useEffect(() => {
    setSelectedTabContext(activeTab);
  }, [activeTab]);

  // Tab label helper
  const getTabLabel = (tab: ActiveTab): string => {
    const labels: Record<ActiveTab, { en: string; hi: string }> = {
      dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड' },
      rent: { en: 'Rent', hi: 'किराया' },
      electricity: { en: 'Electricity', hi: 'बिजली' },
      expenses: { en: 'Expenses', hi: 'खर्च' },
      ration: { en: 'Ration', hi: 'राशन' },
      settlement: { en: 'Settlement', hi: 'सेटलमेंट' },
      receipt: { en: 'Receipt', hi: 'रसीद' },
      history: { en: 'History', hi: 'इतिहास' },
      settings: { en: 'Settings', hi: 'सेटिंग्स' },
      '3d-studio': { en: '3D Studio', hi: '3D स्टूडियो' },
      maps: { en: 'Nearby Maps', hi: 'मैप्स' },
    };
    return labels[tab]?.[language] || tab;
  };

  // Contextual suggestions based on tab
  const getContextualSuggestions = (
    tab: ActiveTab
  ): Array<{ text: string; actionTab?: ActiveTab }> => {
    switch (tab) {
      case 'rent':
        return [
          {
            text: language === 'hi' ? 'नया किराया एंट्री जोड़ें' : 'Add new rent entry',
            actionTab: 'rent',
          },
          {
            text: language === 'hi' ? 'बकाया किराया भुगतान दिखाएं' : 'Show pending payments',
            actionTab: 'rent',
          },
          {
            text:
              language === 'hi'
                ? 'प्रति रूममेट किराया हिस्सा निकालो'
                : 'Calculate per-person room share',
          },
          {
            text:
              language === 'hi'
                ? 'किराया देने की आखिरी तारीख क्या है?'
                : 'When is the next rent due date?',
          },
        ];

      case 'electricity':
        return [
          {
            text:
              language === 'hi'
                ? 'वर्तमान मीटर रीडिंग से बिल निकालो'
                : 'Calculate bill from current meter reading',
            actionTab: 'electricity',
          },
          {
            text:
              language === 'hi'
                ? 'रूममेट्स के साथ बिजली बिल बांटो'
                : 'Split electricity bill with roommates',
          },
          {
            text:
              language === 'hi'
                ? 'प्रति यूनिट बिजली दर क्या है?'
                : 'What is our per unit tariff rate?',
          },
          {
            text:
              language === 'hi'
                ? 'पिछली मीटर रीडिंग का इतिहास दिखाओ'
                : 'Show previous meter readings',
          },
        ];

      case 'ration':
        return [
          {
            text:
              language === 'hi'
                ? 'मासिक राशन बजट प्रगति चेक करें'
                : 'Check monthly ration budget progress',
            actionTab: 'ration',
          },
          {
            text:
              language === 'hi'
                ? 'राशन सूची में नया ग्रोसरी सामान जोड़ें'
                : 'Add new grocery item to ration list',
            actionTab: 'ration',
          },
          {
            text:
              language === 'hi'
                ? 'राशन बजट में कितने पैसे बचे हैं?'
                : 'How much is left in my ration budget?',
          },
          {
            text:
              language === 'hi'
                ? 'कम बजट वाली पौष्टिक राशन सामग्री सुझाएं'
                : 'Suggest budget-friendly weekly groceries',
          },
        ];

      case 'expenses':
        return [
          {
            text: language === 'hi' ? 'दैनिक कमरा खर्च जोड़ें' : 'Add daily room expense',
            actionTab: 'expenses',
          },
          {
            text:
              language === 'hi'
                ? 'किस रूममेट ने सबसे ज्यादा खर्च किया?'
                : 'Who spent the most on room items?',
          },
          {
            text:
              language === 'hi'
                ? 'वाईफ़ाई और बाई का बिल बराबर बांटो'
                : 'Split WiFi & maid bill equally',
          },
          {
            text:
              language === 'hi'
                ? 'इस महीने के विविध खर्चों का सारांश दें'
                : 'Summarize miscellaneous expenses',
          },
        ];

      case 'settlement':
        return [
          {
            text:
              language === 'hi'
                ? 'फाइनल रूममेट सेटलमेंट निकालो'
                : 'Calculate final roommate settlement',
            actionTab: 'settlement',
          },
          {
            text:
              language === 'hi'
                ? 'किसको कितना पैसा किसको देना है?'
                : 'Who owes whom how much?',
          },
          {
            text:
              language === 'hi'
                ? 'पेमेंट बैलेंस का हिसाब समझाएं'
                : 'Explain net payment balance breakdown',
          },
          {
            text:
              language === 'hi'
                ? 'UPI से बकाया कैसे सेटल करें?'
                : 'How to settle remaining dues via UPI?',
          },
        ];

      case 'receipt':
        return [
          {
            text:
              language === 'hi'
                ? 'मासिक किराया और बिल रसीद बनाएं'
                : 'Generate monthly rent & utility receipt',
            actionTab: 'receipt',
          },
          {
            text:
              language === 'hi'
                ? 'मकान मालिक प्रूफ डाउनलोड करें'
                : 'Download landlord proof PDF slip',
          },
          {
            text:
              language === 'hi'
                ? 'रसीद का वाउचर विवरण दिखाएं'
                : 'Preview receipt voucher breakdown',
          },
          {
            text:
              language === 'hi'
                ? 'रूममेट्स को रसीद शेयर करने का तरीका'
                : 'How to share official rent receipt',
          },
        ];

      case 'history':
        return [
          {
            text:
              language === 'hi'
                ? 'पिछले महीने की तुलना में खर्च दिखाएं'
                : 'Compare this month vs last month expenses',
            actionTab: 'history',
          },
          {
            text:
              language === 'hi'
                ? 'पिछले 6 महीने का किराया इतिहास'
                : 'Show 6-month rent payment history',
          },
          {
            text:
              language === 'hi'
                ? 'किस महीने सबसे ज्यादा बिजली बिल आया?'
                : 'Which month had highest electricity usage?',
          },
          {
            text:
              language === 'hi'
                ? 'सालाना रूम लेजर का सारांश'
                : 'Summarize yearly room expenditure',
          },
        ];

      case '3d-studio':
        return [
          {
            text:
              language === 'hi'
                ? '24K गोल्ड फिनिश में बदलें'
                : 'Switch to 24K Gold finish',
            actionTab: '3d-studio',
          },
          {
            text:
              language === 'hi'
                ? 'एक्सप्लोडेड व्यू अलग-अलग करें'
                : 'Activate exploded view layer separation',
          },
          {
            text:
              language === 'hi'
                ? 'मैस्कॉट का क्राउन और बेस दिखाएं'
                : 'Show royal mascot crown and pedestal',
          },
          {
            text:
              language === 'hi'
                ? 'आइसोमेट्रिक रूम व्यू घुमाएं'
                : 'Rotate isometric room view',
          },
        ];

      case 'maps':
        return [
          {
            text:
              language === 'hi'
                ? 'कमरे के पास किराना स्टोर ढूंढो'
                : 'Find grocery stores near my room',
            actionTab: 'maps',
          },
          {
            text:
              language === 'hi'
                ? 'बिजली बिल भुगतान केंद्र खोजें'
                : 'Locate nearest electricity bill counter',
          },
          {
            text:
              language === 'hi'
                ? '24/7 मेडिकल स्टोर का पता लगाएं'
                : 'Find 24/7 medical store or pharmacy',
          },
          {
            text:
              language === 'hi'
                ? 'गूगल मैप्स में नेविगेशन दिखाएं'
                : 'Open directions in Google Maps',
          },
        ];

      case 'settings':
        return [
          {
            text:
              language === 'hi'
                ? 'मकान मालिक और कमरे का पता बदलें'
                : 'Change landlord details and room address',
            actionTab: 'settings',
          },
          {
            text:
              language === 'hi'
                ? 'हिंदी और अंग्रेजी भाषा बदलें'
                : 'Switch language between Hindi & English',
          },
          {
            text:
              language === 'hi'
                ? 'रूम डेटा का बैकअप सुरक्षित करें'
                : 'Backup room data to JSON file',
          },
          {
            text:
              language === 'hi'
                ? 'ऐप को होम स्क्रीन पर इनस्टॉल करें'
                : 'Install app as Progressive Web App',
          },
        ];

      case 'dashboard':
      default:
        return [
          {
            text:
              language === 'hi'
                ? 'इस महीने का पूरा हिसाब बताओ'
                : "Summarize this month's rent & expenses",
            actionTab: 'dashboard',
          },
          {
            text:
              language === 'hi'
                ? 'इस महीने का किराया कितना बाकी है?'
                : 'How much rent is pending this month?',
          },
          {
            text:
              language === 'hi'
                ? 'बिजली का बिल और रीडिंग बताओ'
                : 'What is my electricity bill & reading?',
          },
          {
            text:
              language === 'hi'
                ? 'राशन बजट में कितने पैसे बचे हैं?'
                : 'How much is left in my ration budget?',
          },
        ];
    }
  };

  // Web Audio & WebSocket References
  const wsRef = useRef<WebSocket | null>(null);
  const isSessionReadyRef = useRef<boolean>(false);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const isMutedRef = useRef<boolean>(false);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Helper: Float32 to 16-bit PCM ArrayBuffer
  const floatTo16BitPCM = (input: Float32Array): ArrayBuffer => {
    const output = new DataView(new ArrayBuffer(input.length * 2));
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return output.buffer;
  };

  // Helper: ArrayBuffer to Base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Helper: Base64 to Float32Array (24kHz model output)
  const base64ToFloat32Array = (base64: string): Float32Array => {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const dataView = new DataView(bytes.buffer);
    const numSamples = Math.floor(bytes.length / 2);
    const float32 = new Float32Array(numSamples);
    for (let i = 0; i < numSamples; i++) {
      const int16 = dataView.getInt16(i * 2, true);
      float32[i] = int16 < 0 ? int16 / 0x8000 : int16 / 0x7fff;
    }
    return float32;
  };

  // Stop currently playing scheduled audio
  const stopAudioPlayback = () => {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch (e) {
        // ignore
      }
    });
    activeSourcesRef.current = [];
    if (outputAudioCtxRef.current) {
      nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
    }
    setIsModelSpeaking(false);
  };

  // Play audio chunk at 24kHz seamlessly
  const playAudioChunk = (audioBase64: string) => {
    try {
      const float32Data = base64ToFloat32Array(audioBase64);
      if (float32Data.length === 0) return;

      if (!outputAudioCtxRef.current) {
        outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });
      }

      const ctx = outputAudioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const audioBuffer = ctx.createBuffer(1, float32Data.length, 24000);
      audioBuffer.getChannelData(0).set(float32Data);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const currentTime = ctx.currentTime;
      const startTime = Math.max(currentTime, nextStartTimeRef.current);
      source.start(startTime);
      nextStartTimeRef.current = startTime + audioBuffer.duration;

      activeSourcesRef.current.push(source);
      setIsModelSpeaking(true);

      source.onended = () => {
        const idx = activeSourcesRef.current.indexOf(source);
        if (idx !== -1) {
          activeSourcesRef.current.splice(idx, 1);
        }
        if (activeSourcesRef.current.length === 0) {
          setIsModelSpeaking(false);
        }
      };
    } catch (err) {
      console.error('Audio chunk playback error:', err);
    }
  };

  // Establish connection when modal opens
  const connectSession = async () => {
    setIsConnecting(true);
    setErrorMessage(null);

    try {
      // 1. Setup Audio Input
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      inputAudioCtxRef.current = inputCtx;

      const sourceNode = inputCtx.createMediaStreamSource(stream);
      // ScriptProcessor for 16kHz PCM streaming
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorNodeRef.current = processor;

      // 2. Setup WebSocket to backend bridge
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Voice WebSocket opened; waiting for Gemini session');
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.ready) {
            isSessionReadyRef.current = true;
            setIsConnected(true);
            setIsConnecting(false);
          }
          if (msg.error) {
            isSessionReadyRef.current = false;
            setIsConnected(false);
            setIsConnecting(false);
            setErrorMessage(msg.error);
          }
          if (msg.interrupted) {
            stopAudioPlayback();
          }
          if (msg.audio) {
            playAudioChunk(msg.audio);
          }
          if (msg.text) {
            setTranscriptHistory((prev) => {
              const last = prev[prev.length - 1];
              const sender = msg.sender || 'assistant';
              if (last && last.sender === sender) {
                return [
                  ...prev.slice(0, -1),
                  { ...last, text: `${last.text} ${msg.text}`.trim() },
                ];
              }
              return [
                ...prev,
                {
                  sender,
                  text: msg.text,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ];
            });
          }
        } catch (e) {
          console.error('Error handling WebSocket message:', e);
        }
      };

      ws.onerror = (e) => {
        console.error('WebSocket error:', e);
        setErrorMessage(
          language === 'hi'
            ? 'वॉइस सर्विस कनेक्ट नहीं हो सकी। कृपया दोबारा कोशिश करें।'
            : 'Voice service connection failed. Please retry and check server logs.'
        );
        setIsConnecting(false);
      };

      ws.onclose = () => {
        console.log('Gemini Live WebSocket disconnected');
        isSessionReadyRef.current = false;
        setIsConnected(false);
        setIsConnecting(false);
        setErrorMessage((previous) => previous || 'Voice connection closed. Please retry.');
      };

      // 3. Audio Processing: stream PCM chunks
      processor.onaudioprocess = (e) => {
        if (isMutedRef.current || !isSessionReadyRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          return;
        }

        const inputChannel = e.inputBuffer.getChannelData(0);

        // Simple volume meter calculation
        let sum = 0;
        for (let i = 0; i < inputChannel.length; i++) {
          sum += inputChannel[i] * inputChannel[i];
        }
        const rms = Math.sqrt(sum / inputChannel.length);
        setVolumeLevel(Math.min(100, Math.round(rms * 160)));

        // Send 16kHz PCM
        const pcmBuffer = floatTo16BitPCM(inputChannel);
        const base64Audio = arrayBufferToBase64(pcmBuffer);
        wsRef.current.send(JSON.stringify({ audio: base64Audio }));
      };

      sourceNode.connect(processor);
      processor.connect(inputCtx.destination);
    } catch (err: any) {
      console.error('Microphone or connection initialization error:', err);
      setIsConnecting(false);
      setErrorMessage(
        err.name === 'NotAllowedError'
          ? language === 'hi'
            ? 'माइक्रोफ़ोन की अनुमति अस्वीकृत है। कृपया ब्राउज़र सेटिंग्स में अनुमति दें।'
            : 'Microphone permission was denied. Please allow microphone access in your browser.'
          : err.message || 'Could not connect to Voice Companion'
      );
    }
  };

  // Close session cleanly
  const disconnectSession = () => {
    isSessionReadyRef.current = false;
    stopAudioPlayback();

    if (processorNodeRef.current) {
      processorNodeRef.current.disconnect();
      processorNodeRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close();
      outputAudioCtxRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setVolumeLevel(0);
  };

  useEffect(() => {
    if (isOpen) {
      connectSession();
    } else {
      disconnectSession();
    }
    return () => {
      disconnectSession();
    };
  }, [isOpen]);

  // Send quick text prompt to model
  const handleSendTextPrompt = (text: string) => {
    if (!text.trim()) return;

    if (isSessionReadyRef.current && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text }));
      setTranscriptHistory((prev) => [
        ...prev,
        {
          sender: 'user',
          text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setTextInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-[#141311] border-2 border-amber-500/40 shadow-2xl overflow-hidden flex flex-col text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <CatMascot size={38} showGlow={true} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-cinzel text-base sm:text-lg font-bold text-amber-100 flex items-center gap-1.5">
                  <span>ROYAL</span>
                  <span className="text-[#D4AF37]">VOICE COMPANION</span>
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-amber-500/20 text-[#D4AF37] border border-amber-500/40">
                  gemini-3.8-live
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                {language === 'hi'
                  ? 'अभिषेक रंजन का रियल-टाइम वॉइस असिस्टेंट'
                  : 'Real-time conversational voice assistant by Abhishek Ranjan'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              title={showTranscript ? 'View Visualizer' : 'View Live Transcript'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                showTranscript
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {showTranscript ? (language === 'hi' ? 'ऑर्ब देखें' : 'Visualizer') : (language === 'hi' ? 'ट्रांसक्रिप्ट' : 'Transcript')}
              </span>
              {transcriptHistory.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40">
                  {transcriptHistory.length}
                </span>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Central Audio & Visualizer Display */}
        <div className="p-6 flex flex-col items-center justify-center text-center space-y-6">
          {/* Animated Mascot Orb / Status Circle */}
          <div className="relative flex items-center justify-center">
            {/* Pulsing halo wave */}
            <div
              className={`absolute rounded-full transition-all duration-300 pointer-events-none ${
                isModelSpeaking
                  ? 'w-44 h-44 bg-amber-500/25 animate-ping'
                  : isConnected && !isMuted
                  ? 'w-36 h-36 bg-amber-500/15'
                  : 'w-28 h-28 bg-zinc-800/20'
              }`}
              style={{
                transform: `scale(${1 + volumeLevel * 0.015})`,
              }}
            />

            <div
              className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center border-2 transition-all shadow-xl ${
                isModelSpeaking
                  ? 'border-amber-400 bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 shadow-amber-500/50 scale-105'
                  : isConnected && !isMuted
                  ? 'border-amber-500/50 bg-[#1A1815] shadow-amber-500/20'
                  : 'border-zinc-700 bg-zinc-900'
              }`}
            >
              <CatMascot size={58} showGlow={isModelSpeaking || isConnected} />
            </div>

            {/* Speaking / Live Badge */}
            <div className="absolute -bottom-2 z-20 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border shadow-md flex items-center gap-1.5 bg-zinc-950">
              {isConnecting ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  <span className="text-yellow-300">
                    {language === 'hi' ? 'कनेक्ट हो रहा है...' : 'Connecting...'}
                  </span>
                </>
              ) : isModelSpeaking ? (
                <>
                  <Volume2 className="w-3 h-3 text-amber-400 animate-bounce" />
                  <span className="text-amber-300 font-bold">
                    {language === 'hi' ? 'बोल रहा है...' : 'Speaking...'}
                  </span>
                </>
              ) : isConnected ? (
                <>
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span className="text-emerald-300">
                    {language === 'hi' ? 'सुन रहा है (लाइव)' : 'Listening (Live)'}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-zinc-500" />
                  <span className="text-zinc-400">Offline</span>
                </>
              )}
            </div>
          </div>

          {/* Sound Wave Bars */}
          {!showTranscript && (
            <div className="h-10 flex items-center justify-center gap-1.5 w-full max-w-xs">
              {[40, 70, 100, 85, 50, 95, 60, 80, 45, 90, 65, 75].map((baseHeight, idx) => {
                const active = isModelSpeaking || (isConnected && !isMuted && volumeLevel > 5);
                const height = active ? Math.min(100, Math.max(15, (baseHeight * (volumeLevel + 30)) / 100)) : 10;
                return (
                  <div
                    key={idx}
                    className="w-1.5 rounded-full transition-all duration-75 bg-gradient-to-t from-amber-600 to-amber-300"
                    style={{
                      height: `${height}%`,
                      opacity: active ? 0.95 : 0.25,
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Live Subtitle Bubble (Visualizer Mode) */}
          {!showTranscript && transcriptHistory.length > 0 && (
            <div className="w-full max-w-md px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-100 flex items-start gap-2 text-left animate-in fade-in">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold text-amber-300 mr-1.5">
                  {transcriptHistory[transcriptHistory.length - 1].sender === 'user' ? 'You:' : 'Gemini Live:'}
                </span>
                <span>{transcriptHistory[transcriptHistory.length - 1].text}</span>
              </div>
            </div>
          )}

          {/* Full Transcript View Mode */}
          {showTranscript && (
            <div className="w-full max-h-56 overflow-y-auto space-y-2.5 p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-left text-xs custom-scrollbar">
              {transcriptHistory.length === 0 ? (
                <div className="text-center py-6 text-zinc-500 text-xs">
                  {language === 'hi'
                    ? 'बातचीत शुरू करने के लिए माइक में बोलें या नीचे सुझाव चुनें।'
                    : 'Start speaking into your mic or tap a prompt below to see the live transcript.'}
                </div>
              ) : (
                transcriptHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-amber-500 text-zinc-950 font-medium rounded-br-none shadow-sm'
                          : 'bg-zinc-800 text-amber-100 border border-amber-500/20 rounded-bl-none shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] opacity-75">
                        <span className="font-bold uppercase tracking-wider">
                          {msg.sender === 'user' ? 'You' : 'Gemini 3.8 Live'}
                        </span>
                        <span>•</span>
                        <span>{msg.time}</span>
                      </div>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="w-full p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{errorMessage}</p>
                <button
                  onClick={connectSession}
                  className="mt-1 text-[11px] underline text-rose-200 font-bold hover:text-white"
                >
                  {language === 'hi' ? 'पुनः प्रयास करें' : 'Retry Connection'}
                </button>
              </div>
            </div>
          )}

          {/* Dynamic Contextual Voice Suggestions */}
          <div className="w-full text-left space-y-2.5">
            <div className="flex items-center justify-between text-xs text-amber-300/90 font-semibold">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>
                  {language === 'hi'
                    ? `${getTabLabel(selectedTabContext)} सुझाव:`
                    : `${getTabLabel(selectedTabContext)} Context Suggestions:`}
                </span>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-[#D4AF37] border border-amber-500/30">
                {selectedTabContext}
              </span>
            </div>

            {/* Quick Context Tab Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[10px]">
              {(['rent', 'electricity', 'ration', 'expenses', 'settlement', 'receipt', 'history', '3d-studio', 'maps'] as ActiveTab[]).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTabContext(tab)}
                    className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
                      selectedTabContext === tab
                        ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    {getTabLabel(tab)}
                  </button>
                )
              )}
            </div>

            {/* Contextual Suggestions for Current Active Tab */}
            <div className="flex flex-wrap gap-1.5">
              {getContextualSuggestions(selectedTabContext).map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    handleSendTextPrompt(item.text);
                    if (item.actionTab && onNavigateTab && item.actionTab !== activeTab) {
                      onNavigateTab(item.actionTab);
                    }
                  }}
                  className="text-left text-[11px] px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-amber-500/25 hover:border-amber-500/50 text-zinc-300 hover:text-amber-200 transition-all active:scale-95 flex items-center gap-1.5 group"
                >
                  <Tag className="w-2.5 h-2.5 text-amber-500/70 group-hover:text-amber-400 shrink-0" />
                  <span>"{item.text}"</span>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Text Input Row */}
          <div className="w-full flex items-center gap-2 pt-2 border-t border-zinc-800">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendTextPrompt(textInput);
              }}
              placeholder={
                language === 'hi'
                  ? 'या यहाँ टाइप करके पूछें...'
                  : 'Or type a question for Gemini...'
              }
              className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 focus:border-amber-500 text-xs text-white placeholder-zinc-500 outline-none"
            />
            <button
              onClick={() => handleSendTextPrompt(textInput)}
              disabled={!textInput.trim() || !isConnected}
              className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-zinc-950 border-t border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Mic Toggle Button */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              disabled={!isConnected}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                isMuted
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isMuted ? (language === 'hi' ? 'माइक बंद' : 'Unmute Mic') : (language === 'hi' ? 'माइक चालू' : 'Mute Mic')}</span>
            </button>

            {/* Stop playback if speaking */}
            {isModelSpeaking && (
              <button
                onClick={stopAudioPlayback}
                className="px-3 py-2 rounded-2xl text-xs font-bold bg-zinc-800 text-zinc-300 hover:text-white"
              >
                {language === 'hi' ? 'रोकें' : 'Interrupt'}
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
          >
            {language === 'hi' ? 'समाप्त करें' : 'End Call'}
          </button>
        </div>
      </div>
    </div>
  );
};
