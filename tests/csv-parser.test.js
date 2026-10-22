const { parseDelimitedText, validateClientUrl, normalizeClientUrl } = require('../src/utils/csvParser');

describe('CSV/TSV Parser & Validator Utility Tests', () => {
  it('should parse CSV with headers correctly', () => {
    const csvInput = `domain,client_url,keyword,label,notes
example.com,https://client.com,SEO Tools,Tech Batch,Main site
testsite.org,client2.org,Backlinks,Finance,Secondary site`;

    const parsed = parseDelimitedText(csvInput);
    expect(parsed.length).toEqual(2);
    expect(parsed[0].domain).toEqual('example.com');
    expect(parsed[0].client_url).toEqual('https://client.com');
    expect(parsed[0].keyword).toEqual('SEO Tools');
    expect(parsed[1].domain).toEqual('testsite.org');
    expect(parsed[1].client_url).toEqual('client2.org');
  });

  it('should parse TSV with headers correctly', () => {
    const tsvInput = `domain\tclient_url\tkeyword\tlabel\tnotes
tsvsite.com\thttps://tsvclient.com\tBest Hosting\tNiche1\tNote TSV`;

    const parsed = parseDelimitedText(tsvInput);
    expect(parsed.length).toEqual(1);
    expect(parsed[0].domain).toEqual('tsvsite.com');
    expect(parsed[0].client_url).toEqual('https://tsvclient.com');
    expect(parsed[0].keyword).toEqual('Best Hosting');
  });

  it('should parse plain single-column domain list without headers', () => {
    const rawList = `site1.com\nsite2.org`;
    const parsed = parseDelimitedText(rawList);
    expect(parsed.length).toEqual(2);
    expect(parsed[0].domain).toEqual('site1.com');
    expect(parsed[1].domain).toEqual('site2.org');
  });

  it('should validate and normalize client URLs', () => {
    expect(validateClientUrl('https://validclient.com')).toBe(true);
    expect(validateClientUrl('validclient.com')).toBe(true);
    expect(validateClientUrl('invalid-url-$$$')).toBe(false);

    expect(normalizeClientUrl('myclient.com')).toEqual('https://myclient.com');
    expect(normalizeClientUrl('http://myclient.com/page/')).toEqual('http://myclient.com/page');
  });
});
