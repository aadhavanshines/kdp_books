import { ratingTags } from './rating';

describe('ratingTags', () => {
  it('offers praise for good ratings and complaints for poor ones', () => {
    expect(ratingTags(5)).toContain('Tasty food');
    expect(ratingTags(4)).toEqual(ratingTags(5));
    expect(ratingTags(2)).toContain('Cold food');
    expect(ratingTags(0)).toEqual([]);
  });
});
