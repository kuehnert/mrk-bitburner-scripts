const milestones = [
  { id: 1, level: 1, action: 'deleteStaleDataFiles' },
  { id: 2, level: 2, action: 'runScript', params: { script: 'contracts.js' } },
  { id: 4, level: 2, action: 'runScript', params: { script: 'milestones/robCasino.js' }, preReq: { money: '200k' } },
  { id: 3, level: 3, action: 'universityCourse', params: { skill: 'hacking', level: 10 } },

  // PROGRAMS
  { id: 10, level: 3, action: 'purchaseTor' },
  { id: 11, level: 4, action: 'purchaseProgram', params: { program: 'BruteSSH.exe' }, preReq: { jobId: 10 } },
  { id: 12, level: 5, action: 'purchaseProgram', params: { program: 'FTPCrack.exe' }, preReq: { jobId: 11 } },
  { id: 13, level: 6, action: 'purchaseProgram', params: { program: 'relaySMTP.exe' }, preReq: { jobId: 12 } },
  { id: 14, level: 7, action: 'purchaseProgram', params: { program: 'HTTPWorm.exe' }, preReq: { jobId: 13 } },
  { id: 15, level: 8, action: 'purchaseProgram', params: { program: 'SQLInject.exe' }, preReq: { jobId: 14 } },
  { id: 16, level: 11, action: 'purchaseProgram', params: { program: 'Formulas.exe' }, preReq: { money: '10b' } },

  // Faction CSEC
  { id: 20, level: 5, action: 'installBackdoor', params: { server: 'CSEC' } },
  { id: 21, level: 6, action: 'joinFaction', params: { faction: 'CyberSec' } },
  // { level: 7, action: 'purchaseAugmentations', params: { faction: 'CyberSec' } },

  // Faction NiteSec
  { id: 30, level: 6, action: 'installBackdoor', params: { server: 'avmnite-02h' } },
  { id: 31, level: 7, action: 'joinFaction', params: { faction: 'NiteSec' } },
  // { level: 8, action: 'purchaseAugmentations', params: { faction: 'NiteSec' } },

  // Faction The Black Hand
  { id: 40, level: 8, action: 'installBackdoor', params: { server: 'I.I.I.I' } },
  { id: 41, level: 9, action: 'joinFaction', params: { faction: 'The Black Hand' } },
  // { level: 8, action: 'purchaseAugmentations', params: { faction: 'The Black Hand' } },

  // Faction Bitrunners
  { id: 50, level: 9, action: 'installBackdoor', params: { server: 'run4theh111z' } },
  { id: 51, level: 10, action: 'joinFaction', params: { faction: 'BitRunners' } },
  // { level: 11, action: 'purchaseAugmentations', params: { faction: 'BitRunners' } },

  // Faction Daedalus
  { id: 60, level: 10, action: 'installBackdoor', params: { server: '.' } },
  { id: 61, level: 11, action: 'joinFaction', params: { faction: 'Daedalus' } },
  // { level: 12, action: 'purchaseAugmentations', params: { faction: 'Daedalus' } },

  // Routine Jobs
  { id: 10000, level: 7, action: 'gymWorkout', params: { skill: 'ALL', level: 10, speed: true } },
  { id: 10001, level: 10, action: 'gymWorkout', params: { skill: 'ALL', level: 50, speed: true } },
  { id: 10002, level: 100, action: 'universityCourse', params: { course: 'leadership', level: 50 } },
];

export default milestones;
