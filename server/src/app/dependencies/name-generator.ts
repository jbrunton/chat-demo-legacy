import { NameGenerator } from "@domain/entities/name-generator";
import {
  adjectives,
  animals,
  colors,
  countries,
  uniqueNamesGenerator,
} from "unique-names-generator";

const getPlaceName = () => {
  const randomName = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, countries],
    style: "capital",
    separator: " ",
    length: 3,
  });
  return randomName;
};

const getAnimalName = () => {
  const randomName = uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    style: "capital",
    separator: " ",
    length: 2,
  });
  return `Anon ${randomName}`;
};

export const nameGenerator: NameGenerator = {
  getPlaceName,
  getAnimalName,
};
