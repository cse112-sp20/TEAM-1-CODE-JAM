export let animalsLeft = [
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

export const animals = Array.from(animalsLeft);

/**
 * Distributes animal for new user
 */
export function getAnimal() {
  if (animalsLeft.length === 0) {
    throw "ERROR";
  }
  let index = Math.floor(Math.random() * animalsLeft.length); // returns a random integer from 0 to 9
  let animal = animalsLeft[index];
  animalsLeft.splice(index, 1);
  return animal;
}
/**
 * Puts animal back if a user leaves team
 * @param {string} animal
 */
export function addAnimal(animal) {
  if (animals.includes(animal)) {
    animalsLeft.push(animal);
  }
}
