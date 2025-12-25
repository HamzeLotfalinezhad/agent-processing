import { faker } from '@faker-js/faker';

const EVENT_TYPES = [
  'temperature',
  'pressure',
  'speed',
  'voltage',
  'noise',
  'light',
];

export function generateEvent() {
  const name = faker.helpers.arrayElement(EVENT_TYPES);
  const value = faker.number.int({ min: 0, max: 120 })
  return { name, value };
}

