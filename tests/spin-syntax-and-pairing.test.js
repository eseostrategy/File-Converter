const { spinText, generateVariationsForDomains } = require('../src/utils/spinSyntax');
const { parseSideBySideInput, matchPastedDomains } = require('../src/utils/backlinkMatcher');

describe('Spin Syntax Engine Unit Tests', () => {
  it('should parse simple spin syntax choices', () => {
    const input = 'This is a {great|awesome|fantastic} test.';
    const spun = spinText(input, { seed: 'test_seed' });
    expect(['This is a great test.', 'This is a awesome test.', 'This is a fantastic test.']).toContain(spun);
  });

  it('should handle nested spin syntax choices', () => {
    const input = '{Hello|{Hi|Greetings}} world!';
    const spun = spinText(input, { seed: 12345 });
    expect(['Hello world!', 'Hi world!', 'Greetings world!']).toContain(spun);
  });

  it('should generate variations per domain deterministically', () => {
    const spinContent = 'Best {SEO|Digital|Marketing} services for {2025|2026}.';
    const domains = ['https://site1.com', 'https://site2.org'];

    const variations = generateVariationsForDomains(spinContent, domains, 'per_domain');
    expect(variations.length).toEqual(2);
    expect(variations[0].domain).toEqual('https://site1.com');
    expect(variations[1].domain).toEqual('https://site2.org');
    expect(variations[0].content).not.toEqual('');
  });

  it('should generate a shared variation across all domains when strategy is shared', () => {
    const spinContent = 'Shared {SEO|Digital} content.';
    const domains = ['https://site1.com', 'https://site2.org'];

    const variations = generateVariationsForDomains(spinContent, domains, 'shared');
    expect(variations[0].content).toEqual(variations[1].content);
  });
});

describe('Side-by-Side URL & Keyword Pairing Unit Tests', () => {
  it('should pair side-by-side lines correctly when count matches domain count', () => {
    const urls = 'https://client1.com/page\nhttps://client2.com/landing';
    const keywords = 'Keyword 1\nKeyword 2';

    const result = parseSideBySideInput(urls, keywords, 2, 'different');
    expect(result.valid).toBe(true);
    expect(result.pairs.length).toEqual(2);
    expect(result.pairs[0].url).toEqual('https://client1.com/page');
    expect(result.pairs[0].keyword).toEqual('Keyword 1');
    expect(result.pairs[1].url).toEqual('https://client2.com/landing');
  });

  it('should report count mismatch errors when line count does not match domain count', () => {
    const urls = 'https://client1.com/page';
    const keywords = 'Keyword 1\nKeyword 2';

    const result = parseSideBySideInput(urls, keywords, 2, 'different');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should handle same mode applying 1 pair to all target domains', () => {
    const url = 'https://single-client.com';
    const keyword = 'Single Keyword';

    const result = parseSideBySideInput(url, keyword, 3, 'same');
    expect(result.valid).toBe(true);
    expect(result.pairs.length).toEqual(3);
    expect(result.pairs[0].url).toEqual('https://single-client.com');
    expect(result.pairs[2].url).toEqual('https://single-client.com');
  });
});

describe('Domain Order Preservation Unit Tests', () => {
  it('should preserve user pasted line order when resolving registered domains', () => {
    const registered = [
      { id: 10, domain: 'https://site-a.com', status: 'connected' },
      { id: 20, domain: 'https://site-b.org', status: 'connected' }
    ];

    const pastedOrder = 'site-b.org\nsite-a.com';
    const result = matchPastedDomains(pastedOrder, registered);

    expect(result.orderedDomains.length).toEqual(2);
    expect(result.orderedDomains[0].domain).toEqual('https://site-b.org');
    expect(result.orderedDomains[1].domain).toEqual('https://site-a.com');
  });
});
