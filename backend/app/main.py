from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import cv2
import base64
import numpy as np
import json
import asyncio
from typing import List
import time
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.vision_analyzer import VisionAnalyzer

app = FastAPI(title="Student Monitoring API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
analyzer = VisionAnalyzer()
connected_teachers: List[WebSocket] = []
session_data = []

class ConnectionManager:
    def __init__(self):
        self.student_connections: List[WebSocket] = []
        self.teacher_connections: List[WebSocket] = []

    async def connect_student(self, websocket: WebSocket):
        await websocket.accept()
        self.student_connections.append(websocket)

    async def connect_teacher(self, websocket: WebSocket):
        await websocket.accept()
        self.teacher_connections.append(websocket)

    def disconnect_student(self, websocket: WebSocket):
        if websocket in self.student_connections:
            self.student_connections.remove(websocket)

    def disconnect_teacher(self, websocket: WebSocket):
        if websocket in self.teacher_connections:
            self.teacher_connections.remove(websocket)

    async def broadcast_to_teachers(self, data: dict):
        for connection in self.teacher_connections:
            try:
                await connection.send_text(json.dumps(data))
            except:
                self.disconnect_teacher(connection)

manager = ConnectionManager()

@app.get("/")
async def root():
    return {"message": "Student Monitoring API is running"}

@app.get("/session-data")
async def get_session_data():
    """Get recent session data for dashboard"""
    # Return last 50 data points
    return {"data": session_data[-50:] if len(session_data) > 50 else session_data}

@app.websocket("/ws/student")
async def websocket_student_endpoint(websocket: WebSocket):
    await manager.connect_student(websocket)
    try:
        while True:
            # This is for Receive video frame from student
            data = await websocket.receive_text()
            frame_data = json.loads(data)
            
            # This is for Decode base64 image
            image_data = base64.b64decode(frame_data['image'].split(',')[1])
            nparr = np.frombuffer(image_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is not None:
                # This is for Analyze frame
                analysis = analyzer.analyze_frame(frame)
                
                # This is for Store in session data
                session_data.append(analysis)
                
                # This is for Keep only last 1000 data points
                if len(session_data) > 1000:
                    session_data.pop(0)
                
                # This is for Send analysis back to student
                await websocket.send_text(json.dumps({
                    "type": "analysis",
                    "data": analysis
                }))
                
                # This is for Broadcast to teachers
                await manager.broadcast_to_teachers({
                    "type": "student_update",
                    "data": analysis
                })
                
                print(f"Analysis sent: {analysis['status']}, faces: {analysis['face_count']}")  # Debug
                
    except WebSocketDisconnect:
        manager.disconnect_student(websocket)

@app.websocket("/ws/teacher")
async def websocket_teacher_endpoint(websocket: WebSocket):
    await manager.connect_teacher(websocket)
    try:
        # Send initial session data
        await websocket.send_text(json.dumps({
            "type": "session_data",
            "data": session_data[-50:] if len(session_data) > 50 else session_data
        }))
        
        while True:
            # Keep connection alive
            await asyncio.sleep(1)
            
    except WebSocketDisconnect:
        manager.disconnect_teacher(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)