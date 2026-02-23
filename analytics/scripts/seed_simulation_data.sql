-- ============================================================
-- GHOSTJOB DECK SIMULATOR: Probabilistic Data Seeding
-- Generates 1,000+ data points for Pitch Deck Analytics
-- ============================================================

-- 1. Setup Companies
INSERT INTO companies (name, normalized_name, industry, hiring_integrity_score, hiring_integrity_grade)
VALUES 
('Stripe', 'stripe', 'Fintech', 94.2, 'A'),
('Vercel', 'vercel', 'Developer Tools', 89.1, 'B'),
('Meta', 'meta', 'Social Media', 32.5, 'D'),
('Google', 'google', 'Big Tech', 68.4, 'C'),
('Twitter', 'twitter', 'Social Media', 12.8, 'F'),
('Netflix', 'netflix', 'Entertainment', 72.1, 'B'),
('Amazon', 'amazon', 'E-commerce', 45.3, 'C'),
('Apple', 'apple', 'Hardware', 81.5, 'B'),
('Uber', 'uber', 'Logistics', 55.0, 'C'),
('Airbnb', 'airbnb', 'Hospitality', 88.0, 'B')
ON CONFLICT (normalized_name) DO UPDATE SET industry = EXCLUDED.industry;

-- 2. Seed random applications with Probabilistic Outcomes
DO $simulation$
DECLARE
    comp_id UUID;
    job_id UUID;
    i INTEGER;
    g_score DECIMAL;
    has_responded BOOLEAN;
BEGIN
    -- Ensure schema is ready
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='applications' AND column_name='days_to_response') THEN
        ALTER TABLE applications ADD COLUMN days_to_response INTEGER;
    END IF;

    FOR i IN 1..1000 LOOP
        -- Pick a random company
        SELECT id INTO comp_id FROM companies ORDER BY RANDOM() LIMIT 1;
        
        -- Generate a Ghost Score (Uniform 0-100)
        g_score := RANDOM() * 100;
        
        -- Create a Job
        INSERT INTO jobs (company_id, job_title, job_description, ghost_score, ghost_verdict, created_at)
        VALUES (
            comp_id, 
            'Software Engineer ' || i, 
            'Description for simulation ' || i, 
            g_score,
            CASE 
                WHEN g_score < 30 THEN 'legit'
                WHEN g_score < 60 THEN 'sus'
                ELSE 'certified_ghost'
            END,
            NOW() - (RANDOM() * INTERVAL '90 days')
        ) RETURNING id INTO job_id;
        
        -- Determine outcome probability
        -- If g_score 0 -> 90% response
        -- If g_score 100 -> 5% response
        IF RANDOM() < (0.9 - (g_score / 100.0 * 0.85)) THEN
            has_responded := TRUE;
        ELSE
            has_responded := FALSE;
        END IF;
        
        -- Insert Application
        INSERT INTO applications (
            job_id, 
            user_id, 
            job_description,
            applied_at, 
            received_response, 
            response_received_at, 
            outcome_status,
            days_to_response
        ) VALUES (
            job_id,
            NULL, 
            'Simulated JD ' || i,
            NOW() - (RANDOM() * INTERVAL '90 days'),
            has_responded,
            CASE WHEN has_responded THEN NOW() - (RANDOM() * INTERVAL '5 days') ELSE NULL END,
            CASE 
                WHEN has_responded THEN (ARRAY['responded', 'offer', 'interviewing'])[FLOOR(RANDOM()*3)+1]
                ELSE (ARRAY['ghosted', 'rejected'])[FLOOR(RANDOM()*2)+1]
            END,
            CASE WHEN has_responded THEN (RANDOM() * 14)::INT ELSE NULL END
        );
    END LOOP;
END $simulation$;
