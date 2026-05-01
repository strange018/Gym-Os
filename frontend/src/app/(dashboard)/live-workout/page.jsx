"use client";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  CameraOff, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight,
  Info,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Timer,
  Clock,
  X,
  Loader2,
  Minus,
  Plus,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import api from '@/lib/axios';

// MediaPipe Pose detection configuration
const POSE_CONNECTIONS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Arms
  [11, 23], [12, 24], [23, 24], // Torso
  [23, 25], [24, 26], [25, 27], [26, 28], // Legs
  [27, 29], [28, 30], [29, 31], [30, 32], [27, 31], [28, 32] // Feet
];

export default function LiveWorkout() {
  const router = useRouter();
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [formFeedback, setFormFeedback] = useState("Align your body with the camera");
  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(60);
  const [totalRestTime, setTotalRestTime] = useState(60);
  const [isCamLoading, setIsCamLoading] = useState(false);
  const [error, setError] = useState(null);
  const [targetReps, setTargetReps] = useState(10);
  const [targetSets, setTargetSets] = useState(3);
  const [isExerciseComplete, setIsExerciseComplete] = useState(false);
  
  // Real-time Statistics
  const [sessionDuration, setSessionDuration] = useState(0);
  const [activeTime, setActiveTime] = useState(0);
  const [restDuration, setRestDuration] = useState(0);
  const [cumulativeReps, setCumulativeReps] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [completedExercises, setCompletedExercises] = useState([]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const currentExercise = workoutPlan[currentExerciseIndex] || {
    name: "Loading...",
    sets: 3,
    reps: "10-12",
    reason: ""
  };

  const stateRef = useRef({ 
    targetReps, 
    targetSets,
    isResting, 
    isExerciseComplete, 
    currentExercise, 
    currentSet 
  });

  useEffect(() => {
    stateRef.current = { 
      targetReps, 
      targetSets,
      isResting, 
      isExerciseComplete, 
      currentExercise, 
      currentSet 
    };
  }, [targetReps, targetSets, isResting, isExerciseComplete, currentExercise, currentSet]);

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null;
  const { emit } = useSocket(user?._id);

  useEffect(() => {
    const savedPlan = localStorage.getItem('current_workout_plan');
    if (savedPlan) {
      const plan = JSON.parse(savedPlan);
      setWorkoutPlan(plan);
      if (plan[0]?.reps) {
        setTargetReps(parseInt(plan[0].reps) || 10);
      }
      if (plan[0]?.sets) {
        setTargetSets(parseInt(plan[0].sets) || 3);
      }
    } else {
      router.push('/dashboard');
    }
  }, []);

  useEffect(() => {
    if (workoutPlan[currentExerciseIndex]?.reps) {
      setTargetReps(parseInt(workoutPlan[currentExerciseIndex].reps) || 10);
      setTargetSets(parseInt(workoutPlan[currentExerciseIndex].sets) || 3);
      setIsExerciseComplete(false);
    }
  }, [currentExerciseIndex]);



  useEffect(() => {
    let interval;
    if (isCameraOn && !isPaused && !isExerciseComplete) {
      if (!sessionStarted) setSessionStarted(true);
      interval = setInterval(() => {
        setSessionDuration(prev => prev + 1);
        if (isResting) {
          setRestDuration(prev => prev + 1);
        } else {
          setActiveTime(prev => prev + 1);
          // Simple calorie estimate: ~0.1 cal per active second
          setCaloriesBurned(prev => prev + 0.1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCameraOn, isPaused, isResting, isExerciseComplete, sessionStarted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const nextExercise = async () => {
    // Save current exercise results
    const finishedEx = {
      name: currentExercise.name,
      sets: targetSets,
      reps: targetReps,
      weight: 0 // In a real app, user would input this
    };
    
    const updatedCompleted = [...completedExercises, finishedEx];
    setCompletedExercises(updatedCompleted);

    if (currentExerciseIndex < workoutPlan.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSet(1);
      setRepCount(0);
    } else {
      // Workout Complete - Log to Backend
      try {
        await api.post('/workouts/log', {
          name: "Daily Training Session",
          duration: Math.floor(sessionDuration / 60),
          calories: Math.floor(caloriesBurned),
          volume: cumulativeReps * 20, // Simplified volume calculation
          exercises: updatedCompleted
        });

        emit('workout_complete', {
          userId: user?._id,
          stats: {
            duration: sessionDuration,
            reps: cumulativeReps,
            calories: caloriesBurned
          }
        });
        alert("Workout Complete! Performance data synchronized.");
        router.push('/dashboard');
      } catch (err) {
        console.error("Failed to log workout session", err);
        alert("Workout complete, but failed to sync stats. Check connection.");
        router.push('/dashboard');
      }
    }
  };

  const handleNextSet = () => {
    const { targetSets: tSets, currentSet: cS, isResting: iR } = stateRef.current;
    
    if (iR) {
      skipRest();
      return;
    }
    
    if (cS >= tSets) {
      setIsExerciseComplete(true);
      return;
    }

    setIsResting(true);
    setRestTimeLeft(totalRestTime);
  };

  const skipRest = () => {
    finishRest();
  };

  const finishRest = () => {
    setIsResting(false);
    const { targetSets: tSets } = stateRef.current;
    if (currentSet < tSets) {
      setCurrentSet(prev => prev + 1);
      setRepCount(0);
    } else {
      setIsExerciseComplete(true);
    }
  };

  const handleNextExercise = () => {
    setIsExerciseComplete(false);
    nextExercise();
  };

  const adjustRestTime = (seconds) => {
    setRestTimeLeft(prev => Math.max(0, prev + seconds));
    setTotalRestTime(prev => Math.max(0, prev + seconds));
  };

  // Rest Timer Logic
  useEffect(() => {
    let timer;
    if (isResting && restTimeLeft > 0) {
      timer = setInterval(() => {
        setRestTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isResting && restTimeLeft === 0) {
      finishRest();
    }
    return () => clearInterval(timer);
  }, [isResting, restTimeLeft]);

  // Toggle Camera
  const toggleCamera = async () => {
    if (isCameraOn) {
      const stream = videoRef.current.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
      videoRef.current.srcObject = null;
      setIsCameraOn(false);
      setError(null);
    } else {
      setIsCamLoading(true);
      setError(null);
      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Use explicit play() and handle potential promise rejection
          try {
            await videoRef.current.play();
          } catch (playErr) {
            console.warn("Video play interrupted:", playErr);
          }
          
          setIsCameraOn(true);
          setError(null);
        } else {
          throw new Error("Hardware acceleration failure.");
        }
      } catch (err) {
        console.error("Camera access error:", err);
        if (stream) {
          stream.getTracks().forEach(t => t.stop());
        }
        const errorMsg = err.name === 'NotAllowedError' 
          ? "Camera permission denied. Check your browser settings." 
          : "Could not connect to camera. Ensure no other app is using it.";
        setError(errorMsg);
      } finally {
        setIsCamLoading(false);
      }
    }
  };

  const calculateAngle = (p1, p2, p3) => {
    const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
  };

  const poseRef = useRef(null);
  const repState = useRef('up');
  const minPos = useRef(0);
  const maxPos = useRef(0);

  // Initialize MediaPipe Pose
  useEffect(() => {
    let pose;
    const initPose = async () => {
      try {
        // Import MediaPipe dynamically to avoid SSR issues
        const { Pose } = await import('@mediapipe/pose');

        pose = new Pose({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          }
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        pose.onResults(onResults);
        poseRef.current = pose;
      } catch (err) {
        console.error("AI Initialization failed:", err);
        setError("AI movement tracking failed to load. Please refresh.");
      }
    };

    if (typeof window !== 'undefined') {
      initPose();
    }

    return () => {
      if (pose) {
        pose.close();
      }
    };
  }, []);

  const onResults = (results) => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw landmarks if detected
    if (results.poseLandmarks) {
      // Draw connections
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 2;
      POSE_CONNECTIONS.forEach(([i, j]) => {
        const p1 = results.poseLandmarks[i];
        const p2 = results.poseLandmarks[j];
        if (p1 && p2 && p1.visibility > 0.5 && p2.visibility > 0.5) {
          ctx.beginPath();
          ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
          ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
          ctx.stroke();
        }
      });

      // Draw points
      ctx.fillStyle = '#ffffff';
      results.poseLandmarks.forEach((landmark) => {
        if (landmark.visibility > 0.5) {
          ctx.beginPath();
          ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 3, 0, 2 * Math.PI);
          ctx.fill();
        }
      });

      // Simple Rep Counting Logic (Vertical motion of wrists relative to shoulders)
      // Works for Squats, Overhead Press, Bench Press, etc.
      // Get relevant landmarks
      const landmarks = results.poseLandmarks;
      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];
      const leftElbow = landmarks[13];
      const rightElbow = landmarks[14];
      const leftWrist = landmarks[15];
      const rightWrist = landmarks[16];
      const leftHip = landmarks[23];
      const rightHip = landmarks[24];
      const leftKnee = landmarks[25];
      const rightKnee = landmarks[26];
      const leftAnkle = landmarks[27];
      const rightAnkle = landmarks[28];

      const { targetReps: tReps, targetSets: tSets, isResting: iR, isExerciseComplete: iEC, currentExercise: cE, currentSet: cS } = stateRef.current;
      const exName = cE.name.toLowerCase();

      // --- Exercise Specific Logic ---
      let currentAngle = 0;
      let thresholdDown = 0;
      let thresholdUp = 0;

      if (exName.includes('squat')) {
        // Squat Logic: Knee angle
        const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
        const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
        currentAngle = (leftKneeAngle + rightKneeAngle) / 2;
        thresholdDown = 90; // Deep squat
        thresholdUp = 160;  // Standing
        
        if (repState.current === 'up' && currentAngle < thresholdDown) {
          repState.current = 'down';
          setFormFeedback("Good depth! Now stand up.");
        } else if (repState.current === 'down' && currentAngle > thresholdUp) {
          processRep();
        }
      } else if (exName.includes('curl')) {
        // Bicep Curl Logic: Elbow angle
        const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
        const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
        currentAngle = (leftElbowAngle + rightElbowAngle) / 2;
        thresholdDown = 45;  // Curled up
        thresholdUp = 150;   // Arm extended
        
        if (repState.current === 'up' && currentAngle < thresholdDown) {
          repState.current = 'down';
          setFormFeedback("Great squeeze! Control the descent.");
        } else if (repState.current === 'down' && currentAngle > thresholdUp) {
          processRep();
        }
      } else {
        // Default Logic (Presses/Pushes): Wrist relative to shoulder
        const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
        const avgWristY = (leftWrist.y + rightWrist.y) / 2;
        const relativePos = avgWristY - avgShoulderY;

        if (repState.current === 'up' && relativePos > 0.15) {
          repState.current = 'down';
          setFormFeedback("Push it back up!");
        } else if (repState.current === 'down' && relativePos < 0.05) {
          processRep();
        }
      }

      function processRep() {
        repState.current = 'up';
        setCumulativeReps(prev => prev + 1);
        // Bonus calories for a completed rep
        setCaloriesBurned(prev => prev + 0.5);
        
        setRepCount(prev => {
          const newVal = Math.min(tReps, prev + 1);
          emit('workout_progress', {
            userId: user?._id,
            exercise: cE.name,
            rep: newVal,
            set: cS,
            activeTime: activeTime,
            calories: caloriesBurned,
            timestamp: new Date()
          });
          
          if (newVal >= tReps && !iR && !iEC) {
            if (cS >= tSets) {
              setFormFeedback("Exercise Complete!");
            } else {
              setFormFeedback("Goal Reached! Starting rest...");
            }
            handleNextSet();
          } else {
            setFormFeedback("Great rep! Keep it up.");
          }
          return newVal;
        });
      }
    }
    ctx.restore();
  };

  // Camera Processing Loop
  useEffect(() => {
    let animationId;
    const processVideo = async () => {
      if (isCameraOn && !isPaused && videoRef.current && poseRef.current) {
        if (videoRef.current.readyState >= 2) {
          await poseRef.current.send({ image: videoRef.current });
        }
      }
      animationId = requestAnimationFrame(processVideo);
    };

    if (isCameraOn) {
      processVideo();
    }

    return () => cancelAnimationFrame(animationId);
  }, [isCameraOn, isPaused]);

  // Handle Canvas Resize
  useEffect(() => {
    const updateCanvasSize = () => {
      if (videoRef.current && canvasRef.current) {
        canvasRef.current.width = videoRef.current.videoWidth || 640;
        canvasRef.current.height = videoRef.current.videoHeight || 480;
      }
    };
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [isCameraOn]);

  return (
    <div className="h-full flex flex-col lg:flex-row gap-8 pb-20">
      {/* Left Column: Camera View */}
      <div className="flex-1 flex flex-col gap-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Live <span className="text-gradient">AI Training</span></h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">Active Session</p>
            </div>
          </div>
        </header>

        <div className="relative aspect-video bg-muted rounded-[2.5rem] border border-white/5 overflow-hidden group shadow-2xl">
          {!isCameraOn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 z-20">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-inner">
                <Camera size={40} className="text-muted-foreground animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold mb-2">AI Vision Ready</h3>
              <p className="text-muted-foreground max-w-sm mb-8">
                Position your device 6-8 feet away. AI will automatically track your form.
              </p>
              
              {error && (
                <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <button 
                onClick={toggleCamera}
                disabled={isCamLoading}
                className="bg-primary text-primary-foreground px-10 py-4 rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-all shadow-[0_0_30px_rgba(0,242,254,0.4)] disabled:opacity-50"
              >
                {isCamLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Camera size={20} />
                )}
                {isCamLoading ? "Initializing..." : "Begin Session"}
              </button>
            </div>
          )}
          
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className={cn("absolute inset-0 w-full h-full object-cover", !isCameraOn && "opacity-0 pointer-events-none")} 
          />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

          {/* AI Overlay elements */}
          {isCameraOn && (
            <div className="absolute inset-0 p-8 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass p-4 rounded-2xl flex items-center gap-4 border-emerald-500/30"
                >
                  <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                    <CheckCircle2 className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">Current Task</p>
                    <p className="font-bold line-clamp-1">{currentExercise.name}</p>
                  </div>
                </motion.div>
                
                <div className="flex gap-4">
                  <div className="glass px-6 py-3 rounded-2xl text-center border-white/10">
                    <p className="text-[10px] uppercase font-bold tracking-widest opacity-50">Heart Rate</p>
                    <p className="text-xl font-bold">124 <span className="text-xs">BPM</span></p>
                  </div>
                  <div className="glass px-6 py-3 rounded-2xl text-center border-white/10">
                    <p className="text-[10px] uppercase font-bold tracking-widest opacity-50">Intensity</p>
                    <p className="text-xl font-bold text-orange-500">High</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={formFeedback}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-black/60 backdrop-blur-md px-10 py-5 rounded-full border border-white/10 text-xl font-semibold flex items-center gap-3 mb-8 shadow-2xl"
                  >
                    <Sparkles className="text-primary w-6 h-6" />
                    {isResting ? `Resting: ${restTimeLeft}s` : formFeedback}
                  </motion.div>
                </AnimatePresence>
                
                <div className="flex items-center gap-6">
                  <button className="w-16 h-16 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-all border-white/10">
                    <RotateCcw size={24} />
                  </button>
                  <button 
                    onClick={() => setIsPaused(!isPaused)}
                    className={cn(
                      "w-20 h-20 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-all",
                      isPaused ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground"
                    )}
                  >
                    {isPaused ? <Play size={32} fill="currentColor" /> : <Pause size={32} fill="currentColor" />}
                  </button>
                  <button 
                    onClick={handleNextSet}
                    className={cn(
                      "w-16 h-16 rounded-full glass flex items-center justify-center transition-all border-white/10",
                      isResting ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10" : "hover:bg-white/10"
                    )}
                  >
                    {isResting ? <CheckCircle2 size={24} /> : <ChevronRight size={24} />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

        {/* Right Sidebar - Dynamic Stats Panel */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6 h-[calc(100vh-180px)] overflow-y-auto pr-2 custom-scrollbar pb-10">
          {/* Performance Pulse - REAL TIME STATS */}
          <section className="glass p-6 rounded-[2.5rem] border border-primary/20 shadow-[0_0_40px_rgba(0,242,254,0.1)] relative overflow-hidden flex-shrink-0">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="text-primary animate-pulse" size={40} />
            </div>
            <h3 className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
              Performance Pulse
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                <div className="flex items-center gap-2 text-muted-foreground text-[10px] uppercase font-bold mb-1">
                  <Clock size={12} className="text-primary" /> Session
                </div>
                <div className="text-2xl font-black">{formatTime(sessionDuration)}</div>
              </div>
              <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                <div className="flex items-center gap-2 text-muted-foreground text-[10px] uppercase font-bold mb-1">
                  <Timer size={12} className="text-emerald-500" /> Active
                </div>
                <div className="text-2xl font-black text-emerald-400">{formatTime(activeTime)}</div>
              </div>
              <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                <div className="flex items-center gap-2 text-muted-foreground text-[10px] uppercase font-bold mb-1">
                  <RotateCcw size={12} className="text-amber-500" /> Total Reps
                </div>
                <div className="text-2xl font-black">{cumulativeReps}</div>
              </div>
              <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                <div className="flex items-center gap-2 text-muted-foreground text-[10px] uppercase font-bold mb-1">
                  <Sparkles size={12} className="text-rose-500" /> Calories
                </div>
                <div className="text-2xl font-black text-rose-400">{Math.floor(caloriesBurned)}</div>
              </div>
            </div>
          </section>

          <section className="glass p-8 rounded-[2.5rem] border border-white/5 shadow-xl relative overflow-hidden flex-shrink-0">
          <AnimatePresence mode="wait">
            {isExerciseComplete ? (
              <motion.div
                key="exercise-complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="flex flex-col items-center py-6 text-center"
              >
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                  <CheckCircle2 className="text-emerald-500" size={40} />
                </div>
                <h2 className="text-3xl font-bold mb-2">Exercise Complete!</h2>
                <p className="text-sm text-muted-foreground mb-8 max-w-[240px]">
                  You've crushed all {targetSets} sets of {currentExercise.name}.
                </p>
                <button 
                  onClick={handleNextExercise}
                  className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:scale-105 transition-all"
                >
                  Start Next Exercise
                  <ArrowRight size={20} />
                </button>
              </motion.div>
            ) : !isResting ? (
              <motion.div
                key="exercise-info"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gradient mb-1">{currentExercise.name}</h2>
                  <p className="text-sm text-muted-foreground italic leading-relaxed">
                    {currentExercise.reason}
                  </p>
                </div>

                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Set {currentSet} of {targetSets}</span>
                    <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                      <button 
                        onClick={() => setTargetSets(prev => Math.max(currentSet, prev - 1))}
                        className="p-1 hover:text-primary transition-colors"
                        title="Reduce Sets"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-primary font-bold min-w-[3rem] text-center">Sets: {targetSets}</span>
                      <button 
                        onClick={() => setTargetSets(prev => prev + 1)}
                        className="p-1 hover:text-primary transition-colors"
                        title="Increase Sets"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Rep Progress</span>
                    <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                      <button 
                        onClick={() => setTargetReps(prev => Math.max(1, prev - 1))}
                        className="p-1 hover:text-primary transition-colors"
                        title="Reduce Reps"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-primary font-bold min-w-[3rem] text-center">Goal: {targetReps}</span>
                      <button 
                        onClick={() => setTargetReps(prev => prev + 1)}
                        className="p-1 hover:text-primary transition-colors"
                        title="Increase Reps"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-end gap-2 mb-8">
                  <motion.span 
                    key={repCount}
                    animate={repCount >= targetReps ? { 
                      scale: [1, 1.2, 1], 
                      color: ['#ffffff', '#00f2fe', '#ffffff'] 
                    } : { 
                      scale: [1, 1.1, 1] 
                    }}
                    className="text-8xl font-black leading-none"
                  >
                    {repCount}
                  </motion.span>
                  <span className="text-2xl font-bold text-muted-foreground mb-3">/ {targetReps}</span>
                </div>
                
                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-10">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (repCount / targetReps) * 100)}%` }}
                    className="h-full bg-primary shadow-[0_0_15px_rgba(0,242,254,0.5)]" 
                  />
                </div>

                <div className="p-5 rounded-3xl bg-primary/5 border border-primary/20 flex items-start gap-3">
                  <Info className="text-primary w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed text-foreground/80">
                    <span className="font-bold text-primary">AI Insight:</span> Keep your shoulders stable. You've hit {repCount} perfect reps so far.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="rest-timer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="flex flex-col items-center py-4"
              >
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 border border-primary/20 shadow-[0_0_30px_rgba(0,242,254,0.1)]">
                  <Timer className="text-primary" size={40} />
                </div>
                <h2 className="text-2xl font-bold mb-1">Rest Period</h2>
                <p className="text-sm text-muted-foreground mb-6">Take a breath before next set</p>

                {/* Presets */}
                <div className="flex gap-2 mb-8">
                  {[30, 60, 90].map(time => (
                    <button 
                      key={time}
                      onClick={() => {
                        setRestTimeLeft(time);
                        setTotalRestTime(time);
                      }}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-bold border transition-all uppercase tracking-widest",
                        totalRestTime === time ? "bg-primary text-primary-foreground border-primary" : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                      )}
                    >
                      {time}s
                    </button>
                  ))}
                </div>

                <div className="relative w-40 h-40 flex items-center justify-center mb-8">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="74"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      className="text-white/5"
                    />
                    <motion.circle
                      cx="80"
                      cy="80"
                      r="74"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={465}
                      animate={{ strokeDashoffset: 465 - (465 * restTimeLeft) / totalRestTime }}
                      className="text-primary"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black">{restTimeLeft}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Seconds</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full">
                  <button 
                    onClick={() => adjustRestTime(15)}
                    className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
                  >
                    <span className="text-primary font-bold text-sm">+15s</span>
                    <span className="text-[9px] uppercase tracking-widest opacity-40">Add Time</span>
                  </button>
                  <button 
                    onClick={skipRest}
                    className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-emerald-500"
                  >
                    <span className="font-bold text-sm">Skip</span>
                    <span className="text-[9px] uppercase tracking-widest opacity-40">Start Set</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section className="flex-1 glass p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
          <h3 className="font-bold mb-6 flex items-center justify-between">
            Upcoming Sequence
            <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-muted-foreground uppercase">
              {Math.max(0, workoutPlan.length - currentExerciseIndex - 1)} Left
            </span>
          </h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {workoutPlan.slice(currentExerciseIndex + 1).map((ex, i) => (
              <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 opacity-60 hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-bold text-xs">
                  {currentExerciseIndex + i + 2}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold">{ex.name}</h4>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{ex.sets} Sets • {ex.reps} Reps</p>
                </div>
              </div>
            ))}
            {workoutPlan.length - currentExerciseIndex - 1 === 0 && (
              <div className="text-center py-8 opacity-40">
                <p className="text-sm italic">Last exercise of the session!</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => router.push('/dashboard')}
            className="w-full mt-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all text-muted-foreground"
          >
            End Session Early
          </button>
        </section>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
