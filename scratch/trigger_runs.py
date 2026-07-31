import urllib.request
import json

def trigger_run(model_version):
    url = "http://127.0.0.1:8000/api/evaluate"
    data = json.dumps({"model_version": model_version}).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as res:
            response_body = res.read().decode("utf-8")
            print(f"SUCCESS: Triggered run for {model_version}")
            print(response_body[:200] + "...")
    except Exception as e:
        print(f"FAILED: Could not trigger run for {model_version}: {e}")

if __name__ == "__main__":
    trigger_run("v1")
    trigger_run("v2")
