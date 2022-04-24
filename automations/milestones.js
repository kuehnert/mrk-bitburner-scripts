const milestones = [
  { level: 1, action: 'deleteStaleDataFiles' },
  { level: 2, action: 'runScript', params: { script: 'scanServers.js', args: '--quiet' } },
  { level: 3, action: 'universityCourse', params: { course: 'study computer science', level: 10 } },
  { level: 2, action: 'runScript', params: { script: 'contracts.js' } },

  // PROGRAMS
  { level: 3, action: 'purchaseTor' },
  { level: 4, action: 'purchaseProgram', params: 'BruteSSH.exe' },
  { level: 5, action: 'purchaseProgram', params: 'FTPCrack.exe' },
  { level: 6, action: 'purchaseProgram', params: 'relaySMTP.exe' },
  { level: 7, action: 'purchaseProgram', params: 'HTTPWorm.exe' },
  { level: 8, action: 'purchaseProgram', params: 'SQLInject.exe' },
  { level: 9, action: 'purchaseProgram', params: 'Formulas.exe' },

  // Faction CSEC
  { level: 5, action: 'installBackdoor', params: 'CSEC' },
  { level: 6, action: 'joinFaction', params: 'CSEC' },
  { level: 7, action: 'purchaseAugmentations', params: 'CyberSec' },

  // Faction NiteSec
  { level: 6, action: 'installBackdoor', params: 'avmnite-02h' },
  { level: 7, action: 'joinFaction', params: 'NiteSec' },
  { level: 8, action: 'purchaseAugmentations', params: 'NiteSec' },

  // Faction The Black Hand
  { level: 8, action: 'installBackdoor', params: 'I.I.I.I' },
  { level: 9, action: 'joinFaction', params: 'The Black Hand' },
  { level: 8, action: 'purchaseAugmentations', params: 'The Black Hand' },

  // Faction Bitrunners
  { level: 9, action: 'installBackdoor', params: 'run4theh111z' },
  { level: 10, action: 'joinFaction', params: 'BitRunners' },
  { level: 11, action: 'purchaseAugmentations', params: 'BitRunners' },

  // Faction Daedalus
  { level: 10, action: 'installBackdoor', params: '.' },
  { level: 11, action: 'joinFaction', params: 'Daedalus' },
  { level: 12, action: 'purchaseAugmentations', params: 'Daedalus' },

  // Routine Jobs
  { level: 99, action: 'gymWorkout', params: 'ALL 10 true' },
  { level: 100, action: 'gymWorkout', params: { skill: 'ALL', level: 50, speed: true } },
  { level: 100, action: 'universityCourse', params: { course: 'leadership', level: 50 } },
];

export default milestones;
