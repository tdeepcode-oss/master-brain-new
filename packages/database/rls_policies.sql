-- Enable Row Level Security
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Task" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Note" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Area" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Resource" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Course" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Flashcard" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tag" ENABLE ROW LEVEL SECURITY;

-- User Policies
CREATE POLICY "Users can only access their own profile" ON "User"
    USING (auth.uid()::text = id);

-- Task Policies
CREATE POLICY "Users can CRUD their own tasks" ON "Task"
    USING (auth.uid()::text = "userId");

-- Note Policies
CREATE POLICY "Users can CRUD their own notes" ON "Note"
    USING (auth.uid()::text = "userId");

-- Project Policies
CREATE POLICY "Users can CRUD their own projects" ON "Project"
    USING (auth.uid()::text = "userId");

-- Area Policies
CREATE POLICY "Users can CRUD their own areas" ON "Area"
    USING (auth.uid()::text = "userId");

-- Resource Policies
CREATE POLICY "Users can CRUD their own resources" ON "Resource"
    USING (auth.uid()::text = "userId");

-- Course Policies
-- Assumption: Courses are private. If public, we need a separate policy.
CREATE POLICY "Users can CRUD their own courses" ON "Course"
    USING (auth.uid()::text = "userId");

-- Flashcard Policies
CREATE POLICY "Users can CRUD their own flashcards" ON "Flashcard"
    USING (auth.uid()::text = "userId");

-- Tag Policies
CREATE POLICY "Users can CRUD their own tags" ON "Tag"
    USING (auth.uid()::text = "userId");

-- Allow Service Role to full access (Implicit in Supabase but good to know)
-- Supabase Service Role bypasses RLS by default.
