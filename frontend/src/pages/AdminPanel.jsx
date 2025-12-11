import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import NotificationBell from '../components/NotificationBell';
import api from '../services/api';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [rules, setRules] = useState([]);
  const [pendingRules, setPendingRules] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentUser, setCurrentUser] = useState(null);

  // User form
  const [newUser, setNewUser] = useState({ name: '', role: 'member', credits: 10 });
  
  // Rule form
  const [newRule, setNewRule] = useState({ pattern: '', action: 'AUTO_ACCEPT', priority: 100, description: '', approval_threshold: 1 });
  const [regexValidation, setRegexValidation] = useState({ valid: null, message: '' });
  const [conflictCheck, setConflictCheck] = useState({ checked: false, hasConflicts: false, data: null });
  const [forceCreate, setForceCreate] = useState(false);
  
  // Voting
  const [selectedRuleVotes, setSelectedRuleVotes] = useState({});
  const [voteComments, setVoteComments] = useState({});

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'rules') loadRules();
    if (activeTab === 'pending') loadPendingRules();
    if (activeTab === 'audit') loadAuditLogs();
  }, [activeTab]);

  const loadCurrentUser = async () => {
    try {
      const user = await api.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to load current user:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await api.getAllUsers();
      setUsers(data);
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  const loadRules = async () => {
    try {
      const data = await api.getAllRules();
      setRules(data);
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  const loadPendingRules = async () => {
    try {
      const data = await api.getPendingRules();
      setPendingRules(data);
      // Load votes for each pending rule
      const votesData = {};
      for (const rule of data) {
        try {
          const votes = await api.getRuleVotes(rule.id);
          votesData[rule.id] = votes;
        } catch (error) {
          console.error(`Failed to load votes for rule ${rule.id}:`, error);
        }
      }
      setSelectedRuleVotes(votesData);
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const data = await api.getAuditLogs();
      setAuditLogs(data);
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await api.createUser(newUser);
      showMessage('success', `User created! API Key: ${result.api_key}`);
      setNewUser({ name: '', role: 'member', credits: 10 });
      await loadUsers();
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCredits = async (userId, newCredits) => {
    try {
      await api.updateUserCredits(userId, newCredits);
      showMessage('success', 'Credits updated successfully');
      await loadUsers();
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  const handleValidateRegex = async () => {
    if (!newRule.pattern) return;
    try {
      const result = await api.validateRegex(newRule.pattern);
      setRegexValidation(result);
    } catch (error) {
      setRegexValidation({ valid: false, message: error.message });
    }
  };

  const handleCheckConflicts = async () => {
    if (!newRule.pattern) return;
    try {
      const result = await api.checkConflicts(newRule.pattern);
      setConflictCheck({
        checked: true,
        hasConflicts: result.has_conflicts,
        data: result
      });
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    
    // If conflicts exist and not forcing, show warning
    if (conflictCheck.hasConflicts && !forceCreate) {
      if (!confirm('This rule conflicts with existing rules. Are you sure you want to create it anyway?')) {
        return;
      }
      setForceCreate(true);
    }
    
    setLoading(true);
    try {
      await api.createRuleWithForce(newRule, forceCreate);
      showMessage('success', 'Rule created successfully');
      setNewRule({ pattern: '', action: 'AUTO_ACCEPT', priority: 100, description: '', approval_threshold: 1 });
      setRegexValidation({ valid: null, message: '' });
      setConflictCheck({ checked: false, hasConflicts: false, data: null });
      setForceCreate(false);
      await loadRules();
      // Reload pending rules if on that tab
      if (activeTab === 'pending') {
        await loadPendingRules();
      }
    } catch (error) {
      // Handle 409 conflict error
      if (error.message.includes('conflicts detected') || error.message.includes('409')) {
        showMessage('error', 'Rule conflicts detected. Click "Check Conflicts" to see details.');
      } else {
        showMessage('error', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    try {
      await api.deleteRule(ruleId);
      showMessage('success', 'Rule deleted successfully');
      await loadRules();
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  const handleVoteOnRule = async (ruleId, voteType) => {
    try {
      const comment = voteComments[ruleId] || '';
      await api.voteOnRule(ruleId, { vote: voteType, comment });
      showMessage('success', `Vote ${voteType.toLowerCase()} submitted successfully`);
      setVoteComments(prev => ({ ...prev, [ruleId]: '' }));
      await loadPendingRules();
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  const tabStyle = (isActive) => ({
    padding: '1rem 2rem',
    border: 'none',
    backgroundColor: isActive ? 'white' : '#ecf0f1',
    color: isActive ? '#3498db' : '#7f8c8d',
    cursor: 'pointer',
    fontWeight: isActive ? 'bold' : 'normal',
    borderBottom: isActive ? '3px solid #3498db' : 'none'
  });

  return (
    <Layout>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '2rem', color: '#2c3e50' }}>Admin Panel</h2>

        {message.text && (
          <div style={{
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1rem'
          }}>
            {message.text}
          </div>
        )}

        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <button onClick={() => setActiveTab('users')} style={tabStyle(activeTab === 'users')}>
              Users
            </button>
            <button onClick={() => setActiveTab('rules')} style={tabStyle(activeTab === 'rules')}>
              Rules
            </button>
            <button onClick={() => setActiveTab('pending')} style={tabStyle(activeTab === 'pending')}>
              Pending Rules {pendingRules.length > 0 && `(${pendingRules.length})`}
            </button>
            <button onClick={() => setActiveTab('audit')} style={tabStyle(activeTab === 'audit')}>
              Audit Logs
            </button>
          </div>
          <NotificationBell />
        </div>

        {activeTab === 'users' && (
          <div>
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              marginBottom: '2rem'
            }}>
              <h3 style={{ marginTop: 0 }}>Create New User</h3>
              <form onSubmit={handleCreateUser}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Name</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Role</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Credits</label>
                    <input
                      type="number"
                      value={newUser.credits}
                      onChange={(e) => setNewUser({ ...newUser, credits: parseInt(e.target.value) || 0 })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        boxSizing: 'border-box'
                      }}
                      min="0"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: '#27ae60',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 2rem',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  Create User
                </button>
              </form>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginTop: 0 }}>All Users</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#ecf0f1' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>API Key</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Role</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Credits</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                      <td style={{ padding: '0.75rem' }}>{user.name}</td>
                      <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {user.api_key}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          backgroundColor: user.role === 'admin' ? '#e74c3c' : '#3498db',
                          color: 'white'
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>{user.credits}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <button
                          onClick={() => {
                            const credits = prompt('Enter new credit amount:', user.credits);
                            if (credits !== null) handleUpdateCredits(user.id, parseInt(credits));
                          }}
                          style={{
                            backgroundColor: '#3498db',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          Update Credits
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div>
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              marginBottom: '2rem'
            }}>
              <h3 style={{ marginTop: 0 }}>Create New Rule</h3>
              <form onSubmit={handleCreateRule}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      Regex Pattern
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={newRule.pattern}
                        onChange={(e) => setNewRule({ ...newRule, pattern: e.target.value })}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontFamily: 'monospace'
                        }}
                        required
                      />
                      <button
                        type="button"
                        onClick={handleValidateRegex}
                        style={{
                          backgroundColor: '#95a5a6',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Test
                      </button>
                      <button
                        type="button"
                        onClick={handleCheckConflicts}
                        style={{
                          backgroundColor: '#e67e22',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Check Conflicts
                      </button>
                    </div>
                    {regexValidation.valid !== null && (
                      <div style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        backgroundColor: regexValidation.valid ? '#d4edda' : '#f8d7da',
                        color: regexValidation.valid ? '#155724' : '#721c24'
                      }}>
                        {regexValidation.message}
                      </div>
                    )}
                    {conflictCheck.checked && (
                      <div style={{
                        marginTop: '0.5rem',
                        padding: '1rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        backgroundColor: conflictCheck.hasConflicts ? '#fff3cd' : '#d4edda',
                        color: conflictCheck.hasConflicts ? '#856404' : '#155724',
                        border: conflictCheck.hasConflicts ? '1px solid #ffc107' : '1px solid #28a745'
                      }}>
                        {conflictCheck.hasConflicts ? (
                          <>
                            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                              ⚠️ Conflicts Found: {conflictCheck.data.total_conflicts} rule(s) with {conflictCheck.data.total_overlapping_commands} overlapping command(s)
                            </div>
                            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                              {conflictCheck.data.conflicts.map((conflict, idx) => (
                                <div key={idx} style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: idx < conflictCheck.data.conflicts.length - 1 ? '1px solid #ffc107' : 'none' }}>
                                  <div><strong>Rule #{conflict.rule_id}</strong>: {conflict.pattern}</div>
                                  <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                    Action: {conflict.action} | Priority: {conflict.priority}
                                  </div>
                                  <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                    <strong>Overlapping commands:</strong> {conflict.overlapping_commands.join(', ')}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #ffc107' }}>
                              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={forceCreate}
                                  onChange={(e) => setForceCreate(e.target.checked)}
                                  style={{ marginRight: '0.5rem' }}
                                />
                                <span>I understand and want to create this rule anyway</span>
                              </label>
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                              ✅ No Conflicts Detected
                            </div>
                            <div>This pattern doesn't conflict with any existing rules.</div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Action</label>
                    <select
                      value={newRule.action}
                      onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    >
                      <option value="AUTO_ACCEPT">AUTO_ACCEPT</option>
                      <option value="AUTO_REJECT">AUTO_REJECT</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Priority</label>
                    <input
                      type="number"
                      value={newRule.priority}
                      onChange={(e) => setNewRule({ ...newRule, priority: parseInt(e.target.value) || 1 })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        boxSizing: 'border-box'
                      }}
                      min="1"
                      required
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Description</label>
                    <input
                      type="text"
                      value={newRule.description}
                      onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      Approval Threshold
                      <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: '#666', marginLeft: '0.5rem' }}>
                        (admins required)
                      </span>
                    </label>
                    <input
                      type="number"
                      value={newRule.approval_threshold}
                      onChange={(e) => setNewRule({ ...newRule, approval_threshold: parseInt(e.target.value) || 1 })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        boxSizing: 'border-box'
                      }}
                      min="1"
                      max="10"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: '#27ae60',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 2rem',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  Create Rule
                </button>
              </form>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginTop: 0 }}>All Rules (Ordered by Priority)</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#ecf0f1' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Priority</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Pattern</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Action</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Description</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{rule.priority}</td>
                      <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {rule.pattern}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          backgroundColor: rule.action === 'AUTO_ACCEPT' ? '#27ae60' : '#e74c3c',
                          color: 'white'
                        }}>
                          {rule.action}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.9rem' }}>{rule.description || '-'}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          style={{
                            backgroundColor: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'pending' && (
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginTop: 0 }}>Pending Rules Awaiting Approval</h3>
            {pendingRules.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
                No pending rules at this time
              </p>
            ) : (
              pendingRules.map((rule) => {
                const votes = selectedRuleVotes[rule.id] || [];
                // Check if the CURRENT logged-in user has voted, not the rule creator
                const userVote = currentUser ? votes.find(v => v.admin_id === currentUser.id) : null;
                const hasVoted = userVote !== undefined;
                
                return (
                  <div key={rule.id} style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                    backgroundColor: '#f9f9f9'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                          <h4 style={{ margin: 0, fontFamily: 'monospace', color: '#2c3e50' }}>
                            {rule.pattern}
                          </h4>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            backgroundColor: '#ffc107',
                            color: '#856404',
                            fontWeight: 'bold'
                          }}>
                            PENDING
                          </span>
                        </div>
                        <p style={{ margin: '0.5rem 0', color: '#666' }}>{rule.description}</p>
                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: '#666' }}>
                          <span><strong>Action:</strong> {rule.action}</span>
                          <span><strong>Priority:</strong> {rule.priority}</span>
                          <span><strong>Threshold:</strong> {rule.approval_threshold} admin(s)</span>
                          <span><strong>Created:</strong> {new Date(rule.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Vote Progress */}
                    <div style={{
                      backgroundColor: 'white',
                      padding: '1rem',
                      borderRadius: '4px',
                      marginBottom: '1rem',
                      border: '1px solid #ddd'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 'bold' }}>Approval Progress</span>
                        <span style={{ color: rule.approval_count >= rule.approval_threshold ? '#28a745' : '#666' }}>
                          {rule.approval_count} / {rule.approval_threshold} approvals
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: '#e0e0e0',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${(rule.approval_count / rule.approval_threshold) * 100}%`,
                          height: '100%',
                          backgroundColor: rule.approval_count >= rule.approval_threshold ? '#28a745' : '#007bff',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                      {rule.rejection_count > 0 && (
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#dc3545' }}>
                          {rule.rejection_count} rejection(s)
                        </p>
                      )}
                    </div>

                    {/* Votes List */}
                    {votes.length > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#666' }}>Votes:</h5>
                        {votes.map((vote) => (
                          <div key={vote.id} style={{
                            padding: '0.75rem',
                            backgroundColor: 'white',
                            borderLeft: `4px solid ${vote.vote === 'APPROVE' ? '#28a745' : '#dc3545'}`,
                            marginBottom: '0.5rem',
                            fontSize: '0.85rem'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                              <strong>{vote.admin_name}</strong>
                              <span style={{
                                color: vote.vote === 'APPROVE' ? '#28a745' : '#dc3545',
                                fontWeight: 'bold'
                              }}>
                                {vote.vote}
                              </span>
                            </div>
                            {vote.comment && (
                              <p style={{ margin: '0.25rem 0 0 0', color: '#666' }}>{vote.comment}</p>
                            )}
                            <span style={{ fontSize: '0.75rem', color: '#999' }}>
                              {new Date(vote.voted_at).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Voting Interface */}
                    {!hasVoted && (
                      <div style={{
                        backgroundColor: 'white',
                        padding: '1rem',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                      }}>
                        <h5 style={{ margin: '0 0 0.75rem 0' }}>Cast Your Vote:</h5>
                        <textarea
                          placeholder="Add an optional comment..."
                          value={voteComments[rule.id] || ''}
                          onChange={(e) => setVoteComments(prev => ({ ...prev, [rule.id]: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            marginBottom: '0.75rem',
                            minHeight: '60px',
                            resize: 'vertical',
                            boxSizing: 'border-box'
                          }}
                        />
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button
                            onClick={() => handleVoteOnRule(rule.id, 'APPROVE')}
                            style={{
                              flex: 1,
                              backgroundColor: '#28a745',
                              color: 'white',
                              border: 'none',
                              padding: '0.75rem',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              fontSize: '1rem'
                            }}
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => handleVoteOnRule(rule.id, 'REJECT')}
                            style={{
                              flex: 1,
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              padding: '0.75rem',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              fontSize: '1rem'
                            }}
                          >
                            ✗ Reject
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {hasVoted && (
                      <div style={{
                        backgroundColor: '#e7f3ff',
                        padding: '1rem',
                        borderRadius: '4px',
                        textAlign: 'center',
                        color: '#004085'
                      }}>
                        ✓ You have already voted on this rule
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'audit' && (
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginTop: 0 }}>Audit Logs</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#ecf0f1' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Time</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>User</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Event</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                      <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td style={{ padding: '0.75rem' }}>{log.user_name}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          backgroundColor: log.event.includes('EXECUTED') ? '#d4edda' : 
                                         log.event.includes('REJECTED') ? '#f8d7da' : '#e7f3ff',
                          color: log.event.includes('EXECUTED') ? '#155724' : 
                                log.event.includes('REJECTED') ? '#721c24' : '#004085'
                        }}>
                          {log.event}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                        {log.meta && (
                          <details>
                            <summary style={{ cursor: 'pointer', color: '#3498db' }}>View details</summary>
                            <pre style={{
                              marginTop: '0.5rem',
                              padding: '0.5rem',
                              backgroundColor: '#f5f5f5',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              overflow: 'auto'
                            }}>
                              {JSON.stringify(log.meta, null, 2)}
                            </pre>
                          </details>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminPanel;
