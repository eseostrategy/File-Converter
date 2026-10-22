const { parseBulkBacklinks, matchPastedDomains } = require('../src/utils/backlinkMatcher');

describe('Backlink Matcher & Manual Domain Parser Utility Tests', () => {
  it('should parse valid bulk URL and keyword pipe pairs', () => {
    const rawInput = `https://client1.com/page | Rank Keyword 1
client2.org/landing | Rank Keyword 2
invalid-line-without-pipe`;

    const { validPairs, invalidLines } = parseBulkBacklinks(rawInput);
    expect(validPairs.length).toEqual(2);
    expect(validPairs[0].url).toEqual('https://client1.com/page');
    expect(validPairs[0].keyword).toEqual('Rank Keyword 1');
    expect(validPairs[1].url).toEqual('https://client2.org/landing');

    expect(invalidLines.length).toEqual(1);
    expect(invalidLines[0].rawLine).toEqual('invalid-line-without-pipe');
  });

  it('should match pasted domains against registered connected domains', () => {
    const registered = [
      { id: 1, domain: 'https://site-connected.com', status: 'connected' },
      { id: 2, domain: 'https://site-disconnected.com', status: 'disconnected' }
    ];

    const rawInput = `site-connected.com\nsite-disconnected.com\nunknown-site.org\ninvalid domain $$$`;

    const result = matchPastedDomains(rawInput, registered);

    expect(result.matchedConnected.length).toEqual(1);
    expect(result.matchedConnected[0].domain).toEqual('https://site-connected.com');

    expect(result.matchedDisconnected.length).toEqual(1);
    expect(result.matchedDisconnected[0].domain).toEqual('https://site-disconnected.com');

    expect(result.unknown.length).toEqual(1);
    expect(result.unknown[0]).toEqual('unknown-site.org');
  });
});
