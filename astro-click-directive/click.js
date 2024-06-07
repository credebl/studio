/**
 * Hydrate on first click on the window
 * @type {import('astro').ClientDirective}
 */
export default (load, opts, el) => {
    window.addEventListener('click', async () => {
      const hydrate = await load()
      await hydrate()
    }, { once: true })
    const todo = async () => {
      const hydrate = await load();
      await hydrate();
    };
    if (document.readyState != "loading") todo();
    else window.addEventListener("DOMContentLoaded", todo);
  }