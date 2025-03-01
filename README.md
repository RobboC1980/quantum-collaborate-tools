# Quantum Collaborate Tools

A collaborative application with AI integration using Qwen API.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your Qwen API key:
   ```
   VITE_QWEN_API_KEY=your-qwen-api-key
   ```

### Starting the Application

#### Option 1: Using the Batch Script (Windows CMD)

```
.\start-app.bat
```

#### Option 2: Using the PowerShell Script (Windows PowerShell)

```
.\start-app.ps1
```

#### Option 3: Using npm directly

```
npm run start
```

This will start both:
- The API proxy server on port 3001
- The Vite development server on port 3000

### Troubleshooting

If you encounter port conflicts, the startup scripts will attempt to terminate processes using the required ports (3000, 3001, 3002, 3003, 3004).

If you still encounter issues:
1. Manually check for processes using the required ports:
   ```
   netstat -ano | findstr :3000
   netstat -ano | findstr :3001
   ```

2. Terminate the processes manually:
   ```
   taskkill /F /PID <process_id>
   ```

## Features

- React frontend with Shadcn UI components
- Integration with Qwen AI API
- API proxy server for secure communication

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/252f2218-f917-4d48-b384-10b8da7883ff

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/252f2218-f917-4d48-b384-10b8da7883ff) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/252f2218-f917-4d48-b384-10b8da7883ff) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)

# QuantumScribe - Project Management Application

## Role-Based Access Control (RBAC) Implementation

The application implements a complete role-based access control system that seamlessly integrates with Supabase for authentication and database access.

### Backend Components

1. **Database Tables**
   - `roles`: Stores role definitions with name, description, and system/default flags
   - `permissions`: Stores available permissions with category and action
   - `role_permissions`: Junction table connecting roles to their permissions
   - `user_roles`: Junction table assigning roles to users

2. **API Endpoints**
   - `roles-api`: Supabase Edge Function that handles role management operations
     - GET /roles - List all roles with their permissions
     - GET /roles/:id - Get a specific role by ID
     - POST /roles - Create a new role
     - PUT /roles/:id - Update an existing role
     - DELETE /roles/:id - Delete a role
     - GET /permissions - List all available permissions
     - POST /user-roles - Assign a role to a user
     - DELETE /user-roles - Remove a role from a user
     - GET /user-roles - Get roles assigned to a user

3. **Authorization Middleware**
   - `auth-middleware`: Supabase Edge Function that verifies user permissions
     - Validates user JWT tokens
     - Checks if users have required permissions
     - Supports wildcard permissions and category:action format

### Frontend Components

1. **Service Layer**
   - `roleService.ts`: API client for interacting with the role management endpoints
     - Handles authentication token management
     - Transforms data between API and UI formats
     - Provides error handling and status messaging

2. **React Hooks**
   - `useRoles`: Custom hook for role management functionality
     - Fetches and caches roles and permissions
     - Provides methods for CRUD operations on roles
     - Handles state management and UI feedback
   - `useAuth`: Extended to include permission checking functionality
     - Manages authentication state
     - Provides `hasPermission` method to check user permissions

3. **UI Components**
   - `RolesManagement`: Main component for managing roles and permissions
   - `RolesList`: Displays available roles in the system
   - `RoleDetails`: Shows detailed information about a specific role
   - `RoleForm`: Form for creating and editing roles
   - `UserRoleAssignment`: Interface for assigning roles to users
   - `PermissionGuard`: Component for conditionally rendering UI based on permissions
   - `AnyPermissionGuard`: Component for checking multiple permissions

### Security Features

1. **Row Level Security (RLS)**
   - Database tables are protected with RLS policies
   - Users can only access data they are authorized to see

2. **JWT Validation**
   - All API requests validate JWT tokens
   - Permissions are checked against the user's assigned roles

3. **Fine-Grained Permissions**
   - Permissions follow the format `category:action`
   - Support for wildcard permissions (e.g., `projects:*`)
   - Hierarchical permission structure

## Usage Examples

### Protecting UI Elements

```tsx
<PermissionGuard permission="roles:manage">
  <Button>Manage Roles</Button>
</PermissionGuard>
```

### Checking Permissions in Code

```tsx
const { hasPermission } = useAuth();
const canEditProject = await hasPermission('projects:edit');
```

### Assigning Roles

```tsx
const { assignRoleToUser } = useRoles();
await assignRoleToUser({ userId: 'user-id', roleId: 'role-id' });
```

## Future Enhancements

1. Role inheritance for more complex permission hierarchies
2. Time-limited role assignments
3. Audit logging for permission changes
4. Dynamic permission generation based on system features
