# Command Gateway System

A full-stack application for managing command submissions with rule-based validation, credit system, and role-based access control.

> **🚀 Live Demo**: [https://unbound-hackathon.vercel.app](https://unbound-hackathon.vercel.app)  
> **📁 Repository**: [GitHub](https://github.com/saran2006psg/unbound_hackathon)

---

## 📺 Demo Video

🎥 **[Watch Complete Project Walkthrough](https://your-demo-video-link)**

**What's Covered:**

- Complete system overview and live deployment
- User authentication and role-based access control
- Command submission and validation flow
- Admin panel features (user management, rule configuration)
- **Bonus Feature #1**: Rule Conflict Detection ⭐
- **Bonus Feature #2**: Multi-Admin Voting System with notifications ⭐
- Live demonstration of credit system and audit logging

---

## ✨ Features

### Core Features ✅

- **API Key Authentication**: Secure access using API keys
- **Role-Based Access Control**: Admin and Member roles with different permissions
- **Credit System**: Credits deducted for executed commands (prevent abuse)
- **Rule-Based Command Validation**: Configurable regex rules with priority-based matching
- **Mock Command Execution**: Safe command simulation without actual shell execution
- **Audit Trail**: Complete logging of all operations for security and debugging

### 🎁 Bonus Features

#### **Bonus #1: Rule Conflict Detection** ⭐

- Prevents admins from creating overlapping regex rules
- Tests new patterns against 15 default commands
- Shows detailed conflict analysis with overlapping commands
- Option to force-create rules when conflicts are intentional
- Real-time pattern validation in Admin UI

#### **Bonus #2: Multi-Admin Voting System** ⭐

- Rules can require multiple admin approvals before activation
- Configurable approval threshold (1-10 admins required)
- Real-time notification system with unread count badge
- Admins can vote **APPROVE** or **REJECT** with optional comments
- Progress tracking: visual progress bar showing X/Y approvals
- **Pending Rules** tab shows all rules awaiting approval
- Notification bell polls every 30 seconds for new updates

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite → **Deployed on Vercel**
- **Backend**: Python FastAPI + Uvicorn → **Deployed on Render**
- **Database**: Supabase PostgreSQL (live production database)

---

## 🚀 Setup and Run Instructions

### Option 1: Use Live Deployment (Recommended)

**🎯 Just visit: [https://unbound-hackathon.vercel.app](https://unbound-hackathon.vercel.app)**

**Default Login:**

```
API Key: cgw_admin_default_key_change_in_production
```

### Option 2: Local Development

#### Prerequisites

- Python 3.9+
- Node.js 16+ and npm
- Git

#### Backend Setup

```bash
# Clone repository
git clone https://github.com/saran2006psg/unbound_hackathon.git
cd unbound_hackathon/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with Supabase credentials
# Contact repo owner for credentials or set up your own Supabase project

# Run backend
python -m uvicorn main:app --reload
```

Backend available at: **http://localhost:8000**

#### Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Run frontend
npm run dev
```

Frontend available at: **http://localhost:3000**

---

## 📚 API Documentation

### Authentication

- **Header**: `x-api-key: your_api_key_here`
- **Validation**: `GET /api/auth/validate`

### Key Endpoints

#### Commands

```bash
POST /api/commands              # Submit command for validation
GET /api/commands/history       # Get user's command history
```

#### Users (Admin Only)

```bash
POST /api/users                 # Create new user
GET /api/users                  # List all users
PUT /api/users/{id}/credits     # Update user credits
```

#### Rules (Admin Only)

```bash
POST /api/rules                 # Create validation rule
GET /api/rules                  # List all rules
POST /api/rules/check-conflicts # Check for conflicts (Bonus #1)
POST /api/rules/{id}/vote       # Vote on pending rule (Bonus #2)
GET /api/rules/pending          # Get pending rules (Bonus #2)
```

### Live API Documentation

- **Production**: [https://command-gateway-backend-pyjx.onrender.com/docs](https://command-gateway-backend-pyjx.onrender.com/docs)
- **Local**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🎮 Usage Examples

### Basic Command Submission

```bash
curl -X POST "https://command-gateway-backend-pyjx.onrender.com/api/commands" \
  -H "Content-Type: application/json" \
  -H "x-api-key: cgw_admin_default_key_change_in_production" \
  -d '{"command_text": "ls -la"}'
```

### Check Rule Conflicts (Bonus #1)

```bash
curl -X POST "https://command-gateway-backend-pyjx.onrender.com/api/rules/check-conflicts" \
  -H "Content-Type: application/json" \
  -H "x-api-key: cgw_admin_default_key_change_in_production" \
  -d '{"pattern": "^ls"}'
```

### Create User

```bash
curl -X POST "https://command-gateway-backend-pyjx.onrender.com/api/users" \
  -H "Content-Type: application/json" \
  -H "x-api-key: cgw_admin_default_key_change_in_production" \
  -d '{"name": "Test User", "role": "member", "credits": 50}'
```

---

## 🎬 Demo Script for Recording

### Test Data for Demo

**Login:**

```
API Key: cgw_admin_default_key_change_in_production
```

**Create Users:**

```
Username: john_doe | Email: john@company.com | Role: member | Credits: 50
Username: jane_admin | Email: jane@company.com | Role: admin | Credits: 100
```

**Create Rules:**

```
Pattern: help | Description: Show help information | Credit Cost: 1 | Roles: member,admin
Pattern: backup.* | Description: Database backup operations | Credit Cost: 10 | Roles: admin
Pattern: restart.* | Description: Restart services | Cost: 15 | Roles: admin | Threshold: 2
```

**Test Commands:**

```
help
list files
restart server
backup database
```

**Conflict Demo:**
Create rule with pattern `backup database` after `backup.*` exists → Shows conflict!

---

## 🏗️ Project Structure

```
unbound_hack/
├── backend/                    # FastAPI Python backend
│   ├── app/
│   │   ├── models/            # Pydantic models
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Business logic
│   │   └── middleware/        # Authentication
│   ├── main.py               # FastAPI app
│   └── requirements.txt      # Dependencies
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── pages/            # Login, Dashboard, AdminPanel
│   │   ├── components/       # Reusable components
│   │   └── services/         # API client
│   └── package.json          # Dependencies
└── README.md                 # This file
```

---

## 🛡️ Security Features

- ✅ **No Real Shell Execution** - All commands safely mocked
- ✅ **API Key Authentication** - Secure access control
- ✅ **Role-Based Permissions** - Admin vs Member access
- ✅ **Input Validation** - Regex pattern validation
- ✅ **Audit Logging** - Complete operation trail
- ✅ **Credit System** - Prevents command spam
- ✅ **HTTPS Deployment** - Secure production environment

---

## 🎯 Bonus Features Deep Dive

### Bonus #1: Rule Conflict Detection

**Problem Solved**: Prevents overlapping regex rules that could cause unexpected behavior.

**How It Works**:

1. Tests new pattern against 15 realistic commands
2. Identifies conflicts with existing rules
3. Shows detailed conflict report
4. Prevents creation unless explicitly forced

**Demo**: Try creating pattern `backup database` after `backup.*` exists!

### Bonus #2: Multi-Admin Voting System

**Problem Solved**: Critical rules need multiple admin approval for security.

**How It Works**:

1. Rules with `threshold > 1` go to PENDING status
2. All admins get real-time notifications
3. Admins vote APPROVE/REJECT with comments
4. Progress tracking with visual bars
5. Auto-activation when threshold met

**Demo**: Create a rule with threshold=2, watch voting workflow!

---

## 📝 Default Configuration

**Admin User**: API key `cgw_admin_default_key_change_in_production`

**Pre-configured Rules**:

- Block dangerous commands (`rm -rf /`, fork bombs)
- Allow safe commands (`ls`, `cat`, `pwd`, `echo`)
- Allow safe git operations (`git status`, `git log`)

---

## 💬 Support & Repository

**🔗 Links**:

- **Live Demo**: [https://unbound-hackathon.vercel.app](https://unbound-hackathon.vercel.app)
- **GitHub**: [https://github.com/saran2006psg/unbound_hackathon](https://github.com/saran2006psg/unbound_hackathon)
- **Backend API**: [https://command-gateway-backend-pyjx.onrender.com](https://command-gateway-backend-pyjx.onrender.com)

**Built with ❤️ for the Unbound Hackathon** 2. **Users Tab**: Create users, assign roles, manage credits 3. **Rules Tab**:

- Create regex validation rules with approval thresholds
- Test patterns before creating
- **Check for conflicts** to prevent overlaps ⭐
- View all active rules with priorities

4. **Pending Rules Tab** ⭐:
   - View rules awaiting approval
   - Vote APPROVE/REJECT with comments
   - See progress bars (X/Y approvals)
   - View all votes from other admins
5. **Audit Tab**: View complete audit trail of all system operations
6. **Notification Bell** 🔔: Real-time notifications for pending rules and decisions

**Command Validation Flow:**

```
User submits command → Authenticate → Check credits →
Match against rules (priority order) → Execute or reject →
Deduct credit → Log to audit → Return result
```

## ✨ Features

### Core Features

- **API Key Authentication**: Secure access using API keys
- **Role-Based Access Control**: Admin and Member roles with different permissions
- **Credit System**: Credits deducted for executed commands (prevent abuse)
- **Rule-Based Command Validation**: Configurable regex rules with priority-based matching
- **Mock Command Execution**: Safe command simulation without actual shell execution
- **Audit Trail**: Complete logging of all operations for security and debugging
- **Atomic Operations**: Database rollback on failures ensures data consistency

### 🎁 Bonus Features

#### 1. Rule Conflict Detection ⭐

- Prevents admins from creating overlapping regex rules
- Tests new patterns against 15 default commands
- Shows detailed conflict analysis with overlapping commands
- Option to force-create rules when conflicts are intentional
- Real-time pattern validation in Admin UI

#### 2. Voting Thresholds (Multi-Admin Approval) ⭐

- Rules can require multiple admin approvals before activation
- Configurable approval threshold (1-10 admins required)
- Rules with threshold > 1 go to **PENDING** status
- Real-time notification system with unread count badge
- Admins can vote **APPROVE** or **REJECT** with optional comments
- Progress tracking: visual progress bar showing X/Y approvals
- Automatic rule activation when threshold is met
- Automatic rule rejection if enough rejections
- Prevents duplicate votes (each admin votes once per rule)
- Complete vote history with admin names, timestamps, and comments
- **Pending Rules** tab shows all rules awaiting approval
- Notification bell polls every 30 seconds for new updates
- Database tracking: `rule_votes` and `rule_notifications` tables

## 🛠️ Tech Stack

- **Backend**: Python FastAPI with Uvicorn
- **Database**: Supabase (PostgreSQL)
- **Frontend**: React 18 with Vite
- **Styling**: Custom CSS (no framework dependencies)

## 📁 Project Structure

```
unbound_hack/
├── backend/
│   ├── app/
│   │   ├── models/          # Pydantic models (User, Rule, Command, AuditLog)
│   │   ├── routes/          # API endpoints (auth, users, commands, rules, audit)
│   │   ├── services/        # Business logic (conflict detection, validation)
│   │   ├── middleware/      # Authentication & authorization
│   │   ├── config.py        # Environment configuration
│   │   └── database.py      # Supabase client setup
│   ├── migrations/          # Database schemas with seed data
│   ├── main.py             # FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── .env                # Environment variables (not in git)
├── frontend/
│   ├── src/
│   │   ├── pages/          # Login, Dashboard, AdminPanel
│   │   ├── components/     # Layout, ProtectedRoute
│   │   ├── context/        # AuthContext for state management
│   │   ├── services/       # API client
│   │   └── App.jsx         # React Router setup
│   ├── package.json
│   └── vite.config.js
└── test_conflicts.py       # Test script for conflict detection feature
```

## 🚀 Setup and Run Instructions

### Prerequisites

- Python 3.9+
- Node.js 16+ and npm
- Supabase account (free tier works fine)

## Backend Setup

### Prerequisites

- Python 3.9+
- Supabase account (free tier works)

### Step 1: Supabase Setup

1. Create a new project at [https://supabase.com](https://supabase.com)
2. Go to **Settings → API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` key (keep this secret!)
3. Go to **SQL Editor** and run the migration file: `backend/migrations/001_initial_schema.sql`
4. Verify tables are created: `users`, `rules`, `commands`, `audit_logs`

### Step 2: Backend Installation

```powershell
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env

# Edit .env and add your Supabase credentials
notepad .env
```

### Step 3: Configure Environment

Edit `.env` file:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 4: Run Backend

```powershell
# Make sure virtual environment is activated
cd backend
python -m uvicorn main:app --reload
```

Backend will be available at: **http://localhost:8000**

API Documentation (Swagger): **http://localhost:8000/docs**

---

## Frontend Setup

### Step 1: Install Dependencies

```powershell
cd frontend
npm install
```

### Step 2: Run Frontend

```powershell
npm run dev
```

Frontend will be available at: **http://localhost:3000**

### Step 3: Login

Use the default admin credentials:

- **API Key**: `cgw_admin_default_key_change_in_production`

---

## 🎯 Quick Start Guide

1. **Start Backend**: `cd backend && python -m uvicorn main:app --reload`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Open Browser**: Navigate to `http://localhost:3000`
4. **Login**: Use admin API key `cgw_admin_default_key_change_in_production`
5. **Explore**:
   - Submit commands in Dashboard
   - Manage users and rules in Admin Panel
   - View audit logs for all operations

## 📚 API Documentation

### Authentication

- `GET /api/auth/validate` - Validate API key and get user info

### Users (Admin Only)

- `POST /api/users` - Create new user with API key
- `GET /api/users` - List all users
- `GET /api/users/me` - Get current user info
- `PUT /api/users/{id}/credits` - Update user credits

### Commands

- `POST /api/commands` - Submit command for validation and execution
- `GET /api/commands/history` - Get user's command history

### Rules (Admin Only)

- `POST /api/rules` - Create new validation rule (with conflict detection)
- `GET /api/rules` - List all rules
- `DELETE /api/rules/{id}` - Delete rule
- `POST /api/rules/validate` - Validate regex pattern
- `POST /api/rules/check-conflicts` - Check for conflicts with existing rules ⭐
- `POST /api/rules/test-pattern` - Test pattern against custom commands ⭐

### Audit (Admin Only)

- `GET /api/audit` - Get comprehensive audit logs

## Default Credentials

After running the migration, a default admin user is created:

- **API Key**: `cgw_admin_default_key_change_in_production`
- **Role**: admin
- **Credits**: 100

⚠️ **IMPORTANT**: Change this API key in production!

## Default Rules

The system comes pre-configured with 5 rules:

1. **Block fork-bomb** - `:(){ :|:& };:` → AUTO_REJECT
2. **Block root deletion** - `rm\s+-rf\s+/` → AUTO_REJECT
3. **Block filesystem format** - `mkfs.` → AUTO_REJECT
4. **Allow safe git** - `git\s+(status|log|diff)` → AUTO_ACCEPT
5. **Allow basic commands** - `^(ls|cat|pwd|echo)` → AUTO_ACCEPT

## Command Processing Flow

1. User submits command with API key
2. System authenticates user
3. Check if user has credits (reject if 0)
4. Match command against rules (ordered by priority)
5. If `AUTO_REJECT`: reject and log
6. If `AUTO_ACCEPT`:
   - Deduct 1 credit
   - Mock execute command
   - Store in history
   - Log to audit trail
7. Return result to user

## 🧪 API Usage Examples

### Using cURL (PowerShell)

**1. Validate API Key:**

```powershell
curl -X GET "http://localhost:8000/api/auth/validate" `
  -H "x-api-key: cgw_admin_default_key_change_in_production"
```

**2. Submit Command:**

```powershell
curl -X POST "http://localhost:8000/api/commands" `
  -H "Content-Type: application/json" `
  -H "x-api-key: cgw_admin_default_key_change_in_production" `
  -d '{"command_text": "ls -la"}'
```

**3. Check Rule Conflicts (Bonus Feature):**

```powershell
curl -X POST "http://localhost:8000/api/rules/check-conflicts" `
  -H "Content-Type: application/json" `
  -H "x-api-key: cgw_admin_default_key_change_in_production" `
  -d '{"pattern": "^ls"}'
```

**4. Create Rule with Force Override:**

```powershell
curl -X POST "http://localhost:8000/api/rules?force=true" `
  -H "Content-Type: application/json" `
  -H "x-api-key: cgw_admin_default_key_change_in_production" `
  -d '{"pattern": "^docker", "action": "AUTO_ACCEPT", "priority": 50, "description": "Allow docker commands"}'
```

**5. Get Command History:**

```powershell
curl -X GET "http://localhost:8000/api/commands/history" `
  -H "x-api-key: cgw_admin_default_key_change_in_production"
```

**6. Create User (Admin Only):**

```powershell
curl -X POST "http://localhost:8000/api/users" `
  -H "Content-Type: application/json" `
  -H "x-api-key: cgw_admin_default_key_change_in_production" `
  -d '{"name": "Test User", "role": "member", "credits": 10}'
```

### Using Swagger UI (Interactive)

1. Navigate to **http://localhost:8000/docs**
2. Click **"Authorize"** button
3. Enter API key: `cgw_admin_default_key_change_in_production`
4. Click **"Authorize"**
5. Test any endpoint interactively with live responses

### Using Test Script

We provide a comprehensive test script for the conflict detection feature:

```powershell
# Make sure backend is running
cd c:\unbound_hack
python test_conflicts.py
```

This will test:

- ✅ Conflict detection with existing rules
- ✅ Non-conflicting pattern validation
- ✅ Automatic conflict prevention (409 error)
- ✅ Force override functionality

## 🎨 Frontend Features

The React frontend includes:

### For All Users

- **Login Page**: Secure API key authentication
- **Dashboard**:
  - View current credits
  - Submit commands with real-time validation
  - View command history with status
  - Auto-refresh on submission

### For Admins Only

- **Admin Panel** with three tabs:
  1. **Users**: Create users, manage credits, view all users
  2. **Rules**:
     - Create validation rules
     - Test regex patterns
     - **Check for conflicts** before creating ⭐
     - Visual conflict warnings with details
     - Force-create option for intentional overlaps
     - Delete rules
  3. **Audit Logs**: Complete audit trail of all operations

### UI Highlights

- Clean, modern design with responsive layout
- Real-time validation feedback
- Color-coded status indicators
- Protected routes based on user role
- Persistent authentication state

## Security Features

- ✅ No real shell execution (all commands are mocked)
- ✅ API key authentication
- ✅ Role-based access control
- ✅ Regex validation for rules
- ✅ First-match rule engine prevents conflicts
- ✅ Atomic operations with rollback
- ✅ Complete audit trail

## Troubleshooting

### Import errors

Make sure virtual environment is activated and dependencies are installed:

```powershell
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Database connection issues

- Verify Supabase credentials in `.env`
- Check if Supabase project is active
- Ensure migration was run successfully

### CORS errors

CORS is configured to allow all origins in development. Update `main.py` for production.

## 🎁 Bonus Feature: Rule Conflict Detection

### What It Does

Prevents admins from accidentally creating overlapping regex rules that could cause confusion or unintended behavior.

### How It Works

1. **Pattern Analysis**: Tests new pattern against 15 default commands
2. **Conflict Detection**: Identifies existing rules that match the same commands
3. **Detailed Report**: Shows:
   - Which rules conflict
   - Which commands overlap
   - Pattern details (priority, action)
4. **Smart Prevention**: Returns 409 error if conflicts exist
5. **Override Option**: Force-create with `?force=true` when intentional

### Example Usage

**Check conflicts before creating:**

```powershell
curl -X POST "http://localhost:8000/api/rules/check-conflicts" `
  -H "Content-Type: application/json" `
  -H "x-api-key: cgw_admin_default_key_change_in_production" `
  -d '{"pattern": "^ls"}'
```

**Response:**

```json
{
  "has_conflicts": true,
  "conflicts": [
    {
      "rule_id": 5,
      "pattern": "^(ls|cat|pwd|echo)",
      "action": "AUTO_ACCEPT",
      "priority": 20,
      "overlapping_commands": ["ls -la"]
    }
  ],
  "total_conflicts": 1,
  "total_overlapping_commands": 1
}
```

### Frontend Integration

In the Admin Panel → Rules tab:

1. Enter a regex pattern
2. Click **"Check Conflicts"** button
3. See visual warning with conflict details
4. Check **"I understand and want to create anyway"** to proceed
5. System prevents accidental overlaps

### Test Commands Used

The system tests against 15 realistic commands:

- `ls -la`, `cat /etc/passwd`, `pwd`, `echo hello`
- `git status`, `git log`, `git diff`
- `rm -rf /`, `rm file.txt`
- `mkfs.ext4 /dev/sda` (dangerous formatting)
- `:(){ :|:& };:` (fork bomb)
- `docker run nginx`, `npm install`
- `sudo su`, `chmod 777 file`

## 🔧 Development

### Adding Custom Test Commands

Edit `backend/app/services/rule_service.py`:

```python
TEST_COMMANDS = [
    "your custom command",
    # ... more commands
]
```

### Monitoring System Health

**Check Audit Logs:**

```powershell
curl -X GET "http://localhost:8000/api/audit" `
  -H "x-api-key: cgw_admin_default_key_change_in_production"
```

**View All Users:**

```powershell
curl -X GET "http://localhost:8000/api/users" `
  -H "x-api-key: cgw_admin_default_key_change_in_production"
```

## 📝 License

MIT License

## 💬 Support

For issues or questions, please open an issue on the [GitHub repository](https://github.com/saran2006psg/unbound_hackathon).

---

**Built with ❤️ for the Unbound Hackathon**
