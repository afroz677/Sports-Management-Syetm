
-- Create coaches table
CREATE TABLE public.coaches (
  coach_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  experience INTEGER NOT NULL DEFAULT 0,
  contact_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create teams table
CREATE TABLE public.teams (
  team_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_name TEXT NOT NULL,
  sport_type TEXT NOT NULL,
  coach_id UUID REFERENCES public.coaches(coach_id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create players table
CREATE TABLE public.players (
  player_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0 AND age < 100),
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  contact_number TEXT NOT NULL,
  medical_history TEXT DEFAULT '',
  skill_level TEXT NOT NULL CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced', 'Professional')),
  eligibility_status TEXT NOT NULL DEFAULT 'Eligible' CHECK (eligibility_status IN ('Eligible', 'Ineligible', 'Under Review')),
  team_id UUID REFERENCES public.teams(team_id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create venues table
CREATE TABLE public.venues (
  venue_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_name TEXT NOT NULL,
  location TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  availability_status TEXT NOT NULL DEFAULT 'Available' CHECK (availability_status IN ('Available', 'Occupied', 'Under Maintenance')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create schedules table
CREATE TABLE public.schedules (
  schedule_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(team_id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES public.coaches(coach_id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES public.venues(venue_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'Training' CHECK (event_type IN ('Training', 'Match', 'Practice')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attendance table
CREATE TABLE public.attendance (
  attendance_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.players(player_id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(team_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Present', 'Absent')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create injuries table
CREATE TABLE public.injuries (
  injury_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.players(player_id) ON DELETE CASCADE,
  injury_type TEXT NOT NULL,
  injury_date DATE NOT NULL,
  recovery_status TEXT NOT NULL DEFAULT 'Under Treatment' CHECK (recovery_status IN ('Under Treatment', 'Recovered', 'Chronic')),
  return_to_play_approval BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create finance table
CREATE TABLE public.finance (
  finance_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.players(player_id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  payment_date DATE NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Completed', 'Failed', 'Refunded')),
  invoice_number TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.injuries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance ENABLE ROW LEVEL SECURITY;

-- Public access policies for demo
CREATE POLICY "Allow all access to coaches" ON public.coaches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to teams" ON public.teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to players" ON public.players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to venues" ON public.venues FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to schedules" ON public.schedules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to attendance" ON public.attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to injuries" ON public.injuries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to finance" ON public.finance FOR ALL USING (true) WITH CHECK (true);
