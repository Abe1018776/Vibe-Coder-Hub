export function displayName(p: {
  name: string;
  handle: string;
  show_real_name?: boolean | null;
}): string {
  return p.show_real_name === false ? `@${p.handle}` : p.name;
}
