/**
 * Spin Syntax Engine for PBN Commander
 * Supports {option1|option2|option3} syntax with nested support and fallback handling.
 */

/**
 * Parses and spins text containing spin syntax.
 * @param {string} text - Input text with {opt1|opt2}
 * @param {object} options - Options: { seed: number|string } for deterministic generation
 * @returns {string} Spun text
 */
function spinText(text, options = {}) {
  if (!text || typeof text !== 'string') {
    return text || '';
  }

  // Simple pseudo-random generator if seed is provided
  let seed = options.seed;
  let useSeed = seed !== undefined && seed !== null;
  let rng = () => {
    if (!useSeed) return Math.random();
    // Simple Mulberry32 or PRNG algorithm from seed
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  if (typeof seed === 'string') {
    // Convert string seed to number
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    seed = Math.abs(hash);
  }

  // Helper to parse nested spin syntax from inner to outer
  // {a|b|{c|d}}
  let current = text;
  const spinRegex = /\{([^{}]+)\}/g;

  let iterations = 0;
  const maxIterations = 50; // Prevent infinite loops on weird edge cases

  while (spinRegex.test(current) && iterations < maxIterations) {
    iterations++;
    current = current.replace(spinRegex, (match, choices) => {
      const optionsList = choices.split('|');
      if (optionsList.length === 0) return match;
      const index = Math.floor(rng() * optionsList.length);
      return optionsList[index];
    });
  }

  return current;
}

/**
 * Generates spun text variations for an array of target domains.
 * @param {string} spinContent - Content containing spin syntax
 * @param {Array<object|string>} domains - Array of domain objects or domain strings
 * @param {string} strategy - 'per_domain' (unique variation per domain) or 'shared' (one variation for all)
 * @returns {Array<object>} Array of { domain: string, content: string }
 */
function generateVariationsForDomains(spinContent, domains, strategy = 'per_domain') {
  if (!Array.isArray(domains) || domains.length === 0) {
    return [];
  }

  const domainList = domains.map(d => (typeof d === 'string' ? d : d.domain || d.url || ''));

  if (strategy === 'shared') {
    const sharedVariation = spinText(spinContent, { seed: 'shared_seed_123' });
    return domainList.map(dom => ({
      domain: dom,
      content: sharedVariation
    }));
  }

  // 'per_domain' strategy: Generate variation deterministically seeded by domain name + index
  return domainList.map((dom, index) => {
    const seed = `${dom}_${index}_pbn_commander`;
    const variation = spinText(spinContent, { seed });
    return {
      domain: dom,
      content: variation
    };
  });
}

module.exports = {
  spinText,
  generateVariationsForDomains
};
