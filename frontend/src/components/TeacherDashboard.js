import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TeacherDashboard() {
  const [currentStatus, setCurrentStatus] = useState(null);
  const [sessionData, setSessionData] = useState([]);
  const [wsConnection, setWsConnection] = useState('connecting');

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/teacher');
    
    ws.onopen = () => {
      setWsConnection('connected');
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Teacher received:', data); // Debug
      
      if (data.type === 'student_update') {
        setCurrentStatus(data.data);
        
        // Add to session data for chart
        setSessionData(prev => {
          const newData = [...prev, {
            time: new Date(data.data.timestamp * 1000).toLocaleTimeString(),
            timestamp: data.data.timestamp,
            engagement: getEngagementScore(data.data),
            status: data.data.status
          }];
          
          // Keep only last 50 points
          return newData.slice(-50);
        });
      } else if (data.type === 'session_data') {
        // Initial session data
        const chartData = data.data.map(item => ({
          time: new Date(item.timestamp * 1000).toLocaleTimeString(),
          timestamp: item.timestamp,
          engagement: getEngagementScore(item),
          status: item.status
        }));
        setSessionData(chartData);
      }
    };
    
    ws.onclose = () => {
      setWsConnection('disconnected');
    };
    
    return () => ws.close();
  }, []);

  const getEngagementScore = (analysis) => {
    if (analysis.status === 'alert') return 0;
    if (analysis.status === 'confused') return 25;
    if (analysis.status === 'focused') return 75;
    if (analysis.status === 'engaged') return 100;
    return 50;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'focused': return '#4CAF50';
      case 'engaged': return '#2196F3';
      case 'confused': return '#FF9800';
      case 'alert': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getAlertMessage = (analysis) => {
    if (!analysis?.alert_type) return null;
    
    switch (analysis.alert_type) {
      case 'no_face': return 'Student not visible in camera';
      case 'multiple_faces': return 'Multiple people detected';
      case 'gaze_away': return `Student looking away for ${Math.round(analysis.gaze_away_duration)}s`;
      default: return 'Alert detected';
    }
  };

  const getRecentAlerts = () => {
    return sessionData
      .filter(item => item.status === 'alert')
      .slice(-5)
      .reverse();
  };

  const getConfusedPeriods = () => {
    return sessionData
      .filter(item => item.status === 'confused')
      .slice(-5)
      .reverse();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Teacher Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Current Status */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: currentStatus ? getStatusColor(currentStatus.status) : '#FF6B6B',
          color: 'white',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h2>Current Status</h2>
          {currentStatus ? (
            <>
              <h3 style={{ margin: '10px 0', textTransform: 'capitalize' }}>
                {currentStatus.status === 'alert' ? 'PROCTOR ALERT' : 
                 currentStatus.status === 'confused' ? 'STUDENT CONFUSED' :
                 currentStatus.status === 'engaged' ? 'STUDENT ENGAGED' :
                 'STUDENT FOCUSED'}
              </h3>
              {getAlertMessage(currentStatus) && (
                <p style={{ fontSize: '14px', margin: '5px 0' }}>
                  {getAlertMessage(currentStatus)}
                </p>
              )}
              <div style={{ fontSize: '12px', marginTop: '10px', opacity: 0.9 }}>
                <p>Emotion: {currentStatus.emotion}</p>
                <p>Gaze: {currentStatus.gaze_direction}</p>
                <p>Faces: {currentStatus.face_count}</p>
              </div>
            </>
          ) : (
            <p>Waiting for student connection...</p>
          )}
        </div>

        {/* Connection Status */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: wsConnection === 'connected' ? '#4CAF50' : '#F44336',
          color: 'white',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h2>System Status</h2>
          <h3>Connection: {wsConnection}</h3>
          <p>Data Points: {sessionData.length}</p>
          <p>Last Update: {currentStatus ? new Date(currentStatus.timestamp * 1000).toLocaleTimeString() : 'N/A'}</p>
        </div>
      </div>

      {/* Engagement Timeline */}
      <div style={{ 
        padding: '20px', 
        backgroundColor: 'white', 
        borderRadius: '8px',
        border: '1px solid #ddd',
        marginBottom: '20px'
      }}>
        <h3>Engagement Timeline (Last Few Minutes)</h3>
        {sessionData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sessionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value, name) => [`${value}%`, 'Engagement']}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="engagement" 
                stroke="#2196F3" 
                strokeWidth={2}
                dot={{ fill: '#2196F3', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>No data available yet...</p>
        )}
      </div>

      {/* Alerts and Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#fff3e0', 
          borderRadius: '8px',
          border: '1px solid #ffcc02'
        }}>
          <h4>Recent Confusion Periods</h4>
          {getConfusedPeriods().length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {getConfusedPeriods().map((item, index) => (
                <li key={index}>{item.time}</li>
              ))}
            </ul>
          ) : (
            <p>No confusion detected recently</p>
          )}
        </div>

        <div style={{ 
          padding: '15px', 
          backgroundColor: '#ffebee', 
          borderRadius: '8px',
          border: '1px solid #f44336'
        }}>
          <h4>Recent Alerts</h4>
          {getRecentAlerts().length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {getRecentAlerts().map((item, index) => (
                <li key={index}>{item.time}</li>
              ))}
            </ul>
          ) : (
            <p>No alerts recently</p>
          )}
        </div>
      </div>
    </div>
  );
}