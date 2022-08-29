import { MockReqDependencies } from "./dependencies";

export const stubNameGenerator =
  ({ placeName, animalName }: { placeName?: string; animalName?: string }) =>
  ({ nameGenerator, ...deps }: MockReqDependencies) => {
    if (placeName) {
      nameGenerator.getPlaceName.mockReturnValue(placeName);
    }

    if (animalName) {
      nameGenerator.getAnimalName.mockReturnValue(animalName);
    }

    return { nameGenerator, ...deps };
  };
