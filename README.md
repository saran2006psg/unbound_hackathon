# Command Gateway System

A full-stack application for managing command submissions with rule-based validation, credit system, and role-based access control.

## Features

- **API Key Authentication**: Secure access using API keys
- **Role-Based Access Control**: Admin and Member roles
- **Credit System**: Credits deducted for executed commands
- **Rule-Based Command Validation**: Configurable regex rules with priority-based matching
- **Mock Command Execution**: Safe command simulation without actual shell execution
- **Audit Trail**: Complete logging of all operations
- **Atomic Operations**: Rollback on failures

## Tech Stack

- **Backend**: Python FastAPI
- **Database**: Supabase (PostgreSQL)
- **Frontend**: React

## Project Structure

```
unbound_hack/
├── backend/
│   ├── app/
│   │   ├── models/          # Pydantic models
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Authentication
│   │   ├── config.py        # Configuration
│   │   └── database.py      # Supabase client
│   ├── migrations/          # Database schemas
│   ├── main.py             # FastAPI app
│   └── requirements.txt    # Python dependencies
└── frontend/               # React app (to be created)
```

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
python main.py
```

Backend will be available at: **http://localhost:8000**

API Documentation: **http://localhost:8000/docs**

## API Endpoints

### Authentication

- `GET /api/auth/validate` - Validate API key

### Users

- `POST /api/users` - Create user (admin)
- `GET /api/users` - List all users (admin)
- `GET /api/users/me` - Get current user info
- `PUT /api/users/{id}/credits` - Update user credits (admin)

### Commands

- `POST /api/commands` - Submit command
- `GET /api/commands/history` - Get command history

### Rules

- `POST /api/rules` - Create rule (admin)
- `GET /api/rules` - List all rules (admin)
- `DELETE /api/rules/{id}` - Delete rule (admin)
- `POST /api/rules/validate` - Validate regex (admin)

### Audit

- `GET /api/audit` - Get audit logs (admin)

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

## Testing the Backend

### Using cURL

**Validate API Key:**

```powershell
curl -X GET "http://localhost:8000/api/auth/validate" `
  -H "x-api-key: cgw_admin_default_key_change_in_production"
```

**Submit Command:**

```powershell
curl -X POST "http://localhost:8000/api/commands" `
  -H "Content-Type: application/json" `
  -H "x-api-key: cgw_admin_default_key_change_in_production" `
  -d '{"command_text": "ls -la"}'
```

**Get Command History:**

```powershell
curl -X GET "http://localhost:8000/api/commands/history" `
  -H "x-api-key: cgw_admin_default_key_change_in_production"
```

**Create User (Admin):**

```powershell
curl -X POST "http://localhost:8000/api/users" `
  -H "Content-Type: application/json" `
  -H "x-api-key: cgw_admin_default_key_change_in_production" `
  -d '{"name": "Test User", "role": "member", "credits": 5}'
```

**Get All Rules:**

```powershell
curl -X GET "http://localhost:8000/api/rules" `
  -H "x-api-key: cgw_admin_default_key_change_in_production"
```

### Using API Docs (Swagger UI)

1. Navigate to http://localhost:8000/docs
2. Click "Authorize" button
3. Enter your API key in the `x-api-key` field
4. Click "Authorize"
5. Test any endpoint interactively

## Frontend Setup (Coming Next)

The React frontend will be created in the `frontend/` directory with:

- Login page with API key input
- Member dashboard (credits, submit commands, history)
- Admin dashboard (user management, rules, audit logs)

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

## Development

### Adding New Rules

```python
# Via API (admin only)
POST /api/rules
{
  "pattern": "^docker\\s+run",
  "action": "AUTO_ACCEPT",
  "priority": 15,
  "description": "Allow docker run commands"
}
```

### Monitoring Audit Logs

```powershell
curl -X GET "http://localhost:8000/api/audit" `
  -H "x-api-key: cgw_admin_default_key_change_in_production"
```

## License

MIT License

## Support

For issues or questions, please open an issue on GitHub.
