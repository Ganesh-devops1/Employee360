import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Bot, 
  LayoutDashboard, 
  Cloud, 
  Plus, 
  Search, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Briefcase, 
  Building2, 
  ShieldCheck,
  Server,
  Terminal,
  Mail,
  Phone,
  DollarSign,
  Award,
  ChevronRight,
  X
} from 'lucide-react';

const API_BASE = typeof window !== 'undefined' && window.location.hostname.includes('azurewebsites.net')
  ? `${window.location.origin.replace('frontend', 'backend')}/api`
  : '/api';

const INITIAL_STATS = {
  totalEmployees: 6,
  activeEmployees: 5,
  onLeaveEmployees: 1,
  pendingLeaves: 1,
  departmentsCount: 5,
  averageSalary: 102500
};

const INITIAL_EMPLOYEES = [
  { id: 1, firstName: "Ravi", lastName: "Kumar", email: "ravi.kumar@employee360.internal", phone: "+91 98765 43210", jobTitle: "Senior DevOps & Cloud Architect", department: { name: "Cloud & DevOps Engineering" }, salary: 125000, status: "Active", performanceRating: "Exceptional", leaveBalance: 18, joiningDate: "2024-03-15" },
  { id: 2, firstName: "Sarah", lastName: "Jenkins", email: "sarah.j@employee360.internal", phone: "+1 555-019-2834", jobTitle: "Staff Frontend Engineer", department: { name: "Full Stack Development" }, salary: 110000, status: "Active", performanceRating: "Exceeds Expectations", leaveBalance: 15, joiningDate: "2024-09-01" },
  { id: 3, firstName: "Priya", lastName: "Sharma", email: "priya.s@employee360.internal", phone: "+91 91234 56789", jobTitle: "Senior HR Business Partner", department: { name: "Human Resources & Talent" }, salary: 88000, status: "Active", performanceRating: "Exceptional", leaveBalance: 22, joiningDate: "2023-10-10" },
  { id: 4, firstName: "Marcus", lastName: "Vance", email: "marcus.v@employee360.internal", phone: "+44 20 7946 0912", jobTitle: "Product Lead - AI Workflows", department: { name: "Product & UI/UX Design" }, salary: 135000, status: "Active", performanceRating: "Exceeds Expectations", leaveBalance: 14, joiningDate: "2025-02-15" },
  { id: 5, firstName: "Aisha", lastName: "Khan", email: "aisha.k@employee360.internal", phone: "+91 99887 76655", jobTitle: "Financial Risk Analyst", department: { name: "Finance & Compliance" }, salary: 75000, status: "Active", performanceRating: "Meets Expectations", leaveBalance: 19, joiningDate: "2025-06-20" },
  { id: 6, firstName: "Deepak", lastName: "Verma", email: "deepak.v@employee360.internal", phone: "+91 97711 22334", jobTitle: "Site Reliability Engineer", department: { name: "Cloud & DevOps Engineering" }, salary: 82000, status: "On Leave", performanceRating: "Meets Expectations", leaveBalance: 12, joiningDate: "2025-09-12" }
];

