/** @type import("..").NS */
let ns = null;

// import { formatMoney } from '/helpers/formatters';
/*
import purchaseTor from '/automations/purchaseTor';
import gymWorkout from '/automations/gymWorkout';
import universityCourse from '/automations/universityCourse';
import purchaseProgram from '/automations/purchaseProgram';
import installBackdoor from '/automations/installBackdoor';
import purchaseAugmentations from '/automations/purchaseAugmentations';
import runScript from '/automations/runScript';
*/

export const MILLION = 1000000;
export const BILLION = 1000 * MILLION;

export default [
  { action: 'deleteStaleDataFiles' },
  {
    action: 'universityCourse',
    params: {
      skill: 'hacking',
      level: 10,
      university: 'rothman university',
      course: 'study computer science',
    },
    doneExpression: 'ns.getHackingLevel() >= 10',
  },
  { action: 'runScript', params: { script: 'scanServers.js', args: '--quiet' } },
  { action: 'runScript', params: { script: 'contracts.js' } },
  {
    action: 'purchaseTor',
    prereq: { money: 200000 },
    doneExpression: 'ns.getPlayer().tor',
  },
  {
    action: 'purchaseProgram',
    params: 'BruteSSH.exe',
    prereq: { money: 200000 },
    doneExpression: "ns.fileExists('BruteSSH.exe', 'home')",
  },
  { action: 'runScript', params: { script: 'scanServers.js', args: '--quiet' } },
  {
    action: 'gymWorkout',
    params: 'ALL 10 true',
    doneExpression: 'ns.getPlayer().agility >= 10',
  },
  { action: 'installBackdoor', params: 'CSEC', prereq: { hacking: 59 } },
  {
    action: 'purchaseAugmentations',
    params: 'CyberSec',
    prereq: { faction: 'CyberSec' },
  },
  {
    action: 'purchaseProgram',
    params: 'FTPCrack.exe',
    prereq: { money: 1.5 * MILLION },
    doneExpression: "ns.fileExists('FTPCrack.exe', 'home')",
  },
  { action: 'runScript', params: { script: 'scanServers.js', args: '--quiet' } },
  {
    action: 'installBackdoor',
    params: 'avmnite-02h',
    prereq: { hacking: 217 },
  },
  {
    action: 'purchaseProgram',
    params: 'relaySMTP.exe',
    prereq: { money: 5 * MILLION },
    doneExpression: "ns.fileExists('relaySMTP.exe', 'home')",
  },
  { action: 'runScript', params: { script: 'scanServers.js', args: '--quiet' } },
  {
    action: 'purchaseProgram',
    params: 'HTTPWorm.exe',
    prereq: { money: 30 * MILLION },
    doneExpression: "ns.fileExists('HTTPWorm.exe', 'home')",
  },
  { action: 'runScript', params: { script: 'scanServers.js', args: '--quiet' } },
  {
    action: 'purchaseProgram',
    params: 'SQLInject.exe',
    prereq: { money: 250 * MILLION },
    doneExpression: "ns.fileExists('SQLInject.exe', 'home')",
  },
  { action: 'runScript', params: { script: 'scanServers.js', args: '--quiet' } },
  {
    action: 'gymWorkout',
    params: 'ALL 50 true',
    doneExpression: 'ns.getPlayer().agility >= 50',
  },
  {
    action: 'purchaseProgram',
    params: 'Formulas.exe',
    prereq: { money: 5 * BILLION },
    doneExpression: "ns.fileExists('Formulas.exe', 'home')",
  },
  { action: 'installBackdoor', params: 'I.I.I.I', prereq: { hacking: 345 } },
  {
    action: 'purchaseAugmentations',
    params: 'NiteSec',
    prereq: { faction: 'NiteSec' },
  },
  {
    action: 'universityCourse',
    params: {
      skill: 'charisma',
      level: 50,
      university: 'rothman university',
      course: 'leadership',
    },
    doneExpression: 'ns.getPlayer().charisma >= 50',
  },
  {
    action: 'installBackdoor',
    params: 'run4theh111z',
    prereq: { hacking: 536 },
  },
  {
    action: 'purchaseAugmentations',
    params: 'The Black Hand',
    prereq: { faction: 'The Black Hand' },
  },
  {
    action: 'purchaseAugmentations',
    params: 'BitRunners',
    prereq: { faction: 'BitRunners' },
  },

  // // augmentations from Daedalus
];
