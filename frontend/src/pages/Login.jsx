import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(apiKey);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid API key');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#ecf0f1',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        maxWidth: '420px',
        width: '100%',
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '0.5rem'
          }}>
            <span style={{ 
              fontSize: '2.5rem',
              lineHeight: '1',
              display: 'flex',
              alignItems: 'center'
            }}>⚡</span>
            <h1 style={{ 
              margin: 0, 
              color: '#2c3e50',
              fontSize: '2rem',
              fontWeight: '600',
              lineHeight: '1.2'
            }}>
              Command Gateway
            </h1>
          </div>
          <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.95rem' }}>
            Enter your API key to access the system
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.75rem',
              fontWeight: '600',
              color: '#2c3e50',
              fontSize: '0.9rem'
            }}>
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="cgw_your_api_key_here"
              style={{
                width: '100%',
                padding: '0.875rem',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '0.95rem',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3498db';
                e.target.style.boxShadow = '0 0 0 3px rgba(52, 152, 219, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              color: '#dc3545',
              padding: '0.875rem',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              fontSize: '0.9rem',
              border: '1px solid #fecaca',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#7fb3d5' : '#3498db',
              color: 'white',
              border: 'none',
              padding: '0.875rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s, transform 0.1s',
              transform: loading ? 'none' : 'scale(1)'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#2980b9')}
            onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#3498db')}
            onMouseDown={(e) => !loading && (e.target.style.transform = 'scale(0.98)')}
            onMouseUp={(e) => !loading && (e.target.style.transform = 'scale(1)')}
          >
            {loading ? '🔄 Authenticating...' : 'Login'}
          </button>
        </form>

        <div style={{
          marginTop: '2rem',
          padding: '1.25rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: '#6c757d',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            marginBottom: '0.5rem' 
          }}>
            <span style={{ fontSize: '1rem' }}>ℹ️</span>
            <strong style={{ color: '#495057' }}>Default Admin:</strong>
          </div>
          <code style={{ 
            fontSize: '0.75rem',
            display: 'block',
            padding: '0.5rem',
            backgroundColor: '#fff',
            borderRadius: '4px',
            border: '1px solid #dee2e6',
            color: '#212529',
            wordBreak: 'break-all',
            fontFamily: 'monospace'
          }}>
            cgw_admin_default_key_change_in_production
          </code>
        </div>
      </div>
    </div>
  );
};

export default Login;
