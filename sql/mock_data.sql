-- Mock data for ArtOfWorkflows project proposals system

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS proposals (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    content TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS onboarding_data (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    form_data JSONB NOT NULL,
    file_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clear existing data (if needed)
-- TRUNCATE users, projects, proposals, onboarding_data CASCADE;

-- Insert mock users
INSERT INTO users (email, first_name, last_name, password_hash, is_admin)
VALUES 
    ('admin@example.com', 'Admin', 'User', '$2a$10$XQCJDUvI0YeAFzfBGUGTXO6RyBsAYfBKtKs7dZdXEeUOSq0Uw7VNO', TRUE),
    ('user@example.com', 'Regular', 'User', '$2a$10$XQCJDUvI0YeAFzfBGUGTXO6RyBsAYfBKtKs7dZdXEeUOSq0Uw7VNO', FALSE),
    ('demo@example.com', 'Demo', 'Account', '$2a$10$XQCJDUvI0YeAFzfBGUGTXO6RyBsAYfBKtKs7dZdXEeUOSq0Uw7VNO', FALSE);

-- Insert mock projects
INSERT INTO projects (name, description, user_id, status)
VALUES 
    ('CRM Integration Project', 'Automating data flow between our CRM system and marketing platforms.', 2, 'Active'),
    ('Customer Support Automation', 'Building automated workflows for customer support ticket routing and resolution.', 2, 'In Progress'),
    ('Data Synchronization Pipeline', 'Creating a real-time data synchronization system between our main database and analytics platform.', 3, 'Active'),
    ('Email Marketing Automation', 'Developing automated email sequences based on customer behavior and interactions.', 3, 'Completed'),
    ('Inventory Management System', 'Automating inventory tracking, reordering, and supplier communication processes.', 2, 'Planning');

-- Insert mock proposals
INSERT INTO proposals (project_id, content, version)
VALUES 
    (1, '# CRM Integration Proposal

## Project Overview
This proposal outlines the automation solution for integrating your CRM system with your marketing platforms.

## Current Challenges
- Manual data entry between systems
- Inconsistent customer data
- Delayed marketing responses
- High error rates in data transfer

## Recommended Solution
We recommend implementing a bi-directional API integration using:
- REST API connections
- Webhook triggers for real-time updates
- Data transformation layer
- Error handling and retry mechanisms

## Implementation Timeline
- Week 1-2: Requirements gathering and system analysis
- Week 3-4: Development of core integration components
- Week 5: Testing and validation
- Week 6: Deployment and training

## Expected Benefits
- 85% reduction in manual data entry
- Near real-time data synchronization
- Improved data accuracy
- Enhanced marketing response times

## Cost Estimate
$8,000 - $12,000', 1),

    (2, '# Customer Support Automation Proposal

## Project Overview
This proposal outlines an automated workflow system for customer support ticket routing and resolution.

## Current Challenges
- Manual ticket assignment
- Inconsistent response times
- Lack of prioritization
- Limited visibility into support metrics

## Recommended Solution
We recommend implementing an intelligent ticket routing system using:
- ML-based ticket classification
- Automated routing rules
- SLA monitoring and alerts
- Integrated knowledge base suggestions

## Implementation Timeline
- Week 1: Requirements analysis and workflow mapping
- Week 2-3: Development of classification and routing engine
- Week 4: Integration with existing support systems
- Week 5: Testing and refinement
- Week 6: Deployment and staff training

## Expected Benefits
- 40% reduction in first response time
- 25% increase in first-contact resolution
- Improved customer satisfaction scores
- Better resource allocation

## Cost Estimate
$15,000 - $18,000', 1),

    (3, '# Data Synchronization Pipeline Proposal

## Project Overview
This proposal outlines a real-time data synchronization system between your main database and analytics platform.

## Current Challenges
- Delayed reporting data
- Manual export/import processes
- Data inconsistencies
- Limited real-time insights

## Recommended Solution
We recommend implementing a change data capture (CDC) based synchronization system using:
- Database triggers for change detection
- Message queue for reliable data transfer
- Transformation layer for analytics-ready data
- Monitoring and alerting system

## Implementation Timeline
- Week 1: System analysis and architecture design
- Week 2-3: Development of CDC components
- Week 4: Implementation of transformation logic
- Week 5: Testing and performance optimization
- Week 6: Deployment and monitoring setup

## Expected Benefits
- Near real-time data availability in analytics platform
- Elimination of manual data transfer processes
- Improved data consistency
- Enhanced decision-making capabilities

## Cost Estimate
$20,000 - $25,000', 1),

    (4, '# Email Marketing Automation Proposal

## Project Overview
This proposal outlines an automated email marketing system based on customer behavior and interactions.

## Current Challenges
- Manual email campaign creation
- Limited personalization
- Poor timing of communications
- Difficulty measuring effectiveness

## Recommended Solution
We recommend implementing a behavior-driven email automation system using:
- Event-based triggers
- Dynamic content personalization
- A/B testing framework
- Comprehensive analytics

## Implementation Timeline
- Week 1: Requirements gathering and customer journey mapping
- Week 2: Email template design and content strategy
- Week 3-4: Development of automation workflows
- Week 5: Integration with existing systems
- Week 6: Testing and optimization

## Expected Benefits
- 30% increase in email engagement rates
- 25% improvement in conversion rates
- Reduced marketing team workload
- Better customer experience through relevant communications

## Cost Estimate
$12,000 - $15,000', 2),

    (4, '# Email Marketing Automation Proposal - REVISED

## Project Overview
This revised proposal outlines an enhanced automated email marketing system based on customer behavior and interactions.

## Current Challenges
- Manual email campaign creation
- Limited personalization
- Poor timing of communications
- Difficulty measuring effectiveness
- Lack of integration with other marketing channels

## Recommended Solution
We recommend implementing a comprehensive behavior-driven email automation system using:
- Event-based triggers from multiple data sources
- AI-powered dynamic content personalization
- Advanced A/B testing framework with statistical analysis
- Comprehensive analytics dashboard
- Cross-channel coordination capabilities

## Implementation Timeline
- Week 1: Requirements gathering and customer journey mapping
- Week 2: Email template design and content strategy
- Week 3-4: Development of automation workflows
- Week 5: Integration with existing systems
- Week 6: Testing and optimization
- Week 7: Staff training and handover

## Expected Benefits
- 40% increase in email engagement rates
- 35% improvement in conversion rates
- Reduced marketing team workload
- Better customer experience through relevant communications
- Improved ROI on marketing spend

## Cost Estimate
$15,000 - $18,000', 2);

-- Insert mock onboarding data
INSERT INTO onboarding_data (project_id, form_data)
VALUES 
    (1, '{"fullName": "Regular User", "email": "user@example.com", "companyName": "Acme Corp", "industryType": "SaaS", "technicalBackground": "api_scripting", "automationGoal": "Integrate our CRM system with marketing platforms to eliminate manual data entry and ensure consistent customer data across systems.", "tools": {"crm": true, "marketing": true, "api": true}, "needsThirdPartyApi": "yes", "currentProcess": "Currently, our team manually exports data from the CRM and imports it into our marketing platforms daily. This is time-consuming and error-prone.", "painPoints": "Data inconsistency, delays in marketing campaigns, manual errors, and wasted staff time.", "desiredWorkflow": "When a new lead is added to the CRM, automatically create or update the contact in our marketing platforms. When marketing engagement happens, update the CRM record with this information.", "triggers": {"apiRequest": true, "eventBased": true}, "timeline": "short", "hasBudget": "yes", "needsPlatformRecommendation": "yes", "needsAI": "no", "hasDocumentation": "yes", "additionalInfo": "We need this integration to be scalable as we plan to add more marketing tools in the future."}'),
    
    (2, '{"fullName": "Regular User", "email": "user@example.com", "companyName": "Acme Corp", "industryType": "SaaS", "technicalBackground": "api_scripting", "automationGoal": "Create an automated system for routing customer support tickets to the appropriate team members based on content and priority.", "tools": {"crm": true, "productivity": true}, "needsThirdPartyApi": "yes", "currentProcess": "Support tickets are manually reviewed and assigned by a team lead, causing delays and inconsistent handling.", "painPoints": "Slow response times, inconsistent prioritization, and inefficient resource allocation.", "desiredWorkflow": "When a new support ticket comes in, analyze its content, assign a priority level, and route it to the appropriate team or individual based on expertise and workload.", "triggers": {"eventBased": true}, "timeline": "short", "hasBudget": "yes", "needsPlatformRecommendation": "yes", "needsAI": "yes", "hasDocumentation": "no", "additionalInfo": "We would like to incorporate some basic AI for ticket classification if possible."}'),
    
    (3, '{"fullName": "Demo Account", "email": "demo@example.com", "companyName": "Demo Industries", "industryType": "Finance", "technicalBackground": "developer", "automationGoal": "Create a real-time data synchronization system between our main operational database and our analytics platform.", "tools": {"database": true, "api": true}, "needsThirdPartyApi": "no", "currentProcess": "Data is exported nightly from the main database and imported into the analytics platform through a series of manual steps.", "painPoints": "Reporting data is always at least one day old, process occasionally fails requiring manual intervention, and some data transformations are inconsistent.", "desiredWorkflow": "When data changes in the main database, automatically detect the changes, transform as needed, and update the analytics platform in near real-time.", "triggers": {"scheduled": true, "eventBased": true}, "timeline": "short", "hasBudget": "yes", "needsPlatformRecommendation": "yes", "needsAI": "no", "hasDocumentation": "yes", "additionalInfo": "The solution needs to be highly reliable and handle large volumes of data changes efficiently."}'),
    
    (4, '{"fullName": "Demo Account", "email": "demo@example.com", "companyName": "Demo Industries", "industryType": "E-commerce", "technicalBackground": "some_automation", "automationGoal": "Develop automated email sequences based on customer behavior and interactions with our website and products.", "tools": {"marketing": true, "crm": true}, "needsThirdPartyApi": "yes", "currentProcess": "Marketing team manually creates and sends email campaigns on a fixed schedule, with limited segmentation.", "painPoints": "Low engagement rates, poor timing of communications, limited personalization, and high unsubscribe rates.", "desiredWorkflow": "When a customer performs specific actions (e.g., browses certain products, abandons cart, makes a purchase), automatically send relevant, personalized email communications at optimal times.", "triggers": {"userAction": true, "eventBased": true}, "timeline": "short", "hasBudget": "yes", "needsPlatformRecommendation": "yes", "needsAI": "yes", "hasDocumentation": "no", "additionalInfo": "We want to incorporate A/B testing capabilities to continuously improve our email effectiveness."}'),
    
    (5, '{"fullName": "Regular User", "email": "user@example.com", "companyName": "Acme Corp", "industryType": "Manufacturing", "technicalBackground": "some_automation", "automationGoal": "Automate our inventory management process including tracking, reordering, and supplier communication.", "tools": {"database": true, "api": true, "productivity": true}, "needsThirdPartyApi": "yes", "currentProcess": "Inventory levels are checked manually, purchase orders are created in a separate system, and suppliers are contacted via email or phone.", "painPoints": "Stockouts, excess inventory, delayed reordering, and time-consuming manual processes.", "desiredWorkflow": "When inventory levels reach reorder points, automatically generate purchase orders, send them to suppliers, and update inventory projections. Provide alerts for exceptions requiring human intervention.", "triggers": {"scheduled": true, "eventBased": true}, "timeline": "long", "hasBudget": "yes", "needsPlatformRecommendation": "yes", "needsAI": "no", "hasDocumentation": "yes", "additionalInfo": "We have multiple warehouses and hundreds of SKUs that need to be managed in this system."}');

-- You can add more mock data as needed

-- Sample queries to verify the data

-- Get all projects with their owners
-- SELECT p.id, p.name, p.description, p.status, u.email, u.first_name, u.last_name
-- FROM projects p
-- JOIN users u ON p.user_id = u.id;

-- Get all proposals for a specific project
-- SELECT p.id, p.name, pr.version, pr.content, pr.created_at
-- FROM projects p
-- JOIN proposals pr ON p.id = pr.project_id
-- WHERE p.id = 1
-- ORDER BY pr.version DESC;

-- Get onboarding data for a specific project
-- SELECT p.id, p.name, o.form_data
-- FROM projects p
-- JOIN onboarding_data o ON p.id = o.project_id
-- WHERE p.id = 1; 