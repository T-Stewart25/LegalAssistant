# === Standard Library ===
import os
import time
import json
import re
import multiprocessing
from mistralai import Mistral
from tqdm import tqdm
import argparse
from datetime import datetime

# === ARG PARSING ===
parser = argparse.ArgumentParser()
parser.add_argument("--input_text", required=True)  # Input is now plain text, not HTML
parser.add_argument("--output_json", required=True)
parser.add_argument("--output_stats", required=True)
parser.add_argument("--live_output", required=True)
parser.add_argument("--max_chunk_size", type=int, default=10000)
parser.add_argument("--wait_time", type=int, default=60)

args = parser.parse_args()

# === CONFIGURATION FROM ARGS ===
INPUT_TEXT_PATH = args.input_text
OUTPUT_JSON_PATH = args.output_json
OUTPUT_STATS_PATH = args.output_stats
LIVE_OUTPUT_PATH = args.live_output
MAX_CHUNK_SIZE = args.max_chunk_size
WAIT_TIME_SECONDS = args.wait_time

# === API KEYS FROM ENVIRONMENT ===
API_KEYS = [
    os.environ.get("MISTRAL_API_KEY"),
    os.environ.get("MISTRAL_API_KEY2")
]

# === JSON Template and Prompt ===
json_template = {
    "Clients": {"name": None, "birth_date": None, "section": None},
    "PersonalIdentifyingInformation": {
        "name": None, "birth_date": None, "address": None,
        "phone_number": None, "email": None, "social_security_number": None
    },
    "MedicalHistory": {
        "diagnosis": None, "treatment": None, "medications": None,
        "allergies": None, "surgeries": None, "hospitalizations": None,
        "physicians": None, "therapists": None, "lab_results": None,
        "imaging_results": None, "mental_health_evaluations": None,
        "functional_assessments": None
    },
    "MedicalVisits": [
        {"date": None, "physician": None, "location": None,
         "reason_for_visit": None, "notes": None, "recommendations": None}
    ],
    "WorkHistory": {
        "employer": None, "job_title": None, "start_date": None, "end_date": None,
        "reason_for_leaving": None, "job_duties": None, "supervisors": None,
        "colleagues": None, "work_environment": None, "performance_reviews": None
    },
    "FamilyHistory": {
        "family_member_name": None, "relationship": None, "health_conditions": None,
        "medications": None, "allergies": None, "surgeries": None,
        "hospitalizations": None, "physicians": None, "therapists": None
    },
    "EducationHistory": {
        "institution": None, "degree": None, "field_of_study": None,
        "graduation_date": None, "courses_taken": None, "academic_achievements": None
    },
    "LegalHistory": {
        "case_number": None, "court": None, "case_type": None,
        "case_status": None, "judge": None, "attorneys": None, "outcome": None
    },
    "FinancialInformation": {
        "income_source": None, "income_amount": None, "expenses": None,
        "assets": None, "liabilities": None, "bank_statements": None, "tax_returns": None
    }
}

base_prompt = f"""
You will be given plain text extracted from a client document. This text was extracted using an AI model so the spelling may be slightly off or similar symbols may be replaced. Your task is to extract and return a structured JSON object using the following template.

Each section should be filled out as completely as possible based on the content provided. If a field is not present, return it as null. Do not include any commentary or explanation — only return the raw JSON.

Here is the JSON structure to follow:

{json.dumps(json_template, indent=4)}

Begin parsing the content below:
"""

# === Chunk Management ===
def load_and_split_chunks():
    """Loads text and splits it into manageable chunks."""
    with open(INPUT_TEXT_PATH, "r", encoding="utf-8") as f:
        text = f.read()

    return [text[i:i + MAX_CHUNK_SIZE] for i in range(0, len(text), MAX_CHUNK_SIZE)]

def extract_first_json(response_text):
    """Extracts the first valid JSON from API response."""
    try:
        match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if match:
            return json.loads(match.group(0))
    except Exception as e:
        print(f"❌ Error extracting JSON: {e}")
    return None

