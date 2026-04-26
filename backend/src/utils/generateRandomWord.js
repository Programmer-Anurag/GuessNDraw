const animals = [
  "lion", "tiger", "elephant", "giraffe", "zebra",
  "kangaroo", "panda", "monkey", "dog", "cat",
  "rabbit", "fox", "bear", "wolf", "leopard",
  "cheetah", "deer", "camel", "horse", "cow"
];

const birds = [

  "sparrow", "eagle", "parrot", "peacock", "owl",

  "pigeon", "crow", "flamingo", "duck", "hen",

  "turkey", "penguin", "woodpecker", "kingfisher", "swan"

];

const objects = [

  "chair", "table", "mobile", "laptop", "bottle",

  "fan", "television", "clock", "keyboard", "mouse",

  "car", "bicycle", "bag", "pen", "book",

  "umbrella", "camera", "headphones", "sofa", "mirror"

];

export function getRandomWords(length=3) {
  const allWords = [...animals, ...birds, ...objects];

  const shuffled = allWords.sort(() => 0.5 - Math.random());

  return shuffled.slice(0, length); // 3 options dikha de player ko
}


// getRandomWords(3)
// console.log(getRandomWords(3));
