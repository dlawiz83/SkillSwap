/**
 * Calculates a match score between the current user and a potential match.
 * * Logic:
 * 1. Direct Match (50pts): They teach what you want to learn.
 * 2. Reverse Match (30pts): You teach what they want to learn.
 * 3. Karma Bonus (up to 20pts): Higher karma = more reliable.
 */
export function calculateMatchScore(me, them) {
  if (!me || !them) return 0;

  let score = 0;

  // 1. Do they teach what I want?
  const wantedSkills = me.skillsLearning || [];
  const offeredSkills = them.skillsTeaching || [];
  const hasWantedSkill = wantedSkills.some((skill) =>
    offeredSkills.map((s) => s.toLowerCase()).includes(skill.toLowerCase()),
  );
  if (hasWantedSkill) score += 50;

  // 2. Do I teach what they want?
  const mySkills = me.skillsTeaching || [];
  const theirWants = them.skillsLearning || [];
  const canTeachThem = mySkills.some((skill) =>
    theirWants.map((s) => s.toLowerCase()).includes(skill.toLowerCase()),
  );
  if (canTeachThem) score += 30;

  // 3. Karma Bonus (Cap at 20)
  const karmaBonus = Math.min(them.karma || 0, 20);
  score += karmaBonus;

  return score;
}
