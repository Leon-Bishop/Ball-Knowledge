/**
 * Ball Knowledge standings refresh policy.
 * All policy times use Europe/Istanbul (UTC+3 all year).
 * An actual scheduled Worker runs once a minute, but this policy prevents
 * API calls unless a league's polling interval and fixture state allow them.
 */
export const FAST_LEAGUES = Object.freeze([
  'england-premier-league',
  'turkey-super-lig'
]);
const zone='Europe/Istanbul';
const formatter=new Intl.DateTimeFormat('en-GB',{
 timeZone:zone,weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'
});
const TWO_MIN=2*60_000;
const THREE_HOURS=3*60*60_000;
export function istanbulTime(date){
 const parts=Object.fromEntries(formatter.formatToParts(date).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
 return {day:parts.weekday,hour:Number(parts.hour),minute:Number(parts.minute)};
}
export function matchWindowActive(date,fixtures=[]){
 const now=date.getTime();
 return fixtures.some(kickoff=>{
  const start=new Date(kickoff).getTime();
  return Number.isFinite(start)&&now>=start-15*60_000&&now<=start+THREE_HOURS;
 });
}
/**
 * Fixture times must be ISO 8601 timestamps with a timezone or UTC suffix.
 * No fixture => no 2-minute polling. This protects OpenLigaDB outside play.
 * A check means a cheap change-date poll, NOT a full table download.
 */
export function checkPlan(date,leagueId,fixtures=[]){
 const {day,hour,minute}=istanbulTime(date);
 if(hour>=1&&hour<6){
  return {due:(hour===1||hour===4)&&minute===7,intervalMinutes:180,mode:'overnight'};
 }
 const weekend=day==='Sat'||day==='Sun';
 const lateSunday=day==='Mon'&&hour===0;
 const activeWeekend=(weekend||lateSunday)&&
  (hour>=12||hour===0)&&
  FAST_LEAGUES.includes(leagueId)&&matchWindowActive(date,fixtures);
 if(activeWeekend){
  return {due:minute%2===0,intervalMinutes:2,mode:'live-weekend'};
 }
 return {due:minute%15===0,intervalMinutes:15,mode:'normal'};
}
