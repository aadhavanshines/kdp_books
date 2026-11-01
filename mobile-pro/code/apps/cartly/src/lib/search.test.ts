import { addRecent, highlightParts, suggestionHref } from './search';

describe('search helpers', () => {
  it('keeps recent searches newest first, unique and capped', () => {
    expect(addRecent(['shoes', 'phone'], 'Phone')).toEqual(['Phone', 'shoes']);
    expect(addRecent(['a', 'b', 'c'], 'd', 3)).toEqual(['d', 'a', 'b']);
    expect(addRecent(['a'], '   ')).toEqual(['a']);
  });

  it('splits text around the match', () => {
    expect(highlightParts('Voltix Nova 5G', 'nova')).toEqual([
      { text: 'Voltix ', match: false },
      { text: 'Nova', match: true },
      { text: ' 5G', match: false },
    ]);
    expect(highlightParts('Shoes', 'sh')).toEqual([
      { text: 'Sh', match: true },
      { text: 'oes', match: false },
    ]);
    expect(highlightParts('Shoes', 'xyz')).toEqual([{ text: 'Shoes', match: false }]);
  });

  it('routes each suggestion kind', () => {
    expect(suggestionHref({ text: 'Voltix Nova', kind: 'product', id: 'p-01' })).toBe('/product/p-01');
    expect(suggestionHref({ text: 'Mobiles', kind: 'category', id: 'mobiles' })).toEqual({ pathname: '/products', params: { category: 'mobiles' } });
    expect(suggestionHref({ text: 'Voltix', kind: 'brand', id: null })).toEqual({ pathname: '/products', params: { brand: 'Voltix' } });
    expect(suggestionHref({ text: 'nova', kind: 'query', id: null })).toEqual({ pathname: '/products', params: { q: 'nova' } });
  });
});
