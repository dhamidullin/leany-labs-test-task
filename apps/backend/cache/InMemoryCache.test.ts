import { InMemoryCache } from './InMemoryCache';

describe('InMemoryCache', () => {
  let cache: InMemoryCache;

  beforeEach(() => {
    jest.useFakeTimers();
    cache = new InMemoryCache();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should set and get values correctly', async () => {
    await cache.set('test-key', 'test-value', 60);
    const value = await cache.get<string>('test-key');
    expect(value).toBe('test-value');
  });

  test('should return null for non-existent keys', async () => {
    const value = await cache.get<string>('non-existent');
    expect(value).toBeNull();
  });

  test('should handle complex objects', async () => {
    const complexObj = {
      id: 1,
      nested: {
        field: 'value',
        array: [1, 2, 3]
      }
    };

    await cache.set('complex', complexObj, 60);
    const value = await cache.get<typeof complexObj>('complex');
    
    expect(value).toEqual(complexObj);
    // Ensure it's a deep copy or reference depending on implementation
    // For in-memory Map, it stores reference, so modification would affect cache
    // unless we clone it. Our implementation stores reference.
    expect(value).toBe(complexObj); 
  });

  test('should expire items after TTL', async () => {
    await cache.set('expire-key', 'value', 1);

    expect(await cache.get('expire-key')).toBe('value');

    jest.advanceTimersByTime(500);
    expect(await cache.get('expire-key')).toBe('value');

    // Advance time past 1 second
    jest.advanceTimersByTime(600);
    expect(await cache.get('expire-key')).toBeNull();
  });

  test('delete should remove specific item only', async () => {
    await cache.set('key1', 'value1', 60);
    await cache.set('key2', 'value2', 60);

    await cache.delete('key1');

    expect(await cache.get('key1')).toBeNull();
    expect(await cache.get('key2')).toBe('value2');
  });

  test('clear should remove all items', async () => {
    await cache.set('key1', 'value1', 60);
    await cache.set('key2', 'value2', 60);

    await cache.clear();

    expect(await cache.get('key1')).toBeNull();
    expect(await cache.get('key2')).toBeNull();
  });

  test('setting existing key should update value and reset TTL', async () => {
    await cache.set('key', 'initial', 1);
    jest.advanceTimersByTime(500);
    
    await cache.set('key', 'updated', 1);
    jest.advanceTimersByTime(600);

    expect(await cache.get('key')).toBe('updated');
    jest.advanceTimersByTime(500);

    expect(await cache.get('key')).toBeNull();
  });
});

