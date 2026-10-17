import { firstNames, lastNames, areaCodes } from './dbConst';

// Fisher-Yates shuffle
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateDrivers(count = 500) {
  // Every possible name and phone combination
  const nameCombos = firstNames.flatMap((f) =>
    lastNames.map((l) => `${f} ${l}`)
  );
  const phonePool = areaCodes.flatMap((ac) =>
    Array.from(
      { length: 100 },
      (_, i) => `(${ac}) 555-01${String(i).padStart(2, '0')}`
    )
  );

  if (count > nameCombos.length || count > phonePool.length) {
    throw new Error(
      `Can't generate ${count} unique drivers. Max is ${Math.min(
        nameCombos.length,
        phonePool.length
      )}.`
    );
  }

  // Shuffle then take the first N: uniqueness is guaranteed, no retry loops
  const names = shuffle(nameCombos).slice(0, count);
  const phones = shuffle(phonePool).slice(0, count);

  return names.map((name, i) => ({
    id: i + 1,
    name,
    phone: phones[i],
  }));
}
