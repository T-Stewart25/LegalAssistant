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
parser.add_argument("--input_text", required=True)
parser.add_argument("--output_json", required=True)
parser.add_argument("--output_stats", required=True)
parser.add_argument("--live_output", required=True)
parser.add_argument("--max_chunk_size", type=int, default=10000)
parser.add_argument("--wait_time", type=int, default=60)
args = parser.parse_args()

# === CONFIGURATION ===
INPUT_TEXT_PATH = args.input_text
OUTPUT_JSON_PATH = args.output_json
OUTPUT_STATS_PATH = args.output_stats
LIVE_OUTPUT_PATH = args.live_output
MAX_CHUNK_SIZE = args.max_chunk_size
WAIT_TIME_SECONDS = args.wait_time

PDF_PATH = os.environ.get("PDF_PATH", "/path/to/fallback.pdf")
FILE_NAME = os.path.basename(PDF_PATH)

API_KEYS = [
    os.environ.get("MISTRAL_API_KEY"),
    os.environ.get("MISTRAL_API_KEY2")
]

# === JSON Template and Prompt ===
json_template = {
    "page_number": None,
    "file_name": None,
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

def build_prompt(page_num, file_name, page_text):
    return f"""
        You are a disability lawyer reviewing raw text from a client document. The text was extracted using AI-based OCR and PDF tools from **page {page_num}** of the file **{file_name}**.

        This text may contain misspellings or formatting issues. Despite that, your task is to extract all structured information that may be relevant to evaluating a disability case.

        Imagine you are preparing notes to support a claim — document anything related to medical history, financial status, legal situations, family context, and anything else that could help establish eligibility or clarify the client’s background.

        Your output must be a single structured JSON object in the following format. Fill in as much as you can. If a field is missing, set it to `null`. Do **not** add extra commentary — just valid JSON.

        This JSON **must include the fields** `"page_number"` and `"file_name"` at the top level to indicate the source of the information.

        Here is the expected format:

        {json.dumps(json_template, indent=4)}

        Begin parsing the content from page {page_num} of {file_name} below:

        {page_text}
    """.strip()

# === Deep Cleaner ===
def recursively_remove_key(obj, key_to_remove):
    if isinstance(obj, dict):
        return {k: recursively_remove_key(v, key_to_remove)
                for k, v in obj.items() if k != key_to_remove}
    elif isinstance(obj, list):
        return [recursively_remove_key(item, key_to_remove) for item in obj]
    else:
        return obj

# === Page Splitting ===
def load_pages_from_file():
    with open(INPUT_TEXT_PATH, "r", encoding="utf-8") as f:
        text = f.read()

    pattern = r"=== START OF PAGE (\d+) ON PDF (.+?) ===(.*?)=== END OF PAGE \1 ON PDF \2 ==="
    matches = re.findall(pattern, text, flags=re.DOTALL)

    page_tuples = []
    for page_num, file_name, content in matches:
        full_text_block = f"=== START OF PAGE {page_num} ON PDF {file_name} ==={content}=== END OF PAGE {page_num} ON PDF {file_name} ==="
        page_tuples.append((int(page_num), full_text_block))

    return page_tuples

# === JSON Extraction ===
def extract_first_json(response_text):
    try:
        match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if match:
            return json.loads(match.group(0))
    except Exception as e:
        print(f"❌ Error extracting JSON: {e}")
    return None

# === API Worker ===
def api_worker(worker_id, api_key, page_tuples, result_queue):
    client = Mistral(api_key=api_key)
    progress = tqdm(total=len(page_tuples), desc=f"Worker {worker_id}", position=worker_id)

    for page_num, page_text in page_tuples:
        full_prompt = build_prompt(page_num, FILE_NAME, page_text)
        start_time = time.time()

        try:
            response = client.chat.complete(
                model="mistral-large-latest",
                messages=[{"role": "user", "content": full_prompt}]
            )
            raw_text = response.choices[0].message.content
            json_result = extract_first_json(raw_text)
            if json_result is not None:
                # Deep clean any stray 'file_name'
                json_result = recursively_remove_key(json_result, "file_name")
                json_result["page_number"] = page_num
                json_result["file_name"] = FILE_NAME
            content = json_result if json_result else {"error": "No valid JSON found"}
        except Exception as e:
            content = {"error": f"API Error: {e}"}

        end_time = time.time()
        result_data = {
            "worker": worker_id,
            "page_number": page_num,
            "file_name": FILE_NAME,
            "duration": round(end_time - start_time, 2),
            "char_count": len(page_text),
            "content": content
        }

        with open(LIVE_OUTPUT_PATH, "a", encoding="utf-8") as out_file:
            out_file.write(json.dumps(result_data, indent=2) + "\n")

        result_queue.put(result_data)
        progress.update(1)
        time.sleep(WAIT_TIME_SECONDS)

    progress.close()

# === Main Runner ===
def run_parallel_requests():
    all_pages = load_pages_from_file()
    even_pages = [(n, t) for (n, t) in all_pages if n % 2 == 0]
    odd_pages = [(n, t) for (n, t) in all_pages if n % 2 != 0]

    manager = multiprocessing.Manager()
    result_queue = manager.Queue()
    processes = []

    for i, page_set in enumerate([even_pages, odd_pages]):
        p = multiprocessing.Process(
            target=api_worker,
            args=(i + 1, API_KEYS[i], page_set, result_queue)
        )
        processes.append(p)
        p.start()

    for p in processes:
        p.join()

    results = []
    while not result_queue.empty():
        results.append(result_queue.get())

    results.sort(key=lambda x: x["page_number"])

    with open(OUTPUT_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    with open(OUTPUT_STATS_PATH, "w", encoding="utf-8") as f:
        json.dump([{k: v for k, v in r.items() if k != "content"} for r in results], f, indent=2)

    print(f"✅ All results saved to {OUTPUT_JSON_PATH}")
    print(f"📡 Live log written to {LIVE_OUTPUT_PATH}")
    print(f"📊 Stats written to {OUTPUT_STATS_PATH}")

# === Entrypoint ===
if __name__ == "__main__":
    run_parallel_requests()
