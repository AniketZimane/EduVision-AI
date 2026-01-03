import { useEffect, useRef, useState } from 'react';

export default function StudentPortal() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const [status, setStatus] = useState('connecting');
  const [analysis, setAnalysis] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    initializeCamera();
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setStatus('camera_ready');
        };
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      setStatus('camera_error');
    }
  };

  const connectWebSocket = () => {
    wsRef.current = new WebSocket('ws://localhost:8000/ws/student');
    
    wsRef.current.onopen = () => {
      setStatus('connected');
      startAnalysis();
    };
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'analysis') {
        setAnalysis(data.data);
      }
    };
    
    wsRef.current.onclose = () => {
      setStatus('disconnected');
      setIsRecording(false);
    };
  };

  const startAnalysis = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsRecording(true);
    
    const captureFrame = () => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        setTimeout(captureFrame, 200);
        return;
      }
      
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        setTimeout(captureFrame, 200);
        return;
      }
      
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      wsRef.current.send(JSON.stringify({
        image: imageData,
        timestamp: Date.now()
      }));
      
      setTimeout(captureFrame, 200); // 5 FPS
    };
    
    setTimeout(captureFrame, 500);
  };

  const getStatusColor = () => {
    if (!analysis) return 'gray';
    switch (analysis.status) {
      case 'focused': return 'green';
      case 'engaged': return 'blue';
      case 'confused': return 'yellow';
      case 'alert': return 'red';
      default: return 'gray';
    }
  };

  const getStatusMessage = () => {
    if (!analysis) return 'Initializing...';
    
    if (analysis.alert_type) {
      switch (analysis.alert_type) {
        case 'no_face': return 'Please position yourself in front of the camera';
        case 'multiple_faces': return 'Multiple people detected - please ensure you are alone';
        case 'gaze_away': return `Looking away for ${Math.round(analysis.gaze_away_duration)}s`;
        default: return 'Alert detected';
      }
    }
    
    switch (analysis.status) {
      case 'focused': return 'You are focused - great job!';
      case 'engaged': return 'You seem engaged and happy!';
      case 'confused': return 'You might be confused - consider asking for help';
      default: return 'Monitoring your session...';
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Student Portal</h1>
      
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        <div>
          <video
            ref={videoRef}
            autoPlay
            muted
            style={{ 
              width: '640px', 
              height: '480px', 
              border: `3px solid ${getStatusColor()}`,
              borderRadius: '8px'
            }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
        
        <div style={{ minWidth: '300px' }}>
          <div style={{ 
            padding: '15px', 
            backgroundColor: getStatusColor(), 
            color: 'white',
            borderRadius: '8px',
            marginBottom: '15px'
          }}>
            <h3>Status: {analysis?.status || 'Connecting'}</h3>
            <p>{getStatusMessage()}</p>
          </div>
          
          {analysis && (
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#f5f5f5', 
              borderRadius: '8px' 
            }}>
              <h4>Session Info</h4>
              <p><strong>Faces Detected:</strong> {analysis.face_count}</p>
              <p><strong>Gaze Direction:</strong> {analysis.gaze_direction}</p>
              <p><strong>Emotion:</strong> {analysis.emotion}</p>
              {analysis.gaze_away_duration > 0 && (
                <p><strong>Looking Away:</strong> {Math.round(analysis.gaze_away_duration)}s</p>
              )}
            </div>
          )}
          
          <div style={{ 
            marginTop: '15px', 
            padding: '10px', 
            backgroundColor: status === 'connected' ? '#e8f5e8' : '#ffe8e8',
            borderRadius: '8px'
          }}>
            <p><strong>Connection:</strong> {status}</p>
            <p><strong>Recording:</strong> {isRecording ? 'Active' : 'Inactive'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}