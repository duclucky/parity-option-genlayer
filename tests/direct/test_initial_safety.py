import copy
import json
import pytest
from conftest import GEN, DEADLINE, SCOPE, funded

def unchanged(vm, c, call):
    before = copy.deepcopy((c.get_option('o1'), c.get_accounting()))
    with vm.expect_revert():
        call()
    assert (c.get_option('o1'), c.get_accounting()) == before

def verdict(c, classes=('MATCH','MATCH','MATCH')):
    o = c.get_option('o1')
    ids = ('purpose','deliverables','restrictions')
    return {'option_id':'o1','attempt':o['review_count']+1,'chain_id':o['chain_id'],
            'contract':o['contract'],'scope_digest':o['scope_digest'],'offer_digest':o['offer_digest'],
            'coverage':['scope','offer'],'decisions':[{'id':k,'class':v} for k,v in zip(ids,classes)],
            'root_ids':[k for k,v in zip(ids,classes) if v=='DIFFERENT'],
            'outcome':'UNCLEAR' if 'UNCLEAR' in classes else 'DIFFERENT' if 'DIFFERENT' in classes else 'MATCH'}

def review(env, classes=('MATCH','MATCH','MATCH')):
    vm,c,*_ = env
    vm.mock_llm(r'.*PARITY_OPTION_REVIEW.*', json.dumps(verdict(c, classes)))
    c.review_offer('o1', c.get_option('o1')['review_count']+1)

def test_submit_wrong_role_amount_and_duplicate_leave_ledger_unchanged(option_env):
    vm,c,p,h,b=option_env
    vm.sender=h
    c.accept_option('o1',c.get_option('o1')['scope_digest'])
    for actor,amount in ((p,GEN),(h,GEN),(b,0),(b,2*GEN)):
        vm.sender=actor; vm.value=amount
        unchanged(vm,c,lambda:c.submit_offer('o1',c.get_option('o1')['scope_digest'],*SCOPE))
    vm.sender=b;vm.value=GEN
    c.submit_offer('o1',c.get_option('o1')['scope_digest'],*SCOPE)
    unchanged(vm,c,lambda:c.submit_offer('o1',c.get_option('o1')['scope_digest'],*SCOPE))

@pytest.mark.parametrize('method',['exercise_option','finalize_option','recover_offer','redeem'])
def test_recovery_and_settlement_forbidden_in_draft(option_env,method):
    vm,c,p,h,b=option_env
    vm.sender=h;vm.value=GEN if method=='exercise_option' else 0
    unchanged(vm,c,lambda:getattr(c,method)('o1'))

def test_holder_exercise_assigns_fixed_price_refund_once(option_env):
    env=funded(option_env);vm,c,p,h,b=env
    review(env)
    assert c.get_option('o1')['status']=='MATCH'
    vm.sender=b;vm.value=GEN
    unchanged(vm,c,lambda:c.exercise_option('o1'))
    vm.sender=h
    c.exercise_option('o1')
    assert c.get_option('o1')['winner']==str(h)
    assert c.get_credit(str(p))=='1' and c.get_credit(str(b))=='1'
    assert c.get_accounting()=={'received_gen':'2','locked_gen':'0','credit_gen':'2','withdrawn_gen':'0','invariant':True}
    unchanged(vm,c,lambda:c.exercise_option('o1'))

def test_expired_offer_recovery_is_buyer_only_and_cannot_double_credit(option_env):
    vm,c,p,h,b=funded(option_env,False)
    vm.sender=b
    unchanged(vm,c,lambda:c.recover_offer('o1'))
    vm.warp('2026-10-03T01:00:00Z')
    vm.sender=p
    unchanged(vm,c,lambda:c.recover_offer('o1'))
    vm.sender=b
    c.recover_offer('o1')
    assert c.get_credit(str(b))=='1' and c.get_accounting()['locked_gen']=='0'
    unchanged(vm,c,lambda:c.recover_offer('o1'))

def test_malformed_settlement_result_cannot_allocate_credit(option_env):
    env=funded(option_env);vm,c,*_=env
    data=verdict(c,('DIFFERENT','MATCH','MATCH'));data['root_ids']=[]
    vm.mock_llm(r'.*PARITY_OPTION_REVIEW.*',json.dumps(data))
    unchanged(vm,c,lambda:c.review_offer('o1',1))

def test_zero_credit_withdrawal_rejects_without_accounting_change(option_env):
    vm,c,*_=option_env
    before=c.get_accounting()
    with vm.expect_revert():c.withdraw_credit()
    assert c.get_accounting()==before
