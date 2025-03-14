import os
import json
from typing import Dict, Any, Optional
import requests
from app.core.config import settings

class AIService:
    def __init__(self):
        self.api_key = settings.GOOGLE_API_KEY
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY setting not configured")
        
        # Base URL for Google's Generative AI API
        self.gemini_api_url = "https://generativelanguage.googleapis.com/v1beta/models"
        self.model_name = "gemini-2.0-flash"
        
        # Initialize storage for project data
        self.project_data = {}
    
    def _generate_text(self, prompt: str) -> str:
        """Generate text using Google's Gemini API"""
        url = f"{self.gemini_api_url}/{self.model_name}:generateContent?key={self.api_key}"
        
        headers = {
            "Content-Type": "application/json"
        }
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }]
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()  # Raise exception for HTTP errors
            
            result = response.json()
            if "candidates" in result and len(result["candidates"]) > 0:
                return result["candidates"][0]["content"]["parts"][0]["text"]
            else:
                return "Error: No response generated"
        except Exception as e:
            print(f"Error calling Gemini API: {str(e)}")
            return f"Error generating text: {str(e)}"
    
    def extract_data_from_pdf(self, file_path: str) -> Dict[str, Any]:
        """Extract structured data from a PDF file"""
        # In a real implementation, you would extract text from the PDF
        # For now, we'll use mock data for the PDF content
        pdf_content = """
        Project Proposal Document
        
        Goals: Implement an automated document processing system
        Technical Requirements: Cloud-based solution with API integrations
        Timeline: Expected completion within 4 months
        Budget: Allocated budget of $25,000
        Tools: Need OCR capabilities and database integration
        """
        
        prompt = f"""
        Extract the following information from this document in JSON format:
        - project_goals
        - technical_requirements
        - timeline
        - budget_constraints
        - tools_and_integrations
        
        Document content:
        {pdf_content}
        
        Return ONLY valid JSON with these fields, nothing else.
        """
        
        try:
            result = self._generate_text(prompt)
            # Try to parse as JSON
            return json.loads(result)
        except json.JSONDecodeError:
            # If parsing fails, return mock data
            return {
                "project_goals": "Automated document processing system",
                "technical_requirements": "Cloud-based solution with API integrations",
                "timeline": "4 months",
                "budget_constraints": "$25,000",
                "tools_and_integrations": "OCR capabilities and database integration"
            }
    
    def index_project_data(self, project_id: int, data: Dict[str, Any]) -> None:
        """Store project data for later retrieval"""
        # Store the data in memory (in a real implementation, you would use a database)
        self.project_data[project_id] = data
    
    def generate_proposal(self, project_id: int, form_data: Dict[str, Any]) -> str:
        """Generate a project proposal based on form data using AI"""
        # Get any previously stored data for this project
        stored_data = self.project_data.get(project_id, {})
        
        # Combine with form data
        combined_data = {**stored_data, **form_data}
        
        # Create a prompt for the AI
        prompt = f"""
        Create a detailed project proposal based on the following requirements:
        
        Project Goals: {combined_data.get('project_goals', 'Custom automation solution')}
        Technical Requirements: {combined_data.get('technical_requirements', 'Web-based system with integrations')}
        Timeline: {combined_data.get('timeline', '2-3 months')}
        Budget: {combined_data.get('budget_constraints', '$10,000 - $15,000')}
        Tools and Integrations: {combined_data.get('tools_and_integrations', 'API integrations')}
        
        Format the proposal in Markdown with the following sections:
        1. Executive Summary
        2. Project Scope and Goals
        3. Technical Approach (including recommended tools, integration strategy, and data flow architecture)
        4. Implementation Plan (including timeline and milestones)
        5. Budget Estimate
        
        Make it professional and detailed.
        """
        
        # Generate the proposal using the AI
        ai_generated_proposal = self._generate_text(prompt)
        
        # Return the AI-generated proposal, or fall back to a template if the API call fails
        if ai_generated_proposal.startswith("Error"):
            # Fallback to template
            goals = combined_data.get("project_goals", "Custom automation solution")
            requirements = combined_data.get("technical_requirements", "Web-based system with integrations")
            timeline = combined_data.get("timeline", "2-3 months")
            budget = combined_data.get("budget_constraints", "$10,000 - $15,000")
            
            return f"""
# Project Proposal for {goals}

## Executive Summary
We propose to develop a custom automation solution that meets your specific needs and requirements.

## Project Scope and Goals
The project aims to deliver {goals} with the following key objectives:
- Streamline existing workflows
- Reduce manual processing time
- Improve accuracy and reliability

## Technical Approach
- **Recommended tools and platforms**: Based on your requirements for {requirements}, we recommend using a modern web framework with API integrations.
- **Integration strategy**: We will develop custom connectors to your existing systems.
- **Data flow architecture**: The system will use a secure, scalable architecture with proper data validation.

## Implementation Plan
- **Timeline**: {timeline}
- **Milestones**:
  1. Requirements gathering and analysis (2 weeks)
  2. Design and architecture (2 weeks)
  3. Development (4-6 weeks)
  4. Testing and quality assurance (2 weeks)
  5. Deployment and training (1 week)

## Budget Estimate
{budget} depending on final requirements and scope adjustments.

Please let us know if you would like any modifications to this proposal.
"""
        else:
            return ai_generated_proposal