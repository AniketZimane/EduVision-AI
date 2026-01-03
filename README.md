# Student Monitoring System

A full-stack prototype that captures student video feeds, analyzes behavior in real-time, and provides actionable insights to teachers through AI-powered computer vision.

## Features

### AI/ML Engine
- **Gaze Tracking**: Detects when students look away from screen for >4 seconds
- **Person Detection**: Flags no face or multiple faces in frame
- **Emotion Detection**: Classifies student state (Focused/Neutral, Happy/Excited, Confused)
- **Real-time Analysis**: Processes video frames at 5 FPS for live feedback

### Student Portal
- Live video capture with privacy-focused monitoring
- Real-time engagement feedback
- Visual status indicators (Green/Yellow/Red)
- Session information display

### Teacher Dashboard
- Live student monitoring with WebSocket updates
- Engagement timeline chart showing last few minutes
- Proctor alerts for integrity violations
- Confusion detection with historical data

## Architecture

- **Backend**: FastAPI with WebSocket support
- **Frontend**: Next.js React application
- **AI/ML**: MediaPipe + OpenCV for computer vision
- **Communication**: WebSockets for real-time data streaming

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Run the FastAPI server:
```bash
cd app
python main.py
```

The backend will start on `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## Usage

1. **Start Backend**: Run the FastAPI server first
2. **Start Frontend**: Launch the Next.js application
3. **Access Application**: Open `http://localhost:3000`
4. **Choose Interface**:
   - Click "Student Portal" for video capture and analysis
   - Click "Teacher Dashboard" for real-time monitoring

### Student Portal
- Allow camera access when prompted
- Position yourself clearly in front of the camera
- Monitor your engagement status in real-time
- Follow on-screen guidance for optimal positioning

### Teacher Dashboard
- View live student status updates
- Monitor engagement timeline chart
- Receive alerts for proctoring violations
- Track confusion periods for intervention

## Technical Implementation

### Computer Vision Pipeline
- **Face Detection**: MediaPipe Face Detection for person counting
- **Face Mesh**: 468 facial landmarks for detailed analysis
- **Gaze Tracking**: Eye landmark analysis for direction detection
- **Emotion Classification**: Facial feature analysis for mood detection

### Real-time Communication
- WebSocket connections for low-latency data streaming
- Separate channels for student and teacher interfaces
- Automatic reconnection handling
- Session data persistence

### Performance Optimization
- 5 FPS video processing for real-time performance
- Base64 image encoding for WebSocket transmission
- Rolling data window (last 1000 points) for memory efficiency
- Responsive UI with live chart updates

## API Endpoints

- `GET /`: Health check endpoint
- `GET /session-data`: Retrieve recent session data
- `WebSocket /ws/student`: Student video stream and analysis
- `WebSocket /ws/teacher`: Teacher dashboard updates

## Dependencies

### Backend
- FastAPI: Web framework and WebSocket support
- OpenCV: Computer vision processing
- MediaPipe: Face detection and landmark analysis
- NumPy: Numerical computations
- Uvicorn: ASGI server

### Frontend
- Next.js: React framework
- Recharts: Data visualization for engagement timeline
- WebSocket API: Real-time communication

## Security Considerations

- Video data processed locally, not stored
- WebSocket connections with CORS protection
- Camera access requires user permission
- No persistent video recording or storage

## Future Enhancements

- Multi-student classroom monitoring
- Advanced emotion recognition models
- Integration with learning management systems
- Mobile device support
- Enhanced privacy controls