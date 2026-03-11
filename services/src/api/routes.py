from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from src.controllers.resume_controller import (
    calculate_resume_score,
    extract_text_from_pdf
)
from src.controllers.explanation_controller import analyze_explanation_video

router = APIRouter()


# ── Resume scoring ──────────────────────────────────
@router.post("/resume/score", tags=["Resume Scoring"])
async def score_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    pdf_bytes = await file.read()
    resume_text = extract_text_from_pdf(pdf_bytes)

    if not resume_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Failed to extract text from PDF."
        )

    return calculate_resume_score(resume_text, job_description)


# ── Explanation video analysis ──────────────────────
class ExplanationRequest(BaseModel):
    candidate_id: str
    job_id: str
    video_url: str | None = None


@router.post("/explanation/analyze", tags=["Explanation Analysis"])
async def analyze_explanation(payload: ExplanationRequest):
    result = analyze_explanation_video(
        video_url=payload.video_url,
        candidate_id=payload.candidate_id,
        job_id=payload.job_id,
    )
    return result
