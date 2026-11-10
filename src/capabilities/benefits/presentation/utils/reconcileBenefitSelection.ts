export function reconcileBenefitSelection(
  previousIds: readonly string[],
  nextIds: readonly string[],
  selected: string | null,
): string | null {
  if (nextIds.length === 0) {
    return null;
  }
  if (selected !== null && nextIds.includes(selected)) {
    return selected;
  }
  const previousIndex =
    selected === null ? 0 : Math.max(0, previousIds.indexOf(selected));
  return nextIds[Math.min(previousIndex, nextIds.length - 1)];
}
