/**
 * safety helpers used by the UI to confirm potentially dangerous actions.
 * This is intentionally small — replace with a modal-based UX in the component
 * if you prefer a non-blocking confirmation flow.
 */

export async function confirmExecution(command: string): Promise<boolean> {
  return Promise.resolve(window.confirm(`This will run the following command on your machine:\n\n${command}\n\nProceed?`));
}
