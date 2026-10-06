/**
 * Loads a provider's script once. Razorpay Checkout and Stripe.js must be
 * loaded from the providers' own servers (that's part of their PCI
 * compliance), so they are never bundled. A global that already exists is
 * used as is, which is also how tests supply stand-ins.
 */
const loading = new Map<string, Promise<void>>();

export function loadScript(src: string): Promise<void> {
  let promise = loading.get(src);
  if (!promise) {
    promise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        loading.delete(src);
        script.remove();
        reject(new Error(`Could not load ${src}`));
      };
      document.head.appendChild(script);
    });
    loading.set(src, promise);
  }
  return promise;
}

/** The global a provider script defines, loading the script first if needed. */
export async function providerGlobal<T>(name: string, src: string): Promise<T> {
  const existing = (window as unknown as Record<string, unknown>)[name];
  if (existing) return existing as T;
  await loadScript(src);
  const loaded = (window as unknown as Record<string, unknown>)[name];
  if (!loaded) throw new Error(`${src} did not define ${name}`);
  return loaded as T;
}
