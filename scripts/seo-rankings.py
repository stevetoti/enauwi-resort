#!/usr/bin/env python3
"""One-off, budget-limited Google mobile baseline. Reads only project .env.local.
Saves provider responses, task status, actual result coverage and measured cost.
Reuses successful saved responses on rerun, avoiding repeat charges. No schedules.
"""
import base64,csv,datetime,hashlib,json,re,threading,urllib.request,urllib.error
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.parse import urlsplit

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/seo/research/measured-2026-11-01';OUT.mkdir(parents=True,exist_ok=True)
values={}
for line in (ROOT/'.env.local').read_text().splitlines():
    if '=' not in line or line.lstrip().startswith('#'):continue
    key,value=line.split('=',1);value=value.strip()
    if len(value)>=2 and value[0]==value[-1] and value[0] in ['\"',"'"]:value=value[1:-1]
    values[key.strip()]=value
if not values.get('DATAFORSEO_LOGIN') or not values.get('DATAFORSEO_PASSWORD'):
    raise SystemExit('Configure DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in project .env.local.')
AUTH='Basic '+base64.b64encode((values['DATAFORSEO_LOGIN']+':'+values['DATAFORSEO_PASSWORD']).encode()).decode()
lock=threading.Lock(); spent=sum(float(line.rsplit('\t',1)[-1]) for line in (ROOT/'docs/seo/dataforseo-costs.log').read_text().splitlines()) if (ROOT/'docs/seo/dataforseo-costs.log').exists() else 0.0;reserved=0.0;BUDGET=4.90

def call(name,endpoint,body=None,reserve=0):
    global spent,reserved
    dest=OUT/(name+'.json')
    if dest.exists():
        old=json.loads(dest.read_text())
        if old.get('status_code')==20000 and all(t.get('status_code')==20000 for t in old.get('tasks',[])):
            return old
        attempts=OUT/'attempts';attempts.mkdir(exist_ok=True)
        digest=hashlib.sha256(dest.read_bytes()).hexdigest()[:12]
        (attempts/(name+'-'+digest+'.json')).write_text(json.dumps(old,indent=2))
    with lock:
        if spent+reserved+reserve>BUDGET:raise RuntimeError('Budget ceiling reached; no additional call made.')
        reserved+=reserve
    req=urllib.request.Request('https://api.dataforseo.com/v3/'+endpoint,data=json.dumps(body).encode() if body is not None else None,headers={'Authorization':AUTH,'Content-Type':'application/json'})
    try:
        with urllib.request.urlopen(req,timeout=60) as response:data=json.load(response)
    except urllib.error.HTTPError as error:
        data={'status_code':None,'http_status':error.code,'tasks':[],'request_failed':True}
    except (OSError,TimeoutError) as error:
        # Do not retry a paid request automatically: a timed-out task might be billed.
        data={'status_code':None,'request_failed':True,'error_type':type(error).__name__,'billing_uncertain':True,'tasks':[]}
    cost=float(data.get('cost',0) or 0)
    with lock:
        reserved-=reserve;spent+=cost
        with (ROOT/'docs/seo/dataforseo-costs.log').open('a') as log:
            log.write(f'{datetime.datetime.now(datetime.timezone.utc).isoformat()}\t{endpoint}\t{cost}\n')
    dest.write_text(json.dumps(data,indent=2))
    print(name,'status',data.get('status_code'),'tasks',[t.get('status_code') for t in data.get('tasks',[])],'cost',cost,flush=True)
    return data

def results(data):
    return [r for task in data.get('tasks',[]) if task.get('status_code')==20000 for r in task.get('result',[]) or []]
def hostname(url):return urlsplit(url if '://' in url else 'https://'+url).hostname or ''
def ours(url):return hostname(url).lower().removeprefix('www.')=='enauwibeachresort.org'

locations=call('serp-locations','serp/google/locations')
# Keep supported country entries as a small evidence file; the full public response is reusable.
countries={r['country_iso_code']:r for r in results(locations) if r.get('location_type')=='Country' and r.get('country_iso_code') in ['VU','AU','NZ']}
(OUT/'verified-countries.json').write_text(json.dumps(countries,indent=2))
print('SERP countries verified',[(c,v.get('location_code')) for c,v in countries.items()],flush=True)
labs=call('labs-locations','dataforseo_labs/locations_and_languages')
lab_countries={r.get('country_iso_code'):r for r in results(labs)}
kw_data=json.loads((ROOT/'docs/seo/keywords.json').read_text())
all_keywords=[r['keyword'] for r in kw_data['keywords']]
for country in ['AU','NZ','VU']:
    market=lab_countries.get(country)
    if not market:
        print('Labs unsupported country',country,flush=True);continue
    if not any(l.get('language_code')=='en' and 'google' in l.get('available_sources',[]) for l in market.get('available_languages',[])):
        print('Labs English Google not supported',country,flush=True);continue
    call('overview-'+country.lower(),'dataforseo_labs/google/keyword_overview/live',[{'keywords':all_keywords,'location_code':market['location_code'],'language_code':'en'}],reserve=.15)
    call('ranked-'+country.lower(),'dataforseo_labs/google/ranked_keywords/live',[{'target':'enauwibeachresort.org','location_code':market['location_code'],'language_code':'en','limit':100}],reserve=.15)

