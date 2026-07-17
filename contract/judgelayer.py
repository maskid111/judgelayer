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
        github_url: str,
        demo_url: str,
    ) -> str:


        def verify_project():

            github_text = gl.nondet.web.render(
                github_url,
                mode="text",
            )

            demo_text = gl.nondet.web.render(
                demo_url,
                mode="text",
            )


            github_text = github_text[:6000]
            demo_text = demo_text[:6000]


            prompt = f"""
You are verifying a hackathon project.

The GitHub repository and live demo are the source of truth.

Project Name:

{project_name}


GitHub Repository:

{github_text}


Live Demo:

{demo_text}


Hackathon Context:

{hackathon_context}


Return ONLY valid JSON.

Format:

{{
 "github_verified": true,
 "demo_verified": true,
 "has_documentation": true,
 "has_source_code": true,
 "has_smart_contracts": true,
 "uses_required_technology": true,
 "implementation_evidence": true
}}


Rules:

github_verified:
true if repository content loaded successfully.

demo_verified:
true if demo content loaded successfully.

has_documentation:
true if README or useful documentation exists.

has_source_code:
true if actual source code exists.

has_smart_contracts:
true if blockchain contracts or onchain logic exists.

uses_required_technology:
true only if the project matches hackathon requirements.

implementation_evidence:
true only if there is evidence the project was actually built.

Return JSON only.
"""


            result = gl.nondet.exec_prompt(prompt)

            result = (
                result
                .replace("```json", "")
                .replace("```", "")
                .strip()
            )

            return json.loads(result)



        verified = gl.eq_principle.strict_eq(
            verify_project
        )


        judging_prompt = f"""

You are an expert hackathon judge.

Evaluate this project.

Important:

The project has already been verified by GenLayer.

The verification evidence is:

{json.dumps(verified)}


Use the verified evidence as the source of truth.

User description:

{project_description}


Hackathon Context:

{hackathon_context}


Project Name:

{project_name}


Return ONLY valid JSON.

Format:

{{
 "innovation_score": 0,
 "technical_depth": 0,
 "ui_ux": 0,
 "hackathon_fit": 0,
 "finalist_probability": 0,

 "strengths": [
   "strength 1",
   "strength 2",
   "strength 3"
 ],

 "weaknesses": [
   "weakness 1",
   "weakness 2",
   "weakness 3"
 ],

 "feedback": "Detailed judging feedback."
}}


Rules:

Scores must be between 0 and 100.

Innovation:
Judge originality, problem choice, and uniqueness.

Technical depth:
Judge architecture, implementation complexity, engineering quality.

UI/UX:
Judge usability, interface quality, and product experience.

Hackathon fit:
Judge only against the supplied hackathon context.

Finalist probability:
Estimate how competitive the project is.

Do not reward claims unsupported by verification evidence.

Return JSON only.
"""


        task = """
Judge the verified hackathon project.
Return only valid JSON.
"""


        criteria = """
The response must contain:

innovation_score
technical_depth
ui_ux
hackathon_fit
finalist_probability
strengths
weaknesses
feedback

All scores must be numbers between 0 and 100.
"""


        judged_result = gl.eq_principle.prompt_non_comparative(
            lambda: judging_prompt,
            task=task,
            criteria=criteria,
        )


        judged_result = (
            judged_result
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )


        scores = json.loads(judged_result)


        final_result = {
            "innovation_score": scores["innovation_score"],
            "technical_depth": scores["technical_depth"],
            "ui_ux": scores["ui_ux"],
            "hackathon_fit": scores["hackathon_fit"],
            "finalist_probability": scores["finalist_probability"],
            "strengths": scores["strengths"],
            "weaknesses": scores["weaknesses"],
            "feedback": scores["feedback"],
            "verification": verified
        }


        result_string = json.dumps(final_result)

        self.latest_result = result_string

        return result_string