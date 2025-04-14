import os
import time
import json
import re
import multiprocessing
from mistralai import Mistral
from tqdm import tqdm
import argparse


# === ARG PARSING ===
parser = argparse.ArgumentParser()
parser.add_argument("--input_html", required=True)
parser.add_argument("--output_json", required=True)
parser.add_argument("--output_stats", required=True)
parser.add_argument("--live_output", required=True)
parser.add_argument("--max_chunk_size", type=int, default=10000)
parser.add_argument("--wait_time", type=int, default=60)

args = parser.parse_args()

# === CONFIGURATION FROM ARGS ===
OUTPUT_HTML_PATH = args.input_html
OUTPUT_JSON_PATH = args.output_json
OUTPUT_STATS_PATH = args.output_stats
LIVE_OUTPUT_PATH = args.live_output
MAX_CHUNK_SIZE = args.max_chunk_size
WAIT_TIME_SECONDS = args.wait_time

# === API KEYS FROM ENVIRONMENT ===

API_KEYS = [
    os.environ["MISTRAL_API_KEY"],
    os.environ["MISTRAL_API_KEY2"]
]

# === JSON Template and Prompt ===
json_template = {
    "Clients": {
        "name": None,
        "birth_date": None,
        "section": None
    },
    "PersonalIdentifyingInformation": {
        "name": None,
        "birth_date": None,
        "address": None,
        "phone_number": None,
        "email": None,
        "social_security_number": None
    },
    "MedicalHistory": {
        "diagnosis": None,
        "treatment": None,
        "medications": None,
        "allergies": None,
        "surgeries": None,
        "hospitalizations": None,
        "physicians": None,
        "therapists": None,
        "lab_results": None,
        "imaging_results": None,
        "mental_health_evaluations": None,
        "functional_assessments": None
    },
    "MedicalVisits": [
        {
            "date": None,
            "physician": None,
            "location": None,
            "reason_for_visit": None,
            "notes": None,
            "recommendations": None
        }
    ],
    "WorkHistory": {
        "employer": None,
        "job_title": None,
        "start_date": None,
        "end_date": None,
        "reason_for_leaving": None,
        "job_duties": None,
        "supervisors": None,
        "colleagues": None,
        "work_environment": None,
        "performance_reviews": None
    },
    "FamilyHistory": {
        "family_member_name": None,
        "relationship": None,
        "health_conditions": None,
        "medications": None,
        "allergies": None,
        "surgeries": None,
        "hospitalizations": None,
        "physicians": None,
        "therapists": None
    },
    "EducationHistory": {
        "institution": None,
        "degree": None,
        "field_of_study": None,
        "graduation_date": None,
        "courses_taken": None,
        "academic_achievements": None
    },
    "LegalHistory": {
        "case_number": None,
        "court": None,
        "case_type": None,
        "case_status": None,
        "judge": None,
        "attorneys": None,
        "outcome": None
    },
    "FinancialInformation": {
        "income_source": None,
        "income_amount": None,
        "expenses": None,
        "assets": None,
        "liabilities": None,
        "bank_statements": None,
        "tax_returns": None
    }
}


base_prompt = f"""
You will be given an HTML document containing client information. Your task is to extract and return a structured JSON object using the following template.

Each section should be filled out as completely as possible based on the content provided. If a field is not present, return it as null. Do not include any commentary or explanation — only return the raw JSON.

In addition to extracting general structured information (such as medical history, education, work, legal, and financial data), you must also extract **detailed medical visit records**.

Each `MedicalVisit` should include:
- `date`: when the visit occurred
- `physician`: who was seen (name and credentials if available)
- `location`: clinic or facility (if mentioned)
- `reason_for_visit`: the primary complaint or purpose of the visit
- `notes`: observations, symptoms, or any descriptive information from the visit
- `recommendations`: any instructions, treatments, or next steps advised

Include all medical visits, even if some fields are missing. Do not guess missing data — only extract what is explicitly stated.

Here is the JSON structure to follow:

{json.dumps(json_template, indent=4)}

Begin parsing the HTML content below:
"""


def load_chunks():
    with open(OUTPUT_HTML_PATH, "r", encoding="utf-8") as f:
        html_text = f.read()
    return [html_text[i:i + MAX_CHUNK_SIZE] for i in range(0, len(html_text), MAX_CHUNK_SIZE)]

def extract_first_json(text):
    try:
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return match.group(0)
    except Exception as e:
        print("❌ Error extracting JSON:", e)
    return None

def api_worker(worker_id, api_key, chunks_with_index, result_queue):
    client = Mistral(api_key=api_key)
    progress = tqdm(total=len(chunks_with_index), desc=f"Worker {worker_id}", position=worker_id)

    for i, (chunk_index, chunk) in enumerate(chunks_with_index):
        full_prompt = base_prompt + "\n\n" + chunk
        start_time = time.time()

        try:
            response = client.chat.complete(
                model="mistral-large-latest",
                messages=[{"role": "user", "content": full_prompt}]
            )
            raw_text = response.choices[0].message.content
            extracted = extract_first_json(raw_text)
            content = extracted.strip() if extracted else "ERROR: No JSON found"
        except Exception as e:
            content = f"ERROR: {e}"

        end_time = time.time()
        duration = round(end_time - start_time, 2)

        print(f"\n🧠 Worker {worker_id} - Chunk {chunk_index} completed in {duration} sec")

        with open(LIVE_OUTPUT_PATH, "a", encoding="utf-8") as out_file:
            out_file.write(content + "\n")

        result = {
            "worker": worker_id,
            "chunk_index": chunk_index,
            "start_time": start_time,
            "duration": duration,
            "char_count": len(chunk),
            "estimated_pages": round(len(chunk) / 2000, 2),
            "content": content
        }

        result_queue.put(result)
        progress.update(1)
        time.sleep(WAIT_TIME_SECONDS)

    progress.close()

def run_parallel_requests():
    chunks = load_chunks()
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

    with open(OUTPUT_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(sorted(results, key=lambda x: x["chunk_index"]), f, indent=2)

    stats = [{k: v for k, v in r.items() if k != "content"} for r in results]

    with open(OUTPUT_STATS_PATH, "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2)

    print(f"\n📁 Full responses saved to: {OUTPUT_JSON_PATH}")
    print(f"📊 Stats saved to: {OUTPUT_STATS_PATH}")
    print("✅ DONE")

if __name__ == "__main__":
    run_parallel_requests()
