CREATE TABLE onboarding_forms (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    form_data JSONB NOT NULL,  -- Store user responses as JSON
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add columns for file uploads and processing status
ALTER TABLE onboarding_forms ADD COLUMN file_path VARCHAR(255);
ALTER TABLE onboarding_forms ADD COLUMN processing_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE onboarding_forms ADD COLUMN extracted_data JSONB;

CREATE INDEX idx_onboarding_project_id ON onboarding_forms(project_id);
