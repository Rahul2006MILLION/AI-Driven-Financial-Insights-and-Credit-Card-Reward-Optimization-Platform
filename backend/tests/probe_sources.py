import httpx
import time
import urllib.robotparser
from urllib.parse import urlparse
import json

urls = [
    ("HDFC Bank", "https://www.hdfcbank.com/personal/pay/cards/credit-cards/card-offers"),
    ("ICICI Bank", "https://www.icicibank.com/offers"),
    ("Axis Bank", "https://www.axisbank.com/grabdeals"),
    ("RuPay (NPCI)", "https://www.rupay.co.in/rupay-offers"),
    ("Blinkit", "https://blinkit.com/offers"),
    ("SBI Card", "https://www.sbicard.com/en/personal/special-offers.page"),
    ("Swiggy", "https://www.swiggy.com/"),
]

headers = {
    "User-Agent": "CLIQ-Financial-Intelligence-Auditor/1.0 (+https://cliq.finance/bot; compliance-check)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
}

results = []

for name, url in urls:
    parsed = urlparse(url)
    robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
    rp = urllib.robotparser.RobotFileParser()
    rp.set_url(robots_url)
    
    robots_allowed = None
    robots_status = None
    try:
        with httpx.Client(timeout=10.0, follow_redirects=True) as client:
            r_rob = client.get(robots_url, headers=headers)
            robots_status = r_rob.status_code
            if r_rob.status_code == 200:
                rp.parse(r_rob.text.splitlines())
                robots_allowed = rp.can_fetch(headers["User-Agent"], url)
            else:
                robots_allowed = True
    except Exception as e:
        robots_status = f"Err: {type(e).__name__}"
        robots_allowed = None

    t0 = time.time()
    try:
        with httpx.Client(timeout=12.0, follow_redirects=True) as client:
            resp = client.get(url, headers=headers)
            elapsed_ms = int((time.time() - t0) * 1000)
            server_header = resp.headers.get("server", "unknown")
            ct = resp.headers.get("content-type", "unknown")
            waf_indicators = []
            if "cf-ray" in resp.headers or "cloudflare" in server_header.lower():
                waf_indicators.append("Cloudflare")
            if "akamai" in server_header.lower() or "x-akamai-transformed" in resp.headers:
                waf_indicators.append("Akamai")
            if "x-amz-cf-id" in resp.headers or "cloudfront" in server_header.lower():
                waf_indicators.append("AWS CloudFront")
            if "incap_ses" in resp.headers or "visid_incap" in resp.headers:
                waf_indicators.append("Imperva Incapsula")

            body_sample = resp.text[:200].replace("\n", " ").strip()
            res_dict = {
                "name": name,
                "url": url,
                "final_url": str(resp.url),
                "robots_status": robots_status,
                "robots_allowed": robots_allowed,
                "http_status": resp.status_code,
                "latency_ms": elapsed_ms,
                "content_type": ct,
                "server": server_header,
                "waf": waf_indicators or ["None detected"],
                "body_length": len(resp.text),
                "body_preview": body_sample[:100],
            }
            results.append(res_dict)
            print(f"[{name}] HTTP {resp.status_code} in {elapsed_ms}ms | WAF: {res_dict['waf']} | URL: {resp.url}")
    except Exception as e:
        elapsed_ms = int((time.time() - t0) * 1000)
        res_dict = {
            "name": name,
            "url": url,
            "error": f"{type(e).__name__}: {str(e)}",
            "latency_ms": elapsed_ms,
            "robots_status": robots_status,
            "robots_allowed": robots_allowed,
        }
        results.append(res_dict)
        print(f"[{name}] FAILED in {elapsed_ms}ms: {res_dict['error']}")

with open("docs/probe_results.json", "w") as f:
    json.dump(results, f, indent=2)
print("Saved docs/probe_results.json")

