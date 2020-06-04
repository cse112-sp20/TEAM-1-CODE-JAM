import { animals, getAnimal, addAnimal } from "../public/animalGenerator.js";

describe("testing getAnimal() from animalGenerator.js", () => {
  test("get animals", () => {
    let animalsLeft = Array.from(animals);
    let randAnimal = getAnimal(animalsLeft);
    let numAnimals = animalsLeft.length;
    expect(numAnimals).toBe(animals.length - 1);
    expect(!animalsLeft.includes(randAnimal)).toBe(true);

    let predator = getAnimal([]);
    expect(predator).toBe("Predator");
  });
});

describe("testing addAnimal() from animalGenerator.js", () => {
  test("add animals", () => {
    let animalsLeft = Array.from(animals);
    addAnimal(animalsLeft, "random");
    expect(animalsLeft.length).toBe(animals.length);

    let randAnimal = getAnimal(animalsLeft);
    addAnimal(animalsLeft, randAnimal);
    expect(animalsLeft.includes(randAnimal)).toBe(true);
    addAnimal(animalsLeft, randAnimal);

    let newArray = animalsLeft.filter((animal) => {
      return randAnimal == animal;
    });

    expect(newArray.length).toBe(1);
  });
});