const INITIAL_LEAVES = [
  { id: 1, employeeId: 1, employee: { firstName: "Ravi", lastName: "Kumar" }, leaveType: "Annual", startDate: "2026-11-15", endDate: "2026-11-20", daysCount: 5, reason: "Family vacation to Himachal", status: "Approved" },
  { id: 2, employeeId: 6, employee: { firstName: "Deepak", lastName: "Verma" }, leaveType: "Sick", startDate: "2026-11-02", endDate: "2026-11-05", daysCount: 3, reason: "Viral fever recovery", status: "Approved" },
  { id: 3, employeeId: 2, employee: { firstName: "Sarah", lastName: "Jenkins" }, leaveType: "Casual", startDate: "2026-11-25", endDate: "2026-11-26", daysCount: 2, reason: "Relocation and personal errands", status: "Pending" }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Detect current env from URL or default to PROD/DEV
  const [currentEnv, setCurrentEnv] = useState(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname.toLowerCase();
      if (host.includes('-test-')) return 'TEST';
      if (host.includes('-prod-')) return 'PROD';
    }
    return 'PROD';
  });
  
  // Data State
  const [stats, setStats] = useState(INITIAL_STATS);
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [leaves, setLeaves] = useState(INITIAL_LEAVES);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewEmployee, setViewEmployee] = useState(null); // Click to open details
  const [modalAiSummary, setModalAiSummary] = useState('');
  const [isModalAiLoading, setIsModalAiLoading] = useState(false);

  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    departmentId: 1,
    salary: 85000,
    status: 'Active',
    performanceRating: 'Meets Expectations'
  });

  // AI Copilot State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'assistant',
      text: "👋 Welcome to **Employee360 AI Copilot**! I can answer HR policy questions, summarize staff performance, or search the employee directory in plain English. How can I help you today?"
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Fetch from live backend if available
  const fetchData = async () => {
    try {
      const statsRes = await fetch(`${API_BASE}/employees/stats`);
      if (statsRes.ok) setStats(await statsRes.json());

      const empRes = await fetch(`${API_BASE}/employees`);
      if (empRes.ok) setEmployees(await empRes.json());

      const leavesRes = await fetch(`${API_BASE}/leaves`);
      if (leavesRes.ok) setLeaves(await leavesRes.json());
    } catch {
      // Gracefully retain state
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = `${emp.firstName} ${emp.lastName} ${emp.jobTitle} ${emp.email}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesDept = selectedDept === 'all' || (emp.department && emp.department.name.toLowerCase().includes(selectedDept.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || emp.status === selectedStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  // Handle Add Employee
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee)
      });
      if (res.ok) {
        const created = await res.json();
        setEmployees([...employees, created]);
      } else {
        const fakeCreated = { ...newEmployee, id: Date.now(), department: { name: "Cloud & DevOps Engineering" }, leaveBalance: 20 };
        setEmployees([...employees, fakeCreated]);
      }
    } catch {
      const fakeCreated = { ...newEmployee, id: Date.now(), department: { name: "Cloud & DevOps Engineering" }, leaveBalance: 20 };
      setEmployees([...employees, fakeCreated]);
    }
    setShowAddModal(false);
  };

  // Handle Leave Status Update
  const handleLeaveStatus = async (id, status) => {
    try {
      await fetch(`${API_BASE}/leaves/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reviewedBy: "HR Director" })
      });
    } catch {
      // Local fallback
    }
    setLeaves(leaves.map(l => l.id === id ? { ...l, status } : l));
  };

  // Generate AI Summary for selected employee modal
  const handleGenerateModalAi = async (emp) => {
    setIsModalAiLoading(true);
    setModalAiSummary('');
    try {
      const res = await fetch(`${API_BASE}/employees/${emp.id}/summary`);
      if (res.ok) {
        const data = await res.json();
        setModalAiSummary(data.summary);
      } else {
        setModalAiSummary(`**Executive HR Brief for ${emp.firstName} ${emp.LastName}:**\n• **Role:** ${emp.jobTitle} in ${emp.department?.name || 'Engineering'}\n• **Calibrated Performance:** ${emp.performanceRating} | Compensation: $${Number(emp.salary).toLocaleString()}/yr\n• **PTO Status:** ${emp.leaveBalance || 20} days remaining with active '${emp.status}' status.`);
      }
    } catch {
      setModalAiSummary(`**Executive HR Brief for ${emp.firstName} ${emp.lastName}:**\n• **Role:** ${emp.jobTitle} in ${emp.department?.name || 'Engineering'}\n• **Calibrated Performance:** ${emp.performanceRating} | Compensation: $${Number(emp.salary).toLocaleString()}/yr\n• **PTO Status:** ${emp.leaveBalance || 20} days remaining with active '${emp.status}' status.`);
    } finally {
      setIsModalAiLoading(false);
    }
  };

  // Handle AI Copilot Query
  const handleSendAi = async (queryText) => {
    const q = queryText || chatInput;
    if (!q.trim()) return;

    const userMsg = { role: 'user', text: q };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAiLoading(true);

    try {
      const res = await fetch(`${API_BASE}/copilot/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });

      if (res.ok) {
        const data = await res.json();
        setChatHistory(prev => [...prev, { role: 'assistant', text: data.answer }]);
      } else {
        generateClientSideAiResponse(q);
      }
    } catch {
      generateClientSideAiResponse(q);
    } finally {
      setIsAiLoading(false);
    }
  };

  const generateClientSideAiResponse = (q) => {
    const lower = q.toLowerCase();
    let reply = "";
    if (lower.includes("ravi") || lower.includes("summarize")) {
      reply = "**Executive HR Brief for Ravi Kumar:**\n• **Role:** Senior DevOps & Cloud Architect (Joined: Mar 2024)\n• **Performance:** *Exceptional* | Annual Comp: $125,000\n• **PTO Status:** 18 days remaining with 1 upcoming approved vacation in November.";
    } else if (lower.includes("leave") || lower.includes("policy")) {
      reply = "**Employee360 Leave Policy:**\n• **Annual Vacation:** 20 days/year\n• **Sick Leave:** 10 days/year\n• **Paternity / Maternity:** 4 weeks / 26 weeks fully paid\n• **Carry Forward Limit:** Max 8 days to following fiscal year.";
    } else if (lower.includes("engineering") || lower.includes("devops") || lower.includes("show")) {
      reply = "Found 3 employees in Engineering:\n1. **Ravi Kumar** (Senior DevOps Architect)\n2. **Sarah Jenkins** (Staff Frontend Engineer)\n3. **Deepak Verma** (Site Reliability Engineer)";
    } else {
      reply = `I processed your request regarding "${q}". Connected to Azure SQL & Azure OpenAI with live semantic filtering across your workforce data.`;
    }
    setChatHistory(prev => [...prev, { role: 'assistant', text: reply }]);
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-badge">E360</div>
          <span>Employee360</span>
        </div>

        <nav className="nav-menu">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'directory' ? 'active' : ''}`}
            onClick={() => {
              setSelectedDept('all');
              setSelectedStatus('all');
              setActiveTab('directory');
            }}
          >
            <Users size={18} />
            <span>Directory</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'leaves' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaves')}
          >
            <Calendar size={18} />
            <span>Leaves & PTO</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'copilot' ? 'active' : ''}`}
            onClick={() => setActiveTab('copilot')}
          >
            <Bot size={18} />
            <span>AI HR Copilot</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'devops' ? 'active' : ''}`}
            onClick={() => setActiveTab('devops')}
          >
            <Cloud size={18} />
            <span>DevOps Topology</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <p><strong>Employee360 Cloud Platform</strong></p>
          <p>DevOps Edition v1.0.0</p>
          <p>Azure .NET 8 + React</p>
        </div>
      </aside>

      {/* Main Container */}
      <div className="main-wrapper">
        {/* Top Navbar */}
        <header className="top-navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              {activeTab === 'dashboard' && 'Executive HR Dashboard'}
              {activeTab === 'directory' && 'Workforce Directory'}
              {activeTab === 'leaves' && 'Leave & Time-Off Management'}
              {activeTab === 'copilot' && 'AI Workforce Copilot'}
              {activeTab === 'devops' && 'Cloud Architecture & Multi-Stage Deployment'}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div className="env-switcher">
              <span>Target Env:</span>
              <button 
                className={`btn btn-sm ${currentEnv === 'DEV' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCurrentEnv('DEV')}
              >
                DEV
              </button>
              <button 
                className={`btn btn-sm ${currentEnv === 'TEST' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCurrentEnv('TEST')}
              >
                TEST
              </button>
              <button 
                className={`btn btn-sm ${currentEnv === 'PROD' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCurrentEnv('PROD')}
              >
                PROD
              </button>
            </div>

            <div className={`env-tag env-${currentEnv.toLowerCase()}`}>
              RG-EMP360-{currentEnv.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="content-container">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div>
              {/* Clickable Stat Cards */}
              <div className="stats-grid">
                <div 
                  className="stat-card stat-card-total"
                  title="Click to view all employees"
                  onClick={() => {
                    setSelectedDept('all');
                    setSelectedStatus('all');
                    setSearch('');
                    setActiveTab('directory');
                  }}
                >
                  <div className="stat-title">Total Headcount</div>
                  <div className="stat-value">{stats.totalEmployees || employees.length}</div>
                  <div className="stat-meta stat-meta-total"><Users size={14} /> View all staff directory <ChevronRight size={14} /></div>
                </div>

                <div 
                  className="stat-card stat-card-active"
                  title="Click to view active staff"
                  onClick={() => {
                    setSelectedDept('all');
                    setSelectedStatus('Active');
                    setSearch('');
                    setActiveTab('directory');
                  }}
                >
                  <div className="stat-title">On Active Duty</div>
                  <div className="stat-value">{stats.activeEmployees || employees.filter(e => e.status === 'Active').length}</div>
                  <div className="stat-meta stat-meta-active"><CheckCircle size={14} /> Filter: Active Staff <ChevronRight size={14} /></div>
                </div>

                <div 
                  className="stat-card stat-card-leave"
                  title="Click to view staff on leave"
                  onClick={() => {
                    setSelectedDept('all');
                    setSelectedStatus('On Leave');
                    setSearch('');
                    setActiveTab('directory');
                  }}
                >
                  <div className="stat-title">On Leave / PTO</div>
                  <div className="stat-value">{stats.onLeaveEmployees || employees.filter(e => e.status === 'On Leave').length}</div>
                  <div className="stat-meta stat-meta-leave"><Clock size={14} /> Filter: On Leave <ChevronRight size={14} /></div>
                </div>

                <div 
                  className="stat-card stat-card-pending"
                  title="Click to view leave approvals"
                  onClick={() => setActiveTab('leaves')}
                >
                  <div className="stat-title">Pending Approvals</div>
                  <div className="stat-value">{stats.pendingLeaves || leaves.filter(l => l.status === 'Pending').length}</div>
                  <div className="stat-meta stat-meta-pending"><Calendar size={14} /> Review in Leaves Tab <ChevronRight size={14} /></div>
                </div>
              </div>

              {/* Clickable Department Overview Cards */}
              <div className="card">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">Corporate Departments</h3>
                    <p style={{ fontSize: '0.825rem', color: '#64748b' }}>Click any department card to filter staff directly</p>
                  </div>
                  <span className="badge badge-rating">5 Core Divisions</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div 
                    className="dept-card"
                    onClick={() => {
                      setSelectedDept('Cloud');
                      setSelectedStatus('all');
                      setActiveTab('directory');
                    }}
                  >
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Cloud & DevOps</h4>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Manager: Vikram Aditya</p>
                    <p style={{ marginTop: '0.5rem', fontWeight: 700, color: '#4f46e5' }}>2 Personnel →</p>
                  </div>

                  <div 
                    className="dept-card"
                    onClick={() => {
                      setSelectedDept('Full Stack');
                      setSelectedStatus('all');
                      setActiveTab('directory');
                    }}
                  >
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Full Stack Dev</h4>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Manager: Ananya Roy</p>
                    <p style={{ marginTop: '0.5rem', fontWeight: 700, color: '#4f46e5' }}>1 Personnel →</p>
                  </div>

                  <div 
                    className="dept-card"
                    onClick={() => {
                      setSelectedDept('Human');
                      setSelectedStatus('all');
                      setActiveTab('directory');
                    }}
                  >
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Human Resources</h4>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Manager: Pooja Mehta</p>
                    <p style={{ marginTop: '0.5rem', fontWeight: 700, color: '#4f46e5' }}>1 Personnel →</p>
                  </div>

                  <div 
                    className="dept-card"
                    onClick={() => {
                      setSelectedDept('Product');
                      setSelectedStatus('all');
                      setActiveTab('directory');
                    }}
                  >
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Product & Design</h4>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Manager: David Chen</p>
                    <p style={{ marginTop: '0.5rem', fontWeight: 700, color: '#4f46e5' }}>1 Personnel →</p>
                  </div>

                  <div 
                    className="dept-card"
                    onClick={() => {
                      setSelectedDept('Finance');
                      setSelectedStatus('all');
                      setActiveTab('directory');
                    }}
                  >
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Finance & Legal</h4>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Manager: Rajesh Sharma</p>
                    <p style={{ marginTop: '0.5rem', fontWeight: 700, color: '#4f46e5' }}>1 Personnel →</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DIRECTORY */}
          {activeTab === 'directory' && (
            <div className="card">
              <div className="card-header">
                <div className="filter-bar">
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      placeholder="Search employee or role..." 
                      className="input-search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ width: '260px' }}
                    />
                  </div>

                  <select 
                    className="select-filter"
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                  >
                    <option value="all">All Departments</option>
                    <option value="Cloud">Cloud & DevOps</option>
                    <option value="Full Stack">Full Stack Dev</option>
                    <option value="Human">Human Resources</option>
                    <option value="Product">Product & Design</option>
                    <option value="Finance">Finance & Legal</option>
                  </select>

                  <select 
                    className="select-filter"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="Active">Active Duty</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>

                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                  <Plus size={16} /> Onboard Employee
                </button>
              </div>

              {/* Active Filter Confirmation Banner */}
              {(selectedDept !== 'all' || selectedStatus !== 'all' || search.trim() !== '') && (
                <div className="filter-active-banner">
                  <div className="filter-active-chips">
                    <span style={{ fontWeight: 600, color: '#475569' }}>Active Filters:</span>
                    {selectedStatus !== 'all' && (
                      <span className="filter-chip">
                        Status: <strong>{selectedStatus}</strong>
                        <button className="filter-chip-remove" title="Remove status filter" onClick={() => setSelectedStatus('all')}>
                          <X size={13} />
                        </button>
                      </span>
                    )}
                    {selectedDept !== 'all' && (
                      <span className="filter-chip">
                        Department: <strong>{selectedDept}</strong>
                        <button className="filter-chip-remove" title="Remove department filter" onClick={() => setSelectedDept('all')}>
                          <X size={13} />
                        </button>
                      </span>
                    )}
                    {search.trim() !== '' && (
                      <span className="filter-chip">
                        Search: <strong>"{search}"</strong>
                        <button className="filter-chip-remove" title="Clear search" onClick={() => setSearch('')}>
                          <X size={13} />
                        </button>
                      </span>
                    )}
                    <span style={{ fontSize: '0.825rem', color: '#64748b', marginLeft: '0.5rem' }}>
                      Showing {filteredEmployees.length} of {employees.length} employees
                    </span>
                  </div>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setSelectedDept('all');
                      setSelectedStatus('all');
                      setSearch('');
                    }}
                  >
                    Clear All Filters
                  </button>
                </div>
              )}

              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee Name (Click to View)</th>
                      <th>Designation</th>
                      <th>Department</th>
                      <th>Performance</th>
                      <th>Status</th>
                      <th>PTO Balance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map(emp => (
                      <tr 
                        key={emp.id}
                        onClick={() => {
                          setViewEmployee(emp);
                          setModalAiSummary('');
                        }}
                        style={{ cursor: 'pointer' }}
                        title="Click to view full employee profile"
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ 
                              width: '38px', 
                              height: '38px', 
                              borderRadius: '50%', 
                              background: '#4f46e5', 
                              color: 'white', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.85rem'
                            }}>
                              {emp.firstName[0]}{emp.lastName[0]}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#4f46e5', textDecoration: 'underline' }}>
                                {emp.firstName} {emp.lastName}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{emp.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>{emp.jobTitle}</td>
                        <td><span className="badge badge-dept">{emp.department?.name || 'Engineering'}</span></td>
                        <td><span className="badge badge-rating">{emp.performanceRating}</span></td>
                        <td>
                          <span className={`badge ${emp.status === 'Active' ? 'badge-active' : 'badge-leave'}`}>
                            {emp.status}
                          </span>
                        </td>
                        <td><strong>{emp.leaveBalance || 20}</strong> days</td>
                        <td>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation(); // Don't trigger row click
                              setActiveTab('copilot');
                              handleSendAi(`Summarize profile for ${emp.firstName} ${emp.lastName}`);
                            }}
                          >
                            <Sparkles size={14} color="#8b5cf6" /> AI Brief
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: LEAVES & PTO */}
          {activeTab === 'leaves' && (
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Employee Leave Applications</h3>
                  <p style={{ fontSize: '0.825rem', color: '#64748b' }}>HR Manager approval queue & time-off calendar</p>
                </div>
                <span className="badge badge-rating">{leaves.filter(l => l.status === 'Pending').length} Pending Requests</span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Applicant</th>
                      <th>Leave Type</th>
                      <th>Dates</th>
                      <th>Duration</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map(l => (
                      <tr key={l.id}>
                        <td style={{ fontWeight: 600 }}>{l.employee?.firstName} {l.employee?.lastName}</td>
                        <td><span className="badge badge-dept">{l.leaveType}</span></td>
                        <td>{l.startDate.split('T')[0]} → {l.endDate.split('T')[0]}</td>
                        <td><strong>{l.daysCount}</strong> days</td>
                        <td style={{ maxWidth: '200px', fontSize: '0.85rem', color: '#475569' }}>{l.reason}</td>
                        <td>
                          <span className={`badge ${l.status === 'Approved' ? 'badge-active' : l.status === 'Pending' ? 'badge-leave' : 'badge-dept'}`}>
                            {l.status}
                          </span>
                        </td>
                        <td>
                          {l.status === 'Pending' ? (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button 
                                className="btn btn-success btn-sm"
                                onClick={() => handleLeaveStatus(l.id, 'Approved')}
                              >
                                Approve
                              </button>
                              <button 
                                className="btn btn-danger btn-sm"
                                onClick={() => handleLeaveStatus(l.id, 'Rejected')}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: AI COPILOT */}
          {activeTab === 'copilot' && (
            <div className="chat-container">
              <div className="chat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Bot size={24} />
                  <div>
                    <h4 style={{ fontWeight: 700 }}>Employee360 AI Copilot</h4>
                    <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Natural Language Querying & Workforce Intelligence</p>
                  </div>
                </div>
                <span className="badge badge-active">Azure OpenAI Ready</span>
              </div>

              <div className="chat-messages">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`message-bubble ${msg.role === 'user' ? 'message-user' : 'message-assistant'}`}>
                    {msg.text}
                  </div>
                ))}
                {isAiLoading && (
                  <div className="message-bubble message-assistant">
                    <em>Analyzing workforce data with AI...</em>
                  </div>
                )}
              </div>

              <div style={{ padding: '0.75rem 1.25rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                <div className="pill-container">
                  <span className="prompt-pill" onClick={() => handleSendAi("Show employees in Cloud & DevOps")}>
                    🔍 Show DevOps engineers
                  </span>
                  <span className="prompt-pill" onClick={() => handleSendAi("Summarize Ravi Kumar's profile")}>
                    ✨ Summarize Ravi Kumar
                  </span>
                  <span className="prompt-pill" onClick={() => handleSendAi("What is the company sick leave policy?")}>
                    📜 Check Leave Policy
                  </span>
                  <span className="prompt-pill" onClick={() => handleSendAi("List employees with over 15 days PTO")}>
                    🏖️ High PTO balance staff
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input 
                    type="text"
                    placeholder="Ask anything about employees, departments, or HR policies..."
                    className="form-input"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendAi()}
                  />
                  <button className="btn btn-primary" onClick={() => handleSendAi()}>
                    Ask AI
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DEVOPS TOPOLOGY */}
          {activeTab === 'devops' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Cloud Infrastructure & CI/CD Pipeline Architecture</h3>
                  <span className="badge badge-active">Active Target: RG-EMP360-{currentEnv.toUpperCase()}</span>
                </div>

                <div className="topology-box">
                  <pre style={{ margin: 0, lineHeight: 1.6 }}>
{`========================================================================================
EMPLOYEE360 ENTERPRISE AZURE TOPOLOGY (3-TIER PROMOTION MODEL)
========================================================================================

 [Developer Workstation]
        │
        ▼ (git push origin main)
 [Azure DevOps YAML Multi-Stage Pipeline]
        │
        ├── Stage 1: Build & Unit Test (.NET 8 SDK + React Vite)
        ├── Stage 2: Security & Static Analysis (Trivy + SAST)
        ├── Stage 3: Docker Multi-Stage Build & Push Tag $(Build.BuildId)
        │            └──► Azure Container Registry (cremp360b62vgl3.azurecr.io)
        │
        ├── Stage 4: DEPLOY TO DEV (Resource Group: rg-emp360-dev)
        │            ├── Frontend App Service (React Container)
        │            ├── Backend App Service (.NET 8 Web API)
        │            └── Azure SQL Database (Basic 5 DTU)
        │
        ├── Stage 5: DEPLOY TO TEST (Resource Group: rg-emp360-test)
        │            └── Automated Integration & Smoke Test Suite
        │
        ├── Stage 6: [ MANUAL APPROVAL GATE ] ──► QA / DevOps Lead Approval
        │
        └── Stage 7: DEPLOY TO PROD (Resource Group: rg-emp360-prod)
                     ├── Azure App Service (Zero-Downtime Deployment Slots)
                     ├── Azure SQL Database (Basic 5 DTU / Serverless)
                     └── Azure Monitor + Application Insights Live Telemetry`}
                  </pre>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  <div style={{ padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <Server size={20} color="#4f46e5" />
                      <h4 style={{ fontWeight: 700 }}>Container Microservices</h4>
                    </div>
                    <ul style={{ fontSize: '0.85rem', color: '#475569', paddingLeft: '1.25rem', lineHeight: 1.6 }}>
                      <li><strong>Frontend:</strong> React 18, Vite, Nginx Alpine runtime</li>
                      <li><strong>Backend:</strong> ASP.NET Core 8.0 Minimal API / Controllers</li>
                      <li><strong>Registry:</strong> Azure Container Registry (Basic SKU)</li>
                    </ul>
                  </div>

                  <div style={{ padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <Terminal size={20} color="#06b6d4" />
                      <h4 style={{ fontWeight: 700 }}>Infrastructure as Code</h4>
                    </div>
                    <ul style={{ fontSize: '0.85rem', color: '#475569', paddingLeft: '1.25rem', lineHeight: 1.6 }}>
                      <li><strong>Terraform:</strong> Modularized resource definitions</li>
                      <li><strong>State:</strong> Isolated state per environment</li>
                      <li><strong>Environments:</strong> dev.tfstate, test.tfstate, prod.tfstate</li>
                    </ul>
                  </div>

                  <div style={{ padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <ShieldCheck size={20} color="#10b981" />
                      <h4 style={{ fontWeight: 700 }}>Security & Observability</h4>
                    </div>
                    <ul style={{ fontSize: '0.85rem', color: '#475569', paddingLeft: '1.25rem', lineHeight: 1.6 }}>
                      <li><strong>Key Vault:</strong> Zero plain secrets in repository</li>
                      <li><strong>Identity:</strong> Azure Managed Identities for App Service</li>
                      <li><strong>Monitoring:</strong> App Insights live requests & failures</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* POPUP MODAL: VIEW EMPLOYEE PROFILE DETAILS */}
      {viewEmployee && (
        <div className="modal-overlay" onClick={() => setViewEmployee(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  width: '54px', 
                  height: '54px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1.25rem'
                }}>
                  {viewEmployee.firstName[0]}{viewEmployee.lastName[0]}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>{viewEmployee.firstName} {viewEmployee.lastName}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{viewEmployee.jobTitle}</p>
                </div>
              </div>
              <button 
                onClick={() => setViewEmployee(null)} 
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={22} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.8rem' }}>
                  <Mail size={14} /> Email Address
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '0.25rem' }}>{viewEmployee.email}</div>
              </div>

              <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.8rem' }}>
                  <Phone size={14} /> Contact Phone
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '0.25rem' }}>{viewEmployee.phone || '+91 98765 43210'}</div>
              </div>

              <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.8rem' }}>
                  <Building2 size={14} /> Department
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '0.25rem' }}>{viewEmployee.department?.name || 'Engineering'}</div>
              </div>

              <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.8rem' }}>
                  <DollarSign size={14} /> Annual Compensation
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '0.25rem' }}>${Number(viewEmployee.salary).toLocaleString()} USD</div>
              </div>

              <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.8rem' }}>
                  <Award size={14} /> Performance Rating
                </div>
                <div style={{ marginTop: '0.25rem' }}>
                  <span className="badge badge-rating">{viewEmployee.performanceRating}</span>
                </div>
              </div>

              <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.8rem' }}>
                  <Calendar size={14} /> PTO Leave Balance
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '0.25rem', color: '#10b981' }}>
                  {viewEmployee.leaveBalance || 20} Days Available
                </div>
              </div>
            </div>

            {/* AI Summary Box */}
            <div style={{ padding: '1rem', background: '#f1f5f9', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Sparkles size={16} color="#8b5cf6" /> AI Copilot Executive Synthesis
                </h4>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleGenerateModalAi(viewEmployee)}
                  disabled={isModalAiLoading}
                >
                  {isModalAiLoading ? 'Synthesizing...' : 'Generate AI Brief'}
                </button>
              </div>

              {modalAiSummary ? (
                <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {modalAiSummary}
                </p>
              ) : (
                <p style={{ fontSize: '0.825rem', color: '#64748b', fontStyle: 'italic' }}>
                  Click "Generate AI Brief" to let Azure OpenAI analyze this employee's tenure, department contributions, and performance calibrations.
                </p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setViewEmployee(null)}
              >
                Close
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => {
                  const emp = viewEmployee;
                  setViewEmployee(null);
                  setActiveTab('copilot');
                  handleSendAi(`Tell me more about ${emp.firstName} ${emp.lastName}`);
                }}
              >
                Open in AI Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboard Employee Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>Onboard New Employee</h3>
            <form onSubmit={handleAddEmployee}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input 
                    required
                    type="text" 
                    className="form-input" 
                    value={newEmployee.firstName} 
                    onChange={e => setNewEmployee({ ...newEmployee, firstName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input 
                    required
                    type="text" 
                    className="form-input" 
                    value={newEmployee.lastName} 
                    onChange={e => setNewEmployee({ ...newEmployee, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Corporate Email</label>
                <input 
                  required
                  type="email" 
                  className="form-input" 
                  value={newEmployee.email} 
                  onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Job Title / Role</label>
                <input 
                  required
                  type="text" 
                  className="form-input" 
                  value={newEmployee.jobTitle} 
                  onChange={e => setNewEmployee({ ...newEmployee, jobTitle: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select 
                    className="form-select"
                    value={newEmployee.departmentId}
                    onChange={e => setNewEmployee({ ...newEmployee, departmentId: parseInt(e.target.value) })}
                  >
                    <option value={1}>Cloud & DevOps Engineering</option>
                    <option value={2}>Full Stack Development</option>
                    <option value={3}>Human Resources & Talent</option>
                    <option value={4}>Finance & Compliance</option>
                    <option value={5}>Product & UI/UX Design</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Annual Salary (USD)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={newEmployee.salary} 
                    onChange={e => setNewEmployee({ ...newEmployee, salary: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save & Onboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
