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
  ArrowRight,
  ChevronDown
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
  const [trackingConfidence, setTrackingConfidence] = useState(0);
  const [isSidebarAtBottom, setIsSidebarAtBottom] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const sidebarScrollRef = useRef(null);
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

  // Accuracy Buffers
  const angleHistory = useRef({});
  const frameCounter = useRef(0);
  const lastRepTime = useRef(0);

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

  const handleSidebarScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setIsSidebarAtBottom(scrollHeight - scrollTop - clientHeight < 30);
  };

  useEffect(() => {
    const savedPlan = localStorage.getItem('current_workout_plan');
    if (savedPlan) {
      const plan = JSON.parse(savedPlan);
      setWorkoutPlan(plan);
      if (plan[0]?.reps) {
        setTargetReps(parseInt(plan[0].reps) || 10);
      }
      setTargetSets(3); // Forced default to 3
    } else {
      router.push('/dashboard');
    }
  }, []);

  useEffect(() => {
    if (workoutPlan[currentExerciseIndex]?.reps) {
      setTargetReps(parseInt(workoutPlan[currentExerciseIndex].reps) || 10);
      setTargetSets(3); // Forced default to 3
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
      const stream = videoRef.current?.srcObject;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) videoRef.current.srcObject = null;

      // Clear canvas to remove any leftover pose skeleton marks
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }

      setIsCameraOn(false);
      setTrackingConfidence(0);
      setFormFeedback("Align your body with the camera");
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
          modelComplexity: 2, // Heavy model for maximum accuracy
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.75,
          minTrackingConfidence: 0.75
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

    try {
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw landmarks if detected
      if (results.poseLandmarks) {
        // High-accuracy drawing with glow effects
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';

        POSE_CONNECTIONS.forEach(([i, j]) => {
          const p1 = results.poseLandmarks[i];
          const p2 = results.poseLandmarks[j];
          if (p1 && p2 && p1.visibility > 0.6 && p2.visibility > 0.6) {
            ctx.beginPath();
            ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
            ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
            ctx.stroke();
          }
        });

        // Draw points
        results.poseLandmarks.forEach((landmark) => {
          if (landmark.visibility > 0.6) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#f59e0b';
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 4, 0, 2 * Math.PI);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        });

      } // End of if (results.poseLandmarks) block

      // --- ADVANCED MULTI-EXERCISE TRACKING ENGINE ---
      const {
        targetReps: tReps,
        targetSets: tSets,
        isResting: iR,
        isExerciseComplete: iEC,
        currentExercise: cE,
        currentSet: cS
      } = stateRef.current;

      if (iR || iEC) {
        ctx.restore();
        return;
      }

      const landmarks = results.poseLandmarks;
      if (!landmarks || landmarks.length === 0) {
        setTrackingConfidence(0);
        ctx.restore();
        return;
      }

      const exName = cE.name.toLowerCase();

      // High-accuracy helper with temporal smoothing
      const getSmoothedAngle = (p1, p2, p3, key) => {
        if (!p1 || !p2 || !p3 || p1.visibility < 0.5 || p2.visibility < 0.5 || p3.visibility < 0.5) return null;
        const angle = calculateAngle(p1, p2, p3);

        // Simple moving average (last 5 frames)
        if (!angleHistory.current[key]) angleHistory.current[key] = [];
        angleHistory.current[key].push(angle);
        if (angleHistory.current[key].length > 5) angleHistory.current[key].shift();

        return angleHistory.current[key].reduce((a, b) => a + b, 0) / angleHistory.current[key].length;
      };

      const getDistance3D = (p1, p2) => {
        return Math.sqrt(
          Math.pow(p1.x - p2.x, 2) +
          Math.pow(p1.y - p2.y, 2) +
          Math.pow(p1.z - p2.z, 2)
        );
      };

      let feedback = "";

      // 1. Squat Logic (High Precision Depth)
      if (exName.includes('squat')) {
        const leftKnee = getSmoothedAngle(landmarks[23], landmarks[25], landmarks[27], 'lKnee');
        const rightKnee = getSmoothedAngle(landmarks[24], landmarks[26], landmarks[28], 'rKnee');
        const hipShoulderKnee = getSmoothedAngle(landmarks[11], landmarks[23], landmarks[25], 'back');

        if (leftKnee && rightKnee) {
          const avgKneeAngle = (leftKnee + rightKnee) / 2;
          const isBackStraight = hipShoulderKnee > 145;

          // Debug overlay
          ctx.fillStyle = "#f59e0b";
          ctx.font = "bold 14px Inter";
          ctx.fillText(`Knee Angle: ${Math.round(avgKneeAngle)}°`, 30, 50);

          if (repState.current === 'up' && avgKneeAngle < 110) {
            repState.current = 'down';
            feedback = isBackStraight ? "Perfect depth! Push up." : "Good depth, but keep back straight.";
          } else if (repState.current === 'down' && avgKneeAngle > 150) {
            processRep("Explosive squat!");
          } else if (repState.current === 'up' && avgKneeAngle < 135) {
            feedback = "Go a bit lower...";
          }
        } else {
          feedback = "Adjust position to see full legs.";
        }
      }
      // 2. Bicep Curl Logic (Isolation Tracking)
      else if (exName.includes('curl')) {
        const leftElbow = getSmoothedAngle(landmarks[11], landmarks[13], landmarks[15], 'lElbow');
        const rightElbow = getSmoothedAngle(landmarks[12], landmarks[14], landmarks[16], 'rElbow');

        if (leftElbow && rightElbow) {
          const avgElbowAngle = (leftElbow + rightElbow) / 2;

          // Debug overlay
          ctx.fillStyle = "#f59e0b";
          ctx.font = "bold 14px Inter";
          ctx.fillText(`Elbow Angle: ${Math.round(avgElbowAngle)}°`, 30, 50);

          if (repState.current === 'up' && avgElbowAngle < 45) {
            repState.current = 'down';
            feedback = "Maximum contraction! Nice.";
          } else if (repState.current === 'down' && avgElbowAngle > 145) {
            processRep("Full range of motion!");
          }
        } else {
          feedback = "Center your arms in view.";
        }
      }
      // 3. Push-up / Bench / Chest Logic (Depth & Core Stability)
      else if (exName.includes('push') || exName.includes('bench') || exName.includes('chest')) {
        const leftElbow = getSmoothedAngle(landmarks[11], landmarks[13], landmarks[15], 'lElbow');
        const rightElbow = getSmoothedAngle(landmarks[12], landmarks[14], landmarks[16], 'rElbow');
        const hipAlignment = getSmoothedAngle(landmarks[11], landmarks[23], landmarks[25], 'core');

        if (leftElbow && rightElbow) {
          const avgElbowAngle = (leftElbow + rightElbow) / 2;
          const isCoreTight = hipAlignment > 155;

          // Debug overlay
          ctx.fillStyle = "#f59e0b";
          ctx.font = "bold 14px Inter";
          ctx.fillText(`Chest Angle: ${Math.round(avgElbowAngle)}°`, 30, 50);

          if (repState.current === 'up' && avgElbowAngle < 95) {
            repState.current = 'down';
            feedback = isCoreTight ? "Strong core! Power up." : "Drop hips a bit lower.";
          } else if (repState.current === 'down' && avgElbowAngle > 155) {
            processRep("Clean rep!");
          }
        }
      }
      // 4. Overhead Press (Vertical Pathing)
      else if (exName.includes('press')) {
        const leftWrist = landmarks[15];
        const rightWrist = landmarks[16];
        const leftShoulder = landmarks[11];

        if (leftWrist.visibility > 0.75 && rightWrist.visibility > 0.75) {
          const wristY = (leftWrist.y + rightWrist.y) / 2;
          const shoulderY = leftShoulder.y;
          const verticalDiff = shoulderY - wristY;

          if (repState.current === 'up' && verticalDiff > 0.25) {
            repState.current = 'down';
            feedback = "Great reach! Control the descent.";
          } else if (repState.current === 'down' && verticalDiff < 0.05) {
            processRep("Power move!");
          }
        }
      }
      // 5. Default Logic (Vertical Motion)
      else if (landmarks[15] && landmarks[16] && landmarks[11] && landmarks[12]) {
        const avgWristY = (landmarks[15].y + landmarks[16].y) / 2;
        const avgShoulderY = (landmarks[11].y + landmarks[12].y) / 2;
        const relativePos = avgWristY - avgShoulderY;

        if (repState.current === 'up' && relativePos > 0.15) {
          repState.current = 'down';
        } else if (repState.current === 'down' && relativePos < 0.05) {
          processRep("Good movement!");
        }
        feedback = "Focus on the movement.";
      }

      if (feedback && feedback !== formFeedback) {
        setFormFeedback(feedback);
      }

      // Calculate overall visibility confidence
      const visiblePoints = results.poseLandmarks.filter(p => p.visibility > 0.6).length;
      setTrackingConfidence(Math.round((visiblePoints / 33) * 100));

      function processRep(successMsg) {
        const now = Date.now();
        // Prevent double counting (minimum 1 second between reps)
        if (now - lastRepTime.current < 1000) return;
        lastRepTime.current = now;

        repState.current = 'up';
        setCumulativeReps(prev => prev + 1);
        setCaloriesBurned(prev => prev + 0.7); // Slightly adjusted for higher intensity accuracy

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
            setFormFeedback(cS >= tSets ? "Exercise Complete!" : "Set Complete! Rest up.");
            handleNextSet();
          } else {
            setFormFeedback(successMsg || "Great rep!");
          }
          return newVal;
        });
      }
      ctx.restore();
    } catch (err) {
      console.error("Tracking Engine Error:", err);
      // Ensure we restore even on error if ctx was saved
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        try { ctx.restore(); } catch (e) { }
      }
    }
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
    <div className="h-full flex flex-col lg:flex-row gap-6 pb-20">
      {/* Left Column */}
      <div className="flex-1 flex flex-col gap-4 px-2 md:px-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Live <span className="text-gradient">AI Training</span></h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Session Active</p>
            </div>
          </div>
          {isCameraOn && (
            <button
              onClick={toggleCamera}
              className="flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-xs bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
            >
              <CameraOff className="w-3.5 h-3.5" /> Stop Camera
            </button>
          )}
        </div>

        {/* Camera */}
        <div className="relative aspect-video bg-[#060d1a] rounded-2xl md:rounded-3xl border border-white/5 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          {!isCameraOn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 gap-4 p-6">
              {/* Animated ring */}
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping" />
                <div className="absolute inset-1 rounded-full border border-primary/30" />
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Camera className="text-primary/70 w-6 h-6" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold mb-1">AI Vision Ready</h3>
                <p className="text-xs text-muted-foreground max-w-xs">Stand 6–8 ft away. AI tracks your form in real-time.</p>
              </div>
              {error && (
                <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
                </div>
              )}
              <button
                onClick={toggleCamera}
                disabled={isCamLoading}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-[0_0_30px_rgba(245, 158, 11,0.4)] disabled:opacity-50 text-sm"
              >
                {isCamLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Camera className="w-4 h-4" />}
                {isCamLoading ? "Initializing..." : "Begin Session"}
              </button>
            </div>
          )}

          <video ref={videoRef} autoPlay playsInline
            className={cn("absolute inset-0 w-full h-full object-cover", !isCameraOn && "opacity-0 pointer-events-none")}
          />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

          {/* Live overlay */}
          {isCameraOn && (
            <div className="absolute inset-0 flex flex-col justify-between p-3 md:p-5">
              {/* Top HUD */}
              <div className="flex justify-between items-start">
                <div className="glass px-3 py-1.5 rounded-xl flex items-center gap-2 border-white/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">LIVE</span>
                  <span className="text-[10px] font-bold text-white/80 max-w-[140px] md:max-w-[240px] truncate">{currentExercise.name}</span>
                </div>
                <div className={cn(
                  "glass px-2.5 py-1.5 rounded-xl text-center border",
                  trackingConfidence > 80 ? "border-emerald-500/30" : trackingConfidence > 50 ? "border-amber-500/30" : "border-rose-500/30"
                )}>
                  <p className="text-[8px] uppercase tracking-widest text-muted-foreground font-bold">AI</p>
                  <p className={cn("text-sm font-black leading-none",
                    trackingConfidence > 80 ? "text-emerald-400" : trackingConfidence > 50 ? "text-amber-400" : "text-rose-400"
                  )}>{trackingConfidence}%</p>
                </div>
              </div>

              {/* Bottom controls */}
              <div className="flex flex-col items-center gap-3">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={formFeedback}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="bg-black/75 backdrop-blur-md px-5 py-2 rounded-full border border-white/10 text-xs md:text-sm font-semibold flex items-center gap-2 shadow-xl"
                  >
                    <Sparkles className="text-primary w-3.5 h-3.5 shrink-0" />
                    {isResting ? `Rest: ${restTimeLeft}s` : formFeedback}
                  </motion.div>
                </AnimatePresence>
                <div className="flex items-center gap-3 md:gap-5">
                  <button className="w-10 h-10 md:w-12 md:h-12 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-all">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className={cn(
                      "w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-all",
                      isPaused ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground shadow-[0_0_25px_rgba(245, 158, 11,0.5)]"
                    )}
                  >
                    {isPaused ? <Play fill="currentColor" className="w-5 h-5 md:w-6 md:h-6" /> : <Pause fill="currentColor" className="w-5 h-5 md:w-6 md:h-6" />}
                  </button>
                  <button
                    onClick={handleNextSet}
                    className={cn(
                      "w-10 h-10 md:w-12 md:h-12 rounded-full glass flex items-center justify-center transition-all",
                      isResting ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" : "hover:bg-white/20"
                    )}
                  >
                    {isResting ? <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> : <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar Wrapper */}
      <div className="relative w-full lg:w-[320px]">
        <div 
          ref={sidebarScrollRef}
          className="w-full h-full flex flex-col gap-5 lg:h-[calc(100vh-180px)] lg:overflow-y-auto custom-scrollbar pb-10 px-2 md:px-0"
          onScroll={handleSidebarScroll}
        >
          {/* Live Stats */}
        <section className="glass p-4 rounded-xl border border-primary/20 shadow-[0_0_30px_rgba(245, 158, 11,0.08)]">
          <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping inline-block" />
            Performance Pulse
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center justify-between">
              <div className="flex flex-col">
                 <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Session</span>
                 <p className="text-base md:text-lg font-black tabular-nums">{formatTime(sessionDuration)}</p>
              </div>
              <Clock className="text-primary w-4 h-4 opacity-80" />
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center justify-between">
              <div className="flex flex-col">
                 <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Active</span>
                 <p className="text-base md:text-lg font-black text-emerald-400 tabular-nums">{formatTime(activeTime)}</p>
              </div>
              <Timer className="text-emerald-500 w-4 h-4 opacity-80" />
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center justify-between">
              <div className="flex flex-col">
                 <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Reps</span>
                 <p className="text-base md:text-lg font-black tabular-nums">{cumulativeReps}</p>
              </div>
              <RotateCcw className="text-amber-500 w-4 h-4 opacity-80" />
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center justify-between">
              <div className="flex flex-col">
                 <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Calories</span>
                 <p className="text-base md:text-lg font-black text-rose-400 tabular-nums">{Math.floor(caloriesBurned)}</p>
              </div>
              <Sparkles className="text-rose-500 w-4 h-4 opacity-80" />
            </div>
          </div>
        </section>

        <section className="glass p-5 rounded-2xl border border-white/5 shadow-lg">
          <AnimatePresence mode="wait">
            {isExerciseComplete ? (
              <motion.div
                key="exercise-complete"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-6 text-center gap-4"
              >
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                  <CheckCircle2 className="text-emerald-500 w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">Exercise Complete!</h2>
                  <p className="text-xs text-muted-foreground">All {targetSets} sets of {currentExercise.name} done.</p>
                </div>
                <button
                  onClick={handleNextExercise}
                  className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245, 158, 11,0.3)] hover:scale-105 transition-all text-sm"
                >
                  Next Exercise <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ) : !isResting ? (
              <motion.div
                key="exercise-info"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                {/* Exercise Title */}
                <div>
                  <h2 className="text-xl font-bold text-gradient truncate">{currentExercise.name}</h2>
                  <p className="text-xs text-muted-foreground italic mt-0.5 line-clamp-2">{currentExercise.reason}</p>
                </div>

                {/* Set / Rep controls */}
                <div className="flex gap-2">
                  <div className="flex-1 bg-white/5 rounded-lg p-2 border border-white/5">
                    <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Sets</p>
                    <div className="flex items-center justify-between">
                      <button onClick={() => setTargetSets(prev => Math.max(currentSet, prev - 1))} className="w-5 h-5 rounded flex items-center justify-center bg-white/5 hover:bg-primary/20 hover:text-primary transition-all">
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="font-black text-sm text-primary tabular-nums">{currentSet}<span className="text-muted-foreground font-medium text-xs">/{targetSets}</span></span>
                      <button onClick={() => setTargetSets(prev => prev + 1)} className="w-5 h-5 rounded flex items-center justify-center bg-white/5 hover:bg-primary/20 hover:text-primary transition-all">
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 bg-white/5 rounded-lg p-2 border border-white/5">
                    <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Reps Goal</p>
                    <div className="flex items-center justify-between">
                      <button onClick={() => setTargetReps(prev => Math.max(1, prev - 1))} className="w-5 h-5 rounded flex items-center justify-center bg-white/5 hover:bg-primary/20 hover:text-primary transition-all">
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="font-black text-sm text-primary tabular-nums">{targetReps}</span>
                      <button onClick={() => setTargetReps(prev => prev + 1)} className="w-5 h-5 rounded flex items-center justify-center bg-white/5 hover:bg-primary/20 hover:text-primary transition-all">
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Rep Counter */}
                <div className="flex items-end gap-2">
                  <motion.span
                    key={repCount}
                    animate={repCount >= targetReps
                      ? { scale: [1, 1.15, 1], color: ['#ffffff', '#f59e0b', '#ffffff'] }
                      : { scale: [1, 1.05, 1] }}
                    className="text-6xl font-black leading-none tabular-nums"
                  >
                    {repCount}
                  </motion.span>
                  <span className="text-xl font-bold text-muted-foreground mb-2">/ {targetReps}</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (repCount / targetReps) * 100)}%` }}
                    className="h-full bg-primary rounded-full shadow-[0_0_12px_rgba(245, 158, 11,0.5)]"
                  />
                </div>

                {/* AI Tip */}
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/15">
                  <Info className="text-primary w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed text-foreground/80">
                    <span className="font-bold text-primary">AI: </span>Keep shoulders stable. {repCount} clean reps so far.
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
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-3 border border-primary/20 shadow-[0_0_20px_rgba(245, 158, 11,0.1)]">
                  <Timer className="text-primary w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold mb-1">Rest Period</h2>
                <p className="text-[11px] text-muted-foreground mb-5">Take a breath before next set</p>

                {/* Presets */}
                <div className="flex gap-2 mb-6">
                  {[30, 60, 90].map(time => (
                    <button
                      key={time}
                      onClick={() => {
                        setRestTimeLeft(time);
                        setTotalRestTime(time);
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[9px] font-bold border transition-all uppercase tracking-widest",
                        totalRestTime === time ? "bg-primary text-primary-foreground border-primary" : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                      )}
                    >
                      {time}s
                    </button>
                  ))}
                </div>

                <div className="relative w-28 h-28 flex items-center justify-center mb-6">
                  <svg className="w-28 h-28 transform -rotate-90">
                    <circle
                      cx="56"
                      cy="56"
                      r="50"
                      stroke="currentColor"
                      strokeWidth="5"
                      fill="transparent"
                      className="text-white/5"
                    />
                    <motion.circle
                      cx="56"
                      cy="56"
                      r="50"
                      stroke="currentColor"
                      strokeWidth="5"
                      fill="transparent"
                      strokeDasharray={314}
                      animate={{ strokeDashoffset: 314 - (314 * restTimeLeft) / totalRestTime }}
                      className="text-primary"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black">{restTimeLeft}</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">Secs</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 w-full">
                  <button
                    onClick={() => adjustRestTime(15)}
                    className="flex flex-col items-center gap-0.5 p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
                  >
                    <span className="text-primary font-bold text-xs">+15s</span>
                    <span className="text-[8px] uppercase tracking-widest opacity-40">Add Time</span>
                  </button>
                  <button
                    onClick={skipRest}
                    className="flex flex-col items-center gap-0.5 p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-emerald-500"
                  >
                    <span className="font-bold text-xs">Skip</span>
                    <span className="text-[8px] uppercase tracking-widest opacity-40">Start Set</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section className="flex-1 glass p-5 rounded-2xl border border-white/5 shadow-lg">
          <h3 className="font-bold mb-4 flex items-center justify-between text-sm">
            Upcoming Sequence
            <span className="text-[9px] bg-white/5 px-2 py-1 rounded text-muted-foreground uppercase">
              {Math.max(0, workoutPlan.length - currentExerciseIndex - 1)} Left
            </span>
          </h3>
          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
            {workoutPlan.slice(currentExerciseIndex + 1).map((ex, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 opacity-70 hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center font-bold text-xs shrink-0 border border-white/5">
                  {currentExerciseIndex + i + 2}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold truncate">{ex.name}</h4>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5">{ex.sets} Sets • {ex.reps} Reps</p>
                </div>
              </div>
            ))}
            {workoutPlan.length - currentExerciseIndex - 1 === 0 && (
              <div className="text-center py-6 opacity-40">
                <p className="text-xs italic">Last exercise of the session!</p>
              </div>
            )}
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full mt-5 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all text-muted-foreground"
          >
            End Session Early
          </button>
        </section>
        </div>

        {/* Global Sidebar Scroll Indicator */}
        {!isSidebarAtBottom && (
          <div className="hidden lg:flex absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none items-end justify-center pb-2 z-10 transition-opacity duration-300">
            <button 
              onClick={() => {
                if (sidebarScrollRef.current) {
                  sidebarScrollRef.current.scrollTo({
                    top: sidebarScrollRef.current.scrollHeight,
                    behavior: 'smooth'
                  });
                }
              }}
              className="flex flex-col items-center opacity-90 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] pointer-events-auto cursor-pointer hover:scale-105 transition-transform"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1 shadow-black drop-shadow-md">Up Next</span>
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40 backdrop-blur-sm animate-bounce shadow-[0_0_15px_rgba(245, 158, 11,0.4)] group-hover:bg-primary/30">
                <ChevronDown className="w-4 h-4 text-primary" />
              </div>
            </button>
          </div>
        )}
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
