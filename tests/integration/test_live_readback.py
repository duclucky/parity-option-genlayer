"""Read-only verification of the recorded Studio Dev deployment and lifecycle.

Run explicitly with gltest tests/integration --fee-profile frontend/fee-profile.json.
No keys, signing, deployments, funding or replay are performed by this suite.
"""
import json
from pathlib import Path
from types import SimpleNamespace
from urllib.request import Request, urlopen

from genlayer_py import create_client
from genlayer_py.chains import studio_devnet
from genlayer_py.types import TransactionHashVariant
from gltest.fees import get_fee_profile_collector

ROOT = Path(__file__).resolve().parents[2]
EVIDENCE = ROOT / "docs" / "evidence" / "studio-dev"
RPC = "https://studio-next.genlayer.com/api"


def rpc(method, params):
    request = Request(RPC, data=json.dumps({"jsonrpc": "2.0", "id": 1,
                                            "method": method, "params": params}).encode(),
                      headers={"Content-Type": "application/json", "User-Agent": "genlayer-py"})
    try:
        with urlopen(request, timeout=45) as response:
            envelope = json.load(response)
    except Exception:
        raise AssertionError("Live transport did not complete; response deliberately omitted") from None
    if envelope.get("error"):
        raise AssertionError("Live RPC did not complete; payload deliberately omitted")
    return envelope.get("result")


def test_finalized_live_lifecycle_and_fee_observations():
    deployment = json.loads((EVIDENCE / "deployment.json").read_text())
    journal = json.loads((EVIDENCE / "attempts.json").read_text())
    assert deployment["network"] == "studio-dev" and deployment["chainId"] == 61997
    assert int(rpc("eth_chainId", []), 16) == 61997
    assert journal["sourceHash"] == deployment["sourceHash"]
    completed = {key: value for key, value in journal.get("cases", {}).items() if value.get("complete")}
    assert "match" in completed, "A real completed MATCH lifecycle is required"
    client = create_client(chain=studio_devnet, endpoint=RPC)
    # The Python read API requires .address even though it never signs a read.
    # Use the recorded public deployer address only; no key or new EOA is created.
    read_context = SimpleNamespace(address=journal["attempts"]["deploy-v1"]["actor"])

    def view(method, args=None):
        try:
            return client.read_contract(deployment["contractAddress"], method, args=args or [],
                                        account=read_context, transaction_hash_variant=TransactionHashVariant.LATEST_FINAL)
        except Exception:
            raise AssertionError("Finalized canonical view unavailable; payload omitted") from None

    config = view("get_config")
    assert config["protocol"] == "PARITY_OPTION_V1" and config["price_gen"] == "1"
    accounting = view("get_accounting")
    assert accounting["invariant"] and accounting["credit_gen"] == "0" and accounting["locked_gen"] == "0"
    assert int(rpc("eth_getBalance", [deployment["contractAddress"], "latest"]), 16) == 0
    for kind, case in completed.items():
        option = view("get_option", [case["id"]])
        assert option["status"] == ("RECOVERED" if kind == "unclear" else "REDEEMED")
        review = view("get_review", [case["id"], option["review_count"]])
        assert review["outcome"] == ("DIFFERENT" if kind == "distinct" else "UNCLEAR" if kind == "unclear" else "MATCH")

    collector = get_fee_profile_collector()
    for key, attempt in journal["attempts"].items():
        if attempt.get("stage") != "finalized":
            continue
        raw = rpc("eth_getTransactionByHash", [attempt["hash"]])
        successful = raw.get("status") == "FINALIZED" and raw.get("txExecutionResult") == 1
        assert successful, "Recorded transaction must still have successful finalized execution"
        if attempt["method"] == "deploy":
            collector.record_deploy(raw)
        else:
            collector.record_method(attempt["method"], raw)
        if attempt["method"] == "withdraw_credit":
            assert attempt.get("transferProof", {}).get("proven"), "Exact native decrease and bound finalized external message required"
    assert collector.has_observations(), "Network must supply measured fee observations"
