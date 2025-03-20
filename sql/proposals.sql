CREATE TABLE proposals (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    version INTEGER DEFAULT 1 NOT NULL,  -- Track refinements
    content TEXT NOT NULL,  -- AI-generated proposal
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE proposals ALTER COLUMN version SET DEFAULT 1;
