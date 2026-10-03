import pytest
import os
import sys
import tempfile
from pathlib import Path

@pytest.fixture(autouse=True)
def windows_direct_compat(monkeypatch):
    """Retain stdin temp files until the VM restores fd 0; synchronize its authored clock.

    Same calldata/WASI boundary as upstream; no VM rule or production guard bypassed.
    """
    from gltest.direct import loader
    from gltest.direct import wasi_mock
    from gltest.direct.vm import VMContext
    paths = []
    original_warp = VMContext.warp
    def warp(vm, timestamp):
        original_warp(vm, timestamp)
        message = sys.modules.get('genlayer.message')
        if message is not None and isinstance(getattr(message, 'raw', None), dict):
            message.raw['datetime'] = timestamp
    monkeypatch.setattr(VMContext, 'warp', warp)
    original_llm = wasi_mock._handle_llm_request
    def llm_transport(vm, data):
        response = vm._match_llm_mock(data.get('prompt',''))
        if response is not None:
            return {'ok': response}
        return original_llm(vm,data)
    monkeypatch.setattr(wasi_mock,'_handle_llm_request',llm_transport)
    if os.name == 'nt':
        def inject(vm):
            calldata = loader.import_calldata()
            Address = loader.import_address()
            data = vm.get_message_raw()
            for key in ('sender_address','origin_address','contract_address'):
                data[key] = Address(data[key]) if isinstance(data[key],bytes) else data[key]
            data['signer_address'] = data['sender_address']
            directory = Path('.gltest_cache/stdin').resolve()
            directory.mkdir(parents=True,exist_ok=True)
            fd,path = tempfile.mkstemp(dir=directory)
            paths.append(path)
            try:
                os.write(fd,calldata.encode(data));os.lseek(fd,0,os.SEEK_SET)
                if getattr(vm,'_original_stdin_fd',None) is None:
                    vm._original_stdin_fd=os.dup(0)
                os.dup2(fd,0)
            finally:
                os.close(fd)
        monkeypatch.setattr(loader,'_inject_message_to_fd0',inject)
    yield
    for path in paths:
        Path(path).unlink(missing_ok=True)

GEN = 10**18
START = 1790985600
DEADLINE = START + 3600
SCOPE = ('Research reading', 'One private reading reservation', 'Attribution required; no redistribution')

@pytest.fixture
def option_env(direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie):
    direct_vm.warp('2026-10-03T00:00:00Z')
    direct_vm.sender = direct_alice
    direct_vm.value = 0
    contract = direct_deploy('contracts/parity_option.py', sdk_version='v0.6.0-rc5')
    from genlayer.types import Address
    direct_alice, direct_bob, direct_charlie = (Address(a) for a in (direct_alice, direct_bob, direct_charlie))
    direct_vm.sender = direct_alice
    contract.create_option('o1', 'Research slot', 'slot1', str(direct_bob), *SCOPE, DEADLINE, 30)
    return direct_vm, contract, direct_alice, direct_bob, direct_charlie

def funded(env, endorsed=True):
    vm, c, provider, holder, buyer = env
    vm.sender = holder
    c.accept_option('o1', c.get_option('o1')['scope_digest'])
    vm.sender = buyer
    vm.value = GEN
    c.submit_offer('o1', c.get_option('o1')['scope_digest'], *SCOPE)
    vm.value = 0
    if endorsed:
        vm.sender = provider
        c.endorse_offer('o1', c.get_option('o1')['offer_digest'])
    return env