# Broad and commercial searches plus branded spelling variations. Not every candidate is rank-tracked.
queries=[
('enauwi beach resort','/'),("e'nauwi beach resort",'/'),('enauwi resort vanuatu','/'),
('family beach resort efate','/'),('family resort vanuatu','/'),('family friendly resort vanuatu','/'),
('beach resort efate','/'),('efate accommodation','/'),('vanuatu beach resort','/'),
('beachfront bungalows efate','/book'),('beachfront accommodation vanuatu','/book'),('family accommodation efate','/book'),('eratap accommodation','/book'),('bungalows vanuatu','/book'),
('beachfront restaurant efate','/menu'),('restaurant eratap','/menu'),('seafood restaurant efate','/menu'),
('conference venue efate','/services'),('conference room vanuatu','/services'),('corporate retreat vanuatu','/services'),
('things to do on efate','/activities'),('family activities efate','/activities'),
('snorkelling efate','/activities/snorkeling-diving'),('snorkeling efate','/activities/snorkeling-diving'),
('island hopping efate','/activities/island-hopping'),('kayaking efate','/activities/sunset-kayaking'),
('sport fishing efate','/activities/sport-fishing'),('vanuatu cooking class','/activities/cooking-class'),
('efate travel guide','/blog'),('best time to visit vanuatu','/blog/when-to-visit-vanuatu')]
(OUT/'baseline-scope.json').write_text(json.dumps({'keywords':len(queries),'markets':['VU','AU','NZ'],'device':'mobile','language':'en','requested_depth':100,'estimated_max_usd':4.50,'budget_cap_usd':BUDGET,'note':'Organic rank_group is the reported position. Actual organic coverage is recorded separately. Labs metrics reflect provider historical database, not live rankings.'},indent=2))

def measure(args):
    country,index,keyword,target=args
    location=countries[country]
    data=call(f'serp-{country.lower()}-{index:02d}','serp/google/organic/live/advanced',[{'keyword':keyword,'location_code':location['location_code'],'language_code':'en','device':'mobile','os':'android','depth':100}],reserve=.04)
    task=(data.get('tasks') or [{}])[0];result=(task.get('result') or [{}])[0] or {}
    items=result.get('items') or [];organic=[r for r in items if r.get('type')=='organic']
    matches=sorted([r for r in organic if ours(r.get('url',''))],key=lambda r:r.get('rank_group',9999))
    best=matches[0] if matches else {}
    packs=[r for r in items if r.get('type')=='local_pack' and (ours(r.get('url') or r.get('domain') or '') or 'enauwi' in re.sub('[^a-z]','',r.get('title','').lower()))]
    success=task.get('status_code')==20000 and bool(task.get('result'))
    status='found' if matches else 'not_found_in_returned_results' if success and organic else 'no_organic_results_returned' if success else 'request_failed'
    return {'checked_at':result.get('datetime') or datetime.datetime.now(datetime.timezone.utc).isoformat(),'country':location['location_name'],'country_code':country,'location_code':location['location_code'],'device':'mobile','language':'en','keyword':keyword,'target':target,'position':best.get('rank_group'),'absolute_position':best.get('rank_absolute'),'url':best.get('url'),'map_pack_position':packs[0].get('rank_group') if packs else None,'right_page':bool(best) and urlsplit(best.get('url','')).path.rstrip('/')==target.rstrip('/'),'requested_depth':100,'organic_results_returned':len(organic),'max_organic_rank_returned':max((r.get('rank_group',0) for r in organic),default=0),'status':status,'task_status':task.get('status_code'),'provider_task_id':task.get('id'),'raw_evidence':str((OUT/f'serp-{country.lower()}-{index:02d}.json').relative_to(ROOT)),'all_ranking_urls':[{'position':r.get('rank_group'),'url':r.get('url')} for r in matches]}
args=[(country,i,kw,target) for country in ['VU','AU','NZ'] if country in countries for i,(kw,target) in enumerate(queries,1)]
rows=[]
with ThreadPoolExecutor(max_workers=3) as pool:
    for row in pool.map(measure,args):
        rows.append(row)
        (OUT/'rankings.json').write_text(json.dumps(rows,indent=2))
fields=[k for k in rows[0] if k!='all_ranking_urls'] if rows else []
with (ROOT/'docs/seo/rankings.csv').open('w',newline='') as f:
    writer=csv.DictWriter(f,fields,extrasaction='ignore');writer.writeheader();writer.writerows(rows)
actual_cost=sum(float(line.rsplit('\t',1)[-1]) for line in (ROOT/'docs/seo/dataforseo-costs.log').read_text().splitlines())
(OUT/'cost-summary.json').write_text(json.dumps({'provider_reported_cost_usd':round(actual_cost,6),'budget_cap_usd':BUDGET,'rows':len(rows),'queries':len(queries),'markets':len(countries),'measurement':'Google mobile organic live; Labs separately labelled historical'},indent=2))
print('COMPLETE rows',len(rows),'provider-reported cost',actual_cost,flush=True)
for country in ['VU','AU','NZ']:
    subset=[r for r in rows if r['country_code']==country]
    print(country,'found',sum(r['status']=='found' for r in subset),'of',len(subset),flush=True)
    for r in subset:
        if r['position']:print(' ',r['position'],r['keyword'],r['url'],flush=True)
