import { useState } from 'react';
import StudentPortal from '../src/components/StudentPortal';
import TeacherDashboard from '../src/components/TeacherDashboard';

export default function Home() {
  const [view, setView] = useState('home');

  if (view === 'student') {
    return <StudentPortal />;
  }

  if (view === 'teacher') {
    return <TeacherDashboard />;
  }

  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <h1 style={{ fontSize: '2.5em', marginBottom: '20px', color: '#333' }}>
        EduVision AI
      </h1>
      <p style={{ fontSize: '1.2em', marginBottom: '40px', color: '#666' }}>
        Empowering teachers with "Super Vision" - Real-time student engagement and integrity monitoring
      </p>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '30px' }}>
        <button
          onClick={() => setView('student')}
          style={{
            padding: '20px 40px',
            fontSize: '1.2em',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            minWidth: '200px'
          }}
        >
          Student Portal
        </button>
        
        <button
          onClick={() => setView('teacher')}
          style={{
            padding: '20px 40px',
            fontSize: '1.2em',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            minWidth: '200px'
          }}
        >
          Teacher Dashboard
        </button>
      </div>
      
      <div style={{ 
        marginTop: '60px', 
        padding: '30px',
        backgroundColor: 'white',
        borderRadius: '8px',
        maxWidth: '800px',
        margin: '60px auto 0'
      }}>
        <h2>Features</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'left' }}>
          <div>
            <h3 style={{ color: '#2196F3' }}>Student Portal</h3>
            <ul>
              <li>Real-time video capture</li>
              <li>Live engagement feedback</li>
              <li>Privacy-focused monitoring</li>
              <li>Instant status updates</li>
            </ul>
          </div>
          <div>
            <h3 style={{ color: '#4CAF50' }}>Teacher Dashboard</h3>
            <ul>
              <li>Live student monitoring</li>
              <li>Engagement timeline</li>
              <li>Proctor alerts</li>
              <li>Confusion detection</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div style={{ 
        marginTop: '40px', 
        padding: '20px',
        backgroundColor: '#e3f2fd',
        borderRadius: '8px',
        maxWidth: '600px',
        margin: '40px auto 0'
      }}>
        <h3>AI-Powered Detection</h3>
        <p>Our system uses advanced computer vision to detect:</p>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '15px' }}>
          <span style={{ padding: '5px 10px', backgroundColor: '#4CAF50', color: 'white', borderRadius: '4px' }}>
            Gaze Tracking
          </span>
          <span style={{ padding: '5px 10px', backgroundColor: '#FF9800', color: 'white', borderRadius: '4px' }}>
            Emotion Analysis
          </span>
          <span style={{ padding: '5px 10px', backgroundColor: '#F44336', color: 'white', borderRadius: '4px' }}>
            Integrity Monitoring
          </span>
        </div>
      </div>
    </div>
  );
}