# === Mistral API Worker ===
def api_worker(worker_id, api_key, chunks_with_index, result_queue):
    """Processes text chunks using Mistral API and returns JSON."""
    client = Mistral(api_key=api_key)
    progress = tqdm(total=len(chunks_with_index), desc=f"Worker {worker_id}", position=worker_id)

    for chunk_index, chunk in chunks_with_index:
        full_prompt = base_prompt + "\n\n" + chunk
        start_time = time.time()

        try:
            response = client.chat.complete(
                model="mistral-large-latest",
                messages=[{"role": "user", "content": full_prompt}]
            )
            raw_text = response.choices[0].message.content
            json_result = extract_first_json(raw_text)
            content = json_result if json_result else {"error": "No valid JSON found"}
        except Exception as e:
            content = {"error": f"API Error: {e}"}

        end_time = time.time()
        duration = round(end_time - start_time, 2)

        result_data = {
            "worker": worker_id,
            "chunk_index": chunk_index,
            "duration": duration,
            "char_count": len(chunk),
            "estimated_pages": round(len(chunk) / 2000, 2),
            "content": content
        }

        # Save intermediate result to live output
        with open(LIVE_OUTPUT_PATH, "a", encoding="utf-8") as out_file:
            out_file.write(json.dumps(result_data, indent=2) + "\n")

        result_queue.put(result_data)
        progress.update(1)
        time.sleep(WAIT_TIME_SECONDS)

    progress.close()

# === Parallel Processing Setup ===
def run_parallel_requests():
    """Runs multiple API workers in parallel for even/odd chunk processing."""
    chunks = load_and_split_chunks()
    even_chunks = [(i, chunk) for i, chunk in enumerate(chunks) if i % 2 == 0]
    odd_chunks = [(i, chunk) for i, chunk in enumerate(chunks) if i % 2 == 1]

    manager = multiprocessing.Manager()
    result_queue = manager.Queue()
    processes = []

    for i, chunk_set in enumerate([even_chunks, odd_chunks]):
        p = multiprocessing.Process(
            target=api_worker,
            args=(i + 1, API_KEYS[i], chunk_set, result_queue)
        )
        processes.append(p)
        p.start()

    for p in processes:
        p.join()

    results = []
    while not result_queue.empty():
        results.append(result_queue.get())

    save_final_results(results)

def save_final_results(results):
    """Saves combined JSON, stats, and final summary to output files."""
    sorted_results = sorted(results, key=lambda x: x["chunk_index"])
    
    # Save full responses
    with open(OUTPUT_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(sorted_results, f, indent=2)

    # Save stats
    stats = [{k: v for k, v in r.items() if k != "content"} for r in sorted_results]
    with open(OUTPUT_STATS_PATH, "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2)

    # Final summarization step
    all_content_jsons = [r["content"] for r in sorted_results if isinstance(r["content"], dict)]
    summary_input = json.dumps(all_content_jsons, indent=2)

    summary_prompt = f"""
                    You are a summarization assistant. You will receive structured JSON records extracted from a document. Your task is to summarize all key information from all fields into clear, concise bullet points. Focus on the most relevant and unique information, but truncate repetitive or verbose entries. Do not include any metadata or commentary. Only output bullet points.

                    Here is the input JSON:

                    {summary_input}
                    """

    try:
        summary_client = Mistral(api_key=API_KEYS[0])
        response = summary_client.chat.complete(
            model="mistral-large-latest",
            messages=[{"role": "user", "content": summary_prompt}]
        )
        summary_text = response.choices[0].message.content.strip()
    except Exception as e:
        summary_text = f"Error generating summary: {e}"

    # Print or save summary
    print("\n📝 Final Bullet-Point Summary:")
    print(summary_text)

    summary_path = OUTPUT_JSON_PATH.replace(".json", "_summary.txt")
    with open(summary_path, "w", encoding="utf-8") as f:
        f.write(summary_text)

    print(f"📄 Summary saved to: {summary_path}")
    print("✅ DONE")


# === Main Execution ===
if __name__ == "__main__":
    run_parallel_requests()
