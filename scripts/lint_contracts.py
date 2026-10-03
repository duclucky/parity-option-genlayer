"""Apply the documented v0.3 API-name compatibility fix, then run all linter rules.

The pinned linter omits run_nondet_default from its reachability/spawn tables.
No rule is disabled and vendor files are never modified.
"""
import os
from importlib.metadata import version
from pathlib import Path
import sys

os.environ['PYTHONUTF8'] = '1'
from genvm_linter.lint import safety
from genvm_linter.cli import main

assert version('genvm-linter') == '0.11.1-rc.2', 'Reassess compatibility fix for a different linter'
safety.SafeEntryPointFinder.SAFE_PATTERNS = {
    **safety.SafeEntryPointFinder.SAFE_PATTERNS, 'gl.vm.run_nondet_default': [0, 1]
}
safety.NONDET_SPAWN_CALLS = safety.NONDET_SPAWN_CALLS | {'gl.vm.run_nondet_default'}
if __name__ == '__main__':
    contracts = sorted(Path('contracts').glob('*.py'))
    assert contracts, 'No project contracts'
    for contract in contracts:
        result = main.main(args=['check', str(contract)], standalone_mode=False)
        if isinstance(result, int) and result != 0:
            sys.exit(result)
