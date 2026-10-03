// A simulation timestamp is fee-estimation context only. Actual writes use network time.
export function studioSimulationParams(method: string,params: unknown[]): unknown[] {
  if(method!=='sim_estimateTransactionFees')return params;
  const first=params[0];
  if(!first||typeof first!=='object'||Array.isArray(first)||!('type' in first)||first.type!=='write')return params;
  return [{...first,sim_config:{genvm_datetime:new Date().toISOString()}},...params.slice(1)];
}
