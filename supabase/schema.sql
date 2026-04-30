-- Drop existing triggers and functions to allow re-running
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop existing tables to allow re-running (CASCADE handles dependencies)
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing types to allow re-running
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;

-- Custom Types (ENUMs)
CREATE TYPE user_role AS ENUM ('ADMIN', 'MEMBER');
CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'MEMBER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projects Table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Foreign Key Relationship
    CONSTRAINT fk_projects_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Project Members Table
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    project_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Foreign Key Relationships
    CONSTRAINT fk_pm_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_pm_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    
    -- A user can only be added to a specific project once
    CONSTRAINT unique_project_member UNIQUE (user_id, project_id)
);

-- Tasks Table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status task_status NOT NULL DEFAULT 'TODO',
    due_date TIMESTAMPTZ,
    project_id UUID NOT NULL,
    assigned_to UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Foreign Key Relationships
    CONSTRAINT fk_tasks_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_tasks_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- Performance Indexes 
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);

-- Sync user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'Unknown User'),
    new.email,
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'MEMBER'::public.user_role)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if current user is a project member (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_project_member(check_project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.project_members 
    WHERE project_id = check_project_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if current user is the project creator (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_project_admin(check_project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.projects 
    WHERE id = check_project_id AND created_by = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================
-- Users Policies
-- ==========================
CREATE POLICY "Users can read all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update themselves" ON users FOR UPDATE USING (id = auth.uid());

-- ==========================
-- Projects Policies
-- ==========================
-- Users can only see their projects (created by them OR they are members)
CREATE POLICY "Users can view their projects" ON projects FOR SELECT USING (
  created_by = auth.uid() OR public.is_project_member(id)
);

-- Admin can manage their own projects
CREATE POLICY "Admins can insert projects" ON projects FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update their own projects" ON projects FOR UPDATE USING (public.is_admin() AND created_by = auth.uid());
CREATE POLICY "Admins can delete their own projects" ON projects FOR DELETE USING (public.is_admin() AND created_by = auth.uid());

-- ==========================
-- Project Members Policies
-- ==========================
CREATE POLICY "Users can view members of their projects" ON project_members FOR SELECT USING (
  public.is_project_admin(project_id) OR public.is_project_member(project_id)
);

CREATE POLICY "Admins can manage project members for their projects" ON project_members FOR ALL USING (
  public.is_admin() AND public.is_project_admin(project_id)
);

-- ==========================
-- Tasks Policies
-- ==========================
-- Members can only see tasks assigned to them, Admins see tasks in their projects
CREATE POLICY "Users can view tasks" ON tasks FOR SELECT USING (
  assigned_to = auth.uid() OR 
  (public.is_admin() AND public.is_project_admin(project_id))
);

-- Admins can manage tasks in their projects
CREATE POLICY "Admins can manage tasks in their projects" ON tasks FOR ALL USING (
  public.is_admin() AND public.is_project_admin(project_id)
);

-- Members can update their assigned tasks
CREATE POLICY "Members can update their assigned tasks" ON tasks FOR UPDATE USING (
  assigned_to = auth.uid()
);
