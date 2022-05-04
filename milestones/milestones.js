const milestones = [
  { level: 1, action: 'deleteStaleDataFiles' },
  { level: 2, action: 'runScript', params: { script: 'scanServers.js', args: '--quiet' } },
  { level: 3, action: 'universityCourse', params: { skill: 'hacking', level: 10 } },
  { level: 2, action: 'runScript', params: { script: 'contracts.js' } },

  // PROGRAMS
  { level: 3, action: 'purchaseTor' },
  { level: 4, action: 'purchaseProgram', params: { program: 'BruteSSH.exe' } },
  { level: 5, action: 'purchaseProgram', params: { program: 'FTPCrack.exe' } },
  { level: 6, action: 'purchaseProgram', params: { program: 'relaySMTP.exe' } },
  { level: 7, action: 'purchaseProgram', params: { program: 'HTTPWorm.exe' } },
  { level: 8, action: 'purchaseProgram', params: { program: 'SQLInject.exe' } },
  { level: 9, action: 'purchaseProgram', params: { program: 'Formulas.exe' } },

  // Faction CSEC
  { level: 5, action: 'installBackdoor', params: { server: 'CSEC' } },
  { level: 6, action: 'joinFaction', params: { faction: 'CyberSec' } },
  // { level: 7, action: 'purchaseAugmentations', params: { faction: 'CyberSec' } },

  // Faction NiteSec
  { level: 6, action: 'installBackdoor', params: { server: 'avmnite-02h' } },
  { level: 7, action: 'joinFaction', params: { faction: 'NiteSec' } },
  // { level: 8, action: 'purchaseAugmentations', params: { faction: 'NiteSec' } },

  // Faction The Black Hand
  { level: 8, action: 'installBackdoor', params: { server: 'I.I.I.I' } },
  { level: 9, action: 'joinFaction', params: { faction: 'The Black Hand' } },
  // { level: 8, action: 'purchaseAugmentations', params: { faction: 'The Black Hand' } },

  // Faction Bitrunners
  { level: 9, action: 'installBackdoor', params: { faction: 'run4theh111z' } },
  { level: 10, action: 'joinFaction', params: { faction: 'BitRunners' } },
  // { level: 11, action: 'purchaseAugmentations', params: { faction: 'BitRunners' } },

  // Faction Daedalus
  { level: 10, action: 'installBackdoor', params: { faction: '.' } },
  { level: 11, action: 'joinFaction', params: { faction: 'Daedalus' } },
  // { level: 12, action: 'purchaseAugmentations', params: { faction: 'Daedalus' } },

  // Routine Jobs
  { level: 99, action: 'gymWorkout', params: { skill: 'ALL', level: 10, speed: true } },
  { level: 100, action: 'gymWorkout', params: { skill: 'ALL', level: 50, speed: true } },
  { level: 100, action: 'universityCourse', params: { course: 'leadership', level: 50 } },
];

export default milestones;
