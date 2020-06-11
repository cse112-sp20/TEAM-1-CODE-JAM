export let animals = [
  "airbaloon",
       "android",
  "arcade",
  "basket",
  "bean",
  "bee",
  "boat",
  "bones",
  "chat",
  "christian-love",
  "clap",
  "cop-male",
  "cucumber",
  "facebook",
  "family-institution",
  "fear",
  "flag",
  "gift",
  "grave",
  "heart-hand",
  "knight",
  "link",
  "macpro",
  "minion-batman",
  "mirror",
  "mobile",
  "monkey-silent",
  "octopus-angry",
  "parka",
  "pig",
  "planets",
  "pluger",
  "polygon",
  "potion",
  "Predator",
  "puzzle",
  "search",
  "shit-sunglasses",
  "short-hair",
  "spray",
  "student-female",
  "sun",
  "topview",
  "troller",
  "twitter",
  "umbrella-rain",
  "vault",
  "vision-jew",
  "Walle-female",
  "water-bottle",
];

/**
 * given a list of undistributed animal, return a
 * random animal to be use as a user icon
 * @author William Lui && Brian Aguirre
 * @param {Object} animalsLeft The animals left over from distribution
 * @return A random animal for the user icon
 */
export function getAnimal(animalsLeft) {
  if (animalsLeft.length === 0) {
    return "Predator";
  }
  let index = Math.floor(Math.random() * animalsLeft.length); // returns a random integer from 0 to 9
  let animal = animalsLeft[index];
  animalsLeft.splice(index, 1);
  return animal;
}

/**
 * Puts animal back if a user leaves team
 * @author William Lui && Brian Aguirre
 * @param {Object} animalsLeft the array to put the animal back to
 * @param {string} animal the animal to be put back
 */
export function addAnimal(animalsLeft, animal) {
  if (animals.includes(animal) && !animalsLeft.includes(animal)) {
    animalsLeft.push(animal);
  }
}

/**
 * set the animal array to a custom animal list
 * @author William Lui && Brian Aguirre
 * @param {Object} animalList the array of undistributed animal
 */
export function setAnimal(animalList) {
  animals = animalList;
}

const _animals = {
  animals,
};

export default _animals;
