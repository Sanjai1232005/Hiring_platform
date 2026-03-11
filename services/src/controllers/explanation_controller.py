import random


# -------------- Simulated NLP Strengths Pool ---------------
_STRENGTHS_POOL = [
    "clear explanation",
    "structured thinking",
    "good debugging approach",
    "strong problem decomposition",
    "effective use of technical terminology",
    "logical flow of ideas",
    "concise communication",
    "good time management in explanation",
    "demonstrated depth of understanding",
    "proactive mention of edge cases",
    "creative problem solving",
    "solid grasp of fundamentals",
]

_WEAKNESSES_POOL = [
    "could elaborate more on trade-offs",
    "minor hesitations during explanation",
    "could improve structure of response",
    "limited mention of alternative approaches",
]


# -------------- Fake Pipeline Steps ---------------
def _extract_audio(video_url: str) -> dict:
    """Simulate audio extraction from video."""
    return {
        "status": "completed",
        "duration_seconds": random.randint(180, 300),
        "sample_rate": 16000,
        "channels": 1,
    }


def _transcribe_audio(audio_meta: dict) -> dict:
    """Simulate speech-to-text transcription."""
    word_count = random.randint(250, 600)
    return {
        "status": "completed",
        "word_count": word_count,
        "language": "en",
        "confidence": round(random.uniform(0.88, 0.98), 2),
    }


def _analyze_transcript(transcript_meta: dict) -> dict:
    """Simulate NLP analysis on the transcript."""
    num_strengths = random.randint(3, 5)
    num_weaknesses = random.randint(0, 2)

    strengths = random.sample(_STRENGTHS_POOL, num_strengths)
    areas_for_improvement = random.sample(_WEAKNESSES_POOL, num_weaknesses)

    communication_score = random.randint(72, 96)
    technical_depth = random.randint(68, 95)
    confidence_level = random.randint(70, 95)
    problem_solving = random.randint(74, 96)

    return {
        "communication_score": communication_score,
        "technical_depth": technical_depth,
        "confidence_level": confidence_level,
        "problem_solving": problem_solving,
        "strengths": strengths,
        "areas_for_improvement": areas_for_improvement,
        "transcript_stats": {
            "word_count": transcript_meta["word_count"],
            "language": transcript_meta["language"],
            "speech_confidence": transcript_meta["confidence"],
        },
    }


# -------------- Public Entry Point ---------------
def analyze_explanation_video(video_url: str | None, candidate_id: str, job_id: str) -> dict:
    """
    Full pipeline: extract audio → transcribe → NLP analysis → evaluation.
    All steps are simulated.
    """
    # Step 1 — Audio extraction
    audio_meta = _extract_audio(video_url or "")

    # Step 2 — Speech-to-text
    transcript_meta = _transcribe_audio(audio_meta)

    # Step 3 — NLP analysis
    analysis = _analyze_transcript(transcript_meta)

    # Step 4 — Build evaluation result
    overall = round(
        0.30 * analysis["communication_score"]
        + 0.30 * analysis["technical_depth"]
        + 0.20 * analysis["confidence_level"]
        + 0.20 * analysis["problem_solving"],
        1,
    )

    return {
        "candidate_id": candidate_id,
        "job_id": job_id,
        "pipeline": {
            "audio_extraction": audio_meta,
            "transcription": transcript_meta,
        },
        "communication_score": analysis["communication_score"],
        "technical_depth": analysis["technical_depth"],
        "confidence_level": analysis["confidence_level"],
        "problem_solving": analysis["problem_solving"],
        "overall_score": overall,
        "strengths": analysis["strengths"],
        "areas_for_improvement": analysis["areas_for_improvement"],
        "transcript_stats": analysis["transcript_stats"],
    }
