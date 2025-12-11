import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import api from '../services/api';

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await api.getCommandHistory();
      setHistory(data);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!command.trim()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await api.submitCommand(command);
      
      if (result.status === 'executed') {
        setMessage({ 
          type: 'success', 
          text: `✅ Command executed successfully! New balance: ${result.new_balance} credits` 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: `❌ Command rejected: ${result.result_message}` 
        });
      }

      setCommand('');
      await loadHistory();
      await refreshUser();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    return status === 'executed' ? '#27ae60' : '#e74c3c';
  };

  const getStatusIcon = (status) => {
    return status === 'executed' ? '✓' : '✗';
  };

  return (
    <Layout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ margin: 0, color: '#2c3e50' }}>Member Dashboard</h2>
            <div style={{
              backgroundColor: '#3498db',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}>
              {user?.credits} Credits
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 'bold',
                color: '#2c3e50'
              }}>
                Submit Command
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="Enter command (e.g., ls -la, git status)"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    fontFamily: 'monospace'
                  }}
                  disabled={loading || user?.credits === 0}
                />
                <button
                  type="submit"
                  disabled={loading || !command.trim() || user?.credits === 0}
                  style={{
                    backgroundColor: '#27ae60',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 2rem',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: (loading || !command.trim() || user?.credits === 0) ? 'not-allowed' : 'pointer',
                    opacity: (loading || !command.trim() || user?.credits === 0) ? 0.5 : 1,
                    transition: 'all 0.2s ease',
                    transform: 'scale(1)'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && command.trim() && user?.credits > 0) {
                      e.target.style.backgroundColor = '#229954';
                      e.target.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading && command.trim() && user?.credits > 0) {
                      e.target.style.backgroundColor = '#27ae60';
                      e.target.style.transform = 'scale(1)';
                    }
                  }}
                  onMouseDown={(e) => {
                    if (!loading && command.trim() && user?.credits > 0) {
                      e.target.style.transform = 'scale(0.98)';
                    }
                  }}
                  onMouseUp={(e) => {
                    if (!loading && command.trim() && user?.credits > 0) {
                      e.target.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {loading ? '⏳ Processing...' : '▶ Execute'}
                </button>
              </div>
            </div>

            {user?.credits === 0 && (
              <div style={{
                backgroundColor: '#fff3cd',
                color: '#856404',
                padding: '0.75rem',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}>
                ⚠️ You have no credits remaining. Contact an admin to get more credits.
              </div>
            )}

            {message.text && (
              <div style={{
                backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                color: message.type === 'success' ? '#155724' : '#721c24',
                padding: '0.75rem',
                borderRadius: '4px',
                marginTop: '0.5rem',
                fontSize: '0.9rem'
              }}>
                {message.text}
              </div>
            )}
          </form>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Command History</h3>
          
          {history.length === 0 ? (
            <p style={{ color: '#7f8c8d', textAlign: 'center', padding: '2rem' }}>
              No commands executed yet
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#ecf0f1' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Status</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Command</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Result</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Action</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          display: 'inline-block',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: getStatusColor(item.status),
                          color: 'white',
                          textAlign: 'center',
                          lineHeight: '24px',
                          fontWeight: 'bold'
                        }}>
                          {getStatusIcon(item.status)}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                        {item.command_text}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: '#7f8c8d' }}>
                        {item.result_message}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          backgroundColor: item.action === 'AUTO_ACCEPT' ? '#d4edda' : '#f8d7da',
                          color: item.action === 'AUTO_ACCEPT' ? '#155724' : '#721c24'
                        }}>
                          {item.action || 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: '#7f8c8d' }}>
                        {new Date(item.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
