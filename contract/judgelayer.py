# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

import json


class JudgeLayer(gl.Contract):

    latest_result: str

    def __init__(self):
        self.latest_result = ""

    @gl.public.view
    def get_latest_result(self) -> str:
        return self.latest_result

    @gl.public.write
    def evaluate_submission(
        self,
        hackathon_context: str,
        project_name: str,
        project_description: str,
    ) -> str:

        prompt = f"""
Evaluate this hackathon project against the provided hackathon context.

Return ONLY valid JSON.

Format:
{{
  "innovation_score": number,
  "technical_depth": number,
  "ui_ux": number,
  "hackathon_fit": number,
  "finalist_probability": number,
  "strengths": ["..."],
  "weaknesses": ["..."],
  "feedback": "..."
}}

Scoring rules:
- All score fields must be numbers from 0 to 100.
- finalist_probability must be a number from 0 to 100.
- hackathon_fit means how well the project fits the pasted hackathon context, rules, themes, prize tracks, judging criteria, and requirements.
- Do not score based on GenLayer usage unless the hackathon context explicitly mentions GenLayer as a requirement, sponsor track, or judging priority.
- strengths must contain 3 to 5 useful points.
- weaknesses must contain 3 to 5 useful points.
- feedback must be clear, practical, and specific.
- Respond ONLY with valid JSON.
- Do not include markdown.
- Do not include ```json.
- Do not include any explanation outside the JSON.

Hackathon Context:
{hackathon_context}

Project Name:
{project_name}

Project Description:
{project_description}
"""

        task = """
Evaluate the submitted hackathon project against the hackathon context.
Return only a valid JSON object using the required fields.
"""

        criteria = """
The response must be valid JSON.
It must include innovation_score, technical_depth, ui_ux, hackathon_fit,
finalist_probability, strengths, weaknesses, and feedback.
All numeric scores must be between 0 and 100.
The evaluation must be relevant to the hackathon context and project description.
The project must not be penalized for not using GenLayer unless the hackathon
context explicitly requires or rewards GenLayer usage.
"""

        final_result = gl.eq_principle.prompt_non_comparative(
            lambda: prompt,
            task=task,
            criteria=criteria,
        )

        clean_result = (
            final_result
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

        parsed = json.loads(clean_result)
        result_str = json.dumps(parsed)

        self.latest_result = result_str

        return result_str