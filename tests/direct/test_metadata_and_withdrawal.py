import ast
import copy
from pathlib import Path
import pytest
from conftest import GEN, START, SCOPE, DEADLINE, funded
from test_initial_safety import review, unchanged
from test_adversarial import iso

def test_ascii_header_single_contract_and_payable_metadata():
    path=Path('contracts/parity_option.py');raw=path.read_bytes()
    raw.decode('ascii')
    assert raw.startswith(b'# v0.3.0\n# { "Depends": "py-genlayer:5jycge4q8k23462jtb0b9fyey1s9qz928sz2nbrd9mg4sxqg2qng" }')
    tree=ast.parse(raw)
    contracts=[n for n in tree.body if isinstance(n,ast.ClassDef) and any(ast.unparse(b)=='gl.contract.Contract' for b in n.bases)]
    assert len(contracts)==1 and contracts[0].name=='ParityOptionContract'
    payable=set()
    writes=set()
    for method in contracts[0].body:
        if not isinstance(method,ast.FunctionDef):continue
        decorators=[ast.unparse(d) for d in method.decorator_list]
        if any(d.startswith('gl.public.write') for d in decorators):
            writes.add(method.name)
            if 'gl.public.write.payable' in decorators:payable.add(method.name)
            else:assert 'gl.message.value' not in ast.unparse(method)
    assert len(writes)==10 and payable=={'submit_offer','exercise_option'}
    assert 'gl.chain.Account' not in raw.decode()
    assert 'gl.vm.run_nondet_default' in raw.decode()

def test_withdrawal_debits_first_uses_external_eoa_boundary_and_cannot_repeat(option_env):
    env=funded(option_env);vm,c,p,h,b=env
    review(env,('DIFFERENT','MATCH','MATCH'));vm.sender=p
    emitted=[]
    def capture(_vm,request):
        if 'EmitExternalMessage' in request:
            assert c.get_credit(str(p))=='0'
            assert c.get_accounting()['withdrawn_gen']=='1'
            message=request['EmitExternalMessage']
            emitted.append((str(message['address']),message['calldata'],message['value']))
            return {'ok':None}
        return None
    vm._gl_call_hook=capture
    c.withdraw_credit()
    assert emitted==[(str(p),b'',GEN)]
    assert c.get_accounting()=={'received_gen':'1','locked_gen':'0','credit_gen':'0','withdrawn_gen':'1','invariant':True}
    with vm.expect_revert():c.withdraw_credit()
    assert len(emitted)==1

def test_other_account_cannot_withdraw_provider_credit_and_credit_never_expires(option_env):
    env=funded(option_env);vm,c,p,h,b=env
    review(env,('DIFFERENT','MATCH','MATCH'));vm.sender=b
    before=copy.deepcopy(c.get_accounting())
    with vm.expect_revert():c.withdraw_credit()
    assert c.get_accounting()==before and c.get_credit(str(p))=='1'
    vm.warp('2030-01-01T00:00:00Z');vm.sender=p
    vm._gl_call_hook=lambda _vm,request:{'ok':None} if 'EmitExternalMessage' in request else None
    c.withdraw_credit();assert c.get_credit(str(p))=='0'

@pytest.mark.parametrize('status',['MATCH','AWARDED','REDEEMED','RECOVERED','EXPIRED'])
def test_recovery_never_diverts_a_closed_or_allocated_purse(option_env,status):
    env=funded(option_env);vm,c,p,h,b=env
    if status in ('MATCH','AWARDED','REDEEMED'):
        review(env)
        if status!='MATCH':
            vm.sender=h;vm.value=GEN;c.exercise_option('o1');vm.value=0
            if status=='REDEEMED':c.redeem('o1')
    elif status=='RECOVERED':
        vm.warp(iso(DEADLINE));vm.sender=b;c.recover_offer('o1')
    else:
        # A genuinely unpaid independent entity exercises the EXPIRED branch.
        vm.sender=p;c.create_option('o2','Unpaid','slot2',str(h),*SCOPE,DEADLINE,30)
        vm.warp(iso(DEADLINE));c.recover_offer('o2')
        before=(c.get_option('o2'),c.get_accounting())
        with vm.expect_revert():c.recover_offer('o2')
        assert (c.get_option('o2'),c.get_accounting())==before
        return
    vm.warp(iso(DEADLINE));vm.sender=b
    unchanged(vm,c,lambda:c.recover_offer('o1'))

@pytest.mark.parametrize('offset',[-1,0,1])
def test_creation_checks_its_own_deadline_boundary(option_env,offset):
    vm,c,p,h,b=option_env
    vm.warp(iso(DEADLINE+offset))
    before=c.list_options(0,20)
    if offset<0:c.create_option('o2','New','slot2',str(h),*SCOPE,DEADLINE,30)
    else:
        with vm.expect_revert():c.create_option('o2','New','slot2',str(h),*SCOPE,DEADLINE,30)
        assert c.list_options(0,20)==before

def test_two_entities_share_ledger_without_cross_settlement(option_env):
    env=funded(option_env);vm,c,p,h,b=env
    vm.sender=p;c.create_option('o2','Independent','slot2',str(h),*SCOPE,DEADLINE,30)
    before=c.get_option('o2')
    review(env,('DIFFERENT','MATCH','MATCH'))
    assert c.get_option('o2')==before
    assert c.list_options(0,1)['next_offset']==1 and c.list_options(1,1)['total']==2
    assert c.get_option('missing') is None
